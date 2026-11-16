/* next/shell.js: the shell round the lessons (home and path, lesson complete, words, who is learning, the avatar maker, you and the
   settings, the microphone's primer and help, the two moments, welcome back, milestones, offline and updates) and the game layer's rules
   (dev/design/GAMIFICATION.md in the private bundle). It never runs inside a task: it reads the log the lesson wrote and decides which
   lesson is next. Loaded after the page's own script; uses its globals (S, LESSONS, USERS, logEntry, picture, PICS, UI, COURSE_WORDS).
   Storage: frDIn.g.<user> (the record), frDIn.a.<user> (the avatar's short string). Nothing here touches the learner's saved state
   except, when a lesson is to be done again, the same fields the page itself resets when its last lesson is replayed. */
"use strict";
const SHELL = (()=>{
  /* ---- the rules, in one place. (owner) ruled by the owner; (work) a working value until he rules ---- */
  const RULES = {
    PASS_MARK: 90,                    // (owner) whole per cent, first-time correct over scored first askings; the screen and the gate use the same whole number
    REPEATS_BEFORE_STEP_BACK: 1,      // (owner) below the mark: the lesson once more; still below on that one repeat: back
    STEP_BACK_LESSONS: 1,             // (owner)
    UNSURE_COUNTS: false,             // (work) an ERROR the app itself doubts (unsure) is left out of the percentage
    SPACING_GAP_HOURS: 6,             // (work) the second lesson of a day starts at least this long after the first ended
    POINTS_PERFECT_FIRST: 1,          // (owner, 15 Nov late: "It should just be 1 point for a perfect exercise whether that is by the first time or by repair") an exercise perfect the first time it is done
    POINTS_PERFECT_REPAIR: 1,         // (owner) an exercise that had an error, done again perfectly (once: it is then perfect)
    POINTS_PERFECT_LESSON: 5,         // (owner, 15 Nov late) a lesson that becomes perfect, first time through OR by repairs, once per lesson; (superseded: "first time only") (it still counts for the badges)
    // (owner) nothing else earns points: not finishing a lesson, not the second lesson of the day, not coming back
    BADGES: [5,10,20,50,100,200,500,1000,2000],      // (owner) perfect lessons; never a badge for lessons merely finished
    BEAD_SOUND: "A",                  // (owner, 15 Nov: "Sound A is the best since it's higher pitched. Higher pitch suggests 'correct' more") (owner: a trial) the soft sound on a right answer: A, B or C (dev/design/review/sound_*.wav); a setting turns it off
    REST_DAYS_MAX: 2, REST_DAY_EARNED_EVERY: 5,      // (work)
    RETURN_AFTER_DAYS: 2,             // (work) whole days with no lesson before the welcome back and its bonus
    AWAY_STEPS: [[3,0],[7,3],[14,5],[30,8],[1e9,12]],      // (owner R-151: the step back scales with the absence; these numbers are the working table) [days away up to, lessons back]
    AWAY_MIN_DONE: 3,                 // (work) fewer lessons passed than this: a step back starts at Lesson 1
    AWAY_ON: !/[?&]away=off/.test(location.search),
    DAY_STARTS_HOUR: 4,               // (work) a lesson at half past midnight belongs to the evening before
    LATE_HOUR: 23,                    // (work) a second lesson that could only start after this hour is "tomorrow"
    PACE_DEFAULT: [5.5, 12],          // (work) seconds a task, seconds an exercise, until the learner's own pace is known
    GATE_ON: !/[?&]gate=off/.test(location.search),
    DAY_GOAL_LESSONS: 1,              // (owner, brief 14) the inner ring: ONE lesson is today's goal; a second fills it again in gold
    GOAL_SHARE: 0.65,                 // (owner, brief 14) goals at about 60-70 % of what the learner can do: the week's goal from his two moments, then from his record
    GOAL_SHARE_MAX: 0.70,             // (owner) never above 70 % of what the moments allow (14 a week for two a day: at most 10)
    GOAL_EASY_BY: 2, GOAL_RISE: 1,    // (work) a week's goal met with 2 or more to spare rises by 1 next week; missed, it falls to where it will be met
    RANKS: [8,28,65,135,225,380,610,870,1240,1740,2280,2920,3800,4700,5500,6300,7400,8700,10400,12700,15400,18800,23100,27200,31500,35500,39500,44000,49000,53000,57500,61500,65500,68000],      // (work: simulation, dev/design/RANKS.md) points for ranks 1..34
    RANK_TOKENS: [1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,4,4,4,6,6,6,8,8,8,10,10,10,20,20,20,25,25,25,60],      // (work: simulation) tokens each rank gives: more at the higher ranks (the owner: "way more tokens")
    LEARNER_FIGURE_ON: !/[?&]learner=off/.test(location.search),      // the course's "you" drawn from the learner's own figure (PICS.setLearner; the close-ups keep the default learner, by the picture library's own guard); ?learner=off for the default everywhere      // the tester's door: ?gate=off runs the lessons straight through (for scripted runs with errors)
  };
  const uid = USERS.current, GK="frDIn.g."+uid, AK=id=>"frDIn.a."+id;
  const blank = ()=>({v:1, points:0, lessons:{}, furthest:0, next:null, why:"", below:{}, days:{}, daysLearned:0, run:{len:0, last:""}, bestRun:0, rest:RULES.REST_DAYS_MAX, restEarnedAt:0,
    anchors:{first:{after:"breakfast", time:"08:00"}, second:{after:"supper", time:"19:00"}, set:false}, goal:2, bonusSaid:0, cur:null, lastSeen:"",
    lpts:{}, pace:[], ex:{}, lp:{}, badges:{}, levels:{}, wordsAt:{}, warmTo:null, awaySeen:"", replay:null, weeks:{}, rank:null, tokens:0, tokEarned:0, ward:{owned:{}, worn:{}}, ringsShown:null});
  let G = blank(), fresh = true; try{ const raw=localStorage.getItem(GK); if(raw){ Object.assign(G, JSON.parse(raw)); fresh=false; } }catch(e){}
  G.anchors=Object.assign(blank().anchors, G.anchors||{}); for(const k of ["first","second"]) G.anchors[k]=Object.assign({}, blank().anchors[k], G.anchors[k]);
  for(const k of ["lpts","ex","lp","badges","levels","wordsAt"]) if(!G[k]) G[k]={}; if(!Array.isArray(G.pace)) G.pace=[];
  const store = ()=>{ try{ localStorage.setItem(GK, JSON.stringify(G)); }catch(e){} };
  const el = (html)=>{ const t=document.createElement("template"); t.innerHTML=html.trim(); return t.content.firstChild; };
  const esc = t=>String(t).replace(/[<&"]/g,c=>({"<":"&lt;","&":"&amp;",'"':"&quot;"}[c]));
  const ic = n=>`<svg class="icon" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const $ = id=>document.getElementById(id);
  const tick = ()=>{ try{ UI.haptic("tick"); }catch(e){} };
  const allDone = i=>LESSONS[i].exercises.every(e=>S.finished[e.id]);
  const last = LESSONS.length-1;
  const dayOf = (d=new Date())=>{ const x=new Date(d.getTime()-RULES.DAY_STARTS_HOUR*3600e3); return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0"); };
  const daysBetween = (a,b)=>Math.round((new Date(b+"T12:00")-new Date(a+"T12:00"))/864e5);
  const lessMotion = ()=>UI.pref.motion==="less" || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const hm = t=>t.toLocaleTimeString([], {hour:"numeric", minute:"2-digit"});
  const atToday = (hhmm, base=new Date())=>{ const [h,m]=String(hhmm||"08:00").split(":").map(Number); const d=new Date(base); if(d.getHours()<RULES.DAY_STARTS_HOUR) d.setDate(d.getDate()-1); d.setHours(h||0, m||0, 0, 0); return d; };
  document.body.appendChild(el(`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="i-sun" viewBox="0 0 28 28"><circle cx="14" cy="14" r="5" fill="currentColor" stroke="none"/><path d="M14 3.5v3M14 21.5v3M3.5 14h3M21.5 14h3M6.6 6.6l2.1 2.1M19.3 19.3l2.1 2.1M6.6 21.4l2.1-2.1M19.3 8.7l2.1-2.1"/></symbol>
<symbol id="i-moon" viewBox="0 0 28 28"><path d="M22.5 16.6A9.2 9.2 0 0 1 11.4 5.5a9.2 9.2 0 1 0 11.1 11.1z" fill="currentColor" stroke="none"/></symbol>
<symbol id="i-star" viewBox="0 0 28 28"><path d="M14 3.8l3.1 6.5 7.1.9-5.2 4.9 1.3 7-6.3-3.5-6.3 3.5 1.3-7-5.2-4.9 7.1-.9z" fill="currentColor" stroke="currentColor" stroke-width="1.6"/></symbol>
<symbol id="i-redo" viewBox="0 0 28 28"><path d="M6 14a8 8 0 1 0 2.6-5.9M6 5.5v5h5"/></symbol>
<symbol id="i-chev" viewBox="0 0 28 28"><path d="M11 7l7 7-7 7"/></symbol>
<symbol id="i-today" viewBox="0 0 28 28"><path d="M4 21.5h20M7.5 21.5a6.5 6.5 0 0 1 13 0M14 8.5v3M5.5 13l2 1.6M22.5 13l-2 1.6"/></symbol>
<symbol id="i-you" viewBox="0 0 28 28"><circle cx="14" cy="9.5" r="4.5"/><path d="M5 24c0-5.2 4-8 9-8s9 2.8 9 8"/></symbol>
<symbol id="i-words" viewBox="0 0 28 28"><rect x="9" y="4.5" width="14" height="17" rx="2.5"/><path d="M6.5 8.5v13a3 3 0 0 0 3 3H18"/></symbol>
<symbol id="i-plus" viewBox="0 0 28 28"><path d="M14 6v16M6 14h16"/></symbol>
<symbol id="i-undo" viewBox="0 0 28 28"><path d="M9 6L4.5 10.5 9 15M5 10.5h11a6.5 6.5 0 0 1 0 13h-5"/></symbol>
<symbol id="i-shuffle" viewBox="0 0 28 28"><path d="M4 8h3.5c6 0 7 12 13 12H24M4 20h3.5c2.2 0 3.7-1.6 5-3.6M24 8h-3.5c-2.2 0-3.7 1.6-5 3.6M21 5l3 3-3 3M21 17l3 3-3 3"/></symbol>
<symbol id="i-mic" viewBox="0 0 28 28"><rect x="10" y="3.5" width="8" height="14" rx="4" fill="currentColor" stroke="none"/><path d="M6.5 13.5a7.5 7.5 0 0 0 15 0M14 21v3.5M10 24.5h8"/></symbol>
<symbol id="i-micoff" viewBox="0 0 28 28"><path d="M18 11V7.5a4 4 0 0 0-8 0v6a4 4 0 0 0 6.2 3.3M6.5 13.5a7.5 7.5 0 0 0 12.2 5.9M21.5 13.5c0 .8-.1 1.5-.3 2.2M14 21v3.5M10 24.5h8M4.5 4.5l19 19"/></symbol>
<symbol id="i-lock" viewBox="0 0 28 28"><rect x="6" y="12.5" width="16" height="11.5" rx="2.5"/><path d="M9.5 12.5V9a4.5 4.5 0 0 1 9 0v3.5"/></symbol>
<symbol id="i-phone" viewBox="0 0 28 28"><rect x="8" y="3" width="12" height="22" rx="2.5"/><path d="M12.5 21.5h3"/></symbol>
<symbol id="i-speaker" viewBox="0 0 28 28"><path d="M5 11h4l6-5v16l-6-5H5z" fill="currentColor" stroke="none"/><path d="M19 10a5.5 5.5 0 0 1 0 8M22 7a10 10 0 0 1 0 14"/></symbol>
<symbol id="i-vibe" viewBox="0 0 28 28"><rect x="9" y="5" width="10" height="18" rx="2"/><path d="M5 10v8M23 10v8M2.5 12v4M25.5 12v4"/></symbol>
<symbol id="i-eye" viewBox="0 0 28 28"><path d="M2.5 14S7 6.5 14 6.5 25.5 14 25.5 14 21 21.5 14 21.5 2.5 14 2.5 14z"/><circle cx="14" cy="14" r="3.5"/></symbol>
<symbol id="i-text" viewBox="0 0 28 28"><path d="M4 22l5.5-15h1L16 22M6 17h8M18 22l3.5-9h1L26 22M19.3 19h5"/></symbol>
<symbol id="i-file" viewBox="0 0 28 28"><path d="M7 3.5h9.5L21 8v16.5H7z"/><path d="M14 11v8M10.5 15.5L14 19l3.5-3.5"/></symbol>
<symbol id="i-info" viewBox="0 0 28 28"><circle cx="14" cy="14" r="10.5"/><path d="M14 12.5v7M14 8.6v.4"/></symbol>
<symbol id="i-play" viewBox="0 0 28 28"><path d="M9 5.5l14 8.5-14 8.5z" fill="currentColor" stroke="none"/></symbol>
<symbol id="i-tool" viewBox="0 0 28 28"><path d="M17.5 4.5a6 6 0 0 0-5.7 7.9L4.5 19.7a2.6 2.6 0 0 0 3.7 3.7l7.3-7.3a6 6 0 0 0 7.9-5.7l-3.6 3.6-3.7-1-1-3.7z"/></symbol>
<symbol id="i-check" viewBox="0 0 28 28"><path d="M6 14.5l5 5L22 8.5"/></symbol>
<symbol id="i-rosette" viewBox="0 0 56 70"><path d="M19 38 L11 66 L20.5 60.5 L26 69 L31 42z" fill="#2F5FB3" stroke="none"/><path d="M37 38 L45 66 L35.5 60.5 L30 69 L25 42z" fill="#C4412F" stroke="none"/><g fill="#D8432F" stroke="none">${Array.from({length:14},(_,i)=>`<circle cx="${(28+19.5*Math.cos(i*Math.PI/7)).toFixed(2)}" cy="${(26+19.5*Math.sin(i*Math.PI/7)).toFixed(2)}" r="5.6"/>`).join("")}<circle cx="28" cy="26" r="20"/></g><circle cx="28" cy="26" r="15.2" fill="#FFFDF8" stroke="none"/><circle cx="28" cy="26" r="9.6" fill="#2F5FB3" stroke="none"/></symbol>
</defs></svg>`));

  /* ---- the learner's figure. The course's "you" is drawn from it once the picture library offers PICS.setLearner(spec) ---- */
  const AV = { has: ()=>!!(window.PICS && PICS.avatar && PICS.avatarParse && PICS.avatarString),
    get(id=uid){ let s=""; try{ s=localStorage.getItem(AK(id))||""; }catch(e){} return s; },
    set(str){ try{ localStorage.setItem(AK(uid), str); }catch(e){} try{ if(RULES.LEARNER_FIGURE_ON && PICS.setLearner) PICS.setLearner(PICS.avatarParse(str)); }catch(e){} },
    svg(specOrStr, view, cls){ try{ if(this.has() && specOrStr){ const g=PICS.avatar(typeof specOrStr==="string" ? PICS.avatarParse(specOrStr) : specOrStr, typeof view==="string" ? {view} : view);
        return `<svg class="${cls||"av"}" viewBox="0 0 160 190" aria-hidden="true">${g.outerHTML}</svg>`; } }catch(e){}
      return `<svg class="${cls||"av"}" viewBox="0 0 160 190" aria-hidden="true"><circle cx="80" cy="80" r="29" fill="#c9d1da"/><path d="M20 190 v-22 q0-34 38-40 h44 q38 6 38 40 v22z" fill="#aeb9c5"/></svg>`; } };
  try{ if(RULES.LEARNER_FIGURE_ON && AV.has() && AV.get() && PICS.setLearner) PICS.setLearner(PICS.avatarParse(AV.get())); }catch(e){}

  /* ---- the course's words and stages (next/words.js, made from the plan) ---- */
  const CW = window.COURSE_WORDS || {lessons:{}, stages:[]};
  const cardsOf = id=>((CW.lessons[id]||{}).cards)||[];
  const passedIdx = i=>i<G.furthest;      // a lesson below the furthest reached has been passed
  const ownedCards = ()=>{ const out=[]; LESSONS.forEach((L,i)=>{ if(passedIdx(i)) cardsOf(L.id).forEach(c=>out.push(Object.assign({lesson:i}, c))); }); return out; };
  const stageOf = n=>(CW.stages||[]).find(s=>n>=s.first && n<=s.last) || null;      // n: a lesson number (1-based)
  function stageLine(n){ const s=stageOf(n); if(!s) return ""; const done=Math.max(0, Math.min(s.last, G.furthest)-s.first+1), of=s.last-s.first+1; return {s, done, of, text:`Stage ${s.id} · ${done} of ${of}`}; }
  function stageBar(n){ const st=stageLine(n); if(!st) return ""; return `<div class="card stage"><div class="row"><span>Stage ${st.s.id}</span><span>${st.done} of ${st.of} lessons</span></div><div class="segs" aria-hidden="true">${Array.from({length:st.of},(_,k)=>`<i class="${k<st.done?"on":""}"></i>`).join("")}</div></div>`; }
  // a picture from a scene spec of the course; Marie herself (the course's "claire") is drawn as the picture library's portrait of her
  const pic = spec=>spec==="claire" && window.PICS && PICS.portrait ? PICS.portrait("marie", "Marie") : picture(spec);
  function cardPic(c){ try{ if(c.spec!=null){ const g=pic(c.spec); return `<svg viewBox="0 0 160 190" aria-hidden="true">${g.outerHTML}</svg>`; } }catch(e){}
    return `<svg viewBox="0 0 160 190" aria-hidden="true"><text x="80" y="108" text-anchor="middle" font-family="Atkinson Hyperlegible Next" font-weight="700" font-size="${c.fr.length>8?24:30}" fill="#1B2433">${esc(c.fr)}</text></svg>`; }
  let clipNow=null;
  function playClip(key, btn){ if(!key) return; try{ if(clipNow){ clipNow.pause(); } const a=new Audio("audio/teacher/"+key+".mp3"); clipNow=a; if(btn){ btn.classList.add("playing"); a.onended=a.onerror=a.onpause=()=>btn.classList.remove("playing"); } a.play().catch(()=>{ if(btn) btn.classList.remove("playing"); }); }catch(e){} }
  const wcard = (c, extra="")=>`<button class="wcard${extra}" data-clip="${esc(c.clip||"")}" aria-label="${esc(c.fr)}: play">${cardPic(c)}<span class="sp">${ic("speaker")}</span></button>`;
  const wireCards = root=>root.querySelectorAll(".wcard").forEach(b=>{ b.onclick=()=>{ tick(); playClip(b.dataset.clip, b); }; });

  /* ---- which lesson is next (R-152, R-153, R-151). G.next: the lesson to do next (index); G.why: "" | "once" | "back" | "warm" ---- */
  function natural(){ return allDone(S.lesson) ? Math.min(S.lesson+1, last) : S.lesson; }
  function syncNext(){ if(G.next==null || G.next>last || (!allDone(S.lesson) && !(G.why==="warm" && G.next<S.lesson))) G.next=natural();
    G.furthest=Math.max(G.furthest||0, ...Object.keys(G.lessons).filter(k=>(G.lessons[k]||[]).some(r=>r.passed)).map(k=>LESSONS.findIndex(l=>l.id===k)+1).filter(n=>n>0 && n<=last+1));
    G.furthest=Math.max(G.furthest, Math.min(G.next, last)); }
  let pendingAgain=null;      // a done lesson the learner asked to do again (index)
  let pendingEx=null;         // an exercise of a done lesson the learner asked to do again {li, ei}
  // the place as the shell last saw it: if the page's own place has been changed since by something else (the tester's jump, a scripted run),
  // that place stands and the rules start again from it
  let seen=""; const mark=()=>S.lesson+":"+allDone(S.lesson)+":"+S.ex, look=()=>{ seen=mark(); };
  // before the page's own start handler: the microphone's primer if it is needed; then the place where the rules say, only when that differs
  // from what the page would do by itself
  document.addEventListener("click", e=>{ const b=e.target && e.target.closest && e.target.closest("#playBtn"); if(!b || running || b.classList.contains("loading")) return;
    if(MIC.primerNeeded()){ e.stopPropagation(); e.preventDefault(); MIC.primer(); return; }
    beadCtx(); try{ const hm=$("home"); if(hm && !hm.closest("[hidden]")) MV.openCard(hm.querySelector(".hero")); }catch(e){}
    if(pendingEx){ const {li, ei}=pendingEx; pendingEx=null; startReplay(li, ei); exT0=""; G.cur={lesson:LESSONS[li].id, t0:new Date().toISOString(), kind:"exercise", p0:G.points, fromStart:false}; RUN.ex=[]; store(); look(); return; }
    if(mark()!==seen){ G.next=natural(); G.why=""; pendingAgain=null; look(); }
    const T = pendingAgain!=null ? pendingAgain : G.next; const kind = pendingAgain!=null ? "again" : (G.why||"");
    if(T!=null && T!==natural()){
      // (owner's report, 16 Nov) a PASSED lesson done again by the learner's own choice must not move the learner's place: the place is kept
      // (G.again, as G.replay keeps it for one exercise) and put back when the lesson ends or is left half-way
      if(kind==="again" && T<G.furthest && !G.again){ const snap={}; for(const k of PLACE_KEYS) if(k in S) snap[k]=JSON.parse(JSON.stringify(S[k])); G.again={li:T, snap, t0:new Date().toISOString()}; S.delayed=[]; store(); }
      S.lesson=T; S.ex=0; LESSONS[T].exercises.forEach(x=>{ delete S.finished[x.id]; });
      logEntry({result:"LESSON AGAIN: Lesson "+(T+1)+(kind==="again" ? " (the learner's own choice)" : kind==="back" ? " (a step back before Lesson "+(T+2)+")" : kind==="warm" ? " (a warm-up after days away)" : " (once more: below "+RULES.PASS_MARK+" %)"), heard:[]}); save(); }
    const Li=T!=null?T:natural(); G.cur={lesson:LESSONS[Li].id, t0:new Date().toISOString(), kind, p0:G.points, fromStart: S.ex===0 && !LESSONS[Li].exercises.some(x=>S.finished[x.id])}; pendingAgain=null; store(); }, true);

  /* ---- the percentage, from the log (GAMIFICATION.md section 4) ---- */
  function score(lessonId, t0){ const es=(S.log||[]).filter(e=>e.lesson===lessonId && e.t>=t0); let X=0, F=0, E=0;
    for(const e of es){ const lead=/^lead/.test(e.phase||"");
      if(e.result==="correct" && !lead) X++;
      if(e.first===true && !e.delayed && !lead){ if(e.result==="correct") F++; else if(e.result==="ERROR" && (RULES.UNSURE_COUNTS || !e.unsure)) E++; } }
    const n=F+E; return {x:X, first:F, errors:E, y: n<10 ? 100 : Math.floor(100*F/n), scored:n}; }

  /* ---- an exercise, at its end (the page's own end of an exercise): perfect or not, counted as the 90 % rule counts (scored answers only;
     a listener fault or an answer the app itself doubts is not an error; a delayed test belongs to the exercise that caused it). Points only
     for flawless work (the owner's rule): 2 for an exercise perfect the first time, 1 for one repaired later, 0 otherwise. ---- */
  let exT0="";      // when the exercise now running started (the start button, or the end of the exercise before)
  function exResult(exId, t0){ const es=(S.log||[]).filter(e=>e.ex===exId && e.t>=t0 && !e.delayed && !/^lead/.test(e.phase||""));
    const errs=es.filter(e=>e.result==="ERROR" && (RULES.UNSURE_COUNTS || !e.unsure)).length; return {perfect: errs===0 && es.length>0, errs, n:es.length}; }
  const lessonPerfect = L=>L.exercises.every(x=>G.ex[x.id] && G.ex[x.id].g);
  const RUN={ex:[]};      // what this run of a lesson (or this replay) has earned, exercise by exercise
  { const ed0=UI.exerciseDone; UI.exerciseDone=function(){ const r=ed0.apply(this, arguments);
      try{ const L=LESSONS[S.lesson], X=L.exercises[S.ex], t0=[exT0, G.cur&&G.cur.t0||""].sort().pop(), res=exResult(X.id, t0), rec=G.ex[X.id]; let p=0;
        if(!rec){ p = res.perfect ? RULES.POINTS_PERFECT_FIRST : 0; G.ex[X.id]={g:res.perfect, f:res.perfect?"p":"e", n:1, d:dayOf()}; }
        else { rec.n++; if(!rec.g && res.perfect){ p=RULES.POINTS_PERFECT_REPAIR; rec.g=true; rec.r=dayOf(); } }
        if(!G.replay){ const dd=G.days[dayOf()]||(G.days[dayOf()]={n:0, firstEnd:"", full:false}); if(dd.xl!==L.id) dd.xp=0; dd.xl=L.id; dd.xp=(dd.xp||0)+1; }      // the inner ring fills as today's lesson goes on
        G.points+=p; G.lpts[L.id]=(G.lpts[L.id]||0)+p; RUN.ex.push({id:X.id, i:S.ex, perfect:res.perfect, p}); exT0=new Date().toISOString(); store();
        if(res.perfect) barCheer(p);
        try{ trace("exercise "+X.id+": "+(res.perfect?"perfect":res.errs+" error(s)")+"; points +"+p); }catch(e){} }catch(e){}
      return r; }; }
  // a perfect exercise, at its end: the bar shines and the points it earned rise from it, over the first moment of the next exercise (adds no time)
  function barCheer(p){ const bar=$("bar"); if(!bar || lessMotion()) return; bar.classList.remove("perfect"); void bar.offsetWidth; bar.classList.add("perfect");
    if(p>0){ const c=el(`<div class="cheer" aria-hidden="true">${ic("star")}<b>+${p}</b></div>`); bar.appendChild(c); setTimeout(()=>c.remove(), 1500); } }

  /* ---- the learner's own pace: seconds a task, from lessons done start to end in one sitting ---- */
  const tasksOf = L=>L.exercises.reduce((a,e)=>a+e.parts.reduce((b,p)=>b+p.items.filter(it=>it.type==="task").length,0),0);
  function minutesFor(L){ const t=tasksOf(L), p=G.pace.slice(-5).sort((a,b)=>a-b), med=p.length ? p[Math.floor(p.length/2)] : null;
    const s = med ? t*med : t*RULES.PACE_DEFAULT[0]+L.exercises.length*RULES.PACE_DEFAULT[1]; return Math.max(3, Math.round(s/60)); }

  /* ---- badges: for PERFECT lessons only (the owner): a lesson counts once all its exercises are perfect, however it got there ---- */
  const completions = ()=>Object.values(G.lessons).reduce((a,b)=>a+b.length,0);
  const perfectCount = ()=>Object.keys(G.lp).length;
  function newBadge(today){ let got=null; for(const n of RULES.BADGES) if(perfectCount()>=n && !G.badges[n]){ G.badges[n]=today; got=n; } return got; }
  const badgeName = n=>`${n.toLocaleString("en-GB")} perfect lessons`;
  function badgeSvg(n, cls="badge"){ return `<svg class="${cls}" viewBox="0 0 56 70" aria-hidden="true"><use href="#i-rosette"/><text x="28" y="${n>=1000?30.5:31.5}" text-anchor="middle" font-family="Fraunces" font-weight="600" font-size="${n>=1000?8.5:n>=100?11:14}" fill="#fff" style="font-variation-settings:'SOFT' 100">${n>=1000?(n/1000)+"k":n}</text></svg>`; }

  /* ---- the goal of the whole course: the CEFR levels A1 to C2, in speaking and listening (COURSE_WORDS.levels, from the plan: the lesson at
     which each is reached and what the learner can then do; the sentences live in the data, not here). The bar of the level now: lessons
     passed since the last level over the lessons between the two; inside it, brighter, the share of those lessons that are perfect (it never
     holds a level back). ---- */
  const LEVELS = (CW.levels||[]).map(x=>({id:x.id, lesson:x.lesson, canDo:[].concat(x.canDo||[])}));
  const perfectIn = (a,b)=>LESSONS.filter((L,i)=>i>=a && i<b && G.lp[L.id]).length;      // lesson indexes a..b-1; a lesson made all green by repairs counts (the gold share grows with repairs)
  function levelNow(){ if(!LEVELS.length) return null; let from=0; const passed=G.furthest;
    for(let k=0;k<LEVELS.length;k++){ const Lv=LEVELS[k], span=Lv.lesson-from;
      if(passed<Lv.lesson){ const done=Math.max(0, passed-from); return {k, Lv, from, span, done, pct:Math.max(0, Math.min(100, Math.floor(100*done/span))), perf:Math.floor(100*perfectIn(from, passed)/span)}; }
      from=Lv.lesson; }
    return {k:LEVELS.length, Lv:null, pct:100}; }
  function newLevel(today){ let got=null; for(const Lv of LEVELS) if(G.furthest>=Lv.lesson && !G.levels[Lv.id]){ G.levels[Lv.id]=today; got=Lv; } return got; }
  function levelCard(full){ const n=levelNow(); if(!n) return "";
    return `<div class="card cefr"><div class="row"><b>Your French</b><small>in speaking and listening</small></div>
      <div class="lv">${LEVELS.map((Lv,k)=>`<div class="lvc${k<n.k?" done":k===n.k?" now":""}"><span>${k<n.k?ic("check"):""}${Lv.id}</span><i style="--p:${k<n.k?100:k===n.k?Math.max(n.pct,2):0}%;--q:${k<n.k?100:k===n.k?n.perf:0}%"></i></div>`).join("")}</div>
      ${n.Lv ? `<div class="lvnow"><b class="num">${n.pct}%</b><span>of the way to <b>${n.Lv.id}</b><small>${n.done} of ${n.span} lessons${n.perf?` · ${perfectIn(n.from, G.furthest)} of them perfect`:""}</small></span></div>
        ${full ? `<div class="lvwill"><small>At ${n.Lv.id}</small>${n.Lv.canDo.slice(0,full?3:1).map(t=>`<p>${esc(t)}</p>`).join("")}</div>` : ""}<p class="lvnote">Levels as planned</p>` : `<div class="lvnow"><b class="num">C2</b><span>reached</span></div>`}</div>`; }
  function levelParty(Lv, then){ const o=$("lvl"); o.innerHTML=`<div class="lvbig" aria-hidden="true"><span>${Lv.id}</span></div><h1>You have reached ${Lv.id}</h1><div class="sub center">in speaking and listening</div>
      <div class="card trip">${Lv.canDo.map(t=>`<div>${ic("check")}<p>${esc(t)}</p></div>`).join("")}</div><div class="spacer"></div><button class="btn" id="lvGo">Continue</button>`;
    o.hidden=false; o.scrollTop=0; fete(o, true); $("lvGo").onclick=()=>{ tick(); o.hidden=true; stopFete(); if(then) then(); }; }

  /* ---- the three rings on home (the owner, brief 13-14): INNER today (the goal is ONE lesson; a second fills it again in gold), MIDDLE this
     week (a goal the learner is very likely to meet: about two thirds of what his moments allow, then from his own record; met easily, it may
     rise by one; missed, it quietly falls; a miss is never shown), OUTER the next CEFR level (lessons passed since the last level; the
     perfected share in gold). A closed ring is celebrated at the end of the lesson that closed it; an empty ring at the start of its period
     is the normal start. ---- */
  const weekOf = (d=new Date())=>{ const x=new Date(d.getTime()-RULES.DAY_STARTS_HOUR*3600e3); x.setDate(x.getDate()-((x.getDay()+6)%7)); x.setHours(12,0,0,0);
    return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0"); };
  const addDays = (key, n)=>{ const x=new Date(key+"T12:00"); x.setDate(x.getDate()+n); return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0"); };
  const weekCount = wk=>{ let n=0; for(let k=0;k<7;k++){ const r=G.days[addDays(wk,k)]; if(r) n+=r.n||0; } return n; };
  function weekGoal(now=new Date()){ const wk=weekOf(now); if(!G.weeks) G.weeks={}; if(G.weeks[wk]) return G.weeks[wk];
    const perDay = G.goal===1 ? 1 : 2, F=RULES.GOAL_SHARE, cap=Math.max(1, Math.round(RULES.GOAL_SHARE_MAX*perDay*7)), today=dayOf(now), left=7-daysBetween(wk, today);
    const prevK=Object.keys(G.weeks).filter(k=>k<wk).sort().pop(), prev=prevK && G.weeks[prevK];
    let goal, why;
    if(!prev || daysBetween(prevK, wk)>7){ goal=Math.max(1, Math.round(F*perDay*left)); if(prev) goal=Math.min(goal, Math.round(prev.goal*7/(prev.days||7))); why = prev ? "after a break: a fresh start" : "the first week: two thirds of what the moments allow"; }
    else { const n=weekCount(prevK), g7=Math.round(prev.goal*7/(prev.days||7));
      if(n>=prev.goal+RULES.GOAL_EASY_BY){ goal=g7+RULES.GOAL_RISE; why="last week's goal met easily: up by one"; }
      else if(n>=prev.goal){ goal=g7; why="last week's goal met: the same"; }
      else { goal=Math.max(1, Math.min(g7-1, Math.round(F*n*7/(prev.days||7)))); why="last week's goal not met: set where it will be"; } }
    goal=Math.max(1, Math.min(cap, goal));
    G.weeks[wk]={goal, days:left}; const ks=Object.keys(G.weeks).sort(); while(ks.length>12) delete G.weeks[ks.shift()];
    try{ trace("this week's goal: "+goal+" lesson"+(goal===1?"":"s")+" ("+why+")"); }catch(e){}
    store(); return G.weeks[wk]; }
  function ringsNow(now=new Date()){ const today=dayOf(now), d=G.days[today]||{n:0}, wk=weekOf(now), W=weekGoal(now), wn=weekCount(wk), lv=levelNow();
    const inLesson = d.n<2 && d.xp && d.xl && LESSONS.find(L=>L.id===d.xl), part = inLesson ? Math.min(0.94, d.xp/inLesson.exercises.length) : 0;
    return { day:{f: d.n>=1 ? 1 : part, gold: d.n>=2 ? 1 : d.n===1 ? part : 0, n:d.n, closed:d.n>=RULES.DAY_GOAL_LESSONS},
      week:{f: Math.min(1, wn/W.goal), n:wn, goal:W.goal, closed:wn>=W.goal},
      lvl: lv && lv.Lv ? {f:lv.pct/100, gold:Math.min(lv.pct, lv.perf)/100, id:lv.Lv.id, pct:lv.pct, done:lv.done, span:lv.span, perf:perfectIn(lv.from, G.furthest)} : {f:1, gold:1, id:"C2", pct:100, top:true} }; }
  // the rings themselves: three arcs on faint tracks of their own colour; gold over the inner ring for a second lesson, gold over the outer for
  // the perfected share. `from` gives the values to draw first (the rings then fill to `R`: a draw-on, 900 ms; none with less movement)
  function ringsSvg(R, cls="rings"){ const C=[["lvl",57,R.lvl],["week",42,R.week],["day",27,R.day]], sw=12.5;
    const arc=(r, f, k, extra="")=>f<=0 ? "" : `<circle class="arc ${k}" cx="70" cy="70" r="${r}" pathLength="100" stroke-dasharray="${(f*100).toFixed(2)} 100" ${extra}/>`;
    return `<svg class="${cls}" viewBox="0 0 140 140" aria-hidden="true"><g transform="rotate(-90 70 70)" fill="none" stroke-width="${sw}" stroke-linecap="round">
      ${C.map(([k,r,v])=>`<circle class="trk ${k}" cx="70" cy="70" r="${r}"/>${arc(r, v.f, k)}${arc(r, v.gold||0, "gold "+k)}`).join("")}</g>
      ${R.day.closed && R.week.closed ? `<g class="mid" transform="translate(70 70)"><circle r="9" class="midc"/><path d="M-4.2 .3l2.8 2.8 5.6-6" class="midt"/></g>` : ""}</svg>`; }
  function ringRows(R, compact){ const tick2=ic("check");
    const day = R.day.n>=2 ? `<b>Goal met${tick2}</b><small class="gold">${ic("star")} Two lessons</small>` : R.day.n>=1 ? `<b>Goal met${tick2}</b>` : `<b>One lesson</b>${compact ? `<small>${R.day.f>0?"under way":"today's goal"}</small>` : ""}`;
    const week = R.week.closed ? `<b>${R.week.n} lesson${R.week.n===1?"":"s"}${tick2}</b><small>Goal met: ${R.week.goal}</small>` : `<b>${R.week.n} of ${R.week.goal} lessons</b>${compact ? `<small>the week's goal</small>` : ""}`;
    const lvl = R.lvl.top ? `<b>C2</b><small>reached</small>` : `<b>${R.lvl.pct}% to ${R.lvl.id}</b>${compact ? `<small>${R.lvl.done} of ${R.lvl.span} lessons</small>${R.lvl.perf ? `<small><em class="gold">${R.lvl.perf} perfect</em></small>` : ""}` : R.lvl.perf ? `<small><em class="gold">${R.lvl.perf} perfect</em></small>` : ""}`;
    return `<div class="rrows${compact?" c":""}"><div class="rr day"><i></i><div><span>Today</span>${day}</div></div><div class="rr week"><i></i><div><span>This week</span>${week}</div></div><div class="rr lvl"><i></i><div><span>Your French</span>${lvl}</div></div></div>`; }
  // a draw-on from the values last shown (on home, after a lesson) to the values now
  function ringsAnimate(root, from, to){ if(!root) return; const svg=root.querySelector("svg.rings"); if(!svg || lessMotion() || !from) return;
    const set=(R)=>{ for(const k of ["day","week","lvl"]){ const a=svg.querySelector(".arc."+k+":not(.gold)"), g=svg.querySelector(".arc.gold."+k);
      if(a) a.setAttribute("stroke-dasharray", `${(Math.max(0.0001,R[k].f)*100).toFixed(2)} 100`); if(g) g.setAttribute("stroke-dasharray", `${(Math.max(0.0001,R[k].gold||0)*100).toFixed(2)} 100`); } };
    const same = ["day","week","lvl"].every(k=>Math.abs(from[k].f-to[k].f)<0.001 && Math.abs((from[k].gold||0)-(to[k].gold||0))<0.001); if(same) return;
    svg.classList.add("still"); set(from); void svg.getBoundingClientRect(); requestAnimationFrame(()=>{ svg.classList.remove("still"); requestAnimationFrame(()=>set(to)); }); }
  const ringsSnap = R=>({day:{f:R.day.f, gold:R.day.gold}, week:{f:R.week.f, gold:0}, lvl:{f:R.lvl.f, gold:R.lvl.gold}, at:dayOf(), wk:weekOf()});
  // what was shown last on home, carried across a day or a week's turn (an empty ring at the start of its period starts from empty)
  function ringsFrom(){ const s=G.ringsShown; if(!s) return null; const o=JSON.parse(JSON.stringify(s)); if(o.at!==dayOf()) o.day={f:0, gold:0}; if(o.wk!==weekOf()) o.week={f:0, gold:0}; return o; }

  /* ---- ranks from points (the owner's Halo Reach model, brief 13 and 15): stated thresholds that rise, the first inside Lesson 1; each rank
     earns tokens, more at higher ranks; tokens buy things in the wardrobe. Points are never spent and never fall; ranks are never lost.
     The numbers come from a simulation over the whole course (dev/design/RANKS.md in the private bundle). ---- */
  const TITLES = [["Débutant","Débutante"],["Visiteur","Visiteuse"],["Promeneur","Promeneuse"],["Voyageur","Voyageuse"],["Flâneur","Flâneuse"],["Habitué","Habituée"],
    ["Connaisseur","Connaisseuse"],["Raconteur","Raconteuse"],["Causeur","Causeuse"],["Ambassadeur","Ambassadrice"],["Virtuose","Virtuose"],["Maître","Maître"],["Immortel","Immortelle"]];
  const rankOf = p=>{ let k=0; RULES.RANKS.forEach((t,i)=>{ if(p>=t) k=i+1; }); return k; };      // 0: the start (Débutant); 1..34
  const rankTitle = k=>k===0 ? 0 : k===RULES.RANKS.length ? TITLES.length-1 : Math.floor((k-1)/3)+1;
  const rankGrade = k=>k===0 || k===RULES.RANKS.length ? 0 : (k-1)%3+1;
  const fem = ()=>{ try{ return AV.has() && AV.get() ? PICS.avatarParse(AV.get()).body==="f" : S.learnerGender==="f"; }catch(e){ return false; } };
  const rankName = (k, stars=true)=>{ const t=TITLES[rankTitle(k)][fem()?1:0], g=rankGrade(k); return t+(stars && g ? " "+"★".repeat(g) : ""); };
  const rankLabel = k=>{ const g=rankGrade(k); return TITLES[rankTitle(k)][fem()?1:0]+(g ? ", grade "+g : ""); };      // for a screen reader
  const tokensFor = k=>k>=1 ? RULES.RANK_TOKENS[k-1] : 0;
  // the emblem: a shield whose metal and sign grow with the title (bronze, silver, gold, enamel; the last, the Académie's green and a laurel),
  // and one to three stars for the grade. Nothing like the rosette of the badges, nothing like the levels' letters.
  const GLYPH = [
    `<path d="M10 18V10M10 12c0-4-3-6-7-6 0 4 3 6 7 6M10 10c0-4 3-6 7-6 0 4-3 6-7 6"/>`,                                             // a sprout
    `<path d="M5 18V3h10v15M2.5 18h15"/><circle cx="12.2" cy="11" r=".9" fill="currentColor" stroke="none"/>`,                    // an open door
    `<path d="M10 18.5V2.5M10 4h6.2l2 2.2-2 2.2H10M10 10.5H3.8l-2 2.2 2 2.2H10"/>`,                                                // a signpost
    `<rect x="3" y="7" width="14" height="10" rx="2"/><path d="M7.5 7V4.5h5V7M3 11.5h14"/>`,                                         // a suitcase
    `<path d="M1.5 14.5h17M5 14.5V8c0-2.6 10-2.6 10 0v6.5M5 11.5h10"/>`,                                                            // a hat
    `<path d="M3.5 7h11v4.5c0 3.8-11 3.8-11 0zM14.5 8.5c3 0 3 4 0 4M3 17.5h12M7 2.5c-1 1 1 2 0 3M11 2.5c-1 1 1 2 0 3"/>`,             // a cup
    `<circle cx="8.5" cy="8.5" r="5.2"/><path d="M12.4 12.4l5 5"/>`,                                                                 // a glass to look closely
    `<path d="M3 3.5h14v9.5H9.5L5 17v-4H3z"/>`,                                                                                       // a word
    `<path d="M2 3h10v7H6.5L3.5 13v-3H2zM9 13.2h2.5l3.5 3.3v-3.3H18V6.5h-3.5"/>`,                                                    // a conversation
    `<path d="M10 2.2l2.3 5 5.4.6-4 3.7 1.1 5.3L10 14.1l-4.8 2.7 1.1-5.3-4-3.7 5.4-.6z"/>`,                                          // the star of an order
    `<path d="M7 16.5V4.5l10-2.2v11.6"/><ellipse cx="5" cy="16.5" rx="2.6" ry="2" fill="currentColor"/><ellipse cx="15" cy="14" rx="2.6" ry="2" fill="currentColor"/>`,  // music
    `<path d="M3 15.5L2 6l5 4 3-6 3 6 5-4-1 9.5z"/><path d="M3.5 18h13"/>`,                                                          // a crown
    `<path d="M10 17.5C4 16 2.5 10 4 4.5M10 17.5c6-1.5 7.5-7.5 6-13"/><path d="M4 8.5c-2-.3-3-1.7-2.5-3.4 1.8.3 2.6 1.8 2.5 3.4zM5 12.5c-2.2.3-3.6-.8-3.6-2.6 2-.2 3.2 1 3.6 2.6zM16 8.5c2-.3 3-1.7 2.5-3.4-1.8.3-2.6 1.8-2.5 3.4zM15 12.5c2.2.3 3.6-.8 3.6-2.6-2-.2-3.2 1-3.6 2.6z" fill="currentColor" stroke="none"/>`,  // a laurel
  ];
  const METAL = { plain:["#FFFDF8","#E3D9C6","#9A8C72","#5C6577"], bronze:["#E2A56A","#A8652E","#7A4519","#FFF6EA"], silver:["#EEF1F5","#A7B1BE","#6E7A8A","#2D3747"],
    gold:["#FAD978","#D9A21E","#946500","#4A3000"], enamel:["#3E62B8","#22397A","#C79A2B","#FFE9A8"], laurel:["#2F7A57","#1B4D36","#D6A62C","#FFE9A8"] };
  function rankEmblem(k, cls="emb"){ const t=rankTitle(k), g=rankGrade(k), m = k===0 ? "plain" : t<=3 ? "bronze" : t<=6 ? "silver" : t<=9 ? "gold" : t<=11 ? "enamel" : "laurel";
    const [hi, lo, rim, ink]=METAL[m], u="em"+k+cls.replace(/\W/g,"");
    const stars = g ? Array.from({length:g},(_,i)=>{ const x=28+(i-(g-1)/2)*9.5; return `<path transform="translate(${x.toFixed(1)} 47.5) scale(.32)" d="M0-11l3.2 6.6 7.3.9-5.3 5 1.4 7.2L0 5.1l-6.6 3.6 1.4-7.2-5.3-5 7.3-.9z" fill="${ink}"/>`; }).join("") : "";
    return `<svg class="${cls}" viewBox="0 0 56 64" role="img" aria-label="${esc(rankLabel(k))}"><defs><linearGradient id="${u}" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset="1" stop-color="${lo}"/></linearGradient></defs>
      <path d="M28 3.5l20.5 6v20.5c0 14.5-9 22.5-20.5 28.5C16.5 52.5 7.5 44.5 7.5 30V9.5z" fill="url(#${u})" stroke="${rim}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M28 8.3l16.2 4.8V30c0 11.4-6.9 18-16.2 23.2C18.7 48 11.8 41.4 11.8 30V13.1z" fill="none" stroke="${ink}" stroke-opacity=".28" stroke-width="1.1"/>
      <path d="M11 11.5L28 6.5l17 5" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.6" stroke-linecap="round"/>
      <g transform="translate(18 ${g?14.5:18.5})" fill="none" stroke="${ink}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" color="${ink}">${GLYPH[t]}</g>${stars}</svg>`; }
  // a new rank (or several) since the last time: each gives its tokens, once; the first time a record meets this rule its ranks are given quietly
  function rankSync(){ const k=rankOf(G.points); if(G.rank==null){ G.rank=k; G.tokens=0; for(let j=1;j<=k;j++) G.tokens+=tokensFor(j); G.tokEarned=G.tokens; return null; }
    if(k<=G.rank) return null; const got=[]; for(let j=G.rank+1;j<=k;j++){ G.tokens=(G.tokens||0)+tokensFor(j); G.tokEarned=(G.tokEarned||0)+tokensFor(j); got.push(j); }
    G.rank=k; try{ trace("a new rank: "+rankName(k)+" ("+G.points+" points); tokens +"+got.reduce((a,j)=>a+tokensFor(j),0)); }catch(e){} return got; }
  // the bar along the bottom of the lesson-complete screen: points toward the next rank (from where the lesson began to where it ended)
  function rankBar(p0, p1){ const k=rankOf(p1), last=k>=RULES.RANKS.length, lo=k ? RULES.RANKS[k-1] : 0, hi=last ? lo : RULES.RANKS[k], f=x=>last ? 1 : Math.max(0, Math.min(1, (x-lo)/(hi-lo)));
    const from = rankOf(p0)<k ? 0 : f(p0);
    return `<div class="rankbar" role="group" aria-label="${esc(rankLabel(k))}: ${last ? "the highest rank" : (hi-p1)+" points to the next rank"}">${rankEmblem(k, "emb s")}<span class="rb-t"><span class="rb-l"><b>${esc(rankName(k))}</b><span>${last ? "The highest rank" : `<b class="num">${(hi-p1).toLocaleString("en-GB")}</b> point${hi-p1===1?"":"s"} to ${esc(rankName(k+1))}`}</span></span>
      <span class="rb-track"><i style="--a:${from.toFixed(3)};--b:${Math.max(0.02, f(p1)).toFixed(3)}"></i></span></span></div>`; }

  /* ---- the wardrobe (design B with price tiers, brief 15): things for the learner's figure, bought with tokens, worn on home, on You and on
     the celebrations, NEVER in a lesson's pictures; nothing of likeness is sold (that is all free in the maker). Each item is a stub: its name,
     its tier and its price; the figures agent draws them (PICS.wardrobeThumb(id) and PICS.avatar(spec, {wear}) when it can; until then a
     thumbnail marked as a placeholder). ---- */
  const TIERS = [{id:"everyday", label:"Everyday", price:1}, {id:"nicer", label:"Something nicer", price:3}, {id:"costume", label:"Costumes", price:8},
    {id:"wild", label:"Something wild", price:20}, {id:"move", label:"Poses and dances", price:40}];
  const WARDROBE = [      // slot: what it is worn as (one of each slot at a time; an outfit is the whole figure)
    ["cap","une casquette","a cap","everyday","head"], ["woolly","un bonnet","a woolly hat","everyday","head"], ["scarf","une écharpe","a scarf","everyday","neck"],
    ["tshirt","un T-shirt","a T-shirt","everyday","top"], ["checked","une chemise à carreaux","a checked shirt","everyday","top"], ["hoodie","un sweat à capuche","a hoodie","everyday","top"],
    ["cardigan","un gilet","a cardigan","everyday","top"], ["shades","des lunettes de soleil","sunglasses","everyday","face"], ["backpack","un sac à dos","a backpack","everyday","hand"],
    ["flowers","des fleurs","a bunch of flowers","everyday","hand"],
    ["beret","un béret et une marinière","a beret and a striped top","nicer","outfit"], ["coat","un beau manteau","a smart coat","nicer","top"], ["trench","un imperméable","a raincoat","nicer","top"],
    ["dots","une robe à pois","a polka-dot dress","nicer","outfit"], ["bowtie","un nœud papillon","a bow tie","nicer","neck"], ["straw","un chapeau de paille","a straw hat","nicer","head"],
    ["silk","un foulard en soie","a silk scarf","nicer","neck"], ["baguette","une baguette","a baguette under the arm","nicer","hand"],
    ["chef","le chef","a chef: tall hat and apron","costume","outfit"], ["painter","le peintre","a painter: smock and palette","costume","outfit"], ["mime","le mime","a mime: white gloves, striped top","costume","outfit"],
    ["cyclist","le cycliste","a racing cyclist in yellow","costume","outfit"], ["musketeer","le mousquetaire","a musketeer: hat, cape and boots","costume","outfit"], ["astronaut","l'astronaute","an astronaut","costume","outfit"],
    ["croissant","le croissant géant","dressed as a giant croissant","wild","outfit"], ["eiffel","la tour Eiffel","dressed as the Eiffel Tower","wild","outfit"], ["versailles","la cour de Versailles","court dress: wig, lace and a cape","wild","outfit"],
    ["thinker","la pose du penseur","the thinker's pose, on home","move","pose"], ["bow","la révérence","a grand bow, at every celebration","move","dance"],
    ["jig","la gigue","a jig, at every celebration","move","dance"], ["cancan","le cancan","the can-can, at every celebration","move","dance"],
  ].map(([id, fr, en, tier, slot])=>({id, fr, en, tier, slot, price:TIERS.find(t=>t.id===tier).price}));
  const W = ()=>G.ward || (G.ward={owned:{}, worn:{}});
  const wearing = ()=>Object.values(W().worn).filter(Boolean);
  // the learner's figure outside lessons, wearing what he chose (the picture library ignores `wear` until it draws the items)
  const avOut = (view, cls)=>AV.svg(AV.get(), Object.assign(typeof view==="string" ? {view} : view, {wear:wearing()}), cls);
  function wardThumb(it){ try{ if(window.PICS && PICS.wardrobeThumb){ const g=PICS.wardrobeThumb(it.id, PICS.avatarParse(AV.get())); if(g) return `<svg viewBox="0 0 160 190" aria-hidden="true">${g.outerHTML}</svg>`; } }catch(e){}
    const glyph = {head:`<path d="M48 104c0-26 64-26 64 0M40 104h80"/>`, neck:`<path d="M52 84c14 12 42 12 56 0M66 92l-6 40M94 92l6 40"/>`, top:`<path d="M58 66l-26 18 10 18 14-8v62h48V94l14 8 10-18-26-18c-4 10-30 10-34 0z"/>`,
      face:`<circle cx="62" cy="96" r="14"/><circle cx="98" cy="96" r="14"/><path d="M76 96h8M34 92l14 2M126 92l-14 2"/>`, hand:`<path d="M58 80h44l8 74H50zM68 80c0-18 24-18 24 0"/>`,
      outfit:`<circle cx="80" cy="54" r="15"/><path d="M80 70v52M80 84l-24 22M80 84l24 22M80 122l-18 40M80 122l18 40"/>`, pose:`<circle cx="80" cy="54" r="15"/><path d="M80 70v52M80 84l-14 22 18 6M80 84l26-8M80 122l-18 40M80 122l18 40"/>`,
      dance:`<circle cx="74" cy="52" r="15"/><path d="M76 68l6 50M78 82l-30-10M78 82l30-22M82 118l-28 26M82 118l30 36"/><path d="M118 112c6-4 12-2 14 4M28 120c4-6 10-6 14-2" stroke-dasharray="3 6"/>`}[it.slot]||"";
    return `<svg viewBox="0 0 160 190" aria-hidden="true"><rect x="9" y="9" width="142" height="172" rx="16" class="ph-box"/><g class="ph-g" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" transform="translate(80 92) scale(.84) translate(-80 -100)">${glyph}</g><text x="80" y="170" text-anchor="middle" class="ph-t">PLACEHOLDER</text></svg>`; }
  function wardrobe(back){ const o=$("ward"), w=W(), k=G.rank||0, tok=G.tokens||0;
    const nextTok = k<RULES.RANKS.length ? tokensFor(k+1) : 0;
    const card = it=>{ const own=!!w.owned[it.id], on=w.worn[it.slot]===it.id, can=tok>=it.price;
      return `<button class="witem${own?" own":can?" can":""}${on?" on":""}" data-it="${it.id}" aria-label="${esc(it.fr)}, ${esc(it.en)}: ${own ? (on?"worn":"yours") : it.price+" token"+(it.price>1?"s":"")}">
        <span class="wthumb">${wardThumb(it)}${on?`<span class="won">${ic("check")}</span>`:""}</span><span class="wfr" lang="fr">${esc(it.fr)}</span><span class="wen">${esc(it.en)}</span>
        <span class="wprice">${own ? (on ? "Wearing" : "Yours") : `${tokenIcon()}<b class="num">${it.price}</b>`}</span></button>`; };
    o.innerHTML=`<div class="mk-bar" style="padding:0"><button class="rb plain" id="wdBack" aria-label="Back">${ic("chev")}</button><h2>Your wardrobe</h2></div>
      <div class="card wtop"><div class="wfig">${avOut("standing", "w")}</div><div class="wme">${rankEmblem(k, "emb m")}<b>${esc(rankName(k))}</b>
        <div class="wtok">${tokenIcon()}${MV.num("tokW", tok)}<span>token${tok===1?"":"s"}</span></div>
        <small>${k<RULES.RANKS.length ? `${(RULES.RANKS[k]-G.points).toLocaleString("en-GB")} points to ${esc(rankName(k+1))}: <b>+${nextTok} token${nextTok===1?"":"s"}</b>` : "The highest rank"}</small></div></div>
      <div class="card wrule"><p>Perfect exercises earn points. Points earn ranks. Each rank earns tokens, and higher ranks earn more. Tokens buy anything here.</p></div>
      ${TIERS.map(t=>`<h3 class="gh wh"><span>${t.label}</span><span class="wtier">${tokenIcon()}${t.price} token${t.price>1?"s":""}${t.price>1?"":" each"}</span></h3><div class="wgrid2">${WARDROBE.filter(it=>it.tier===t.id).map(card).join("")}</div>`).join("")}
      <p class="foot">What you wear shows here, on Today and on your celebrations. In the lessons you are always your plain self.</p>`;
    o.hidden=false; if(!wardrobe.keep) o.scrollTop=0; wardrobe.keep=false; MV.count(o);
    $("wdBack").onclick=()=>{ tick(); o.hidden=true; if(back) back(); else home(); };
    o.querySelectorAll("[data-it]").forEach(b=>{ b.onclick=()=>{ tick(); const it=WARDROBE.find(x=>x.id===b.dataset.it); wardItem(it, back); MV.grow(b.querySelector(".wthumb svg"), document.querySelector("#sheet .wbig svg")); }; }); }
  function tokenIcon(){ return `<svg class="tokn" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.6" fill="#E3A417"/><circle cx="10" cy="10" r="6.2" fill="none" stroke="#A66F00" stroke-width="1.3"/><path d="M10 5.6l1.3 2.8 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z" fill="#FFF6DA"/></svg>`; }
  function wardItem(it, back){ const w=W(), own=!!w.owned[it.id], on=w.worn[it.slot]===it.id, tok=G.tokens||0, short=it.price-tok;
    const again=()=>{ wardrobe.keep=true; wardrobe(back); };
    info(it.fr, `<div class="wbig">${wardThumb(it)}</div><p class="wsub">${esc(it.en)}</p>
      ${own ? `<button class="btn" id="wdWear">${on ? "Take it off" : "Wear it"}</button>`
        : short<=0 ? `<p>${it.price} token${it.price>1?"s":""}. You have ${tok}.</p><button class="btn" id="wdBuy">${tokenIcon()} Buy it for ${it.price}</button>`
        : `<p>${it.price} tokens. You have ${tok}: ${short} more to go. Every rank brings tokens, and higher ranks bring more.</p>`}`);
    if(it.slot==="dance" && !lessMotion()){ try{ const big=document.querySelector("#sheet .wbig svg"), g=PICS.wardrobeThumb(it.id, PICS.avatarParse(AV.get()), {live:true}); if(big && g){ big.innerHTML=""; big.appendChild(g); } }catch(e){} }  // (figures7) the dance plays on the item's own sheet
    const bb=$("wdBuy"); if(bb) bb.onclick=()=>{ if((G.tokens||0)<it.price) return; G.tokens-=it.price; w.owned[it.id]=new Date().toISOString(); w.worn[it.slot]=it.id; if(it.slot==="outfit"){ for(const s of ["top","head"]) delete w.worn[s]; } else if(["top","head"].includes(it.slot)) delete w.worn.outfit;
      store(); try{ trace("wardrobe: bought "+it.id+" for "+it.price+" token(s); "+G.tokens+" left"); }catch(e){} try{ UI.haptic("done"); }catch(e){} $("sheet").hidden=true; again(); const c=$("ward").querySelector(`[data-it="${it.id}"]`); if(c && !lessMotion()){ c.classList.add("got"); } };
    const bw=$("wdWear"); if(bw) bw.onclick=()=>{ if(on) delete w.worn[it.slot]; else { w.worn[it.slot]=it.id; if(it.slot==="outfit"){ for(const s of ["top","head"]) delete w.worn[s]; } else if(["top","head"].includes(it.slot)) delete w.worn.outfit; }
      store(); $("sheet").hidden=true; again(); }; }

  /* ---- the end of a lesson: the record, the rules, the screen ---- */
  function lessonDone(){ const li=S.lesson, L=LESSONS[li], cur=G.cur && G.cur.lesson===L.id ? G.cur : {lesson:L.id, t0:"", kind:""};
    const R0=ringsNow(), p0 = cur.p0!=null ? cur.p0 : null;
    const sc=score(L.id, cur.t0), passed = !RULES.GATE_ON || sc.y>=RULES.PASS_MARK, now=new Date(), today=dayOf(now), firstPass = passed && li>=G.furthest;
    let why="";
    if((cur.kind==="again" || (G.again && G.again.li===li)) && li<G.furthest){ /* a lesson already passed, done again by choice: it locks nothing and moves nothing */ }
    if(G.again && G.again.li===li){ try{ trace("a passed lesson done again by choice has ended: the place is put back"); }catch(e){} restoreAgain(); }
    else if(passed){ G.below[L.id]=0; G.next=Math.min(li+1, last); G.furthest=Math.max(G.furthest, li+1); if(G.why==="warm" && G.warmTo!=null && G.next<G.warmTo) G.why="warm"; else { G.why=""; G.warmTo=null; } }
    else if((G.below[L.id]||0)>=RULES.REPEATS_BEFORE_STEP_BACK && li>0){ G.below[L.id]=0; G.next=Math.max(0, li-RULES.STEP_BACK_LESSONS); G.why=why="back"; }
    else { G.below[L.id]=(G.below[L.id]||0)+1; G.next=li; G.why=why="once"; }
    // points: fixed for the lesson (an error neither costs nor pays); the one bonus is for two lessons well apart; a small one for coming back
    if(G.replay) return replayDone();
    const exPts = G.lpts[L.id] || 0; delete G.lpts[L.id];
    let pts=0, bonus=0, back=0, perfectNow=false;
    if(lessonPerfect(L) && !G.lp[L.id]){ G.lp[L.id]=today; perfectNow=true; pts+=RULES.POINTS_PERFECT_LESSON; }
    const runPerfect = RUN.ex.length===L.exercises.length && RUN.ex.every(x=>x.perfect), runEx=RUN.ex.slice(); RUN.ex=[];
    const d=G.days[today]||(G.days[today]={n:0, firstEnd:"", full:false});
    if(d.n===1 && !d.full && cur.t0 && (new Date(cur.t0)-new Date(d.firstEnd))>=RULES.SPACING_GAP_HOURS*3600e3){ d.full=true; bonus=1; }      // recognised, without points (the owner)
    if(d.n===0){ d.firstEnd=now.toISOString(); d.am = now.getHours()<14;
      const gap = G.run.last ? daysBetween(G.run.last, today) : 0;
      if(!G.run.last) G.run.len=1;
      else if(gap===1) G.run.len++;
      else if(gap>1 && gap-1<=G.rest){ G.rest-=gap-1; G.run.len++; G.restUsed=today; }
      else if(gap>1) G.run.len=1;
      if(G.run.last && gap-1>=RULES.RETURN_AFTER_DAYS) back=1;      // recognised, without points
      G.run.last=today; G.daysLearned++; G.bestRun=Math.max(G.bestRun, G.run.len);
      if(G.daysLearned-G.restEarnedAt>=RULES.REST_DAY_EARNED_EVERY && G.rest<RULES.REST_DAYS_MAX){ G.rest++; G.restEarnedAt=G.daysLearned; } }
    else if(d.n===1 && !d.full){ d.soon=true; }
    d.n++; d.xp=0; G.points+=pts;
    // the pace: only a lesson done from its start in one sitting (under an hour and a half)
    if(cur.fromStart && cur.t0){ const secs=(now-new Date(cur.t0))/1000, t=tasksOf(L); if(t>0 && secs>60 && secs<5400){ G.pace.push(+(secs/t).toFixed(2)); G.pace=G.pace.slice(-9); } }
    const owned = firstPass ? cardsOf(L.id) : []; if(firstPass && !G.wordsAt[L.id]) G.wordsAt[L.id]=today;
    const badge = newBadge(today), level = newLevel(today), ranks = rankSync(), R1 = ringsNow(now);
    (G.lessons[L.id]=G.lessons[L.id]||[]).push({date:today, x:sc.x, y:sc.y, passed, pts:exPts+pts, perfect:runPerfect});
    G.cur=null; store(); look();
    try{ trace("lesson complete: Lesson "+(li+1)+": "+sc.x+" correct responses, "+sc.y+" % first time ("+sc.first+" of "+sc.scored+" scored); "+(passed?"passed":"below "+RULES.PASS_MARK+" %: "+why)+"; next: Lesson "+(G.next+1)); }catch(e){}
    showDone({li, sc, passed, why, R0, R1, ranks, p0: p0!=null ? p0 : G.points-exPts-pts, pts:exPts+pts, lessonBonus:pts, perfectNow, runPerfect, runEx, bonus, back, soon: d.soon && d.n===2, owned, badge, level, stageDone: firstPass && stageOf(li+1) && stageOf(li+1).last===li+1 ? stageOf(li+1) : null}); }
  function showDone(r){ const name=esc(S.learnerName||""), n=r.li+1, o=$("done"), first=completions()<=1, L=LESSONS[r.li], nPerf=r.runEx.filter(x=>x.perfect).length;
    const head = r.runPerfect ? `<svg class="seal" viewBox="0 0 56 70"><use href="#i-rosette"/><text x="28" y="31.5" text-anchor="middle" font-family="Fraunces" font-weight="600" font-size="${n>9?12:15}" fill="#fff" style="font-variation-settings:'SOFT' 100">${n}</text></svg><div class="perfect-tag">${ic("star")} A perfect lesson</div><h1>Magnifique${name?", "+name:""}!</h1><div class="sub">Every answer right, first time. That is how French is spoken.</div>`
      : r.passed ? `<svg class="seal" viewBox="0 0 56 70"><use href="#i-rosette"/><text x="28" y="31.5" text-anchor="middle" font-family="Fraunces" font-weight="600" font-size="${n>9?12:15}" fill="#fff" style="font-variation-settings:'SOFT' 100">${n}</text></svg><h1>Bravo${name?", "+name:""}!</h1><div class="sub">Lesson ${n} is done.</div>`
      : `<div class="sunmark">${ic("sun")}</div><h1>Well done${name?", "+name:""}.</h1><div class="sub">You finished Lesson ${n}.</div>`;
    o.innerHTML = head
      + `<div class="card say">In this lesson you made <b class="first" data-n="${r.sc.x}">${r.sc.x}</b> correct responses and you were <b data-n="${r.sc.y}" data-pc="1">${r.sc.y}%</b> correct.${first?`<small>${r.sc.y}% of your answers were right the first time you were asked.</small>`:""}</div>`
      + (r.why==="once" ? `<div class="card nextc"><div class="orb">${ic("redo")}</div><div><b>Lesson ${n} once more</b><p>You just need a bit more practice before moving on. Next time we will do this lesson again, and it will feel easier.</p></div></div>`
        : r.why==="back" ? `<div class="card nextc"><div class="orb">${ic("redo")}</div><div><b>A warm-up first</b><p>You are nearly there. Next time we will start with Lesson ${G.next+1}, which you know, and then come back to Lesson ${n}. Everything you have earned stays yours.</p></div></div>` : "")
      + `<div class="card exstrip"><div class="row"><b>${nPerf} of ${L.exercises.length} exercises perfect</b><span class="pts">${ic("star")} +<span data-n="${r.pts}">${r.pts}</span></span></div><div class="exdots">${L.exercises.map(x=>{ const g=G.ex[x.id]; return `<i class="${g ? (g.g?"g":"y") : ""}"></i>`; }).join("")}</div>
          <small>${r.perfectNow && r.runPerfect ? `Perfect first time through: +${RULES.POINTS_PERFECT_LESSON} for the lesson.` : r.perfectNow ? `Every exercise is perfect now: +${RULES.POINTS_PERFECT_LESSON} for the lesson.` : nPerf<L.exercises.length ? "Points come from perfect exercises." : ""}</small></div>`
      + (r.bonus ? `<div class="tile two"><div class="orb">${ic("moon")}</div><div><b>A full day</b><small>${G.bonusSaid++<3 ? "Your two lessons were well apart: that is how French sticks." : "Two lessons, well apart."}</small></div></div>` : r.back ? `<div class="tile two back"><div class="orb">${ic("sun")}</div><div><b>Welcome back</b><small>Good to have you here again.</small></div></div>` : "")
      + (r.soon ? `<div class="line">Done. Your next lesson will stick better after a break.</div>` : "")
      + (r.badge ? `<div class="card badgec">${badgeSvg(r.badge, "badge big")}<div><small>A new badge</small><b>${badgeName(r.badge)}</b><p>Every answer right, in ${r.badge} whole lessons. That is French you can speak.</p></div></div>` : "")
      + (r.owned.length ? `<div class="card nowyours"><div class="row"><b>Now yours</b><small>Tap to hear</small></div><div class="wrow">${r.owned.map((c,i)=>wcard(c, " turn").replace("<button", `<button style="--i:${i}"`)).join("")}</div></div>` : "")
      + rankUpCard(r.ranks)
      + (r.R1 ? ringsCard(r.R1, r.R0) : "")
      + (r.stageDone && r.stageDone.canDo ? `<div class="card cando"><b>Stage ${r.stageDone.id} is done.</b><p>${esc(r.stageDone.canDo)}</p></div>` : "")
      + `<div class="spacer"></div><div class="donefoot">${rankBar(r.p0, G.points)}<button class="btn" id="doneBtn">Continue</button></div>`;
    if((r.passed || r.runPerfect) && W().worn.dance && AV.has() && !lessMotion()){ try{ const c=document.createElementNS("http://www.w3.org/2000/svg","svg"); c.setAttribute("viewBox","0 0 160 190"); c.setAttribute("class","celebfig"); c.setAttribute("aria-hidden","true");
        c.appendChild(PICS.avatar(PICS.avatarParse(AV.get()), {view:"celebrate", wear:wearing()})); o.insertBefore(c, o.firstChild); }catch(e){} }  // (figures7) the dance the learner wears, at the celebration
    store(); o.hidden=false; o.scrollTop=0; wireCards(o); if(r.R1) ringsAnimate(o.querySelector(".ringc"), r.R0, r.R1);
    $("doneBtn").onclick=()=>{ tick(); o.hidden=true; stopFete(); if(r.level) levelParty(r.level, ()=>home()); else home(); };
    fete(o, r.passed || r.runPerfect || !!(r.ranks && r.ranks.length) || !!(r.R1 && r.R1.week.closed && !r.R0.week.closed)); }
  // a ring closed by this lesson is said in words, once, at its end; a ring still open is just shown (never as missed)
  function ringsCard(R, R0){ const day = !R0.day.closed && R.day.closed, two = R0.day.n<2 && R.day.n>=2, week = !R0.week.closed && R.week.closed;
    const head = week ? `This week's goal is met: ${R.week.n} lesson${R.week.n===1?"":"s"}!` : two ? "Two lessons today: the gold ring." : day ? "Today's goal is met." : "";
    return `<div class="card ringc${week?" big":""}">${head ? `<div class="rhead${two&&!week?" gold":""}">${two&&!week?ic("star"):ic("check")}<span>${head}</span></div>` : ""}<div class="rbody">${ringsSvg(R)}${ringRows(R, true)}</div></div>`; }
  function rankUpCard(got){ if(!got || !got.length) return ""; const k=got[got.length-1], t=got.reduce((a,j)=>a+tokensFor(j),0);
    return `<div class="card rankup"><div class="rkem">${rankEmblem(k, "emb big")}</div><div><small>${got.length>1 ? got.length+" new ranks" : "A new rank"}</small><b>${esc(rankName(k))}</b><p>${tokenIcon()}<span><b class="num">+${t}</b> token${t===1?"":"s"} for your wardrobe</span></p></div></div>`; }
  /* ---- one exercise done again (from the lesson's view): it ran exactly as in its lesson; the learner's place, finished exercises and
     delayed tests are as they were before it (kept in G.replay, so that leaving half-way or closing the app puts them back too) ---- */
  function replayDone(){ const R0=G.replay, L=LESSONS[R0.li], X=L.exercises[R0.ei], res=RUN.ex.filter(x=>x.id===X.id).pop() || {perfect:false, p:0}; RUN.ex=[];
    restorePlace(); let bonus=0, badge=null; const today=dayOf(), p0=G.points-(res.p||0);
    if(lessonPerfect(L) && !G.lp[L.id]){ G.lp[L.id]=today; bonus=RULES.POINTS_PERFECT_LESSON; G.points+=bonus; G.lpts[L.id]=(G.lpts[L.id]||0)+bonus; badge=newBadge(today); }      // perfect now, by repair: +5 and it counts for the badges (the owner, 15 Nov late)
    delete G.lpts[L.id]; G.cur=null; const ranks=rankSync(); store(); look();
    try{ trace("exercise done again: Lesson "+(R0.li+1)+", exercise "+(R0.ei+1)+": "+(res.perfect?"perfect":"not perfect")+"; points +"+res.p+(bonus?"; the lesson is perfect now: +"+bonus:"")+"; the place is as it was"); }catch(e){}
    const o=$("done"), name=esc(S.learnerName||"");
    o.innerHTML = (res.perfect ? `<div class="okmark star">${ic("star")}</div><h1>Perfect${name?", "+name:""}!</h1><div class="sub">Lesson ${R0.li+1}, exercise ${R0.ei+1}: every answer right, first time.</div>`
        : `<div class="sunmark">${ic("sun")}</div><h1>Well done${name?", "+name:""}.</h1><div class="sub">Lesson ${R0.li+1}, exercise ${R0.ei+1} again. Practice makes it yours.</div>`)
      + `<div class="card exstrip"><div class="row"><b>Lesson ${R0.li+1}</b>${res.p ? `<span class="pts">${ic("star")} +${res.p}</span>` : ""}</div><div class="exdots">${L.exercises.map((x,k)=>{ const g=G.ex[x.id]; return `<i class="${g ? (g.g?"g":"y") : ""}${k===R0.ei?" me":""}"></i>`; }).join("")}</div>
          <small>${bonus ? `Every exercise of Lesson ${R0.li+1} is perfect now: +${bonus} for the lesson. It counts toward your badges.` : res.p ? "Repaired: this exercise is perfect now." : res.perfect ? "It was perfect already; it still is." : "Try it again whenever you like."}</small></div>`
      + (badge ? `<div class="card badgec">${badgeSvg(badge, "badge big")}<div><small>A new badge</small><b>${badgeName(badge)}</b><p>Every answer right, in ${badge} whole lessons.</p></div></div>` : "")
      + rankUpCard(ranks)
      + `<div class="spacer"></div><div class="donefoot">${rankBar(p0, G.points)}<button class="btn" id="doneBtn">Continue</button></div>`;
    o.hidden=false; o.scrollTop=0; $("doneBtn").onclick=()=>{ tick(); o.hidden=true; stopFete(); home(); }; fete(o, res.perfect || !!(ranks && ranks.length)); }
  const PLACE_KEYS=["lesson","ex","finished","delayed","exHadError","ftc","doneDay"];
  function restoreAgain(){ const A=G.again; if(!A) return; const sn=A.snap; for(const k of PLACE_KEYS) if(k in sn) S[k]=sn[k]; else delete S[k]; G.again=null; save(); store(); }
  /* a phone already caught by the fault (release .65: "The whole lesson again", then the lesson left): the page's place is inside a passed
     lesson, no rule sent the learner there, and the last "LESSON AGAIN" line of the log is the learner's own choice of that lesson. The place
     goes to the first lesson not passed, at its first exercise not finished; the passed lesson is finished as it was. */
  function untrap(){ try{ if(G.fix66) return; G.fix66=1;      // once on each phone: from .66 on the place is kept (G.again), so the fault cannot be met again
      if(G.again || G.replay || G.why || S.detour || !(S.lesson<G.furthest)) return; const tag="LESSON AGAIN: Lesson "+(S.lesson+1)+" (the learner's own choice)";
      let lastAgain=null; for(let i=S.log.length-1;i>=0;i--){ const r=String((S.log[i]||{}).result||""); if(r.indexOf("LESSON AGAIN:")===0){ lastAgain=r; break; } }
      if(!lastAgain || lastAgain.indexOf(tag)!==0) return;
      const from=S.lesson, to=Math.min(G.furthest, LESSONS.length-1); LESSONS[from].exercises.forEach(x=>{ S.finished[x.id]=true; });
      S.lesson=to; const k=LESSONS[to].exercises.findIndex(x=>!S.finished[x.id]); S.ex = k<0 ? LESSONS[to].exercises.length-1 : k; G.next=natural(); G.cur=null;
      logEntry({result:"PLACE PUT BACK: Lesson "+(from+1)+" was being done again by the learner's own choice and was left; the place is Lesson "+(to+1)+", exercise "+(S.ex+1)+" again", heard:[]}); save(); store();
      trace("a passed lesson done again by choice had been left (release .65's fault): the place is put back to Lesson "+(to+1)+", exercise "+(S.ex+1)); }catch(e){ try{ trace("FAULT untrap: "+e.message); }catch(_){} } }
  function restorePlace(){ const R0=G.replay; if(!R0) return; const sn=R0.snap; for(const k of ["lesson","ex","finished","delayed","exHadError","ftc","doneDay"]) if(k in sn) S[k]=sn[k]; else delete S[k];
    G.replay=null; save(); store(); }
  function startReplay(li, ei){ const snap={}; for(const k of ["lesson","ex","finished","delayed","exHadError","ftc","doneDay"]) if(k in S) snap[k]=JSON.parse(JSON.stringify(S[k]));
    G.replay={li, ei, snap, t0:new Date().toISOString()}; store();
    S.lesson=li; S.ex=ei; LESSONS[li].exercises.forEach((x,k)=>{ if(k===ei) delete S.finished[x.id]; else S.finished[x.id]=true; }); S.delayed=[];
    logEntry({result:"EXERCISE AGAIN: Lesson "+(li+1)+", exercise "+(ei+1)+" ("+LESSONS[li].exercises[ei].id+"; the learner's own choice: a replay, its delayed tests are not kept, the place is put back after it)", heard:[]}); save(); }
  // the progress bar of a replay counts that one exercise
  { const ps0=UI.progStart; UI.progStart=function(L){ const r=ps0.apply(this, arguments); try{ if(G.replay && L && L.id===LESSONS[G.replay.li].id){ const X=L.exercises[G.replay.ei]; UI.PROG.total=Math.max(1, X.parts.reduce((n,p)=>n+p.items.filter(it=>it.type==="task").length,0)); UI.PROG.base=0; UI.progDraw(); } }catch(e){} return r; }; }

  /* ---- a lesson done, and every exercise in it: green when perfect, yellow when it had an error; any of them can be done again ---- */
  function lessonView(li){ const o=$("lessonV"), L=LESSONS[li], nP=L.exercises.filter(x=>G.ex[x.id]&&G.ex[x.id].g).length, known=L.exercises.filter(x=>G.ex[x.id]).length;
    o.innerHTML=`<div class="mk-bar" style="padding:0"><button class="rb plain" id="lvBack" aria-label="Back">${ic("chev")}</button><h2>Lesson ${li+1}</h2></div>
      <div class="card lvsum">${G.lp[L.id] ? badgeSvg(li+1, "badge") : `<div class="ring" style="--p:${Math.round(100*nP/L.exercises.length)}%"><b>${nP}</b></div>`}<div><b>${G.lp[L.id] ? "A perfect lesson" : nP+" of "+L.exercises.length+" exercises perfect"}</b><small>${G.lp[L.id] ? "Every exercise right, first time." : "A yellow one done again with every answer right turns green: +"+RULES.POINTS_PERFECT_REPAIR+" each, once. A whole lesson green counts toward your badges."}</small></div></div>
      <div class="exgrid">${L.exercises.map((x,k)=>{ const g=G.ex[x.id]; return `<button class="extile ${g ? (g.g?"g":"y") : "u"}" data-ei="${k}" aria-label="Exercise ${k+1}: ${g ? (g.g?"perfect":"had an error") : "done"}"><span class="k">${k+1}</span>${firstMini(x)}<span class="st">${g ? (g.g?ic("star"):"") : ""}</span></button>`; }).join("")}</div>
      <div class="legend"><span><i class="g"></i>Perfect</span><span><i class="y"></i>Had an error</span>${known<L.exercises.length?`<span><i class="u"></i>Done before the record began</span>`:""}</div>
      <button class="btn quiet" id="lvAll">${ic("redo")} The whole lesson again</button>`;
    o.hidden=false; o.scrollTop=0; freezeMinis(o);
    $("lvBack").onclick=()=>{ tick(); o.hidden=true; };
    $("lvAll").onclick=()=>{ tick(); o.hidden=true; pendingAgain=li; pendingEx=null; home(); const lb=$("playBtn").querySelector(".ready"); if(lb) lb.textContent="Start lesson "+(li+1)+" again"; const h=$("home"); h.scrollTo({top:0, behavior:"smooth"}); h.querySelector(".hero h1").textContent="Lesson "+(li+1); };
    o.querySelectorAll("[data-ei]").forEach(b=>{ b.onclick=()=>{ tick(); const ei=+b.dataset.ei, g=G.ex[L.exercises[ei].id];
      info(`Lesson ${li+1}, exercise ${ei+1}`, `<div class="exprev">${firstMini(L.exercises[ei], "big")}</div><p>${g ? (g.g ? "This one is perfect. Doing it again is good practice; it earns no points." : "It had an error. Do it again with every answer right first time, and it turns green: +"+RULES.POINTS_PERFECT_REPAIR+".") : "Do it again whenever you like."}</p><p class="small">It runs just as it did in the lesson. Your place in the course stays where it is.</p><button class="btn" id="exGo">${ic("play")} Do exercise ${ei+1} again</button>`); freezeMinis($("sheet")); MV.grow(b.querySelector(".mini"), document.querySelector("#sheet .exprev .mini"));
      $("exGo").onclick=()=>{ tick(); $("sheet").hidden=true; o.hidden=true; pendingEx={li, ei}; pendingAgain=null; $("playBtn").click(); }; }; }); }
  const firstMini = (x, cls="")=>{ try{ for(const p of x.parts) for(const it of p.items){ const row=(it.scene&&it.scene.row)||[]; const sp=row.find(r=>r && typeof r==="object" && r.person!=="you"); if(sp) return `<span class="mini ${cls}"><svg viewBox="0 0 160 190" aria-hidden="true">${picture(Object.assign({}, sp, {count:1, still:true})).outerHTML}</svg></span>`; } }catch(e){} return `<span class="mini ${cls}"></span>`; };

  /* the one celebration: paper in the four people's colours and the numbers counting up (900 ms). Nothing of it with less movement. */
  let feteT=0;
  function stopFete(){ clearTimeout(feteT); const c=$("confetti"); if(c) c.remove(); }
  function fete(o, big){ if(lessMotion()) return; const t0=performance.now(), D=900, ease=x=>1-Math.pow(1-x,3);
    const nums=[...o.querySelectorAll("[data-n]")].map(b=>({b, n:+b.dataset.n, pc:!!b.dataset.pc}));
    const step=t=>{ const k=ease(Math.min(1,(t-t0)/D)); for(const x of nums) x.b.textContent=Math.round(x.n*k)+(x.pc?"%":""); if(k<1) requestAnimationFrame(step); }; requestAnimationFrame(step);
    o.querySelectorAll(".wcard.turn").forEach(b=>b.classList.add("go")); setTimeout(()=>cardSound(o.querySelectorAll(".wcard.turn").length), 700);
    if(!big) return; stopFete();
    const cols=["#2E4A6B","#3F6FB5","#C0453B","#5AA86D","#F3B33D"], c=el(`<div id="confetti" aria-hidden="true"></div>`);
    for(let k=0;k<44;k++){ const p=document.createElement("i"), x=Math.random()*100, dx=(Math.random()-.5)*120, r=(Math.random()*720-360)|0, s=.7+Math.random()*.6, dl=Math.random()*260;
      p.style.cssText=`left:${x}%;background:${cols[k%cols.length]};--dx:${dx.toFixed(0)}px;--r:${r}deg;--s:${s.toFixed(2)};animation-delay:${dl.toFixed(0)}ms;${k%3?"":"border-radius:50%;width:9px;height:9px;"}`; c.appendChild(p); }
    document.body.appendChild(c); feteT=setTimeout(stopFete, 2600); }
  // the paper flick of cards turning up (a setting: Sounds); made here, so it costs no download
  function cardSound(n){ if(!UI.pref.sound || !n) return; try{ const A=window.AudioContext||window.webkitAudioContext; const ac=cardSound.ac||(cardSound.ac=new A()); if(ac.state!=="running") ac.resume();
      for(let i=0;i<Math.min(n,6);i++){ const t=ac.currentTime+i*0.11, len=0.05, buf=ac.createBuffer(1, ac.sampleRate*len, ac.sampleRate), d=buf.getChannelData(0); for(let j=0;j<d.length;j++) d[j]=(Math.random()*2-1)*Math.pow(1-j/d.length, 3);
        const s=ac.createBufferSource(), f=ac.createBiquadFilter(), g=ac.createGain(); s.buffer=buf; f.type="bandpass"; f.frequency.value=2600+i*180; f.Q.value=0.9; g.gain.value=0.22; s.connect(f).connect(g).connect(ac.destination); s.start(t); } }catch(e){} }

  /* ---- a soft sound on a right answer (the owner's trial): made here with Web Audio, nothing fetched; under 150 ms, well below Marie;
     never while Marie (or the phone's voice) is speaking or about to; never on an error; never delays anything (it is only scheduled) ---- */
  const BEAD = {
    A:(ac,t,k,g)=>{ const f=[523.25,587.33,659.25][k%3]; tone(ac,t,f,0.13,g,0.006); tone(ac,t,f*3,0.035,g*0.10,0.004); },                   // a soft marimba: the fundamental, a faint third partial gone in 35 ms
    B:(ac,t,k,g)=>{ const f=[440,493.88,554.37][k%3]; tone(ac,t,f,0.14,g,0.008); tone(ac,t,f*2.76,0.05,g*0.07,0.006); },                  // a felt bell: low, one faint inharmonic partial
    C:(ac,t,k,g)=>{ const f=[392,440,493.88][k%3]; tone(ac,t,f,0.11,g,0.007, 1.12); },                                                      // a drop: a pure tone that settles a little in pitch
  };
  function tone(ac, t, f, dur, gain, att, glide){ const o=ac.createOscillator(), v=ac.createGain(), lp=ac.createBiquadFilter(); o.type="sine";
    o.frequency.setValueAtTime(f*(glide||1), t); if(glide) o.frequency.exponentialRampToValueAtTime(f, t+0.06);
    lp.type="lowpass"; lp.frequency.value=2200; v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(gain, t+att); v.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    o.connect(lp).connect(v).connect(ac.destination); o.start(t); o.stop(t+dur+0.02); }
  let beadAC=null, beadK=0;
  function beadCtx(){ try{ if(!beadAC){ const A=window.AudioContext||window.webkitAudioContext; beadAC=new A(); } if(beadAC.state!=="running") beadAC.resume(); }catch(e){} }
  function beadSound(){ if(UI.pref.beadSound===false || !beadAC || beadAC.state!=="running") return;
    try{ if(typeof synth!=="undefined" && synth && synth.speaking) return; }catch(e){}
    try{ if(typeof actx!=="undefined" && actx && CLIP.e && actx.currentTime < CLIP.e+0.03) return; }catch(e){}      // Marie's clip is playing, or starts within the sound
    try{ (BEAD[RULES.BEAD_SOUND]||BEAD.B)(beadAC, beadAC.currentTime+0.005, beadK++, 0.07); }catch(e){} }
  { const ol0=UI.onLog; UI.onLog=function(o){ const r=ol0.apply(this, arguments); try{ if(o && o.result==="correct" && o.task && !/^lead/.test(o.phase||"") && document.body.classList.contains("inLesson")) beadSound(); }catch(e){} return r; }; }

  /* ---- home: today's two moments, the week, the next lesson, the path ---- */
  /* (owner, 16 Nov: "the two figures I circled are flashing") a small picture on a card is a STILL picture: the frozen frame where the drawing has one
     (spec.still), and whatever still moves by itself (the unnamed people's loops) is stopped at its first frame by freezeMinis after it is put in the page */
  const stillSpec = spec=>spec && typeof spec==="object" ? Object.assign({}, spec, {still:true}) : spec;
  const freezeMinis = root=>{ try{ (root||document).querySelectorAll(".mini svg").forEach(v=>{ try{ v.pauseAnimations(); v.setCurrentTime(0); }catch(e){} }); }catch(e){} };
  const mini = spec=>{ try{ return `<div class="mini"><svg viewBox="0 0 160 190" aria-hidden="true">${pic(stillSpec(spec)).outerHTML}</svg></div>`; }catch(e){ return ""; } };
  const picsOf = (()=>{ const memo={}; return i=>{ if(memo[i]) return memo[i]; const seen=new Set(), out=[];
      for(const ex of LESSONS[i].exercises) for(const p of ex.parts) for(const it of p.items){ const row=(it.scene&&it.scene.row)||[]; for(const x of row){ if(!x || typeof x!=="object") continue;
        const k=x.person ? "p:"+x.person+(x.doing||"") : (x.is||"")+":"+(x.doing||x.value||""); if(x.person==="you" || seen.has(k)) continue; seen.add(k); out.push(Object.assign({}, x, {count:1})); } }
      return (memo[i]=out); }; })();
  const newPics = i=>{ const cs=cardsOf(LESSONS[i].id).filter(c=>c.spec!=null); if(cs.length) return cs.map(c=>c.spec).slice(0,5);
    const before=new Set(); for(let k=0;k<i;k++) picsOf(k).forEach(x=>before.add(JSON.stringify([x.person,x.is,x.doing,x.value]))); const fresh=picsOf(i).filter(x=>!before.has(JSON.stringify([x.person,x.is,x.doing,x.value]))); return (fresh.length?fresh:picsOf(i)).slice(0,5); };
  function slots(d, now){ const a1=atToday(G.anchors.first.time, now), a2=atToday(G.anchors.second.time, now), late=atToday(RULES.LATE_HOUR+":00", now);
    const done=`Done ${ic("check")}`, s={};
    s.one = d.n>=1 ? done : now<a1 ? `<span class="num">${hm(a1)}</span>` : "Now";
    if(d.n>=2) s.two=done;
    else if(d.n===1){ const gap=new Date(new Date(d.firstEnd).getTime()+RULES.SPACING_GAP_HOURS*3600e3), at=gap>a2 ? gap : a2;
      s.two = at>late ? "Tomorrow" : at<=now ? "Now" : `<span class="num">${hm(at)}</span>`; s.twoTomorrow = at>late; }
    else s.two=`<span class="num">${hm(a2)}</span>`;
    return s; }
  function home(){ const play=$("play"); if(!play || play.hidden) return; syncNext(); store(); look();
    let h=$("home"); if(!h){ h=el(`<div id="home" lang="en"></div>`); play.insertBefore(h, play.firstChild);
      play.parentNode.insertBefore(el(`<nav id="nav" lang="en"><button class="tab on" id="tabToday"><div class="pillbg">${ic("today")}</div>Today</button><button class="tab" id="tabWords"><div class="pillbg">${ic("words")}</div>Words</button><button class="tab" id="tabYou"><div class="pillbg">${ic("you")}</div>You</button></nav>`), play.nextSibling);
      $("tabToday").onclick=()=>tab("today"); $("tabWords").onclick=()=>tab("words"); $("tabYou").onclick=()=>tab("you"); }
    { const how0=$("howtoBox"), btn0=$("playBtn"); play.appendChild(how0); play.appendChild(btn0); }      // kept out of the part that is drawn again
    const T=G.next, n=T+1, now=new Date(), today=dayOf(now), d=G.days[today]||{n:0}, hr=now.getHours(), greet = hr<4 ? "Good evening" : hr<12 ? "Good morning" : hr<18 ? "Good afternoon" : "Good evening";
    const started = !allDone(S.lesson) && (S.ex>0 || !!S.finished[LESSONS[S.lesson].exercises[0].id]) && S.lesson===T;
    const sl=slots(d, now), two=G.goal!==1;
    const eyebrow = G.why==="once" ? `<div class="eyebrow sun">${ic("redo")} Once more</div>` : G.why==="back" || G.why==="warm" ? `<div class="eyebrow sun">${ic("redo")} A warm-up</div>` : d.n>=1 ? `<div class="eyebrow moon">${ic("moon")} ${two && d.n===1 ? "Your second lesson today" : "Another lesson"}</div>` : `<div class="eyebrow">${ic("sun")} Today's lesson</div>`;
    const L=LESSONS[T], mins=minutesFor(L), st=stageLine(Math.min(G.furthest+1, LESSONS.length));
    const R=ringsNow(now), k=G.rank||0;
    h.innerHTML=`<div class="h-top"><button class="h-me" id="hMe" aria-label="You">${avOut("portrait", "t").replace('viewBox="0 0 160 190"','viewBox="27 24 106 106"')}</button><div class="h-hello">${greet},<b>${esc(S.learnerName||"")}</b></div>
        <button class="h-rank" id="hRank" aria-label="${esc(rankLabel(k))}. Your wardrobe${G.tokens?": "+G.tokens+" token"+(G.tokens===1?"":"s"):""}">${rankEmblem(k, "emb s")}<span class="hr-t"><b>${esc(rankName(k, false))}</b><span>${G.tokens ? `${tokenIcon()}${MV.num("tokH", G.tokens)} to spend` : "Wardrobe"}</span></span></button></div>
      <section class="card rhythm" aria-label="Today, this week, your French"><div class="rbody">${ringsSvg(R)}${ringRows(R)}</div>
        <div class="moments${two?"":" one"}"><div class="mo am${d.n===0?" next":""}"><span class="orb">${ic("sun")}</span><span class="k">After ${esc(G.anchors.first.after)}</span><b class="v">${sl.one}</b></div>${two?`<div class="mo pm${d.n===1&&!sl.twoTomorrow?" next":""}"><span class="orb">${ic("moon")}</span><span class="k">After ${esc(G.anchors.second.after)}</span><b class="v">${sl.two}</b></div>`:""}</div>
        ${G.anchors.set ? "" : `<button class="setmoments" id="setMoments">${ic("sun")} Choose your two moments ${ic("chev")}</button>`}</section>
      ${G.makerOffer && AV.has() ? `<button class="card offer" id="offerMaker"><div class="ic">${AV.svg(AV.get(), "portrait", "t").replace('viewBox="0 0 160 190"','viewBox="30 30 100 100"')}</div><div class="l">Make your figure look like you<small>Face, hair, glasses, clothes: it is you in every picture.</small></div>${ic("chev")}</button>` : ""}
      <section class="card hero"><div class="headrow"><div>${eyebrow}<h1>Lesson ${n}</h1></div><div class="minis">${newPics(T).slice(0,3).map(mini).join("")}</div></div>
        <div class="meta">${started ? "Carry on from where you stopped." : L.exercises.length+" exercises · about "+mins+" minutes"}</div>${G.why==="once" ? `<div class="meta">A bit more practice, then Lesson ${n+1}.</div>` : G.why==="back" ? `<div class="meta">A warm-up, then Lesson ${n+1}.</div>` : G.why==="warm" && G.warmTo!=null ? `<div class="meta">Warming up, then on to Lesson ${G.warmTo+1}.</div>` : ""}
        <div id="heroSlot"></div></section>
      <div class="pathhead"><h2>Your path</h2><span class="meta">${st ? st.text : G.furthest+" done"}</span></div><div class="path">${pathRows(T, st)}</div>`;
    const slot=$("heroSlot"), how=$("howtoBox"), btn=$("playBtn"); slot.appendChild(how); slot.appendChild(btn); slot.style.display="grid"; slot.style.gap="11px";
    const lab=btn.querySelector(".ready"); if(lab && !play.classList.contains("afterDemo")) lab.textContent=(started?"Carry on with lesson ":"Start lesson ")+n;
    const sm=$("setMoments"); if(sm) sm.onclick=()=>{ tick(); anchors(false); };
    $("hMe").onclick=()=>tab("you"); $("hRank").onclick=()=>{ tick(); wardrobe(()=>home()); };
    ringsAnimate(h.querySelector(".rhythm"), ringsFrom(), R); G.ringsShown=ringsSnap(R); MV.count(h.querySelector(".h-top")); store();
    const om=$("offerMaker"); if(om) om.onclick=()=>{ tick(); G.makerOffer=false; store(); maker(false, ()=>home()); };
    h.querySelectorAll("[data-lv]").forEach(b=>{ b.onclick=()=>{ tick(); lessonView(+b.dataset.lv); }; });   // (owner, 16 Nov) the whole card, not only its "Exercises" / "Perfect" corner (the corner's button is inside it)
    freezeMinis(h);
    h.querySelectorAll("[data-again]").forEach(b=>{ b.onclick=()=>{ pendingAgain=+b.dataset.again; tick(); const lb=btn.querySelector(".ready"); if(lb) lb.textContent="Start lesson "+(pendingAgain+1)+" again"; h.scrollTo({top:0, behavior:"smooth"}); h.querySelector(".hero h1").textContent="Lesson "+(pendingAgain+1); }; }); }
  const lessonBadge = L=>{ const n=L.exercises.length, g=L.exercises.filter(x=>G.ex[x.id]&&G.ex[x.id].g).length, k=L.exercises.filter(x=>G.ex[x.id]).length;
    return G.lp[L.id] ? `<span class="pf">${ic("star")} Perfect</span>` : k ? `<span class="pp">${g} of ${n} perfect</span>` : `<span class="pp">Exercises</span>`; };
  function pathRows(T, st){ const upto = st ? st.s.last : LESSONS.length, from = st ? st.s.first-1 : 0; let out="";
    for(let i=from;i<upto;i++){ const Lk=LESSONS[i], recs=Lk ? (G.lessons[Lk.id]||[]) : [], pass=i<G.furthest, bestRec=recs.filter(r=>r.passed).slice(-1)[0];
      const cls = i===T ? (G.why ? "once" : "now") : pass ? "done" : "later";
      out+=`<div class="step ${cls}"><div class="node">${pass && i!==T ? ic("check") : i+1}</div><div class="card lcard"${pass && i!==T && Lk ? ` data-lv="${i}"` : ""}><div class="row"><span class="t">Lesson ${i+1}</span>${i===T && G.why ? `<span class="chip">${G.why==="once"?"Once more":"A warm-up"}</span>` : pass && i!==T && Lk ? `<button class="again" aria-label="Lesson ${i+1}: its exercises">${lessonBadge(Lk)}${ic("chev")}</button>` : ""}</div>${pass && bestRec && bestRec.x!=null ? `<div class="pct">${bestRec.x} right · ${bestRec.y}%</div>`:""}<div class="minis">${(Lk && i<=Math.max(T,G.furthest) ? newPics(i).map(mini).join("") : `<div class="mini back"></div>`.repeat(4))}</div></div></div>`; }
    return out; }

  /* ---- the three places at the foot: Today, Words, You ---- */
  const TABS=["today","words","you"], TABEL={today:"home", words:"wordsV", you:"you"}, scrollAt={}; let tabNow="today";
  function tab(which){ tick(); const prev=tabNow, pe=$(TABEL[prev]); if(pe) scrollAt[prev]=pe.scrollTop; tabNow=which;
    for(const [id,v] of [["tabToday","today"],["tabWords","words"],["tabYou","you"]]){ const b=$(id); if(b){ b.classList.toggle("on", v===which); b.setAttribute("aria-selected", v===which); } }
    $("wordsV").hidden = which!=="words"; $("you").hidden = which!=="you";
    if(which==="words") words(); else if(which==="you") you(); else home();
    const ne=$(TABEL[which]); if(ne){ if(prev!==which){ ne.scrollTop=scrollAt[which]||0; MV.play(ne, TABS.indexOf(which)>TABS.indexOf(prev) ? "mv-tab-r" : "mv-tab-l", 500); } } }

  /* ---- words: every card the learner owns, with its picture and its sound ---- */
  function words(){ const o=$("wordsV"); const own=ownedCards(), byL={}; own.forEach(c=>{ (byL[c.lesson]=byL[c.lesson]||[]).push(c); });
    const ls=Object.keys(byL).map(Number).sort((a,b)=>b-a);
    o.innerHTML=`<div class="tabhead"><h1>Your words</h1></div>
      <div class="card owned"><div class="num big">${own.length}</div><div><b>${own.length===1?"French word is yours":"French words are yours"}</b><small>${own.length ? "Each came from a lesson you passed. They stay yours." : "Your first words arrive when you finish Lesson 1."}</small></div></div>
      ${ls.map(i=>`<h3 class="wl">From Lesson ${i+1}${G.wordsAt[LESSONS[i].id] ? `<small>${new Date(G.wordsAt[LESSONS[i].id]+"T12:00").toLocaleDateString([], {day:"numeric", month:"long"})}</small>` : ""}</h3><div class="wgrid">${byL[i].map(c=>wcard(c)).join("")}</div>`).join("")}
      ${own.length ? `<p class="foot">Tap a card to hear it. More come with every lesson.</p>` : ""}`;
    o.hidden=false; wireCards(o); }

  /* ---- who is learning? (more than one learner on this phone) ---- */
  function who(force){ const o=$("whoL"); if(!o) return; let chosen=false; try{ chosen=sessionStorage.getItem("frDIn.chosen")==="1"; }catch(e){}
    if(!force && (USERS.list.length<2 || chosen || running)) return false;
    o.innerHTML=`<h1>Who is learning?</h1><div class="pgrid">${USERS.list.map(u=>`<button class="pcard${u.id===uid && force?" on":""}" data-u="${esc(u.id)}">${AV.svg(AV.get(u.id), "portrait")}<span>${esc(u.name)}</span></button>`).join("")}<button class="pcard add" id="whoAdd">${ic("plus")}<span>Add someone</span></button></div><div class="foot">Each of you has your own place, your own words and your own record.</div>${force?`<button class="btn quiet" id="whoBack" style="margin-top:18px">Back</button>`:""}`;
    o.hidden=false;
    o.querySelectorAll("[data-u]").forEach(b=>{ b.onclick=()=>{ try{ sessionStorage.setItem("frDIn.chosen","1"); }catch(e){} if(b.dataset.u===uid){ o.hidden=true; afterWho(); return; } switchUser(b.dataset.u); }; });
    $("whoAdd").onclick=()=>ask({title:"Add someone", label:"Their first name", ok:"Add", value:""}, v=>{ const nm=cleanName(v||""); if(!nm) return "Type a name."; try{ sessionStorage.setItem("frDIn.chosen","1"); }catch(e){} return addUser(nm); });
    const bk=$("whoBack"); if(bk) bk.onclick=()=>{ o.hidden=true; };
    return true; }

  /* ---- a small sheet that asks one thing (a name) ---- */
  function ask(o, done){ const sh=$("sheet"); sh.innerHTML=`<div class="sh" role="dialog" aria-label="${esc(o.title)}"><h2>${esc(o.title)}</h2><label for="askIn">${esc(o.label)}</label><input id="askIn" type="text" maxlength="30" autocomplete="off" autocapitalize="words" autocorrect="off" spellcheck="false" value="${esc(o.value||"")}"><div class="msg" id="askMsg"></div><div class="two"><button class="btn quiet" id="askNo">Cancel</button><button class="btn" id="askOk">${esc(o.ok)}</button></div></div>`;
    sh.hidden=false; const inp=$("askIn"); setTimeout(()=>inp.focus(), 60);
    const close=()=>sheetClose(sh);
    $("askNo").onclick=close; sh.onclick=e=>{ if(e.target===sh) close(); };
    const go=()=>{ const m=done(inp.value); if(m){ $("askMsg").textContent=m; } else close(); };
    $("askOk").onclick=go; inp.addEventListener("keydown", e=>{ if(e.key==="Enter") go(); }); }
  function info(title, html){ const sh=$("sheet"); sh.innerHTML=`<div class="sh" role="dialog" aria-label="${esc(title)}"><h2>${esc(title)}</h2><div class="sh-body">${html}</div><button class="btn${/class="btn/.test(html)?" quiet":""}" id="infoOk">Close</button></div>`;
    sh.hidden=false; const close=()=>sheetClose(sh); $("infoOk").onclick=close; sh.onclick=e=>{ if(e.target===sh) close(); }; }

  /* ---- the avatar maker: built from the picture library's own lists (PICS.avatarOptions), so options can be added without touching this ---- */
  const FIELDS = { body:{label:"Body", vals:["m","f"]}, age:{label:"Age", vals:["c","t","a","o"], names:{c:"Child", t:"Teen", a:"Adult", o:"Older"}}, girth:{label:"Build", n:4}, skin:{label:"Skin", opt:"skin"}, face:{label:"Face", n:5}, eyes:{label:"Eyes", opt:"eyes"},
    freckles:{label:"Freckles", n:2}, hair:{label:"Hair", opt:"hair"}, hairc:{label:"Hair colour", opt:"hairc"}, beard:{label:"Beard", n:2}, glasses:{label:"Glasses", n:2}, head:{label:"Headscarf", n:2}, scarf:{label:"Scarf colour", opt:"top"},
    top:{label:"Jumper", opt:"top"}, legs:{label:"Trousers", opt:"legs"} };
  const CATS = [["You",["body","age","girth"]],["Skin",["skin"]],["Face",["face","eyes","freckles"]],["Hair",["hair","hairc","beard"]],["Glasses",["glasses","head","scarf"]],["Clothes",["top","legs"]]];
  const valsOf = f=>{ const F=FIELDS[f]; if(F.vals) return F.vals; const n = F.opt && PICS.avatarOptions && Array.isArray(PICS.avatarOptions[F.opt]) ? PICS.avatarOptions[F.opt].length : (F.n||2); return Array.from({length:n},(_,i)=>i); };
  function maker(firstRun, done){ const o=$("maker"); if(!o || !AV.has()){ if(done) done(); return; }
    let spec; try{ spec=PICS.avatarParse(AV.get() || PICS.avatarString({})); }catch(e){ spec={}; } const hist=[]; let cat=3, step = firstRun ? 1 : 0;
    const starters=[["A man",{body:"m",age:"a"}],["A woman",{body:"f",age:"a",hair:6}],["A boy",{body:"m",age:"c"}],["A girl",{body:"f",age:"c",hair:4}]];
    const set=(f,v)=>{ hist.push(Object.assign({}, spec)); spec=Object.assign({}, spec, typeof f==="object" ? f : {[f]:v}); if(["c","t"].includes(typeof f==="object" ? f.age : f==="age" && v)) spec.beard=0; draw(); tick(); };
    const finish=()=>{ AV.set(PICS.avatarString(spec)); S.learnerGender = spec.body==="f" ? "f" : "m"; save(); G.makerOffer=false; store(); o.hidden=true; try{ trace("the learner's figure made"); }catch(e){} if(done) done(); else home(); };
    function draw(){
      if(step===1){ o.innerHTML=`<div class="mk-step">Step 1 of 3</div><h1>Who will you be?</h1><div class="lede">Pick the one nearest to you. You will make it yours next.</div><div class="big4">${starters.map(([lab,sp],i)=>`<button class="pcard" data-s="${i}">${AV.svg(Object.assign({}, spec, sp), "standing")}<span>${lab}</span></button>`).join("")}</div>`;
        o.querySelectorAll("[data-s]").forEach(b=>{ b.onclick=()=>{ spec=Object.assign({}, spec, starters[+b.dataset.s][1]); step = spec.age==="c" ? 4 : 2; draw(); }; }); return; }
      if(step===4){ const kids=[["A child",{age:"c"}],["A teen",{age:"t"}]];
        o.innerHTML=`<div class="mk-step">Step 2 of 3</div><h1>Nearer to you?</h1><div class="lede">You can change everything afterwards.</div><div class="big4">${kids.map(([lab,sp],i)=>`<button class="pcard" data-s="${i}">${AV.svg(Object.assign({}, spec, sp), "standing")}<span>${lab}</span></button>`).join("")}</div>`;
        o.querySelectorAll("[data-s]").forEach(b=>{ b.onclick=()=>{ spec=Object.assign({}, spec, kids[+b.dataset.s][1]); step=3; draw(); }; }); return; }
      if(step===2){ const olds=[["Younger",{age:"a"}],["Older",{age:"o",hairc:7}],["White hair",{age:"o",hairc:8}],["With glasses",{age:"o",hairc:7,glasses:1}]];
        o.innerHTML=`<div class="mk-step">Step 2 of 3</div><h1>Nearer to you?</h1><div class="lede">You can change everything afterwards.</div><div class="big4">${olds.map(([lab,sp],i)=>`<button class="pcard" data-s="${i}">${AV.svg(Object.assign({}, spec, sp), "portrait")}<span>${lab}</span></button>`).join("")}</div>`;
        o.querySelectorAll("[data-s]").forEach(b=>{ b.onclick=()=>{ spec=Object.assign({}, spec, olds[+b.dataset.s][1]); step=3; draw(); }; }); return; }
      if(step===3){ o.innerHTML=`<div class="mk-step">Step 3 of 3</div><h1>Your skin</h1><div class="lede">Then it is you: or go on and choose more.</div><div class="big4" style="grid-template-columns:repeat(3,1fr)">${valsOf("skin").map(v=>`<button class="pcard" style="height:150px" data-v="${v}" aria-label="Skin ${v}">${AV.svg(Object.assign({}, spec, {skin:v}), "portrait")}</button>`).join("")}</div>`;
        o.querySelectorAll("[data-v]").forEach(b=>{ b.onclick=()=>{ spec=Object.assign({}, spec, {skin:+b.dataset.v}); step=0; cat=3; draw(); }; }); return; }
      const [, fields]=CATS[cat];
      o.innerHTML=`<div class="mk-bar">${firstRun?"":`<button class="rb plain" id="mkBack" aria-label="Back">${ic("chev")}</button>`}<h2>This is you</h2><button class="rb" id="mkUndo" aria-label="Undo">${ic("undo")}</button><button class="rb" id="mkRnd" aria-label="Surprise me">${ic("shuffle")}</button></div>
        <div class="mk-stage">${AV.svg(spec, "portrait", "big")}<div class="mk-small"><div class="mini">${AV.svg(spec, {view:"doing", doing:"walk", still:true}, "s")}</div><div class="lab">You, in<br>the lessons</div><div class="mini">${AV.svg(spec, "standing", "s")}</div></div></div>
        <div class="mk-tabs">${CATS.map(([lab],i)=>`<button class="${i===cat?"on":""}" data-c="${i}">${lab}</button>`).join("")}</div>
        <div class="mk-tray">${fields.filter(f=>!(f==="beard" && (spec.body==="f" || spec.age==="c" || spec.age==="t")) && !(f==="scarf" && !spec.head) && !(f==="hairc" && spec.hair===3)).map(f=>`<div class="mk-lab">${FIELDS[f].label}</div><div class="opts">${valsOf(f).map(v=>`<button class="opt${f==="body"||f==="girth"||f==="legs"||f==="age"?" whole":""}${String(spec[f])===String(v)?" on":""}" data-f="${f}" data-v="${v}" aria-label="${FIELDS[f].label} ${FIELDS[f].names ? FIELDS[f].names[v] : v}">${AV.svg(Object.assign({}, spec, {[f]:v}), f==="body"||f==="girth"||f==="legs"||f==="age" ? "standing" : "portrait", "t")}${FIELDS[f].names ? `<span class="ol">${FIELDS[f].names[v]}</span>` : ""}</button>`).join("")}</div>`).join("")}</div>
        <div class="mk-foot"><button class="btn" id="mkDone">That's me</button></div>`;
      o.querySelectorAll("[data-c]").forEach(b=>{ b.onclick=()=>{ cat=+b.dataset.c; draw(); }; });
      o.querySelectorAll("[data-f]").forEach(b=>{ b.onclick=()=>{ const f=b.dataset.f, raw=b.dataset.v; set(f, FIELDS[f].vals ? raw : +raw); }; });
      $("mkUndo").onclick=()=>{ if(hist.length){ spec=hist.pop(); draw(); } };
      $("mkRnd").onclick=()=>{ const r={}; for(const f of ["skin","face","eyes","hair","hairc","top","legs","girth"]){ const vs=valsOf(f); r[f]=vs[Math.floor(Math.random()*vs.length)]; } set(r); };
      $("mkDone").onclick=finish; const bk=$("mkBack"); if(bk) bk.onclick=()=>{ o.hidden=true; if(done) done(); }; }
    o.hidden=false; draw(); }

  /* ---- the two moments of the day: "After ___ I do my first lesson." Never rewarded or penalised for the time. ---- */
  const ROUTINE = { first:["waking up","breakfast","my morning coffee","the school run","walking the dog","getting to work"], second:["lunch","getting home","supper","my evening walk","the evening news","the washing-up"] };
  function anchors(firstRun, done){ const o=$("anch"); const A=JSON.parse(JSON.stringify(G.anchors)); let goal=G.goal||2, other={first:false, second:false};
    const tstr=(t)=>hm(atToday(t)); const shift=(t,m)=>{ let [h,mi]=t.split(":").map(Number); let v=(h*60+mi+m+1440)%1440; return String(Math.floor(v/60)).padStart(2,"0")+":"+String(v%60).padStart(2,"0"); };
    const gapH=()=>{ const a=A.first.time.split(":").map(Number), b=A.second.time.split(":").map(Number); return ((b[0]*60+b[1])-(a[0]*60+a[1]))/60; };
    function block(k, label, icon){ const list=ROUTINE[k], cur=A[k].after, custom=!list.includes(cur);
      return `<section class="card anc ${k==="first"?"am":"pm"}"><div class="q"><div class="orb">${ic(icon)}</div><div>After <b>${esc(cur)}</b> I do my ${label} lesson.</div></div>
        <div class="chips">${list.map(w=>`<button class="ch${w===cur?" on":""}" data-k="${k}" data-w="${esc(w)}">${esc(w)}</button>`).join("")}<button class="ch${custom||other[k]?" on":""}" data-k="${k}" data-other="1">something else</button></div>
        ${custom||other[k] ? `<input class="otherIn" data-k="${k}" maxlength="28" placeholder="After …" value="${custom?esc(cur):""}" aria-label="After what?">` : ""}
        <div class="time"><span>About</span><button class="rb" data-k="${k}" data-m="-30" aria-label="Earlier">−</button><b class="num">${tstr(A[k].time)}</b><button class="rb" data-k="${k}" data-m="30" aria-label="Later">+</button></div></section>`; }
    function draw(){ const g=gapH();
      o.innerHTML=`${firstRun?`<div class="mk-step">Last step</div>`:`<div class="mk-bar" style="padding:0"><button class="rb plain" id="anBack" aria-label="Back">${ic("chev")}</button></div>`}<h1>Your two moments</h1>
        <div class="lede">Two short lessons a day, well apart, is how French sticks. Tie each one to something you already do.</div>
        ${block("first","first","sun")}${goal===2?block("second","second","moon"):""}
        ${goal===2 && g<RULES.SPACING_GAP_HOURS ? `<div class="hint">${ic("info")} These are close together. Lessons stick best ${RULES.SPACING_GAP_HOURS} hours or more apart.</div>` : ""}
        <div class="seg" role="group" aria-label="Lessons a day"><button class="${goal===2?"on":""}" data-g="2">Two a day</button><button class="${goal===1?"on":""}" data-g="1">One a day for now</button></div>
        <div class="spacer"></div><button class="btn" id="anOk">${firstRun?"That's my plan":"Done"}</button>`;
      o.querySelectorAll("[data-w]").forEach(b=>{ b.onclick=()=>{ tick(); A[b.dataset.k].after=b.dataset.w; other[b.dataset.k]=false; draw(); }; });
      o.querySelectorAll("[data-other]").forEach(b=>{ b.onclick=()=>{ tick(); other[b.dataset.k]=true; draw(); const i=o.querySelector(`.otherIn[data-k="${b.dataset.k}"]`); if(i) i.focus(); }; });
      o.querySelectorAll(".otherIn").forEach(i=>{ i.onchange=()=>{ const v=i.value.replace(/^after\s+/i,"").trim().slice(0,28); if(v){ A[i.dataset.k].after=v; draw(); } }; });
      o.querySelectorAll("[data-m]").forEach(b=>{ b.onclick=()=>{ tick(); A[b.dataset.k].time=shift(A[b.dataset.k].time, +b.dataset.m); draw(); }; });
      o.querySelectorAll("[data-g]").forEach(b=>{ b.onclick=()=>{ tick(); goal=+b.dataset.g; draw(); }; });
      const bk=$("anBack"); if(bk) bk.onclick=()=>{ o.hidden=true; if(done) done(); };
      $("anOk").onclick=()=>{ tick(); o.querySelectorAll(".otherIn").forEach(i=>{ const v=i.value.replace(/^after\s+/i,"").trim().slice(0,28); if(v) A[i.dataset.k].after=v; });
        A.set=true; G.anchors=A; G.goal=goal; store(); o.hidden=true; try{ trace("the two moments: after "+A.first.after+" ("+A.first.time+"), after "+A.second.after+" ("+A.second.time+"); "+goal+" a day"); }catch(e){} if(done) done(); else home(); }; }
    o.hidden=false; draw(); o.scrollTop=0; }

  /* ---- the microphone: a primer before the browser's own question, and plain help when it is refused (the lesson never runs on
     to a green frame that cannot hear: the page's own fallback is the tester's typing box, which a learner never sees) ---- */
  const MIC = { state:"unknown", ok:false,
    init(){ try{ navigator.permissions.query({name:"microphone"}).then(p=>{ MIC.state=p.state; p.onchange=()=>{ MIC.state=p.state; }; }).catch(()=>{}); }catch(e){} },
    primerNeeded(){ return !S.settings.manual && !MIC.ok && MIC.state!=="granted" && !(MIC.state==="unknown" && UI.pref.micAsked) && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); },
    async ask(){ try{ const s=await navigator.mediaDevices.getUserMedia({audio:true}); s.getTracks().forEach(t=>t.stop()); MIC.ok=true; UI.pref.micAsked=true; UI.savePref(); try{ trace("microphone allowed (primer)"); }catch(e){} return "ok"; }
      catch(e){ UI.pref.micAsked=true; UI.savePref(); try{ trace("microphone refused (primer): "+(e.name||e.message)); }catch(x){} return e && e.name==="NotFoundError" ? "none" : "refused"; } },
    primer(){ const o=$("mic"), n=G.next+1, onPhone=S.settings.engine!=="google";
      o.innerHTML=`<div class="mic-art" aria-hidden="true"><div class="ph"><i></i><div class="tab">${ic("mic")}<span class="bars"><b></b><b></b><b></b><b></b><b></b></span></div></div></div>
        <h1>Marie needs to hear you</h1><div class="lede">In every lesson you answer out loud.</div>
        <div class="card facts"><div>${ic("mic")}<p>The app listens only while the border is green, to hear your answer.</p></div>
          ${onPhone?`<div>${ic("lock")}<p>Your voice is heard on this phone. It is not sent anywhere.</p></div>`:""}
          <div>${ic("phone")}<p>Your phone will now ask about the microphone. Choose <b>Allow</b>.</p></div></div>
        <div class="spacer"></div><button class="btn" id="micAllow">${ic("mic")} Allow the microphone</button><button class="btn quiet" id="micLater">Not now</button>`;
      o.hidden=false; o.scrollTop=0;
      $("micLater").onclick=()=>{ tick(); o.hidden=true; };
      $("micAllow").onclick=async()=>{ tick(); const r=await MIC.ask(); if(r==="ok") MIC.ready(n); else MIC.help(false, r); }; },
    ready(n){ const o=$("mic"); o.innerHTML=`<div class="okmark">${ic("check")}</div><h1>Thank you</h1><div class="lede center">Marie can hear you now.</div><div class="spacer"></div><button class="btn" id="micGo">${ic("play")} Start lesson ${n}</button>`;
      o.hidden=false; $("micGo").onclick=()=>{ o.hidden=true; $("playBtn").click(); }; },
    help(inLesson, why){ const o=$("mic"), denied = why!=="none";
      o.innerHTML=`<div class="offmark">${ic("micoff")}</div><h1>${denied?"The microphone is off":"No microphone found"}</h1>
        <div class="lede">${denied ? "Flawless French needs to hear your answers, and your phone is not letting it use the microphone." : "Flawless French needs to hear your answers, and no microphone could be started. Another app may be using it."}</div>
        ${denied ? `<div class="card steps"><b>To switch it on</b><ol><li>Tap the small icon at the left of the web address (a lock, or two sliders).</li><li>Tap <b>Permissions</b>, then <b>Microphone</b>.</li><li>Choose <b>Allow</b>, then come back here.</li></ol><small>In the installed app: your phone's Settings, then Apps, then Chrome, then Permissions, then Microphone: Allow.</small></div>`
          : `<div class="card steps"><ol><li>Close any other app that is recording or on a call.</li><li>Then tap Try again.</li></ol></div>`}
        <div class="spacer"></div><button class="btn" id="micRetry">Try again</button><button class="btn quiet" id="micLater">${inLesson?"Back to today":"Not now"}</button>`;
      o.hidden=false; o.scrollTop=0;
      $("micLater").onclick=()=>{ tick(); if(inLesson) location.reload(); else o.hidden=true; };
      $("micRetry").onclick=async()=>{ tick(); if(inLesson){ location.reload(); return; } const r=await MIC.ask(); if(r==="ok") MIC.ready(G.next+1); else MIC.help(false, r); }; } };
  { const lm0=window.listenManual;      // the page's last resort when the microphone cannot be opened: for a learner, the help screen over it
    if(typeof lm0==="function") window.listenManual=function(){ try{ if(!S.settings.manual && document.body.classList.contains("inLesson")){ try{ trace("the learner is shown how to switch the microphone on"); }catch(e){} MIC.help(true, MIC.state==="denied" || MIC.state==="unknown" ? "refused" : "none"); } }catch(e){} return lm0.apply(this, arguments); }; }

  /* ---- welcome back (R-151): after days away a greeting, and the step back the table gives, told as a warm-up ---- */
  function away(){ if(!G.run.last) return null; const today=dayOf(), gap=daysBetween(G.run.last, today)-1; return gap; }
  function stepFor(days){ for(const [upto,n] of RULES.AWAY_STEPS) if(days<=upto) return n; return 0; }
  function welcome(){ const days=away(); if(days==null || days<RULES.RETURN_AFTER_DAYS || G.awaySeen===G.run.last) return false;
    G.awaySeen=G.run.last; let to=null;
    if(RULES.AWAY_ON){ const n=stepFor(days); if(n>0){ const from=G.next; to = G.furthest<RULES.AWAY_MIN_DONE ? 0 : Math.max(0, from-n);
        if(to<from){ G.warmTo=from; G.next=to; G.why="warm"; try{ trace("welcome back after "+days+" days away: a warm-up from Lesson "+(to+1)+" back to Lesson "+(from+1)); }catch(e){} } else to=null; } }
    store(); const o=$("back"), name=esc(S.learnerName||"");
    o.innerHTML=`<div class="wb-art" aria-hidden="true">${AV.svg(AV.get(), "portrait", "av")}</div><h1>Welcome back${name?", "+name:""}.</h1><div class="sub">Let's warm up.</div>
      <div class="card nextc warm"><div class="orb">${ic("sun")}</div><div>${to!=null ? `<b>Starting with Lesson ${to+1}</b><p>You know it already. It brings everything back, and then we go on to Lesson ${G.warmTo+1}. Everything you have earned stays yours.</p>` : `<b>Lesson ${G.next+1} is ready</b><p>Everything you have earned stays yours.</p>`}</div></div>
      <div class="spacer"></div><button class="btn" id="wbGo">Let's start</button>`;
    o.hidden=false; $("wbGo").onclick=()=>{ tick(); o.hidden=true; home(); }; return true; }

  /* ---- you: the figure, the record, milestones, and the settings (nothing here changes the teaching) ---- */
  const sw = (id, on, label, sub, icon)=>`<button class="grow" id="${id}" role="switch" aria-checked="${on}"><div class="ic">${ic(icon)}</div><div class="l">${label}${sub?`<small>${sub}</small>`:""}</div><span class="sw${on?" on":""}"><i></i></span></button>`;
  const row = (id, label, sub, icon, val="")=>`<button class="grow" id="${id}"><div class="ic">${ic(icon)}</div><div class="l">${label}${sub?`<small>${sub}</small>`:""}</div><div class="v">${val}${ic("chev")}</div></button>`;
  function you(){ const o=$("you"); if(!o) return; const own=ownedCards().length, st=stageLine(Math.max(1, G.furthest)), bs=RULES.BADGES.filter(n=>G.badges[n]), nextB=RULES.BADGES.find(n=>!G.badges[n]), tz=UI.pref.text||1, A=G.anchors;
    o.innerHTML=`<div class="tabhead"><h1>You</h1></div>
      <button class="card me" id="youAv"><div class="face">${avOut("portrait", "t")}</div><div class="l"><b>${esc(S.learnerName||"")}</b><small>Change how you look ${ic("chev")}</small></div></button>
      <div class="card stats"><div>${MV.num("points", G.points)}<small>points</small></div><div>${MV.num("perfect", perfectCount())}<small>perfect lesson${perfectCount()===1?"":"s"}</small></div><div>${MV.num("words", own)}<small>words</small></div><div>${MV.num("days", G.daysLearned)}<small>days learned</small></div></div>
      <button class="card rankc" id="youRank">${rankEmblem(G.rank||0, "emb m")}<div class="l"><small>Your rank</small><b>${esc(rankName(G.rank||0))}</b><span>${(G.rank||0)<RULES.RANKS.length ? `<b class="num">${(RULES.RANKS[G.rank||0]-G.points).toLocaleString("en-GB")}</b> points to ${esc(rankName((G.rank||0)+1))}` : "The highest rank"}</span></div><div class="wtok">${tokenIcon()}${MV.num("tokY", G.tokens||0)}<small>Wardrobe</small></div></button>
      ${levelCard(true)}
      <h3 class="gh">Badges</h3><div class="miles">${bs.map(n=>`<div class="ms">${badgeSvg(n)}<span>${badgeName(n)}</span></div>`).join("")}${nextB ? `<div class="ms next">${badgeSvg(nextB)}<span>${perfectCount()} of ${nextB} perfect lessons</span></div>` : ""}</div>
      ${st ? `<div class="sline">${st.text} lessons · best run ${G.bestRun} day${G.bestRun===1?"":"s"}</div>` : ""}
      <h3 class="gh">Your two moments</h3><div class="card grp">${row("setA1","First lesson","After "+esc(A.first.after),"sun",`<span class="num">${hm(atToday(A.first.time))}</span>`)}${G.goal!==1?row("setA2","Second lesson","After "+esc(A.second.after),"moon",`<span class="num">${hm(atToday(A.second.time))}</span>`):row("setA2","Lessons a day","One for now","moon","")}</div>
      <h3 class="gh">Sound and touch</h3><div class="card grp">${sw("setBead", UI.pref.beadSound!==false, "Sound for right answers", "One soft note for each right answer. Never over Marie.", "speaker")}${sw("setSound", !!UI.pref.sound, "Other sounds", "Cards turning up. Marie's voice is always on.", "speaker")}${sw("setVibe", !!UI.pref.haptics, "Vibration", "A light tap when you press. Never while you speak.", "vibe")}</div>
      <h3 class="gh">Seeing</h3><div class="card grp"><div class="grow"><div class="ic">${ic("text")}</div><div class="l">Text size</div></div><div class="seg size" role="group" aria-label="Text size">${[1,2,3].map(k=>`<button class="${tz===k?"on":""}" data-tz="${k}" aria-label="Text size ${k}"><span style="font-size:${[16,20,24][k-1]}px">A</span></button>`).join("")}</div>${sw("setMotion", UI.pref.motion==="less", "Less movement", "Celebrations become still. The lessons do not change.", "eye")}</div>
      <h3 class="gh">You and this phone</h3><div class="card grp">${row("setName","Your first name","",  "you", esc(S.learnerName||""))}${row("youWho","Who is learning?", USERS.list.length>1 ? USERS.list.length+" learners on this phone" : "Add someone", "you")}</div>
      <h3 class="gh">Help improve the course</h3><div class="card grp">${row("setRun","Save the run file","Everything you said and tapped, for the course's makers.","file")}${row("setIntro","See the introduction again","How a lesson works, shown.","play")}</div>
      <h3 class="gh">The course</h3><div class="card grp">${row("setAbout","About Flawless French", "Version "+esc(APP_VERSION),"info")}${row("youTester","For testers","","tool")}</div>
      <div class="card grp">${row("youRemove","Remove "+esc(currentUser().name)+" from this phone","Asked twice. Everything of this learner is deleted.","redo")}</div>`;
    o.hidden=false; MV.count(o);
    $("youAv").onclick=()=>maker(false, ()=>you()); $("youRank").onclick=()=>{ tick(); wardrobe(()=>you()); };
    $("youWho").onclick=()=>who(true);
    $("setA1").onclick=$("setA2").onclick=()=>anchors(false, ()=>you());
    const flip=(id, f)=>{ $(id).onclick=()=>{ f(); UI.savePref(); tick(); const b=$(id), on=b.getAttribute("aria-checked")!=="true"; b.setAttribute("aria-checked", on); b.querySelector(".sw").classList.toggle("on", on); }; };
    flip("setSound", ()=>{ UI.pref.sound=!UI.pref.sound; }); flip("setBead", ()=>{ UI.pref.beadSound = UI.pref.beadSound===false; if(UI.pref.beadSound){ beadCtx(); setTimeout(beadSound, 120); } }); flip("setVibe", ()=>{ UI.pref.haptics=!UI.pref.haptics; }); flip("setMotion", ()=>{ UI.pref.motion = UI.pref.motion==="less" ? "auto" : "less"; });
    o.querySelectorAll("[data-tz]").forEach(b=>{ b.onclick=()=>{ UI.pref.text=+b.dataset.tz; UI.savePref(); textSize(); tick(); you(); }; });
    $("setName").onclick=()=>ask({title:"Your first name", label:"Marie will call you by it.", ok:"Save", value:S.learnerName||""}, v=>{ const nm=cleanName(v||""); if(!nm) return "Type a name.";
      if(USERS.list.some(x=>x.id!==uid && x.name.toLowerCase()===nm.toLowerCase())) return "Someone on this phone is already called "+nm+".";
      const f=$("optName"); if(f){ f.value=nm; f.dispatchEvent(new Event("change")); } setTimeout(you, 0); return ""; });
    $("setRun").onclick=()=>{ tick(); const b=$("btnDownload"); if(b) b.click(); };
    $("setIntro").onclick=()=>{ tick(); if(!confirm("See how a lesson works again? It starts from the beginning of Lesson 1's first exercise.")) return; const b=$("btnIntro"); if(b) b.click(); };
    $("setAbout").onclick=()=>about();
    $("youRemove").onclick=()=>{ if(USERS.list.length<2){ alert("This is the only learner on this phone."); return; } if(!confirm("Remove "+currentUser().name+"? Their place, record and figure will be deleted.")) return; if(!confirm("Are you sure? This cannot be undone.")) return; try{ localStorage.removeItem(GK); localStorage.removeItem(AK(uid)); }catch(e){} const m=removeUser(uid); if(m) alert(m); };
    $("youTester").onclick=()=>{ o.hidden=true; $("panel").hidden=false; try{ renderPanel(); }catch(e){} }; }
  function about(){ info("About Flawless French", `<p><b>Flawless French</b> teaches French the way a good teacher does: Marie says, shows and asks; you answer out loud or tap a picture; every answer is heard, and a mistake is put right at once.</p>
      <p><b>How the course moves on.</b> When you are right the first time in ${RULES.PASS_MARK} answers out of a hundred or more, the next lesson opens. Below that, you do the lesson once more, and it feels easier. You can do any lesson you have done again, at any time.</p>
      <p><b>After a break.</b> If you have been away for some days, you start a few lessons back, so that it all comes back before you go on.</p>
      <p><b>Your voice</b> is listened to only while the border is green, and only to hear your answer.</p>
      <p class="small">Version ${esc(APP_VERSION)}. Type: Atkinson Hyperlegible Next and Fraunces, under the SIL Open Font Licence.</p>`); }
  function textSize(){ document.documentElement.dataset.text=String(UI.pref.text||1); }

  /* ---- offline and updates: a service worker keeps the app on the phone; a newer version on the site is offered, never forced in a lesson ---- */
  function offline(){ if(!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
    navigator.serviceWorker.register("sw.js").then(reg=>{ const check=()=>{ try{ reg.update(); }catch(e){} checkVersion(); };
      document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState==="visible") check(); }); setInterval(check, 30*60e3); }).catch(e=>{ try{ trace("service worker not registered: "+e.message); }catch(x){} }); }
  let newer="";
  function checkVersion(){ fetch("version.json", {cache:"no-store"}).then(r=>r.ok?r.json():null).then(v=>{ if(v && v.version && v.version!==APP_VERSION){ newer=v.version; offerUpdate(); } }).catch(()=>{}); }
  function offerUpdate(){ if(!newer || document.body.classList.contains("inLesson") || running) return; const t=$("upd"); t.innerHTML=`<div>${ic("redo")}<span><b>A new version is ready</b><small>Your place and record are kept.</small></span></div><button class="btn" id="updGo">Update</button>`; t.hidden=false;
    $("updGo").onclick=()=>{ tick(); location.reload(); }; }

  /* ---- a learner whose record is new: what the page's saved place already says (a phone carried over from the live app, or a tester's
     jump) is entered as passed, without figures, with the points the same rule gives; no run or streak is invented ---- */
  function seed(){ if(!fresh) return; let n=0; const at = S.detour && S.detour.back ? Math.max(S.lesson, S.detour.back.lesson) : S.lesson; /* a learner on a detour (migrate62) is at the place the detour goes back to */ LESSONS.forEach((L,i)=>{ if(allDone(i) || i<at){ let pts=0;
      for(const x of L.exercises){ const he=(S.exHadError||{})[x.id]; if(he===undefined) continue; G.ex[x.id]={g:!he, f:he?"e":"p", n:1, carried:true}; if(!he) pts+=RULES.POINTS_PERFECT_FIRST; }
      if(lessonPerfect(L)){ G.lp[L.id]="carried"; pts+=RULES.POINTS_PERFECT_LESSON; }
      G.lessons[L.id]=[{date:"", x:null, y:null, passed:true, pts, carried:true}]; G.points+=pts; G.furthest=Math.max(G.furthest, i+1); n++; } });
    RULES.BADGES.forEach(b=>{ if(perfectCount()>=b) G.badges[b]="carried"; });
    if(n){ try{ trace("record started from the saved place: "+n+" lesson(s) entered as passed"); }catch(e){} }
    if(S.learnerGender && !AV.get() && AV.has()){ try{ AV.set(PICS.avatarString({body:S.learnerGender==="f"?"f":"m"})); G.makerOffer=true; }catch(e){} } }


  /* ---- motion and ease (the owner, brief 18): the shell never snaps. A screen arrives (rising, or pushed in from the right when it has a
     way back); when it goes, what is beneath settles back (so nothing lingers on screen after the code has hidden it); tabs slide the way
     they lie; lists come in one after another; numbers count; a sheet leaves as it came; a picture the finger chose grows into its sheet.
     Edge swipe and the phone's back button close what has a way back. Nothing of it inside a lesson; none of it with less movement. ---- */
  const MV = (()=>{ const KIND={done:"rise", lvl:"rise", back:"rise", mic:"rise", whoL:"fade", maker:"push", anch:"push", lessonV:"push", ward:"push"};
    const BACK={lessonV:"lvBack", ward:"wdBack", maker:"mkBack", anch:"anBack"};
    const play=(node, cls, ms)=>{ if(!node || lessMotion()) return; node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); clearTimeout(node["_mv"+cls]); node["_mv"+cls]=setTimeout(()=>node.classList.remove(cls), ms); };
    function stagger(root){ if(!root || lessMotion()) return; let i=0; for(const c of root.children){ if(c.classList.contains("donefoot") || c.classList.contains("btn") || c.classList.contains("spacer")) continue; c.style.setProperty("--i", Math.min(i++, 12)); } play(root, "mv-stag", 1200); }
    function beneath(){ const vis=[...document.querySelectorAll(".over:not([hidden])")]; if(vis.length) return vis.sort((a,b)=>(+getComputedStyle(a).zIndex||0)-(+getComputedStyle(b).zIndex||0)).pop(); return $("home"); }
    let pushed=0, ignorePop=0, popping=false;
    const hasBack=o=>o.id==="sheet" ? !!o.querySelector("#infoOk,#askNo") : BACK[o.id] && !!$(BACK[o.id]);
    function shown(o){ if(o.classList.contains("tabbed")) return; const k=KIND[o.id]||"fade"; play(o, "mv-"+k, 700); stagger(o);
      if(hasBack(o) && !document.body.classList.contains("inLesson")){ try{ history.pushState({ff:o.id}, ""); pushed++; }catch(e){} } }
    function gone(o){ if(o.classList.contains("tabbed")) return; play(beneath(), "mv-settle", 600);
      if(pushed>0 && !popping && (o.id==="sheet" || BACK[o.id])){ pushed--; ignorePop++; try{ history.back(); }catch(e){ ignorePop--; } } }
    const obs=new MutationObserver(ms=>{ for(const m of ms){ const o=m.target, now=o.hasAttribute("hidden"), was=m.oldValue!==null; if(now===was) continue; if(o.id==="sheet") continue; now ? gone(o) : shown(o); } });
    function watch(){ document.querySelectorAll(".over").forEach(o=>obs.observe(o, {attributes:true, attributeFilter:["hidden"], attributeOldValue:true}));
      const sh=$("sheet"); if(sh) new MutationObserver(ms=>{ for(const m of ms){ const now=sh.hasAttribute("hidden"), was=m.oldValue!==null; if(now===was) continue;
        if(now){ if(pushed>0 && !popping){ pushed--; ignorePop++; try{ history.back(); }catch(e){ ignorePop--; } } } else if(hasBack(sh) && !document.body.classList.contains("inLesson")){ try{ history.pushState({ff:"sheet"}, ""); pushed++; }catch(e){} } } }).observe(sh, {attributes:true, attributeFilter:["hidden"], attributeOldValue:true}); }
    // the phone's back button: closes the sheet, or the screen with a way back, never leaves the app from inside one
    window.addEventListener("popstate", ()=>{ if(ignorePop>0){ ignorePop--; return; } if(pushed<=0) return; pushed--;
      const sh=$("sheet"), b = sh && !sh.hidden ? sh.querySelector("#infoOk,#askNo") : (()=>{ const o=beneath(); return o && BACK[o.id] ? $(BACK[o.id]) : null; })();
      if(b){ popping=true; try{ b.click(); }finally{ popping=false; } } });
    // a swipe from the left edge takes the screen back with the finger; let go past a third (or quickly) and it goes
    let sw=null;
    document.addEventListener("touchstart", e=>{ const t=e.touches[0]; if(!t || t.clientX>26 || e.touches.length>1) return; const o=beneath(); if(!o || !BACK[o.id] || !$(BACK[o.id])) return;
      sw={o, x0:t.clientX, y0:t.clientY, t0:performance.now(), dx:0, on:false}; }, {passive:true});
    document.addEventListener("touchmove", e=>{ if(!sw) return; const t=e.touches[0], dx=t.clientX-sw.x0, dy=t.clientY-sw.y0;
      if(!sw.on){ if(Math.abs(dy)>Math.abs(dx) && Math.abs(dy)>8){ sw=null; return; } if(dx>8) sw.on=true; else return; }
      sw.dx=Math.max(0, dx); sw.o.style.transition="none"; sw.o.style.transform=`translateX(${sw.dx}px)`; sw.o.style.boxShadow="-12px 0 30px rgba(27,36,51,.18)"; }, {passive:true});
    document.addEventListener("touchend", ()=>{ if(!sw) return; const s=sw; sw=null; if(!s.on) return; const fast = s.dx/(performance.now()-s.t0)>0.5, go = s.dx>innerWidth/3 || (fast && s.dx>40);
      s.o.style.transition=`transform ${go?200:280}ms ${go?"cubic-bezier(.4,0,1,1)":"cubic-bezier(.22,1,.36,1)"}`; s.o.style.transform = go ? "translateX(100%)" : "";
      setTimeout(()=>{ s.o.style.transition=""; s.o.style.transform=""; s.o.style.boxShadow=""; if(go){ const b=$(BACK[s.o.id]); if(b) b.click(); } }, go?200:290); });
    // a picture the finger chose grows into the sheet it opened
    function grow(src, dst, ms=360){ if(!src || !dst || lessMotion()) return; const a=src.getBoundingClientRect(), b=dst.getBoundingClientRect(); if(!a.width || !b.width) return;
      dst.animate([{transformOrigin:"0 0", transform:`translate(${a.left-b.left}px,${a.top-b.top}px) scale(${a.width/b.width},${a.height/b.height})`}, {transformOrigin:"0 0", transform:"none"}], {duration:ms, easing:"cubic-bezier(.22,1,.36,1)"}); }
    // the lesson's card opens into the lesson: a card of paper grows from it to the whole screen and fades (300 ms; it covers nothing that teaches:
    // the stage is still being set while it fades, and it takes no time from the lesson)
    function openCard(card){ if(!card || lessMotion()) return; const a=card.getBoundingClientRect(); if(!a.width) return; const g=document.createElement("div"); g.className="mv-ghost";
      g.style.cssText=`left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px`; document.body.appendChild(g);
      const sx=innerWidth/a.width, sy=innerHeight/a.height; g.animate([{transform:"none", opacity:1, borderRadius:"16px"}, {transform:`translate(${-a.left}px,${-a.top}px) scale(${sx},${sy})`, opacity:0, borderRadius:"0px"}], {duration:320, easing:"cubic-bezier(.65,0,.35,1)", fill:"forwards"}).onfinish=()=>g.remove(); }
    // numbers count from what was shown last to what is true now
    function count(root){ if(!root) return; root.querySelectorAll("[data-count]").forEach(b=>{ const to=+b.dataset.count, from=+(b.dataset.from||0), fmt=x=>Math.round(x).toLocaleString("en-GB");
      if(lessMotion() || from===to){ b.textContent=fmt(to); return; } const t0=performance.now(), D=Math.min(1100, 500+Math.abs(to-from)*8), ease=x=>1-Math.pow(1-x,3);
      const step=t=>{ const k=ease(Math.min(1,(t-t0)/D)); b.textContent=fmt(from+(to-from)*k); if(k<1) requestAnimationFrame(step); }; b.textContent=fmt(from); requestAnimationFrame(step); }); }
    const num=(key, v, cls="num")=>{ const seen=(G.seenN||(G.seenN={})); const from = seen[key]!=null ? seen[key] : v; seen[key]=v; return `<b class="${cls}" data-count="${v}" data-from="${from}">${(lessMotion()?v:from).toLocaleString("en-GB")}</b>`; };
    return {watch, play, stagger, grow, openCard, count, num}; })();
  // a sheet leaves as it came (down and away), then is gone
  function sheetClose(sh){ if(!sh || sh.hidden) return; if(lessMotion()){ sh.hidden=true; sh.innerHTML=""; return; } if(sh.classList.contains("out")) return;
    sh.classList.add("out"); setTimeout(()=>{ sh.classList.remove("out"); sh.hidden=true; sh.innerHTML=""; }, 190); }

  /* ---- start ---- */
  for(const id of ["done","whoL","maker","you","wordsV","anch","mic","back","lessonV","lvl","ward"]) document.body.appendChild(el(`<div class="over${id==="you"||id==="wordsV"?" tabbed":""}" id="${id}" hidden lang="en"></div>`));
  document.body.appendChild(el(`<div id="sheet" hidden lang="en"></div>`)); document.body.appendChild(el(`<div id="upd" role="status" hidden lang="en"></div>`));
  function afterWho(){ if(!welcome()) home(); }
  function init(){ try{ window.SPLASH && SPLASH.progress(0.85, null); }catch(e){} textSize(); MV.watch(); if(G.replay){ try{ trace("an exercise done again was left before its end: the place is put back"); }catch(e){} restorePlace(); }
    if(G.again){ try{ trace("a lesson done again by choice was left before its end: the place is put back"); }catch(e){} restoreAgain(); } untrap(); seed(); rankSync(); syncNext(); store(); home(); MIC.init();
    // first run: the name is asked by the page; then, in place of the two pictograms, the learner makes his own figure, then his two moments
    const firstFigure=()=>{ if(S.learnerName && !S.learnerGender && AV.has()){ const g=$("gender"); if(g) g.hidden=true; maker(true, ()=>anchors(true)); } };
    firstFigure(); const wf=$("whoForm"); if(wf) wf.addEventListener("submit", ()=>setTimeout(firstFigure, 0));
    if(!who(false)) welcome();
    G.lastSeen=new Date().toISOString(); store();
    if(document.readyState==="complete") offline(); else window.addEventListener("load", offline);
    // the first screen is drawn (home, who is learning, the first run's name or the welcome back): the loading screen hands over once the faces are in
    try{ UI.fonts().then(()=>window.SPLASH && SPLASH.done()); }catch(e){ try{ SPLASH.done(); }catch(x){} } }
  return {RULES, get G(){ return G; }, rankOf, rankName, ringsNow, weekGoal, wardrobe, WARDROBE, TIERS, home, lessonDone, who, maker, you, words, anchors, score, init, AV, MIC, welcome, offerUpdate};
})();
window.SHELL = SHELL;      // the page's hooks look for it there
SHELL.init();
