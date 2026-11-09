/* ============================================================
   LISTENER — the app's own speech recogniser, running on the phone (no server).
   A small Whisper model fine-tuned for this app's answers (6-second window), run with onnxruntime-web.
   It does not take dictation. For each task it scores how well the learner's speech fits each possible
   answer (the right one, the other name, the name alone, ...) and also makes a free transcript for the log.
   Microphone audio is captured only between the mic opening and the end of the answer.
   ============================================================ */
(function(){
  const BASE = (document.currentScript && document.currentScript.src || location.href).replace(/[^/]*$/, "");
  const MODEL = BASE + "model/";
  const SR = 16000;
  const MODEL_VERSION = "tiny-r2-200";       // change whenever the model files change, so phones fetch the new ones
  let J=null, enc=null, dec=null, ready=null, melTabs=null;

  // ---------- model files: downloaded once, then kept in the browser's cache ----------
  async function fetchCached(url, onBytes){
    let cache=null; try{ cache = await caches.open("faultless-listener-"+MODEL_VERSION);
      for(const k of await caches.keys()) if(k.startsWith("faultless-listener-") && k!=="faultless-listener-"+MODEL_VERSION) caches.delete(k); }catch(e){}
    if(cache){ const hit = await cache.match(url); if(hit){ const b=await hit.arrayBuffer(); onBytes&&onBytes(b.byteLength,b.byteLength); return b; } }
    const r = await fetch(url); if(!r.ok) throw new Error("download failed: "+url+" "+r.status);
    const total = +r.headers.get("content-length") || 0; const reader=r.body.getReader(); const parts=[]; let got=0;
    for(;;){ const {done,value}=await reader.read(); if(done) break; parts.push(value); got+=value.length; onBytes&&onBytes(got,total); }
    const buf = new Uint8Array(got); let o=0; for(const p of parts){ buf.set(p,o); o+=p.length; }
    if(cache){ try{ await cache.put(url, new Response(buf.slice().buffer, {headers:{"content-type":"application/octet-stream"}})); }catch(e){} }
    return buf.buffer;
  }
  function load(onProgress){
    if(ready) return ready;
    ready = (async()=>{
      const t0=performance.now();
      ort.env.wasm.wasmPaths = BASE + "ort/";
      ort.env.wasm.numThreads = (self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency||1) : 1);
      const files = {json:MODEL+"listener.json", enc:MODEL+"encoder.onnx", dec:MODEL+"decoder.onnx"};
      const prog={}, tot={};
      const p = k => (got,total)=>{ prog[k]=got; tot[k]=total; const g=Object.values(prog).reduce((a,b)=>a+b,0), t=Object.values(tot).reduce((a,b)=>a+b,0); onProgress&&onProgress(g, t); };
      const [jb, eb, db] = await Promise.all([fetchCached(files.json,p("j")), fetchCached(files.enc,p("e")), fetchCached(files.dec,p("d"))]);
      J = JSON.parse(new TextDecoder().decode(jb));
      const opt = {executionProviders:["wasm"], graphOptimizationLevel:"all"};
      enc = await ort.InferenceSession.create(new Uint8Array(eb), opt);
      dec = await ort.InferenceSession.create(new Uint8Array(db), opt);
      buildMel(); buildBytes();
      await recognise(new Float32Array(SR));           // warm-up
      return {ms: Math.round(performance.now()-t0)};
    })();
    ready.catch(()=>{ ready=null; });
    return ready;
  }

  // ---------- log-mel spectrogram, as Whisper computes it ----------
  function buildMel(){
    const N=J.n_fft, B=N/2+1, cos=new Float32Array(B*N), sin=new Float32Array(B*N), win=new Float32Array(N);
    for(let n=0;n<N;n++) win[n]=0.5-0.5*Math.cos(2*Math.PI*n/N);               // periodic Hann
    for(let k=0;k<B;k++) for(let n=0;n<N;n++){ const a=2*Math.PI*k*n/N; cos[k*N+n]=Math.cos(a); sin[k*N+n]=Math.sin(a); }
    const mel=new Float32Array(80*B); for(let m=0;m<80;m++) for(let k=0;k<B;k++) mel[m*B+k]=J.mel[m][k];
    melTabs={N,B,cos,sin,win,mel};
  }
  function logMel(audio){
    const {N,B,cos,sin,win,mel}=melTabs, H=J.hop, F=J.frames, L=F*H;
    const x=new Float32Array(L); x.set(audio.subarray(0, Math.min(L, audio.length)));
    const pad=N/2, xp=new Float32Array(L+N);                                    // centre with reflect padding
    xp.set(x, pad); for(let i=1;i<=pad;i++){ xp[pad-i]=x[i]; xp[pad+L-1+i]=x[L-1-i]; }
    const out=new Float32Array(80*F), frame=new Float32Array(N), pw=new Float32Array(B);
    const lastAudio = Math.min(L, audio.length);
    let zeroLog=null;
    for(let f=0;f<F;f++){
      const s=f*H;
      if(s-pad > lastAudio + N){                                                // all-zero frame
        if(zeroLog===null) zeroLog=Math.log10(1e-10);
        for(let m=0;m<80;m++) out[m*F+f]=zeroLog; continue;
      }
      for(let n=0;n<N;n++) frame[n]=xp[s+n]*win[n];
      for(let k=0;k<B;k++){ let re=0, im=0; const o=k*N; for(let n=0;n<N;n++){ re+=frame[n]*cos[o+n]; im-=frame[n]*sin[o+n]; } pw[k]=re*re+im*im; }
      for(let m=0;m<80;m++){ let v=0; const o=m*B; for(let k=0;k<B;k++) v+=mel[o+k]*pw[k]; out[m*F+f]=Math.log10(Math.max(v,1e-10)); }
    }
    let mx=-Infinity; for(let i=0;i<out.length;i++) if(out[i]>mx) mx=out[i];
    for(let i=0;i<out.length;i++) out[i]=(Math.max(out[i], mx-8)+4)/4;
    return out;
  }

  // ---------- the model ----------
  const softmaxLog = (a, off, V) => { let mx=-Infinity; for(let i=0;i<V;i++) if(a[off+i]>mx) mx=a[off+i]; let s=0; for(let i=0;i<V;i++) s+=Math.exp(a[off+i]-mx); return mx+Math.log(s); };
  function prefix(){ const s=J.special; return [s["<|startoftranscript|>"], s["<|fr|>"], s["<|transcribe|>"], s["<|notimestamps|>"]]; }
  async function decode(hidden, seqs){
    const B=seqs.length, L=Math.max(...seqs.map(s=>s.length));
    const ids=new BigInt64Array(B*L); for(let b=0;b<B;b++) for(let i=0;i<L;i++) ids[b*L+i]=BigInt(i<seqs[b].length? seqs[b][i] : J.eot);
    const [, T, D] = hidden.dims; let hd=hidden;
    if(B>1){ const d=new Float32Array(B*T*D); for(let b=0;b<B;b++) d.set(hidden.data, b*T*D); hd=new ort.Tensor("float32", d, [B,T,D]); }
    const r = await dec.run({input_ids:new ort.Tensor("int64", ids, [B,L]), hidden:hd});
    return {logits:r.logits.data, L, V:r.logits.dims[2]};
  }
  // average log-probability of each phrase (with the end of speech after it)
  async function scorePhrases(hidden, phrases){
    const pre=prefix(), seqs=phrases.map(p=>{ const t=J.phrases[p]; if(!t) throw new Error("phrase not prepared: "+p); return pre.concat(t,[J.eot]); });
    const {logits,L,V}=await decode(hidden, seqs.map(s=>s.slice(0,-1)));
    const out={};
    seqs.forEach((s,b)=>{ let sum=0, n=0; for(let i=pre.length-1;i<s.length-1;i++){ const off=(b*(L)+i)*V; sum+=logits[off+s[i+1]]-softmaxLog(logits,off,V); n++; } out[phrases[b]]=sum/n; });
    return out;
  }
  async function freeTranscript(hidden, maxTok=12){
    const ids=prefix(), lps=[];
    for(let k=0;k<maxTok;k++){
      const {logits,L,V}=await decode(hidden,[ids]); const off=(L-1)*V; const z=softmaxLog(logits,off,V);
      let best=0, bv=-Infinity; for(let t=0;t<=J.eot;t++) if(logits[off+t]>bv){ bv=logits[off+t]; best=t; }
      lps.push(bv-z); ids.push(best); if(best===J.eot) break;
    }
    const toks=ids.slice(4).filter(t=>t<J.eot);
    return {text: detok(toks), lp: lps.reduce((a,b)=>a+b,0)/lps.length};
  }
  let byteDec=null;
  function buildBytes(){ const bs=[]; for(let i=33;i<=126;i++) bs.push(i); for(let i=161;i<=172;i++) bs.push(i); for(let i=174;i<=255;i++) bs.push(i);
    const cs=bs.slice(); let n=0; for(let b=0;b<256;b++) if(!bs.includes(b)){ bs.push(b); cs.push(256+n); n++; }
    byteDec={}; bs.forEach((b,i)=>byteDec[String.fromCharCode(cs[i])]=b); }
  function detok(toks){ const s=toks.map(t=>J.vocab[t]||"").join(""); const bytes=[]; for(const ch of s){ if(ch in byteDec) bytes.push(byteDec[ch]); }
    return new TextDecoder().decode(new Uint8Array(bytes)).trim(); }

  // recognise one answer: audio (Float32, 16 kHz) -> {scores, transcript, ...}
  async function recognise(audio, phrases=[], withTranscript=true){
    const t0=performance.now();
    const feats=new ort.Tensor("float32", logMel(audio), [1,80,J.frames]);
    const t1=performance.now();
    const hidden=(await enc.run({input_features:feats})).hidden;
    const t2=performance.now();
    const scores = phrases.length ? await scorePhrases(hidden, phrases) : {};
    const t3=performance.now();
    const tr = withTranscript ? await freeTranscript(hidden) : {text:"", lp:0};
    const t4=performance.now();
    return {scores, transcript:tr.text, freeLp:tr.lp, ms:{mel:Math.round(t1-t0), enc:Math.round(t2-t1), score:Math.round(t3-t2), free:Math.round(t4-t3)}};
  }

  // ---------- microphone ----------
  // The audio system is set up once (it needs a tap from the learner); the microphone itself is switched on
  // only for each answer and off again straight after, so it is never on while the teacher talks or during leads.
  let ctx=null, node=null, stream=null, srcNode=null, armed=false, chunks=[], onChunk=null;
  async function openMic(){                 // call from a tap: sets up audio and asks for microphone permission once
    if(!ctx){
      ctx = new AudioContext({sampleRate:SR});
      const code = `class Tap extends AudioWorkletProcessor{ process(i){ const c=i[0]&&i[0][0]; if(c) this.port.postMessage(c.slice(0)); return true; } } registerProcessor("tap", Tap);`;
      await ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([code],{type:"application/javascript"})));
      node = new AudioWorkletNode(ctx, "tap"); node.port.onmessage = e => { if(armed){ chunks.push(e.data); onChunk&&onChunk(e.data); } };
    }
    if(ctx.state==="suspended") await ctx.resume();
    await micOn(); micOff();                 // permission now, not in the middle of the first answer
  }
  async function micOn(){
    if(stream) return;
    stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true, autoGainControl:true, channelCount:1}});
    if(ctx.state==="suspended") await ctx.resume();
    srcNode = ctx.createMediaStreamSource(stream); srcNode.connect(node);      // not connected to the speakers
  }
  function micOff(){
    if(srcNode){ try{ srcNode.disconnect(); }catch(e){} srcNode=null; }
    if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
  }
  function join(cs){ let n=0; for(const c of cs) n+=c.length; const a=new Float32Array(n); let o=0; for(const c of cs){ a.set(c,o); o+=c.length; } return a; }

  /* Capture one answer. Resolves when the learner has finished speaking:
     opts.noSpeechMs: give up after this long with no speech (silence);
     opts.endSilenceMs: speech then this much quiet = the answer has ended;
     opts.maxMs: hard limit (the model hears at most 6 s).
     opts.onSpeechEnd(audio) may return true to keep listening (e.g. the answer so far is incomplete). */
  function capture(opts={}){
    const noSpeech=opts.noSpeechMs||7000, endSil=opts.endSilenceMs||800, maxMs=Math.min(opts.maxMs||6000, J? J.frames*10 : 6000);
    return new Promise(resolve=>{
      chunks=[]; armed=true;
      const fr=320;                   // 20 ms frames
      let buf=new Float32Array(0), t=0, floor=null, speechStart=-1, lastVoice=-1, checking=false, done=false;
      const energies=[];
      const finish = (status)=>{ if(done) return; done=true; armed=false; onChunk=null; micOff();
        const audio=join(chunks); const s=Math.max(0, (speechStart<0?0:speechStart)-300)*16; resolve({status, audio: audio.subarray(s), all:audio, speechStartMs:speechStart, floor}); };
      onChunk = c => {
        if(opts.onAudio) try{ opts.onAudio(c); }catch(e){}       // streaming recognisers (Vosk) get the audio as it comes
        const nb=new Float32Array(buf.length+c.length); nb.set(buf); nb.set(c,buf.length); buf=nb;
        while(buf.length>=fr){
          const f=buf.subarray(0,fr); buf=buf.slice(fr); t+=20;
          let e=0; for(let i=0;i<fr;i++) e+=f[i]*f[i]; e=Math.sqrt(e/fr); energies.push(e);
          // background level: low percentile of the recent past, never below a small absolute value
          if(energies.length%5===0){ const r=energies.slice(-100).slice().sort((a,b)=>a-b); floor=Math.max(0.0015, r[Math.floor(r.length*0.15)]); }
          if(floor===null) floor=Math.max(0.0015,e);
          const voiced = e > Math.max(floor*3.2, 0.006);
          if(voiced){ if(speechStart<0) speechStart=t; lastVoice=t; }
          if(speechStart<0 && t>noSpeech) return finish("silence");
          if(speechStart>=0 && t-speechStart>maxMs) return finish("heard");
          if(speechStart>=0 && t-lastVoice>endSil && !checking){
            if(opts.onSpeechEnd){
              checking=true; const at=lastVoice;
              Promise.resolve(opts.onSpeechEnd(join(chunks))).then(keep=>{ checking=false;
                if(!keep && lastVoice===at) finish("heard");
                else if(keep){ const wait=opts.extraSilenceMs||2200; setTimeout(()=>{ if(!done && lastVoice===at) finish("heard"); }, wait); } });
            } else return finish("heard");
          }
        }
      };
      opts.signal && opts.signal.addEventListener("abort", ()=>finish("aborted"));
    });
  }
  function wav(audio){        // 16-bit WAV for the log
    const n=audio.length, b=new ArrayBuffer(44+n*2), v=new DataView(b); const w=(o,s)=>{ for(let i=0;i<s.length;i++) v.setUint8(o+i,s.charCodeAt(i)); };
    w(0,"RIFF"); v.setUint32(4,36+n*2,true); w(8,"WAVE"); w(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
    v.setUint32(24,SR,true); v.setUint32(28,SR*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); w(36,"data"); v.setUint32(40,n*2,true);
    for(let i=0;i<n;i++) v.setInt16(44+i*2, Math.max(-1,Math.min(1,audio[i]))*32767, true);
    return new Uint8Array(b);
  }
  window.LISTENER = {version:MODEL_VERSION, load, openMic, micOn, micOff, capture, recognise, logMel, wav, get json(){ return J; }, get ready(){ return !!enc; }, get audioReady(){ return !!(ctx && node); }};
})();
