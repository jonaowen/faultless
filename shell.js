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
    MASTERY: true,                    // (owner, 16 Nov ~20:15: "the next lesson should be locked if any exercise isn't perfect, not the current 90% criterion")
                                      // a lesson is passed when every exercise in it is perfect (green); until then "Go for perfect" for the yellow ones
    PASS_MARK: 90,                    // (owner, before MASTERY) whole per cent, first-time correct over scored first askings; shown, no longer a gate
    REPEATS_BEFORE_STEP_BACK: 1,      // (owner) below the mark: the lesson once more; still below on that one repeat: back
    STEP_BACK_LESSONS: 1,             // (owner)
    UNSURE_COUNTS: false,             // (work) an ERROR the app itself doubts (unsure) is left out of the percentage
    SPACING_GAP_HOURS: 6,             // (work) the second lesson of a day starts at least this long after the first ended
    POINTS_PERFECT_FIRST: 1,          // (owner, 15 Nov late: "It should just be 1 point for a perfect exercise whether that is by the first time or by repair") an exercise perfect the first time it is done
    POINTS_PERFECT_REPAIR: 1,         // (owner) an exercise that had an error, done again perfectly (once: it is then perfect)
    POINTS_PERFECT_LESSON: 0,      // (owner, 17 Nov: no points for a perfect lesson under mastery: every lesson passed is perfect) was 5;         // (owner, 15 Nov late) a lesson that becomes perfect, first time through OR by repairs, once per lesson; (superseded: "first time only") (it still counts for the badges)
    // (owner) nothing else earns points: not finishing a lesson, not the second lesson of the day, not coming back
    BADGES: [5,10,20,50,100,200,500,1000,2000],      // (17 Nov) lessons completed: under mastery a lesson is completed only when it is all perfect (the owner's earlier rule: never a badge for lessons merely finished)
    BEAD_SOUND: "D",                  // (owner, 15 Nov: "Sound A is the best since it's higher pitched. Higher pitch suggests 'correct' more") (owner: a trial) the soft sound on a right answer: A, B or C (dev/design/review/sound_*.wav); a setting turns it off
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
    AGAIN_FILLS_RINGS: true,          // (owner, 16 Nov: "redoing a lesson you've already passed should close the day's ring ... There's nothing wrong with more
                                      // practise than is necessary") a whole lesson done again counts like any lesson: it closes today's ring, counts for the week
                                      // and keeps the streak. One exercise again and "Go for perfect" stay practice: they fill the ring a little, never close it.
    STREAK_MILESTONES: [[3,1,0],[7,2,1],[14,3,0],[30,5,1],[100,10,1],[365,20,0]],      // (work) a streak of N days: a badge, T tokens and F streak freezes, once (the best run reaches it once)
    FREEZE_MAX: 2, FREEZE_PRICE: 2,   // (owner, 16 Nov: "Duolingo know what they're doing, so we should copy them") a streak freeze covers one missed day by itself;
                                      // held before the day (it covers only days after the day it was had); at most 2; 2 tokens in the Wardrobe (work)
    REPAIR_DAYS: 2, REPAIR_LESSONS: 3, REPAIR_TOKENS: [[30,5],[100,10],[1e9,15]],      // (work) a streak lost can be repaired for 2 days after the loss: 3 lessons in a
                                      // day (as Duolingo's 2026 streak revival), or tokens by its length (5 under 30 days, 10 under 100, then 15)
    STREAK_LATE_HOUR: 20,             // (work) from this hour a day with no lesson yet says "still time today" (sun-coloured, never red)
    GOAL_EASY_BY: 2, GOAL_RISE: 1,    // (work) a week's goal met with 2 or more to spare rises by 1 next week; missed, it falls to where it will be met
    RANKS: [8,28,75,140,230,430,660,930,1400,1910,2500,3300,4200,5100,5900,6800,8000,9500,11500,14100,17400,21500,24400,29800,40000,50500,62500],      // (17 Nov, Jon: "option c") points for ranks 1..27 (rank 0, Débutant, is the start): gaps in lessons growing by a quarter a rank, the first inside Lesson 1, the last at 62,500; never a smaller share of the ladder than the 50 ranks gave (dev/design/tools/ward2/sim.py)
    RANK_TOKENS: [6,6,6,6,6,7,7,8,8,9,9,10,10,12,14,18,20,30,35,45,55,55,80,155,155,185,370],      // (17 Nov, Jon: "the big token tranch for rank up and also the trickle") the tranche of each rank-up: about half of what the perfect lessons bring until the next one, never fewer than the rank before; the tier it opens prices its cheap things at about 60 % of that income and its showpieces at about two of it (sim.py: a spender and a saver)
    TOKENS_PER_PERFECT_LESSON: 2,     // (Jon, 17 Nov: "it's per perfect lesson") tokens when a lesson becomes perfect on a full run (every answer right first time: the rosette's rule), once a lesson; not for one exercise or Go for perfect
    LEARNER_FIGURE_ON: !/[?&]learner=off/.test(location.search),      // the course's "you" drawn from the learner's own figure (PICS.setLearner; the close-ups keep the default learner, by the picture library's own guard); ?learner=off for the default everywhere      // the tester's door: ?gate=off runs the lessons straight through (for scripted runs with errors)
  };
  const uid = USERS.current, GK="frDIn.g."+uid, AK=id=>"frDIn.a."+id;
  const blank = ()=>({v:1, points:0, lessons:{}, furthest:0, next:null, why:"", below:{}, days:{}, daysLearned:0, run:{len:0, last:""}, bestRun:0, rest:RULES.REST_DAYS_MAX, restEarnedAt:0,
    anchors:{first:{after:"breakfast", time:"08:00"}, second:{after:"supper", time:"19:00"}, set:false}, goal:2, bonusSaid:0, cur:null, lastSeen:"",
    lpts:{}, pace:[], ex:{}, lp:{}, badges:{}, levels:{}, wordsAt:{}, warmTo:null, awaySeen:"", replay:null, weeks:{}, rank:null, tokens:0, tokEarned:0, ward:{owned:{}, worn:{}}, ringsShown:null});
  let G = blank(), fresh = true; try{ const raw=localStorage.getItem(GK); if(raw){ Object.assign(G, JSON.parse(raw)); fresh=false; } }catch(e){}
  G.anchors=Object.assign(blank().anchors, G.anchors||{}); for(const k of ["first","second"]) G.anchors[k]=Object.assign({}, blank().anchors[k], G.anchors[k]);
  for(const k of ["lpts","ex","lp","badges","levels","wordsAt"]) if(!G[k]) G[k]={}; if(!Array.isArray(G.pace)) G.pace=[];
  const store = ()=>{ if(!USERS.list.some(x=>x.id===uid)) return; try{ localStorage.setItem(GK, JSON.stringify(G)); }catch(e){} };      // (.77) never once the learner is removed
  const el = (html)=>{ const t=document.createElement("template"); t.innerHTML=html.trim(); return t.content.firstChild; };
  const pl = (n, one, many)=>Number(n)===1 ? one : (many || one+"s");      // "1 point", "2 points": every count said with its noun goes through this
  const esc = t=>String(t).replace(/[<&"]/g,c=>({"<":"&lt;","&":"&amp;",'"':"&quot;"}[c]));
  const ic = n=>`<svg class="icon" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const $ = id=>document.getElementById(id);
  const tick = kind=>{ try{ UI.haptic("tick"); }catch(e){} if(kind==="go") uiSound("go"); };      // tick("go"): a press that is a step toward learning (the brighter sound); every other press gets the quiet one by itself (uiTaps)
  const allDone = i=>LESSONS[i].exercises.every(e=>S.finished[e.id]);
  const last = LESSONS.length-1;
  const dayOf = (d=new Date())=>{ const x=new Date(d.getTime()-RULES.DAY_STARTS_HOUR*3600e3); return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0"); };
  const daysBetween = (a,b)=>Math.round((new Date(b+"T12:00")-new Date(a+"T12:00"))/864e5);
  const lessMotion = ()=>UI.pref.motion==="less" || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const hmFmt = (()=>{ try{ return new Intl.DateTimeFormat([], {hour:"numeric", minute:"2-digit"}); }catch(e){ return null; } })();      // (QA .67) made once: toLocaleTimeString builds a formatter on every call
  const hm = t=>hmFmt ? hmFmt.format(t) : t.toLocaleTimeString([], {hour:"numeric", minute:"2-digit"});
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
<symbol id="i-home" viewBox="0 0 28 28"><path d="M4 13.2L14 5l10 8.2M7 11v12.5h5.2V17h3.6v6.5H21V11"/></symbol>
<symbol id="i-lessons" viewBox="0 0 28 28"><path d="M4.5 7.5l2.2 2.2 3.8-3.8M4.5 15.5l2.2 2.2 3.8-3.8M14.5 8h9.5M14.5 16h9.5M14.5 23h9.5"/><circle cx="7.2" cy="23" r="2.4"/></symbol>
<symbol id="i-snow" viewBox="0 0 28 28"><path d="M14 3v22M4.5 8.5l19 11M4.5 19.5l19-11M11 4.5l3 3 3-3M11 23.5l3-3 3 3M3.8 12.3l4.1 1.1-1.1 4M24.2 12.3l-4.1 1.1 1.1 4M7 4.9l1 4.1-4 1.1M21 4.9l-1 4.1 4 1.1"/></symbol>
<symbol id="i-hanger" viewBox="0 0 28 28"><path d="M11.2 7.8a2.8 2.8 0 1 1 3.9 2.6c-.7.3-1.1.9-1.1 1.6v1.2M14 13.2L3.8 20.2c-.9.6-.5 1.8.6 1.8h19.2c1.1 0 1.5-1.2.6-1.8z"/></symbol>
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
  /* (.77, Jon 17 Nov: "I removed myself from the phone, and then my mum's profile changed, and she had some customization") a figure is
     stored only when the learner makes one (the figure maker). A learner without one is SHOWN the neutral look everywhere (Who is learning,
     Home, the wardrobe, the lessons' "you"), and nothing is written for them: before, a learner opened for the first time under the shell
     (as the first learner is, after the current one is removed) was given a figure by gender and it was saved (seed, firstRun). */
  const NEUTRAL_LOOK = {body:"n", age:"a", skin:3, hair:8, hairc:2, top:1};
  const AV = { has: ()=>!!(window.PICS && PICS.avatar && PICS.avatarParse && PICS.avatarString),
    own(id=uid){ let s=""; try{ s=localStorage.getItem(AK(id))||""; }catch(e){} return s; },      // the figure the learner made ("" when none)
    get(id=uid){ const s=this.own(id); if(s) return s; try{ return this.has() ? PICS.avatarString(NEUTRAL_LOOK) : ""; }catch(e){ return ""; } },      // the figure shown
    set(str){ try{ localStorage.setItem(AK(uid), str); }catch(e){} try{ if(RULES.LEARNER_FIGURE_ON && PICS.setLearner) PICS.setLearner(PICS.avatarParse(str)); }catch(e){} },
    svg(specOrStr, view, cls){ try{ if(this.has() && specOrStr){ const g=PICS.avatar(typeof specOrStr==="string" ? PICS.avatarParse(specOrStr) : specOrStr, typeof view==="string" ? {view} : view);
        return `<svg class="${cls||"av"}" viewBox="0 0 160 190" aria-hidden="true">${g.outerHTML}</svg>`; } }catch(e){}
      return `<svg class="${cls||"av"}" viewBox="0 0 160 190" aria-hidden="true"><circle cx="80" cy="80" r="29" fill="#c9d1da"/><path d="M20 190 v-22 q0-34 38-40 h44 q38 6 38 40 v22z" fill="#aeb9c5"/></svg>`; } };
  try{ if(RULES.LEARNER_FIGURE_ON && AV.has() && AV.get() && PICS.setLearner) PICS.setLearner(PICS.avatarParse(AV.get())); }catch(e){}
  /* (.77) a figure written by the app and never chosen (.73 to .76: by gender or neutral, with the offer to make one still open) is taken
     back, for every learner on the phone: the learner is shown the neutral look until they make their own. A figure made in the maker
     (the offer closed) is never touched. */
  try{ if(AV.has()){ const auto=[{body:"f"},{body:"m"},NEUTRAL_LOOK].map(x=>PICS.avatarString(x));
    for(const u of USERS.list){ const s=AV.own(u.id); if(!s || !auto.includes(s)) continue; let g=null; try{ g=JSON.parse(localStorage.getItem("frDIn.g."+u.id)||"null"); }catch(e){}
      if(g && g.makerOffer===true){ localStorage.removeItem(AK(u.id)); if(u.id===uid && RULES.LEARNER_FIGURE_ON && PICS.setLearner) PICS.setLearner(PICS.avatarParse(AV.get())); } } } }catch(e){}

  /* ---- the course's words and stages (next/words.js, made from the plan) ---- */
  const CW = window.COURSE_WORDS || {lessons:{}, stages:[]};
  const cardsOf = id=>((CW.lessons[id]||{}).cards)||[];
  const passedIdx = i=>i<G.furthest;      // a lesson below the furthest reached has been passed
  const ownedCards = ()=>{ const out=[]; LESSONS.forEach((L,i)=>{ if(passedIdx(i)) cardsOf(L.id).forEach((c,ci)=>out.push(Object.assign({lesson:i, ci}, c))); }); return out; };
  /* (.93; rules.md R-164) A stage whose boundary the plan has not declared yet is OPEN (last: null): it has no number of lessons to
     promise. It runs over the lessons served and those planned so far (upto), which are there, locked, "Coming"; its progress is a
     count of lessons done, never "N of M". */
  const stageEnd = s=>s.last==null ? Math.max(LESSONS.length+1, s.upto||0) : s.last;
  const stageOf = n=>(CW.stages||[]).find(s=>n>=s.first && n<=stageEnd(s)) || null;      // n: a lesson number (1-based)
  const stageCount = s=>{ const done=Math.max(0, Math.min(stageEnd(s), G.furthest)-s.first+1), of = s.last==null ? 0 : s.last-s.first+1, segs = of || Math.max(done, Math.min(stageEnd(s), LESSONS.length)-s.first+1);
    return {done, of, segs, text: of ? `${done} of ${of} ${pl(of, "lesson")}` : `${done} ${pl(done, "lesson")} done`}; };
  function stageLine(n){ const s=stageOf(n); if(!s) return ""; return Object.assign({s}, stageCount(s)); }
  function stageBar(n){ const st=stageLine(n); if(!st) return ""; return `<div class="card stage"><div class="row"><span>Stage ${st.s.id}</span><span>${st.text}</span></div><div class="segs" aria-hidden="true">${Array.from({length:st.segs},(_,k)=>`<i class="${k<st.done?"on":""}"></i>`).join("")}</div></div>`; }
  // a picture from a scene spec of the course; Marie herself (the course's "claire") is drawn as the picture library's portrait of her
  const pic = spec=>spec==="claire" && window.PICS && PICS.portrait ? PICS.portrait("marie", "Marie") : picture(spec);
  function cardPic(c){ try{ if(c.spec!=null){ const g=pic(c.spec); return `<svg viewBox="0 0 160 190" aria-hidden="true">${g.outerHTML}</svg>`; } }catch(e){}
    return `<svg viewBox="0 0 160 190" aria-hidden="true"><text x="80" y="108" text-anchor="middle" font-family="Atkinson Hyperlegible Next" font-weight="700" font-size="${c.fr.length>8?24:30}" fill="#1B2433">${esc(c.fr)}</text></svg>`; }
  let clipNow=null;
  function playClip(key, btn){ if(!key) return; try{ if(clipNow){ clipNow.pause(); } const a=new Audio("audio/teacher/"+key+".mp3"); clipNow=a; if(btn){ btn.classList.add("playing"); a.onended=a.onerror=a.onpause=()=>btn.classList.remove("playing"); } a.play().catch(()=>{ if(btn) btn.classList.remove("playing"); }); }catch(e){} }
  const wcard = (c, extra="", lz="")=>`<button class="wcard${extra}" data-clip="${esc(c.clip||"")}" aria-label="${esc(c.fr)}: play"${lz ? ` data-lz="${lz}"` : ""}>${lz ? "" : cardPic(c)}<span class="sp">${ic("speaker")}</span></button>`;
  const wireCards = root=>root.querySelectorAll(".wcard").forEach(b=>{ b.onclick=()=>{ tick(); playClip(b.dataset.clip, b); }; });

  /* ---- which lesson is next (R-152, R-153, R-151). G.next: the lesson to do next (index); G.why: "" | "once" | "back" | "warm" | "perfect" (MASTERY: the lesson's yellow exercises before the next) ---- */
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
    if(!S.learnerName){ const i=$("hNameIn"), v=cleanName(i ? i.value : ""); if(!v || !nameSet(v)){ e.stopPropagation(); e.preventDefault(); if(i){ i.focus(); i.classList.remove("want"); void i.offsetWidth; i.classList.add("want"); } return; } }
    if(e.isTrusted!==false) uiSound("go");      // the start of a lesson: the brighter sound, on the press itself
    if(MIC.primerNeeded()){ e.stopPropagation(); e.preventDefault(); MIC.primer(); return; }
    /* (.74; the owner, 16 Nov: "When I select an exercise to redo from the lesson view, it doesn't actually open the exercise anymore. It stays on
       the lessons view but starts playing the audio") a start from the Lessons or You tab (an exercise again, Go for perfect, the whole lesson
       again) left that tab's layer over the stage: every tab layer is put away and Home is the tab, so the lesson is on the screen */
    try{ for(const id of ["lessonsL","you","lessonV","ward","maker"]){ const o=$(id); if(o) o.hidden=true; }
      if(tabNow!=="today"){ tabNow="today"; for(const [v,id] of NAVT){ const bb=$(id); if(bb){ bb.classList.toggle("on", v==="today"); if(v==="today") bb.setAttribute("aria-current","page"); else bb.removeAttribute("aria-current"); } } try{ MV.tabbed("today"); }catch(e2){} } }catch(e){}
    beadCtx(); try{ const hm=$("home"); if(hm && !hm.closest("[hidden]")) MV.openCard(hm.querySelector(".hero")); }catch(e){}
    if(!pendingEx && pendingAgain==null && G.why==="perfect" && G.next!=null && mark()===seen && toPerfect(G.next).length) pendingEx={li:G.next, ei:toPerfect(G.next)};      // (MASTERY) Home's start is "Go for perfect"
    if(pendingEx){ const {li, ei}=pendingEx; pendingEx=null; startReplay(li, ei); exT0=""; G.cur={lesson:LESSONS[li].id, t0:new Date().toISOString(), kind:Array.isArray(ei)?"perfect":"exercise", p0:G.points, fromStart:false}; RUN.ex=[]; store(); look(); return; }
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
        if(!G.replay && !(G.again && !RULES.AGAIN_FILLS_RINGS)){ const dd=G.days[dayOf()]||(G.days[dayOf()]={n:0, firstEnd:"", full:false}); if(dd.xl!==L.id) dd.xp=0; dd.xl=L.id; dd.xp=(dd.xp||0)+1; }      // the inner ring fills as today's lesson goes on
        TY.bank("ex", p); G.points+=p; G.lpts[L.id]=(G.lpts[L.id]||0)+p; RUN.ex.push({id:X.id, i:S.ex, perfect:res.perfect, p}); exT0=new Date().toISOString(); store();
        if(res.perfect) barCheer(0);      // (the tally) the points are shown at the lesson's end
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
  const perfectCount = ()=>Math.max(Math.min(G.furthest||0, LESSONS.length), Object.keys(G.lp).length);      // (17 Nov) lessons completed: under mastery each is all perfect
  function newBadge(today){ let got=null; for(const n of RULES.BADGES) if(perfectCount()>=n && !G.badges[n]){ G.badges[n]=today; got=n; } return got; }
  const badgeName = n=>`${n.toLocaleString("en-GB")} lessons`;
  function badgeSvg(n, cls="badge"){ return `<svg class="${cls}" viewBox="0 0 56 70" aria-hidden="true"><use href="#i-rosette"/><text x="28" y="${n>=1000?30.5:31.5}" text-anchor="middle" font-family="Fraunces" font-weight="600" font-size="${n>=1000?8.5:n>=100?11:14}" fill="#fff" style="font-variation-settings:'SOFT' 100">${n>=1000?(n/1000)+"k":n}</text></svg>`; }

  /* ---- the goal of the whole course: the CEFR levels A1 to C2, in speaking and listening (COURSE_WORDS.levels, from the plan: the lesson at
     which each is reached and what the learner can then do; the sentences live in the data, not here). The bar of the level now: lessons
     passed since the last level over the lessons between the two; inside it, brighter, the share of those lessons that are perfect (it never
     holds a level back). ---- */
  const LEVELS = (CW.levels||[]).map(x=>({id:x.id, lesson:x.lesson, canDo:[].concat(x.canDo||[])}));
  const perfectIn = (a,b)=>0;      // (17 Nov) no gold share in the level ring under mastery (every lesson passed is perfect); was the perfect lessons in a..b-1      // lesson indexes a..b-1; a lesson made all green by repairs counts (the gold share grows with repairs)
  function levelNow(){ if(!LEVELS.length) return null; let from=0; const passed=G.furthest;
    for(let k=0;k<LEVELS.length;k++){ const Lv=LEVELS[k], span=Lv.lesson-from;
      if(passed<Lv.lesson){ const done=Math.max(0, passed-from); return {k, Lv, from, span, done, pct:Math.max(0, Math.min(100, Math.floor(100*done/span))), perf:Math.floor(100*perfectIn(from, passed)/span)}; }
      from=Lv.lesson; }
    return {k:LEVELS.length, Lv:null, pct:100}; }
  function newLevel(today){ let got=null; for(const Lv of LEVELS) if(G.furthest>=Lv.lesson && !G.levels[Lv.id]){ G.levels[Lv.id]=today; got=Lv; } return got; }
  function levelCard(full){ const n=levelNow(); if(!n) return "";
    return `<div class="card cefr"><div class="row"><b>Your French</b><small>in speaking and listening</small></div>
      <div class="lv">${LEVELS.map((Lv,k)=>`<div class="lvc${k<n.k?" done":k===n.k?" now":""}"><span>${k<n.k?ic("check"):""}${Lv.id}</span><i style="--p:${k<n.k?100:k===n.k?Math.max(n.pct,2):0}%;--q:${k<n.k?100:k===n.k?n.perf:0}%"></i></div>`).join("")}</div>
      ${n.Lv ? `<div class="lvnow"><b class="num">${n.pct}%</b><span>of the way to <b>${n.Lv.id}</b><small>${n.done} of ${n.span} ${pl(n.span, "lesson")}${n.perf?` · ${perfectIn(n.from, G.furthest)} of them perfect`:""}</small></span></div>
        ${full ? `<div class="lvwill"><small>At ${n.Lv.id}</small>${n.Lv.canDo.slice(0,full?3:1).map(t=>`<p>${esc(t)}</p>`).join("")}</div>` : ""}<p class="lvnote">Levels as planned</p>` : `<div class="lvnow"><b class="num">C2</b><span>reached</span></div>`}</div>`; }
  function levelParty(Lv, then){ const o=$("lvl"); o.innerHTML=`<div class="lvbig" aria-hidden="true"><span>${Lv.id}</span></div><h1>You have reached ${Lv.id}</h1><div class="sub center">in speaking and listening</div>
      <div class="card trip">${Lv.canDo.map(t=>`<div>${ic("check")}<p>${esc(t)}</p></div>`).join("")}</div><div class="spacer"></div><button class="btn" id="lvGo">Continue</button>`;
    o.hidden=false; o.scrollTop=0; fete(o, true); if(!lessMotion()) o.querySelector(".lvbig").classList.add("mo-lv"); SFX.moment("level", 200); $("lvGo").onclick=()=>{ tick(); o.hidden=true; stopFete(); if(then) then(); }; }

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
    const day = R.day.n>=2 ? `<b>Goal met${tick2}</b><small class="gold">${ic("star")} Two lessons</small>` : R.day.n>=1 ? `<b>Goal met${tick2}</b>` : `<b>One lesson</b>`;
    const week = R.week.closed ? `<b>${R.week.n} lesson${R.week.n===1?"":"s"}${tick2}</b><small>Goal met: ${R.week.goal}</small>` : `<b>${R.week.n} of ${R.week.goal} ${pl(R.week.goal, "lesson")}</b>`;
    const lvl = R.lvl.top ? `<b>C2</b><small>reached</small>` : `<b>${R.lvl.pct}% to ${R.lvl.id}</b>${compact ? `<small>${R.lvl.done} of ${R.lvl.span} ${pl(R.lvl.span, "lesson")}</small>${R.lvl.perf ? `<small><em class="gold">${R.lvl.perf} perfect</em></small>` : ""}` : R.lvl.perf ? `<small><em class="gold">${R.lvl.perf} perfect</em></small>` : ""}`;
    return `<div class="rrows${compact?" c":""}"><div class="rr day"><i></i><div><span>Today</span>${day}</div></div><div class="rr week"><i></i><div><span>This week</span>${week}</div></div><div class="rr lvl"><i></i><div><span>Your French</span>${lvl}</div></div>${compact ? streakDone() : ""}</div>`; }
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
  // (17 Nov; Jon: "the user needs to feel that each rank is higher than the one before"; then, of the three ways in
  // dev/design/ranks/LADDER_PROPOSAL.md: "option c"; Causeur left out: "causeuse" is first a small sofa, and no other word steps cleanly between Interlocuteur and Raconteur) twenty-eight ranks on one line, every step from one to the next judged CLEAR: from the
  // first steps (learning, reading, talking) to the press, the page and the hall, the university, mastery and honour. His form, her form, the
  // English beneath. No tiers of ranks: each emblem's material climbs the wedding anniversaries instead.
  const TITLES = [["Débutant","Débutante","Beginner"],["Apprenti","Apprentie","Apprentice"],["Lecteur","Lectrice","Reader"],["Interlocuteur","Interlocutrice","Conversation partner"],
    ["Raconteur","Raconteuse","Storyteller"],["Reporter","Reporter","Reporter"],["Chroniqueur","Chroniqueuse","Columnist"],
    ["Éditorialiste","Éditorialiste","Leader writer"],["Rédacteur en chef","Rédactrice en chef","Editor-in-chief"],["Écrivain","Écrivaine","Writer"],["Orateur","Oratrice","Orator"],
    ["Lettré","Lettrée","Well-read"],["Expert","Experte","Expert"],["Docteur","Docteure","Doctor of letters"],["Maître de conférences","Maître de conférences","Senior lecturer"],
    ["Professeur","Professeure","Professor"],["Mentor","Mentor","Mentor"],["Érudit","Érudite","Scholar"],["Virtuose","Virtuose","Virtuoso"],["Maître","Maître","Master"],
    ["Grand maître","Grand maître","Grand master"],["Ambassadeur","Ambassadrice","Ambassador"],["Sage","Sage","Sage"],["Lauréat","Lauréate","Laureate"],
    ["Académicien","Académicienne","Academician"],["Icône","Icône","Icon"],["Légende","Légende","Legend"],["Immortel","Immortelle","Immortal"]];
  const rankOf = p=>{ let k=0; RULES.RANKS.forEach((t,i)=>{ if(p>=t) k=i+1; }); return k; };      // 0: the start (Débutant); 1..49
  const rankAt = k=>Math.max(0, Math.min(TITLES.length-1, k|0));
  const rankTitle = k=>rankAt(k);      // every rank is its own title
  const fem = ()=>{ try{ return AV.has() && AV.own() ? PICS.avatarParse(AV.own()).body==="f" : S.learnerGender==="f"; }catch(e){ return false; } };
  const rankName = k=>TITLES[rankAt(k)][fem()?1:0];
  const rankEn = k=>TITLES[rankAt(k)][2];
  const rankIn = k=>rankName(k);
  /* (owner, 17 Nov: "The ranks should be completely unknown so you have to work to know what the higher ranks are. It spoils it to be able
     to see the names of the ranks from this view") a rank above the learner's is never named: "the next rank", "in 3 ranks" */
  const ranksAway = r=>{ const d=r-(G.rank||0); return d<=1 ? "the next rank" : `in ${d} ranks`; };
  const rankLabel = k=>rankName(k)+" ("+rankEn(k)+")";      // for a screen reader
  // the name, the English beneath it in brackets (wherever a rank is shown)
  const rankHtml = k=>`${esc(rankName(k))}<small class="ren">(${esc(rankEn(k))})</small>`;
  const tokensFor = k=>k>=1 ? RULES.RANK_TOKENS[k-1] : 0;
  /* (ward2) THE SOURCES OF TOKENS, all through earn(): a rank-up (RULES.RANK_TOKENS, rankSync), a streak's milestone (RULES.STREAK_MILESTONES,
     streakLesson), a ladder's migration (ranksNow), and the trickle: a perfect lesson (RULES.TOKENS_PER_PERFECT_LESSON, once a lesson, shown in the
     lesson's tally). Spending: the wardrobe, the streak's freezes and repairs. */
  const earn = n=>{ n=Math.max(0, Math.round(n)||0); G.tokens=(G.tokens||0)+n; G.tokEarned=(G.tokEarned||0)+n; return n; };
  // (17 Nov, Jon: option c) a record from before the 28 ranks (the 34 of .70-.77, or the 50 of .78-.79) keeps its points and its tokens; its
  // rank is now from its points on this ladder (a smaller number, never a smaller share of the ladder: sim.py checks every points value below
  // 36,500, which nobody has passed); the tokens this ladder gives up to that rank, beyond those the old ranks gave, are added; none are taken
  const OLD_TOKENS=[1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,4,4,4,6,6,6,8,8,8,10,10,10,20,20,20,25,25,25,60];
  const OLD50_TOKENS=[1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,6,6,6,6,6,6,6,6,10,10,10,10,10,10,12,12,12,12,12,12,12,12,12,12,12,12,12,12,60];
  function ranksNow(){ if(G.rv===28) return; if(G.rank==null){ G.rv=28; return; } const old = G.rv===50 ? OLD50_TOKENS : OLD_TOKENS, k=rankOf(G.points||0),
      oldT=old.slice(0, Math.max(0, Math.min(old.length, G.rank))).reduce((a,x)=>a+x,0), newT=RULES.RANK_TOKENS.slice(0, k).reduce((a,x)=>a+x,0), add=Math.max(0, newT-oldT);
    try{ trace("the 28 ranks: rank "+G.rank+" of "+(G.rv===50 ? 50 : 34)+" at "+G.points+" points becomes "+rankName(k)+" ("+k+" of 27); tokens +"+add); }catch(e){}
    G.rank=k; earn(add); G.rv=28; }
  // the emblem: a shield in its tier's metal, with its own rank's sign (fifty shields, no two alike)
  const SIGN = {
    sprout:`<path d="M10 18V10M10 12c0-4-3-6-7-6 0 4 3 6 7 6M10 10c0-4 3-6 7-6 0 4-3 6-7 6"/>`,
    lens:`<circle cx="8.5" cy="8.5" r="5.2"/><path d="M12.4 12.4l5 5"/>`,
    door:`<path d="M5 18V3h10v15M2.5 18h15"/><circle cx="12.2" cy="11" r=".9" fill="currentColor" stroke="none"/>`,
    camera:`<rect x="2.5" y="6" width="15" height="10.5" rx="2"/><circle cx="10" cy="11.2" r="3"/><path d="M7 6l1.2-2h3.6L13 6"/>`,
    signpost:`<path d="M10 18.5V2.5M10 4h6.2l2 2.2-2 2.2H10M10 10.5H3.8l-2 2.2 2 2.2H10"/>`,
    suitcase:`<rect x="3" y="7" width="14" height="10" rx="2"/><path d="M7.5 7V4.5h5V7M3 11.5h14"/>`,
    hat:`<path d="M1.5 14.5h17M5 14.5V8c0-2.6 10-2.6 10 0v6.5M5 11.5h10"/>`,
    compass:`<circle cx="10" cy="10" r="7.5"/><path d="M13 7l-1.8 4.2L7 13l1.8-4.2z" fill="currentColor"/>`,
    mountain:`<path d="M1.5 17L7.5 7l3.5 5.5 2.5-3.5L18.5 17z"/>`,
    globe:`<circle cx="10" cy="10" r="7.5"/><path d="M2.5 10h15M10 2.5c2.5 2.5 2.5 12.5 0 15M10 2.5c-2.5 2.5-2.5 12.5 0 15"/>`,
    letter:`<rect x="2.5" y="5" width="15" height="10.5" rx="1.5"/><path d="M2.5 5.5l7.5 6 7.5-6"/>`,
    house:`<path d="M3 9.5L10 3.5l7 6V17H3zM8 17v-4.5h4V17"/>`,
    cup:`<path d="M3.5 7h11v4.5c0 3.8-11 3.8-11 0zM14.5 8.5c3 0 3 4 0 4M3 17.5h12M7 2.5c-1 1 1 2 0 3M11 2.5c-1 1 1 2 0 3"/>`,
    key:`<circle cx="6" cy="10" r="3.5"/><path d="M9.5 10h8M15 10v3M17.5 10v2.5"/>`,
    heart:`<path d="M10 16.5S3 12 3 7.5A3.5 3.5 0 0 1 10 5.8a3.5 3.5 0 0 1 7 1.7C17 12 10 16.5 10 16.5z"/>`,
    word:`<path d="M3 3.5h14v9.5H9.5L5 17v-4H3z"/>`,
    talk:`<path d="M2 3h10v7H6.5L3.5 13v-3H2zM9 13.2h2.5l3.5 3.3v-3.3H18V6.5h-3.5"/>`,
    story:`<path d="M3 3.5h14v9.5H9.5L5 17v-4H3z"/><circle cx="7" cy="8.2" r=".9" fill="currentColor"/><circle cx="10" cy="8.2" r=".9" fill="currentColor"/><circle cx="13" cy="8.2" r=".9" fill="currentColor"/>`,
    scales:`<path d="M10 3v14M5 17h10M4 6h12M4 6l-2.5 5.5h5zM16 6l-2.5 5.5h5z"/>`,
    voice:`<path d="M3 7.5h4l5.5-4v13l-5.5-4H3z"/><path d="M15 7a4 4 0 0 1 0 6M17.2 5a7 7 0 0 1 0 10"/>`,
    book:`<path d="M10 5.5C8 4 5 3.8 2.5 4.5v11c2.5-.7 5.5-.5 7.5 1 2-1.5 5-1.7 7.5-1v-11C15 3.8 12 4 10 5.5zM10 5.5v11"/>`,
    paper:`<rect x="3" y="3.5" width="14" height="13" rx="1.5"/><path d="M6 7h8M6 10h8M6 13h5"/>`,
    nib:`<path d="M10 2.5L15 9l-5 9-5-9zM10 9v3"/><circle cx="10" cy="12.5" r=".9" fill="currentColor"/>`,
    quill:`<path d="M17 2.5C10 3.5 5.5 8.5 4.5 15.5L3 18M4.5 15.5c4.5-.3 8.5-3.5 10.5-8M8.5 12h4.5"/>`,
    masks:`<path d="M2.5 4h7v5a3.5 3.5 0 0 1-7 0zM10.5 8h7v5a3.5 3.5 0 0 1-7 0z"/>`,
    wine:`<path d="M6 2.5h8c0 4.5-1.5 7-4 7s-4-2.5-4-7zM10 9.5v6M6.5 17.5h7"/>`,
    scroll:`<path d="M6 3.5h9.5a2 2 0 0 1 0 4H15v8.5a2 2 0 0 1-2 2H4.5a2 2 0 0 1 0-4H5V5.5a2 2 0 0 1 1-2zM8 8h4M8 11h4"/>`,
    books:`<rect x="3" y="13" width="14" height="3.5" rx="1"/><rect x="4.5" y="8.5" width="11" height="3.5" rx="1"/><rect x="3.5" y="4" width="12" height="3.5" rx="1"/>`,
    lamp:`<path d="M2.5 13.5h9.5c3 0 5.5-2 5.5-4.5H8c-3 0-5.5 2-5.5 4.5zM6 17h8M14.5 8.5c0-1.5.8-2.5 2-3M15.5 2.5c-.8 1 .5 1.8 0 2.8"/>`,
    column:`<path d="M5 3.5h10M5.5 16.5h9M7 3.5v13M10 3.5v13M13 3.5v13M4 18h12"/>`,
    palette:`<path d="M10 3c-4.5 0-7.5 3-7.5 7 0 3.5 2.5 6.5 6 6.5 1.5 0 1.5-1.5.8-2.5-.8-1.2.2-2.5 1.7-2.5h2.5c2 0 3.5-1.5 3.5-3.5C17 5.5 14 3 10 3z"/><circle cx="7" cy="8" r="1" fill="currentColor"/><circle cx="11" cy="6.5" r="1" fill="currentColor"/>`,
    flower:`<circle cx="10" cy="7" r="3.2"/><path d="M10 10.2V18M10 14c-2.5 0-4-1.5-4.5-3.5 2.5 0 4 1.5 4.5 3.5zM10 13c2.5 0 4-1.5 4.5-3.5-2.5 0-4 1.5-4.5 3.5z"/>`,
    gem:`<path d="M5 3.5h10l3 4.5-8 9.5L2 8zM2 8h16M7.5 3.5L10 8l2.5-4.5M10 8v9.5"/>`,
    music:`<path d="M7 16.5V4.5l10-2.2v11.6"/><ellipse cx="5" cy="16.5" rx="2.6" ry="2" fill="currentColor"/><ellipse cx="15" cy="14" rx="2.6" ry="2" fill="currentColor"/>`,
    spark:`<path d="M10 2l1.9 6.1L18 10l-6.1 1.9L10 18l-1.9-6.1L2 10l6.1-1.9z" fill="currentColor"/>`,
    flag:`<path d="M4 18V2.5M4 3.5h11l-2.5 3.5L15 10.5H4"/>`,
    board:`<rect x="2.5" y="3.5" width="15" height="10" rx="1"/><path d="M6 17.5l2-4M14 17.5l-2-4M5.5 7.5h5M5.5 10h8"/>`,
    torch:`<path d="M7 9h6l-1.5 9h-3zM10 2.5c-2 2-2.5 3.5-1 5.5h2c1.5-2 1-3.5-1-5.5z"/>`,
    target:`<circle cx="10" cy="10" r="7.5"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="10" r="1" fill="currentColor"/>`,
    crown:`<path d="M3 15.5L2 6l5 4 3-6 3 6 5-4-1 9.5z"/><path d="M3.5 18h13"/>`,
    olive:`<path d="M10 18V8M10 8c0-3 2-4.5 4.5-4.5 0 2.5-1.5 4.5-4.5 4.5M10 12c0-2.5-2-3.5-4.5-3.5 0 2 1.7 3.5 4.5 3.5M6 18h8"/>`,
    order:`<path d="M10 2.2l2.3 5 5.4.6-4 3.7 1.1 5.3L10 14.1l-4.8 2.7 1.1-5.3-4-3.7 5.4-.6z"/>`,
    eye:`<path d="M1.5 10S5 4.5 10 4.5 18.5 10 18.5 10 15 15.5 10 15.5 1.5 10 1.5 10z"/><circle cx="10" cy="10" r="2.7"/>`,
    sun:`<circle cx="10" cy="10" r="3.8"/><path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18M4.3 4.3l1.8 1.8M13.9 13.9l1.8 1.8M4.3 15.7l1.8-1.8M13.9 6.1l1.8-1.8"/>`,
    medal:`<circle cx="10" cy="12.5" r="4.8"/><path d="M7 8.5L5 2.5M13 8.5l2-6M5 2.5h10"/>`,
    academy:`<path d="M2.5 17.5h15M3.5 15.5h13M5 15.5V8.5M8.3 15.5V8.5M11.7 15.5V8.5M15 15.5V8.5M2.5 8.5h15L10 3z"/>`,
    star:`<path d="M10 2.2l2.3 5 5.4.6-4 3.7 1.1 5.3L10 14.1l-4.8 2.7 1.1-5.3-4-3.7 5.4-.6z" fill="currentColor"/>`,
    comet:`<circle cx="13.5" cy="6.5" r="3" fill="currentColor"/><path d="M11.2 8.8L3 17M10.5 6.2L4.5 12.2M13.8 9.5L7.8 15.5"/>`,
    moon:`<path d="M13.5 16.5A7 7 0 0 1 8.5 3.5a7 7 0 1 0 5 13z"/><path d="M15 4.5l.7 1.6 1.7.2-1.3 1.1.4 1.7-1.5-.9-1.5.9.4-1.7-1.3-1.1 1.7-.2z" fill="currentColor"/>`,
    lectern:`<path d="M4 5.5h12l-2.2 4.5H6.2zM10 10v7M6 17.5h8"/>`,
    sash:`<path d="M4.5 2.5L15 15M3 2.5h3.5M13.5 15H17"/><circle cx="12" cy="12" r="3" fill="currentColor"/>`,
    laurel:`<path d="M10 17.5C4 16 2.5 10 4 4.5M10 17.5c6-1.5 7.5-7.5 6-13"/><path d="M4 8.5c-2-.3-3-1.7-2.5-3.4 1.8.3 2.6 1.8 2.5 3.4zM5 12.5c-2.2.3-3.6-.8-3.6-2.6 2-.2 3.2 1 3.6 2.6zM16 8.5c2-.3 3-1.7 2.5-3.4-1.8.3-2.6 1.8-2.5 3.4zM15 12.5c2.2.3 3.6-.8 3.6-2.6-2-.2-3.2 1-3.6 2.6z" fill="currentColor" stroke="none"/>` };
  const RSIGN = ["sprout","lens","book","talk","story","nib","paper","scales","column","quill","lectern","scroll","target","lamp","board","torch",
    "heart","eye","music","crown","order","sash","sun","medal","academy","star","comet","laurel"];      // one sign a rank, no two alike
  const GLYPH = RSIGN.map(n=>SIGN[n]);
  /* (17 Nov; the owner: "The metals don't make sense currently. Better would be copying the marriage metals / jubilee UK royal metals") each
     emblem's material climbs the wedding anniversaries: the first fifteen years one a rank (paper, cotton, leather ... crystal), then china,
     silver, pearl, coral, ruby, sapphire, gold, emerald, diamond, blue sapphire, one or two ranks each, and platinum for the Immortel alone.
     The material only rises. The royal jubilees (Silver, Ruby, Golden, Diamond, Sapphire, Platinum) are the milestones: the first rank in
     each is the biggest ceremony. [id, name, years, light, dark, rim, ink, texture, jubilee] */
  const MATERIALS = [
    ["paper","Paper",1,"#FFFDF6","#E9E1CD","#B4A887","#5C5446","ruled"], ["cotton","Cotton",2,"#FFFFFF","#E4E9F0","#A7B2C0","#4A5568","hatch"],
    ["leather","Leather",3,"#C4834B","#7E4722","#4F2A12","#FFEBD2","stitch"], ["linen","Linen",4,"#F1E9D6","#CDBE9C","#988763","#4D4330","weave"],
    ["wood","Wood",5,"#CF9C60","#8C5B2C","#5A3818","#FFF1DC","grain"], ["iron","Iron",6,"#99A0A8","#565C64","#33373D","#F3F5F8","rivets"],
    ["wool","Wool",7,"#D35E54","#93312A","#5E1E19","#FFF4EC","knit"], ["bronze","Bronze",8,"#E2A56A","#A8652E","#7A4519","#FFF6EA","sheen"],
    ["pottery","Pottery",9,"#DE8A62","#A5502E","#6E3018","#FFF1E6","bands"], ["tin","Tin",10,"#DCE0E5","#A2AAB3","#6F7781","#2D3747","sheen"],
    ["steel","Steel",11,"#BCC8D4","#6C7C8D","#44505E","#F4F8FB","sheen"], ["silk","Silk",12,"#F5C1CD","#C9718A","#8C3F56","#FFF6F8","sheen"],
    ["lace","Lace",13,"#FFFFFF","#F1ECF1","#C2B3C1","#6B5A6A","scallop"], ["ivory","Ivory",14,"#FFFCEC","#EADFBE","#B9A97E","#5E5233",""],
    ["crystal","Crystal",15,"#EEF9FF","#A6D6EF","#5E9CC0","#1F4E6B","facets"], ["china","China",20,"#FFFFFF","#DCE5F4","#2A4E9B","#2A4E9B","willow"],
    ["silver","Silver",25,"#F2F4F7","#A7B1BE","#6E7A8A","#2D3747","sheen","Silver"], ["pearl","Pearl",30,"#FFF9F3","#E5D6E5","#B6A1B6","#5B4A5A","pearl"],
    ["coral","Coral",35,"#FFA287","#DE5C47","#A2382A","#FFF4EF",""], ["ruby","Ruby",40,"#E0566A","#8A1E2F","#C79A2B","#FFE9A8","facets","Ruby"],
    ["sapphire","Sapphire",45,"#6182DA","#25418F","#C79A2B","#FFE9A8","facets"], ["gold","Gold",50,"#FAD978","#D9A21E","#946500","#4A3000","sheen","Golden"],
    ["emerald","Emerald",55,"#46C48B","#14694A","#D6A62C","#FFF3C4","facets"], ["diamond","Diamond",60,"#FFFFFF","#CBE6F6","#86BEDF","#285877","facets","Diamond"],
    ["bluesapphire","Blue sapphire",65,"#3D5EDB","#0F2270","#D6A62C","#FFE9A8","facets","Sapphire"], ["platinum","Platinum",70,"#F6F8FA","#B6BFCA","#7A8591","#1F2A36","sheen","Platinum"]];
  // the material of each rank (an index into MATERIALS): ranks 0-14 one each, then one or two a material, platinum for the last. The table is
  // for twenty-eight ranks; for any other number (the owner may choose fewer) the same rule is computed: the first ranks one material each, the rest
  // spread evenly over china to blue sapphire, platinum for the last alone. Nothing here assumes fifty.
  const MAT_OF = TITLES.length===28 ? [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14, 15,15, 16,16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
    : TITLES.map((_, k, a)=>{ const N=a.length, first=Math.min(15, Math.max(1, Math.round((N-1)*0.3))), last=MATERIALS.length-1; if(k===N-1) return last; if(k<first) return Math.round(k*14/Math.max(1, first-1));
      return 15+Math.min(9, Math.floor((k-first)*10/Math.max(1, N-1-first))); });
  const matOf = k=>MATERIALS[MAT_OF[rankAt(k)]];
  const matName = k=>matOf(k)[1];
  const jubileeOf = k=>{ const m=MAT_OF[rankAt(k)]; return MATERIALS[m][8] && MAT_OF.indexOf(m)===rankAt(k) ? MATERIALS[m][8] : ""; };      // "Silver" on the first rank in silver
  const matHtml = k=>`<small class="rmat m-${matOf(k)[0]}">${esc(matName(k))}</small>`;      // the material's name, small, under the emblem's rank
  // a texture for the material, inside the shield (a few strokes: lines of paper, stitches of leather, grain of wood, a sheen of metal, facets of a stone)
  const TEXTURE = {
    ruled:i=>`<path d="M8 20h40M8 26h40M8 32h40M8 38h40M8 44h40" stroke="${i}" stroke-opacity=".12" stroke-width=".8"/>`,
    hatch:i=>`<path d="M4 14l40 40M14 8l40 40M4 26l30 30M24 4l30 30" stroke="${i}" stroke-opacity=".07" stroke-width="1"/>`,
    stitch:i=>`<path d="M28 6.4l18 5.3v18.3c0 12.9-8 20-18 25.4-10-5.4-18-12.5-18-25.4V11.7z" fill="none" stroke="#FFE0B8" stroke-opacity=".55" stroke-width="1" stroke-dasharray="2 1.6"/>`,
    weave:i=>`<path d="M6 16h44M6 22h44M6 28h44M6 34h44M6 40h44M14 6v52M20 6v52M26 6v52M32 6v52M38 6v52M44 6v52" stroke="${i}" stroke-opacity=".06" stroke-width=".9"/>`,
    grain:i=>`<path d="M10 12c8 4 4 12 12 16s6 14 12 18M22 8c6 6 2 12 8 18s4 12 10 16M36 8c4 6 2 10 6 16" fill="none" stroke="#4A2C10" stroke-opacity=".22" stroke-width="1"/>`,
    rivets:i=>`<g fill="#2A2E33" fill-opacity=".45"><circle cx="13" cy="14" r="1.3"/><circle cx="43" cy="14" r="1.3"/><circle cx="13" cy="34" r="1.3"/><circle cx="43" cy="34" r="1.3"/><circle cx="28" cy="52" r="1.3"/></g>`,
    knit:i=>`<path d="M10 18l4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3M10 26l4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3M10 34l4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3M12 42l4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="1"/>`,
    sheen:i=>`<path d="M4 34L34 4h8L4 42z" fill="#fff" fill-opacity=".28"/><path d="M4 46L46 4h3L4 49z" fill="#fff" fill-opacity=".2"/>`,
    bands:i=>`<path d="M6 20h44M6 23h44M6 44h44M6 47h44" stroke="#5A2410" stroke-opacity=".3" stroke-width="1.4"/>`,
    scallop:i=>`<path d="M28 7.6l17 5v17.4c0 12.2-7.6 19-17 24.2-9.4-5.2-17-12-17-24.2V12.6z" fill="none" stroke="#B9A5B8" stroke-width="1.6" stroke-dasharray=".1 3" stroke-linecap="round"/>`,
    facets:i=>`<path d="M28 4L28 58M8 10L48 50M48 10L8 50M8 30h40" stroke="#fff" stroke-opacity=".22" stroke-width=".9"/><path d="M28 4l12 18-12 10-12-10z" fill="#fff" fill-opacity=".14"/>`,
    willow:i=>`<path d="M28 8.3l16.2 4.8V30c0 11.4-6.9 18-16.2 23.2C18.7 48 11.8 41.4 11.8 30V13.1z" fill="none" stroke="${i}" stroke-opacity=".5" stroke-width="1.2"/><path d="M14 46c4-3 8 0 12-3s8 0 12-3" fill="none" stroke="${i}" stroke-opacity=".35" stroke-width="1"/>`,
    pearl:i=>`<ellipse cx="22" cy="20" rx="12" ry="8" fill="#fff" fill-opacity=".45"/><ellipse cx="34" cy="40" rx="10" ry="7" fill="#F7D9EA" fill-opacity=".35"/>` };
  // the Immortel's emblem alone: a gold laurel wreath round the platinum shield (the Académie's own laurel)
  const WREATH = `<g fill="#D6A62C" stroke="#8C6400" stroke-width=".5"><path d="M28 61.5C14 58 4 46 3.2 20" fill="none" stroke="#B8891A" stroke-width="1.4"/><path d="M28 61.5C42 58 52 46 52.8 20" fill="none" stroke="#B8891A" stroke-width="1.4"/>`
    +[[3.4,24,-20],[4.2,32,-30],[6.2,40,-40],[9.6,47.5,-52],[14.5,53.5,-64],[20.5,58,-76]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="1.9" ry="4" transform="rotate(${r} ${x} ${y})"/><ellipse cx="${56-x}" cy="${y}" rx="1.9" ry="4" transform="rotate(${-r} ${56-x} ${y})"/>`).join("")+`</g>`;
  const SHIELD = "M28 3.5l20.5 6v20.5c0 14.5-9 22.5-20.5 28.5C16.5 52.5 7.5 44.5 7.5 30V9.5z";
  function rankEmblem(k, cls="emb"){ const t=rankAt(k), M=matOf(k), [, , , hi, lo, rim, ink, tex]=M, u="em"+k+cls.replace(/\W/g,"");
    return `<svg class="${cls}" viewBox="0 0 56 64" role="img" aria-label="${esc(rankLabel(k))}, ${esc(M[1].toLowerCase())}"><defs><linearGradient id="${u}" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset="1" stop-color="${lo}"/></linearGradient><clipPath id="${u}c"><path d="${SHIELD}"/></clipPath></defs>
      ${t===TITLES.length-1 ? WREATH : ""}<path d="${SHIELD}" fill="url(#${u})" stroke="${rim}" stroke-width="2.2" stroke-linejoin="round"/>
      ${tex && TEXTURE[tex] ? `<g clip-path="url(#${u}c)">${TEXTURE[tex](ink)}</g>` : ""}
      <path d="M28 8.3l16.2 4.8V30c0 11.4-6.9 18-16.2 23.2C18.7 48 11.8 41.4 11.8 30V13.1z" fill="none" stroke="${ink}" stroke-opacity=".28" stroke-width="1.1"/>
      <path d="M11 11.5L28 6.5l17 5" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.6" stroke-linecap="round"/>
      <g transform="translate(18 18.5)" fill="none" stroke="${ink}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" color="${ink}">${GLYPH[t]}</g></svg>`; }
  // a new rank (or several) since the last time: each gives its tokens, once; the first time a record meets this rule its ranks are given quietly
  function rankSync(){ const k=rankOf(G.points); if(G.rank==null){ G.rank=k; G.tokens=0; for(let j=1;j<=k;j++) G.tokens+=tokensFor(j); G.tokEarned=G.tokens; return null; }
    if(k<=G.rank) return null; const got=[]; for(let j=G.rank+1;j<=k;j++){ earn(tokensFor(j)); got.push(j); }
    G.rank=k; try{ trace("a new rank: "+rankName(k)+" ("+G.points+" points); tokens +"+got.reduce((a,j)=>a+tokensFor(j),0)); }catch(e){} return got; }
  // the bar along the bottom of the lesson-complete screen: points toward the next rank (from where the lesson began to where it ended)
  function rankBar(p0, p1){ const k=rankOf(p1), last=k>=RULES.RANKS.length, lo=k ? RULES.RANKS[k-1] : 0, hi=last ? lo : RULES.RANKS[k], f=x=>last ? 1 : Math.max(0, Math.min(1, (x-lo)/(hi-lo)));
    const from = rankOf(p0)<k ? 0 : f(p0);
    return `<div class="rankbar" role="group" aria-label="${esc(rankLabel(k))}: ${last ? "the highest rank" : (hi-p1)+" "+pl(hi-p1, "point")+" to the next rank"}">${rankEmblem(k, "emb s")}<span class="rb-t"><span class="rb-l"><b>${rankHtml(k)}</b><span>${last ? "The highest rank" : `<b class="num">${(hi-p1).toLocaleString("en-GB")}</b> point${hi-p1===1?"":"s"} to the next rank`}</span></span>
      <span class="rb-track"><i style="--a:${from.toFixed(3)};--b:${Math.max(0.02, f(p1)).toFixed(3)}"></i></span></span></div>`; }

  /* ---- (17 Nov; the owner: "Wardrobe items should come in tiers. Tier 1, tier 2, etc. ... lower tiers are more boring items, higher tiers are
     the more extravagant ... Initially, all items are locked. As soon as the player ranks up once, they unlock tier 1 items, all of them. They
     still have to spend tokens to actually buy them ... buying items and equipping them changes how you always look in lessons ... So, we have
     locked, unlocked, bought, equipped ... Be imaginative with extra categories ... even when items are locked, you can see the category they're
     in") THE WARDROBE IN TIERS. Each tier is one category; each rank-up unlocks the next tier (rank N opens Tier N: 27 of each), so
     every rank-up ends on a padlock opening. Inside a tier, cheap things and a showpiece or two, so that there is a choice: spend now or save. The four states: locked (grey, question marks, a lock; the category and the rank that opens it), unlocked (in colour, the
     price, Buy), bought (yours: Wear it), worn (a tick: Wearing; one a slot). What is worn shows on the learner's figure everywhere, lessons
     included (PICS.setWear). A thing bought before the tiers stays the learner's, and wearable, even in a tier not yet open (only that thing:
     the rest of its tier stays locked). dev/design/tools/ward2/WARD2.md. The pictures: the figures agent's (PICS.wardrobeThumb, PICS.avatar). ---- */
  // [tier, category, how many things the locked tier shows while its things are still being drawn]. (Jon, 17 Nov: "make sure the pacing of the
  // unlocks is good ... not overwhelmed with choice ... not stuck"; "the user needing to choose between saving up tokens Vs using them to buy
  // everything that's cheap") 27 tiers for the 27 rank-ups, one category each, plain to extravagant. The prices inside a tier: the cheap things
  // (about one rank-up's tokens in all, so they are bought on the day the tier opens) and one or two showpieces (about two and a half rank-ups:
  // they need saving across unlocks). Set with the ranks' points and tokens by dev/design/tools/ward2/sim.py (a spender and a saver).
  const TIERS = [[1,"Hats"],[2,"Eyewear"],[3,"Scarves and neckwear"],[4,"Tops"],[5,"Shoes"],[6,"Bags"],[7,"Gloves"],[8,"Badges and pins"],
    [9,"Jewellery"],[10,"Hair colours"],[11,"Jackets and coats"],[12,"Things to carry"],[13,"Instruments and art"],[14,"Hats of honour"],[15,"Sashes and honours"],
    [16,"Outfits"],[17,"On stage"],[18,"Costumes"],[19,"Grand costumes"],[20,"Something wild"],[21,"Poses"],[22,"Dances"],[23,"Emotes",6],[24,"Companions",4],
    [25,"Auras and frames",4],[26,"Backgrounds"],[27,"The Immortal's coat"]]
    .map(([n, cat, soon], i, a)=>({n, cat, soon:soon||3, rank:Math.max(1, Math.ceil(n*RULES.RANKS.length/a.length))}));
  // the rank that opens a tier: with 28 rank-ups and 28 tiers, rank N opens Tier N; with any other count, in order, the last tier at the last rank
  const tierRank = n=>TIERS[n-1].rank;
  const tierOpen = n=>tierRank(n)<=(G.rank||0);
  const WARDROBE = [      // [id, French, English, tier, slot, price]; slot: what it is worn as (one of each slot at a time; an outfit is the whole figure). The
    // ids and slots are the picture library's (people.js WARD; dev/design/tools/fig17/CATEGORIES.md); cheap things first, the showpieces last
    ["cap","une casquette","a cap",1,"head",1], ["woolly","un bonnet","a woolly hat",1,"head",1], ["bucket","un bob","a bucket hat",1,"head",1], ["flatcap","une casquette plate","a flat cap",1,"head",1],
    ["visor","une visière","a sun visor",1,"head",1], ["headband","un bandeau","a sports headband",1,"head",1], ["earbeanie","un bonnet à oreilles","a beanie with ears",1,"head",14], ["straw","un chapeau de paille","a straw boater",1,"head",14],
    ["shades","des lunettes de soleil","sunglasses",2,"face",1], ["specs","des lunettes rondes","round reading glasses",2,"face",1], ["aviators","des lunettes d'aviateur","aviator sunglasses",2,"face",1], ["heartspecs","des lunettes cœur","heart glasses",2,"face",2],
    ["starspecs","des lunettes étoiles","star glasses",2,"face",17], ["monocle","un monocle","a monocle",2,"face",17],
    ["scarf","une écharpe","a scarf",3,"neck",1], ["bandana","un bandana","a bandana",3,"neck",1], ["tie","une cravate","a tie and shirt collar",3,"neck",1], ["snood","un snood","a chunky knit snood",3,"neck",1], ["lei","un collier de fleurs","a lei of flowers",3,"neck",2],
    ["bowtie","un nœud papillon","a bow tie",3,"neck",19], ["silk","un foulard en soie","a silk scarf",3,"neck",19],
    ["tshirt","un T-shirt","a T-shirt",4,"top",1], ["checked","une chemise à carreaux","a checked shirt",4,"top",1], ["hoodie","un sweat à capuche","a hoodie",4,"top",1], ["cardigan","un gilet","a cardigan",4,"top",1], ["polo","un polo rayé","a striped polo shirt",4,"top",1], ["rugby","un maillot de rugby","a rugby shirt",4,"top",1], ["jersey","un maillot numéro 10","a number 10 jersey",4,"top",21], ["fairisle","un pull jacquard","a fair-isle jumper",4,"top",21],
    ["trainers","des baskets","white trainers",5,"feet",1], ["redsneakers","des baskets rouges","red sneakers",5,"feet",2], ["wellies","des bottes de pluie","wellies",5,"feet",2], ["cowboyboots","des santiags","cowboy boots",5,"feet",2], ["goldshoes","des souliers dorés","gold shoes",5,"feet",24],
    ["backpack","un sac à dos","a backpack",6,"back",1], ["tote","un tote bag","a tote bag",6,"back",2], ["bumbag","une banane","a bum bag",6,"back",2], ["satchel","une besace","a satchel",6,"back",3], ["rucksack","un sac à dos à badges","a rucksack with badges",6,"back",26],
    ["woolgloves","des gants en laine","woollen gloves",7,"hands",2], ["gardengloves","des gants de jardin","gardening gloves",7,"hands",3], ["leathergloves","des gants en cuir","leather gloves",7,"hands",4], ["whitegloves","des gants blancs","white gloves",7,"hands",30],
    ["rosette","la rosette","a rosette on the lapel",8,"neck",1], ["pinsmiley","un pin's smiley","a smiley pin",8,"pin",2], ["pinflag","un pin's drapeau français","a French flag pin",8,"pin",3], ["pinfr","un badge FR","an “FR” badge",8,"pin",3], ["medal","la médaille du lauréat","a laureate's medal",8,"neck",33], ["pinstar","une étoile dorée","a gold star badge",8,"pin",33],
    ["beads","un collier de perles","a bead necklace",9,"jewel",2], ["hoops","des créoles","gold hoop earrings",9,"jewel",2], ["pendant","un pendentif","a gold pendant",9,"jewel",3], ["watch","une montre","a watch",9,"jewel",4], ["pearls","des boucles d'oreilles en perle","pearl earrings",9,"jewel",37], ["bangles","des bracelets en or","gold bangles",9,"jewel",37],
    ["hairblue","des cheveux bleus","blue hair",10,"hairc",2], ["hairpink","des cheveux roses","pink hair",10,"hairc",3], ["hairgreen","des cheveux verts","green hair",10,"hairc",4], ["hairsilver","des cheveux argentés","silver hair",10,"hairc",4], ["hairrainbow","des cheveux arc-en-ciel","rainbow hair",10,"hairc",42], ["hairflame","des cheveux de feu","flame-coloured hair",10,"hairc",42],
    ["coat","un beau manteau","a smart coat",11,"top",1], ["trench","un imperméable","a raincoat",11,"top",2], ["tweed","une veste en tweed","a tweed jacket with elbow patches",11,"top",2], ["denim","une veste en jean","a denim jacket",11,"top",3], ["puffer","une doudoune","a puffer jacket",11,"top",3], ["blazer","un blazer","a blazer with a pocket square",11,"top",3], ["cape","la cape du poète","a poet's cape",11,"top",47], ["leather","un blouson en cuir","a leather jacket",11,"top",47],
    ["flowers","des fleurs","a bunch of flowers",12,"hand",3], ["baguette","une baguette","a baguette under the arm",12,"hand",5], ["books","une pile de livres","a pile of books",12,"hand",7], ["quill","une plume et un encrier","a quill and an inkwell",12,"hand",52],
    ["mask","un masque de théâtre","a theatre mask",13,"hand",3], ["easel","une toile et un pinceau","a canvas and a brush",13,"hand",4], ["violin","un violon","a violin and bow",13,"hand",58], ["lyre","une lyre","a lyre",13,"hand",58], ["guitar","une guitare","a guitar",13,"hand",4], ["accordion","un accordéon","an accordion",13,"hand",5],
    ["tophat","un haut-de-forme","a top hat",14,"head",3], ["bicorne","un bicorne","a bicorne hat",14,"head",5], ["tiara","un diadème","a tiara",14,"head",6], ["featherhat","un chapeau à plume","a feathered hat",14,"head",8], ["laurel","une couronne de laurier","a laurel wreath",14,"head",72], ["crown","une couronne","a crown",14,"head",72],
    ["sash","l'écharpe du diplomate","a diplomat's sash",15,"neck",4], ["cane","une canne à pommeau d'or","a gold-topped cane",15,"hand",5], ["sword","l'épée d'académicien","an academician's sword",15,"hand",82], ["goldquill","la plume d'or","a golden quill",15,"hand",82],
    ["beret","un béret et une marinière","a beret and a striped top",16,"outfit",6], ["artbs","le béret et l'écharpe de l'artiste","the artist's beret and long scarf",16,"outfit",11], ["dots","une robe à pois","a polka-dot dress",16,"outfit",15], ["gown","la toge et la toque","a scholar's gown and cap",16,"outfit",110],
    ["tunic","le costume de danseur","a ballet tunic and tights",17,"outfit",12], ["tutu","le tutu","a tutu and pink tights",17,"outfit",27], ["baton","le chef d'orchestre","a conductor: tailcoat and baton",17,"outfit",130],
    ["chef","le chef","a chef: tall hat and apron",18,"outfit",10], ["painter","le peintre","a painter: smock and palette",18,"outfit",17], ["mime","le mime","a mime: white gloves, striped top",18,"outfit",24], ["cyclist","le maillot jaune","a racing cyclist in yellow",18,"outfit",170],
    ["musketeer","le mousquetaire","a musketeer: hat, cape and boots",19,"outfit",13], ["ambass","l'ambassadeur","an ambassador: tailcoat and sash",19,"outfit",22], ["marianne","Marianne","Marianne: Phrygian cap and tricolour",19,"outfit",30], ["astronaut","l'astronaute","an astronaut",19,"outfit",220],
    ["croissant","le croissant géant","dressed as a giant croissant",20,"outfit",12], ["eiffel","la tour Eiffel","dressed as the Eiffel Tower",20,"outfit",18], ["versailles","le costume de cour","court dress: wig, lace and a cape",20,"outfit",23],
    ["liberty","la statue de la Liberté","dressed as the Statue of Liberty",20,"outfit",270], ["monalisa","la Joconde","in the frame of the Mona Lisa",20,"outfit",270],
    ["thinker","la pose du penseur","the thinker's pose, on Home",21,"pose",15], ["conductor","diriger l'orchestre","conducting, on Home",21,"pose",340],
    ["bow","la révérence","a grand bow, at every celebration",22,"dance",11], ["jig","la gigue","a jig, at every celebration",22,"dance",14], ["cancan","le cancan","the can-can, at every celebration",22,"dance",17],
    ["waltz","la valse","a waltz, at every celebration",22,"dance",380], ["curtain","le salut final","the curtain call, at every celebration",22,"dance",380],
    ["bgParis","Paris","a Paris background",26,"bg",35], ["bgNight","la nuit étoilée","a starry night background",26,"bg",45], ["bgStage","la scène","a stage background",26,"bg",1170],
    ["habit","l'habit vert","the Immortal's green coat, bicorne and sword",27,"outfit",370],
  ].map(([id, fr, en, tier, slot, price])=>({id, fr, en, tier, slot, price, show:false}));
  // a tier's showpieces: its things that cost more than one rank-up gives (they need saving)
  WARDROBE.forEach(it=>{ it.show = it.price>tokensFor(tierRank(it.tier)); });
  const tierFrom = n=>{ const p=WARDROBE.filter(it=>it.tier===n).map(it=>it.price); return p.length ? Math.min(...p) : 0; };
  const W = ()=>G.ward || (G.ward={owned:{}, worn:{}});
  const wearing = ()=>Object.values(W().worn).filter(Boolean);
  // what is worn, given to the picture library: every picture of "you" reads it, the lessons' too (the owner: "buying items and equipping them
  // changes how you always look in lessons"); ?learner=off keeps the plain default everywhere
  const wornOf = id=>{ if(id===uid) return wearing(); try{ const g=JSON.parse(localStorage.getItem("frDIn.g."+id)||"null"); return g && g.ward && g.ward.worn ? Object.values(g.ward.worn).filter(Boolean) : []; }catch(e){ return []; } };
  const wearSync = ()=>{ try{ if(window.PICS && typeof PICS.setWear==="function") PICS.setWear(RULES.LEARNER_FIGURE_ON ? wearing().filter(id=>WARDROBE.some(it=>it.id===id)) : []); }catch(e){} };
  wearSync();
  // what the learner is saving for (one thing, chosen on its sheet; dropped once bought): [it, tokens / price]
  const goalIt = ()=>{ const g=W().goal, it=g && WARDROBE.find(x=>x.id===g); return it && !W().owned[it.id] ? it : null; };
  // a learner's state of a thing: "on" (worn), "own" (bought), "open" (its tier unlocked: for sale), "lock"
  const itemState = it=>{ const w=W(); return w.worn[it.slot]===it.id ? "on" : w.owned[it.id] ? "own" : tierOpen(it.tier) ? "open" : "lock"; };
  // the learner's figure outside lessons, wearing what he chose (the picture library ignores `wear` until it draws the items)
  const avOut = (view, cls)=>AV.svg(AV.get(), Object.assign(typeof view==="string" ? {view} : view, {wear:wearing()}), cls);
  function wardThumb(it){ try{ if(window.PICS && PICS.wardrobeThumb){ const g=PICS.wardrobeThumb(it.id, PICS.avatarParse(AV.get())); if(g) return `<svg viewBox="0 0 160 190" aria-hidden="true">${g.outerHTML}</svg>`; } }catch(e){}
    const glyph = {head:`<path d="M48 104c0-26 64-26 64 0M40 104h80"/>`, neck:`<path d="M52 84c14 12 42 12 56 0M66 92l-6 40M94 92l6 40"/>`, top:`<path d="M58 66l-26 18 10 18 14-8v62h48V94l14 8 10-18-26-18c-4 10-30 10-34 0z"/>`,
      face:`<circle cx="62" cy="96" r="14"/><circle cx="98" cy="96" r="14"/><path d="M76 96h8M34 92l14 2M126 92l-14 2"/>`, hand:`<path d="M58 80h44l8 74H50zM68 80c0-18 24-18 24 0"/>`,
      outfit:`<circle cx="80" cy="54" r="15"/><path d="M80 70v52M80 84l-24 22M80 84l24 22M80 122l-18 40M80 122l18 40"/>`, pose:`<circle cx="80" cy="54" r="15"/><path d="M80 70v52M80 84l-14 22 18 6M80 84l26-8M80 122l-18 40M80 122l18 40"/>`,
      dance:`<circle cx="74" cy="52" r="15"/><path d="M76 68l6 50M78 82l-30-10M78 82l30-22M82 118l-28 26M82 118l30 36"/><path d="M118 112c6-4 12-2 14 4M28 120c4-6 10-6 14-2" stroke-dasharray="3 6"/>`}[it.slot]||"";
    return `<svg viewBox="0 0 160 190" aria-hidden="true"><rect x="9" y="9" width="142" height="172" rx="16" class="ph-box"/><g class="ph-g" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" transform="translate(80 92) scale(.84) translate(-80 -100)">${glyph}</g><text x="80" y="170" text-anchor="middle" class="ph-t">PLACEHOLDER</text></svg>`; }
  // a locked thing: grey, question marks where the thing would be, a lock over it (the owner: "very clear that items are locked")
  const lockTile = (cls="")=>`<span class="wthumb wq${cls}" aria-hidden="true"><span class="wqm">?</span><span class="wlk">${ic("lock")}</span></span>`;
  const opensAt = n=>{ const w=ranksAway(tierRank(n)); return w==="the next rank" ? "at the next rank" : w; };
  function wardrobe(back){ wardrobe.back=back; const o=$("ward"), w=W(), k=G.rank||0, tok=G.tokens||0;
    const nextTok = k<RULES.RANKS.length ? tokensFor(k+1) : 0, nextTs=TIERS.filter(t=>t.rank===k+1);      // what the next rank opens
    const goal=goalIt();
    const card = it=>{ const s=itemState(it), can=tok>=it.price, saving=goal===it, lbl = s==="on" ? "Wearing" : s==="own" ? "Wear it" : can ? `${tokenIcon()}<b class="num">${it.price}</b><span class="wbuy">Buy</span>`
        : `${tokenIcon()}<b class="num">${it.price}</b><span class="wbuy save">${saving ? "Saving" : "Save up"}</span>`;
      return `<button class="witem ${s}${s==="open" && can ? " can" : ""}${it.show && s==="open" ? " show" : ""}${saving ? " goal" : ""}" data-it="${it.id}" aria-label="${esc(it.fr)}, ${esc(it.en)}: ${s==="on" ? "wearing" : s==="own" ? "yours, wear it" : it.price+" "+pl(it.price,"token")+(can ? ", buy" : saving ? ", saving for it" : ", save up for it")}">
        <span class="wthumb" data-lz="w|${it.id}">${s==="on" ? `<span class="won">${ic("check")}</span>` : s==="own" ? `<span class="wown">Yours</span>` : it.show ? `<span class="wshow">${ic("star")}Showpiece</span>` : ""}</span><span class="wfr" lang="fr">${esc(it.fr)}</span><span class="wen">${esc(it.en)}</span>
        <span class="wprice">${lbl}</span></button>`; };
    const lockCard = (n, i)=>`<span class="witem lock" aria-hidden="true">${lockTile()}<span class="wfr">? ? ?</span><span class="wen">Locked</span></span>`;
    const tier = t=>{ const items=WARDROBE.filter(it=>it.tier===t.n), open=tierOpen(t.n), mine=items.filter(it=>w.owned[it.id]);
      const head = `<h3 class="gh wh${open ? "" : " wlockh"}" id="wt${t.n}"><span><span class="wtn">Tier ${t.n}:</span> ${esc(t.cat)}</span>${open ? (items.length ? `<span class="wtier">${tokenIcon()}${items.length>1 ? "from " : ""}${tierFrom(t.n)}</span>` : "") : `<span class="wtier wl">${ic("lock")}Locked</span>`}</h3>`;
      if(open) return `<section class="wtr">${head}${items.length ? `<div class="wgrid2">${items.map(card).join("")}</div>` : `<p class="wsoon">Its things are on their way.</p>`}</section>`;
      // locked: the category and the rank that opens it said plainly; question marks where its things are (anything bought before stays shown, in colour)
      const next = t.rank===k+1, lockN = Math.min(next ? 3 : 5, items.length ? items.length-mine.length : t.soon);      // the next tier full size; the ones after it small
      return `<section class="wtr locked">${head}${mine.length ? `<div class="wgrid2">${mine.map(card).join("")}</div>` : ""}<button class="wlockb" data-tier="${t.n}" aria-label="Tier ${t.n}: ${esc(t.cat)}. Locked. It opens ${opensAt(t.n)}.">
        <span class="wopen">${ic("lock")}<span>Opens ${opensAt(t.n)}</span></span></button>
        ${lockN>0 ? `<button class="wlockb wq-btn" data-tier="${t.n}" tabindex="-1" aria-hidden="true"><span class="wgrid2 wq-grid${next ? "" : " sm"}">${Array.from({length:lockN}, lockCard).join("")}</span></button>` : ""}</section>`; };
    o.innerHTML=`<div class="mk-bar" style="padding:0"><button class="rb plain" id="wdBack" aria-label="Back">${ic("chev")}</button><h2>Your wardrobe</h2></div>
      <div class="card wtop"><div class="wfig">${avOut("standing", "w")}</div><div class="wme">${rankEmblem(k, "emb m")}<b>${rankHtml(k)}</b>${matHtml(k)}
        <div class="wtok">${tokenIcon()}${MV.num("tokW", tok)}<span>token${tok===1?"":"s"}</span></div>
        <small>${k<RULES.RANKS.length ? `${(RULES.RANKS[k]-G.points).toLocaleString("en-GB")} ${pl(RULES.RANKS[k]-G.points, "point")} to the next rank: <b>+${nextTok} token${nextTok===1?"":"s"}</b> ${nextTs.map(t=>` and <b>Tier ${t.n}: ${esc(t.cat)}</b>`).join("")}` : "The highest rank"}</small></div></div>
      ${goal ? `<button class="card wgoal" data-it="${goal.id}" aria-label="Saving for ${esc(goal.fr)}: ${Math.min(tok, goal.price)} of ${goal.price} tokens"><span class="wg-th" data-lz="w|${goal.id}"></span><span class="wg-t"><small>Saving for</small><b lang="fr">${esc(goal.fr)}</b>
        <span class="wg-bar"><i style="--f:${Math.min(1, tok/goal.price).toFixed(3)}"></i></span><span class="wg-n">${tokenIcon()}<b class="num">${Math.min(tok, goal.price)}</b> / ${goal.price}${tok>=goal.price ? ` <em>Ready to buy</em>` : ""}</span></span></button>` : ""}
      ${lookCard(back)}${freezeCard()}<h3 class="hsec">Things to wear</h3>
      ${TIERS.map(tier).join("")}
      <p class="foot">What you wear shows on your figure wherever you are: at home, in the lessons and at your celebrations.</p>`;
    o.hidden=false; if(!wardrobe.keep) o.scrollTop=0; wardrobe.keep=false; MV.count(o); LZ.watch(o); COACH.learned("rank"); COACH.arrive();
    $("wdBack").onclick=()=>{ tick(); WC.stop(); o.hidden=true; if(back) back(); else home(); };
    o.querySelectorAll("button[data-it]").forEach(b=>{ b.onclick=()=>{ tick(); const it=WARDROBE.find(x=>x.id===b.dataset.it); wardItem(it, back); MV.grow(b.querySelector(".wthumb svg"), document.querySelector("#sheet .wbig svg")); }; });
    o.querySelectorAll("[data-tier]").forEach(b=>{ b.onclick=()=>{ tick(); tierLocked(+b.dataset.tier); }; }); }
  // a locked tier, tapped: what it is, and the rank that opens it
  function tierLocked(n){ const t=TIERS[n-1], pts=Math.max(0, RULES.RANKS[t.rank-1]-(G.points||0)), cnt=WARDROBE.filter(it=>it.tier===n).length || t.soon;
    info(`Tier ${n}: ${t.cat}`, `<div class="wbig wlockbig">${lockTile(" big")}</div><p class="wsub"><b>Locked.</b> ${cnt} ${pl(cnt, "thing")} to wear${tierFrom(n) ? `, from ${tierFrom(n)} ${pl(tierFrom(n), "token")}` : ""}.</p>
      <p>It opens <b>${opensAt(n)}</b>: ${pts.toLocaleString("en-GB")} ${pl(pts, "point")} to go.</p>`, "Close"); }
  function tokenIcon(){ return `<svg class="tokn" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.6" fill="#E3A417"/><circle cx="10" cy="10" r="6.2" fill="none" stroke="#A66F00" stroke-width="1.3"/><path d="M10 5.6l1.3 2.8 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z" fill="#FFF6DA"/></svg>`; }
  function wardItem(it, back){ if(itemState(it)==="lock") return tierLocked(it.tier); const w=W(), own=!!w.owned[it.id], on=w.worn[it.slot]===it.id, tok=G.tokens||0, short=it.price-tok;
    const again=()=>{ wardrobe.keep=true; wardrobe(back); };
    info(it.fr, `<div class="wbig">${wardThumb(it)}</div><p class="wsub">${esc(it.en)}</p>
      ${own ? `<button class="btn" id="wdWear">${on ? "Take it off" : "Wear it"}</button>`
        : short<=0 ? `<button class="btn" id="wdBuy">${tokenIcon()} Buy it for ${it.price} token${it.price>1?"s":""}</button>`
        : `<p>${short} more token${short>1?"s":""} to go.</p><button class="btn" id="wdSave">${w.goal===it.id ? "Stop saving for it" : "Save up for it"}</button>`}`, !own && short<=0 ? "Not now" : "Close");
    { const sv=$("wdSave"); if(sv) sv.onclick=()=>{ tick(); if(w.goal===it.id) delete w.goal; else w.goal=it.id; store(); try{ trace("wardrobe: saving for "+(w.goal||"nothing")); }catch(e){} sheetClose($("sheet")); again(); }; }      // (ward2, Jon: "choose between saving up tokens Vs using them")
    if(it.slot==="dance" && !lessMotion()){ try{ const big=document.querySelector("#sheet .wbig svg"), g=PICS.wardrobeThumb(it.id, PICS.avatarParse(AV.get()), {live:true}); if(big && g){ big.innerHTML=""; big.appendChild(g); } }catch(e){} }  // (figures7) the dance plays on the item's own sheet
    const bb=$("wdBuy"); if(bb) bb.onclick=()=>{ if((G.tokens||0)<it.price) return; const before=wearing(), prevWorn=Object.assign({}, w.worn); G.tokens-=it.price; w.owned[it.id]=new Date().toISOString(); w.worn[it.slot]=it.id; if(it.slot==="outfit"){ for(const s of ["top","head"]) delete w.worn[s]; } else if(["top","head"].includes(it.slot)) delete w.worn.outfit;
      if(w.goal===it.id) delete w.goal; store(); wearSync(); try{ trace("wardrobe: bought "+it.id+" for "+it.price+" token(s); "+G.tokens+" left"); }catch(e){} try{ UI.haptic("done"); }catch(e){} sheetClose($("sheet")); again(); WC.run(it, before, prevWorn); };      // (game feel) the purchase ceremony
    const bw=$("wdWear"); if(bw) bw.onclick=()=>{ if(on) delete w.worn[it.slot]; else { w.worn[it.slot]=it.id; if(it.slot==="outfit"){ for(const s of ["top","head"]) delete w.worn[s]; } else if(["top","head"].includes(it.slot)) delete w.worn.outfit; }
      store(); wearSync(); sheetClose($("sheet")); again(); }; }

  /* ---- the end of a lesson: the record, the rules, the screen ---- */
  function lessonDone(){ const li=S.lesson, L=LESSONS[li], cur=G.cur && G.cur.lesson===L.id ? G.cur : {lesson:L.id, t0:"", kind:""};
    const R0=ringsNow(), p0 = cur.p0!=null ? cur.p0 : null;
    const sc=score(L.id, cur.t0), passed = !RULES.GATE_ON || (RULES.MASTERY ? lessonPerfect(L) : sc.y>=RULES.PASS_MARK), now=new Date(), today=dayOf(now), firstPass = passed && li>=G.furthest;
    let why="";
    const again = (cur.kind==="again" || (G.again && G.again.li===li)) && li<G.furthest, practice = again && !RULES.AGAIN_FILLS_RINGS;
    if(G.again && G.again.li===li){ try{ trace("a passed lesson done again by choice has ended: the place is put back"); }catch(e){} restoreAgain(); }
    if(G.replay){ /* (MASTERY) one exercise or "Go for perfect" done again: it moves nothing here; replayDone says what it opened */ }
    else if(again){ /* a lesson already passed, done again by choice: it locks nothing and moves nothing (QA .67: also when no place was kept for it, e.g. one begun under .65) */ }
    else if(passed){ G.below[L.id]=0; G.next=Math.min(li+1, last); G.furthest=Math.max(G.furthest, li+1); if(G.why==="warm" && G.warmTo!=null && G.next<G.warmTo) G.why="warm"; else { G.why=""; G.warmTo=null; } }
    else if(RULES.MASTERY){ G.next=li; G.why=why="perfect"; G.warmTo=null; }      // (MASTERY) no step back, no lesson once more: its yellow exercises, then the next
    else if((G.below[L.id]||0)>=RULES.REPEATS_BEFORE_STEP_BACK && li>0){ G.below[L.id]=0; G.next=Math.max(0, li-RULES.STEP_BACK_LESSONS); G.why=why="back"; }
    else { G.below[L.id]=(G.below[L.id]||0)+1; G.next=li; G.why=why="once"; }
    // points: fixed for the lesson (an error neither costs nor pays); the one bonus is for two lessons well apart; a small one for coming back
    if(G.replay) return replayDone();
    const exPts = G.lpts[L.id] || 0; delete G.lpts[L.id];
    let pts=0, bonus=0, back=0, perfectNow=false;
    if(lessonPerfect(L) && !G.lp[L.id]){ G.lp[L.id]=today; perfectNow=true; pts+=RULES.POINTS_PERFECT_LESSON; }
    const runPerfect = RUN.ex.length===L.exercises.length && RUN.ex.every(x=>x.perfect), runEx=RUN.ex.slice(); RUN.ex=[];
    const d=G.days[today]||(G.days[today]={n:0, firstEnd:"", full:false});
    if(!practice && d.n===1 && !d.full && cur.t0 && (new Date(cur.t0)-new Date(d.firstEnd))>=RULES.SPACING_GAP_HOURS*3600e3){ d.full=true; bonus=1; }      // recognised, without points (the owner)
    if(!practice && d.n===0){ d.firstEnd=now.toISOString(); d.am = now.getHours()<14; }
    STK.up=null; const firstToday = d.n===0 && !d.a;
    if(firstToday){      // the first thing done today (a lesson, or a passed lesson done again)
      const gap = G.run.last ? daysBetween(G.run.last, today) : 0;
      if(G.run.last && gap-1>=RULES.RETURN_AFTER_DAYS) back=1;      // recognised, without points
      G.daysLearned++; }
    streakLesson(today, firstToday);      // (streak) the run of days, the catch-up, the badges and their tokens
    if(!firstToday && !practice && d.n===1 && !d.full){ d.soon=true; }
    if(practice){ d.a=(d.a||0)+1; try{ trace("a passed lesson done again by choice: practice, the rings stand as they were"); }catch(e){} } else { d.n++; d.xp=0; }
    TY.bank("lesson", pts); G.points+=pts;
    // the pace: only a lesson done from its start in one sitting (under an hour and a half)
    if(cur.fromStart && cur.t0){ const secs=(now-new Date(cur.t0))/1000, t=tasksOf(L); if(t>0 && secs>60 && secs<5400){ G.pace.push(+(secs/t).toFixed(2)); G.pace=G.pace.slice(-9); } }
    const owned = firstPass ? cardsOf(L.id) : []; if(firstPass && !G.wordsAt[L.id]) G.wordsAt[L.id]=today;
    if(RULES.TOKENS_PER_PERFECT_LESSON && runPerfect && !(G.tp||(G.tp={}))[L.id]){ G.tp[L.id]=today; const n=earn(RULES.TOKENS_PER_PERFECT_LESSON); if(G.tally) G.tally.tok=(G.tally.tok||0)+n; try{ trace("tokens: +"+n+" for a perfect lesson ("+L.id+")"); }catch(e){} }      // (ward2) the trickle: a perfect lesson, once a lesson (no back-pay for lessons before it)
    const badge = newBadge(today), level = newLevel(today), ranks = rankSync(), R1 = ringsNow(now);
    (G.lessons[L.id]=G.lessons[L.id]||[]).push({date:today, x:sc.x, y:sc.y, passed, pts:exPts+pts, perfect:runPerfect});
    G.cur=null; store(); look();
    try{ trace("lesson complete: Lesson "+(li+1)+": "+sc.x+" correct responses, "+sc.y+" % first time ("+sc.first+" of "+sc.scored+" scored); "+(passed?"passed":"below "+RULES.PASS_MARK+" %: "+why)+"; next: Lesson "+(G.next+1)); }catch(e){}
    showDone({li, sc, passed, why, R0, R1, ranks, p0: p0!=null ? p0 : G.points-exPts-pts, pts:exPts+pts, lessonBonus:pts, perfectNow, runPerfect, runEx, bonus, back, soon: d.soon && d.n===2, owned, badge, level, stageDone: firstPass && stageOf(li+1) && stageOf(li+1).last===li+1 ? stageOf(li+1) : null}); }
  function summaryIn(o){ try{ o.getAnimations({subtree:true}).forEach(a=>{ const t=a.effect && a.effect.target; if(t && t.closest && !t.closest(".rkc")){ a.cancel(); a.play(); } }); }catch(e){} MV.stagger(o); }
  const longName = o=>{ try{ const h1=o.querySelector("h1"); if(h1 && String(S.learnerName||"").length>11) h1.classList.add("ln"); }catch(e){} };      // (QA .67)
  function showDone(r){ const name=esc(S.learnerName||""), n=r.li+1, o=$("done"), first=completions()<=1, L=LESSONS[r.li], nPerf=r.runEx.filter(x=>x.perfect).length;
    const head = r.runPerfect ? `<svg class="seal" viewBox="0 0 56 70"><use href="#i-rosette"/><text x="28" y="31.5" text-anchor="middle" font-family="Fraunces" font-weight="600" font-size="${n>9?12:15}" fill="#fff" style="font-variation-settings:'SOFT' 100">${n}</text></svg><div class="perfect-tag">${ic("star")} A perfect lesson</div><h1>Magnifique${name?", "+name:""} !</h1><div class="sub">Every answer right, first time.</div>`
      : r.passed ? `<svg class="seal" viewBox="0 0 56 70"><use href="#i-rosette"/><text x="28" y="31.5" text-anchor="middle" font-family="Fraunces" font-weight="600" font-size="${n>9?12:15}" fill="#fff" style="font-variation-settings:'SOFT' 100">${n}</text></svg><h1>Bravo${name?", "+name:""} !</h1><div class="sub">Lesson ${n} is done.</div>`
      : `<div class="sunmark">${ic("sun")}</div><h1>Well done${name?", "+name:""}.</h1><div class="sub">You finished Lesson ${n}.</div>`;
    o.innerHTML = head
      + `<div class="card say">In this lesson you made <b class="first" data-n="${r.sc.x}">${r.sc.x}</b> correct ${pl(r.sc.x, "response")} and you were <b data-n="${r.sc.y}" data-pc="1">${r.sc.y}%</b> correct.${first?`<small>${r.sc.y}% of your answers were right the first time you were asked.</small>`:""}</div>`
      + (r.why==="perfect" ? `<div class="card nextc lockc"><div class="orb">${ic("lock")}</div><div><b>Lesson ${n+1}</b><p>${n<LESSONS.length ? "Opens when all are green" : "Coming in a later version; first, all green here"}</p></div></div>` : "")
      + (r.why==="once" ? `<div class="card nextc"><div class="orb">${ic("redo")}</div><div><b>Lesson ${n} once more</b><p>You just need a bit more practice before moving on.</p></div></div>`
        : r.why==="back" ? `<div class="card nextc"><div class="orb">${ic("redo")}</div><div><b>A warm-up first</b><p>You are nearly there. Lesson ${G.next+1} first, then back to Lesson ${n}.</p></div></div>` : "")
      + `<div class="card exstrip"><div class="row"><b>${nPerf} of ${L.exercises.length} exercises perfect</b>${r.pts>0 ? `<span class="pts">${ic("star")} +${r.pts}</span>` : ""}</div><div class="exdots">${L.exercises.map(x=>{ const g=G.ex[x.id]; return `<i class="${g ? (g.g?"g":"y") : ""}"></i>`; }).join("")}</div></div>`
      + (r.bonus ? `<div class="tile two"><div class="orb">${ic("moon")}</div><div><b>A full day</b><small>Two lessons, well apart.</small></div></div>` : r.back ? `<div class="tile two back"><div class="orb">${ic("sun")}</div><div><b>Welcome back</b></div></div>` : "")
      + (r.soon ? `<div class="line">Done. Your next lesson will stick better after a break.</div>` : "")
      + (r.badge ? `<div class="card badgec">${badgeSvg(r.badge, "badge big")}<div><small>A new badge</small><b>${badgeName(r.badge)}</b></div></div>` : "")
      + (r.owned.length ? `<div class="card nowyours"><div class="row"><b>Now yours</b></div><div class="wrow">${r.owned.map((c,i)=>wcard(c, " turn").replace("<button", `<button style="--i:${i}"`)).join("")}</div></div>` : "")
      + (r.R1 ? ringsCard(r.R1, r.R0) : "")
      + (r.stageDone && r.stageDone.canDo ? `<div class="card cando"><b>Stage ${r.stageDone.id} is done.</b><p>${esc(r.stageDone.canDo)}</p></div>` : "")
      + `<div class="spacer"></div><div class="donefoot">${rankBar(G.points, G.points)}${r.why==="perfect" ? `<button class="btn" id="doneBtn">${ic("star")} Go for perfect: ${toPerfect(r.li).length}</button><button class="btn quiet" id="doneLater">Later</button>` : `<button class="btn" id="doneBtn">Continue</button>`}</div>`;
    if((r.passed || r.runPerfect) && W().worn.dance && AV.has() && !lessMotion()){ try{ const c=document.createElementNS("http://www.w3.org/2000/svg","svg"); c.setAttribute("viewBox","0 0 160 190"); c.setAttribute("class","celebfig"); c.setAttribute("aria-hidden","true");
        c.appendChild(PICS.avatar(PICS.avatarParse(AV.get()), {view:"celebrate", wear:wearing()})); o.insertBefore(c, o.firstChild); }catch(e){} }  // (figures7) the dance the learner wears, at the celebration
    longName(o); store(); o.hidden=false; o.scrollTop=0; wireCards(o);
    $("doneBtn").onclick=()=>{ tick(); RK.stop(); TY.stop(); FIVE.stop(); o.hidden=true; stopFete(); if(r.why==="perfect"){ home(); goPerfect(r.li); return; } if(r.level) levelParty(r.level, ()=>home()); else home(); };
    { const dl=$("doneLater"); if(dl) dl.onclick=()=>{ tick(); RK.stop(); TY.stop(); FIVE.stop(); o.hidden=true; stopFete(); home(); }; }
    const big = r.passed || r.runPerfect || !!(r.ranks && r.ranks.length) || !!(r.R1 && r.R1.week.closed && !r.R0.week.closed);
    // (game feel) a new rank: its ceremony first, then the summary (its numbers count, its rings fill, its moments play once it is in view)
    // (the tally) the points of this lesson (and any left waiting) fill the rank bar first, its rank-ups inside it; then the summary
    // (hf2) the heading first, then the high five (what it celebrates is in view), then the tally
    FIVE.run(o, ()=>TY.run(o, how=>{ FIVE.after(); if(how!=="none") summaryIn(o); if(r.R1) ringsAnimate(o.querySelector(".ringc"), r.R0, r.R1); fete(o, big && how!=="ward"); moments(o, r); })); }
  // a ring closed by this lesson is said in words, once, at its end; a ring still open is just shown (never as missed)
  function ringsCard(R, R0){ const day = !R0.day.closed && R.day.closed, two = R0.day.n<2 && R.day.n>=2, week = !R0.week.closed && R.week.closed;
    const head = week ? `This week's goal is met: ${R.week.n} lesson${R.week.n===1?"":"s"}!` : two ? "Two lessons today: the gold ring." : day ? "Today's goal is met." : "";
    return `<div class="card ringc${week?" big":""}">${head ? `<div class="rhead${two&&!week?" gold":""}">${two&&!week?ic("star"):ic("check")}<span>${head}</span></div>` : ""}<div class="rbody">${ringsSvg(R)}${ringRows(R, true)}</div></div>`; }
  function rankUpCard(got){ if(!got || !got.length) return ""; const k=got[got.length-1], t=got.reduce((a,j)=>a+tokensFor(j),0);
    return `<div class="card rankup"><div class="rkem">${rankEmblem(k, "emb big")}</div><div><small>${got.length>1 ? got.length+" new ranks" : "A new rank"}</small><b>${esc(rankName(k))}</b><p>${tokenIcon()}<span><b class="num">+${t}</b> token${t===1?"":"s"}</span></p></div></div>`; }
  // (ward2) every rank-up has the same ceremony, scaled by what changed: "grade" the same material, "title" a new material, "jubilee" the first
  // rank in a jubilee's material (Silver, Ruby, Golden, Diamond, Sapphire, Platinum), "top" the last
  function rkKind(k0, k1){ if(k1>=RULES.RANKS.length) return "top"; let jub=false; for(let j=k0+1;j<=k1;j++) if(jubileeOf(j)) jub=true;
    return jub ? "jubilee" : MAT_OF[rankAt(k1)]!==MAT_OF[rankAt(k0)] ? "title" : "grade"; }
  const rkJubilee = (k0, k1)=>{ let n=""; for(let j=k0+1;j<=k1;j++) n=jubileeOf(j)||n; return n; };
  // (ward2) what a rank-up gives in the wardrobe: the tier it opens
  function rkGift(k0, k1){ const ns=TIERS.filter(t=>t.rank>k0 && t.rank<=k1).map(t=>t.n); if(!ns.length) return null; const t=TIERS[ns[ns.length-1]-1];
    return {tier:t, tiers:ns, n:WARDROBE.filter(it=>it.tier===t.n).length}; }
  /* ---- (game feel, 16 Nov) THE RANK-UP CEREMONY. The owner: "When I ranked up, this screen was the only indication that I'd ranked up. Much
     more needs to be made of this ... so it's clear that it's an absolutely massive deal! And it also needs to show very clearly what that new
     rank gives you." Over the lesson-complete screen, before its summary: (A, until hf2: now FIVE, before the tally) the learner and Marie meet and celebrate (PICS.highFive when the
     picture library has it; until then the two figures leap together), (B) the old emblem becomes the new one (anticipation, a flash, the
     reveal: a new star the short way, a new title the full way, Immortel the grandest), (D) what it gives: the tokens fly into the counter and
     the wardrobe turns to a thing the learner can now have. Music made here (Web Audio; the setting "Sounds when you press"). A tap skips to the
     end after the first second; with less movement a calm still version; the words are said to a screen reader. dev/design/RANKUP.md. ---- */
  const tips = ()=>G.seen || (G.seen={});      // what the learner has been shown once (the ceremony's rule; the coach marks)
  const RK = (()=>{ let C=null;
    const kindOf = rkKind;      // (ward2) no tiers of ranks: the same ceremony, stronger for a new material, a jubilee and the last
    // the thing to show: one the learner can buy now and could not before (the cheapest), else the cheapest they can buy, else the nearest
    // (ward2, Jon: "instead of [an item in reach], a new tier of items is unlocked") what to show: the tier this rank opens
    const pick = (k0, k1)=>rkGift(k0, k1);
    const rnd=(a,b)=>a+Math.random()*(b-a);
    // the emblem as a shape of light (the anticipation shows the old sign and the new one in turn, in this light)
    function ghostEmblem(k){ const t=rankTitle(k), ink="#B88A1E";
      return `<svg class="emb" viewBox="0 0 56 64" aria-hidden="true"><path d="M28 3.5l20.5 6v20.5c0 14.5-9 22.5-20.5 28.5C16.5 52.5 7.5 44.5 7.5 30V9.5z" fill="#FFFBEF" stroke="#FFE9A8" stroke-width="2.2" stroke-linejoin="round"/>
        <g transform="translate(18 18.5)" fill="none" stroke="${ink}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" color="${ink}">${GLYPH[t]}</g></svg>`; }
    /* (Jon, 17 Nov: "the part where a wardrobe item is 'in reach' needs to be changed because now, instead of that, a new tier of items is
       unlocked. This will need a dedicated animation where the new tier is unlocked and the cards go from dark to revealed. Usually an animation
       of a padlock being unlocked helps with this") THE TIER UNLOCK, after the brand's stamp: the tier's cards, dark, with "?"; a padlock over
       them. Anticipation: the padlock shakes (two ticks). The key turns: the body gives, the shackle springs up and swings open with a click.
       Follow-through: the padlock pops and falls away, sparks; then the cards turn over one after another, left to right, a rising note each,
       dark to revealed; then "Tier 3: Scarves and ties, unlocked" and the way to the wardrobe. The same timing every time (RANKUP.md 10). */
    const PADLOCK = `<svg viewBox="0 0 60 74" aria-hidden="true"><defs><linearGradient id="rkPl" x1="0" y1="0" x2=".5" y2="1"><stop offset="0" stop-color="#FCE08A"/><stop offset="1" stop-color="#D49A1C"/></linearGradient></defs>
      <g class="rk-shk"><path d="M17 34V21a13 13 0 0 1 26 0v13" fill="none" stroke="#8A6A1E" stroke-width="7.5" stroke-linecap="round"/><path d="M17 34V21a13 13 0 0 1 26 0v13" fill="none" stroke="#E9C46A" stroke-width="3" stroke-linecap="round"/></g>
      <rect x="7" y="32" width="46" height="38" rx="9" fill="url(#rkPl)" stroke="#8A6A1E" stroke-width="2.6"/><path d="M12 38h36" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>
      <circle cx="30" cy="48" r="5" fill="#5A4210"/><path d="M27.6 50h4.8l1.6 10h-8z" fill="#5A4210"/></svg>`;
    const unlockCards = P=>{ const its=WARDROBE.filter(it=>it.tier===P.tier.n).slice(0, 4);
      return (its.length ? its : [null, null, null]).map((it, i)=>`<div class="rk-c${it && it.show ? " show" : ""}" data-id="${it ? it.id : ""}" style="--i:${i}"><span class="th"></span><span class="rk-q" aria-hidden="true"><span class="rq">?</span></span><span class="pr">${it ? tokenIcon()+`<b>${it.price}</b>` : "…"}</span></div>`).join(""); };
    function unlockThumbs(c){ const r=c.root; [...r.querySelectorAll(".rk-c")].forEach((cd, n)=>c.at(120+n*70, ()=>{ const th=cd.querySelector(".th"), it=WARDROBE.find(x=>x.id===cd.dataset.id); if(!it || th.firstChild) return; th.innerHTML=wardThumb(it); const v=th.querySelector("svg"); if(v){ try{ v.pauseAnimations(); v.setCurrentTime(0.9); }catch(e){} } })); }
    // the end state (calm, skip): open, the padlock gone, every card revealed, the words
    function unlockEnd(c){ const r=c.root; r.querySelectorAll(".rk-c").forEach(cd=>{ try{ cd.getAnimations().forEach(a=>a.cancel()); }catch(e){} cd.classList.add("rev"); const th=cd.querySelector(".th"), it=WARDROBE.find(x=>x.id===cd.dataset.id); if(it && !th.firstChild) th.innerHTML=wardThumb(it); });
      const lk=r.querySelector(".rk-lock"); if(lk){ try{ lk.getAnimations({subtree:true}).forEach(a=>a.cancel()); }catch(e){} lk.classList.add("gone"); } r.classList.add("lit"); }
    // the play, from the start of stage D (ms); returns when it ends
    function unlockPlay(c){ const r=c.root, at=(ms,f)=>c.at(ms,f), lk=r.querySelector(".rk-lock"), shk=r.querySelector(".rk-shk"), cards=[...r.querySelectorAll(".rk-c")];
      const T0=1350, TURN=T0+520, POP=TURN+260, FLIP=POP+260, STEP=170, END=FLIP+(cards.length-1)*STEP+290;
      // anticipation: the padlock shakes, a tick at each turn
      at(T0, ()=>{ try{ lk.animate([{transform:"rotate(0)"},{transform:"rotate(-9deg)"},{transform:"rotate(8deg)"},{transform:"rotate(-6deg)"},{transform:"rotate(4deg)"},{transform:"rotate(0)"}], {duration:440, easing:"ease-in-out"}); }catch(e){} SFX.tickS(); });
      at(T0+220, ()=>SFX.tickS());
      // the key turns: the body gives under it, the shackle springs up and swings open; the click is on the snap
      at(TURN, ()=>{ try{ lk.animate([{transform:"scale(1)"},{transform:"scale(1.1,.9)"},{transform:"scale(.97,1.04)"},{transform:"scale(1)"}], {duration:240, easing:"cubic-bezier(.2,.8,.3,1)"}); }catch(e){}
        try{ shk.animate([{transform:"translateY(0) rotate(0)"},{transform:"translateY(-9px) rotate(0)", offset:.3},{transform:"translateY(-9px) rotate(-44deg)", offset:.78},{transform:"translateY(-9px) rotate(-36deg)"}], {duration:300, easing:"cubic-bezier(.3,1.4,.5,1)", fill:"forwards"}); }catch(e){}
        SFX.unlock(); try{ if(UI.pref.haptics!==false && navigator.vibrate) navigator.vibrate(28); }catch(e){} });
      // follow-through: the padlock pops and falls away, sparks where it was
      at(POP, ()=>{ try{ lk.animate([{transform:"translateY(0) scale(1)", opacity:1},{transform:"translateY(-16px) scale(1.08)", opacity:1, offset:.3},{transform:"translateY(70px) rotate(22deg) scale(.7)", opacity:0}], {duration:520, easing:"cubic-bezier(.5,0,.8,.6)", fill:"forwards"}); }catch(e){}
        const box=r.querySelector(".rk-cards"); if(box) sparkAt(box, box.clientWidth/2, 40, 14, {r0:30, r1:90, t0:600, t1:900, fall:30}); });
      // the cards turn over, one after another: dark to revealed, a rising note each
      cards.forEach((cd, i)=>at(FLIP+i*STEP, ()=>{ try{ cd.animate([{transform:"rotateY(0)"},{transform:"rotateY(90deg)"}], {duration:110, easing:"ease-in"}).onfinish=()=>{ cd.classList.add("rev");
          try{ cd.animate([{transform:"rotateY(-90deg) scale(1.04)"},{transform:"rotateY(8deg) scale(1.06)", offset:.7},{transform:"rotateY(0) scale(1)"}], {duration:190, easing:"ease-out"}); }catch(e){} }; }catch(e){ cd.classList.add("rev"); } SFX.ting(i+1); }));
      // the words: unlocked; a chord
      at(END, ()=>{ r.classList.add("lit"); SFX.stamp(true); });
      return END; }
    function run(o, got, done, tokNow){ stop(); if(!got || !got.length || !o || o.hidden===undefined){ if(done) done("none"); return; }
      const k1=got[got.length-1], k0=got[0]-1, kind=kindOf(k0, k1), calm=lessMotion(), add=got.reduce((a,j)=>a+tokensFor(j),0), tok1=tokNow!=null ? tokNow : G.tokens||0, tok0=Math.max(0, tok1-add);
      const P=pick(k0, k1);      // (hf2, 17 Nov) no stage A (the two of them) here now: the high five plays on the lesson-complete screen itself, after its heading and before the tally (FIVE)
      const D = calm ? {A:0, B:1700, D:900} : kind==="grade" ? {A:0, B:3200, D:2900} : kind==="title" ? {A:0, B:3500, D:3000} : {A:0, B:3900, D:3100};      // (17 Nov) B: the hold, the fall, the strike, the name
      const lab = kind==="top" ? "The highest rank" : kind==="jubilee" ? "The "+rkJubilee(k0, k1)+" Jubilee" : got.length>1 ? got.length+" new ranks" : "A new rank";
      const name = rankName(k1);
      // (ward2) the tier this rank opens: its cards, dark, under a padlock
      const more = P && P.tiers.length>1 ? ` and ${P.tiers.length-1} more` : "", from = P ? tierFrom(P.tier.n) : 0;
      const cap = !P ? "" : `<b>Tier ${P.tier.n}: ${esc(P.tier.cat)}${more}, unlocked</b>`;      // (owner, 17 Nov: "The subtitle about '7 things to wear' etc should be removed")
      const say = `${lab}: ${rankLabel(k1)}, ${matName(k1).toLowerCase()}. Plus ${add} token${add>1?"s":""}: you have ${tok1}. `+(!P ? "" : `Tier ${P.tier.n} is unlocked: ${P.tier.cat}.`);
      const root=el(`<div class="rkc k-${kind}${calm?" calm":""}" role="dialog" aria-modal="true" aria-label="${esc(lab)}" tabindex="-1">
        <div class="rk-bg"></div><div class="rk-bg2"></div>
        <div class="rk-ev"><div class="rk-lab">${esc(lab)}</div><div class="rk-em"><div class="rk-rays"></div><div class="rk-glow"></div><div class="rk-sh"></div><div class="rk-hot"></div><div class="rk-old">${rankEmblem(k0, "emb rk0")}</div><div class="rk-gold">${ghostEmblem(k0)}</div><div class="rk-gnew">${ghostEmblem(k1)}</div><div class="rk-new">${rankEmblem(k1, "emb rk1")}</div>${kind==="grade" ? `<div class="rk-star" style="--sx:50%;--sy:44%"><svg viewBox="0 0 28 28"><use href="#i-star"/></svg></div>` : ""}</div>
          <div class="rk-names"><div class="rk-oname">${rankHtml(k0)}${matHtml(k0)}</div><div class="rk-name">${rankHtml(k1)}${matHtml(k1)}</div></div></div>
        <div class="rk-gift">
          <div class="rk-tok"><span class="rk-tk">${tokenIcon()}</span><span class="rk-tt"><b>+${add} token${add>1?"s":""}</b><span>You have <b class="num rk-n">${tok0}</b></span></span></div>
          ${P ? `<div class="rk-ward rk-unl"><div class="rk-wh"><b>Tier ${P.tier.n}: ${esc(P.tier.cat)}</b><small class="rk-ust"><span class="l">Locked</span><span class="u">Unlocked</span></small></div><div class="rk-cards">${unlockCards(P)}<div class="rk-lock">${PADLOCK}</div></div><div class="rk-cap">${cap}</div></div>` : ""}
          <div class="rk-btns"><button class="btn" id="rkGo">Continue</button>${P ? `<button class="btn quiet" id="rkWard">Go to the wardrobe</button>` : ""}</div></div>
        <div class="rk-flash" aria-hidden="true"></div><button class="rk-skip" id="rkSkip" hidden>Skip</button><div class="rk-live" aria-live="polite"></div></div>`);
      const c = C = {o, root, timers:new Set(), done, kind, calm, P, tok0, tok1, settled:false, auto:0};
      const at=(ms,f)=>{ const t=setTimeout(()=>{ c.timers.delete(t); if(C!==c) return; try{ f(); }catch(e){ try{ trace("FAULT rank ceremony: "+e.message); }catch(_){} } }, Math.max(0, ms)); c.timers.add(t); };
      c.at=at;
      // under it, the summary is out of reach (and does not scroll) until it is over
      c.inert=[...o.children]; c.inert.forEach(x=>{ x.inert=true; }); c.ov=o.style.overflow; o.style.overflow="hidden"; o.scrollTop=0;
      o.appendChild(root); try{ root.focus({preventScroll:true}); }catch(e){}
      try{ trace("the rank ceremony: "+rankName(k0)+" to "+rankName(k1)+" ("+kind+"), +"+add+" token(s), "+tok1+" now; opened: "+(P ? "Tier "+P.tier.n+" ("+P.tier.cat+")" : "nothing")); }catch(e){}
      setTimeout(()=>{ const lv=root.querySelector(".rk-live"); if(lv) lv.textContent=say; }, 250);
      // the pictures of the strip, one at a time while the first stages play (the one to show first)
      if(P) unlockThumbs(c);      // (ward2) the tier's pictures, drawn under their dark cards while the stamp plays
      root.addEventListener("click", e=>{ if(e.target.closest("button")) return; if(!c.settled && c.skippable) skip(); });
      root.addEventListener("keydown", e=>{ if(e.key==="Escape"){ e.preventDefault(); if(!c.settled) skip(); else close("go"); } });
      const sk=root.querySelector("#rkSkip"); sk.onclick=()=>{ if(!c.settled) skip(); };
      root.querySelector("#rkGo").onclick=()=>{ tick(); close("go"); };
      const wb=root.querySelector("#rkWard"); if(wb) wb.onclick=()=>{ tick(); close("ward"); };
      at(1000, ()=>{ c.skippable=true; sk.hidden=false; });
      let t=0;
      // (B) the emblem becomes the new one
      at(t, ()=>stageB(c, D)); if(kind==="jubilee" && !calm) at(t+2120+900, ()=>SFX.fanfare(true)); t+=D.B;
      // (D) what it gives
      at(t, ()=>stageD(c, D)); }
    /* (the owner, 17 Nov: "show the current rank for a few seconds, then the new rank flies in and stamps over the current one like a blacksmith
       stamping a brand into an item, with a satisfying clang sound") the hold, the fall (accelerating, like a hammer), the impact (the screen
       shakes and settles, both shields squash and recover, a white-hot flash, sparks, an ember ring, an anvil's clang, a strong pulse in the
       hand), the old rank gone under the new; then its name and English settle with a soft chord. The same for every rank; a new tier (a new
       metal) strikes harder; the last rank the hardest. Calm: a cut, the clang only. */
    function stageB(c, D){ const r=c.root, at=(ms,f)=>c.at(ms,f), big=c.kind!=="grade", top=c.kind==="top"; r.classList.remove("sA","aOut"); r.classList.add("sB","st");
      const em=r.querySelector(".rk-em"), nw=r.querySelector(".rk-new"), old=r.querySelector(".rk-old"), ev=r.querySelector(".rk-ev");
      if(c.calm){ at(900, ()=>{ r.classList.add("rev"); SFX.clang(false); }); return; }
      const HOLD=1500, UP=320, FALL=300, T=HOLD+UP+FALL, sh=r.querySelector(".rk-sh");
      // the wind-up: the new shield rises into view above, large, and hangs a moment (the eye goes to it), then drops like a hammer
      at(HOLD, ()=>{ r.classList.add("falling"); try{ nw.animate([{transform:"translateY(-46vh) scale(1.5) rotate(-7deg)", opacity:0},{transform:"translateY(-24vh) scale(1.5) rotate(-7deg)", opacity:1, offset:.55},{transform:"translateY(-26vh) scale(1.52) rotate(-9deg)", opacity:1}], {duration:UP, easing:"cubic-bezier(.2,.8,.3,1)", fill:"forwards"}); }catch(e){} });
      at(HOLD+UP-60, ()=>SFX.whoosh());
      at(HOLD+UP, ()=>{ try{ nw.animate([{transform:"translateY(-26vh) scale(1.52) rotate(-9deg)", opacity:1},{transform:"translateY(0) scale(1) rotate(0)", opacity:1}], {duration:FALL, easing:"cubic-bezier(.6,0,1,.5)", fill:"forwards"}); }catch(e){}
        try{ sh.animate([{opacity:0, transform:"scale(1.6)"},{opacity:1, transform:"scale(1)"}], {duration:FALL, easing:"cubic-bezier(.6,0,1,.5)", fill:"forwards"}); }catch(e){} });
      at(T, ()=>{ r.classList.remove("falling"); r.classList.add("rev","branded"); if(big) r.classList.add("warm");
        const A=top?12:big?9:6, k=[[0,0],[A,-A*.7],[-A*.8,A*.55],[A*.5,-A*.35],[-A*.25,A*.2],[0,0]];
        try{ r.animate(k.map(([x,y])=>({transform:`translate(${x}px,${y}px)`})), {duration:top?220:big?180:140, easing:"linear"}); }catch(e){}
        try{ nw.getAnimations().forEach(a=>a.cancel()); nw.animate([{transform:"scale(1.2,.8)"},{transform:"scale(.93,1.08)", offset:.4},{transform:"scale(1.03,.98)", offset:.72},{transform:"none"}], {duration:420, easing:"cubic-bezier(.2,.8,.3,1)"}); }catch(e){}
        try{ old.animate([{transform:"scale(1)", opacity:1},{transform:"scale(1.14,.82)", opacity:0}], {duration:90, fill:"forwards"}); }catch(e){}
        try{ sh.getAnimations().forEach(a=>a.cancel()); }catch(e){}
        const hot=r.querySelector(".rk-hot"); try{ hot.animate([{opacity:0, transform:"scale(.4)"},{opacity:1, transform:"scale(1)", offset:.18},{opacity:0, transform:"scale(1.3)"}], {duration:big?260:200, easing:"ease-out"}); }catch(e){}
        const f=r.querySelector(".rk-flash"); try{ f.animate([{opacity:0},{opacity:big?.32:.2, offset:.2},{opacity:0}], {duration:180, easing:"ease-out"}); }catch(e){}
        const ex=em.offsetLeft+em.offsetWidth/2, ey=em.offsetTop+em.offsetHeight*.55, fire=["#FFFFFF","#FFF4C2","#FFD36B","#FFB02E","#FF8A1F"];
        sparkAt(ev, ex, ey, top?46:big?36:26, {r0:50, r1:top?240:big?200:150, t0:500, t1:900, fall:70, cols:fire});
        const ring=document.createElement("i"); ring.className="rk-ring"+(big?" big":""); ring.style.left=ex+"px"; ring.style.top=ey+"px"; ev.appendChild(ring); setTimeout(()=>ring.remove(), 900);
        if(top){ const ring2=document.createElement("i"); ring2.className="rk-ring big late"; ring2.style.left=ex+"px"; ring2.style.top=ey+"px"; ev.appendChild(ring2); setTimeout(()=>ring2.remove(), 1200); }
        SFX.clang(big); try{ if(UI.pref.haptics!==false && navigator.vibrate) navigator.vibrate(top?[60,40,40]:big?55:40); }catch(e){} });
      at(T+380, ()=>SFX.chord(c.kind, true));
      if(top) at(T+900, ()=>SFX.fanfare(true)); }
    function stageD(c, D){ const r=c.root, at=(ms,f)=>c.at(ms,f); r.classList.remove("sA","aOut","pulse"); r.classList.add("sB","rev","sD"); if(!r.classList.contains("night")) r.classList.add("warm"); r.classList.remove("night");
      const n=r.querySelector(".rk-n"), tk=r.querySelector(".rk-tk"), add=c.tok1-c.tok0;
      if(c.calm){ n.textContent=c.tok1; unlockEnd(c); at(D.D, ()=>settle(c)); return; }
      // the tokens fly from the emblem into the counter, one by one
      at(380, ()=>{ const em=r.querySelector(".rk-new"), a=em.getBoundingClientRect(), b=tk.getBoundingClientRect(), m=Math.min(add, 8);
        for(let i=0;i<m;i++){ const coin=el(`<span class="rk-coin">${tokenIcon()}</span>`); r.appendChild(coin); const x0=a.left+a.width/2-14, y0=a.top+a.height/2-14, x1=b.left+b.width/2-14, y1=b.top+b.height/2-14, dx=rnd(-60,60);
          try{ coin.animate([{transform:`translate(${x0}px,${y0}px) scale(.4)`, opacity:0},{transform:`translate(${x0+dx}px,${y0-60}px) scale(1.1)`, opacity:1, offset:.35},{transform:`translate(${x1}px,${y1}px) scale(1)`, opacity:1}], {duration:620, delay:i*110, easing:"cubic-bezier(.5,0,.4,1)", fill:"both"}).onfinish=()=>{ coin.remove(); if(C!==c) return;
              n.textContent=Math.round(c.tok0+add*(i+1)/m); tk.classList.remove("bump"); void tk.offsetWidth; tk.classList.add("bump"); SFX.ting(i); }; }catch(e){ coin.remove(); n.textContent=c.tok1; } } });
      if(!c.P){ at(D.D-300, ()=>settle(c)); return; }
      // (ward2) the tier unlocks: the padlock, the cards turned over, the words
      const end=unlockPlay(c); at(end+700, ()=>settle(c)); }
    function settle(c){ if(c.settled) return; c.settled=true; const r=c.root; r.classList.add("end"); const sk=r.querySelector("#rkSkip"); if(sk) sk.hidden=true;
      const go=r.querySelector("#rkGo"); try{ go.focus({preventScroll:true, focusVisible:false}); }catch(e){}
      // it is never a dead end: left alone, it settles into the summary under it
      c.auto=setTimeout(()=>{ if(C===c) close("auto"); }, 14000); }
    function skip(){ const c=C; if(!c || c.settled) return; c.timers.forEach(clearTimeout); c.timers.clear(); SFX.hush(); const r=c.root;
      r.classList.remove("sA","aOut","ghost","alt","night","pulse"); r.classList.add("sB","rev","sD","warm","lit","skipped");
      r.querySelectorAll(".rk-em, .rk-glow, .rk-track").forEach(x=>{ try{ x.getAnimations().forEach(a=>a.cancel()); }catch(e){} }); r.querySelectorAll(".rk-coin").forEach(x=>x.remove());
      r.querySelector(".rk-n").textContent=c.tok1; unlockEnd(c); settle(c); }
    function finish(c){ c.timers.forEach(clearTimeout); c.timers.clear(); clearTimeout(c.auto); if(c.inert) c.inert.forEach(x=>{ x.inert=false; }); c.o.style.overflow=c.ov||""; }
    function close(how){ const c=C; if(!c) return; C=null; finish(c); const r=c.root, gone=()=>r.remove();
      if(lessMotion()) gone(); else { r.classList.add("out"); setTimeout(gone, 320); }
      try{ trace("the rank ceremony closed ("+how+")"); }catch(e){}
      if(c.done) try{ c.done(how); }catch(e){}
      if(how==="ward" && c.P){ wardrobe(()=>{}); setTimeout(()=>{ const b=$("ward").querySelector(`#wt${c.P.tier.n}`); if(b){ b.scrollIntoView({block:"center", behavior:lessMotion()?"auto":"smooth"}); if(!lessMotion()){ b.classList.remove("got"); void b.offsetWidth; b.classList.add("got","hl"); } } }, 380); } }
    // the screen is left another way (the phone's back button presses Continue): the ceremony goes at once
    function stop(){ const c=C; if(!c) return; C=null; finish(c); SFX.hush(); c.root.remove(); }
    return {run, stop, close, get on(){ return !!C; }}; })();
  /* ---- (hf2, 17 Nov; the owner: "The high five with Marie is too quick. Should take about twice as long so the user can actually see it
     happen. Also, the high five should come after the well done screen, so the user understands what the high five relates to") THE HIGH
     FIVE, on the lesson-complete screen itself: the screen comes up as always (its heading, the result) and is read for a moment; then the
     lower part warms and Marie and the learner meet under the heading and give each other a high five (PICS.highFive, 3.2 s; the burst, the
     clap and a short pulse in the hand exactly when the palms meet); it fades, and then the points fill the rank bar (the tally) with any
     rank-up's brand, then the summary. At the end of every lesson (and of a Go for perfect that completes one): the lesson is what it
     celebrates; a rank-up on its own (Home, one exercise done again) is the brand alone. A tap (after 0.6 s) or Skip goes on to the tally;
     with less movement the two stand side by side, "Bravo", still, for 1.5 s. dev/design/RANKUP.md 11. ---- */
  function pairFigs(){ const spec = AV.has() && AV.get() ? PICS.avatarParse(AV.get()) : null, still=lessMotion();
    try{ if(!still && window.PICS && typeof PICS.highFive==="function"){ const g=PICS.highFive({you:spec, wear:wearing(), marie:true});
        if(g && g.outerHTML){ const c=+g.getAttribute("data-contact") || 900, d=+g.getAttribute("data-dur") || 2000, hand=String(g.getAttribute("data-hand")||"160 62").split(/[ ,]+/).map(Number);
          return {html:`<svg class="rk-hf5" viewBox="0 0 320 200" aria-hidden="true">${g.outerHTML}</svg>`, contact:c, dur:d, hand, own:true}; } } }catch(e){}
    const crop=s=>s.replace(/viewBox="0 0 160 190"/, 'viewBox="28 26 104 160"');
    let you="", marie="";
    try{ you = spec ? AV.svg(spec, still ? {view:"standing", wear:wearing()} : {view:"doing", doing:"jump", wear:wearing()}, "rk-f rk-y") : `<svg class="rk-f rk-y" viewBox="0 0 160 190" aria-hidden="true">${PICS.action(still?"stop":"jump", "you", still?{after:"jump"}:{}).outerHTML}</svg>`; }catch(e){}
    try{ marie = `<svg class="rk-f rk-m" viewBox="0 0 160 190" aria-hidden="true">${PICS.action(still?"stop":"jump", "marie", still?{after:"jump"}:{}).outerHTML}</svg>`; }catch(e){}
    if(!you || !marie) return null;
    return {html:crop(marie)+crop(you), contact:760, dur:0, own:false}; }
  const FIVE = (()=>{ let C=null, lastO=null; const HOLD=1300;
    /* (hf3, 17 Nov; the owner: "it should just say magnifique Jon with the rosette and perfect lesson, without the 'every answer right, first
       time' and without everything underneath ... Then the rosette and other text I approved stays there like it currently does while the
       high five plays") EVERY end screen (a lesson, one exercise again, Go for perfect) opens on its mark (the rosette, the sun or the
       star), its badge ("A perfect lesson", "Lesson 1: all green") and its heading alone (class hfpre on the screen); they stay as they are
       while the high five plays under them (a finished lesson only: five), then the tally; the rest (the line under the heading, the cards,
       the foot) comes in after the tally (after()). Without the high five the heading is read for the same 1.3 s, then the tally. */
    function run(o, then, five=true){ stop();
      if(o){ lastO=o; o.classList.add("hfpre"); }
      if(!o || o.hidden){ if(then) then(); return; }
      const calm=lessMotion(), nm=String(S.learnerName||"").trim(); let F=null;
      const root=el(`<div class="rkc hfc${calm?" calm":""}" role="dialog" aria-modal="true" aria-label="Bravo" tabindex="-1"><div class="hf-veil"></div>
        <div class="rk-hf" aria-hidden="true"><div class="rk-pair"><div class="hf-at"></div><div class="rk-hit"></div><div class="rk-say">Bravo${nm?", "+esc(nm):""}&#8239;!</div></div></div>
        <button class="rk-skip" id="hfSkip" hidden>Skip</button><div class="rk-live" aria-live="polite"></div></div>`);
      const c = C = {o, root, then, five, timers:new Set(), done:false};
      const at=(ms,f)=>{ const t=setTimeout(()=>{ c.timers.delete(t); if(C!==c) return; try{ f(); }catch(e){ try{ trace("FAULT high five: "+e.message); }catch(_){} } }, Math.max(0, ms)); c.timers.add(t); };
      // the summary stays in view (its heading is what the high five is for) but out of reach until it is over
      c.inert=[...o.children]; c.inert.forEach(x=>{ x.inert=true; }); c.ov=o.style.overflow; o.style.overflow="hidden"; o.scrollTop=0;
      o.appendChild(root); try{ root.focus({preventScroll:true}); }catch(e){}
      root.addEventListener("click", e=>{ if(e.target.closest("button") && e.target.id!=="hfSkip") return; if(c.skippable) end(c, "skip"); });
      root.addEventListener("keydown", e=>{ if(e.key==="Escape"){ e.preventDefault(); end(c, "skip"); } });
      at(600, ()=>{ c.skippable=true; });
      try{ trace(five ? "the high five: after the heading, before the tally" : "the heading alone first, then the tally"); }catch(e){}
      // the film is made once the heading has come in (a still moment: the making takes a little while), and shown at the end of the hold
      if(five) at(calm ? 450 : 650, ()=>{ try{ F=pairFigs(); }catch(e){ F=null; } });
      at(calm ? 900 : HOLD, ()=>{ if(!F){ end(c, "go"); return; }
        const hd=o.querySelector("h1"), vh=innerHeight, pr=root.querySelector(".rk-pair");
        // under the heading: the stage starts just below it (never so low that the two would not fit)
        let top=hd ? hd.getBoundingClientRect().bottom+14 : vh*0.3; top=Math.max(vh*0.2, Math.min(top, vh-330)); root.style.setProperty("--top", Math.round(top)+"px");
        const k=Math.min(1, (vh-top-24)/(330+56), (innerWidth-16)/350); if(k<1) pr.style.setProperty("--k", k.toFixed(3));
        if(F.own) pr.classList.add("own"); root.querySelector(".hf-at").outerHTML=F.html;      // put in now: the film's clock starts here
        root.classList.add("in","sA"); const sk=root.querySelector("#hfSkip"); if(sk){ sk.hidden=false; sk.onclick=()=>end(c, "skip"); }
        const lv=root.querySelector(".rk-live"); if(lv) lv.textContent="Marie: Bravo"+(nm?", "+nm:"")+" !";
        if(calm){ root.classList.add("hit"); at(1500, ()=>end(c, "go")); return; }
        const sv=root.querySelector(".rk-hf5"); let lag=0; try{ if(sv && sv.getCurrentTime) lag=sv.getCurrentTime()*1000; }catch(e){}
        const hit=()=>{ const h=root.querySelector(".rk-hit");
            // where the hands meet (the picture says so): the burst goes there
            if(F.own && F.hand && sv){ try{ const pt=sv.createSVGPoint(); pt.x=F.hand[0]; pt.y=F.hand[1]; const q=pt.matrixTransform(sv.getScreenCTM()), b=pr.getBoundingClientRect(); h.style.left=(q.x-b.left)/(k<1?k:1)+"px"; h.style.top=(q.y-b.top)/(k<1?k:1)+"px"; }catch(e){} }
            c.hitAt=(()=>{ try{ return sv ? sv.getCurrentTime()*1000 : null; }catch(e){ return null; } })();
            root.classList.add("hit"); SFX.clap(); sparkAt(pr, h.offsetLeft, h.offsetTop, 16, {r0:40, r1:120, t0:700, t1:1100, fall:40});
            try{ if(UI.pref.haptics!==false && navigator.vibrate) navigator.vibrate(18); }catch(e){} };
        at(F.contact-lag, hit);
        const D = F.own ? F.dur : 1800;
        at(D-lag+200, ()=>end(c, "go")); }); }
    function release(c){ c.timers.forEach(clearTimeout); c.timers.clear(); if(c.inert) c.inert.forEach(x=>{ x.inert=false; }); c.o.style.overflow=c.ov||""; }
    // over: the tally is put in under it (or the summary is simply there), and it fades out over that, so the screen never goes back to the
    // summary in between (with less movement: a cut)
    function end(c, how){ if(C!==c || c.done) return; c.done=true; C=null; release(c); const r=c.root; if(how==="skip") SFX.hush();
      try{ trace((c.five ? "the high five closed (" : "the heading alone closed (")+how+")"+(c.hitAt!=null ? ", the clap at "+Math.round(c.hitAt)+" ms of the film" : "")); }catch(e){}
      if(c.then) try{ c.then(); }catch(e){}
      if(lessMotion()){ r.remove(); return; } r.style.pointerEvents="none";      // (hf3: it fades as the tally comes in, together: the two are never seen both at once)
      requestAnimationFrame(()=>r.classList.add("gone")); setTimeout(()=>r.remove(), 340); }
    // the screen is left another way (Continue by the back button): it goes at once and nothing follows
    function stop(){ after(); const c=C; if(!c) return; C=null; release(c); c.root.remove(); }
    // the rest of the screen comes in (each part that was waiting rises in, as the screen's own parts do)
    function after(){ const o=lastO; if(!o) return; lastO=null; if(!o.classList.contains("hfpre")) return;
      const keep=x=>x.matches(".seal,.sunmark,.okmark,.perfect-tag,h1,.rkc,.tly,.celebfig");
      o.classList.remove("hfpre"); if(lessMotion() || o.hidden) return; let i=0;
      for(const x of o.children){ if(keep(x) || x.classList.contains("spacer")) continue; x.style.setProperty("--i", Math.min(i++, 12)); x.classList.add("hf-rev"); setTimeout(()=>x.classList.remove("hf-rev"), 1300); } }
    return {run, stop, after, get on(){ return !!C; }}; })();
  /* (game feel) the other big moments of the lesson-complete screen, briefly and in the same spirit: a perfect lesson's seal stamps on with a
     ring of stars; a new badge drops into place with a chime when it comes into view; a ring closed glows once with its words. Never with less
     movement (the screen is then as it was). */
  function moments(o, r){ if(!o || o.hidden) return; const calm=lessMotion(), sounds=[];
    const at=(el, x)=>{ const a=el.getBoundingClientRect(), b=o.getBoundingClientRect(); return {x:a.left-b.left+a.width/2, y:a.top-b.top+o.scrollTop+a.height/2+(x||0)}; };
    const burst=(el, n, o2)=>{ if(calm || !el) return; const p=at(el); sparkAt(o, p.x, p.y, n, o2); };
    const seal=o.querySelector(".seal, .okmark.star"), perfect = r.runPerfect || r.perfectNow || r.star;
    if(seal && perfect){ if(!calm) seal.classList.add("mo-stamp"); setTimeout(()=>burst(seal, 16, {r0:56, r1:120, t0:900, t1:1300, fall:50}), 330); sounds.push(["perfect", 260]); }
    const whenSeen=(e, f)=>{ if(!e) return; if(!("IntersectionObserver" in window)){ f(); return; } const io=new IntersectionObserver(es=>{ if(es.some(x=>x.isIntersecting)){ io.disconnect(); f(); } }, {root:o, threshold:.7}); io.observe(e); };
    const bc=o.querySelector(".badgec"); if(bc) whenSeen(bc, ()=>{ if(!calm) bc.classList.add("mo-go"); setTimeout(()=>burst(bc.querySelector(".badge"), 12, {r0:40, r1:90, t0:800, t1:1200, fall:40}), 380); SFX.moment("badge", 300); });
    const rh=o.querySelector(".ringc .rhead"); if(rh) whenSeen(rh.parentNode, ()=>setTimeout(()=>{ if(!calm) rh.parentNode.classList.add("mo-go"); const s=rh.parentNode.querySelector("svg.rings"); if(s) burst(s, 12, {r0:50, r1:100, t0:800, t1:1200, fall:30}); SFX.moment("ring", 0); }, calm ? 0 : 950));
    for(const [k,d] of sounds) SFX.moment(k, d); }
  function sparkAt(host, x, y, n, o={}){ if(lessMotion() || !host) return; const box=document.createElement("div"); box.className="rk-sp mo"; box.style.left=x+"px"; box.style.top=y+"px";
    const cols=o.cols || ["#F3B33D","#FFE9A8","#E3A417","#5AA86D","#C0453B","#3F6FB5"];
    for(let i=0;i<n;i++){ const a=(i/n)*Math.PI*2+(Math.random()-.5)*.5, d=(o.r0||50)+Math.random()*((o.r1||110)-(o.r0||50)), p=document.createElement("i");
      p.style.cssText=`--x:${(Math.cos(a)*d).toFixed(0)}px;--y:${(Math.sin(a)*d).toFixed(0)}px;--f:${(20+Math.random()*(o.fall||60)).toFixed(0)}px;--s:${(.6+Math.random()*.6).toFixed(2)};--r:${(Math.random()*400-200).toFixed(0)}deg;--d:${(Math.random()*100).toFixed(0)}ms;--t:${((o.t0||900)+Math.random()*((o.t1||1300)-(o.t0||900))).toFixed(0)}ms;background:${cols[i%cols.length]}`;
      if(i%3===2) p.className="o"; box.appendChild(p); }
    host.appendChild(box); setTimeout(()=>box.remove(), (o.t1||1300)+400); }
  /* ---- (game feel, 16 Nov; the owner: "When you buy something in the wardrobe ... it just doesn't really do anything other than put a green
     outline around the item. There should be ceremony for these sorts of things! There should be a sound that plays some kind of
     congratulations and perhaps an animation of my character putting on the sunglasses.") THE PURCHASE CEREMONY, over the wardrobe: the
     tokens leave the counter for the thing; the thing lifts out of the grid; the learner's own figure comes up large and the thing goes onto
     it (to the head, the face, the neck, the body, the hand), with a sparkle; the figure is pleased (a little hop; a dance bought plays);
     a congratulation; "Now wearing ..." with "Lovely" (it stays on, as the wardrobe has always done) or "Keep it for later" (taken off
     again, what was worn before put back). A tap skips to the end; with less movement a calm still version. When the picture library
     offers PICS.putOn (dev/design/RANKUP.md section 7) the figure itself puts the thing on. ---- */
  const WC = (()=>{ let C=null;
    const SAY = {head:"Now wearing", face:"Now wearing", neck:"Now wearing", top:"Now wearing", outfit:"Now wearing", hand:"Now carrying", pose:"Your pose on Home", dance:"Your dance at every celebration"};
    // where on the figure the thing goes, as a share of the figure's own height from its top (its box found when it is drawn)
    const AT = {head:[0,.04], face:[0,.10], neck:[0,.19], top:[0,.34], outfit:[0,.40], hand:[.16,.50], pose:[0,.45], dance:[0,.45]};
    const rnd=(a,b)=>a+Math.random()*(b-a);
    const crop = s=>s.replace(/viewBox="0 0 160 190"/, 'viewBox="22 8 116 182"');      // the figure, large: its box closer round it (room left above for a tall hat)
    function figSvg(wear, cls, view){ const spec = AV.has() && AV.get() ? AV.get() : null; return crop(AV.svg(spec, {view:view||"standing", wear}, cls)); }
    // the picture library's own "putting on" (when it has one): the figure dressed, its hands bringing the thing to its place
    function putOn(it, after, calm){ if(calm) return ""; try{ if(window.PICS && typeof PICS.putOn==="function"){ const spec = AV.has() && AV.get() ? PICS.avatarParse(AV.get()) : null, g=PICS.putOn(spec, {wear:after, item:it.id});
        if(g && g.outerHTML) return crop(`<svg class="wc-svg" viewBox="0 0 160 190" aria-hidden="true">${g.outerHTML}</svg>`); } }catch(e){} return ""; }
    function run(it, before, prevWorn){ stop(); const o=$("ward"); if(!o || o.hidden) return; const calm=lessMotion(), after=wearing(), film=putOn(it, after, calm), card=o.querySelector(`[data-it="${it.id}"]`);
      const dance = it.slot==="dance", tok1=G.tokens||0, tok0=tok1+it.price;
      const cy=(()=>{ try{ const r=card.querySelector(".wthumb").getBoundingClientRect(); return r.top+r.height/2; }catch(e){ return innerHeight; } })();      // the payment's counter away from the card
      const root=el(`<div class="wcer${calm?" calm":""}" style="--pt:${calm ? "38%" : cy>innerHeight*0.5 ? "24%" : "70%"}" role="dialog" aria-modal="true" aria-label="It is yours" tabindex="-1">
        <div class="wc-bg"></div><div class="wc-scrim"></div>
        <div class="wc-pay" aria-hidden="true"><div class="wc-pc"><span class="wc-coin">${tokenIcon()}</span><b class="num wc-n">${calm ? `${tok0}<i>→</i>${tok1}` : tok0}</b><span class="wc-minus">−${it.price}</span></div></div>
        <div class="wc-stage"><div class="wc-glow"></div><div class="wc-fig wc-f0">${figSvg(before, "wc-svg")}</div><div class="wc-fig wc-f1">${film || figSvg(after, "wc-svg", dance && !calm ? "celebrate" : "standing")}</div></div>
        <div class="wc-txt"><div class="wc-lab">It's yours</div><div class="wc-name" lang="fr">${esc(it.fr)}</div><div class="wc-en">${esc(it.en)}</div></div>
        <div class="wc-btns"><button class="btn" id="wcOk">${it.slot==="hand" ? "Carry it now" : it.slot==="dance" || it.slot==="pose" ? "Use it now" : "Wear it now"}</button><button class="btn quiet" id="wcLater">Keep in the wardrobe</button></div>
        <button class="rk-skip" id="wcSkip" hidden>Skip</button><div class="rk-live" aria-live="polite"></div></div>`);
      const c = C = {o, root, it, prevWorn, timers:new Set(), settled:false};
      const at=(ms,f)=>{ const t=setTimeout(()=>{ c.timers.delete(t); if(C!==c) return; try{ f(); }catch(e){ try{ trace("FAULT wardrobe ceremony: "+e.message); }catch(_){} } }, ms); c.timers.add(t); };
      c.inert=[...o.children]; c.inert.forEach(x=>{ x.inert=true; }); c.ov=o.style.overflow; o.style.overflow="hidden";
      o.appendChild(root); try{ root.focus({preventScroll:true}); }catch(e){}
      try{ trace("the wardrobe ceremony: "+it.id+" bought ("+it.price+" token"+(it.price>1?"s":"")+"); "+(G.tokens||0)+" left"); }catch(e){}
      setTimeout(()=>{ const lv=root.querySelector(".rk-live"); if(lv) lv.textContent=`${it.fr}, ${it.en}: it is yours. Wear it now, or keep it in the wardrobe.`; }, 250);
      root.addEventListener("click", e=>{ if(e.target.closest("button")) return; if(!c.settled) skip(); });
      root.addEventListener("keydown", e=>{ if(e.key==="Escape"){ e.preventDefault(); if(!c.settled) skip(); else root.querySelector("#wcOk").click(); } });
      root.querySelector("#wcSkip").onclick=()=>skip();
      // (the owner, 14:00: the choice said plainly) the words follow the choice for a moment, then the wardrobe
      const choose=keep=>{ if(c.chosen) return; c.chosen=true; tick(); const lb=root.querySelector(".wc-lab"); root.classList.add("chosen"); root.querySelectorAll(".wc-btns .btn").forEach(b=>{ b.disabled=true; });
        if(keep){ lb.textContent=SAY[it.slot]||"Now wearing"; SFX.putOn(); } else { lb.textContent="In your wardrobe"; root.classList.remove("on","happy"); root.classList.add("in"); }
        const lv=root.querySelector(".rk-live"); if(lv) lv.textContent=lb.textContent+": "+it.fr+"."; setTimeout(()=>{ if(C===c) close(keep); }, lessMotion() ? 500 : 750); };
      root.querySelector("#wcOk").onclick=()=>choose(true);
      root.querySelector("#wcLater").onclick=()=>choose(false);
      at(700, ()=>{ const s=root.querySelector("#wcSkip"); if(s && !c.settled) s.hidden=false; });
      if(calm){ root.classList.add("pay","paid"); at(1300, ()=>{ root.classList.add("corner","in","on","end"); SFX.cheer(true); settle(c); }); return; }
      // (the owner, 14:0x: "the tokens going from 16 down to 15 need to be really clear and obvious") THE PAYMENT, its own beat first: a large
      // counter in the middle; the thing's card lifted above the dimmed wardrobe; one big coin after another leaves the counter, rings and
      // arcs into the card, and the number ticks down with a bounce, "−1" beside it; "1 token spent · 15 left"; held; the counter goes to the
      // corner (still showing what is left) as the thing lifts
      const dst=card && card.querySelector(".wthumb"), wn=root.querySelector(".wc-n"), coinEl=root.querySelector(".wc-coin"), m=Math.min(it.price, 8);
      if(dst){ const b=dst.getBoundingClientRect(); const fly=el(`<div class="wc-fly wc-tgt">${wardThumb(it)}</div>`); root.appendChild(fly);
        Object.assign(fly.style, {left:b.left+"px", top:b.top+"px", width:b.width+"px", height:b.height+"px"}); c.fly=fly; if(card) card.classList.add("wc-gone"); }
      root.classList.add("pay"); SFX.rise(0.3);
      for(let i=0;i<m;i++) at(560+i*170, ()=>{ const a=coinEl.getBoundingClientRect(), fl=c.fly; if(!fl) return; const b=fl.getBoundingClientRect(), S=44;
        const coin=el(`<span class="rk-coin wc-bigcoin">${tokenIcon()}</span>`); root.appendChild(coin); const x0=a.left+a.width/2-S/2, y0=a.top+a.height/2-S/2, x1=b.left+b.width/2-S/2, y1=b.top+b.height/2-S/2;
        wn.textContent=Math.round(tok0-it.price*(i+1)/m); wn.classList.remove("tick"); void wn.offsetWidth; wn.classList.add("tick"); root.classList.add("spent"); SFX.ting(7-Math.min(i,7));
        try{ coin.animate([{transform:`translate(${x0}px,${y0}px) scale(1)`},{transform:`translate(${(x0+x1)/2+rnd(-30,30)}px,${Math.min(y0,y1)-70}px) scale(1.2)`, offset:.45},{transform:`translate(${x1}px,${y1}px) scale(.55)`, opacity:.9}], {duration:620, easing:"cubic-bezier(.5,0,.4,1)", fill:"forwards"}).onfinish=()=>{ coin.remove(); if(C!==c || !c.fly) return; c.fly.classList.remove("hitc"); void c.fly.offsetWidth; c.fly.classList.add("hitc"); }; }catch(e){ coin.remove(); } });
      const P1=560+(m-1)*170+620, P2=P1+520;
      at(P1, ()=>{ wn.textContent=tok1; root.classList.add("paid"); });
      // the counter to the corner; the thing lifts out of the grid and the stage comes up
      at(P2, ()=>{ root.classList.add("corner"); const fly=c.fly; if(fly){ fly.classList.remove("wc-tgt"); try{ fly.animate([{transform:"none"},{transform:"translateY(-26px) scale(1.12) rotate(-3deg)", boxShadow:"0 18px 30px -10px rgba(27,36,51,.45)"}], {duration:420, easing:"cubic-bezier(.3,1.4,.5,1)", fill:"forwards"}); }catch(e){} } });
      at(P2+150, ()=>{ root.classList.add("in"); SFX.rise(0.5); });
      // the thing goes onto the figure, where it is worn
      const T=P2+780;
      at(T, ()=>{ const fly=c.fly, f0=root.querySelector(".wc-f0"), sv=f0.querySelector("svg"); if(!sv){ return; }
        let gx=80, gy=40, k=[0,.3]; try{ const g=sv.querySelector("g"), bb=g.getBBox(), m=sv.getScreenCTM(); k=AT[it.slot]||k; const pt=sv.createSVGPoint(); pt.x=bb.x+bb.width/2+k[0]*bb.height; pt.y=bb.y+k[1]*bb.height; const q=pt.matrixTransform(m); gx=q.x; gy=q.y; }catch(e){}
        c.pt=[gx, gy];
        if(fly){ const b=fly.getBoundingClientRect(), sx=gx-(b.left+b.width/2), sy=gy-(b.top+b.height/2);
          try{ fly.getAnimations().forEach(a=>a.cancel()); fly.animate([{transform:"translateY(-26px) scale(1.12) rotate(-3deg)", opacity:1},{transform:`translate(${sx*.55}px,${sy*.55-60}px) scale(.75) rotate(6deg)`, opacity:1, offset:.55},{transform:`translate(${sx}px,${sy}px) scale(.12) rotate(0)`, opacity:0}], {duration:620, easing:"cubic-bezier(.45,0,.3,1)", fill:"forwards"}); }catch(e){} }
        SFX.whoosh();
        /* (figures 13) the picture library's own putting-on: its film begins now (put in afresh, as it was given: a new clock) and shows at once */
        const f1=root.querySelector(".wc-f1"); if(film && f1){ f1.innerHTML=film; root.classList.add("film"); } });
      at(T+600, ()=>{ root.classList.add("on"); SFX.putOn(); const st=root.querySelector(".wc-stage"), sb=st.getBoundingClientRect(); if(c.pt) sparkAt(st, c.pt[0]-sb.left, c.pt[1]-sb.top, 18, {r0:30, r1:90, t0:700, t1:1100, fall:30, cols:["#F3B33D","#FFE9A8","#FFFFFF","#5AA86D","#3F6FB5"]}); });
      at(T+900, ()=>{ root.classList.add("happy"); SFX.cheer(); });
      at(T+1600, ()=>{ root.classList.add("end"); settle(c); }); }
    function settle(c){ if(c.settled) return; c.settled=true; const s=c.root.querySelector("#wcSkip"); if(s) s.hidden=true; try{ c.root.querySelector("#wcOk").focus({preventScroll:true, focusVisible:false}); }catch(e){} }
    function skip(){ const c=C; if(!c || c.settled) return; c.timers.forEach(clearTimeout); c.timers.clear(); SFX.hush(); const r=c.root; r.querySelectorAll(".rk-coin, .wc-fly").forEach(x=>x.remove()); const n=r.querySelector(".wc-n"); if(n) n.textContent=G.tokens||0; r.classList.add("pay","spent","paid","corner","in","on","end","skipped"); settle(c); }
    function finish(c){ c.timers.forEach(clearTimeout); c.timers.clear(); if(c.inert) c.inert.forEach(x=>{ x.inert=false; }); c.o.style.overflow=c.ov||""; }
    function close(keep){ const c=C; if(!c) return; C=null; finish(c); const r=c.root, it=c.it, w=W();
      if(!keep){ w.worn=Object.assign({}, c.prevWorn); store(); wearSync(); try{ trace("wardrobe: "+it.id+" kept for later"); }catch(e){} }
      if(lessMotion()) r.remove(); else { r.classList.add("out"); setTimeout(()=>r.remove(), 300); }
      wardrobe.keep=true; wardrobe(wardrobe.back); const cd=$("ward").querySelector(`[data-it="${it.id}"]`); if(cd && !lessMotion()){ cd.classList.remove("got"); void cd.offsetWidth; cd.classList.add("got"); } }
    function stop(){ const c=C; if(!c) return; C=null; finish(c); SFX.hush(); c.root.remove(); }
    return {run, stop, get on(){ return !!C; }}; })();
  /* ---- (onboarding, 16 Nov; the owner: "the user is carefully guided and instructed on how to use every aspect of the app") COACH MARKS:
     one short sentence on the real control, at the moment the learner first needs it, one at a time, never over a lesson, never again once
     seen or once the learner has used the thing by himself; "How the app works" in You says them all again. A tip never stands in the way:
     the control in the light works at once, the start button always works, any other tap only puts the tip away.
     dev/design/ONBOARDING.md in the private bundle. ---- */
  const COACH = (()=>{ let cur=null, t=0, run=0;
    // (the owner, 14:26: no explanatory clutter) a tip only where the screen cannot show it: that a thing can be tapped, and what it then gives.
    // In the order the learner meets them; sel: the element it explains, wherever it lives (and any element marked data-coach="<id>")
    const MARKS = [
      {id:"streak", sel:"#hStreak", when:()=>!!(G.run && G.run.len>=1), text:"A lesson a day keeps your streak."},      // (the streak of streak.patch, on Home: its one rule said once, here)
      {id:"figure", sel:"#tabYou", when:()=>G.furthest>=1 && !!G.makerOffer, text:"Make your figure look like you."},      // (first run: the figure starts neutral; it is made when the learner wants)
      {id:"path", sel:".lcard[data-lv]", when:()=>G.furthest>=1, text:"Tap to redo its exercises."},
      {id:"rank", sel:"#hRank, #youRank", when:()=>(G.tokens||0)>0, text:"Tap to spend your tokens."},
      {id:"tiles", sel:".exgrid", when:()=>true, text:"Tap one to do it again."},
    ];
    // the help in You: the whole app in a few short lines
    const HOW = ["The rings: today's lesson, this week's goal, your next level.", "Your two moments: a lesson after each.",
      "A lesson opens when the one before is all green.", "Perfect exercise: 1 point.", "Points earn ranks; ranks earn tokens.",
      "Tokens buy things in your wardrobe.", "A done lesson: tap it to redo any exercise.", "Go for perfect: its yellow exercises, one after another."];
    const seenIt = id=>!!tips()["c:"+id];
    const learned = id=>{ if(!seenIt(id)){ tips()["c:"+id]=new Date().toISOString().slice(0,10); store(); } };
    const shown = el=>{ if(!el) return false; const r=el.getBoundingClientRect(); return r.width>0 && r.height>0 && !el.closest("[hidden]"); };
    // the screen on top: the highest open screen, else the open tab's own (Today, or a tab drawn over it); the tab bar belongs to it
    const top = ()=>{ const v=[...document.querySelectorAll(".over:not([hidden]):not(.tabbed)")]; if(v.length) return v.sort((a,b)=>(+getComputedStyle(a).zIndex||0)-(+getComputedStyle(b).zIndex||0)).pop();
      return document.querySelector(".over.tabbed:not([hidden])") || $("home"); };
    const onTop = el=>{ const t=top(); return !!t && (t.contains(el) || (!t.classList.contains("over") || t.classList.contains("tabbed")) && !!el.closest("#nav")); };
    // a tip's element: the first of its selectors (or any element a redesign marks data-coach="<id>") that is shown on the screen on top
    const find = m=>{ for(const e of document.querySelectorAll(`[data-coach="${m.id}"], ${m.sel}`)) if(shown(e) && onTop(e)) return e; return null; };
    // never over a lesson, a sheet, the loading screen, the update offer, a celebration, or a screen with one way on (lesson complete, a level,
    // welcome back, the microphone, the maker, the two moments, who is learning)
    const BUSY = ["done","lvl","back","mic","maker","anch","whoL"];
    const free = ()=>{ try{ if(document.body.classList.contains("inLesson") || (typeof running!=="undefined" && running)) return false; const pl=$("play"), sh=$("sheet");
      if(!pl || pl.hidden || pl.classList.contains("afterDemo") || (sh && !sh.hidden) || $("splash") || document.querySelector(".rkc, .wcer, .tly, #confetti") || ($("upd") && !$("upd").hidden)) return false;
      return !BUSY.some(id=>{ const o=$(id); return o && !o.hidden; }); }catch(e){ return false; } };
    // a screen has arrived (any screen: the shell's own say so, and any other layer's showing or going is noticed): the first tip it needs,
    // a moment after it has settled
    function arrive(){ clearTimeout(t); run=0; t=setTimeout(next, lessMotion() ? 250 : 750); }
    function next(){ if(cur || !free() || run>=2) return;
      for(const m of MARKS){ if(seenIt(m.id)) continue; let ok=false; try{ ok=m.when(); }catch(e){} if(!ok) continue; const e=find(m); if(e){ show(m, e); return; } } }
    try{ new MutationObserver(ms=>{ if(ms.some(x=>x.target.classList && x.target.classList.contains("over"))) arrive(); }).observe(document.body, {subtree:true, attributes:true, attributeFilter:["hidden"]}); }catch(e){}
    function geom(el){ const r=el.getBoundingClientRect(), p=8; return {x:Math.max(4, r.left-p), y:Math.max(4, r.top-p), w:Math.min(innerWidth-8, r.width+2*p), h:r.height+2*p}; }
    function hole(g){ const W=innerWidth, H=innerHeight, R=Math.min(18, g.h/2), {x,y,w,h}=g;
      return `path(evenodd, "M0 0H${W}V${H}H0Z M${x+R} ${y}H${x+w-R}A${R} ${R} 0 0 1 ${x+w} ${y+R}V${y+h-R}A${R} ${R} 0 0 1 ${x+w-R} ${y+h}H${x+R}A${R} ${R} 0 0 1 ${x} ${y+h-R}V${y+R}A${R} ${R} 0 0 1 ${x+R} ${y}Z")`; }
    function place(c){ const g=geom(c.el), d=c.root.querySelector(".co-dim"), ring=c.root.querySelector(".co-ring"), tip=c.root.querySelector(".co-tip");
      d.style.clipPath=hole(g); Object.assign(ring.style, {left:g.x+"px", top:g.y+"px", width:g.w+"px", height:g.h+"px"});
      const th=tip.offsetHeight, below=innerHeight-(g.y+g.h), above=g.y, pb=$("playBtn"), pr=pb && shown(pb) ? pb.getBoundingClientRect() : null;
      const at=side=>side==="below" ? g.y+g.h+14 : g.y-14-th, hits=y=>pr && y<pr.bottom && y+th>pr.top;
      let side = below>=th+24 || below>above ? "below" : "above"; if(hits(at(side))){ const o=side==="below"?"above":"below"; if(!hits(at(o)) && (o==="below" ? below : above)>=th+20) side=o; }
      const y=Math.max(8, Math.min(innerHeight-th-8, at(side))), tw=tip.offsetWidth, cx=g.x+g.w/2, x=Math.max(12, Math.min(innerWidth-tw-12, cx-tw/2));
      tip.style.top=y+"px"; tip.style.left=x+"px"; tip.classList.toggle("up", side==="above"); tip.style.setProperty("--ax", Math.max(22, Math.min(tw-22, cx-x))+"px"); }
    function show(m, el){ if(!el) return;
      // the thing in the light must be on the screen: brought into view first, gently
      const r0=el.getBoundingClientRect(); if(r0.top<60 || r0.bottom>innerHeight-110){ try{ el.scrollIntoView({block:"center", behavior:lessMotion()?"auto":"smooth"}); }catch(e){} setTimeout(()=>{ if(!cur && free()) show2(m, el); }, 420); return; }
      show2(m, el); }
    function show2(m, el){ if(cur || !free()) return; run++;
      const root=el2(`<div id="coach" class="${lessMotion()?"calm":""}" lang="en"><div class="co-dim"></div><div class="co-ring"></div>
        <div class="co-tip" role="dialog" aria-label="Tip"><p aria-live="polite">${esc(typeof m.text==="function" ? m.text() : m.text)}</p><button class="btn" id="coOk">Got it</button></div></div>`);
      document.body.appendChild(root); cur={m, el, root}; place(cur);
      try{ root.querySelector("#coOk").focus({preventScroll:true, focusVisible:false}); }catch(e){}
      root.querySelector("#coOk").onclick=()=>{ tick(); done(true); };
      try{ trace("a tip: "+m.id); }catch(e){} }
    const el2 = html=>{ const t0=document.createElement("template"); t0.innerHTML=html.trim(); return t0.content.firstChild; };
    function done(chain){ const c=cur; if(!c) return; cur=null; learned(c.m.id); const r=c.root; if(lessMotion()) r.remove(); else { r.classList.add("out"); setTimeout(()=>r.remove(), 220); }
      if(chain) setTimeout(next, 650); }
    // a tap while a tip shows: on the tip, as it says; on the control in the light, or the start button, it works and the tip goes; anywhere else
    // it only puts the tip away (the window hears it before the page does)
    window.addEventListener("click", e=>{ const c=cur; if(!c) return; const tg=e.target;
      if(tg.closest && tg.closest(".co-tip")) return;
      if(c.el.contains(tg) || (tg.closest && tg.closest("#playBtn, #nav"))){ done(false); return; }
      e.preventDefault(); e.stopPropagation(); done(false); }, true);
    window.addEventListener("keydown", e=>{ if(cur && e.key==="Escape") done(false); });
    let rt=0; const re=()=>{ cancelAnimationFrame(rt); rt=requestAnimationFrame(()=>{ if(cur){ if(!shown(cur.el) || !free()) { const r=cur.root; cur=null; r.remove(); } else place(cur); } }); };
    window.addEventListener("resize", re); document.addEventListener("scroll", re, true);
    // the help in You: every tip, in words, and the tips again
    function help(){
      info("How the app works", `<div class="co-how">${HOW.map(t=>`<p>${esc(t)}</p>`).join("")}</div><button class="btn quiet" id="coAgain">Show the tips again</button>`);
      $("coAgain").onclick=()=>{ tick(); for(const k of Object.keys(tips())) if(k.indexOf("c:")===0) delete tips()[k]; store(); sheetClose($("sheet")); try{ trace("the tips will show again"); }catch(e){} setTimeout(()=>tab("today"), 260); }; }
    return {arrive, learned, help, get on(){ return !!cur; }, MARKS}; })();
  /* ---- (game feel, 17 Nov; the owner: "at the end of the whole lesson, the user should see the progress bar increasing as points are added. The
     progress bar goes a long way if there are a lot of points relative to the amount the user currently has, or it does not go a very long way,
     just like it does in [Halo] Reach. There should be a satisfying increasing sound as the points are added, and then when the user ranks up,
     there should be a very satisfying animation ... Once that animation is done, it then shows the normal end-of-lesson card ... even if the user
     exits a lesson halfway through.") THE TALLY. Points earned in a lesson go into the record at once, as always, but are not shown there: they
     are banked in G.tally (the points the bar last showed, and where the new ones came from) and shown here, at the end: the rank's emblem and
     bar at their old fill; each source in turn with its label; the bar filling at one steady speed (a big gain travels far, a small one a little,
     against the rank's own span) under a rising tone, a soft tick for each point; at the rank's end the rank-up ceremony, then the bar goes on
     into the next rank. Then lesson complete. Left half-way, the points wait in the record and their tally plays the next time Home shows (or at
     the next lesson's end), once. A tap skips to the end (a rank-up still plays, with its own skip); with less movement a calm still version. ---- */
  const TY = (()=>{ let C=null;
    const T = ()=>{ if(!G.tally || typeof G.tally.base!=="number") G.tally={base:G.points||0, items:[]}; return G.tally; };
    // a source of points, as it lands in the record: "ex" a perfect exercise, "fix" one made perfect, "lesson" a perfect lesson
    function bank(kind, p){ if(!(p>0)) return; const t=T(), last=t.items[t.items.length-1]; if(last && last.k===kind){ last.p+=p; last.n=(last.n||1)+1; } else t.items.push({k:kind, p, n:1}); }
    const pending = ()=>Math.max(0, (G.points||0)-T().base);
    const LAB = {ex:n=>n>1 ? "Perfect exercises" : "Perfect exercise", fix:n=>"Made perfect", lesson:()=>"Perfect lesson"};
    function sources(){ const out=T().items.filter(x=>x.p>0).map(x=>({l:(LAB[x.k]||(()=>"Points"))(x.n||1), p:x.p})), d=pending()-out.reduce((a,x)=>a+x.p,0);
      if(d>0) out.push({l:"Points", p:d}); else for(let i=out.length-1, r=-d; i>=0 && r>0; i--){ const c=Math.min(out[i].p, r); out[i].p-=c; r-=c; }
      return out.filter(x=>x.p>0); }
    // shown: the bar now stands at the record's points
    function commit(){ G.tally={base:G.points||0, items:[]}; store(); }
    const span = k=>{ const lo=k ? RULES.RANKS[k-1] : 0, last=k>=RULES.RANKS.length; return {lo, hi:last ? lo+1 : RULES.RANKS[k], last}; };
    const fillOf = p=>{ const k=rankOf(p), s=span(k); return s.last ? 1 : Math.max(0, Math.min(1, (p-s.lo)/(s.hi-s.lo))); };
    const toNext = p=>{ const k=rankOf(p), s=span(k), n=Math.max(0, Math.ceil(s.hi-p-1e-6)); return s.last ? "" : n ? `<b class="num">${n.toLocaleString("en-GB")}</b> to the next rank` : `<b>A new rank</b>`; };
    function run(host, done){ stop(); const src=sources(), from=T().base, to=G.points||0;
      if(!host || to<=from || !src.length){ commit(); if(done) done("none"); return; }
      const calm=lessMotion(), total=src.reduce((a,x)=>a+x.p,0), k0=rankOf(from);
      const root=el(`<div class="tly${calm?" calm":""}" role="dialog" aria-modal="true" aria-label="Points" tabindex="-1">
        <div class="ty-bg"></div>
        <div class="ty-top"><div class="ty-em">${rankEmblem(k0, "emb ty-e")}</div><div class="ty-name">${rankHtml(k0)}</div></div>
        <div class="ty-gain"><b class="num ty-n">+0</b></div>
        <div class="ty-bar"><div class="ty-track"><i class="ty-fill" style="--f:${fillOf(from).toFixed(4)}"></i></div><div class="ty-next">${toNext(from)}</div></div>
        <div class="ty-list">${src.map((s,i)=>`<div class="ty-row" data-i="${i}"><span>${esc(s.l)}</span><b class="num">+${s.p}</b></div>`).join("")}</div>
        <button class="rk-skip" id="tySkip" hidden>Skip</button><div class="rk-live" aria-live="polite"></div></div>`);
      const c = C = {host, root, done, src, from, to, cur:from, k:k0, timers:new Set(), raf:0, tone:null, ended:false, shownRanks:new Set()};
      const at=(ms,f)=>{ const t=setTimeout(()=>{ c.timers.delete(t); if(C!==c) return; try{ f(); }catch(e){ try{ trace("FAULT tally: "+e.message); }catch(_){} } }, Math.max(0, ms)); c.timers.add(t); };
      c.at=at; c.inert=[...host.children]; c.inert.forEach(x=>{ x.inert=true; }); c.ov=host.style.overflow; host.style.overflow="hidden"; host.scrollTop=0;
      host.appendChild(root); try{ root.focus({preventScroll:true}); }catch(e){}
      try{ dispatchEvent(new Event("resize")); }catch(e){}      // a tip still showing goes (it is never over a celebration), not counted as seen
      try{ trace("the tally: "+from+" to "+to+" points ("+src.map(s=>s.l+" +"+s.p).join(", ")+")"+(rankOf(to)>k0 ? "; rank "+rankName(k0)+" to "+rankName(rankOf(to)) : "")); }catch(e){}
      setTimeout(()=>{ const lv=root.querySelector(".rk-live"); if(lv) lv.textContent=src.map(s=>s.l+" plus "+s.p).join(". ")+". "+rankLabel(rankOf(to))+"."; }, 250);
      root.addEventListener("click", e=>{ if(e.target.closest("button") && e.target.id!=="tySkip") return; if(c.skippable && !c.ended) skip(); });
      root.addEventListener("keydown", e=>{ if(e.key==="Escape" && !c.ended){ e.preventDefault(); skip(); } });
      at(700, ()=>{ c.skippable=true; const s=root.querySelector("#tySkip"); if(s) s.hidden=false; });
      if(calm){ root.classList.add("in"); root.querySelectorAll(".ty-row").forEach(r=>r.classList.add("on","done")); at(250, ()=>{ setBar(c, to); root.classList.add("total"); root.querySelector(".ty-n").textContent="+"+total; SFX.chord("grade", true); tokLine(c, false); });
        at(1500, ()=>{ const got=[]; for(let j=k0+1;j<=rankOf(to);j++) got.push(j); if(got.length) RK.run(host, got, how=>{ if(how==="ward") end(c, "ward"); else at(300, ()=>end(c, "go")); }); else end(c, "go"); }); return; }
      root.classList.add("in"); at(520, ()=>next(c, 0)); }
    // the bar at p (its rank's emblem and name follow it)
    function setBar(c, p){ const r=c.root, k=rankOf(p); c.cur=p;
      if(k!==c.k){ c.k=k; r.querySelector(".ty-em").innerHTML=rankEmblem(k, "emb ty-e"); r.querySelector(".ty-name").innerHTML=rankHtml(k); }
      r.querySelector(".ty-fill").style.setProperty("--f", fillOf(p).toFixed(4)); r.querySelector(".ty-next").innerHTML=toNext(p); }
    // one source: its row lights, then its points flow into the bar
    function next(c, i){ const r=c.root; if(i>=c.src.length){ finish(c); return; } const row=r.querySelector(`.ty-row[data-i="${i}"]`); row.classList.add("on"); c.row=row; SFX.ting(Math.min(i*2, 6));
      c.at(380, ()=>flow(c, c.cur+c.src[i].p, ()=>{ row.classList.add("done"); c.at(260, ()=>next(c, i+1)); })); }
    // the points flow at one steady speed against the rank's span; at a rank's end the ceremony, then on with what is left
    const SPEED=0.5, MIN=420, MAXSEG=2600;      // bars a second; ms
    function flow(c, target, then){ const k=rankOf(c.cur), s=span(k), stop = !s.last && target>=s.hi ? s.hi : target, p0=c.cur;
      const frac = s.last ? 0 : (stop-p0)/(s.hi-s.lo), dur=Math.max(MIN, Math.min(MAXSEG, 1000*frac/SPEED)), t0=performance.now(), gain0=c.from, nEl=c.root.querySelector(".ty-n");
      c.root.classList.add("flowing"); if(!c.tone) c.tone=SFX.fill(fillOf(p0)); let lastTick=Math.floor(p0), lastTickAt=0;
      const step=now=>{ if(C!==c) return; const x=Math.min(1, (now-t0)/dur), p=p0+(stop-p0)*x; setBar(c, Math.min(p, stop-(x<1 ? 1e-6 : 0)));
        nEl.textContent="+"+Math.floor(p-gain0+1e-9); if(c.tone) c.tone.set(fillOf(Math.min(p, stop-1e-6)) + (rankOf(p0)-rankOf(c.from))*0.08);
        if(Math.floor(p)>lastTick && now-lastTickAt>38){ lastTick=Math.floor(p); lastTickAt=now; SFX.tick(fillOf(Math.min(p, stop-1e-6))); flyPoint(c, fillOf(Math.min(p+1, stop-1e-6))); }
        if(x<1){ c.raf=requestAnimationFrame(step); return; }
        if(stop<target || (!s.last && stop>=s.hi)){ // the rank's end: the bar full, then the ceremony
          if(c.tone){ c.tone.stop(); c.tone=null; } c.root.classList.remove("flowing"); c.root.classList.add("full"); setBar(c, s.hi-1e-6); c.root.querySelector(".ty-fill").style.setProperty("--f", "1"); SFX.stamp(true);
          const kNew=rankOf(stop); c.at(650, ()=>{ c.shownRanks.add(kNew); const later=laterTokens(c, kNew);
            RK.run(c.host, [kNew], how=>{ if(C!==c) return; c.root.classList.remove("full"); setBar(c, stop); if(how==="ward"){ end(c, "ward"); return; } if(stop>=target) c.at(300, then); else c.at(420, ()=>flow(c, target, then)); }, (G.tokens||0)-later); });
          return; }
        if(c.tone){ c.tone.stop(); c.tone=null; } c.root.classList.remove("flowing"); then(); };
      c.raf=requestAnimationFrame(step); }
    // a point leaves its source and lands in the head of the bar (the bar grows where it lands)
    function flyPoint(c, f){ if(!c.row) return; try{ const a=c.row.querySelector("b").getBoundingClientRect(), tr=c.root.querySelector(".ty-track").getBoundingClientRect(), x1=tr.left+tr.width*f, y1=tr.top+tr.height/2, x0=a.left+a.width/2, y0=a.top+a.height/2;
        const d=document.createElement("i"); d.className="ty-pt"; c.root.appendChild(d);
        d.animate([{transform:`translate(${x0}px,${y0}px) scale(.8)`, opacity:1},{transform:`translate(${(x0+x1)/2}px,${Math.min(y0,y1)-26}px) scale(1.1)`, opacity:1, offset:.5},{transform:`translate(${x1}px,${y1}px) scale(.5)`, opacity:.9}], {duration:300, easing:"cubic-bezier(.5,0,.9,.6)", fill:"forwards"}).onfinish=()=>d.remove(); }catch(e){} }
    // the tokens of the ranks still to come in this tally (the ceremony shows the count as it is at its own rank)
    function laterTokens(c, k){ let t=0; for(let j=k+1;j<=rankOf(c.to);j++) t+=tokensFor(j); return t; }
    function finish(c){ const r=c.root; r.classList.add("total"); r.querySelector(".ty-n").textContent="+"+(c.to-c.from); SFX.chord("grade"); const tk=tokLine(c, !lessMotion()); c.at(calmMs(1300)+tk, ()=>end(c, "go")); }
    // (ward2; Jon: "the big token tranch for rank up and also the trickle"; "per perfect lesson") the tokens of a perfect lesson: a line under the
    // points, "A perfect lesson +2", and the coins fly from it into a counter, a coin's ring each (the counter on Home and in the wardrobe follows)
    function tokLine(c, animate){ const n=(T().tok||0); if(!n || c.tokShown) return 0; c.tokShown=true; const r=c.root, t1=G.tokens||0, t0=Math.max(0, t1-n);
      const row=el(`<div class="ty-tok"><span class="ty-tl">${tokenIcon()}<span>A perfect lesson</span><b class="num">+${n}</b></span><span class="ty-tc">${tokenIcon()}<b class="num">${animate ? t0 : t1}</b></span></div>`); r.querySelector(".ty-list").after(row);
      if(!animate){ row.classList.add("in"); return 0; }
      requestAnimationFrame(()=>row.classList.add("in")); const cn=row.querySelector(".ty-tc b"), m=Math.min(n, 6);
      for(let i=0;i<m;i++) c.at(420+i*160, ()=>{ try{ const a=row.querySelector(".ty-tl b").getBoundingClientRect(), b=row.querySelector(".ty-tc .tokn").getBoundingClientRect(), coin=el(`<span class="rk-coin">${tokenIcon()}</span>`); r.appendChild(coin);
          coin.animate([{transform:`translate(${a.left}px,${a.top}px) scale(.6)`},{transform:`translate(${(a.left+b.left)/2}px,${Math.min(a.top,b.top)-40}px) scale(1)`, offset:.5},{transform:`translate(${b.left}px,${b.top}px) scale(.8)`}], {duration:480, easing:"cubic-bezier(.5,0,.4,1)", fill:"forwards"}).onfinish=()=>{ coin.remove(); cn.textContent=Math.round(t0+n*(i+1)/m); const tc=row.querySelector(".ty-tc"); tc.classList.remove("bump"); void tc.offsetWidth; tc.classList.add("bump"); SFX.ting(i); }; }catch(e){ cn.textContent=t1; } });
      return 420+m*160+700; }
    const calmMs = ms=>lessMotion() ? Math.min(ms, 600) : ms;
    // a tap: straight to the end (a rank crossed and not yet celebrated still has its ceremony, which has a skip of its own)
    function skip(){ const c=C; if(!c || c.ended) return; c.timers.forEach(clearTimeout); c.timers.clear(); cancelAnimationFrame(c.raf); if(c.tone){ c.tone.stop(); c.tone=null; }
      const r=c.root; r.classList.remove("flowing","full"); r.querySelectorAll(".ty-row").forEach(x=>x.classList.add("on","done")); setBar(c, c.to); r.querySelector(".ty-n").textContent="+"+(c.to-c.from); r.classList.add("total","skipped"); tokLine(c, false);
      const got=[]; for(let j=rankOf(c.from)+1;j<=rankOf(c.to);j++) if(!c.shownRanks.has(j)) got.push(j);
      if(got.length && !RK.on){ c.ended=true; RK.run(c.host, got, how=>{ if(C!==c) return; c.ended=false; end(c, how==="ward" ? "ward" : "go"); }); return; }
      if(!RK.on) c.at(500, ()=>end(c, "go")); }
    function release(c){ c.timers.forEach(clearTimeout); c.timers.clear(); cancelAnimationFrame(c.raf); if(c.tone){ c.tone.stop(); c.tone=null; } if(c.inert) c.inert.forEach(x=>{ x.inert=false; }); c.host.style.overflow=c.ov||""; commit(); }
    function end(c, how){ if(C!==c || c.ended) return; c.ended=true; C=null; release(c); const r=c.root;
      if(lessMotion()) r.remove(); else { r.classList.add("out"); setTimeout(()=>r.remove(), 320); }
      try{ trace("the tally closed ("+how+")"); }catch(e){}
      if(c.done) try{ c.done(how); }catch(e){} }
    // the screen is left another way (Continue under it by the back button, a new lesson): it goes at once, the points counted as shown
    function stop(){ const c=C; if(!c) return; C=null; release(c); c.root.remove(); }
    // Home: points left waiting (a lesson left half-way) are tallied once, over Home, when nothing else is in the way
    let homeT=0;
    function home(){ clearTimeout(homeT); if(!(pending()>0)) return; homeT=setTimeout(()=>{ if(C || RK.on || !(pending()>0)) return;
        try{ if(document.body.classList.contains("inLesson") || (typeof running!=="undefined" && running) || $("splash") || !$("play") || $("play").hidden || ($("sheet") && !$("sheet").hidden)) return;
          if(document.querySelector(".over:not([hidden]):not(.tabbed), .rkc, .wcer, #coach")) return; }catch(e){ return; }
        let h=$("tlyHost"); if(!h){ h=el(`<div id="tlyHost" lang="en"></div>`); document.body.appendChild(h); } h.hidden=false;
        run(h, ()=>{ h.hidden=true; }); }, 650); }
    return {bank, pending, run, stop, home, sources, get on(){ return !!C; }}; })();
  /* ---- one exercise done again (from the lesson's view): it ran exactly as in its lesson; the learner's place, finished exercises and
     delayed tests are as they were before it (kept in G.replay, so that leaving half-way or closing the app puts them back too) ---- */
  function replayDone(){ if(G.replay && (G.replay.run || (RULES.MASTERY && G.why==="perfect" && G.next===G.replay.li))) return perfectRunDone();      // (MASTERY) one yellow exercise done again in the lesson that waits on it: its end says what it opened
    const R0=G.replay, L=LESSONS[R0.li], X=L.exercises[R0.ei], res=RUN.ex.filter(x=>x.id===X.id).pop() || {perfect:false, p:0}; RUN.ex=[];
    restorePlace(); let bonus=0, badge=null; const today=dayOf(), p0=G.points-(res.p||0);
    if(lessonPerfect(L) && !G.lp[L.id]){ G.lp[L.id]=today; bonus=RULES.POINTS_PERFECT_LESSON; TY.bank("lesson", bonus); G.points+=bonus; G.lpts[L.id]=(G.lpts[L.id]||0)+bonus; badge=newBadge(today); }      // perfect now, by repair: +5 and it counts for the badges (the owner, 15 Nov late)
    delete G.lpts[L.id]; G.cur=null; const ranks=rankSync(); store(); look();
    try{ trace("exercise done again: Lesson "+(R0.li+1)+", exercise "+(R0.ei+1)+": "+(res.perfect?"perfect":"not perfect")+"; points +"+res.p+(bonus?"; the lesson is perfect now: +"+bonus:"")+"; the place is as it was"); }catch(e){}
    const o=$("done"), name=esc(S.learnerName||"");
    o.innerHTML = (res.perfect ? `<div class="okmark star">${ic("star")}</div><h1>Perfect${name?", "+name:""}!</h1><div class="sub">Lesson ${R0.li+1}, exercise ${R0.ei+1}: every answer right, first time.</div>`
        : `<div class="sunmark">${ic("sun")}</div><h1>Well done${name?", "+name:""}.</h1><div class="sub">Lesson ${R0.li+1}, exercise ${R0.ei+1} again.</div>`)
      + `<div class="card exstrip"><div class="row"><b>Lesson ${R0.li+1}</b>${res.p ? `<span class="pts">${ic("star")} +${res.p}</span>` : ""}</div><div class="exdots">${L.exercises.map((x,k)=>{ const g=G.ex[x.id]; return `<i class="${g ? (g.g?"g":"y") : ""}${k===R0.ei?" me":""}"></i>`; }).join("")}</div>${bonus ? `
          <small>Lesson ${R0.li+1}: all perfect</small>` : ""}</div>`
      + (badge ? `<div class="card badgec">${badgeSvg(badge, "badge big")}<div><small>A new badge</small><b>${badgeName(badge)}</b></div></div>` : "")
      + `<div class="spacer"></div><div class="donefoot">${rankBar(G.points, G.points)}<button class="btn" id="doneBtn">Continue</button></div>`;
    longName(o); o.hidden=false; o.scrollTop=0; $("doneBtn").onclick=()=>{ tick(); RK.stop(); TY.stop(); FIVE.stop(); o.hidden=true; stopFete(); home(); };
    // (hf3) its heading alone first (no high five: one exercise is not a lesson finished), then the tally, then the rest
    FIVE.run(o, ()=>TY.run(o, how=>{ FIVE.after(); if(how!=="none") summaryIn(o); fete(o, (res.perfect || !!(ranks && ranks.length)) && how!=="ward"); moments(o, {star:res.p>0 || !!bonus}); }), false); }
  /* (.71) the end of "Go for perfect": one praise for the whole run (the owner, 16 Nov: "they get praised for it afterwards. They get told the
     point total that was added at the end of that repair sequence and the extra … that was added to the overall progress indicator") */
  // (MASTERY) "Go for perfect" for a lesson's yellow exercises: the run that already exists, started at once
  function goPerfect(li){ const ei=toPerfect(li); if(!ei.length) return; pendingEx={li, ei}; pendingAgain=null; setTimeout(()=>{ const b=$("playBtn"); if(b) b.click(); }, 60); }
  function perfectRunDone(){ const R0=G.replay, L=LESSONS[R0.li], eis=R0.eis||[R0.ei], runs=RUN.ex.slice(); RUN.ex=[];
    const res=eis.map(k=>{ const id=L.exercises[k].id; return runs.filter(x=>x.id===id).pop() || {id, perfect:false, p:0}; });
    restorePlace(); let bonus=0, badge=null; const today=dayOf();
    if(lessonPerfect(L) && !G.lp[L.id]){ G.lp[L.id]=today; bonus=RULES.POINTS_PERFECT_LESSON; TY.bank("lesson", bonus); G.points+=bonus; badge=newBadge(today); }
    // (MASTERY) the lesson waiting on its yellows is all green now: it is passed, its words are the learner's, the next lesson opens
    const waits = RULES.MASTERY && G.why==="perfect" && G.next===R0.li, unlock = waits && lessonPerfect(L); let owned=[], lvUp=null;
    if(unlock){ G.why=""; G.next=Math.min(R0.li+1, last); G.furthest=Math.max(G.furthest, R0.li+1); (G.lessons[L.id]=G.lessons[L.id]||[]).push({date:today, x:null, y:null, passed:true, perfect:true, via:"go for perfect"});
      owned=cardsOf(L.id); if(!G.wordsAt[L.id]) G.wordsAt[L.id]=today; lvUp=newLevel(today); if(!badge) badge=newBadge(today); try{ trace("mastery: Lesson "+(R0.li+1)+" all green: Lesson "+(G.next+1)+" opens"); }catch(e){} }
    delete G.lpts[L.id]; G.cur=null; const ranks=rankSync(); store(); look();
    const made=res.filter(r=>r.p>0).length, already=res.filter(r=>r.perfect && !(r.p>0)).length, left=L.exercises.filter(x=>!(G.ex[x.id] && G.ex[x.id].g)).length;
    const added=G.points-(R0.p0!=null ? R0.p0 : G.points), lv=(()=>{ try{ return levelNow(); }catch(e){ return null; } })(), lpNow=Object.keys(G.lp).length;
    try{ trace("go for perfect: Lesson "+(R0.li+1)+": "+made+" of "+eis.length+" made perfect; points +"+added+(bonus?" (with +"+bonus+" for the perfect lesson)":"")+"; "+left+" left; the place is as it was"); }catch(e){}
    const o=$("done"), name=esc(S.learnerName||""), all=!left;
    const level = lv && lv.Lv ? `<div class="card prog"><div class="row"><b>Your French</b><span class="lvl">${esc(lv.Lv.id)}</span></div>
        <p><b>${lv.pct}%</b> to ${esc(lv.Lv.id)}</p></div>` : "";
    o.innerHTML = (unlock ? `<div class="okmark star">${ic("star")}</div><div class="perfect-tag">${ic("star")} Lesson ${R0.li+1}: all green</div>${R0.li+1<LESSONS.length ? `<h1>Lesson ${G.next+1} is open${name?", "+name:""}!</h1>` : `<h1>Lesson ${R0.li+1} is perfect${name?", "+name:""}!</h1><div class="sub">Lesson ${R0.li+2} is coming.</div>`}`      // (.84) the last lesson served: the next is coming, not open
          : all ? `<div class="okmark star">${ic("star")}</div><h1>Lesson ${R0.li+1} is perfect${name?", "+name:""}!</h1>`
          : made ? `<div class="okmark star">${ic("star")}</div><h1>${made} more perfect${name?", "+name:""}!</h1><div class="sub">Lesson ${R0.li+1}: ${made} of the ${eis.length} exercise${eis.length>1?"s":""} you went for ${made>1?"are":"is"} perfect now.</div>`
          : `<div class="sunmark">${ic("sun")}</div><h1>Well done${name?", "+name:""}.</h1><div class="sub">Lesson ${R0.li+1}: ${eis.length} exercise${eis.length>1?"s":""} practised.</div>`)
      + `<div class="card exstrip"><div class="row"><b>Lesson ${R0.li+1}</b>${added>0 ? `<span class="pts">${ic("star")} +<span data-n="${added}">${added}</span></span>` : ""}</div><div class="exdots">${L.exercises.map((x,k)=>{ const g=G.ex[x.id]; return `<i class="${g ? (g.g?"g":"y") : ""}${eis.includes(k)?" me":""}"></i>`; }).join("")}</div>
          ${left && !all ? `<small>${left} still to make perfect</small>` : ""}</div>`
      + level
      + (badge ? `<div class="card badgec">${badgeSvg(badge, "badge big")}<div><small>A new badge</small><b>${badgeName(badge)}</b></div></div>` : "")
      + (owned.length ? `<div class="card nowyours"><div class="row"><b>Now yours</b></div><div class="wrow">${owned.map((c,i)=>wcard(c, " turn").replace("<button", `<button style="--i:${i}"`)).join("")}</div></div>` : "")
      + `<div class="spacer"></div><div class="donefoot">${rankBar(G.points, G.points)}${unlock && G.next>R0.li ? `<button class="btn" id="doneBtn">${ic("play")} Next lesson</button><button class="btn quiet" id="doneLater">Later</button>` : waits && left ? `<button class="btn" id="doneBtn">${ic("star")} Go for perfect: ${left}</button><button class="btn quiet" id="doneLater">Later</button>` : `<button class="btn" id="doneBtn">Continue</button>`}</div>`;
    longName(o); o.hidden=false; o.scrollTop=0; wireCards(o);
    const after = ()=>{ if(lvUp) levelParty(lvUp, ()=>home()); else home(); };
    $("doneBtn").onclick=()=>{ tick(); RK.stop(); TY.stop(); FIVE.stop(); o.hidden=true; stopFete(); if(unlock && G.next>R0.li){ if(lvUp) levelParty(lvUp, ()=>home()); else { home(); setTimeout(()=>{ const b=$("playBtn"); if(b) b.click(); }, 60); } } else if(waits && left){ home(); goPerfect(R0.li); } else after(); };
    { const dl=$("doneLater"); if(dl) dl.onclick=()=>{ tick(); RK.stop(); TY.stop(); FIVE.stop(); o.hidden=true; stopFete(); after(); }; }
    const tally=()=>TY.run(o, how=>{ FIVE.after(); if(how!=="none") summaryIn(o); fete(o, (made>0 || unlock || !!(ranks && ranks.length)) && how!=="ward"); moments(o, {star:made>0 || !!bonus}); });
    FIVE.run(o, tally, unlock); }      // (hf2) the lesson completed by this run: its high five, as at a lesson's end; (hf3) else its heading alone first
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
    const eis = Array.isArray(ei) ? ei.slice() : [ei];      // (.71) "Go for perfect": several exercises, one after another, in one run
    G.replay={li, ei:eis[0], eis, run: eis.length>1 || Array.isArray(ei), p0:G.points, lp0:Object.keys(G.lp).length, lv0:(()=>{ try{ const n=levelNow(); return n && n.perf; }catch(e){ return null; } })(), snap, t0:new Date().toISOString()}; store();
    S.lesson=li; S.ex=eis[0]; LESSONS[li].exercises.forEach((x,k)=>{ if(eis.includes(k)) delete S.finished[x.id]; else S.finished[x.id]=true; }); S.delayed=[];
    logEntry({result: G.replay.run ? "GO FOR PERFECT: Lesson "+(li+1)+", exercises "+eis.map(k=>k+1).join(", ")+" (the learner's own choice: every exercise not yet perfect, one after another; their delayed tests are not kept, the place is put back after it)"
      : "EXERCISE AGAIN: Lesson "+(li+1)+", exercise "+(ei+1)+" ("+LESSONS[li].exercises[ei].id+"; the learner's own choice: a replay, its delayed tests are not kept, the place is put back after it)", heard:[]}); save(); }
  // the exercises of a done lesson that are not yet perfect (an error, or done before the record began)
  const toPerfect = li => LESSONS[li].exercises.map((x,k)=>({x,k})).filter(o=>!(G.ex[o.x.id] && G.ex[o.x.id].g)).map(o=>o.k);
  // the progress bar of a replay counts that one exercise
  { const ps0=UI.progStart; UI.progStart=function(L){ const r=ps0.apply(this, arguments); try{ if(G.replay && L && L.id===LESSONS[G.replay.li].id){ const eis=G.replay.eis || [G.replay.ei]; UI.PROG.total=Math.max(1, eis.reduce((m,k)=>m+L.exercises[k].parts.reduce((n,p)=>n+p.items.filter(it=>it.type==="task").length,0),0)); UI.PROG.base=0; UI.progDraw(); } }catch(e){} return r; }; }

  /* ---- a lesson done, and every exercise in it: green when perfect, yellow when it had an error; any of them can be done again ---- */
  function lessonView(li){ const o=$("lessonV"), L=LESSONS[li], nP=L.exercises.filter(x=>G.ex[x.id]&&G.ex[x.id].g).length, known=L.exercises.filter(x=>G.ex[x.id]).length;
    o.innerHTML=`<div class="mk-bar" style="padding:0"><button class="rb plain" id="lvBack" aria-label="Back">${ic("chev")}</button><h2>Lesson ${li+1}</h2></div>
      <div class="card lvsum">${G.lp[L.id] ? badgeSvg(li+1, "badge") : `<div class="ring" style="--p:${Math.round(100*nP/L.exercises.length)}%"><b>${nP}</b></div>`}<div><b>${G.lp[L.id] ? "A perfect lesson" : nP+" of "+L.exercises.length+" exercises perfect"}</b></div></div>
      <div class="exgrid">${L.exercises.map((x,k)=>{ const g=G.ex[x.id]; return `<button class="extile ${g ? (g.g?"g":"y") : "u"}" data-ei="${k}" aria-label="Exercise ${k+1}: ${g ? (g.g?"perfect":"had an error") : "done"}"><span class="k">${k+1}</span><span class="mini" data-lz="x|${li}|${k}"></span><span class="st">${g ? (g.g?ic("star"):"") : ""}</span></button>`; }).join("")}</div>
      <div class="legend"><span><i class="g"></i>Perfect</span><span><i class="y"></i>Had an error</span>${known<L.exercises.length?`<span><i class="u"></i>Done before the record began</span>`:""}</div>
      ${lvWords(li)}
      ${toPerfect(li).length ? `<button class="btn" id="lvPerfect">${ic("star")} Go for perfect in this lesson</button>` : ""}
      ${G.why==="perfect" && li===G.next ? "" : `<button class="btn quiet" id="lvAll">${ic("redo")} The whole lesson again</button>`}`;
    o.hidden=false; o.scrollTop=0; LZ.watch(o); freezeMinis(o); wireCards(o); COACH.learned("path"); COACH.arrive();
    $("lvBack").onclick=()=>{ tick(); o.hidden=true; };
    { const gp=$("lvPerfect"); if(gp) gp.onclick=()=>{ tick("go"); COACH.learned("perfect"); o.hidden=true; pendingEx={li, ei:toPerfect(li)}; pendingAgain=null; $("playBtn").click(); }; }
    if($("lvAll")) $("lvAll").onclick=()=>{ tick(); o.hidden=true; pendingAgain=li; pendingEx=null; tab("today"); const h=$("home"); h.scrollTo({top:0, behavior:"smooth"}); };      // started on Home, where every lesson is started ("Again, your choice")
    o.querySelectorAll("[data-ei]").forEach(b=>{ b.onclick=()=>{ tick(); COACH.learned("tiles"); const ei=+b.dataset.ei, g=G.ex[L.exercises[ei].id];
      info(`Lesson ${li+1}, exercise ${ei+1}`, `<div class="exprev">${firstMini(L.exercises[ei], "big")}</div>${g ? `<p>${g.g ? "Perfect already: no points this time." : "It had an error. Every answer right this time: +"+RULES.POINTS_PERFECT_REPAIR+"."}</p>` : ""}<p class="small">Your place in the course stays where it is.</p><button class="btn" id="exGo">${ic("play")} Do exercise ${ei+1} again</button>`); freezeMinis($("sheet")); MV.grow(b.querySelector(".mini"), document.querySelector("#sheet .exprev .mini"));
      $("exGo").onclick=()=>{ tick("go"); $("sheet").hidden=true; o.hidden=true; pendingEx={li, ei}; pendingAgain=null; $("playBtn").click(); }; }; }); }
  // the words this lesson made the learner's own (they were the Words tab's cards; now they are in the lesson that gave them): tap one to hear Marie say it
  function lvWords(li){ const L=LESSONS[li], cs=cardsOf(L.id), e=CW.lessons[L.id]||{}, d=G.wordsAt[L.id];
    return `<div class="card lvwords"><div class="row"><b>${cs.length ? `Words from this lesson` : "No new words"}</b><small>${cs.length ? (d ? new Date(d+"T12:00").toLocaleDateString([], {day:"numeric", month:"long"}) : "") : ""}</small></div>
      ${cs.length ? `<div class="wgrid">${cs.map((c,ci)=>wcard(c, "", "c|"+li+"|"+ci)).join("")}</div>` : (e.repeats ? `<p>Goes over Lesson ${e.repeats} again.</p>` : "")}</div>`; }
  const firstSvg = x=>{ try{ for(const p of x.parts) for(const it of p.items){ const row=(it.scene&&it.scene.row)||[]; const sp=row.find(r=>r && typeof r==="object" && r.person!=="you"); if(sp) return `<svg viewBox="0 0 160 190" aria-hidden="true">${picture(Object.assign({}, sp, {count:1, still:true})).outerHTML}</svg>`; } }catch(e){} return ""; };
  const firstMini = (x, cls="")=>`<span class="mini ${cls}">${firstSvg(x)}</span>`;

  /* the one celebration: paper in the four people's colours and the numbers counting up (900 ms). Nothing of it with less movement. */
  let feteT=0;
  function stopFete(){ clearTimeout(feteT); const c=$("confetti"); if(c) c.remove(); }
  function fete(o, big){ if(lessMotion()) return; const t0=performance.now(), D=900, ease=x=>1-Math.pow(1-x,3);
    const nums=[...o.querySelectorAll("[data-n]")].map(b=>({b, n:+b.dataset.n, pc:!!b.dataset.pc}));
    const step=t=>{ const k=ease(Math.min(1,(t-t0)/D)); for(const x of nums) x.b.textContent=Math.round(x.n*k)+(x.pc?"%":""); if(k<1) requestAnimationFrame(step); }; requestAnimationFrame(step);
    // (QA .67) whatever the frames do (a slow phone, the screen not showing), the true numbers stand a moment later: a count caught on its way read
    // "67 correct ... 97% ... +21" beside "A perfect lesson" (the true figures: 69, 100 %, +22)
    setTimeout(()=>{ for(const x of nums) x.b.textContent=x.n+(x.pc?"%":""); }, D+250);
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
    /* (owner, 16 Nov: "the sounds that play when I get an answer right are not high pitched enough. It's not clear enough that I'm getting
       answers correct") D: sound A an octave higher (C6, D6, E6 in turn), a little longer and louder, with a short bright octave above it:
       where a phone's small speaker is strongest, so it is heard plainly; still one soft note, under 200 ms, well below Marie */
    D:(ac,t,k,g)=>{ const f=[1046.5,1174.66,1318.51][k%3]; tone(ac,t,f,0.19,g*1.7,0.004); tone(ac,t,f*2,0.07,g*0.5,0.003); },
    A:(ac,t,k,g)=>{ const f=[523.25,587.33,659.25][k%3]; tone(ac,t,f,0.13,g,0.006); tone(ac,t,f*3,0.035,g*0.10,0.004); },                   // a soft marimba: the fundamental, a faint third partial gone in 35 ms
    B:(ac,t,k,g)=>{ const f=[440,493.88,554.37][k%3]; tone(ac,t,f,0.14,g,0.008); tone(ac,t,f*2.76,0.05,g*0.07,0.006); },                  // a felt bell: low, one faint inharmonic partial
    C:(ac,t,k,g)=>{ const f=[392,440,493.88][k%3]; tone(ac,t,f,0.11,g,0.007, 1.12); },                                                      // a drop: a pure tone that settles a little in pitch
  };
  function tone(ac, t, f, dur, gain, att, glide){ const o=ac.createOscillator(), v=ac.createGain(), lp=ac.createBiquadFilter(); o.type="sine";
    o.frequency.setValueAtTime(f*(glide||1), t); if(glide) o.frequency.exponentialRampToValueAtTime(f, t+0.06);
    lp.type="lowpass"; lp.frequency.value=2200; v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(gain, t+att); v.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    o.connect(lp).connect(v).connect(ac.destination); o.start(t); o.stop(t+dur+0.02); }
  /* ---- the sounds of pressing (the owner, 16 Nov: "satisfying audible feedback when the user selects something that indicates progress
     towards learning. For example, selecting the user's name from the initial menu, or selecting the start lesson button, gets a positive
     noise. Selecting anything else should get a noise, but a fairly low-key one that's satisfying but subtle"). Made here, nothing fetched.
     "go": two rising notes of the right-answer sound's family (higher = "right", the owner), for a step toward learning: choosing who is
     learning, starting a lesson or an exercise, the figure made, the two moments chosen. "tap": one soft low tock, for every other press.
     Never inside a lesson (Marie's voice and the right-answer note are the only sounds there). The setting "Sounds when you press" turns both off. */
  const UISND = {
    tap:(ac,t)=>{ tone(ac, t, 392, 0.05, 0.03, 0.003, 1.35); },
    pick:(ac,t)=>{ tone(ac, t, 587.33, 0.075, 0.04, 0.002, 0.62); tone(ac, t+0.012, 880, 0.05, 0.012, 0.002); },      // (the figure maker) a choice made: a soft rising pop
    go:(ac,t)=>{ tone(ac, t, 659.25, 0.12, 0.06, 0.005); tone(ac, t, 659.25*3, 0.03, 0.006, 0.004); tone(ac, t+0.09, 987.77, 0.17, 0.065, 0.005); tone(ac, t+0.09, 987.77*3, 0.035, 0.006, 0.004); },
  };
  let uiSoundAt=0;
  let uiLastKind="";
  function uiSound(kind){ try{ if(!UI.pref.sound || document.body.classList.contains("inLesson")) return; beadCtx(); if(!beadAC) return;
      if(kind===uiLastKind && performance.now()-uiSoundAt<450) return;      // (17 Nov) a press already answered on touch-down is not answered again on release
      uiSoundAt=performance.now(); uiLastKind=kind; (UISND[kind]||UISND.tap)(beadAC, beadAC.currentTime+0.004); }catch(e){} }
  window.UISOUND=uiSound;
  /* ---- (game feel) the music of the big moments: made here with Web Audio like every other sound of the app (nothing fetched), of the same
     family (soft sines and bells in C major, the right-answer note's register), through one bus that can be hushed at once (a skip). Only
     outside a lesson; the setting "Sounds when you press" turns it off with the rest. ---- */
  const SFX = (()=>{ let bus=null;
    const ac=()=>{ try{ if(!UI.pref.sound || document.body.classList.contains("inLesson")) return null; beadCtx(); return beadAC && beadAC.state==="running" ? beadAC : null; }catch(e){ return null; } };
    function out(a){ if(bus && bus.a===a) return bus.g; const g=a.createGain(), c=a.createDynamicsCompressor(); c.threshold.value=-16; c.ratio.value=5; c.attack.value=0.004; c.release.value=0.2; g.gain.value=1; g.connect(c).connect(a.destination); bus={a, g, c}; return g; }
    function hush(){ const b=bus; if(!b) return; bus=null; try{ const t=b.a.currentTime; b.g.gain.cancelScheduledValues(t); b.g.gain.setValueAtTime(b.g.gain.value, t); b.g.gain.linearRampToValueAtTime(0, t+0.18); setTimeout(()=>{ try{ b.g.disconnect(); b.c.disconnect(); }catch(e){} }, 400); }catch(e){} }
    // one voice: an oscillator through a low-pass, a soft attack and a long fall (a bell when `bell`: two faint partials above it)
    function v(a, t, f, dur, gain, o={}){ const os=a.createOscillator(), g=a.createGain(), lp=a.createBiquadFilter(); os.type=o.type||"sine"; os.frequency.setValueAtTime(f*(o.from||1), t); if(o.from) os.frequency.exponentialRampToValueAtTime(f, t+(o.glide||0.08));
      if(o.det) os.detune.value=o.det; lp.type="lowpass"; lp.frequency.value=o.cut||5200; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t+(o.att||0.006)); g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
      os.connect(lp).connect(g).connect(out(a)); os.start(t); os.stop(t+dur+0.05);
      if(o.bell){ v(a, t, f*2, dur*0.55, gain*0.22, {att:o.att, cut:9000}); v(a, t, f*3.01, dur*0.3, gain*0.07, {att:o.att, cut:9000}); } }
    function noise(a, t, dur, gain, f, q, type="bandpass", rise=false){ const n=Math.max(1, Math.floor(a.sampleRate*dur)), buf=a.createBuffer(1, n, a.sampleRate), d=buf.getChannelData(0); for(let i=0;i<n;i++) d[i]=Math.random()*2-1;
      const s=a.createBufferSource(), fl=a.createBiquadFilter(), g=a.createGain(); s.buffer=buf; fl.type=type; fl.frequency.setValueAtTime(rise ? f*0.25 : f, t); if(rise) fl.frequency.exponentialRampToValueAtTime(f, t+dur); fl.Q.value=q;
      if(rise){ g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t+dur*0.96); g.gain.linearRampToValueAtTime(0, t+dur); } else { g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t+dur); }
      s.connect(fl).connect(g).connect(out(a)); s.start(t); s.stop(t+dur+0.02); }
    const N={C4:261.63, E4:329.63, G4:392, A4:440, C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99, A5:880, B5:987.77, C6:1046.5, D6:1174.66, E6:1318.51, G6:1567.98, C7:2093};
    const go=f=>{ const a=ac(); if(!a) return; try{ f(a, a.currentTime+0.01); }catch(e){} };
    return { hush,
      // the meeting of the two: a clap (two bursts of air) and a bright "ta-da"
      clap:()=>go((a,t)=>{ noise(a, t, 0.07, 0.55, 1900, 0.9); noise(a, t+0.012, 0.09, 0.35, 1200, 0.7); v(a, t+0.03, N.G5, 0.22, 0.07, {bell:true}); v(a, t+0.13, N.C6, 0.42, 0.08, {bell:true}); }),
      // the anticipation: a low swell that rises in pitch and grows, a shimmer quickening over it, and air rising to the flash
      swell:(sec, big)=>go((a,t)=>{ const g=a.createGain(), lp=a.createBiquadFilter(), trem=a.createGain(), lfo=a.createOscillator(), lg=a.createGain();
        lp.type="lowpass"; lp.frequency.setValueAtTime(380, t); lp.frequency.exponentialRampToValueAtTime(big?3600:2800, t+sec);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(big?0.15:0.12, t+sec*0.97); g.gain.linearRampToValueAtTime(0, t+sec+0.04);
        lfo.frequency.setValueAtTime(3, t); lfo.frequency.exponentialRampToValueAtTime(15, t+sec); lg.gain.value=0.35; trem.gain.value=0.65; lfo.connect(lg).connect(trem.gain);
        lp.connect(trem).connect(g).connect(out(a));
        for(const [f0,f1,ty,dt] of [[N.C4/2, N.G4, "triangle", -6], [N.C4/2, N.G4, "triangle", 7], [N.G4/2, N.C5, "sine", 0], [N.C4, N.C5*1.0, "sine", 3]]){ const o=a.createOscillator(); o.type=ty; o.detune.value=dt; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t+sec); o.connect(lp); o.start(t); o.stop(t+sec+0.06); }
        lfo.start(t); lfo.stop(t+sec+0.06); noise(a, t+sec*0.35, sec*0.65, big?0.09:0.06, 5200, 0.6, "bandpass", true); }),
      // a small rise for a new star
      rise:sec=>go((a,t)=>{ v(a, t, N.C5, sec, 0.035, {from:0.5, glide:sec, att:sec*0.8, type:"triangle", cut:2400}); noise(a, t+sec*0.3, sec*0.7, 0.035, 6000, 0.7, "bandpass", true); }),
      // the reveal: a bright chord, bells on top (a new star: three notes; a new title: five, a low C under them; the highest rank: a step from F to C)
      chord:(kind, soft)=>go((a,t)=>{ const g=soft ? 0.5 : 1;
        if(kind==="grade"){ [N.E5, N.G5, N.C6].forEach((f,i)=>v(a, t+i*0.035, f, 1.1, 0.07*g, {bell:true})); v(a, t+0.12, N.E6, 0.8, 0.04*g, {bell:true}); return; }
        if(kind==="top"){ [N.F5, N.A5, N.C6].forEach(f=>v(a, t, f, 0.55, 0.06*g, {bell:true})); t+=0.32; }
        v(a, t, N.C4, 1.9, 0.09*g, {type:"triangle", cut:1400, att:0.02}); [N.C5, N.E5, N.G5, N.C6, N.E6].forEach((f,i)=>v(a, t+i*0.012, f, 1.8, 0.06*g, {bell:true, att:0.008})); v(a, t+0.05, N.D6, 1.2, 0.025*g, {bell:true}); noise(a, t, 0.35, 0.05*g, 7000, 0.5); }),
      // the little fanfare after it
      fanfare:big=>go((a,t)=>{ const run=[N.G5, N.C6, N.E6, N.G6]; run.forEach((f,i)=>v(a, t+i*0.09, f, 0.26, 0.05, {bell:true}));
        const e=t+run.length*0.09+0.04; [N.C6, N.E6, N.G6].forEach(f=>v(a, e, f, big?1.6:1.1, 0.045, {bell:true})); if(big){ [N.G5, N.C6, N.E6, N.G6, N.C7].forEach((f,i)=>v(a, e+0.5+i*0.07, f, 0.5, 0.035, {bell:true})); } }),
      // a token into the counter: a coin's ring, a step higher each time
      ting:i=>go((a,t)=>{ const f=N.E6*Math.pow(2, Math.min(i,7)*2/12); v(a, t, f, 0.32, 0.06, {bell:true, att:0.003}); v(a, t+0.04, f*1.5, 0.18, 0.025, {att:0.003}); }),
      // the strip going by: a soft click for each thing that passes
      tickS:()=>go((a,t)=>{ noise(a, t, 0.018, 0.12, 3200, 1.2); }),
      // (ward2) the padlock opening: a sharp metal click (the bolt), a lighter snap (the shackle), a small ring
      unlock:()=>go((a,t)=>{ noise(a, t, 0.012, 0.4, 4600, 2.2); v(a, t, 2600, 0.04, 0.04, {type:"square", cut:6000}); noise(a, t+0.055, 0.025, 0.3, 2400, 1.6); v(a, t+0.06, 180, 0.12, 0.12, {from:1.5, glide:0.06, cut:800}); v(a, t+0.08, N.G6, 0.45, 0.035, {bell:true}); }),
      // the stamp on the thing: a soft thump and three notes up (a thing still to come: two)
      stamp:can=>go((a,t)=>{ v(a, t, 140, 0.2, 0.25, {from:1.6, glide:0.12, cut:900}); noise(a, t, 0.05, 0.25, 900, 0.8);
        (can ? [N.C6, N.E6, N.G6] : [N.G5, N.C6]).forEach((f,i)=>v(a, t+0.08+i*0.075, f, 0.5, 0.05, {bell:true})); }),
      // (the wardrobe) the thing flying to its place, its landing on the figure, and the congratulation
      whoosh:()=>go((a,t)=>{ noise(a, t, 0.42, 0.10, 2600, 0.9, "bandpass", true); }),
      putOn:()=>go((a,t)=>{ v(a, t, N.G5, 0.18, 0.08, {from:0.5, glide:0.09, type:"triangle", cut:3000}); v(a, t+0.06, N.C6, 0.5, 0.07, {bell:true}); noise(a, t, 0.05, 0.18, 4200, 1); }),
      cheer:soft=>go((a,t)=>{ const g=soft?0.5:1; [N.C6, N.E6, N.G6].forEach((f,i)=>v(a, t+i*0.07, f, 0.35, 0.05*g, {bell:true})); [N.C5, N.E5, N.G5, N.C6].forEach(f=>v(a, t+0.24, f, 1.2, 0.045*g, {bell:true})); v(a, t+0.24, N.C4, 1.2, 0.06*g, {type:"triangle", cut:1400, att:0.02}); }),
      // (the tally) a rising tone under the filling bar (x: how full, 0 to 1 and a little more for each rank passed), and a soft tick for each point
      fill:()=>{ const a=ac(), none={set(){}, stop(){}}; if(!a) return none; try{ const t=a.currentTime, o1=a.createOscillator(), o2=a.createOscillator(), g=a.createGain(), lp=a.createBiquadFilter(), f=x=>200*Math.pow(4, Math.max(0, Math.min(1.4, x)));
          o1.type="triangle"; o2.type="sine"; lp.type="lowpass"; lp.frequency.value=2600; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t+0.09);
          o1.frequency.setValueAtTime(f(0), t); o2.frequency.setValueAtTime(f(0)*2, t); o1.connect(lp); o2.connect(lp); lp.connect(g).connect(out(a)); o1.start(t); o2.start(t);
          return {set(x){ try{ const n=a.currentTime; o1.frequency.setTargetAtTime(f(x), n, 0.03); o2.frequency.setTargetAtTime(f(x)*2, n, 0.03); }catch(e){} },
            stop(){ try{ const n=a.currentTime; g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), n); g.gain.exponentialRampToValueAtTime(0.0001, n+0.12); o1.stop(n+0.16); o2.stop(n+0.16); }catch(e){} }}; }catch(e){ return none; } },
      tick:x=>go((a,t)=>{ v(a, t, 1046.5*Math.pow(2, Math.max(0, Math.min(1.4, x||0))), 0.07, 0.03, {att:0.002, cut:8000}); }),
      // (the brand) an anvil's clang: a sharp strike (air and a click), a low thump, and the ring of a metal bar (inharmonic partials, the low
      // ones longest, each a pair a few cents apart that beat), in a little room
      clang:big=>go((a,t)=>{ const g=big?1:0.8, room=a.createConvolver(), n=Math.floor(a.sampleRate*1.4), ir=a.createBuffer(2, n, a.sampleRate);
        for(let ch=0;ch<2;ch++){ const d=ir.getChannelData(ch); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n, 3.2); }
        room.buffer=ir; const wet=a.createGain(); wet.gain.value=0.22; room.connect(wet).connect(out(a));
        const ring=(f, dur, gain, det)=>{ for(const d of [0, det]){ const o=a.createOscillator(), e=a.createGain(); o.type="sine"; o.frequency.value=f; o.detune.value=d;
            e.gain.setValueAtTime(0.0001, t); e.gain.exponentialRampToValueAtTime(gain*g, t+0.003); e.gain.exponentialRampToValueAtTime(0.0001, t+dur); o.connect(e); e.connect(out(a)); e.connect(room); o.start(t); o.stop(t+dur+0.05); } };
        const f0=big?560:640; [[1,2.2,0.09,6],[2.76,1.5,0.06,9],[5.4,0.9,0.04,12],[8.93,0.5,0.025,15],[13.3,0.25,0.015,20]].forEach(([r,d,gn,dt])=>ring(f0*r, d, gn, dt));
        noise(a, t, 0.025, 0.7*g, 6500, 0.7, "highpass"); noise(a, t, 0.06, 0.35*g, 2500, 1.2);
        v(a, t, 95, 0.22, 0.35*g, {from:1.8, glide:0.05, cut:700}); }),
      // the briefer moments: a perfect lesson, a new badge, a ring closed, a level
      moment:(k, delay=0)=>setTimeout(()=>go((a,t)=>{ const R={perfect:[N.C6, N.E6, N.G6, N.C7], badge:[N.G5, N.C6, N.E6], ring:[N.E5, N.G5, N.C6], level:[N.C5, N.E5, N.G5, N.C6, N.E6, N.G6]}[k]||[N.C6];
        R.forEach((f,i)=>v(a, t+i*0.085, f, 0.6+i*0.05, 0.05, {bell:true})); if(k==="level" || k==="perfect") [N.C5, N.G5].forEach(f=>v(a, t+R.length*0.085, f, 1.2, 0.04, {bell:true})); }), delay) }; })();      // the page's own first screens (the name typed, a start asked while the listener loads) use it
  // every press of a control that made no sound of its own gets the quiet one (after the control's own handler has run)
  const UI_SEL="button, [role=button], [data-lv], [data-u], label, select, summary, a[href]", UI_GO="#playBtn, #exGo, #lvPerfect, #mkDone, #anOk, #micGo, [data-u]";
  function uiTaps(){
    // (17 Nov) the sound of a press on touch-down, within the frame (a step toward learning: the brighter one), as the control goes down
    document.addEventListener("pointerdown", e=>{ try{ if(e.isTrusted===false || (e.button && e.button!==0)) return; const b=e.target && e.target.closest && e.target.closest(UI_SEL); if(!b || b.disabled) return;
      b._pd=performance.now(); uiSound(b.matches(UI_GO) ? "go" : "tap"); }catch(_){} }, {passive:true, capture:true});
    document.addEventListener("click", e=>{ try{ if(e.isTrusted===false || performance.now()-uiSoundAt<120) return; { const b0=e.target && e.target.closest && e.target.closest(UI_SEL); if(b0 && b0._pd && performance.now()-b0._pd<1500) return; }
      const b=e.target && e.target.closest && e.target.closest("button, [role=button], [data-lv], [data-u], label, select, summary, a[href]"); if(!b || b.disabled) return; uiSound("tap"); }catch(_){} }); }
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
  const miniLz = spec=>`<div class="mini" data-lz="p|${esc(JSON.stringify(spec))}"></div>`;      // drawn when it comes near the screen (LZ)
  /* ---- (QA .67) pictures that are not on the screen yet are drawn when they come near it, and a few at a time while the phone is idle. Measured at a
     quarter of this machine's speed: the wardrobe (31 figures, 57 kB of drawing each) took 1.8 s to open, and home drew all the path's pictures before
     its first frame. What is on the screen is drawn at once, as before; nothing is drawn while a lesson runs. data-lz names the picture:
     "w|item" a wardrobe item on the learner's figure, "x|lesson|exercise" an exercise's first picture, "p|spec" a small picture, "c|lesson|card" a word's card. ---- */
  const LZ = (()=>{ const ios=new WeakMap(); let gen=0;
    const draw = a=>{ const r=a.split("|"), k=r.shift();
      if(k==="w"){ const it=WARDROBE.find(x=>x.id===r[0]); return it ? wardThumb(it) : ""; }
      if(k==="x") return firstSvg(LESSONS[+r[0]].exercises[+r[1]]);
      if(k==="p") return `<svg viewBox="0 0 160 190" aria-hidden="true">${pic(stillSpec(JSON.parse(r.join("|")))).outerHTML}</svg>`;
      if(k==="c"){ const c=cardsOf(LESSONS[+r[0]].id)[+r[1]]; return c ? cardPic(c) : ""; }
      return ""; };
    function fill(e){ const a=e.getAttribute("data-lz"); if(a==null) return; e.removeAttribute("data-lz"); try{ e.insertAdjacentHTML("afterbegin", draw(a)); if(e.classList.contains("mini")) freezeMinis(e.parentNode);
        if(e.classList.contains("wthumb")){ const v=e.querySelector("svg"); if(v){ v.pauseAnimations(); v.setCurrentTime(0.9); } } }catch(x){} }      // a still picture in the grid (its stars twinkle on the item's own sheet)
    // what has come near the screen is drawn one picture at a time (never a long stop of the screen), then, while the phone is idle, the rest
    let q=[], pumping=false; const busy=()=>document.body.classList.contains("inLesson") || !!document.querySelector(".rkc"), loading=()=>!!document.getElementById("splash");      // (QA 2) nothing off the screen is drawn while the loading screen hands over
    function pump(){ if(pumping) return; pumping=true; const step=()=>{ if(loading() && q.length){ setTimeout(step, 150); return; } const e=q.shift(); if(!e || busy()){ pumping=false; q=[]; return; } if(e.isConnected) fill(e); setTimeout(step, 24); }; setTimeout(step, 0); }
    function watch(sc){ const els=[...sc.querySelectorAll("[data-lz]")]; let io=ios.get(sc); if(io) io.disconnect(); if(!els.length) return;
      if(!("IntersectionObserver" in window)){ els.forEach(fill); return; }
      const H=innerHeight; for(const e of els){ const r=e.getBoundingClientRect(); if(r.height && r.bottom>-20 && r.top<H+20) fill(e); }      // on the screen now: at once (no empty frame)
      if(!io){ io=new IntersectionObserver(es=>{ for(const x of es) if(x.isIntersecting){ io.unobserve(x.target); q.push(x.target); } pump(); }, {root:sc, rootMargin:"700px 0px"}); ios.set(sc, io); }
      sc.querySelectorAll("[data-lz]").forEach(e=>io.observe(e));
      const g=++gen, later=f=>window.requestIdleCallback ? requestIdleCallback(f, {timeout:1500}) : setTimeout(f, 180);
      const step=()=>{ if(g!==gen || !sc.isConnected || sc.closest("[hidden]") || busy()) return; const e=sc.querySelector("[data-lz]"); if(!e) return; if(!q.length && !loading()) fill(e); later(step); };
      setTimeout(()=>later(step), 1200); }
    return {watch}; })();
  const picsOf = (()=>{ const memo={}; return i=>{ if(memo[i]) return memo[i]; const seen=new Set(), out=[];
      for(const ex of LESSONS[i].exercises) for(const p of ex.parts) for(const it of p.items){ const row=(it.scene&&it.scene.row)||[]; for(const x of row){ if(!x || typeof x!=="object") continue;
        const k=x.person ? "p:"+x.person+(x.doing||"") : (x.is||"")+":"+(x.doing||x.value||""); if(x.person==="you" || seen.has(k)) continue; seen.add(k); out.push(Object.assign({}, x, {count:1})); } }
      return (memo[i]=out); }; })();
  const newPics = i=>{ const cs=cardsOf(LESSONS[i].id).filter(c=>c.spec!=null); if(cs.length) return cs.map(c=>c.spec).slice(0,5);
    const before=new Set(); for(let k=0;k<i;k++) picsOf(k).forEach(x=>before.add(JSON.stringify([x.person,x.is,x.doing,x.value]))); const fresh=picsOf(i).filter(x=>!before.has(JSON.stringify([x.person,x.is,x.doing,x.value]))); return (fresh.length?fresh:picsOf(i)).slice(0,5); };
  /* (.91; truth91 PICTURE FIRST BUILT after Lesson 8: a lesson with no word cards shows its fresh pictures on Home's hero) the hero's small still
     pictures of lesson i, for index.html warmPictures to draw ahead */
  window.homeMinis = i=>{ try{ return newPics(i).slice(0,3).map(stillSpec); }catch(e){ return []; } };
  /* ---- THE STREAK (the owner, 16 Nov: "the idea of a streak should be more of a feature of this app ... very prominent ... integrate it into the
     reward system we already have"; and on freezing and repairing: "Duolingo know what they're doing, so we should copy them"). Not a second
     system: it is the run of days the record has always kept (G.run, G.bestRun), and its day is the day's ring: a lesson finished (new or again)
     closes the ring and keeps the streak. At the top of Home; its milestones are badges beside the perfect lessons' and pay tokens (some a
     freeze too). As Duolingo: a STREAK FREEZE, held before the day (at most FREEZE_MAX; bought in the Wardrobe or given at a milestone), covers a
     missed day by itself; a streak lost can be REPAIRED for REPAIR_DAYS after the loss, by tokens or by REPAIR_LESSONS lessons in a day.
     Never red, never "lost" in words: a streak that ends is day 1 again, the best stays. ---- */
  const STK={up:null};
  const fz = ()=>Array.isArray(G.freezes) ? G.freezes : (G.freezes=[]);      // the freezes held: the day each was had (it covers only days after it)
  function streakPay(){ const paid=[]; const P=G.streakPaid||(G.streakPaid={});
    for(const [m,t,f] of RULES.STREAK_MILESTONES) if(G.run.len>=m && !P[m]){ P[m]=dayOf(); earn(t); let got=0; for(let k=0;k<(f||0);k++) if(fz().length<RULES.FREEZE_MAX){ fz().push(dayOf()); got++; } paid.push([m,t,got]); }
    if(paid.length){ try{ trace("streak: "+G.run.len+" days; a badge, "+paid.map(x=>"+"+x[1]+" token(s)"+(x[2]?" +"+x[2]+" freeze":"")+" ("+x[0]+" days)").join(", ")); }catch(e){} } return paid; }
  const missedSince = (last, today)=>{ const out=[]; if(!last) return out; for(let k=1;k<daysBetween(last, today);k++) out.push(addDays(last, k)); return out; };
  // which missed days the freezes held cover: in order, each by a freeze had before it, until one cannot be covered
  function freezePlan(miss){ const F=fz().slice().sort(), used=[], cover=[]; for(const day of miss){ const i=F.findIndex((a,k)=>!used.includes(k) && a<day); if(i<0) break; used.push(i); cover.push(day); } return {cover, used:used.map(i=>F[i])}; }
  function useFreezes(plan){ if(!plan.cover.length) return; const Z=G.frozen||(G.frozen={}); plan.cover.forEach(d=>Z[d]=1); for(const a of plan.used){ const i=fz().indexOf(a); if(i>=0) fz().splice(i,1); } try{ trace("streak: "+plan.cover.length+" freeze(s) used: "+plan.cover.join(", ")); }catch(e){} }
  const repairPrice = len=>(RULES.REPAIR_TOKENS.find(([upto])=>len<upto)||[0,RULES.REPAIR_TOKENS[0][1]])[1];
  // a streak lost and still repairable, from the record as it stands (no lesson since the loss)
  function lossNow(today){ if(!G.run.last || !(G.run.len>0) || G.run.last===today) return null; const miss=missedSince(G.run.last, today); if(!miss.length) return null;
    const plan=freezePlan(miss); if(plan.cover.length===miss.length) return {plan, loss:null}; return {plan, loss:miss[plan.cover.length]}; }
  // a repair (by tokens, or by lessons): the streak as if the lost days had been frozen; the days it mends show as repaired
  function streakRepair(how){ const today=dayOf(); let L=G.lost; const fix=G.fixed||(G.fixed={});
    if(!L){ const li=lossNow(today); if(!li || !li.loss || daysBetween(li.loss, today)>RULES.REPAIR_DAYS) return false;
      if(how==="tokens"){ const pr=repairPrice(G.run.len); if((G.tokens||0)<pr) return false; G.tokens-=pr; }
      useFreezes(li.plan); missedSince(G.run.last, today).filter(d=>!(G.frozen||{})[d]).forEach(d=>fix[d]=1); G.run.last=addDays(today,-1); }
    else { if(how==="tokens"){ const pr=repairPrice(L.len); if((G.tokens||0)<pr) return false; G.tokens-=pr; }
      const start = G.run.len>0 ? addDays(G.run.last, -(G.run.len-1)) : today; missedSince(L.last, start).filter(d=>!(G.frozen||{})[d]).forEach(d=>fix[d]=1);
      if(G.run.len>0 && G.run.last===today) G.run.len=L.len+G.run.len; else { G.run.len=L.len+Math.max(0,G.run.len); missedSince(G.run.last||L.last, today).forEach(d=>fix[d]=1); G.run.last=addDays(today,-1); } }
    G.lost=null; G.bestRun=Math.max(G.bestRun, G.run.len); try{ trace("streak: repaired ("+how+"); "+G.run.len+" days"); }catch(e){} store(); return true; }
  // every lesson finished: freezes cover missed days; a loss opens the repair window; three lessons in a day inside it repair it
  function streakLesson(today, firstToday){ const from=G.run.last===today ? G.run.len : G.lost ? G.lost.len : G.run.len||0; let frozen=0;
    if(G.lost && daysBetween(G.lost.loss, today)>RULES.REPAIR_DAYS) G.lost=null;
    if(firstToday && G.run.last && G.run.last!==today && G.run.len>0){ const li=lossNow(today);
      if(li){ useFreezes(li.plan); frozen=li.plan.cover.length;
        if(li.loss){ if(daysBetween(li.loss, today)<=RULES.REPAIR_DAYS) G.lost={len:G.run.len, last:G.run.last, loss:li.loss, n:{}}; G.run.len=0; try{ trace("streak: lost after "+(G.lost?G.lost.len:"its")+" days; "+(G.lost?"repairable until "+addDays(li.loss, RULES.REPAIR_DAYS):"a new streak")); }catch(e){} } } }
    if(G.run.last!==today || !(G.run.len>0)){ G.run.len = G.run.len>0 ? G.run.len+1 : 1; G.run.last=today; } else if(!firstToday && !G.lost){ return; }
    let repaired=false; if(G.lost){ G.lost.n[today]=(G.lost.n[today]||0)+1; if(G.lost.n[today]>=RULES.REPAIR_LESSONS) repaired=streakRepair("lessons"); }
    G.bestRun=Math.max(G.bestRun, G.run.len);
    STK.up={day:today, from, to:G.run.len, frozen, repaired, need: G.lost ? RULES.REPAIR_LESSONS-(G.lost.n[today]||0) : 0}; STK.up.paid=streakPay(); }
  // where the streak stands now: kept / todo / late / repair (lost, repairable) / new
  function streakNow(now=new Date()){ const today=dayOf(now), last=G.run.last, F=fz().length; let len=G.run.len||0, state, shown=len, need=0, price=0, pend=[], miss=[];
    if(G.lost && daysBetween(G.lost.loss, today)<=RULES.REPAIR_DAYS){ state="repair"; shown=G.lost.len; need=RULES.REPAIR_LESSONS-(G.lost.n[today]||0); price=repairPrice(G.lost.len); miss=missedSince(G.lost.last, addDays(G.run.last||today, -(Math.max(1,G.run.len)-1))).filter(d=>!(G.frozen||{})[d]); }
    else if(last===today && len>0) state="kept";
    else if(!last || len===0) state="new";
    else { const li=lossNow(today);
      if(!li) state="todo"; else if(!li.loss){ state="todo"; pend=li.plan.cover; }
      else if(daysBetween(li.loss, today)<=RULES.REPAIR_DAYS){ state="repair"; need=RULES.REPAIR_LESSONS; price=repairPrice(len); pend=li.plan.cover; miss=missedSince(last, today).filter(d=>!pend.includes(d)); }
      else { state="new"; len=0; shown=0; } }
    if(state==="todo" && now.getHours()>=RULES.STREAK_LATE_HOUR) state="late";
    return {state, len, shown, need, price, can:(G.tokens||0)>=price, pend, miss, freezes:F, best:Math.max(G.bestRun||0, len, shown), today}; }
  // the label under the number: where today stands (labels, not sentences: the owner)
  function streakLine(st, now=new Date()){ const A=G.anchors, a1=atToday(A.first.time, now);
    return st.state==="kept" ? `Kept today ${ic("check")}` : st.state==="repair" ? `Repair: ${st.need} ${pl(st.need, "lesson")} today${st.can ? ` or ${st.price} tokens` : ""}`
      : st.state==="late" ? `Still time today` : st.state==="new" ? (st.best ? `Best: ${st.best} ${pl(st.best, "day")}` : `1 lesson starts it`)
      : A.set && now<a1 ? `Today, after ${esc(A.first.after)}` : `Today: 1 lesson`; }
  // the last seven days, today last: kept, frozen (ice), repaired, missed (while it can be repaired), today
  function streakWeek(st, now=new Date()){ const today=dayOf(now), Z=G.frozen||{}, X=G.fixed||{}, L=["S","M","T","W","T","F","S"];
    return `<div class="swk" aria-hidden="true">${[6,5,4,3,2,1,0].map(b=>{ const day=addDays(today,-b), l=L[new Date(day+"T12:00").getDay()], r=G.days[day], kept=r && (r.n>=1 || r.a),
      cls = kept ? "k" : Z[day] || st.pend.includes(day) ? "z" : X[day] ? "r" : st.miss.includes(day) ? "m" : b===0 ? "t" : "";
      return `<span class="${cls}"><i>${cls==="k"||cls==="r" ? ic("sun") : cls==="z" ? ic("snow") : ""}</i>${l}</span>`; }).join("")}</div>`; }
  function streakBand(now=new Date()){ const st=streakNow(now), hr=now.getHours(), greet = hr<4 ? "Good evening" : hr<12 ? "Good morning" : hr<18 ? "Good afternoon" : "Good evening";
    const title = st.state==="new" ? (st.best ? "A new streak today" : "Start your streak") : `${st.shown}-day streak`;
    return `<button class="card streak s-${st.state}" id="hStreak" data-coach="streak" aria-label="${esc(title)}. ${esc(streakLine(st, now).replace(/<[^>]+>/g,""))}.${st.freezes ? ` ${st.freezes} streak ${pl(st.freezes, "freeze")}.` : ""}">
      <span class="sdisc">${ic("sun")}<b class="num">${st.shown}</b></span><span class="st-t"><small>${greet}${S.learnerName ? ", "+esc(S.learnerName) : ""}</small><b>${title}</b><span class="sline">${streakLine(st, now)}</span>${streakWeek(st, now)}</span>
      <span class="sside">${st.best>st.shown ? `<span class="sbest"><small>Best</small><b class="num">${st.best}</b></span>` : ""}${st.freezes ? `<span class="sfz" title="Streak ${pl(st.freezes, "freeze")}">${ic("snow")}<b class="num">${st.freezes}</b></span>` : ""}</span></button>`; }
  function streakSheet(){ const st=streakNow(), P=G.streakPaid||{};
    info("Your streak", `<div class="ssheet"><div><b>Keeps it</b><span>A lesson a day, new or again</span></div><div><b>Freezes</b><span>${st.freezes} of ${RULES.FREEZE_MAX} held · ${RULES.FREEZE_PRICE} tokens in your Wardrobe</span></div>
      <div><b>Repair</b><span>Within ${RULES.REPAIR_DAYS} days: ${RULES.REPAIR_LESSONS} lessons in a day, or tokens</span></div>
      <div><b>Badges</b><span>${RULES.STREAK_MILESTONES.map(([m,t,f])=>`<i class="${P[m]?"got":""}">${m} days: +${t}${f?` ${ic("snow")}`:""}</i>`).join("")}</span></div>
      <div><b>Best</b><span>${st.best} ${pl(st.best, "day")} · ${G.daysLearned} ${pl(G.daysLearned, "day")} learned</span></div></div>`); }
  // the repair offer: earn it back by learning (always), or tokens (only if they are there)
  function repairSheet(){ const st=streakNow(), done=RULES.REPAIR_LESSONS-st.need;
    info("Repair your streak", `<div class="rpair"><span class="sdisc">${ic("sun")}<b class="num">${st.shown}</b></span><b>${st.shown}-day streak</b></div>
      <button class="btn" id="rpLearn">${ic("play")} ${RULES.REPAIR_LESSONS} lessons today</button><div class="rpn">${Array.from({length:RULES.REPAIR_LESSONS},(_,k)=>`<i class="${k<done?"on":""}"></i>`).join("")}</div>
      ${st.can ? `<button class="btn quiet" id="rpPay">${tokenIcon()} ${st.price} tokens</button>` : ""}`);
    $("rpLearn").onclick=()=>{ tick("go"); sheetClose($("sheet")); tab("today"); setTimeout(()=>{ const b=$("playBtn"); if(b) b.click(); }, 260); };
    const rp=$("rpPay"); if(rp) rp.onclick=()=>{ tick(); if(streakRepair("tokens")){ try{ UI.haptic("done"); }catch(e){} sheetClose($("sheet")); home(); } }; }
  // the streak's badges, beside the perfect lessons' (one kind of reward: the owner): the same rosette in the sun's colours, the days in its middle
  const streakBadge = m=>`<svg class="badge sbadge" viewBox="0 0 56 70" aria-hidden="true"><path d="M19 38 L11 66 L20.5 60.5 L26 69 L31 42z" fill="#E08A2E"/><path d="M37 38 L45 66 L35.5 60.5 L30 69 L25 42z" fill="#C46A12"/><g fill="#F2B632">${Array.from({length:14},(_,i)=>`<circle cx="${(28+19.5*Math.cos(i*Math.PI/7)).toFixed(2)}" cy="${(26+19.5*Math.sin(i*Math.PI/7)).toFixed(2)}" r="5.6"/>`).join("")}<circle cx="28" cy="26" r="20"/></g><circle cx="28" cy="26" r="15.2" fill="#FFFDF8"/><text x="28" y="${m>99?31:32}" text-anchor="middle" font-family="Fraunces" font-weight="600" font-size="${m>99?12:16}" fill="#7A4A00">${m}</text></svg>`;
  function streakBadges(){ const P=G.streakPaid||{}, got=RULES.STREAK_MILESTONES.filter(([m])=>P[m]).map(([m])=>m), next=RULES.STREAK_MILESTONES.find(([m])=>!P[m]);
    return `${got.slice().reverse().map(m=>`<div class="ms">${streakBadge(m)}<span>${m} days in a row</span></div>`).join("")}${next ? `<div class="ms next">${streakBadge(next[0])}<span>${Math.min(streakNow().shown, next[0])} of ${next[0]} days</span></div>` : ""}`; }
  // on lesson complete, with the day's ring: the streak kept, frozen, repaired, still to repair, a badge (its tokens, a freeze), once
  function streakDone(){ const u=STK.up; if(!u || u.day!==dayOf()) return ""; STK.up=null; const t=(u.paid||[]).reduce((a,x)=>a+x[1],0), f=(u.paid||[]).reduce((a,x)=>a+(x[2]||0),0);
    const head = u.repaired ? `Repaired: ${u.to} days` : u.need ? `Day ${u.to} · repair: ${u.need} more` : u.to>1 ? `${u.to} days in a row` : "Day 1";
    const sub = [u.frozen ? `${ic("snow")} ${u.frozen} ${pl(u.frozen, "freeze")} used` : "", t ? `${tokenIcon()} +${t} ${pl(t, "token")}` : "", f ? `${ic("snow")} +${f} ${pl(f, "freeze")}` : "", t ? "a new badge" : ""].filter(Boolean).join(" · ");
    return `<div class="rr strk${u.to>u.from||u.repaired?" up":""}"><i></i><div><span>Your streak</span><b>${head}</b>${sub ? `<small class="gold">${sub}</small>` : ""}</div></div>`; }
  function slots(d, now){ const a1=atToday(G.anchors.first.time, now), a2=atToday(G.anchors.second.time, now), late=atToday(RULES.LATE_HOUR+":00", now);
    const done=`Done ${ic("check")}`, s={};
    s.one = d.n>=1 ? done : now<a1 ? `<span class="num">${hm(a1)}</span>` : "Now";
    if(d.n>=2) s.two=done;
    else if(d.n===1){ const gap=new Date(new Date(d.firstEnd).getTime()+RULES.SPACING_GAP_HOURS*3600e3), at=gap>a2 ? gap : a2;
      s.two = at>late ? "Tomorrow" : at<=now ? "Now" : `<span class="num">${hm(at)}</span>`; s.twoTomorrow = at>late; }
    else s.two=`<span class="num">${hm(a2)}</span>`;
    return s; }
  /* (the owner, 16 Nov: "the default view ... should be as effortless as possible to jump straight into the current place in the sequence ... That
     progress wheel system ... should definitely be there. Everything else to do with showing the learner how much they've learned and everything
     that's reinforcing should just be on that page") HOME, in this order: the lesson to do now, at its exact place, with its one start button; the
     rings; then what the learner has earned (rank and tokens, points, perfect lessons, words, days, badges, the level). Nothing of the history of
     lessons (that is the Lessons tab) and nothing of the learner as a user (that is You). dev/design/NAV_20261116.md in the private bundle. */
  function home(){ const play=$("play"); if(!play || play.hidden) return; syncNext(); store(); look();
    let h=$("home"); if(!h){ h=el(`<div id="home" lang="en"></div>`); play.insertBefore(h, play.firstChild);
      play.parentNode.insertBefore(el(`<nav id="nav" lang="en" aria-label="Home, Lessons, You">${NAVT.map(([k,id,icon,label],i)=>`<button class="tab${i?"":" on"}" id="${id}"${i?"":` aria-current="page"`}><div class="pillbg">${ic(icon)}</div>${label}</button>`).join("")}</nav>`), play.nextSibling);
      for(const [k,id] of NAVT) $(id).onclick=()=>tab(k); }
    { const how0=$("howtoBox"), btn0=$("playBtn"); play.appendChild(how0); play.appendChild(btn0); }      // kept out of the part that is drawn again
    const T=G.next, now=new Date(), today=dayOf(now), d=G.days[today]||{n:0}, hr=now.getHours(), greet = hr<4 ? "Good evening" : hr<12 ? "Good morning" : hr<18 ? "Good afternoon" : "Good evening";
    const A = pendingAgain!=null && pendingAgain!==T ? pendingAgain : null, HI = A!=null ? A : T, n=HI+1;      // a done lesson the learner chose to do again (from its view in Lessons)
    const started = A==null && !allDone(S.lesson) && (S.ex>0 || !!S.finished[LESSONS[S.lesson].exercises[0].id]) && S.lesson===T;
    const sl=slots(d, now), two=G.goal!==1;
    const eyebrow = A!=null ? `<div class="eyebrow">${ic("redo")} Again, your choice</div>` : G.why==="perfect" ? `<div class="eyebrow sun">${ic("star")} Go for perfect</div>` : G.why==="once" ? `<div class="eyebrow sun">${ic("redo")} Once more</div>` : G.why==="back" || G.why==="warm" ? `<div class="eyebrow sun">${ic("redo")} A warm-up</div>` : started ? `<div class="eyebrow">${ic("play")} Carry on</div>` : d.n>=1 ? `<div class="eyebrow moon">${ic("moon")} ${two && d.n===1 ? (sl.twoTomorrow ? "Your next lesson" : "Your second lesson today") : "Another lesson"}</div>` : `<div class="eyebrow">${ic("sun")} Your next lesson</div>`;
    const L=LESSONS[HI], mins=minutesFor(L), nEx=L.exercises.length, fin=L.exercises.filter(x=>S.finished[x.id]).length;
    const R=ringsNow(now), k=G.rank||0, own=ownedCards().length, pc=perfectCount(), bs=RULES.BADGES.filter(b=>G.badges[b]), nextB=RULES.BADGES.find(b=>!G.badges[b]);
    const lastR=k>=RULES.RANKS.length, lo=k ? RULES.RANKS[k-1] : 0, hi=lastR ? lo : RULES.RANKS[k], rf=lastR ? 1 : Math.max(0.02, Math.min(1, (G.points-lo)/(hi-lo))), sN=(G.seenN||(G.seenN={})), rf0=sN.rankF!=null && sN.rankK===k ? sN.rankF : rf; sN.rankF=rf; sN.rankK=k;
    h.innerHTML=`${streakBand(now)}
      <section class="card hero"><div class="headrow"><div>${eyebrow}<h1>Lesson ${n}</h1></div><div class="minis">${HI<(G.furthest||0) ? newPics(HI).slice(0,3).map(mini).join("") : ""}</div></div>
        ${A==null && G.why==="perfect" && !started ? `<div class="exdots hdots" aria-label="${L.exercises.filter(x=>G.ex[x.id]&&G.ex[x.id].g).length} of ${nEx} perfect">${L.exercises.map(x=>{ const g=G.ex[x.id]; return `<i class="${g ? (g.g?"g":"y") : ""}"></i>`; }).join("")}</div>` : started ? `<div class="place" role="img" aria-label="Exercise ${S.ex+1} of ${nEx}"><div class="meta"><b>Exercise ${S.ex+1}</b> of ${nEx}</div><span class="pl-track"><i style="--f:${Math.max(0.03, fin/nEx).toFixed(3)}"></i></span></div>` : `<div class="meta">${A!=null ? `Your place stays at Lesson ${T+1}.` : nEx+" exercises · about "+mins+" minutes"}</div>`}${A==null && G.why==="once" ? `<div class="meta m2">A bit more practice, then Lesson ${n+1}.</div>` : A==null && G.why==="back" ? `<div class="meta m2">A warm-up, then Lesson ${n+1}.</div>` : A==null && G.why==="warm" && G.warmTo!=null ? `<div class="meta m2">Warming up, then on to Lesson ${G.warmTo+1}.</div>` : ""}
        ${A==null && !G.why && (G.furthest||0)>=LESSONS.length && !started ? `<p class="hsoon" data-coming="${LESSONS.length+1}">${ic("lock")} Lesson ${LESSONS.length+1} is coming. Meanwhile, Lesson ${n} again.</p>` : ""}
        ${!S.learnerName ? `<label class="hname" for="hNameIn"><span>Your first name</span><input id="hNameIn" type="text" maxlength="30" autocomplete="off" autocapitalize="words" autocorrect="off" spellcheck="false" enterkeyhint="done"></label>` : ""}<div id="heroSlot"></div>${A!=null ? `<button class="btn quiet" id="notAgain">Back to Lesson ${T+1}</button>` : ""}</section>
      <section class="card rhythm" aria-label="Today, this week, your French"><div class="rbody">${ringsSvg(R)}${ringRows(R)}</div>
        ${G.anchors.set ? `<div class="moments${two?"":" one"}"><div class="mo am${d.n===0?" next":""}"><span class="orb">${ic("sun")}</span><span class="k">After ${esc(G.anchors.first.after)}</span><b class="v">${sl.one}</b></div>${two?`<div class="mo pm${d.n===1&&!sl.twoTomorrow?" next":""}"><span class="orb">${ic("moon")}</span><span class="k">After ${esc(G.anchors.second.after)}</span><b class="v">${sl.two}</b></div>`:""}</div>` : `<button class="setmoments" id="setMoments">${ic("sun")} Choose your two moments ${ic("chev")}</button>`}</section>
      <h2 class="hsec">What you have earned</h2>
      <button class="card rankh" id="hRank" aria-label="${esc(rankLabel(k))}. ${lastR ? "The highest rank" : (hi-G.points)+" "+pl(hi-G.points, "point")+" to the next rank"}. ${G.tokens||0} token${G.tokens===1?"":"s"}: your wardrobe, in You">${rankEmblem(k, "emb m")}
        <span class="rh-t"><small>Your rank</small><b>${rankHtml(k)}</b><span class="rb-track"><i style="--a:${rf0.toFixed(3)};--b:${rf.toFixed(3)}"></i></span><span class="rh-n">${lastR ? "The highest rank" : `<b class="num">${(hi-G.points).toLocaleString("en-GB")}</b> point${hi-G.points===1?"":"s"} to the next rank`}</span></span>
        <span class="wtok">${tokenIcon()}${MV.num("tokH", G.tokens||0)}<small>token${G.tokens===1?"":"s"}</small></span></button>
      <div class="tiles t3"><div class="tile">${ic("star")}${MV.num("points", G.points)}<small>${pl(G.points, "point")}</small></div><div class="tile">${badgeSvg(Math.max(1, pc), "badge t")}${MV.num("perfect", pc)}<small>${pl(pc, "lesson")}</small></div>
        <button class="tile go" id="hWords" data-coach="words" aria-label="${own} French ${pl(own, "word")}: see them in Lessons">${ic("words")}${MV.num("words", own)}<small>French ${pl(own, "word")} ${ic("chev")}</small></button></div>
      <div class="card badgesh"><div class="row"><b>Badges</b></div><div class="miles">${streakBadges()}${bs.slice().reverse().map(b=>`<div class="ms">${badgeSvg(b)}<span>${badgeName(b)}</span></div>`).join("")}${nextB ? `<div class="ms next">${badgeSvg(nextB)}<span>${pc} of ${nextB} lessons</span></div>` : ""}</div></div>
      ${levelCard(true)}`;
    { const ni=$("hNameIn"); if(ni) ni.onkeydown=ev=>{ if(ev.key!=="Enter") return; ev.preventDefault(); const v=cleanName(ni.value); if(v && nameSet(v)){ tick(); ni.blur(); home(); } }; }
    const slot=$("heroSlot"), how=$("howtoBox"), btn=$("playBtn"); slot.appendChild(how); slot.appendChild(btn); slot.style.display="grid"; slot.style.gap="11px";
    const lab=btn.querySelector(".ready"); if(lab && !play.classList.contains("afterDemo")) lab.textContent = A!=null ? "Start lesson "+n+" again" : G.why==="perfect" && !started && toPerfect(HI).length ? "Go for perfect: "+toPerfect(HI).length : (started?"Carry on with lesson ":"Start lesson ")+n;
    const sm=$("setMoments"); if(sm) sm.onclick=()=>{ tick(); anchors(false); };
    $("hRank").onclick=()=>{ tick(); tab("you"); wardrobe(()=>you()); };      // the tokens are spent where the wardrobe lives: You
    $("hWords").onclick=()=>tab("lessons");
    try{ if(window.SHELL) SHELL.streakNow=streakNow; }catch(e){}      // (for scripted checks; kept off the export line, which the onboarding patch also extends)
    $("hStreak").onclick=()=>{ tick(); if(streakNow().state==="repair"){ repairSheet(); return; } try{ window.SHELL && SHELL.coach && SHELL.coach.learned && SHELL.coach.learned("streak"); }catch(e){} streakSheet(); };      // (the onboarding's streak tip is learned)      // the words live in the lessons that gave them
    { const na=$("notAgain"); if(na) na.onclick=()=>{ tick(); pendingAgain=null; home(); }; }
    h.querySelectorAll("[data-coming]").forEach(b=>{ b.onclick=()=>{ tick(); comingSheet(+b.dataset.coming); }; });      // (.84) the next lesson, coming
    ringsAnimate(h.querySelector(".rhythm"), ringsFrom(), R); G.ringsShown=ringsSnap(R); MV.count(h); store();
    h.classList.toggle("perf", A==null && G.why==="perfect");      // (MASTERY) "Go for perfect" is the day's one main button, green, whatever was done today
    h.classList.toggle("due2", two && d.n===1 && !sl.twoTomorrow && sl.two==="Now");      // (QA .67) the second lesson's moment has come: the start button is the green one again (shell.css)
    LZ.watch(h); freezeMinis(h); fitHome(); COACH.arrive(); TY.home(); }
  /* (QA .67; the fault: the start button slipped under the tab bar) The start button stands straight after the lesson's title (shell.css), and here it is
     the order of home is settled by the SCREEN, not by the day: on a short screen (under 780 px at the text size in use) the lesson's card leads and the
     rings follow it; on a taller one the rings lead, as designed. A measurement stands behind it: wherever the button would still not be wholly above the
     tab bar (room kept for the one line that comes and goes, "A bit more practice, then Lesson 7"), the lesson leads. */
  function fitHome(){ try{ const h=$("home"), nav=$("nav"), btn=$("playBtn"), play=$("play"); if(!h || !nav || !btn || !play || play.hidden || play.classList.contains("afterDemo") || !h.contains(btn)) return;
      // the name is never cut: a smaller face, the rank chip giving way (its words, then its title: the emblem and the tokens stay), at last two lines
      const ht=h.querySelector(".h-top"), hb=h.querySelector(".h-hello b"); if(ht && hb){ ht.classList.remove("n1","n2","n3"); for(const c of ["n1","n2","n3"]){ if(hb.scrollWidth<=hb.clientWidth+1) break; ht.classList.add(c); } }
      h.classList.remove("lead"); const z=parseFloat(getComputedStyle(h).zoom)||1, spare = h.querySelector(".hero .m2") ? 0 : 34*z;
      if(innerHeight < 780*z || btn.getBoundingClientRect().bottom + h.scrollTop + spare > nav.getBoundingClientRect().top - 8) h.classList.add("lead"); }catch(e){} }
  { let ft=0; window.addEventListener("resize", ()=>{ clearTimeout(ft); ft=setTimeout(fitHome, 120); }); try{ document.fonts.ready.then(fitHome); }catch(e){} }
  const lessonBadge = L=>{ const n=L.exercises.length, g=L.exercises.filter(x=>G.ex[x.id]&&G.ex[x.id].g).length, k=L.exercises.filter(x=>G.ex[x.id]).length;
    return G.lp[L.id] ? `<span class="pf">${ic("star")} Perfect</span>` : k ? `<span class="pp">${ic("star")}${g} of ${n}<i> perfect</i></span>` : `<span class="pp">Exercises</span>`; };
  // (the owner, 16 Nov: "the cards don't really add anything ... If we got rid of those, we could put more lessons into the same vertical space")
  // ONE ROW A LESSON: its number and its state ("Perfect", "22 of 26 perfect" with a thin bar, "Next · Exercise 10 of 26"), and under it, small,
  // the French it gave as words ("se lever · s'asseoir") or the lesson it goes over again. Lessons to come: one muted line. No pictures.
  const wordsLine = i=>{ const L=LESSONS[i], e=CW.lessons[L.id]||{}, cs=cardsOf(L.id); return cs.length ? cs.map(c=>c.fr).join(" · ") : e.repeats ? "Goes over Lesson "+e.repeats+" again" : ""; };
  /* (.84; the owner, 18 Nov 2026: the release serves the new Lesson 1, later lessons locked until each is final) COMING: a lesson the app does not
     serve yet: its row, a lock, "Coming"; a tap says what it is. Never a dead end: Home always has a lesson to start (the last served, again). */
  const COMING = i=>i>=LESSONS.length;
  function comingSheet(n){ info(`Lesson ${n}`, `<p class="wsub"><b>Coming.</b> Lesson ${n} is being finished. It opens in a coming version of the app, by itself: nothing to do.</p><p class="wsub">Meanwhile, Lesson ${LESSONS.length} is there to do again, on Home.</p>`); }
  // (.84) every lesson served passed: the last is a done row (its view: its exercises and its words), Home has it again (no dead end)
  function pathRows(T, from, upto){ let out="";
    for(let i=from;i<upto;i++){ if(COMING(i)){ out+=`<div class="step later locked coming"><div class="node">${ic("lock")}</div><button class="lrow" data-coming="${i+1}" aria-label="Lesson ${i+1}: coming"><span class="t">Lesson ${i+1}</span><span class="lkw">Coming</span></button></div>`; continue; }
      const allServed=(G.furthest||0)>=LESSONS.length, Lk=LESSONS[i], pass=i<G.furthest, now=i===T && Lk && !allServed, open=pass && (i!==T || allServed) && Lk, cls = now ? (G.why ? "once" : "now") : pass ? "done" : "later";
      const locked = RULES.MASTERY && G.why==="perfect" && T!=null && i===T+1;      // (MASTERY) the lesson after one that waits on its yellows: locked, and why
      if(!now && !open){ out+=`<div class="step later${locked?" locked":""}"><div class="node">${locked ? ic("lock") : i+1}</div><div class="lrow"><span class="t">Lesson ${i+1}</span>${locked ? `<span class="lkw">After Lesson ${T+1} is all green</span>` : ""}</div></div>`; continue; }
      const n=Lk.exercises.length, g=Lk.exercises.filter(x=>G.ex[x.id]&&G.ex[x.id].g).length, k=Lk.exercises.filter(x=>G.ex[x.id]).length;
      const at = now && !allDone(S.lesson) && S.lesson===T && (S.ex>0 || !!S.finished[Lk.exercises[0].id]) ? `Exercise ${S.ex+1} of ${n}` : "";
      const perf = now && G.why==="perfect" && !at;
      const state = perf ? `<span class="chip">${ic("star")} Go for perfect: ${toPerfect(i).length}${ic("chev")}</span>` : now ? `<span class="chip">${G.why==="once"?"Once more":G.why?"A warm-up":"Next"}${at ? ` · ${at}` : ""}${ic("chev")}</span>`
        : G.lp[Lk.id] ? `<span class="st pf">${ic("star")} Perfect${ic("chev")}</span>` : k ? `<span class="st">${g} of ${n} perfect${ic("chev")}<i class="pb"><b style="--f:${(g/n).toFixed(3)}"></b></i></span>` : `<span class="st">Exercises${ic("chev")}</span>`;
      const w = i<(G.furthest||0) ? wordsLine(i) : "";      // (owner, 17 Nov: "The words I'll learn should be hidden until I complete the lesson")
      out+=`<div class="step ${cls}"><div class="node">${pass && !now ? ic("check") : i+1}</div><button class="lrow card lcard"${open || perf ? ` data-lv="${i}"` : ` data-home="1"`} aria-label="Lesson ${i+1}${open || perf ? ": its exercises and its words" : ": it is on Home"}"><span class="t">Lesson ${i+1}</span>${state}${w ? `<small class="lw" lang="fr">${esc(w)}</small>` : ""}</button></div>`; }
    return out; }

  /* ---- the three places at the foot (the owner, 16 Nov: "those tabs need to be used for the overall categories in the programme"; "no item should
     be in two different tabs"): HOME (the lesson to do now and everything earned), LESSONS (every lesson: the ones done, with their exercises and
     their words; the one now; the ones to come), YOU (the learner as a user: the figure, the wardrobe, the moments, the settings, who is learning) ---- */
  const NAVT=[["today","tabToday","home","Home"],["lessons","tabLessons","lessons","Lessons"],["you","tabYou","you","You"]];
  const TABS=NAVT.map(t=>t[0]), TABEL={today:"home", lessons:"lessonsL", you:"you"}, scrollAt={}; let tabNow="today";
  function tab(which){ tick(); const prev=tabNow, pe=$(TABEL[prev]); if(pe) scrollAt[prev]=pe.scrollTop; tabNow=which;
    for(const [v,id] of NAVT){ const b=$(id); if(b){ b.classList.toggle("on", v===which); if(v===which) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); } }      // (QA .67) aria-selected is not a plain button's to carry
    $("lessonsL").hidden = which!=="lessons"; $("you").hidden = which!=="you"; MV.tabbed(which);
    if(which==="lessons") lessons(); else if(which==="you") you(); else home();
    const ne=$(TABEL[which]); if(ne){ if(prev!==which){ ne.scrollTop=scrollAt[which]!=null ? scrollAt[which] : ne._first||0; MV.play(ne, TABS.indexOf(which)>TABS.indexOf(prev) ? "mv-tab-r" : "mv-tab-l", 500); } } }

  /* ---- lessons: every lesson of the course served, by stage: done (green; its exercises, perfect or not, and its words, in its view), the one now
     (it is started on Home), the ones to come (face down). The words a lesson gave are its cards' pictures on its card, and its view plays them. ---- */
  function lessons(){ const o=$("lessonsL"), T=G.next, done=Math.min(G.furthest, LESSONS.length), pc=perfectCount();
    // (.84) the stage of the lessons served goes on to its last lesson: the lessons not served yet are there, locked, "Coming" (COMING)
    const st=(CW.stages||[]).filter(s=>s.first<=LESSONS.length), groups = st.length ? st.map(s=>({s, from:s.first-1, upto:stageEnd(s)})) : [{s:null, from:0, upto:LESSONS.length}];
    o.innerHTML=`<div class="tabhead"><h1>Your lessons</h1>${done ? `<p class="tsub"><b>${done}</b> done · <b>${ownedCards().length}</b> French ${pl(ownedCards().length, "word")}</p>` : ""}</div>
      ${groups.map(g=>`${g.s ? `<div class="pathhead"><h2>Stage ${g.s.id}</h2><span class="meta">${(c=>c.of ? `${c.done} of ${c.of} done` : `${c.done} done`)(stageCount(g.s))}</span></div>${(G.furthest||0)>=g.s.first-1 ? `<button class="stq" data-stage="${g.s.id}">${ic("info")}What do I learn in Stage ${g.s.id}?</button>` : `<div class="stq stlock" data-stlock="${g.s.id}" role="note">${ic("lock")}Reach Stage ${g.s.id} to find out what you learn</div>`}` : ""}<div class="path">${pathRows(T, g.from, g.upto)}</div>`).join("")}`;
    o.hidden=false;
    o.querySelectorAll("[data-lv]").forEach(b=>{ b.onclick=()=>{ tick(); lessonView(+b.dataset.lv); }; });   // (owner, 16 Nov) the whole card, not only its "Exercises" / "Perfect" corner (the corner's button is inside it)
    o.querySelectorAll("[data-home]").forEach(b=>{ b.onclick=()=>tab("today"); });
    o.querySelectorAll("[data-coming]").forEach(b=>{ b.onclick=()=>{ tick(); comingSheet(+b.dataset.coming); }; });
    o.querySelectorAll("[data-stage]").forEach(b=>{ b.onclick=()=>{ tick(); stageCard(+b.dataset.stage); }; });
    o.querySelectorAll("[data-stlock]").forEach(b=>{ b.onclick=()=>{ tick(); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); }; });   // (owner, 17 Nov: "Future stages should be locked until you reach them … You get to the end of the stage to find out what you'll learn next")
    // the first time it is opened, the lesson now is in view (the scroll is the learner's after that)
    if(o._first==null){ const c=o.querySelector(".step.now, .step.once"); const r = c && c.getBoundingClientRect(); o._first = r && r.bottom > innerHeight-120 ? Math.max(0, Math.round(r.top - o.getBoundingClientRect().top + o.scrollTop - innerHeight*0.3)) : 0; } }

  /* ---- (.78, Jon 17 Nov: "a 'what do I learn in stage 1?' bubble which, if you tap it, opens a card which explains what you'll learn") what a
     stage teaches: what you will be able to say, each with an example from the stage's own lessons (Marie says it on a tap), the words it
     brings (face down until their lesson is passed), and how far the learner is. (.93; rules.md R-164, P-3) The lines are the stage's
     statements in words.js (`says`: the plan's STAGE_ENTRY.tsv, each with an example and `at`, the lesson of the course as built in
     which the learner first says it for that statement; 0: not built yet). They were a table written here by hand, which went on
     promising "Tu t'appelles Marie." and "Je vais chanter." after the course was re-sequenced. A line whose lesson is not served yet
     is "coming". ---- */
  const keyFr = t=>String(t).toLowerCase().replace(/œ/g,"oe").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’']/g,"").replace(/[^a-z ]/g," ").trim().split(/\s+/).join("_");      // as the page names Marie's clips
  function stageCard(id){ const st=(CW.stages||[]).find(x=>x.id===id); if(!st) return; const served=LESSONS.length;
    const says=(st.says||[]).map(([can, fr, at])=>{ const coming = !at || at>served, got = !coming && at<=G.furthest;
      return `<li class="${coming?"coming":got?"got":""}"><span class="mk">${coming ? "" : got ? ic("check") : ""}</span><span class="cw"><b>${esc(can)}</b>${coming ? `<small class="soon">Coming</small>` : `<button class="ex" data-clip="${keyFr(fr)}" lang="fr" aria-label="${esc(fr)}: play">${esc(fr)}${ic("speaker")}</button>`}</span></li>`; }).join("");
    const words=[]; for(let n=st.first; n<=Math.min(stageEnd(st), served); n++){ const L=LESSONS[n-1]; if(!L) continue; cardsOf(L.id).forEach(c=>words.push({c, open:n-1<G.furthest})); }
    const chips=words.map(({c, open})=>open ? `<button class="wchip" data-clip="${esc(c.clip||"")}" lang="fr" aria-label="${esc(c.fr)}: play">${esc(c.fr)}</button>` : `<span class="wchip down" aria-hidden="true" style="--w:${Math.max(3, Math.min(9, c.fr.length))}"></span>`).join("");
    const nOpen=words.filter(w=>w.open).length;
    const {done, of, segs}=stageCount(st);
    const prog=`<div class="stprog"><span><b>${done}</b> ${of ? `of ${of} ${pl(of, "lesson")}` : pl(done, "lesson")} done</span><div class="segs" aria-hidden="true">${Array.from({length:segs},(_,k)=>`<i class="${k<done?"on":""}"></i>`).join("")}</div></div>`;
    info(st.last==null ? `Stage ${id}` : `Stage ${id} · Lessons ${st.first}–${st.last}`, `${prog}<h3 class="stsec">You will be able to</h3><ul class="stsay">${says}</ul>${words.length ? `<h3 class="stsec">Its words<span>${nOpen} of ${words.length}</span></h3><div class="wchips">${chips}</div>` : ""}`);
    const sh=$("sheet"); sh.querySelectorAll("[data-clip]").forEach(b=>{ if(!b.dataset.clip) return; b.onclick=()=>{ tick(); playClip(b.dataset.clip, b); }; }); }

  /* ---- who is learning? (more than one learner on this phone; mode "pick" after removing a user: always shown, no Back button) ---- */
  function who(force){ const o=$("whoL"); if(!o) return; let chosen=false; try{ chosen=sessionStorage.getItem("frDIn.chosen")==="1"; }catch(e){}
    const pick = force==="pick", showBack = force===true;
    if(!force && (USERS.list.length<2 || chosen || running)) return false;
    o.innerHTML=`<h1>Who is learning?</h1><div class="pgrid">${USERS.list.map(u=>`<button class="pcard${u.id===uid && showBack?" on":""}" data-u="${esc(u.id)}">${AV.svg(AV.get(u.id), {view:"portrait", wear:wornOf(u.id)})}<span${u.name.length>9?' class="ln"':""}>${esc(u.name)}</span></button>`).join("")}<button class="pcard add" id="whoAdd">${ic("plus")}<span>Add someone</span></button></div>${showBack?`<button class="btn quiet" id="whoBack" style="margin-top:18px">Back</button>`:""}`;
    o.hidden=false;
    o.querySelectorAll("[data-u]").forEach(b=>{ b.onclick=()=>{ tick("go"); try{ sessionStorage.setItem("frDIn.chosen","1"); }catch(e){} if(b.dataset.u===uid){ o.hidden=true; afterWho(); return; } switchUser(b.dataset.u); }; });
    $("whoAdd").onclick=()=>ask({title:"Add someone", label:"Their first name", ok:"Add", value:"", stayOnOk:true}, v=>{ const nm=cleanName(v||""); if(!nm) return "Type a name."; try{ sessionStorage.setItem("frDIn.chosen","1"); }catch(e){} return addUser(nm); });
    const bk=$("whoBack"); if(bk) bk.onclick=()=>{ o.hidden=true; };
    return true; }

  /* ---- a small sheet that asks one thing (a name) ---- */
  function ask(o, done){ const sh=$("sheet"); sh.innerHTML=`<div class="sh" role="dialog" aria-label="${esc(o.title)}"><h2>${esc(o.title)}</h2>${o.label ? `<label for="askIn">${esc(o.label)}</label>` : ""}<input id="askIn" aria-label="${esc(o.label||o.title)}" type="text" maxlength="30" autocomplete="off" autocapitalize="words" autocorrect="off" spellcheck="false" value="${esc(o.value||"")}"><div class="msg" id="askMsg"></div><div class="two"><button class="btn quiet" id="askNo">Cancel</button><button class="btn" id="askOk">${esc(o.ok)}</button></div></div>`;
    sheetOpen(sh, false); const inp=$("askIn"); setTimeout(()=>inp.focus(), 60);
    let busy=false;
    const close=()=>{ if(!busy) sheetClose(sh); };
    $("askNo").onclick=close; sh.onclick=e=>{ if(e.target===sh) close(); };
    const go=()=>{ if(busy) return; const m=done(inp.value); if(m){ $("askMsg").textContent=m; } else { busy=true; $("askOk").disabled=true; $("askNo").disabled=true; if(!o.stayOnOk){ busy=false; close(); } } };
    $("askOk").onclick=go; inp.addEventListener("keydown", e=>{ if(e.key==="Enter"){ e.preventDefault(); go(); } }); }
  function info(title, html, closeLabel){ const sh=$("sheet"); sh.innerHTML=`<div class="sh" role="dialog" aria-label="${esc(title)}"><h2>${esc(title)}</h2><div class="sh-body">${html}</div><button class="btn${/class="btn/.test(html)?" quiet":""}" id="infoOk">${esc(closeLabel||"Close")}</button></div>`;
    sheetOpen(sh); const close=()=>sheetClose(sh); $("infoOk").onclick=close; sh.onclick=e=>{ if(e.target===sh) close(); }; }

  /* ---- the avatar maker: built from the picture library's own lists (PICS.avatarOptions), so options can be added without touching this ---- */
  const FIELDS = { body:{label:"Body", vals:["m","f","n"], names:{m:"Man", f:"Woman", n:"Neutral"}}, age:{label:"Age", vals:["c","t","a","o"], names:{c:"Child", t:"Teen", a:"Adult", o:"Older"}}, girth:{label:"Build", n:4}, skin:{label:"Skin", opt:"skin"}, face:{label:"Face", n:5}, eyes:{label:"Eyes", opt:"eyes"},
    freckles:{label:"Freckles", n:2}, hair:{label:"Hair", opt:"hair"}, hairc:{label:"Hair colour", opt:"hairc"}, beard:{label:"Beard", n:2}, glasses:{label:"Glasses", n:2}, head:{label:"Headscarf", n:2}, scarf:{label:"Scarf colour", opt:"top"},
    top:{label:"Jumper", opt:"top"}, legs:{label:"Trousers", opt:"legs"} };
  const CATS = [["You",["body","age","girth"]],["Skin",["skin"]],["Face",["face","eyes","freckles"]],["Hair",["hair","hairc","beard"]],["Glasses",["glasses","head","scarf"]],["Clothes",["top","legs"]]];
  const valsOf = f=>{ const F=FIELDS[f]; if(F.vals) return F.vals; const n = F.opt && PICS.avatarOptions && Array.isArray(PICS.avatarOptions[F.opt]) ? PICS.avatarOptions[F.opt].length : (F.n||2); return Array.from({length:n},(_,i)=>i); };
  /* (the owner, 16 Nov: "Wardrobe can also mean changing how you actually look, as well as adding rewards like clothes, and they're both in the
     you menu") the wardrobe's first part: how the learner looks, free, by the figure maker's own groups; each opens the maker at that group, and
     its back arrow and "That's me" come back here */
  let lookBack=null;
  // (streak) a streak freeze, bought with tokens, as Duolingo: held before the day it covers; at most FREEZE_MAX
  const freezeCard = ()=>{ const held=fz().length, full=held>=RULES.FREEZE_MAX, can=(G.tokens||0)>=RULES.FREEZE_PRICE;
    return `<h3 class="hsec">For your streak</h3><button class="card frz${full?" full":can?" can":""}" id="wdFreeze" data-freeze="1"><span class="doi">${ic("snow")}</span><span class="l"><b>Streak freeze</b><small>${held} of ${RULES.FREEZE_MAX} held</small></span><span class="wprice">${full ? "Full" : `${tokenIcon()}<b class="num">${RULES.FREEZE_PRICE}</b>`}</span></button>`; };
  document.addEventListener("click", e=>{ const b=e.target && e.target.closest && e.target.closest("#ward [data-freeze]"); if(!b) return; tick(); const held=fz().length, P=RULES.FREEZE_PRICE;
    if(held>=RULES.FREEZE_MAX){ info("Streak freeze", `<p>${held} of ${RULES.FREEZE_MAX} held.</p>`); return; }
    if((G.tokens||0)<P){ info("Streak freeze", `<p>${P} tokens. You have ${G.tokens||0}.</p>`); return; }
    sure({title:"Streak freeze", body:`${P} tokens. You have ${G.tokens}.`, ok:`Get it for ${P}`}, ()=>{ G.tokens-=P; fz().push(dayOf()); store(); try{ trace("streak: a freeze bought for "+P+" tokens; "+fz().length+" held"); }catch(x){} try{ UI.haptic("done"); }catch(x){} wardrobe.keep=true; wardrobe(lookBack); }); });
  const lookCard = back=>(lookBack=back, AV.has()) ? `<h3 class="hsec">How you look</h3><div class="card look"><div class="lookc">${CATS.map(([lab],i)=>`<button class="lk" data-look="${i}">${esc(lab)}${ic("chev")}</button>`).join("")}</div></div>` : "";
  document.addEventListener("click", e=>{ const b=e.target && e.target.closest && e.target.closest("#ward [data-look]"); if(!b) return; tick(); const back=lookBack; maker(false, ()=>{ wardrobe.keep=true; wardrobe(back); }, +b.dataset.look); });
  function maker(firstRun, done, at){ const o=$("maker"); if(!o || !AV.has()){ if(done) done(); return; }      // at: the group to open on (the wardrobe's "How you look")
    let spec; try{ spec=PICS.avatarParse(AV.get() || PICS.avatarString({})); }catch(e){ spec={}; } const hist=[]; let cat = at>=0 && at<CATS.length ? at : 3, step = firstRun ? 1 : 0;
    const starters=[["A man",{body:"m",age:"a"}],["A woman",{body:"f",age:"a",hair:6}],["A boy",{body:"m",age:"c"}],["A girl",{body:"f",age:"c",hair:4}]];
    let picked=null;      // the option just chosen: it pops, and the figure with it
    const set=(f,v)=>{ hist.push(Object.assign({}, spec)); spec=Object.assign({}, spec, typeof f==="object" ? f : {[f]:v}); if(["c","t"].includes(typeof f==="object" ? f.age : f==="age" && v) || spec.body==="n") spec.beard=0; picked = typeof f==="object" ? {f:"*"} : {f, v:String(v)}; draw(); tick(); uiSound("pick"); };
    const finish=()=>{ AV.set(PICS.avatarString(spec)); S.learnerGender = spec.body==="f" ? "f" : spec.body==="n" ? "n" : "m"; save(); G.makerOffer=false; store(); o.hidden=true; try{ trace("the learner's figure made"); }catch(e){} if(done) done(); else home(); };
    let drawn=null;      // (QA .67) what was drawn last: a new step's cards come in one after another, a new group of choices comes in softly
    /* (.78, Jon 17 Nov: "My friend found this confusing") ONE preview, framed on what is being chosen: the head and shoulders for Skin, Face,
       Hair and Glasses; the whole figure for You and Clothes; it moves smoothly from one frame to the other. Every option shows its own
       effect, framed on its part (a jumper on the torso, trousers on the legs). A choice changes the preview at once: a pop and a soft sound.
       The whole figure is the standing one; the head and shoulders are the portrait (only it draws the eyes, the freckles, the face): the
       standing figure zooms in on its head as the portrait fades in over it, and back. */
    const HEAD_CATS=[1,2,3,4];
    const BAND={ top:[0.16,0.6], legs:[0.5,1.03] };      // clothes: a band of the standing figure's height
    const PFRAME={ skin:[8,8,144,166], head:[8,8,144,166], scarf:[8,30,144,166], face:[38,34,84,97], eyes:[44,52,72,83], freckles:[38,40,84,97], glasses:[38,40,84,97],
      beard:[34,52,92,106], hair:[22,4,116,134], hairc:[22,4,116,134] };      // the head's options: a frame of the portrait (160 x 190)
    const boxes=new Map();
    function figBox(sp){ const k=JSON.stringify(sp); if(boxes.has(k)) return boxes.get(k); let bb={x:55, y:30, width:50, height:148};
      try{ const t=document.createElementNS("http://www.w3.org/2000/svg","svg"); t.setAttribute("viewBox","0 0 160 190"); t.style.cssText="position:fixed;left:-999px;top:0;width:160px;height:190px;visibility:hidden";
        const g=PICS.avatar(sp, {view:"standing"}); t.appendChild(g); document.body.appendChild(t); const r=g.getBBox(); t.remove(); if(r && r.height>20) bb={x:r.x, y:r.y, width:r.width, height:r.height}; }catch(e){}
      boxes.set(k, bb); return bb; }
    const f2=n=>Math.round(n*100)/100;
    // a frame on the band [a, z] of the figure's height, as wide as the box's shape asks
    const frame=(bb, a, z, aspect)=>{ const h=(z-a)*bb.height, w=h*aspect; return [bb.x+bb.width/2-w/2, bb.y+a*bb.height, w, h].map(f2); };
    const WHOLE_VB=[34, 22, 92, 162];      // the options of You (body, age, build): one frame for all, so a child is smaller than an adult
    function tileSvg(sp, f){ const pt=!!PFRAME[f], vb = pt ? PFRAME[f] : BAND[f] ? frame(figBox(spec), BAND[f][0], BAND[f][1], 0.9) : WHOLE_VB;
      try{ return `<svg class="t" viewBox="${vb.join(" ")}" preserveAspectRatio="xMidYMid ${pt?"slice":"meet"}" aria-hidden="true">${PICS.avatar(sp, {view: pt ? "portrait" : "standing"}).outerHTML}</svg>`; }catch(e){ return AV.svg(sp, "standing", "t"); } }
    let modeNow=null;      // "h" (the head) or "w" (the whole figure), as last shown
    let vbNow=null, vbAnim=0;
    function stageTarget(svg){ const bb=figBox(spec), r=svg.getBoundingClientRect(), aspect = r.width>10 && r.height>10 ? r.width/r.height : 1.2;
      return HEAD_CATS.includes(cat) ? frame(bb, -0.04, 0.4, aspect) : frame(bb, -0.05, 1.05, aspect); }
    function stageMove(svg){ const to=stageTarget(svg), from=vbNow || to; cancelAnimationFrame(vbAnim);
      const put=v=>{ vbNow=v; svg.setAttribute("viewBox", v.map(f2).join(" ")); };
      if(lessMotion() || from.every((x,i)=>Math.abs(x-to[i])<0.5)){ put(to); return; }
      const t0=performance.now(), D=420, ease=x=>1-Math.pow(1-x, 3);
      const step=now=>{ const k=Math.min(1, (now-t0)/D), e=ease(k); put(from.map((x,i)=>x+(to[i]-x)*e)); if(k<1) vbAnim=requestAnimationFrame(step); };
      put(from); vbAnim=requestAnimationFrame(step); }
    function draw(){ draw0(); if(drawn){ if(drawn.step!==step) MV.stagger(o); else if(drawn.cat!==cat) MV.play(o.querySelector(".mk-tray"), "mv-soft", 300); } drawn={step, cat}; }
    function draw0(){
      if(step===1){ o.innerHTML=`<div class="mk-step">Step 1 of 3</div><h1>Who will you be?</h1><div class="lede">Pick the one nearest to you.</div><div class="big4">${starters.map(([lab,sp],i)=>`<button class="pcard" data-s="${i}">${AV.svg(Object.assign({}, spec, sp), "standing")}<span>${lab}</span></button>`).join("")}</div>`;
        o.querySelectorAll("[data-s]").forEach(b=>{ b.onclick=()=>{ spec=Object.assign({}, spec, starters[+b.dataset.s][1]); step = spec.age==="c" ? 4 : 2; draw(); }; }); return; }
      if(step===4){ const kids=[["A child",{age:"c"}],["A teen",{age:"t"}]];
        o.innerHTML=`<div class="mk-step">Step 2 of 3</div><h1>Nearer to you?</h1><div class="big4">${kids.map(([lab,sp],i)=>`<button class="pcard" data-s="${i}">${AV.svg(Object.assign({}, spec, sp), "standing")}<span>${lab}</span></button>`).join("")}</div>`;
        o.querySelectorAll("[data-s]").forEach(b=>{ b.onclick=()=>{ spec=Object.assign({}, spec, kids[+b.dataset.s][1]); step=3; draw(); }; }); return; }
      if(step===2){ const olds=[["Younger",{age:"a"}],["Older",{age:"o",hairc:7}],["White hair",{age:"o",hairc:8}],["With glasses",{age:"o",hairc:7,glasses:1}]];
        o.innerHTML=`<div class="mk-step">Step 2 of 3</div><h1>Nearer to you?</h1><div class="big4">${olds.map(([lab,sp],i)=>`<button class="pcard" data-s="${i}">${AV.svg(Object.assign({}, spec, sp), "portrait")}<span>${lab}</span></button>`).join("")}</div>`;
        o.querySelectorAll("[data-s]").forEach(b=>{ b.onclick=()=>{ spec=Object.assign({}, spec, olds[+b.dataset.s][1]); step=3; draw(); }; }); return; }
      if(step===3){ o.innerHTML=`<div class="mk-step">Step 3 of 3</div><h1>Your skin</h1><div class="big4" style="grid-template-columns:repeat(3,1fr)">${valsOf("skin").map(v=>`<button class="pcard" style="height:150px" data-v="${v}" aria-label="Skin ${v}">${AV.svg(Object.assign({}, spec, {skin:v}), "portrait")}</button>`).join("")}</div>`;
        o.querySelectorAll("[data-v]").forEach(b=>{ b.onclick=()=>{ spec=Object.assign({}, spec, {skin:+b.dataset.v}); step=0; cat=3; draw(); }; }); return; }
      const [, fields]=CATS[cat];
      const tb0=o.querySelector(".mk-tabs"), tr0=o.querySelector(".mk-tray"), keep={tabs: tb0 ? tb0.scrollLeft : 0, tray: tr0 && drawn && drawn.cat===cat && drawn.step===step ? tr0.scrollTop : 0};
      o.innerHTML=`<div class="mk-bar">${firstRun?"":`<button class="rb plain" id="mkBack" aria-label="Back">${ic("chev")}</button>`}<h2>${firstRun ? "This is you" : "How you look"}</h2><button class="rb" id="mkUndo" aria-label="Undo">${ic("undo")}</button><button class="rb" id="mkRnd" aria-label="Surprise me">${ic("shuffle")}</button></div>
        <div class="mk-stage ${modeNow || (HEAD_CATS.includes(cat) ? "h" : "w")}"><svg class="st" viewBox="0 0 160 190" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g class="mk-fig">${PICS.avatar(spec, {view:"standing"}).outerHTML}</g></svg><svg class="pt" viewBox="-4 4 168 186" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><g class="mk-fig">${PICS.avatar(spec, {view:"portrait"}).outerHTML}</g></svg></div>
        <div class="mk-tabs">${CATS.map(([lab],i)=>`<button class="${i===cat?"on":""}" data-c="${i}" aria-pressed="${i===cat}">${lab}</button>`).join("")}</div>
        <div class="mk-tray">${fields.filter(f=>!(f==="beard" && (spec.body==="f" || spec.body==="n" || spec.age==="c" || spec.age==="t")) && !(f==="scarf" && !spec.head) && !(f==="hairc" && spec.hair===3)).map(f=>`<div class="mk-lab">${FIELDS[f].label}</div><div class="opts">${valsOf(f).map(v=>`<button class="opt${f==="body"||f==="girth"||f==="legs"||f==="age"?" whole":""}${String(spec[f])===String(v)?" on":""}" data-f="${f}" data-v="${v}" aria-pressed="${String(spec[f])===String(v)}" aria-label="${FIELDS[f].label} ${FIELDS[f].names ? FIELDS[f].names[v] : f==="body" ? (v==="f" ? "a woman's" : v==="n" ? "a neutral" : "a man's") : typeof v==="number" ? v+1 : v}">${tileSvg(Object.assign({}, spec, {[f]:v}), f)}${FIELDS[f].names ? `<span class="ol">${FIELDS[f].names[v]}</span>` : ""}</button>`).join("")}</div>`).join("")}</div>
        <div class="mk-foot"><button class="btn" id="mkDone">That's me</button></div>`;
      { const sv=o.querySelector(".mk-stage svg.st"), stg=o.querySelector(".mk-stage"), mode = HEAD_CATS.includes(cat) ? "h" : "w";
        if(sv) stageMove(sv);
        if(stg && modeNow && modeNow!==mode && !lessMotion()){ stg.classList.add("go"); requestAnimationFrame(()=>requestAnimationFrame(()=>{ stg.classList.remove("h","w"); stg.classList.add(mode); })); }
        else if(stg){ stg.classList.remove("h","w"); stg.classList.add(mode); }
        modeNow=mode;
        if(picked){ const pk=picked; picked=null; const b = pk.f==="*" ? null : o.querySelector(`.opt[data-f="${pk.f}"][data-v="${pk.v}"]`);
          if(!lessMotion()){ if(b) b.classList.add("pop"); const g=o.querySelector(".mk-fig"); if(g) g.classList.add("bump"); } }
        const tb=o.querySelector(".mk-tabs"), tr=o.querySelector(".mk-tray");
        if(tr) tr.scrollTop=keep.tray;
        if(tb){ tb.scrollLeft=keep.tabs; const edge=()=>{ tb.classList.toggle("ml", tb.scrollLeft>2); tb.classList.toggle("mr", tb.scrollLeft+tb.clientWidth<tb.scrollWidth-2); };
          const on=tb.querySelector("button.on"); if(on){ const l=on.offsetLeft-tb.offsetLeft, r=l+on.offsetWidth, pad=48;
            if(l-pad<tb.scrollLeft || r+pad>tb.scrollLeft+tb.clientWidth){ const to=Math.max(0, Math.min(tb.scrollWidth-tb.clientWidth, l-(tb.clientWidth-on.offsetWidth)/2)); try{ tb.scrollTo({left:to, behavior: lessMotion() ? "auto" : "smooth"}); }catch(e){ tb.scrollLeft=to; } } }
          edge(); tb.addEventListener("scroll", edge, {passive:true}); } }
      o.querySelectorAll("[data-c]").forEach(b=>{ b.onclick=()=>{ cat=+b.dataset.c; draw(); }; });
      o.querySelectorAll("[data-f]").forEach(b=>{ b.onclick=()=>{ const f=b.dataset.f, raw=b.dataset.v; set(f, FIELDS[f].vals ? raw : +raw); }; });
      $("mkUndo").onclick=()=>{ if(hist.length){ spec=hist.pop(); picked={f:"*"}; draw(); } };
      $("mkRnd").onclick=()=>{ const r={}; for(const f of ["skin","face","eyes","hair","hairc","top","legs","girth"]){ const vs=valsOf(f); r[f]=vs[Math.floor(Math.random()*vs.length)]; } set(r); };
      $("mkDone").onclick=()=>{ tick("go"); finish(); }; const bk=$("mkBack"); if(bk) bk.onclick=()=>{ o.hidden=true; if(done) done(); }; }
    vbNow=null; modeNow=null; o.hidden=false; draw(); }

  /* ---- the two moments of the day: "After ___ I do my first lesson." Never rewarded or penalised for the time. ---- */
  const ROUTINE = { first:["waking up","breakfast","my morning coffee","the school run","walking the dog","getting to work"], second:["lunch","getting home","supper","my evening walk","the evening news","the washing-up"] };
  function anchors(firstRun, done){ const o=$("anch"); const A=JSON.parse(JSON.stringify(G.anchors)); let goal=G.goal||2, other={first:false, second:false};
    const tstr=(t)=>hm(atToday(t)); const shift=(t,m)=>{ let [h,mi]=t.split(":").map(Number); let v=(h*60+mi+m+1440)%1440; return String(Math.floor(v/60)).padStart(2,"0")+":"+String(v%60).padStart(2,"0"); };
    const gapH=()=>{ const a=A.first.time.split(":").map(Number), b=A.second.time.split(":").map(Number); return ((b[0]*60+b[1])-(a[0]*60+a[1]))/60; };
    function block(k, label, icon){ const list=ROUTINE[k], cur=A[k].after, custom=!list.includes(cur);
      return `<section class="card anc ${k==="first"?"am":"pm"}"><div class="q"><div class="orb">${ic(icon)}</div><div>After <b>${esc(cur)}</b> I do my ${label} lesson.</div></div>
        <div class="chips">${list.map(w=>`<button class="ch${w===cur?" on":""}" data-k="${k}" data-w="${esc(w)}" aria-pressed="${w===cur}">${esc(w)}</button>`).join("")}<button class="ch${custom||other[k]?" on":""}" data-k="${k}" data-other="1">something else</button></div>
        ${custom||other[k] ? `<input class="otherIn" data-k="${k}" maxlength="28" placeholder="After …" value="${custom?esc(cur):""}" aria-label="After what?">` : ""}
        <div class="time"><span>About</span><button class="rb" data-k="${k}" data-m="-30" aria-label="Earlier">−</button><b class="num">${tstr(A[k].time)}</b><button class="rb" data-k="${k}" data-m="30" aria-label="Later">+</button></div></section>`; }
    function draw(){ const g=gapH();
      o.innerHTML=`${firstRun?`<div class="mk-step">Last step</div>`:`<div class="mk-bar" style="padding:0"><button class="rb plain" id="anBack" aria-label="Back">${ic("chev")}</button></div>`}<h1>Your two moments</h1>
        <div class="lede">Two short lessons a day, well apart, is how French sticks.</div>
        ${block("first","first","sun")}${goal===2?block("second","second","moon"):""}
        ${goal===2 && g<RULES.SPACING_GAP_HOURS ? `<div class="hint">${ic("info")} These are close together. Lessons stick best ${RULES.SPACING_GAP_HOURS} hours or more apart.</div>` : ""}
        <div class="seg" role="group" aria-label="Lessons a day"><button class="${goal===2?"on":""}" data-g="2" aria-pressed="${goal===2}">Two a day</button><button class="${goal===1?"on":""}" data-g="1" aria-pressed="${goal===1}">One a day for now</button></div>
        <div class="spacer"></div><button class="btn" id="anOk">${firstRun?"That's my plan":"Done"}</button>`;
      o.querySelectorAll("[data-w]").forEach(b=>{ b.onclick=()=>{ tick(); A[b.dataset.k].after=b.dataset.w; other[b.dataset.k]=false; draw(); }; });
      o.querySelectorAll("[data-other]").forEach(b=>{ b.onclick=()=>{ tick(); other[b.dataset.k]=true; draw(); const i=o.querySelector(`.otherIn[data-k="${b.dataset.k}"]`); if(i) i.focus(); }; });
      o.querySelectorAll(".otherIn").forEach(i=>{ i.onchange=()=>{ const v=i.value.replace(/^after\s+/i,"").trim().slice(0,28); if(v){ A[i.dataset.k].after=v; draw(); } }; });
      o.querySelectorAll("[data-m]").forEach(b=>{ b.onclick=()=>{ tick(); A[b.dataset.k].time=shift(A[b.dataset.k].time, +b.dataset.m); draw(); }; });
      o.querySelectorAll("[data-g]").forEach(b=>{ b.onclick=()=>{ tick(); goal=+b.dataset.g; draw(); }; });
      const bk=$("anBack"); if(bk) bk.onclick=()=>{ o.hidden=true; if(done) done(); };
      $("anOk").onclick=()=>{ tick("go"); o.querySelectorAll(".otherIn").forEach(i=>{ const v=i.value.replace(/^after\s+/i,"").trim().slice(0,28); if(v) A[i.dataset.k].after=v; });
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
      o.hidden=false; $("micGo").onclick=()=>{ tick("go"); o.hidden=true; $("playBtn").click(); }; },
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
    o.innerHTML=`<div class="wb-art" aria-hidden="true">${avOut("portrait", "av")}</div><h1>Welcome back${name?", "+name:""}.</h1><div class="sub">${to!=null ? "Let's warm up." : "It is good to see you."}</div>
      <div class="card nextc warm"><div class="orb">${ic("sun")}</div><div>${to!=null ? `<b>Starting with Lesson ${to+1}</b><p>You know it already. Then on to Lesson ${G.warmTo+1}.</p>` : `<b>Lesson ${G.next+1} is ready</b>`}</div></div>
      <div class="spacer"></div><button class="btn" id="wbGo">Let's start</button>`;
    longName(o); o.hidden=false; $("wbGo").onclick=()=>{ tick(); o.hidden=true; home(); }; return true; }

  /* ---- you: the learner as a user: the figure and the wardrobe, the two moments, the settings, who is learning (nothing here changes the teaching).
     What the learner has earned (points, rank, badges, the level, days) is on Home, the lessons on Lessons. ---- */
  const sw = (id, on, label, sub, icon)=>`<button class="grow" id="${id}" role="switch" aria-checked="${on}"><div class="ic">${ic(icon)}</div><div class="l">${label}${sub?`<small>${sub}</small>`:""}</div><span class="sw${on?" on":""}"><i></i></span></button>`;
  const row = (id, label, sub, icon, val="")=>`<button class="grow" id="${id}"><div class="ic">${ic(icon)}</div><div class="l">${label}${sub?`<small>${sub}</small>`:""}</div><div class="v">${val}${ic("chev")}</div></button>`;
  function you(){ const o=$("you"); if(!o) return; const tz=UI.pref.text||1, A=G.anchors, tok=G.tokens||0, nOwn=Object.keys(W().owned).length;
    o.innerHTML=`<div class="tabhead"><h1>You</h1></div>
      <button class="card me" id="youRank" data-coach="youRank" aria-label="${esc(S.learnerName||"")}: your wardrobe. How you look, and things to wear${tok ? ": "+tok+" token"+(tok===1?"":"s")+" to spend" : ""}"><div class="face">${avOut("portrait", "t")}</div><div class="l"><b>${esc(S.learnerName||"")}</b><small>Your wardrobe ${ic("chev")}</small><span class="msub">${G.makerOffer ? "Make your figure look like you" : "How you look, and things to wear"+(nOwn ? " · "+nOwn+" of yours" : "")}</span></div><div class="wtok">${tokenIcon()}${MV.num("tokY", tok)}<small>to spend</small></div></button>
      <h3 class="gh">Your two moments</h3><div class="card grp">${row("setA1","First lesson","After "+esc(A.first.after),"sun",`<span class="num">${hm(atToday(A.first.time))}</span>`)}${G.goal!==1?row("setA2","Second lesson","After "+esc(A.second.after),"moon",`<span class="num">${hm(atToday(A.second.time))}</span>`):row("setA2","Lessons a day","One for now","moon","")}</div>
      <h3 class="gh">Sound and touch</h3><div class="card grp">${sw("setBead", UI.pref.beadSound!==false, "Sound for right answers", "", "speaker")}${sw("setSound", !!UI.pref.sound, "Sounds when you press", "", "speaker")}${sw("setVibe", !!UI.pref.haptics, "Vibration", "", "vibe")}</div>
      <h3 class="gh">Seeing</h3><div class="card grp"><div class="grow"><div class="ic">${ic("text")}</div><div class="l">Text size</div></div><div class="seg size" role="group" aria-label="Text size">${[1,2,3].map(k=>`<button class="${tz===k?"on":""}" data-tz="${k}" aria-pressed="${tz===k}" aria-label="Text size: ${["standard","large","largest"][k-1]}"><span style="font-size:${[16,20,24][k-1]}px">A</span></button>`).join("")}</div>${sw("setMotion", UI.pref.motion==="less", "Less movement", "", "eye")}</div>
      <h3 class="gh">You and this phone</h3><div class="card grp">${row("setName","Your first name","",  "you", esc(S.learnerName||""))}${row("youWho","Who is learning?", USERS.list.length>1 ? USERS.list.length+" learners on this phone" : "Add someone", "you")}</div>
      <h3 class="gh">Help improve the course</h3><div class="card grp">${row("setRun","Save the run file","Everything you said and tapped, for the course's makers.","file")}${row("setIntro","How lessons work","","play")}${row("youHow","How the app works","","info")}</div>
      <h3 class="gh">The course</h3><div class="card grp">${row("setAbout","About Flawless French", "Version "+esc(APP_VERSION),"info")}${row("youTester","For testers","","tool")}</div>
      <div class="card grp">${row("youRemove","Remove "+esc(currentUser().name)+" from this phone","Asked twice. Everything of this learner is deleted.","redo")}</div>`;
    o.hidden=false; MV.count(o); COACH.learned("you"); COACH.arrive(); $("youHow").onclick=()=>{ tick(); COACH.help(); };
    $("youRank").onclick=()=>{ tick(); wardrobe(()=>you()); };
    $("youWho").onclick=()=>who(true);
    $("setA1").onclick=$("setA2").onclick=()=>anchors(false, ()=>you());
    const flip=(id, f)=>{ $(id).onclick=()=>{ f(); UI.savePref(); tick(); const b=$(id), on=b.getAttribute("aria-checked")!=="true"; b.setAttribute("aria-checked", on); b.querySelector(".sw").classList.toggle("on", on); }; };
    flip("setSound", ()=>{ UI.pref.sound=!UI.pref.sound; }); flip("setBead", ()=>{ UI.pref.beadSound = UI.pref.beadSound===false; if(UI.pref.beadSound){ beadCtx(); setTimeout(beadSound, 120); } }); flip("setVibe", ()=>{ UI.pref.haptics=!UI.pref.haptics; }); flip("setMotion", ()=>{ UI.pref.motion = UI.pref.motion==="less" ? "auto" : "less"; });
    o.querySelectorAll("[data-tz]").forEach(b=>{ b.onclick=()=>{ UI.pref.text=+b.dataset.tz; UI.savePref(); textSize(); tick(); you(); }; });
    $("setName").onclick=()=>ask({title:"Your first name", label:"", ok:"Save", value:S.learnerName||""}, v=>{ const nm=cleanName(v||""); if(!nm) return "Type a name.";
      if(USERS.list.some(x=>x.id!==uid && x.name.toLowerCase()===nm.toLowerCase())) return "Someone on this phone is already called "+nm+".";
      const f=$("optName"); if(f){ f.value=nm; f.dispatchEvent(new Event("change")); } setTimeout(you, 0); return ""; });
    $("setRun").onclick=()=>{ tick(); const b=$("btnDownload"); if(b) b.click(); };
    $("setIntro").onclick=()=>{ tick(); if(window.EXPLAIN) EXPLAIN.all(); };      // (16 Nov) every explanation card of the lessons, one under another (index.html: explain)
    $("setAbout").onclick=()=>about();
    $("youRemove").onclick=()=>{ tick(); const nm=currentUser().name;
      if(USERS.list.length<2){ info(nm+" is the only learner here", `<p>This phone keeps at least one learner. Add someone first, then remove ${esc(nm)}.</p>`); return; }
      sure({title:"Remove "+nm+"?", body:"Their place, record and figure will be deleted from this phone.", ok:"Remove", no:"Keep", warn:true}, ()=>{
        sure({title:"Are you sure?", body:"Everything of "+nm+"'s will be gone. This cannot be undone.", ok:"Yes, remove", no:"Keep", warn:true}, ()=>{
          let m=""; const c0=window.confirm; try{ window.confirm=()=>true; m=removeUser(uid); }catch(e){ m="That did not work. Nothing was removed."; } finally{ window.confirm=c0; }      // asked twice here: the page's own grey box does not ask a third time
          if(!USERS.list.some(x=>x.id===uid)){ try{ localStorage.removeItem(GK); localStorage.removeItem(AK(uid)); }catch(e){} }      // the record and the figure go only once the learner is gone (they went first: "Cancel" at the third box left the learner without his figure)
          if(m){ info("Not removed", `<p>${esc(m)}</p>`); return true; }
          // (.96) lock the sheet while removeUser waits for IndexedDB clip cleanup before reloading to "Who is learning?"
          const sh=$("sheet"); sh.onclick=null; sh.innerHTML=`<div class="sh" role="status" aria-label="Removing"><h2>Removing ${esc(nm)}…</h2><div class="sh-body"><p>Returning to Who is learning.</p></div></div>`;
          return true; }); return true; }); };
    $("youTester").onclick=()=>{ tab("today"); $("panel").hidden=false; try{ renderPanel(); }catch(e){} }; }
  function about(){ info("About Flawless French", `<p><b>Flawless French</b> teaches French the way a good teacher does: Marie says, shows and asks; you answer out loud or tap a picture; every answer is heard, and a mistake is put right at once.</p>
      <p><b>How the course moves on.</b> The next lesson opens when every exercise of a lesson is perfect. You can do any lesson you have done again, at any time.</p>
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
    if(!AV.own()) G.makerOffer=true; }      // (.77) no figure is written: the neutral look is shown until the learner makes one


  /* ---- motion and ease (the owner, brief 18): the shell never snaps. A screen arrives (rising, or pushed in from the right when it has a
     way back); when it goes, what is beneath settles back (so nothing lingers on screen after the code has hidden it); tabs slide the way
     they lie; lists come in one after another; numbers count; a sheet leaves as it came; a picture the finger chose grows into its sheet.
     Edge swipe and the phone's back button close what has a way back. Nothing of it inside a lesson; none of it with less movement. ---- */
  const MV = (()=>{ const KIND={done:"rise", lvl:"rise", back:"rise", mic:"rise", whoL:"fade", maker:"push", anch:"push", lessonV:"push", ward:"push"};
    /* (QA .67) the phone's back button presses these: the screens with a way back, and now also the screens with one way on (lesson complete, a level, welcome
       back: "Continue"), the microphone's "Not now", who is learning's "Back". From Lessons or You it goes to Home; in a lesson it asks to leave (the cross
       becomes "Leave", as when it is pressed; a second press leaves) instead of closing the app in the middle of an exercise. The edge swipe stays with SWIPE. */
    const BACK={lessonV:"lvBack", ward:"wdBack", maker:"mkBack", anch:"anBack", done:"doneBtn", lvl:"lvGo", back:"wbGo", mic:"micLater", whoL:"whoBack"};
    const SWIPE={lessonV:1, ward:1, maker:1, anch:1};
    const play=(node, cls, ms)=>{ if(!node || lessMotion()) return; node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); clearTimeout(node["_mv"+cls]); node["_mv"+cls]=setTimeout(()=>node.classList.remove(cls), ms); };
    function stagger(root){ if(!root || lessMotion()) return; let i=0; for(const c of root.children){ if(c.classList.contains("donefoot") || c.classList.contains("btn") || c.classList.contains("spacer")) continue; c.style.setProperty("--i", Math.min(i++, 12)); } play(root, "mv-stag", 1200); }
    function beneath(){ const vis=[...document.querySelectorAll(".over:not([hidden])")]; if(vis.length) return vis.sort((a,b)=>(+getComputedStyle(a).zIndex||0)-(+getComputedStyle(b).zIndex||0)).pop(); return $("home"); }
    // each layer knows whether it has an entry of its own in the phone's history (o._pushed): the entries are alike, so only their number matters
    let ignorePop=0, popping=false, tabPushed=false, lessonPushed=false, stale=0;
    const inLesson=()=>document.body.classList.contains("inLesson");
    /* The phone's history is asked ONE thing at a time: a "back" of ours is done only once the one before it has arrived, and an entry wanted while a
       "back" is still waiting simply takes its place (the entries are alike). Without this, closing a sheet and a screen and starting a lesson in one
       breath (the lesson view's "Do exercise 2 again") left the page on its first entry: the next back, or the lesson's end, would have left the app. */
    const hq=[]; let hfly=false, hflyT=0;
    const hrun=()=>{ while(!hfly && hq.length){ const op=hq.shift();
        if(op==="push"){ try{ history.pushState({ff:1}, ""); }catch(e){} }
        else { hfly=true; ignorePop++; try{ history.back(); }catch(e){ ignorePop--; hfly=false; continue; }
          clearTimeout(hflyT); hflyT=setTimeout(()=>{ if(hfly){ hfly=false; ignorePop=Math.max(0, ignorePop-1); hrun(); } }, 4000); } } };
    const push=()=>{ if(hq.length && hq[hq.length-1]==="back") hq.pop(); else hq.push("push"); hrun(); return true; };
    const unpush=()=>{ if(hq.length && hq[hq.length-1]==="push") hq.pop(); else hq.push("back"); hrun(); };
    const hasBack=o=>o.id==="sheet" ? !!o.querySelector("#infoOk,#askNo") : BACK[o.id] && !!$(BACK[o.id]);
    // what lies under the top screen is out of reach of a screen reader and of the keyboard (it was all read out, three screens deep)
    function inertSync(){ try{ const full=!!document.querySelector(".over:not(.tabbed):not([hidden])"), tabd=!!document.querySelector(".over.tabbed:not([hidden])"), set=(e,v)=>{ if(e && e.inert!==v) e.inert=v; };
        set($("play"), full); set($("nav"), full); set($("home"), !full && tabd); document.querySelectorAll(".over.tabbed").forEach(o=>set(o, full)); }catch(e){} }
    function shown(o){ inertSync(); if(o.classList.contains("tabbed")) return; const k=KIND[o.id]||"fade"; play(o, "mv-"+k, 700); stagger(o);
      if(hasBack(o) && !inLesson()) o._pushed=push(o.id); }
    function gone(o){ inertSync(); if(o.classList.contains("tabbed")) return; play(beneath(), "mv-settle", 600);
      if(o._pushed){ o._pushed=false; if(!popping) unpush(); } }
    // Lessons and You: one entry while either is open, so that back goes to Home
    function tabbed(which){ if(which!=="today"){ if(!tabPushed) tabPushed=push("tab"); } else if(tabPushed){ tabPushed=false; if(!popping) unpush(); } inertSync(); }
    const obs=new MutationObserver(ms=>{ for(const m of ms){ const o=m.target, now=o.hasAttribute("hidden"), was=m.oldValue!==null; if(now===was) continue; if(o.id==="sheet") continue; now ? gone(o) : shown(o); } });
    function watch(){ document.querySelectorAll(".over").forEach(o=>obs.observe(o, {attributes:true, attributeFilter:["hidden"], attributeOldValue:true}));
      const sh=$("sheet"); if(sh) new MutationObserver(ms=>{ for(const m of ms){ const now=sh.hasAttribute("hidden"), was=m.oldValue!==null; if(now===was) continue;
        if(now){ if(sh._pushed){ sh._pushed=false; if(!popping) unpush(); } } else if(hasBack(sh) && !inLesson()) sh._pushed=push("sheet"); } }).observe(sh, {attributes:true, attributeFilter:["hidden"], attributeOldValue:true});
      // a lesson has an entry of its own while it runs (nothing else of this is at work inside a lesson)
      new MutationObserver(()=>{ const on=inLesson(); if(on && !lessonPushed) lessonPushed=push("lesson"); else if(!on && lessonPushed){ lessonPushed=false; unpush(); } }).observe(document.body, {attributes:true, attributeFilter:["class"]});
      // an entry left over from before a reload (the lesson was left with the back button) is dropped, so that back on Home leaves the app at once
      try{ if(history.state && history.state.ff && history.length>1){ stale=6; unpush(); } }catch(e){}
      inertSync(); }
    // the phone's back button: closes the sheet, or the top screen by its own button; from Lessons or You, to Home; in a lesson, asks to leave
    window.addEventListener("popstate", ()=>{
      if(ignorePop>0){ ignorePop--; hfly=false; clearTimeout(hflyT);      // a "back" of ours has arrived; any entry left over from before a reload goes too
        if(stale>0){ stale--; try{ const live=tabPushed || lessonPushed || [...document.querySelectorAll(".over, #sheet")].some(o=>o._pushed); if(history.state && history.state.ff && history.length>1 && !live) unpush(); else stale=0; }catch(e){ stale=0; } }
        hrun(); return; }
      const press=b=>{ if(b){ popping=true; try{ b.click(); }finally{ popping=false; } } };
      if(inLesson()){ if(lessonPushed){ lessonPushed=push("lesson"); const lv=$("leave"); if(lv) lv.click(); } return; }
      const sh=$("sheet"); if(sh && !sh.hidden && sh._pushed){ sh._pushed=false; press(sh.querySelector("#infoOk,#askNo")); return; }
      const o=beneath(); if(o && o._pushed){ o._pushed=false; press($(BACK[o.id])); return; }
      if(tabPushed){ tabPushed=false; popping=true; try{ tab("today"); }finally{ popping=false; } } });
    // a swipe from the left edge takes the screen back with the finger; let go past a third (or quickly) and it goes
    let sw=null;
    document.addEventListener("touchstart", e=>{ const t=e.touches[0]; if(!t || t.clientX>26 || e.touches.length>1) return; const o=beneath(); if(!o || !SWIPE[o.id] || !$(BACK[o.id])) return;
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
      const step=t=>{ const k=ease(Math.min(1,(t-t0)/D)); b.textContent=fmt(from+(to-from)*k); if(k<1) requestAnimationFrame(step); }; b.textContent=fmt(from); requestAnimationFrame(step);
      setTimeout(()=>{ if(b.isConnected) b.textContent=fmt(to); }, D+250); }); }      // (QA .67) the true number stands whatever the frames did
    const num=(key, v, cls="num")=>{ const seen=(G.seenN||(G.seenN={})); const from = seen[key]!=null ? seen[key] : v; seen[key]=v; return `<b class="${cls}" data-count="${v}" data-from="${from}">${(lessMotion()?v:from).toLocaleString("en-GB")}</b>`; };
    return {watch, play, stagger, grow, openCard, count, num, tabbed}; })();
  // a sheet leaves as it came (down and away), then is gone
  function sheetClose(sh){ if(!sh || sh.hidden) return; const back=()=>{ try{ const f=sh._from; sh._from=null; if(f && f.isConnected) f.focus({preventScroll:true}); }catch(e){} };
    if(lessMotion()){ sh.hidden=true; sh.innerHTML=""; back(); return; } if(sh.classList.contains("out")) return;
    sh.classList.add("out"); sh._t=setTimeout(()=>{ sh.classList.remove("out"); sh.hidden=true; sh.innerHTML=""; back(); }, 190); }
  // (QA .67) a sheet opened while the one before is still leaving is not emptied by that one's timer; the sheet takes the focus and gives it back; Escape closes it
  function sheetOpen(sh, focusIt=true){ clearTimeout(sh._t); sh.classList.remove("out"); if(sh.hidden) sh._from=document.activeElement; sh.hidden=false;
    const d=sh.querySelector(".sh"); if(d){ d.setAttribute("aria-modal", "true"); if(focusIt){ d.tabIndex=-1; try{ d.focus({preventScroll:true}); }catch(e){} } } }
  document.addEventListener("keydown", e=>{ if(e.key!=="Escape") return; const sh=$("sheet"); if(!sh || sh.hidden) return; const b=sh.querySelector("#infoOk,#askNo"); if(b) b.click(); });
  // the app's own question in place of the browser's grey box (which shows the site's address): yes() may open the next question (it returns true: the sheet stays)
  function sure(o, yes){ const sh=$("sheet"); sh.innerHTML=`<div class="sh" role="alertdialog" aria-label="${esc(o.title)}"><h2>${esc(o.title)}</h2><div class="sh-body"><p>${esc(o.body)}</p></div><div class="two"><button class="btn quiet" id="askNo">${esc(o.no||"Cancel")}</button><button class="btn${o.warn?" warn":""}" id="sureOk">${esc(o.ok)}</button></div></div>`;
    sheetOpen(sh); const close=()=>sheetClose(sh); $("askNo").onclick=()=>{ tick(); close(); }; sh.onclick=e=>{ if(e.target===sh) close(); };
    $("sureOk").onclick=()=>{ tick(); if(yes()!==true) close(); }; }

  /* ---- start ---- */
  for(const id of ["done","whoL","ward","maker","you","lessonsL","anch","mic","back","lessonV","lvl"]) document.body.appendChild(el(`<div class="over${id==="you"||id==="lessonsL"?" tabbed":""}" id="${id}" hidden lang="en"></div>`));
  document.body.appendChild(el(`<div id="sheet" hidden lang="en"></div>`)); document.body.appendChild(el(`<div id="upd" role="status" hidden lang="en"></div>`));
  function afterWho(){ if(!welcome()) home(); }
  /* (MASTERY, once on each phone) a learner whom the old 90 % gate had sent to do a lesson once more, or a lesson back first: the lesson he
     was below in (his place: all its exercises done) now waits only on its yellow exercises, or opens the next if it has none. Lessons
     already passed stay passed (the rule applies from the lesson he is in). */
  function mastery0(){ if(!RULES.MASTERY || G.m75) return; G.m75=1; const li=S.lesson;
    if((G.why==="once" || G.why==="back") && li>=G.furthest && allDone(li) && !G.replay && !G.again){ const was=G.why;
      if(toPerfect(li).length){ G.next=li; G.why="perfect"; } else { G.next=Math.min(li+1, last); G.furthest=Math.max(G.furthest, li+1); G.why=""; (G.lessons[LESSONS[li].id]=G.lessons[LESSONS[li].id]||[]).push({date:dayOf(), x:null, y:null, passed:true, perfect:true, via:"mastery"}); }
      try{ trace("mastery: '"+was+"' under the old 90 % gate becomes "+(G.why==="perfect" ? "Go for perfect in Lesson "+(li+1)+" ("+toPerfect(li).length+")" : "Lesson "+(li+2)+" open (Lesson "+(li+1)+" all green)")); }catch(e){} }
    store(); }
  const NEUTRAL = NEUTRAL_LOOK;      // the figure a new learner starts with: neither a man's nor a woman's (a bob, a teal top)
  function firstRun(){ for(const id of ["who","gender"]){ const x=$(id); if(x) x.hidden=true; }      // the page's own first questions are not asked
    if(!S.learnerGender){ S.learnerGender="n"; if(!AV.own()) G.makerOffer=true; save(); store(); try{ trace("a new learner: straight to Home, the figure neutral"); }catch(e){} home(); } }
  // the first name, on Lesson 1's card (the lessons need it: "Je m'appelle ..." is judged against it, and Marie's pictures carry it); set as the page's own form sets it
  function nameSet(v){ const wn=$("whoName"), wf=$("whoForm"); if(wn && wf && wf.requestSubmit){ wn.value=v; wf.requestSubmit(); } else { S.learnerName=v; save(); }
    const w=$("who"); if(w) w.hidden=true; return !!S.learnerName; }
  function init(){ try{ window.SPLASH && SPLASH.progress(0.85, null); }catch(e){} textSize(); MV.watch(); uiTaps(); if(G.replay){ try{ trace("an exercise done again was left before its end: the place is put back"); }catch(e){} restorePlace(); }
    if(G.again){ try{ trace("a lesson done again by choice was left before its end: the place is put back"); }catch(e){} restoreAgain(); } untrap(); mastery0(); seed(); ranksNow(); rankSync(); if(!G.tally) G.tally={base:G.points||0, items:[]}; syncNext(); store(); home(); MIC.init();
    // (the owner, 16 Nov 17:50: "the first time the user uses the app ... it shouldn't go straight to the customization screen. It should take the user
    // straight into the main app, and then they can customise if they want to. The learner should be gender-neutral if the person chooses to do this.")
    // A new learner goes straight to Home: no name screen, no pictograms, no maker, no moments first. The figure starts neutral (changed in the
    // Wardrobe's "How you look"); the first name, which Lesson 1 needs, is one field on Lesson 1's card; the two moments wait on Home's rings.
    firstRun();
    let showWho=false; try{ if(sessionStorage.getItem("frDIn.showWho")==="1"){ sessionStorage.removeItem("frDIn.showWho"); showWho="pick"; } }catch(e){}
    if(!who(showWho)) welcome();
    G.lastSeen=new Date().toISOString(); store();
    if(document.readyState==="complete") offline(); else window.addEventListener("load", offline);
    // the first screen is drawn (home, who is learning, the first run's name or the welcome back): the loading screen hands over once the faces are in
    // (speed) "ff-first-screen": the first screen has been painted and the loading screen's fade has begun (two frames after done(), then the frame
    // let go): what the page kept back for this moment (the listener, the clips ahead, the stage under home) starts now, under the fade
    const first=()=>{ const go=()=>{ try{ dispatchEvent(new Event("ff-first-screen")); }catch(e){} }; try{ requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(go, 0))); }catch(e){ go(); } };
    try{ UI.fonts().then(()=>{ try{ window.SPLASH && SPLASH.done(); }finally{ first(); } }); }catch(e){ try{ SPLASH.done(); }catch(x){} first(); } }
  return {RULES, coach:COACH, rankEmblem, rankEn, matName, matHtml, MATERIALS, MAT_OF, TITLES, get G(){ return G; }, rankOf, rankName, ringsNow, weekGoal, wardrobe, WARDROBE, TIERS, home, lessonDone, who, maker, you, lessons, tab, anchors, score, init, AV, MIC, welcome, offerUpdate};
})();
window.SHELL = SHELL;      // the page's hooks look for it there
SHELL.init();
