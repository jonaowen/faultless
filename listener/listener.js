/* ============================================================
   LISTENER — the app's own microphone: the audio path, the capture of one answer (when the learner starts and stops
   speaking), the recording of every answer as a WAV. The recogniser that judges (Vosk, in the page) is fed from here.
   (Until 16 Nov 2026 this file also held a small Whisper model run with onnxruntime-web. It never judged an answer and the
   owner had it removed: "It's not adding anything since it's never used.")
   Microphone audio is captured only between the mic opening and the end of the answer.
   ============================================================ */
(function(){
  const SR = 16000;
  // ---------- microphone ----------
  // The audio system is set up once (it needs a tap from the learner); the microphone itself is switched on
  // only for each answer and off again straight after, so it is never on while the teacher talks or during leads.
  let ctx=null, node=null, rawNode=null, stream=null, srcNode=null, armed=false, chunks=[], rawChunks=[], onChunk=null;
  async function openMic(){                 // call from a tap: sets up audio and asks for microphone permission once
    if(!ctx){
      ctx = new AudioContext({sampleRate:SR});
      const code = `class Tap extends AudioWorkletProcessor{ process(i){ const c=i[0]&&i[0][0]; if(c) this.port.postMessage(c.slice(0)); return true; } } registerProcessor("tap", Tap);`;
      await ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([code],{type:"application/javascript"})));
      node = new AudioWorkletNode(ctx, "tap"); node.port.onmessage = e => { if(armed){ chunks.push(e.data); onChunk&&onChunk(e.data); } };
      rawNode = new AudioWorkletNode(ctx, "tap"); rawNode.port.onmessage = e => { if(armed) rawChunks.push(e.data); };      // the microphone as it is, before the low cut (see swamp)
    }
    if(ctx.state==="suspended") await ctx.resume();
    await micOn(); micOff();                 // permission now, not in the middle of the first answer
  }
  async function micOn(){
    if(stream) return;
    // no echo cancellation: on Android it puts the phone into "call" audio mode while the microphone is on, which delays the
    // teacher's voice behind her lips (Jon 9 Nov 10:27). Nothing is captured while she speaks, so there is no echo to cancel.
    stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false, noiseSuppression:false, autoGainControl:true, channelCount:1}});
    if(ctx.state==="suspended") await ctx.resume();
    srcNode = ctx.createMediaStreamSource(stream);
    /* Low rumble is cut before anything listens (run of 10 Nov 2026, 21:33: every answer refused or unheard; in the seven
       recordings 99-100 % of the energy was below 300 Hz, thumps at full scale about once a second, the voice underneath.
       Speech needs nothing below about 150 Hz; with that band removed the same recordings went from 1 of 7 heard right to
       4 of 7). Two second-order high-pass stages at 160 Hz. */
    const hp1 = ctx.createBiquadFilter(), hp2 = ctx.createBiquadFilter();
    for(const f of [hp1, hp2]){ f.type = "highpass"; f.frequency.value = 160; f.Q.value = 0.707; }
    srcNode.connect(hp1); hp1.connect(hp2); hp2.connect(node);      // not connected to the speakers
    if(rawNode) srcNode.connect(rawNode);
  }
  function micOff(){
    if(srcNode){ try{ srcNode.disconnect(); }catch(e){} srcNode=null; }
    if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
  }
  /* Is the microphone swamped? (run of 10 Nov 2026, 21:33: the phone lay on the owner's chest; thumps at full scale about
     once a second, the voice underneath; every answer refused or unheard.) Measured on the last turn's sound BEFORE the low
     cut: its loudest sample, and the share of its energy below 150 Hz (one FFT over the turn). The seven recordings of that
     run: peak 1.00, share 0.977 to 0.993. The 487 recorded answers of the other runs: share at most 0.851 (144 of them reach
     a peak of 0.98). Swamped: peak at least 0.98 and share at least 0.93. */
  function swamp(){
    const a=join(rawChunks); if(a.length<SR*0.3) return {swamped:false, peak:0, low:0};
    let peak=0; for(let i=0;i<a.length;i++){ const v=Math.abs(a[i]); if(v>peak) peak=v; }
    if(peak<0.98) return {swamped:false, peak:+peak.toFixed(3), low:null};
    let n=1; while(n<a.length) n<<=1; const re=new Float64Array(n), im=new Float64Array(n); re.set(a);
    for(let i=1,j=0;i<n;i++){ let bit=n>>1; for(;j&bit;bit>>=1) j^=bit; j^=bit; if(i<j){ const t=re[i]; re[i]=re[j]; re[j]=t; } }
    for(let len=2;len<=n;len<<=1){ const ang=-2*Math.PI/len, wr=Math.cos(ang), wi=Math.sin(ang);
      for(let i=0;i<n;i+=len){ let cr=1, ci=0; for(let k=0;k<len/2;k++){ const ur=re[i+k], ui=im[i+k], vr=re[i+k+len/2]*cr-im[i+k+len/2]*ci, vi=re[i+k+len/2]*ci+im[i+k+len/2]*cr;
        re[i+k]=ur+vr; im[i+k]=ui+vi; re[i+k+len/2]=ur-vr; im[i+k+len/2]=ui-vi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } }
    let lowE=0, tot=0; const cut=Math.floor(150*n/SR); for(let k=0;k<=n/2;k++){ const e=re[k]*re[k]+im[k]*im[k]; tot+=e; if(k<cut) lowE+=e; }
    const low=tot>0 ? lowE/tot : 0; return {swamped: low>=0.93, peak:+peak.toFixed(3), low:+low.toFixed(3)};
  }
  function join(cs){ let n=0; for(const c of cs) n+=c.length; const a=new Float32Array(n); let o=0; for(const c of cs){ a.set(c,o); o+=c.length; } return a; }

  /* Capture one answer. Resolves when the learner has finished speaking:
     opts.noSpeechMs: give up after this long with no speech (silence);
     opts.endSilenceMs: speech then this much quiet = the answer has ended;
     opts.maxMs: hard limit (the model hears at most 6 s).
     opts.onSpeechEnd(audio, {speechStart, lastVoice, voicedMsAfter(ms), level(ms0,ms1), peak(ms0,ms1)}) may return true to keep listening (e.g. the answer so far is incomplete), or "reset" when
     nothing was recognised in that sound (it was not an answer: e.g. the end of the teacher's own voice from the
     speaker, tester H's run 9 Nov 16:42): listening goes on as if no one had spoken, until noSpeechMs from the start;
     opts.onStart(stop, sound): stop() ends the capture at once (the recogniser already has the whole answer); sound has
     voicedMsAfter, level and peak, measured on the capture's own clock (ms from its start), and state() (the clock now,
     when speech started or -1, when sound was last heard).
     Loudness is measured above 300 Hz (Jon's 9 Nov 15:07 run: a low rumble near the phone, 80% of it below 150 Hz, was
     taken for a voice that never stopped, so the answer only ended after 3-6 s), and speech starts only after 100 ms of
     sound in 160 ms (a click as the microphone opens is not the start of an answer). Replayed on that run's 123 answers:
     ends more than 1.2 s after the last word went from 14 to 3, with none cut short. */
  function capture(opts={}){
    const noSpeech=opts.noSpeechMs||7000, endSil=opts.endSilenceMs||800, maxMs=opts.longMs || Math.min(opts.maxMs||6000, 6000);      // longMs (.24): a count said at the touches may take longer than an answer
    return new Promise(resolve=>{
      chunks=[]; rawChunks=[]; armed=true;
      const fr=320;                   // 20 ms frames
      let buf=new Float32Array(0), t=0, floor=null, speechStart=-1, lastVoice=-1, checking=false, done=false;
      const energies=[], voicedRun=[], voicedLog=[];      // voicedLog: was each 20 ms frame voiced (for voicedMsAfter)
      // how much sound there was after a moment (ms from the start of the capture): the recogniser's word times are on the
      // same clock, so the app can tell that the learner went on speaking after the last word the recogniser has
      const voicedMsAfter = ms => { let n=0; for(let i=Math.max(0, Math.ceil(ms/20)); i<voicedLog.length; i++) if(voicedLog[i]) n++; return n*20; };
      // loudness (above 300 Hz) between two moments: the mean level, and the loudest 20 ms
      const level = (ms0, ms1) => { let e=0, n=0; for(let i=Math.max(0, Math.floor(ms0/20)); i<Math.min(energies.length, Math.ceil(ms1/20)); i++){ e+=energies[i]*energies[i]; n++; } return n ? Math.sqrt(e/n) : 0; };
      const peak = (ms0, ms1) => { let m=0; for(let i=Math.max(0, Math.floor(ms0/20)); i<Math.min(energies.length, Math.ceil(ms1/20)); i++) if(energies[i]>m) m=energies[i]; return m; };
      // high-pass at 300 Hz (2nd-order Butterworth) for the loudness measure only; the audio kept and heard is untouched
      const w=2*Math.PI*300/SR, cw=Math.cos(w), al=Math.sin(w)/Math.SQRT2, b0=(1+cw)/2/(1+al), b1=-(1+cw)/(1+al), a1=-2*cw/(1+al), a2=(1-al)/(1+al);
      let x1=0, x2=0, y1=0, y2=0;
      const finish = (status)=>{ if(done) return; done=true; armed=false; onChunk=null; micOff();
        const audio=join(chunks); const s=Math.max(0, (speechStart<0?0:speechStart)-300)*16; resolve({status, audio: audio.subarray(s), all:audio, speechStartMs:speechStart, floor}); };
      onChunk = c => {
        if(opts.onAudio) try{ opts.onAudio(c); }catch(e){}       // streaming recognisers (Vosk) get the audio as it comes
        const nb=new Float32Array(buf.length+c.length); nb.set(buf); nb.set(c,buf.length); buf=nb;
        while(buf.length>=fr){
          const f=buf.subarray(0,fr); buf=buf.slice(fr); t+=20;
          let e=0; for(let i=0;i<fr;i++){ const y=b0*f[i]+b1*x1+b0*x2-a1*y1-a2*y2; x2=x1; x1=f[i]; y2=y1; y1=y; e+=y*y; } e=Math.sqrt(e/fr); energies.push(e);
          // background level: low percentile of the recent past, never below a small absolute value
          // the learner may start speaking at once (listening starts the instant the cue ends), so the floor starts at a
          // fixed quiet level and may only rise slowly: speech at the very start is not taken for the background
          if(floor===null) floor=0.003;
          if(energies.length%5===0){ const r=energies.slice(-100).slice().sort((a,b)=>a-b); const q=Math.max(0.0015, r[Math.floor(r.length*0.15)]); floor = q<floor ? q : Math.min(q, floor*1.03); }
          const voiced = e > Math.max(floor*3.2, 0.006);
          voicedRun.push(voiced); if(voicedRun.length>8) voicedRun.shift(); voicedLog.push(voiced);
          // sound in the first ignoreMs (the end of the teacher's own voice from the speaker) cannot start an answer on its
          // own: an answer that began that early is still going after it, and is taken from there (the audio is all kept)
          if(voiced && (speechStart>=0 || (voicedRun.filter(Boolean).length>=5 && t>(opts.ignoreMs||0)))){ if(speechStart<0) speechStart=t-80; lastVoice=t; }
          if(speechStart<0 && t>noSpeech) return finish("silence");
          if(speechStart>=0 && t-speechStart>maxMs) return finish("heard");
          if(speechStart>=0 && t-lastVoice>endSil && !checking){
            if(opts.onSpeechEnd){
              checking=true; const at=lastVoice;
              Promise.resolve(opts.onSpeechEnd(join(chunks), {speechStart, lastVoice, voicedMsAfter, level, peak})).then(keep=>{ checking=false;
                if(keep==="reset"){ if(lastVoice===at){ speechStart=-1; lastVoice=-1; voicedRun.length=0; } return; }
                if(!keep && lastVoice===at) finish("heard");
                else if(keep){ const wait=opts.extraSilenceMs||2200; setTimeout(()=>{ if(!done && lastVoice===at) finish("heard"); }, wait); } });
            } else return finish("heard");
          }
        }
      };
      opts.signal && opts.signal.addEventListener("abort", ()=>finish("aborted"));
      opts.onStart && opts.onStart(()=>finish("heard"), {voicedMsAfter, level, peak, state:()=>({t, speechStart, lastVoice})});
    });
  }
  function wav(audio){        // 16-bit WAV for the log
    const n=audio.length, b=new ArrayBuffer(44+n*2), v=new DataView(b); const w=(o,s)=>{ for(let i=0;i<s.length;i++) v.setUint8(o+i,s.charCodeAt(i)); };
    w(0,"RIFF"); v.setUint32(4,36+n*2,true); w(8,"WAVE"); w(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
    v.setUint32(24,SR,true); v.setUint32(28,SR*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); w(36,"data"); v.setUint32(40,n*2,true);
    for(let i=0;i<n;i++) v.setInt16(44+i*2, Math.max(-1,Math.min(1,audio[i]))*32767, true);
    return new Uint8Array(b);
  }
  window.LISTENER = {openMic, micOn, micOff, capture, swamp, wav, get audioReady(){ return !!(ctx && node); }};
})();
