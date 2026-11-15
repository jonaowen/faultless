/* next/shell.js: the shell round the lessons (home and path, lesson complete, who is learning, the avatar maker, you) and the game
   layer's rules (dev/design/GAMIFICATION.md in the private bundle). It never runs inside a task: it reads the log the lesson wrote and
   decides which lesson is next. Loaded after the page's own script; uses its globals (S, LESSONS, USERS, logEntry, picture, PICS, UI).
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
    POINTS_EXERCISE: 10, POINTS_LESSON: 50, POINTS_SPACING: 100, POINTS_RETURN: 50,      // (work)
    REST_DAYS_MAX: 2, REST_DAY_EARNED_EVERY: 5,      // (work)
    RETURN_AFTER_DAYS: 2,             // (work) the welcome back and its bonus
    AWAY_STEPS: [[3,0],[7,3],[14,5],[30,8],[1e9,12]],      // (work, proposed as R-151; NOT applied yet: AWAY_ON)
    AWAY_ON: false,
    DAY_STARTS_HOUR: 4,               // (work) a lesson at half past midnight belongs to the evening before
    GATE_ON: !/[?&]gate=off/.test(location.search),      // the tester's door: ?gate=off runs the lessons straight through (for scripted runs with errors)
  };
  const uid = USERS.current, GK="frDIn.g."+uid, AK=id=>"frDIn.a."+id;
  const blank = ()=>({v:1, points:0, lessons:{}, furthest:0, next:null, why:"", below:{}, days:{}, daysLearned:0, run:{len:0, last:""}, bestRun:0, rest:RULES.REST_DAYS_MAX, restEarnedAt:0,
    anchors:{first:{after:"breakfast"}, second:{after:"supper"}}, bonusSaid:0, cur:null, lastSeen:""});
  let G = blank(); try{ Object.assign(G, JSON.parse(localStorage.getItem(GK)||"{}")); }catch(e){}
  const store = ()=>{ try{ localStorage.setItem(GK, JSON.stringify(G)); }catch(e){} };
  const el = (html)=>{ const t=document.createElement("template"); t.innerHTML=html.trim(); return t.content.firstChild; };
  const esc = t=>String(t).replace(/[<&"]/g,c=>({"<":"&lt;","&":"&amp;",'"':"&quot;"}[c]));
  const ic = n=>`<svg class="icon" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const allDone = i=>LESSONS[i].exercises.every(e=>S.finished[e.id]);
  const last = LESSONS.length-1;
  const dayOf = (d=new Date())=>{ const x=new Date(d.getTime()-RULES.DAY_STARTS_HOUR*3600e3); return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0"); };
  const daysBetween = (a,b)=>Math.round((new Date(b+"T12:00")-new Date(a+"T12:00"))/864e5);
  document.body.appendChild(el(`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="i-sun" viewBox="0 0 28 28"><circle cx="14" cy="14" r="5" fill="currentColor" stroke="none"/><path d="M14 3.5v3M14 21.5v3M3.5 14h3M21.5 14h3M6.6 6.6l2.1 2.1M19.3 19.3l2.1 2.1M6.6 21.4l2.1-2.1M19.3 8.7l2.1-2.1"/></symbol>
<symbol id="i-moon" viewBox="0 0 28 28"><path d="M22.5 16.6A9.2 9.2 0 0 1 11.4 5.5a9.2 9.2 0 1 0 11.1 11.1z" fill="currentColor" stroke="none"/></symbol>
<symbol id="i-star" viewBox="0 0 28 28"><path d="M14 3.8l3.1 6.5 7.1.9-5.2 4.9 1.3 7-6.3-3.5-6.3 3.5 1.3-7-5.2-4.9 7.1-.9z" fill="currentColor" stroke="currentColor" stroke-width="1.6"/></symbol>
<symbol id="i-redo" viewBox="0 0 28 28"><path d="M6 14a8 8 0 1 0 2.6-5.9M6 5.5v5h5"/></symbol>
<symbol id="i-chev" viewBox="0 0 28 28"><path d="M11 7l7 7-7 7"/></symbol>
<symbol id="i-today" viewBox="0 0 28 28"><path d="M4 21.5h20M7.5 21.5a6.5 6.5 0 0 1 13 0M14 8.5v3M5.5 13l2 1.6M22.5 13l-2 1.6"/></symbol>
<symbol id="i-you" viewBox="0 0 28 28"><circle cx="14" cy="9.5" r="4.5"/><path d="M5 24c0-5.2 4-8 9-8s9 2.8 9 8"/></symbol>
<symbol id="i-plus" viewBox="0 0 28 28"><path d="M14 6v16M6 14h16"/></symbol>
<symbol id="i-undo" viewBox="0 0 28 28"><path d="M9 6L4.5 10.5 9 15M5 10.5h11a6.5 6.5 0 0 1 0 13h-5"/></symbol>
<symbol id="i-shuffle" viewBox="0 0 28 28"><path d="M4 8h3.5c6 0 7 12 13 12H24M4 20h3.5c2.2 0 3.7-1.6 5-3.6M24 8h-3.5c-2.2 0-3.7 1.6-5 3.6M21 5l3 3-3 3M21 17l3 3-3 3"/></symbol>
<symbol id="i-rosette" viewBox="0 0 56 70"><path d="M19 38 L11 66 L20.5 60.5 L26 69 L31 42z" fill="#2F5FB3" stroke="none"/><path d="M37 38 L45 66 L35.5 60.5 L30 69 L25 42z" fill="#C4412F" stroke="none"/><g fill="#D8432F" stroke="none">${Array.from({length:14},(_,i)=>`<circle cx="${(28+19.5*Math.cos(i*Math.PI/7)).toFixed(2)}" cy="${(26+19.5*Math.sin(i*Math.PI/7)).toFixed(2)}" r="5.6"/>`).join("")}<circle cx="28" cy="26" r="20"/></g><circle cx="28" cy="26" r="15.2" fill="#FFFDF8" stroke="none"/><circle cx="28" cy="26" r="9.6" fill="#2F5FB3" stroke="none"/></symbol>
</defs></svg>`));

  /* ---- the learner's figure ---- */
  const AV = { has: ()=>!!(window.PICS && PICS.avatar && PICS.avatarParse && PICS.avatarString),
    get(id=uid){ let s=""; try{ s=localStorage.getItem(AK(id))||""; }catch(e){} return s; },
    set(str){ try{ localStorage.setItem(AK(uid), str); }catch(e){} try{ if(PICS.setLearner) PICS.setLearner(PICS.avatarParse(str)); }catch(e){} },
    svg(specOrStr, view, cls){ try{ if(this.has() && specOrStr){ const g=PICS.avatar(typeof specOrStr==="string" ? PICS.avatarParse(specOrStr) : specOrStr, typeof view==="string" ? {view} : view);
        return `<svg class="${cls||"av"}" viewBox="0 0 160 190" aria-hidden="true">${g.outerHTML}</svg>`; } }catch(e){}
      return `<svg class="${cls||"av"}" viewBox="0 0 160 190" aria-hidden="true"><circle cx="80" cy="80" r="29" fill="#c9d1da"/><path d="M20 190 v-22 q0-34 38-40 h44 q38 6 38 40 v22z" fill="#aeb9c5"/></svg>`; } };
  try{ if(AV.has() && AV.get() && PICS.setLearner) PICS.setLearner(PICS.avatarParse(AV.get())); }catch(e){}

  /* ---- which lesson is next (R-152, R-153). G.next: the lesson to do next (index); G.why: "" | "once" | "back" ---- */
  function natural(){ return allDone(S.lesson) ? Math.min(S.lesson+1, last) : S.lesson; }
  function syncNext(){ if(G.next==null || G.next>last || !allDone(S.lesson)){ G.next=natural(); if(!allDone(S.lesson)) {/* a lesson in progress is carried on */} }
    G.furthest=Math.max(G.furthest||0, G.next, ...Object.keys(G.lessons).filter(k=>(G.lessons[k]||[]).some(r=>r.passed)).map(k=>LESSONS.findIndex(l=>l.id===k)+1).filter(n=>n>=0 && n<=last)); }
  let pendingAgain=null;      // a done lesson the learner asked to do again (index)
  // the place as the shell last saw it: if the page's own place has been changed since by something else (the tester's jump, a scripted run),
  // that place stands and the rules start again from it
  let seen=""; const mark=()=>S.lesson+":"+allDone(S.lesson)+":"+S.ex, look=()=>{ seen=mark(); };
  // before the page's own start handler: put the place where the rules say, only when that differs from what the page would do by itself
  document.addEventListener("click", e=>{ const b=e.target && e.target.closest && e.target.closest("#playBtn"); if(!b || running || b.classList.contains("loading")) return;
    if(mark()!==seen){ G.next=natural(); G.why=""; pendingAgain=null; look(); }
    const T = pendingAgain!=null ? pendingAgain : G.next; const kind = pendingAgain!=null ? "again" : (G.why||"");
    if(T!=null && T!==natural()){ S.lesson=T; S.ex=0; LESSONS[T].exercises.forEach(x=>{ delete S.finished[x.id]; });
      logEntry({result:"LESSON AGAIN: Lesson "+(T+1)+(kind==="again" ? " (the learner's own choice)" : kind==="back" ? " (a step back before Lesson "+(T+2)+")" : " (once more: below "+RULES.PASS_MARK+" %)"), heard:[]}); save(); }
    G.cur={lesson:LESSONS[T!=null?T:natural()].id, t0:new Date().toISOString(), kind}; pendingAgain=null; store(); }, true);

  /* ---- the percentage, from the log (GAMIFICATION.md section 4) ---- */
  function score(lessonId, t0){ const es=(S.log||[]).filter(e=>e.lesson===lessonId && e.t>=t0); let X=0, F=0, E=0;
    for(const e of es){ const lead=/^lead/.test(e.phase||"");
      if(e.result==="correct" && !lead) X++;
      if(e.first===true && !e.delayed && !lead){ if(e.result==="correct") F++; else if(e.result==="ERROR" && (RULES.UNSURE_COUNTS || !e.unsure)) E++; } }
    const n=F+E; return {x:X, first:F, errors:E, y: n<10 ? 100 : Math.floor(100*F/n), scored:n}; }

  /* ---- the end of a lesson: the record, the rules, the screen ---- */
  function lessonDone(){ const li=S.lesson, L=LESSONS[li], cur=G.cur && G.cur.lesson===L.id ? G.cur : {lesson:L.id, t0:"", kind:""};
    const sc=score(L.id, cur.t0), passed = !RULES.GATE_ON || sc.y>=RULES.PASS_MARK, now=new Date(), today=dayOf(now);
    let why="";
    if(cur.kind==="again" && li<G.furthest){ /* a lesson already passed, done again by choice: it locks nothing and moves nothing */ }
    else if(passed){ G.below[L.id]=0; G.next=Math.min(li+1, last); G.why=""; G.furthest=Math.max(G.furthest, G.next); }
    else if((G.below[L.id]||0)>=RULES.REPEATS_BEFORE_STEP_BACK && li>0){ G.below[L.id]=0; G.next=Math.max(0, li-RULES.STEP_BACK_LESSONS); G.why=why="back"; }
    else { G.below[L.id]=(G.below[L.id]||0)+1; G.next=li; G.why=why="once"; }
    // points: fixed for the lesson (an error neither costs nor pays); the one bonus is for two lessons well apart; a small one for coming back
    let pts=RULES.POINTS_EXERCISE*L.exercises.length+RULES.POINTS_LESSON, bonus=0, back=0;
    const d=G.days[today]||(G.days[today]={n:0, firstEnd:"", full:false});
    if(d.n===1 && !d.full && cur.t0 && (new Date(cur.t0)-new Date(d.firstEnd))>=RULES.SPACING_GAP_HOURS*3600e3){ d.full=true; bonus=RULES.POINTS_SPACING; }
    if(d.n===0){ d.firstEnd=now.toISOString(); d.am = now.getHours()<14;
      const gap = G.run.last ? daysBetween(G.run.last, today) : 0;
      if(!G.run.last) G.run.len=1;
      else if(gap===1) G.run.len++;
      else if(gap>1 && gap-1<=G.rest){ G.rest-=gap-1; G.run.len++; }
      else if(gap>1) G.run.len=1;
      if(G.run.last && gap>=RULES.RETURN_AFTER_DAYS) back=RULES.POINTS_RETURN;
      G.run.last=today; G.daysLearned++; G.bestRun=Math.max(G.bestRun, G.run.len);
      if(G.daysLearned-G.restEarnedAt>=RULES.REST_DAY_EARNED_EVERY && G.rest<RULES.REST_DAYS_MAX){ G.rest++; G.restEarnedAt=G.daysLearned; } }
    d.n++; G.points+=pts+bonus+back;
    (G.lessons[L.id]=G.lessons[L.id]||[]).push({date:today, x:sc.x, y:sc.y, passed, pts:pts+bonus+back});
    G.cur=null; store(); look();
    try{ trace("lesson complete: Lesson "+(li+1)+": "+sc.x+" correct responses, "+sc.y+" % first time ("+sc.first+" of "+sc.scored+" scored); "+(passed?"passed":"below "+RULES.PASS_MARK+" %: "+why)+"; next: Lesson "+(G.next+1)); }catch(e){}
    showDone({li, sc, passed, why, pts, bonus, back}); }
  function showDone(r){ const name=esc(S.learnerName||""), n=r.li+1, o=document.getElementById("done"), first=Object.values(G.lessons).reduce((a,b)=>a+b.length,0)<=1;
    const stageLeft=last-G.furthest;
    o.innerHTML = (r.passed ? `<svg class="seal" viewBox="0 0 56 70"><use href="#i-rosette"/><text x="28" y="31.5" text-anchor="middle" font-family="Fraunces" font-weight="600" font-size="${n>9?12:15}" fill="#fff" style="font-variation-settings:'SOFT' 100">${n}</text></svg><h1>Bravo${name?", "+name:""}!</h1><div class="sub">Lesson ${n} is done.</div>`
        : `<div class="sunmark">${ic("sun")}</div><h1>Well done${name?", "+name:""}.</h1><div class="sub">You finished Lesson ${n}.</div>`)
      + `<div class="card say">In this lesson you made <b class="first">${r.sc.x}</b> correct responses and you were <b>${r.sc.y}%</b> correct.${first?`<small>${r.sc.y}% of your answers were right the first time you were asked.</small>`:""}</div>`
      + (r.why==="once" ? `<div class="card nextc"><div class="orb">${ic("redo")}</div><div><b>Lesson ${n} once more</b><p>You just need a bit more practice before moving on. Next time we will do this lesson again, and it will feel easier.</p></div></div>`
        : r.why==="back" ? `<div class="card nextc"><div class="orb">${ic("redo")}</div><div><b>A warm-up first</b><p>You are nearly there. Next time we will start with Lesson ${G.next+1}, which you know, and then come back to Lesson ${n}. Everything you have earned stays yours.</p></div></div>` : "")
      + `<div class="tiles${r.bonus?" two":""}"><div class="tile pts"><div class="orb">${ic("star")}</div><div><div class="big">+${r.pts+r.back}</div><small>points${r.passed?"":", yours to keep"}</small></div></div>`
      + (r.bonus ? `<div class="tile two"><div class="orb">${ic("moon")}</div><div><div class="big">+${r.bonus}</div><small>${G.bonusSaid++<3 ? "Your two lessons were well apart: that is how French sticks." : "a full day: two lessons, well apart"}</small></div></div>` : "") + `</div>`
      + (r.passed && G.furthest<=last ? `<div class="card stage"><div class="row"><span>Stage 1</span><span>${stageLeft>0 ? stageLeft+" lesson"+(stageLeft>1?"s":"")+" to go" : "all its lessons done"}</span></div><div class="sbar"><b style="width:${Math.round(100*Math.min(1,(G.furthest)/(last+1)))}%"></b></div></div>` : "")
      + `<div class="spacer"></div><button class="btn" id="doneBtn">Continue</button>`;
    store(); o.hidden=false; o.scrollTop=0;
    document.getElementById("doneBtn").onclick=()=>{ try{ UI.haptic("tick"); }catch(e){} o.hidden=true; home(); }; }

  /* ---- home: today's two moments, the week, the next lesson, the path ---- */
  const mini = spec=>{ try{ return `<div class="mini"><svg viewBox="0 0 160 190" aria-hidden="true">${picture(spec).outerHTML}</svg></div>`; }catch(e){ return ""; } };
  const picsOf = (()=>{ const memo={}; return i=>{ if(memo[i]) return memo[i]; const seen=new Set(), out=[];
      for(const ex of LESSONS[i].exercises) for(const p of ex.parts) for(const it of p.items){ const row=(it.scene&&it.scene.row)||[]; for(const x of row){ if(!x || typeof x!=="object") continue;
        const k=x.person ? "p:"+x.person+(x.doing||"") : (x.is||"")+":"+(x.doing||x.value||""); if(x.person==="you" || seen.has(k)) continue; seen.add(k); out.push(Object.assign({}, x, {count:1})); } }
      return (memo[i]=out); }; })();
  const newPics = i=>{ const before=new Set(); for(let k=0;k<i;k++) picsOf(k).forEach(x=>before.add(JSON.stringify([x.person,x.is,x.doing,x.value]))); const fresh=picsOf(i).filter(x=>!before.has(JSON.stringify([x.person,x.is,x.doing,x.value]))); return (fresh.length?fresh:picsOf(i)).slice(0,5); };
  function home(){ const play=document.getElementById("play"); if(!play || play.hidden) return; syncNext(); store(); look();
    let h=document.getElementById("home"); if(!h){ h=el(`<div id="home" lang="en"></div>`); play.insertBefore(h, play.firstChild);
      play.parentNode.insertBefore(el(`<nav id="nav" lang="en"><button class="tab on" id="tabToday"><div class="pillbg">${ic("today")}</div>Today</button><button class="tab" id="tabYou"><div class="pillbg">${ic("you")}</div>You</button></nav>`), play.nextSibling);
      document.getElementById("tabYou").onclick=()=>you(); }
    { const how0=document.getElementById("howtoBox"), btn0=document.getElementById("playBtn"); play.appendChild(how0); play.appendChild(btn0); }      // kept out of the part that is drawn again
    const T=G.next, n=T+1, now=new Date(), today=dayOf(now), d=G.days[today]||{n:0}, hr=now.getHours(), greet = hr<12 ? "Good morning" : hr<18 ? "Good afternoon" : "Good evening";
    const alive = G.run.last && daysBetween(G.run.last, today)<=1+G.rest;
    const started = !allDone(S.lesson) && (S.ex>0 || !!S.finished[LESSONS[S.lesson].exercises[0].id]) && S.lesson===T;
    const wd=["M","T","W","T","F","S","S"], monday=new Date(now.getTime()-RULES.DAY_STARTS_HOUR*3600e3); monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
    let week=""; for(let k=0;k<7;k++){ const dt=new Date(monday); dt.setDate(monday.getDate()+k); const key=dayOf(new Date(dt.getTime()+RULES.DAY_STARTS_HOUR*3600e3+3600e3)), rec=G.days[key], isToday=key===today, future=key>today;
      week+=`<div class="day${isToday?" today":""}"><span>${wd[k]}</span><div class="pair">${rec ? (rec.full ? `<i class="dot s"></i><i class="dot m"></i>` : `<i class="dot ${rec.am===false?"m":"s"}"></i>`+(isToday?`<i class="dot o"></i>`:"")) : (future||isToday ? `<i class="dot o"></i><i class="dot o"></i>` : "")}</div></div>`; }
    const gapOk = d.n===1 && d.firstEnd ? new Date(new Date(d.firstEnd).getTime()+RULES.SPACING_GAP_HOURS*3600e3) : null;
    const hm = t=>t.getHours()+":"+String(t.getMinutes()).padStart(2,"0");
    const slot1 = d.n>=1 ? `Done ${ic("check")}` : "Now", slot2 = d.full || d.n>=2 ? `Done ${ic("check")}` : gapOk ? (gapOk<=now ? "Now" : "from "+hm(gapOk)) : "Later";
    const eyebrow = G.why==="once" ? `<div class="eyebrow sun">${ic("redo")} Once more</div>` : G.why==="back" ? `<div class="eyebrow sun">${ic("redo")} A warm-up</div>` : d.n>=1 ? `<div class="eyebrow moon">${ic("moon")} Your second lesson today</div>` : `<div class="eyebrow">${ic("sun")} Today's lesson</div>`;
    const L=LESSONS[T], tasks=L.exercises.reduce((a,e)=>a+e.parts.reduce((b,p)=>b+p.items.filter(it=>it.type==="task").length,0),0), mins=Math.max(5, Math.round((tasks*5.5+L.exercises.length*12)/60));
    h.innerHTML=`<div class="h-top"><div class="h-hello">${greet},<b>${esc(S.learnerName||"")}</b></div>${G.daysLearned ? `<div class="h-run"><svg viewBox="0 0 56 70"><use href="#i-rosette"/></svg><div>${alive ? `<span class="n">${G.run.len}</span><small>${G.run.len===1?"day":"days in a row"}</small>` : `<span class="n">${G.daysLearned}</span><small>days learned</small>`}</div></div>`:""}</div>
      <section class="card rhythm" aria-label="Today"><div class="slots">
        <div class="slot am${d.n===0?" next":""}"><div class="orb">${ic("sun")}</div><div><div class="k">After ${esc(G.anchors.first.after)}</div><div class="v">${slot1}</div></div></div>
        <div class="slot pm${d.n===1?" next":""}"><div class="orb">${ic("moon")}</div><div><div class="k">After ${esc(G.anchors.second.after)}</div><div class="v">${slot2}</div></div></div></div>
        <div class="week">${week}</div>${G.daysLearned ? `<div class="life">${G.daysLearned} day${G.daysLearned>1?"s":""} learned · best run ${G.bestRun} day${G.bestRun>1?"s":""}</div>`:""}</section>
      <section class="card hero"><div class="headrow"><div>${eyebrow}<h1>Lesson ${n}</h1></div><div class="minis">${newPics(T).slice(0,3).map(mini).join("")}</div></div>
        <div class="meta">${started ? "Carry on from where you stopped." : L.exercises.length+" exercises · about "+mins+" minutes"}</div>${G.why==="once" ? `<div class="meta">A bit more practice, then Lesson ${n+1}.</div>` : G.why==="back" ? `<div class="meta">A warm-up, then Lesson ${n+1}.</div>` : ""}
        <div id="heroSlot"></div></section>
      <div class="pathhead"><h2>Your path</h2><span class="meta">${G.furthest} lesson${G.furthest===1?"":"s"} done</span></div><div class="path">${LESSONS.map((Lk,i)=>{ const recs=G.lessons[Lk.id]||[], pass=i<G.furthest, bestRec=recs.filter(r=>r.passed).slice(-1)[0];
        const cls = i===T ? (G.why ? "once" : "now") : pass ? "done" : "later";
        return `<div class="step ${cls}"><div class="node">${pass && i!==T ? ic("check") : i+1}</div><div class="card lcard"><div class="row"><span class="t">Lesson ${i+1}</span>${i===T && G.why ? `<span class="chip">${G.why==="once"?"Once more":"A warm-up"}</span>` : pass && i!==T ? `<button class="again" data-again="${i}">Do it again ${ic("chev")}</button>` : ""}</div>${pass && bestRec ? `<div class="pct">${bestRec.x} right · ${bestRec.y}%</div>`:""}<div class="minis">${(i<=Math.max(T,G.furthest) ? newPics(i).map(mini).join("") : `<div class="mini back"></div>`.repeat(4))}</div></div></div>`; }).join("")}</div>`;
    const slot=document.getElementById("heroSlot"), how=document.getElementById("howtoBox"), btn=document.getElementById("playBtn"); slot.appendChild(how); slot.appendChild(btn); slot.style.display="grid"; slot.style.gap="11px";
    const lab=btn.querySelector(".ready"); if(lab && !play.classList.contains("afterDemo")) lab.textContent=(started?"Carry on with lesson ":"Start lesson ")+n;
    h.querySelectorAll("[data-again]").forEach(b=>{ b.onclick=()=>{ pendingAgain=+b.dataset.again; try{ UI.haptic("tick"); }catch(e){} const lb=btn.querySelector(".ready"); if(lb) lb.textContent="Start lesson "+(pendingAgain+1)+" again"; h.scrollTo({top:0, behavior:"smooth"}); h.querySelector(".hero h1").textContent="Lesson "+(pendingAgain+1); }; }); }

  /* ---- who is learning? (more than one learner on this phone) ---- */
  function who(force){ const o=document.getElementById("whoL"); if(!o) return; let chosen=false; try{ chosen=sessionStorage.getItem("frDIn.chosen")==="1"; }catch(e){}
    if(!force && (USERS.list.length<2 || chosen || running)) return;
    o.innerHTML=`<h1>Who is learning?</h1><div class="pgrid">${USERS.list.map(u=>`<button class="pcard${u.id===uid && force?" on":""}" data-u="${esc(u.id)}">${AV.svg(AV.get(u.id), "portrait")}<span>${esc(u.name)}</span></button>`).join("")}<button class="pcard add" id="whoAdd">${ic("plus")}<span>Add someone</span></button></div><div class="foot">Each of you has your own place, your own words and your own record.</div>${force?`<button class="btn quiet" id="whoBack" style="margin-top:18px">Back</button>`:""}`;
    o.hidden=false;
    o.querySelectorAll("[data-u]").forEach(b=>{ b.onclick=()=>{ try{ sessionStorage.setItem("frDIn.chosen","1"); }catch(e){} if(b.dataset.u===uid){ o.hidden=true; return; } switchUser(b.dataset.u); }; });
    document.getElementById("whoAdd").onclick=()=>{ const nm=cleanName(prompt("First name of the new learner")||""); if(!nm) return; try{ sessionStorage.setItem("frDIn.chosen","1"); }catch(e){} const m=addUser(nm); if(m) alert(m); };
    const bk=document.getElementById("whoBack"); if(bk) bk.onclick=()=>{ o.hidden=true; }; }

  /* ---- the avatar maker: built from the picture library's own lists (PICS.avatarOptions), so options can be added without touching this ---- */
  const FIELDS = { body:{label:"Body", vals:["m","f"]}, age:{label:"Age", vals:["c","a","o"]}, girth:{label:"Build", n:4}, skin:{label:"Skin", opt:"skin"}, face:{label:"Face", n:5}, eyes:{label:"Eyes", opt:"eyes"},
    freckles:{label:"Freckles", n:2}, hair:{label:"Hair", opt:"hair"}, hairc:{label:"Hair colour", opt:"hairc"}, beard:{label:"Beard", n:2}, glasses:{label:"Glasses", n:2}, head:{label:"Headscarf", n:2}, scarf:{label:"Scarf colour", opt:"top"},
    top:{label:"Jumper", opt:"top"}, legs:{label:"Trousers", opt:"legs"} };
  const CATS = [["You",["body","age","girth"]],["Skin",["skin"]],["Face",["face","eyes","freckles"]],["Hair",["hair","hairc","beard"]],["Glasses",["glasses","head","scarf"]],["Clothes",["top","legs"]]];
  const valsOf = f=>{ const F=FIELDS[f]; if(F.vals) return F.vals; const n = F.opt && PICS.avatarOptions && Array.isArray(PICS.avatarOptions[F.opt]) ? PICS.avatarOptions[F.opt].length : (F.n||2); return Array.from({length:n},(_,i)=>i); };
  function maker(firstRun, done){ const o=document.getElementById("maker"); if(!o || !AV.has()){ if(done) done(); return; }
    let spec; try{ spec=PICS.avatarParse(AV.get() || PICS.avatarString({})); }catch(e){ spec={}; } const hist=[]; let cat=3, step = firstRun ? 1 : 0;
    const starters=[["A man",{body:"m",age:"a"}],["A woman",{body:"f",age:"a",hair:6}],["A boy",{body:"m",age:"c"}],["A girl",{body:"f",age:"c",hair:4}]];
    const set=(f,v)=>{ hist.push(Object.assign({}, spec)); spec=Object.assign({}, spec, typeof f==="object" ? f : {[f]:v}); if((typeof f==="object" ? f.age : f==="age" && v)==="c") spec.beard=0; draw(); try{ UI.haptic("tick"); }catch(e){} };
    const finish=()=>{ AV.set(PICS.avatarString(spec)); S.learnerGender = spec.body==="f" ? "f" : "m"; save(); o.hidden=true; try{ trace("the learner's figure made"); }catch(e){} if(done) done(); home(); };
    function draw(){
      if(step===1){ o.innerHTML=`<div class="mk-step">Step 1 of 3</div><h1>Who will you be?</h1><div class="lede">Pick the one nearest to you. You will make it yours next.</div><div class="big4">${starters.map(([lab,sp],i)=>`<button class="pcard" data-s="${i}">${AV.svg(Object.assign({}, spec, sp), "standing")}<span>${lab}</span></button>`).join("")}</div>`;
        o.querySelectorAll("[data-s]").forEach(b=>{ b.onclick=()=>{ spec=Object.assign({}, spec, starters[+b.dataset.s][1]); step = spec.age==="c" ? 3 : 2; draw(); }; }); return; }
      if(step===2){ const olds=[["Younger",{age:"a"}],["Older",{age:"o",hairc:7}],["White hair",{age:"o",hairc:8}],["With glasses",{age:"o",hairc:7,glasses:1}]];
        o.innerHTML=`<div class="mk-step">Step 2 of 3</div><h1>Nearer to you?</h1><div class="lede">You can change everything afterwards.</div><div class="big4">${olds.map(([lab,sp],i)=>`<button class="pcard" data-s="${i}">${AV.svg(Object.assign({}, spec, sp), "portrait")}<span>${lab}</span></button>`).join("")}</div>`;
        o.querySelectorAll("[data-s]").forEach(b=>{ b.onclick=()=>{ spec=Object.assign({}, spec, olds[+b.dataset.s][1]); step=3; draw(); }; }); return; }
      if(step===3){ o.innerHTML=`<div class="mk-step">Step 3 of 3</div><h1>Your skin</h1><div class="lede">Then it is you: or go on and choose more.</div><div class="big4" style="grid-template-columns:repeat(3,1fr)">${valsOf("skin").map(v=>`<button class="pcard" style="height:150px" data-v="${v}">${AV.svg(Object.assign({}, spec, {skin:v}), "portrait")}</button>`).join("")}</div>`;
        o.querySelectorAll("[data-v]").forEach(b=>{ b.onclick=()=>{ spec=Object.assign({}, spec, {skin:+b.dataset.v}); step=0; cat=3; draw(); }; }); return; }
      const [, fields]=CATS[cat];
      o.innerHTML=`<div class="mk-bar">${firstRun?"":`<button class="rb plain" id="mkBack" aria-label="Back">${ic("chev")}</button>`}<h2>This is you</h2><button class="rb" id="mkUndo" aria-label="Undo">${ic("undo")}</button><button class="rb" id="mkRnd" aria-label="Surprise me">${ic("shuffle")}</button></div>
        <div class="mk-stage">${AV.svg(spec, "portrait", "big")}<div class="mk-small"><div class="mini">${AV.svg(spec, {view:"doing", doing:"walk", still:true}, "s")}</div><div class="lab">You, in<br>the lessons</div><div class="mini">${AV.svg(spec, "standing", "s")}</div></div></div>
        <div class="mk-tabs">${CATS.map(([lab],i)=>`<button class="${i===cat?"on":""}" data-c="${i}">${lab}</button>`).join("")}</div>
        <div class="mk-tray">${fields.filter(f=>!(f==="beard" && (spec.body==="f" || spec.age==="c")) && !(f==="scarf" && !spec.head) && !(f==="hairc" && spec.hair===3)).map(f=>`<div class="mk-lab">${FIELDS[f].label}</div><div class="opts">${valsOf(f).map(v=>`<button class="opt${f==="body"||f==="girth"||f==="legs"||f==="age"?" whole":""}${String(spec[f])===String(v)?" on":""}" data-f="${f}" data-v="${v}" aria-label="${FIELDS[f].label} ${v}">${AV.svg(Object.assign({}, spec, {[f]:v}), f==="body"||f==="girth"||f==="legs"||f==="age" ? "standing" : "portrait", "t")}</button>`).join("")}</div>`).join("")}</div>
        <div class="mk-foot"><button class="btn" id="mkDone">That's me</button></div>`;
      o.querySelectorAll("[data-c]").forEach(b=>{ b.onclick=()=>{ cat=+b.dataset.c; draw(); }; });
      o.querySelectorAll("[data-f]").forEach(b=>{ b.onclick=()=>{ const f=b.dataset.f, raw=b.dataset.v; set(f, FIELDS[f].vals ? raw : +raw); }; });
      document.getElementById("mkUndo").onclick=()=>{ if(hist.length){ spec=hist.pop(); draw(); } };
      document.getElementById("mkRnd").onclick=()=>{ const r={}; for(const f of ["skin","face","eyes","hair","hairc","top","legs","girth"]){ const vs=valsOf(f); r[f]=vs[Math.floor(Math.random()*vs.length)]; } set(r); };
      document.getElementById("mkDone").onclick=finish; const bk=document.getElementById("mkBack"); if(bk) bk.onclick=()=>{ o.hidden=true; }; }
    o.hidden=false; draw(); }

  /* ---- you: the record, the figure, who is learning, the tester's door ---- */
  function you(){ const o=document.getElementById("you"); if(!o) return;
    o.innerHTML=`<div class="mk-bar" style="padding-left:0"><button class="rb plain" id="youBack" aria-label="Back">${ic("chev")}</button><h2>You</h2></div>
      <div class="card grp"><button class="grow" id="youAv"><div class="ic" style="overflow:hidden;background:var(--card);border:1px solid var(--line)">${AV.svg(AV.get(), "portrait", "t").replace('viewBox="0 0 160 190"','viewBox="30 30 100 100"')}</div><div class="l">${esc(S.learnerName||"")}<small>Change how you look</small></div><div class="v">${ic("chev")}</div></button>
        <button class="grow" id="youWho"><div class="ic">${ic("you")}</div><div class="l">Who is learning?<small>Change learner, or add someone</small></div><div class="v">${ic("chev")}</div></button></div>
      <div class="card grp"><div class="grow"><div class="ic">${ic("star")}</div><div class="l">${G.points} points<small>${G.daysLearned} days learned · best run ${G.bestRun} days · ${G.furthest} lesson${G.furthest===1?"":"s"} done</small></div></div></div>
      <div class="card grp"><button class="grow" id="youRemove"><div class="ic">${ic("redo")}</div><div class="l">Remove ${esc(currentUser().name)} from this phone<small>Asked twice. Everything of this learner is deleted.</small></div></button>
        <button class="grow" id="youTester"><div class="ic">${ic("chev")}</div><div class="l">For testers<small>Version ${esc(APP_VERSION)}</small></div></button></div>`;
    o.hidden=false;
    document.getElementById("youBack").onclick=()=>{ o.hidden=true; home(); };
    document.getElementById("youAv").onclick=()=>maker(false, ()=>you());
    document.getElementById("youWho").onclick=()=>who(true);
    document.getElementById("youRemove").onclick=()=>{ if(USERS.list.length<2){ alert("This is the only learner on this phone."); return; } if(!confirm("Remove "+currentUser().name+"? Their place, record and figure will be deleted.")) return; try{ localStorage.removeItem(GK); localStorage.removeItem(AK(uid)); }catch(e){} const m=removeUser(uid); if(m) alert(m); };
    document.getElementById("youTester").onclick=()=>{ o.hidden=true; document.getElementById("panel").hidden=false; try{ renderPanel(); }catch(e){} }; }

  /* ---- start ---- */
  for(const id of ["done","whoL","maker","you"]) document.body.appendChild(el(`<div class="over" id="${id}" hidden lang="en"></div>`));
  function init(){ syncNext(); store(); home();
    // first run: the name is asked by the page; then, in place of the two pictograms, the learner makes his own figure
    const firstFigure=()=>{ if(S.learnerName && !S.learnerGender && AV.has()){ const g=document.getElementById("gender"); if(g) g.hidden=true; maker(true); } };
    firstFigure(); const wf=document.getElementById("whoForm"); if(wf) wf.addEventListener("submit", ()=>setTimeout(firstFigure, 0));
    who(false); }
  return {RULES, get G(){ return G; }, home, lessonDone, who, maker, you, score, init, AV};
})();
window.SHELL = SHELL;      // the page's hooks look for it there
SHELL.init();
