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
    POINTS_EXERCISE: 10, POINTS_LESSON: 50, POINTS_SPACING: 100, POINTS_RETURN: 50,      // (work) an exercise pays when it is finished, so a lesson left half-way loses nothing
    REST_DAYS_MAX: 2, REST_DAY_EARNED_EVERY: 5,      // (work)
    RETURN_AFTER_DAYS: 2,             // (work) whole days with no lesson before the welcome back and its bonus
    AWAY_STEPS: [[3,0],[7,3],[14,5],[30,8],[1e9,12]],      // (owner R-151: the step back scales with the absence; these numbers are the working table) [days away up to, lessons back]
    AWAY_MIN_DONE: 3,                 // (work) fewer lessons passed than this: a step back starts at Lesson 1
    AWAY_ON: !/[?&]away=off/.test(location.search),
    DAY_STARTS_HOUR: 4,               // (work) a lesson at half past midnight belongs to the evening before
    LATE_HOUR: 23,                    // (work) a second lesson that could only start after this hour is "tomorrow"
    PACE_DEFAULT: [5.5, 12],          // (work) seconds a task, seconds an exercise, until the learner's own pace is known
    GATE_ON: !/[?&]gate=off/.test(location.search),
    LEARNER_FIGURE_ON: /[?&]learner=on/.test(location.search),      // (coordinator) the course's "you" drawn from the learner's own figure (PICS.setLearner): OFF until the picture library draws the close-ups from it too; ?learner=on to preview      // the tester's door: ?gate=off runs the lessons straight through (for scripted runs with errors)
  };
  const uid = USERS.current, GK="frDIn.g."+uid, AK=id=>"frDIn.a."+id;
  const blank = ()=>({v:1, points:0, lessons:{}, furthest:0, next:null, why:"", below:{}, days:{}, daysLearned:0, run:{len:0, last:""}, bestRun:0, rest:RULES.REST_DAYS_MAX, restEarnedAt:0,
    anchors:{first:{after:"breakfast", time:"08:00"}, second:{after:"supper", time:"19:00"}, set:false}, goal:2, bonusSaid:0, cur:null, lastSeen:"",
    lpts:{}, pace:[], milestones:{}, wordsAt:{}, warmTo:null, awaySeen:""});
  let G = blank(), fresh = true; try{ const raw=localStorage.getItem(GK); if(raw){ Object.assign(G, JSON.parse(raw)); fresh=false; } }catch(e){}
  G.anchors=Object.assign(blank().anchors, G.anchors||{}); for(const k of ["first","second"]) G.anchors[k]=Object.assign({}, blank().anchors[k], G.anchors[k]);
  for(const k of ["lpts","milestones","wordsAt"]) if(!G[k]) G[k]={}; if(!Array.isArray(G.pace)) G.pace=[];
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
  function cardPic(c){ try{ if(c.spec!=null){ const g=picture(c.spec); return `<svg viewBox="0 0 160 190" aria-hidden="true">${g.outerHTML}</svg>`; } }catch(e){}
    return `<svg viewBox="0 0 160 190" aria-hidden="true"><text x="80" y="108" text-anchor="middle" font-family="Atkinson Hyperlegible Next" font-weight="700" font-size="${c.fr.length>8?24:30}" fill="#1B2433">${esc(c.fr)}</text></svg>`; }
  let clipNow=null;
  function playClip(key, btn){ if(!key) return; try{ if(clipNow){ clipNow.pause(); } const a=new Audio("../audio/teacher/"+key+".mp3"); clipNow=a; if(btn){ btn.classList.add("playing"); a.onended=a.onerror=a.onpause=()=>btn.classList.remove("playing"); } a.play().catch(()=>{ if(btn) btn.classList.remove("playing"); }); }catch(e){} }
  const wcard = (c, extra="")=>`<button class="wcard${extra}" data-clip="${esc(c.clip||"")}" aria-label="${esc(c.fr)}: play">${cardPic(c)}<span class="sp">${ic("speaker")}</span></button>`;
  const wireCards = root=>root.querySelectorAll(".wcard").forEach(b=>{ b.onclick=()=>{ tick(); playClip(b.dataset.clip, b); }; });

  /* ---- which lesson is next (R-152, R-153, R-151). G.next: the lesson to do next (index); G.why: "" | "once" | "back" | "warm" ---- */
  function natural(){ return allDone(S.lesson) ? Math.min(S.lesson+1, last) : S.lesson; }
  function syncNext(){ if(G.next==null || G.next>last || (!allDone(S.lesson) && !(G.why==="warm" && G.next<S.lesson))) G.next=natural();
    G.furthest=Math.max(G.furthest||0, ...Object.keys(G.lessons).filter(k=>(G.lessons[k]||[]).some(r=>r.passed)).map(k=>LESSONS.findIndex(l=>l.id===k)+1).filter(n=>n>0 && n<=last+1));
    G.furthest=Math.max(G.furthest, Math.min(G.next, last)); }
  let pendingAgain=null;      // a done lesson the learner asked to do again (index)
  // the place as the shell last saw it: if the page's own place has been changed since by something else (the tester's jump, a scripted run),
  // that place stands and the rules start again from it
  let seen=""; const mark=()=>S.lesson+":"+allDone(S.lesson)+":"+S.ex, look=()=>{ seen=mark(); };
  // before the page's own start handler: the microphone's primer if it is needed; then the place where the rules say, only when that differs
  // from what the page would do by itself
  document.addEventListener("click", e=>{ const b=e.target && e.target.closest && e.target.closest("#playBtn"); if(!b || running || b.classList.contains("loading")) return;
    if(MIC.primerNeeded()){ e.stopPropagation(); e.preventDefault(); MIC.primer(); return; }
    if(mark()!==seen){ G.next=natural(); G.why=""; pendingAgain=null; look(); }
    const T = pendingAgain!=null ? pendingAgain : G.next; const kind = pendingAgain!=null ? "again" : (G.why||"");
    if(T!=null && T!==natural()){ S.lesson=T; S.ex=0; LESSONS[T].exercises.forEach(x=>{ delete S.finished[x.id]; });
      logEntry({result:"LESSON AGAIN: Lesson "+(T+1)+(kind==="again" ? " (the learner's own choice)" : kind==="back" ? " (a step back before Lesson "+(T+2)+")" : kind==="warm" ? " (a warm-up after days away)" : " (once more: below "+RULES.PASS_MARK+" %)"), heard:[]}); save(); }
    const Li=T!=null?T:natural(); G.cur={lesson:LESSONS[Li].id, t0:new Date().toISOString(), kind, fromStart: S.ex===0 && !LESSONS[Li].exercises.some(x=>S.finished[x.id])}; pendingAgain=null; store(); }, true);

  /* ---- the percentage, from the log (GAMIFICATION.md section 4) ---- */
  function score(lessonId, t0){ const es=(S.log||[]).filter(e=>e.lesson===lessonId && e.t>=t0); let X=0, F=0, E=0;
    for(const e of es){ const lead=/^lead/.test(e.phase||"");
      if(e.result==="correct" && !lead) X++;
      if(e.first===true && !e.delayed && !lead){ if(e.result==="correct") F++; else if(e.result==="ERROR" && (RULES.UNSURE_COUNTS || !e.unsure)) E++; } }
    const n=F+E; return {x:X, first:F, errors:E, y: n<10 ? 100 : Math.floor(100*F/n), scored:n}; }

  /* ---- points: an exercise pays when it is finished (the page's own end of an exercise), so nothing is lost by leaving a lesson half-way ---- */
  { const ed0=UI.exerciseDone; UI.exerciseDone=function(){ const r=ed0.apply(this, arguments); try{ const id=LESSONS[S.lesson].id; G.points+=RULES.POINTS_EXERCISE; G.lpts[id]=(G.lpts[id]||0)+RULES.POINTS_EXERCISE; store(); }catch(e){} return r; }; }

  /* ---- the learner's own pace: seconds a task, from lessons done start to end in one sitting ---- */
  const tasksOf = L=>L.exercises.reduce((a,e)=>a+e.parts.reduce((b,p)=>b+p.items.filter(it=>it.type==="task").length,0),0);
  function minutesFor(L){ const t=tasksOf(L), p=G.pace.slice(-5).sort((a,b)=>a-b), med=p.length ? p[Math.floor(p.length/2)] : null;
    const s = med ? t*med : t*RULES.PACE_DEFAULT[0]+L.exercises.length*RULES.PACE_DEFAULT[1]; return Math.max(3, Math.round(s/60)); }

  /* ---- milestones: real and countable; never announced beforehand ---- */
  const completions = ()=>Object.values(G.lessons).reduce((a,b)=>a+b.length,0);
  function fullWeek(){ const ks=Object.keys(G.days).filter(k=>G.days[k].full).sort(); let best=0, run=0, prev=""; for(const k of ks){ run = prev && daysBetween(prev,k)===1 ? run+1 : 1; prev=k; best=Math.max(best,run); } return best>=7; }
  const MILES = [
    ...[10,50,100,250,500,1000,2000].map(n=>({id:"L"+n, ok:()=>completions()>=n, what:`${n} lessons finished`})),
    ...[7,30,100,365].map(n=>({id:"D"+n, ok:()=>G.daysLearned>=n, what:`${n} days of learning`})),
    ...[7,30,60,100,365].map(n=>({id:"R"+n, ok:()=>G.run.len>=n, what:`${n} days in a row`})),
    {id:"W1", ok:fullWeek, what:"A week of full days: two lessons a day, seven days running"},
    ...(CW.stages||[]).map(s=>({id:"S"+s.id, ok:()=>G.furthest>=s.last, what:`Stage ${s.id} done`, stage:s})),
    ...[50,100,250,500,1000].map(n=>({id:"W"+n, ok:()=>ownedCards().length>=n, what:`${n} words of your own`})) ];
  function newMilestones(today){ const got=[]; for(const m of MILES) if(!G.milestones[m.id] && m.ok()){ G.milestones[m.id]=today; got.push(m); } return got; }

  /* ---- the end of a lesson: the record, the rules, the screen ---- */
  function lessonDone(){ const li=S.lesson, L=LESSONS[li], cur=G.cur && G.cur.lesson===L.id ? G.cur : {lesson:L.id, t0:"", kind:""};
    const sc=score(L.id, cur.t0), passed = !RULES.GATE_ON || sc.y>=RULES.PASS_MARK, now=new Date(), today=dayOf(now), firstPass = passed && li>=G.furthest;
    let why="";
    if(cur.kind==="again" && li<G.furthest){ /* a lesson already passed, done again by choice: it locks nothing and moves nothing */ }
    else if(passed){ G.below[L.id]=0; G.next=Math.min(li+1, last); G.furthest=Math.max(G.furthest, li+1); if(G.why==="warm" && G.warmTo!=null && G.next<G.warmTo) G.why="warm"; else { G.why=""; G.warmTo=null; } }
    else if((G.below[L.id]||0)>=RULES.REPEATS_BEFORE_STEP_BACK && li>0){ G.below[L.id]=0; G.next=Math.max(0, li-RULES.STEP_BACK_LESSONS); G.why=why="back"; }
    else { G.below[L.id]=(G.below[L.id]||0)+1; G.next=li; G.why=why="once"; }
    // points: fixed for the lesson (an error neither costs nor pays); the one bonus is for two lessons well apart; a small one for coming back
    const exPts = G.lpts[L.id] || 0; delete G.lpts[L.id];
    let pts=RULES.POINTS_LESSON, bonus=0, back=0;
    const d=G.days[today]||(G.days[today]={n:0, firstEnd:"", full:false});
    if(d.n===1 && !d.full && cur.t0 && (new Date(cur.t0)-new Date(d.firstEnd))>=RULES.SPACING_GAP_HOURS*3600e3){ d.full=true; bonus=RULES.POINTS_SPACING; }
    if(d.n===0){ d.firstEnd=now.toISOString(); d.am = now.getHours()<14;
      const gap = G.run.last ? daysBetween(G.run.last, today) : 0;
      if(!G.run.last) G.run.len=1;
      else if(gap===1) G.run.len++;
      else if(gap>1 && gap-1<=G.rest){ G.rest-=gap-1; G.run.len++; G.restUsed=today; }
      else if(gap>1) G.run.len=1;
      if(G.run.last && gap-1>=RULES.RETURN_AFTER_DAYS) back=RULES.POINTS_RETURN;
      G.run.last=today; G.daysLearned++; G.bestRun=Math.max(G.bestRun, G.run.len);
      if(G.daysLearned-G.restEarnedAt>=RULES.REST_DAY_EARNED_EVERY && G.rest<RULES.REST_DAYS_MAX){ G.rest++; G.restEarnedAt=G.daysLearned; } }
    else if(d.n===1 && !d.full){ d.soon=true; }
    d.n++; G.points+=pts+bonus+back;
    // the pace: only a lesson done from its start in one sitting (under an hour and a half)
    if(cur.fromStart && cur.t0){ const secs=(now-new Date(cur.t0))/1000, t=tasksOf(L); if(t>0 && secs>60 && secs<5400){ G.pace.push(+(secs/t).toFixed(2)); G.pace=G.pace.slice(-9); } }
    const owned = firstPass ? cardsOf(L.id) : []; if(firstPass && !G.wordsAt[L.id]) G.wordsAt[L.id]=today;
    const miles = newMilestones(today), shownMile = G.mileDay===today ? null : miles[0]||null; if(shownMile) G.mileDay=today;
    (G.lessons[L.id]=G.lessons[L.id]||[]).push({date:today, x:sc.x, y:sc.y, passed, pts:exPts+pts+bonus+back});
    G.cur=null; store(); look();
    try{ trace("lesson complete: Lesson "+(li+1)+": "+sc.x+" correct responses, "+sc.y+" % first time ("+sc.first+" of "+sc.scored+" scored); "+(passed?"passed":"below "+RULES.PASS_MARK+" %: "+why)+"; next: Lesson "+(G.next+1)); }catch(e){}
    showDone({li, sc, passed, why, pts:exPts+pts, bonus, back, soon: d.soon && d.n===2, owned, mile:shownMile, stageDone: firstPass && stageOf(li+1) && stageOf(li+1).last===li+1 ? stageOf(li+1) : null}); }
  function showDone(r){ const name=esc(S.learnerName||""), n=r.li+1, o=$("done"), first=completions()<=1;
    o.innerHTML = (r.passed ? `<svg class="seal" viewBox="0 0 56 70"><use href="#i-rosette"/><text x="28" y="31.5" text-anchor="middle" font-family="Fraunces" font-weight="600" font-size="${n>9?12:15}" fill="#fff" style="font-variation-settings:'SOFT' 100">${n}</text></svg><h1>Bravo${name?", "+name:""}!</h1><div class="sub">Lesson ${n} is done.</div>`
        : `<div class="sunmark">${ic("sun")}</div><h1>Well done${name?", "+name:""}.</h1><div class="sub">You finished Lesson ${n}.</div>`)
      + `<div class="card say">In this lesson you made <b class="first" data-n="${r.sc.x}">${r.sc.x}</b> correct responses and you were <b data-n="${r.sc.y}" data-pc="1">${r.sc.y}%</b> correct.${first?`<small>${r.sc.y}% of your answers were right the first time you were asked.</small>`:""}</div>`
      + (r.why==="once" ? `<div class="card nextc"><div class="orb">${ic("redo")}</div><div><b>Lesson ${n} once more</b><p>You just need a bit more practice before moving on. Next time we will do this lesson again, and it will feel easier.</p></div></div>`
        : r.why==="back" ? `<div class="card nextc"><div class="orb">${ic("redo")}</div><div><b>A warm-up first</b><p>You are nearly there. Next time we will start with Lesson ${G.next+1}, which you know, and then come back to Lesson ${n}. Everything you have earned stays yours.</p></div></div>` : "")
      + `<div class="tiles${r.bonus||r.back?" two":""}"><div class="tile pts"><div class="orb">${ic("star")}</div><div><div class="big">+<span data-n="${r.pts}">${r.pts}</span></div><small>points${r.passed?"":", yours to keep"}</small></div></div>`
      + (r.bonus ? `<div class="tile two"><div class="orb">${ic("moon")}</div><div><div class="big">+${r.bonus}</div><small>${G.bonusSaid++<3 ? "Your two lessons were well apart: that is how French sticks." : "a full day: two lessons, well apart"}</small></div></div>`
        : r.back ? `<div class="tile two back"><div class="orb">${ic("sun")}</div><div><div class="big">+${r.back}</div><small>welcome back</small></div></div>` : "") + `</div>`
      + (r.soon ? `<div class="line">Done. Your next lesson will stick better after a break.</div>` : "")
      + (r.passed ? stageBar(n) : "")
      + (r.stageDone && r.stageDone.canDo ? `<div class="card cando"><b>Stage ${r.stageDone.id} is done.</b><p>${esc(r.stageDone.canDo)}</p></div>` : "")
      + (r.owned.length ? `<div class="card nowyours"><div class="row"><b>Now yours</b><small>Tap to hear</small></div><div class="wrow">${r.owned.map((c,i)=>wcard(c, " turn").replace("<button", `<button style="--i:${i}"`)).join("")}</div></div>` : "")
      + (r.mile ? `<div class="card mile"><svg viewBox="0 0 56 70" aria-hidden="true"><use href="#i-rosette"/></svg><div><b>${esc(r.mile.what)}</b><small>A milestone of yours. It stays on You.</small></div></div>` : "")
      + `<div class="spacer"></div><button class="btn" id="doneBtn">Continue</button>`;
    store(); o.hidden=false; o.scrollTop=0; wireCards(o);
    $("doneBtn").onclick=()=>{ tick(); o.hidden=true; stopFete(); home(); };
    fete(o, r.passed); }
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

  /* ---- home: today's two moments, the week, the next lesson, the path ---- */
  const mini = spec=>{ try{ return `<div class="mini"><svg viewBox="0 0 160 190" aria-hidden="true">${picture(spec).outerHTML}</svg></div>`; }catch(e){ return ""; } };
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
    const alive = G.run.last && daysBetween(G.run.last, today)<=1+G.rest;
    const started = !allDone(S.lesson) && (S.ex>0 || !!S.finished[LESSONS[S.lesson].exercises[0].id]) && S.lesson===T;
    const wd=["M","T","W","T","F","S","S"], monday=new Date(now.getTime()-RULES.DAY_STARTS_HOUR*3600e3); monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
    let week=""; for(let k=0;k<7;k++){ const dt=new Date(monday); dt.setDate(monday.getDate()+k); const key=dayOf(new Date(dt.getTime()+RULES.DAY_STARTS_HOUR*3600e3+3600e3)), rec=G.days[key], isToday=key===today, future=key>today, two=G.goal!==1;
      week+=`<div class="day${isToday?" today":""}"><span>${wd[k]}</span><div class="pair">${rec ? (rec.full ? `<i class="dot s"></i><i class="dot m"></i>` : `<i class="dot ${rec.am===false?"m":"s"}"></i>`+(isToday&&two&&rec.n<2?`<i class="dot o"></i>`:"")) : (future||isToday ? `<i class="dot o"></i>`+(two?`<i class="dot o"></i>`:"") : "")}</div></div>`; }
    const sl=slots(d, now), two=G.goal!==1;
    const eyebrow = G.why==="once" ? `<div class="eyebrow sun">${ic("redo")} Once more</div>` : G.why==="back" || G.why==="warm" ? `<div class="eyebrow sun">${ic("redo")} A warm-up</div>` : d.n>=1 ? `<div class="eyebrow moon">${ic("moon")} ${two?"Your second lesson today":"Another lesson"}</div>` : `<div class="eyebrow">${ic("sun")} Today's lesson</div>`;
    const L=LESSONS[T], mins=minutesFor(L), st=stageLine(Math.min(G.furthest+1, LESSONS.length));
    const restLine = G.restUsed===today ? `<div class="life">Yesterday was a rest day. Your run continues.</div>` : "";
    h.innerHTML=`<div class="h-top"><div class="h-hello">${greet},<b>${esc(S.learnerName||"")}</b></div>${G.daysLearned ? `<div class="h-run"><svg viewBox="0 0 56 70"><use href="#i-rosette"/></svg><div>${alive ? `<span class="n">${G.run.len}</span><small>${G.run.len===1?"day":"days in a row"}</small>` : `<span class="n">${G.daysLearned}</span><small>days learned</small>`}</div></div>`:""}</div>
      <section class="card rhythm" aria-label="Today"><div class="slots${two?"":" one"}">
        <div class="slot am${d.n===0?" next":""}"><div class="orb">${ic("sun")}</div><div><div class="k">After ${esc(G.anchors.first.after)}</div><div class="v">${sl.one}</div></div></div>
        ${two?`<div class="slot pm${d.n===1&&!sl.twoTomorrow?" next":""}"><div class="orb">${ic("moon")}</div><div><div class="k">After ${esc(G.anchors.second.after)}</div><div class="v">${sl.two}</div></div></div>`:""}</div>
        <div class="week">${week}</div>${G.daysLearned ? `<div class="life">${G.daysLearned} day${G.daysLearned>1?"s":""} learned · best run ${G.bestRun} day${G.bestRun>1?"s":""}</div>`:""}${restLine}
        ${G.anchors.set ? "" : `<button class="setmoments" id="setMoments">${ic("sun")} Choose your two moments ${ic("chev")}</button>`}</section>
      ${G.makerOffer && AV.has() ? `<button class="card offer" id="offerMaker"><div class="ic">${AV.svg(AV.get(), "portrait", "t").replace('viewBox="0 0 160 190"','viewBox="30 30 100 100"')}</div><div class="l">Make your figure look like you<small>Face, hair, glasses, clothes: it is you in every picture.</small></div>${ic("chev")}</button>` : ""}
      <section class="card hero"><div class="headrow"><div>${eyebrow}<h1>Lesson ${n}</h1></div><div class="minis">${newPics(T).slice(0,3).map(mini).join("")}</div></div>
        <div class="meta">${started ? "Carry on from where you stopped." : L.exercises.length+" exercises · about "+mins+" minutes"}</div>${G.why==="once" ? `<div class="meta">A bit more practice, then Lesson ${n+1}.</div>` : G.why==="back" ? `<div class="meta">A warm-up, then Lesson ${n+1}.</div>` : G.why==="warm" && G.warmTo!=null ? `<div class="meta">Warming up, then on to Lesson ${G.warmTo+1}.</div>` : ""}
        <div id="heroSlot"></div></section>
      <div class="pathhead"><h2>Your path</h2><span class="meta">${st ? st.text : G.furthest+" done"}</span></div><div class="path">${pathRows(T, st)}</div>`;
    const slot=$("heroSlot"), how=$("howtoBox"), btn=$("playBtn"); slot.appendChild(how); slot.appendChild(btn); slot.style.display="grid"; slot.style.gap="11px";
    const lab=btn.querySelector(".ready"); if(lab && !play.classList.contains("afterDemo")) lab.textContent=(started?"Carry on with lesson ":"Start lesson ")+n;
    const sm=$("setMoments"); if(sm) sm.onclick=()=>{ tick(); anchors(false); };
    const om=$("offerMaker"); if(om) om.onclick=()=>{ tick(); G.makerOffer=false; store(); maker(false, ()=>home()); };
    h.querySelectorAll("[data-again]").forEach(b=>{ b.onclick=()=>{ pendingAgain=+b.dataset.again; tick(); const lb=btn.querySelector(".ready"); if(lb) lb.textContent="Start lesson "+(pendingAgain+1)+" again"; h.scrollTo({top:0, behavior:"smooth"}); h.querySelector(".hero h1").textContent="Lesson "+(pendingAgain+1); }; }); }
  function pathRows(T, st){ const upto = st ? st.s.last : LESSONS.length, from = st ? st.s.first-1 : 0; let out="";
    for(let i=from;i<upto;i++){ const Lk=LESSONS[i], recs=Lk ? (G.lessons[Lk.id]||[]) : [], pass=i<G.furthest, bestRec=recs.filter(r=>r.passed).slice(-1)[0];
      const cls = i===T ? (G.why ? "once" : "now") : pass ? "done" : "later";
      out+=`<div class="step ${cls}"><div class="node">${pass && i!==T ? ic("check") : i+1}</div><div class="card lcard"><div class="row"><span class="t">Lesson ${i+1}</span>${i===T && G.why ? `<span class="chip">${G.why==="once"?"Once more":"A warm-up"}</span>` : pass && i!==T && Lk ? `<button class="again" data-again="${i}">Do it again ${ic("chev")}</button>` : ""}</div>${pass && bestRec && bestRec.x!=null ? `<div class="pct">${bestRec.x} right · ${bestRec.y}%</div>`:""}<div class="minis">${(Lk && i<=Math.max(T,G.furthest) ? newPics(i).map(mini).join("") : `<div class="mini back"></div>`.repeat(4))}</div></div></div>`; }
    return out; }

  /* ---- the three places at the foot: Today, Words, You ---- */
  function tab(which){ tick(); for(const [id,v] of [["tabToday","today"],["tabWords","words"],["tabYou","you"]]){ const b=$(id); if(b) b.classList.toggle("on", v===which); }
    $("wordsV").hidden = which!=="words"; $("you").hidden = which!=="you";
    if(which==="words") words(); else if(which==="you") you(); else home(); }

  /* ---- words: every card the learner owns, with its picture and its sound ---- */
  function words(){ const o=$("wordsV"); const own=ownedCards(), byL={}; own.forEach(c=>{ (byL[c.lesson]=byL[c.lesson]||[]).push(c); });
    const ls=Object.keys(byL).map(Number).sort((a,b)=>b-a);
    o.innerHTML=`<div class="tabhead"><h1>Your words</h1></div>
      <div class="card owned"><div class="num big">${own.length}</div><div><b>${own.length===1?"French word is yours":"French words are yours"}</b><small>${own.length ? "Each came from a lesson you passed. They stay yours." : "Your first words arrive when you finish Lesson 1."}</small></div></div>
      ${ls.map(i=>`<h3 class="wl">From Lesson ${i+1}${G.wordsAt[LESSONS[i].id] ? `<small>${new Date(G.wordsAt[LESSONS[i].id]+"T12:00").toLocaleDateString([], {day:"numeric", month:"long"})}</small>` : ""}</h3><div class="wgrid">${byL[i].map(c=>wcard(c)).join("")}</div>`).join("")}
      ${own.length ? `<p class="foot">Tap a card to hear it. More come with every lesson.</p>` : ""}`;
    o.hidden=false; o.scrollTop=0; wireCards(o); }

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
    const close=()=>{ sh.hidden=true; sh.innerHTML=""; };
    $("askNo").onclick=close; sh.onclick=e=>{ if(e.target===sh) close(); };
    const go=()=>{ const m=done(inp.value); if(m){ $("askMsg").textContent=m; } else close(); };
    $("askOk").onclick=go; inp.addEventListener("keydown", e=>{ if(e.key==="Enter") go(); }); }
  function info(title, html){ const sh=$("sheet"); sh.innerHTML=`<div class="sh" role="dialog" aria-label="${esc(title)}"><h2>${esc(title)}</h2><div class="sh-body">${html}</div><button class="btn" id="infoOk">Close</button></div>`;
    sh.hidden=false; const close=()=>{ sh.hidden=true; sh.innerHTML=""; }; $("infoOk").onclick=close; sh.onclick=e=>{ if(e.target===sh) close(); }; }

  /* ---- the avatar maker: built from the picture library's own lists (PICS.avatarOptions), so options can be added without touching this ---- */
  const FIELDS = { body:{label:"Body", vals:["m","f"]}, age:{label:"Age", vals:["c","a","o"]}, girth:{label:"Build", n:4}, skin:{label:"Skin", opt:"skin"}, face:{label:"Face", n:5}, eyes:{label:"Eyes", opt:"eyes"},
    freckles:{label:"Freckles", n:2}, hair:{label:"Hair", opt:"hair"}, hairc:{label:"Hair colour", opt:"hairc"}, beard:{label:"Beard", n:2}, glasses:{label:"Glasses", n:2}, head:{label:"Headscarf", n:2}, scarf:{label:"Scarf colour", opt:"top"},
    top:{label:"Jumper", opt:"top"}, legs:{label:"Trousers", opt:"legs"} };
  const CATS = [["You",["body","age","girth"]],["Skin",["skin"]],["Face",["face","eyes","freckles"]],["Hair",["hair","hairc","beard"]],["Glasses",["glasses","head","scarf"]],["Clothes",["top","legs"]]];
  const valsOf = f=>{ const F=FIELDS[f]; if(F.vals) return F.vals; const n = F.opt && PICS.avatarOptions && Array.isArray(PICS.avatarOptions[F.opt]) ? PICS.avatarOptions[F.opt].length : (F.n||2); return Array.from({length:n},(_,i)=>i); };
  function maker(firstRun, done){ const o=$("maker"); if(!o || !AV.has()){ if(done) done(); return; }
    let spec; try{ spec=PICS.avatarParse(AV.get() || PICS.avatarString({})); }catch(e){ spec={}; } const hist=[]; let cat=3, step = firstRun ? 1 : 0;
    const starters=[["A man",{body:"m",age:"a"}],["A woman",{body:"f",age:"a",hair:6}],["A boy",{body:"m",age:"c"}],["A girl",{body:"f",age:"c",hair:4}]];
    const set=(f,v)=>{ hist.push(Object.assign({}, spec)); spec=Object.assign({}, spec, typeof f==="object" ? f : {[f]:v}); if((typeof f==="object" ? f.age : f==="age" && v)==="c") spec.beard=0; draw(); tick(); };
    const finish=()=>{ AV.set(PICS.avatarString(spec)); S.learnerGender = spec.body==="f" ? "f" : "m"; save(); G.makerOffer=false; store(); o.hidden=true; try{ trace("the learner's figure made"); }catch(e){} if(done) done(); else home(); };
    function draw(){
      if(step===1){ o.innerHTML=`<div class="mk-step">Step 1 of 3</div><h1>Who will you be?</h1><div class="lede">Pick the one nearest to you. You will make it yours next.</div><div class="big4">${starters.map(([lab,sp],i)=>`<button class="pcard" data-s="${i}">${AV.svg(Object.assign({}, spec, sp), "standing")}<span>${lab}</span></button>`).join("")}</div>`;
        o.querySelectorAll("[data-s]").forEach(b=>{ b.onclick=()=>{ spec=Object.assign({}, spec, starters[+b.dataset.s][1]); step = spec.age==="c" ? 3 : 2; draw(); }; }); return; }
      if(step===2){ const olds=[["Younger",{age:"a"}],["Older",{age:"o",hairc:7}],["White hair",{age:"o",hairc:8}],["With glasses",{age:"o",hairc:7,glasses:1}]];
        o.innerHTML=`<div class="mk-step">Step 2 of 3</div><h1>Nearer to you?</h1><div class="lede">You can change everything afterwards.</div><div class="big4">${olds.map(([lab,sp],i)=>`<button class="pcard" data-s="${i}">${AV.svg(Object.assign({}, spec, sp), "portrait")}<span>${lab}</span></button>`).join("")}</div>`;
        o.querySelectorAll("[data-s]").forEach(b=>{ b.onclick=()=>{ spec=Object.assign({}, spec, olds[+b.dataset.s][1]); step=3; draw(); }; }); return; }
      if(step===3){ o.innerHTML=`<div class="mk-step">Step 3 of 3</div><h1>Your skin</h1><div class="lede">Then it is you: or go on and choose more.</div><div class="big4" style="grid-template-columns:repeat(3,1fr)">${valsOf("skin").map(v=>`<button class="pcard" style="height:150px" data-v="${v}" aria-label="Skin ${v}">${AV.svg(Object.assign({}, spec, {skin:v}), "portrait")}</button>`).join("")}</div>`;
        o.querySelectorAll("[data-v]").forEach(b=>{ b.onclick=()=>{ spec=Object.assign({}, spec, {skin:+b.dataset.v}); step=0; cat=3; draw(); }; }); return; }
      const [, fields]=CATS[cat];
      o.innerHTML=`<div class="mk-bar">${firstRun?"":`<button class="rb plain" id="mkBack" aria-label="Back">${ic("chev")}</button>`}<h2>This is you</h2><button class="rb" id="mkUndo" aria-label="Undo">${ic("undo")}</button><button class="rb" id="mkRnd" aria-label="Surprise me">${ic("shuffle")}</button></div>
        <div class="mk-stage">${AV.svg(spec, "portrait", "big")}<div class="mk-small"><div class="mini">${AV.svg(spec, {view:"doing", doing:"walk", still:true}, "s")}</div><div class="lab">You, in<br>the lessons</div><div class="mini">${AV.svg(spec, "standing", "s")}</div></div></div>
        <div class="mk-tabs">${CATS.map(([lab],i)=>`<button class="${i===cat?"on":""}" data-c="${i}">${lab}</button>`).join("")}</div>
        <div class="mk-tray">${fields.filter(f=>!(f==="beard" && (spec.body==="f" || spec.age==="c")) && !(f==="scarf" && !spec.head) && !(f==="hairc" && spec.hair===3)).map(f=>`<div class="mk-lab">${FIELDS[f].label}</div><div class="opts">${valsOf(f).map(v=>`<button class="opt${f==="body"||f==="girth"||f==="legs"||f==="age"?" whole":""}${String(spec[f])===String(v)?" on":""}" data-f="${f}" data-v="${v}" aria-label="${FIELDS[f].label} ${v}">${AV.svg(Object.assign({}, spec, {[f]:v}), f==="body"||f==="girth"||f==="legs"||f==="age" ? "standing" : "portrait", "t")}</button>`).join("")}</div>`).join("")}</div>
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
        <div class="lede">${denied ? "Faultless French needs to hear your answers, and your phone is not letting it use the microphone." : "Faultless French needs to hear your answers, and no microphone could be started. Another app may be using it."}</div>
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
  function you(){ const o=$("you"); if(!o) return; const own=ownedCards().length, st=stageLine(Math.max(1, G.furthest)), ms=MILES.filter(m=>G.milestones[m.id]), tz=UI.pref.text||1, A=G.anchors;
    o.innerHTML=`<div class="tabhead"><h1>You</h1></div>
      <button class="card me" id="youAv"><div class="face">${AV.svg(AV.get(), "portrait", "t")}</div><div class="l"><b>${esc(S.learnerName||"")}</b><small>Change how you look ${ic("chev")}</small></div></button>
      <div class="card stats"><div><b class="num">${G.points}</b><small>points</small></div><div><b class="num">${own}</b><small>words</small></div><div><b class="num">${G.daysLearned}</b><small>days learned</small></div><div><b class="num">${G.bestRun}</b><small>best run</small></div></div>
      ${st ? `<div class="sline">${st.text} lessons</div>` : ""}
      ${ms.length ? `<h3 class="gh">Milestones</h3><div class="miles">${ms.map(m=>`<div class="ms"><svg viewBox="0 0 56 70" aria-hidden="true"><use href="#i-rosette"/></svg><span>${esc(m.what)}</span></div>`).join("")}</div>` : ""}
      <h3 class="gh">Your two moments</h3><div class="card grp">${row("setA1","First lesson","After "+esc(A.first.after),"sun",`<span class="num">${hm(atToday(A.first.time))}</span>`)}${G.goal!==1?row("setA2","Second lesson","After "+esc(A.second.after),"moon",`<span class="num">${hm(atToday(A.second.time))}</span>`):row("setA2","Lessons a day","One for now","moon","")}</div>
      <h3 class="gh">Sound and touch</h3><div class="card grp">${sw("setSound", !!UI.pref.sound, "Sounds", "The app's own small sounds. Marie's voice is always on.", "speaker")}${sw("setVibe", !!UI.pref.haptics, "Vibration", "A light tap when you press. Never while you speak.", "vibe")}</div>
      <h3 class="gh">Seeing</h3><div class="card grp"><div class="grow"><div class="ic">${ic("text")}</div><div class="l">Text size</div></div><div class="seg size" role="group" aria-label="Text size">${[1,2,3].map(k=>`<button class="${tz===k?"on":""}" data-tz="${k}" aria-label="Text size ${k}"><span style="font-size:${[16,20,24][k-1]}px">A</span></button>`).join("")}</div>${sw("setMotion", UI.pref.motion==="less", "Less movement", "Celebrations become still. The lessons do not change.", "eye")}</div>
      <h3 class="gh">You and this phone</h3><div class="card grp">${row("setName","Your first name","",  "you", esc(S.learnerName||""))}${row("youWho","Who is learning?", USERS.list.length>1 ? USERS.list.length+" learners on this phone" : "Add someone", "you")}</div>
      <h3 class="gh">Help improve the course</h3><div class="card grp">${row("setRun","Save the run file","Everything you said and tapped, for the course's makers.","file")}${row("setIntro","See the introduction again","How a lesson works, shown.","play")}</div>
      <h3 class="gh">The course</h3><div class="card grp">${row("setAbout","About Faultless French", "Version "+esc(APP_VERSION),"info")}${row("youTester","For testers","","tool")}</div>
      <div class="card grp">${row("youRemove","Remove "+esc(currentUser().name)+" from this phone","Asked twice. Everything of this learner is deleted.","redo")}</div>`;
    o.hidden=false;
    $("youAv").onclick=()=>maker(false, ()=>you());
    $("youWho").onclick=()=>who(true);
    $("setA1").onclick=$("setA2").onclick=()=>anchors(false, ()=>you());
    const flip=(id, f)=>{ $(id).onclick=()=>{ f(); UI.savePref(); tick(); you(); }; };
    flip("setSound", ()=>{ UI.pref.sound=!UI.pref.sound; }); flip("setVibe", ()=>{ UI.pref.haptics=!UI.pref.haptics; }); flip("setMotion", ()=>{ UI.pref.motion = UI.pref.motion==="less" ? "auto" : "less"; });
    o.querySelectorAll("[data-tz]").forEach(b=>{ b.onclick=()=>{ UI.pref.text=+b.dataset.tz; UI.savePref(); textSize(); tick(); you(); }; });
    $("setName").onclick=()=>ask({title:"Your first name", label:"Marie will call you by it.", ok:"Save", value:S.learnerName||""}, v=>{ const nm=cleanName(v||""); if(!nm) return "Type a name.";
      if(USERS.list.some(x=>x.id!==uid && x.name.toLowerCase()===nm.toLowerCase())) return "Someone on this phone is already called "+nm+".";
      const f=$("optName"); if(f){ f.value=nm; f.dispatchEvent(new Event("change")); } setTimeout(you, 0); return ""; });
    $("setRun").onclick=()=>{ tick(); const b=$("btnDownload"); if(b) b.click(); };
    $("setIntro").onclick=()=>{ tick(); if(!confirm("See how a lesson works again? It starts from the beginning of Lesson 1's first exercise.")) return; const b=$("btnIntro"); if(b) b.click(); };
    $("setAbout").onclick=()=>about();
    $("youRemove").onclick=()=>{ if(USERS.list.length<2){ alert("This is the only learner on this phone."); return; } if(!confirm("Remove "+currentUser().name+"? Their place, record and figure will be deleted.")) return; if(!confirm("Are you sure? This cannot be undone.")) return; try{ localStorage.removeItem(GK); localStorage.removeItem(AK(uid)); }catch(e){} const m=removeUser(uid); if(m) alert(m); };
    $("youTester").onclick=()=>{ o.hidden=true; $("panel").hidden=false; try{ renderPanel(); }catch(e){} }; }
  function about(){ info("About Faultless French", `<p><b>Faultless French</b> teaches French the way a good teacher does: Marie says, shows and asks; you answer out loud or tap a picture; every answer is heard, and a mistake is put right at once.</p>
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
  function seed(){ if(!fresh) return; let n=0; LESSONS.forEach((L,i)=>{ if(allDone(i) || i<S.lesson){ (G.lessons[L.id]=[{date:"", x:null, y:null, passed:true, pts:RULES.POINTS_EXERCISE*L.exercises.length+RULES.POINTS_LESSON, carried:true}]); G.points+=G.lessons[L.id][0].pts; G.furthest=Math.max(G.furthest, i+1); n++; } });
    if(n){ try{ trace("record started from the saved place: "+n+" lesson(s) entered as passed"); }catch(e){} }
    if(S.learnerGender && !AV.get() && AV.has()){ try{ AV.set(PICS.avatarString({body:S.learnerGender==="f"?"f":"m"})); G.makerOffer=true; }catch(e){} } }

  /* ---- start ---- */
  for(const id of ["done","whoL","maker","you","wordsV","anch","mic","back"]) document.body.appendChild(el(`<div class="over${id==="you"||id==="wordsV"?" tabbed":""}" id="${id}" hidden lang="en"></div>`));
  document.body.appendChild(el(`<div id="sheet" hidden lang="en"></div>`)); document.body.appendChild(el(`<div id="upd" role="status" hidden lang="en"></div>`));
  function afterWho(){ if(!welcome()) home(); }
  function init(){ textSize(); seed(); syncNext(); store(); home(); MIC.init();
    // first run: the name is asked by the page; then, in place of the two pictograms, the learner makes his own figure, then his two moments
    const firstFigure=()=>{ if(S.learnerName && !S.learnerGender && AV.has()){ const g=$("gender"); if(g) g.hidden=true; maker(true, ()=>anchors(true)); } };
    firstFigure(); const wf=$("whoForm"); if(wf) wf.addEventListener("submit", ()=>setTimeout(firstFigure, 0));
    if(!who(false)) welcome();
    G.lastSeen=new Date().toISOString(); store();
    if(document.readyState==="complete") offline(); else window.addEventListener("load", offline); }
  return {RULES, get G(){ return G; }, home, lessonDone, who, maker, you, words, anchors, score, init, AV, MIC, welcome, offerUpdate};
})();
window.SHELL = SHELL;      // the page's hooks look for it there
SHELL.init();
