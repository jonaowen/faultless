/* people.js: the people of Flawless French, and the pictures that are made of people. Plain JavaScript, no dependencies. Defines
   window.PICS. Loads BEFORE things.js (window.THINGS: every picture that is not a person); a thing asked of PICS is drawn by THINGS.

   Everybody is ONE figure (FIG, in the middle of this file: a skeleton in three dimensions, keyed from motion capture, seen by one camera,
   lit from the upper left, in flat tones with no outlines). There is no other drawing of a person in this file (figures 11, Nov 2026:
   the older drawings, the head-and-shoulders "bust" and the jointed paper figure, were removed).

     PICS.person(spec, name)   a person in the app's 160 x 190 picture box, as an SVG <g>
        spec.person  "paul" | "julie" | "marie" | "you"      Pierre, Sylvie, Marie, the learner (the figure the learner made: PICS.setLearner;
                                               spec.sex "f": the usual learner as a woman); a name tag shows `name`
        spec.is      "man" | "woman" | "boy" | "girl"         somebody else: no name tag. The same looks always give the same person
        spec.looks   [ ... ]   what they wear and carry, drawn ON the figure by the wardrobe's drawing system: hat, cap, coat, raincoat,
                               scarf, backpack, bag, suit (tie), red dress, red jumper / green jumper / jumper, umbrella, glasses,
                               sunglasses; who they are: beard, bald, old, long hair, short hair, ponytail, pigtails ("in a coat", "with a
                               hat", "wearing glasses" are understood). ONE look may be a mood (the face and the hands tell, from the waist
                               up): feeling good / so-so / bad, hungry, thirsty, cold, hot, tired, happy, sad, surprised, scared, angry, ill,
                               bored; "smiling" (likes it) / "pulling a face" (does not like it): the eater's verdict (with doing "eating":
                               a fork held up with the next bite / the open hand that pushes it away). "tall" / "short": the whole
                               standing figure at two heights by a measuring post. "in a row" or spec.count 2-7: that many people side by
                               side, to be counted
        spec.doing   any action below ("dancing", "sitting down", "raising a hand", "going out" ...); eating, drinking, sleeping, singing
                               and reading are the frozen frame; the others move unless spec.still. spec.reading "book" | "newspaper" |
                               "letter"
        spec.card    "dancing" ...: about to do it: standing, the picture card of the action held up.  spec.did: has just stopped
        spec.holding {is, looks}: the thing held up in one hand, large, beside them
     PICS.action(act, who, opts)   an action as a loop: the whole figure: run, walk, jump, dance, talk, stand up, sit down, arrive, leave,
                               stop, fall, play, call, work, listen, go out, raise hand, swim; the close-ups: smile, not smiling, eat, drink,
                               sleep, sing, read, write. who "you" | "marie" | "paul" | "julie" (opts.spec {is: "man" ...}: somebody
                               else); opts.still: one frozen frame (the card); opts.looks; opts.name (the tag); opts.sex "f"; opts.card;
                               opts.size "tall" | "short". Every loop's length is a teaching time (the page waits for a whole loop)
     PICS.together(act, opts)  the learner and Marie side by side in one box, doing the same act in step
     PICS.handOver(spec)       one person hands a thing to another (see handOverPic)
     PICS.going(spec), PICS.at(spec)   somebody walking toward a place / standing in it (see goingPic)
     PICS.thing(spec)          one thing, or spec.count of them laid out to be counted. Drawn here: "boy", "girl" (whole children), "baby",
                               "hand" (fingers together), "foot" (bare, from the side), "head", "arm" (the part in colour on the pale
                               person; looks: the skin fair | light | tan | brown | dark), "face" (the face card: a mood), "picture card"
                               (the learner's figure doing spec.doing on a white card; spec.moving: its loop). Every other kind:
                               things.js. The look "in an open box": the thing in an open red box. "big" / "small": two sizes
     PICS.things               the names index.html may send to PICS.thing (things.js adds its newer kinds)
     PICS.key / dog / car(spec)    the things' pictures of these, by name (spec.count lays several out)
     PICS.place(spec, draw)    a thing on / under / in / in front of / behind / next to a ground (see placePic)
     PICS.hand(spec, draw)     an open hand with a thing on the palm: the learner's from below, Marie's from above (see handCard)
     PICS.fingers(n)           a hand (two from 6) holding up n fingers, to 10
     PICS.group(n, drawOne)    n copies of the <g> that drawOne() returns, laid out to be counted
     PICS.portrait(who, name), PICS.learnerCard(name, sex), PICS.setLearner(spec), PICS.learner(), PICS.tutor(opts) (the teacher on the
                               stage), PICS.avatar / wardrobeThumb / wardrobe / avatarString / avatarParse / avatarOptions (the learner's
                               figure and its wardrobe)

   Nothing is random: the same spec always gives the same picture. Every gradient and clip path has its own id, so the same picture can be
   on the screen several times. No written words, except the name tags and the "z z Z" of sleep. */
(function(){
"use strict";
const NS = "http://www.w3.org/2000/svg";
let seq = 0;
let LEARNER = null;
// the learner's own figure, when one has been made (PICS.setLearner)
const mk = html => { const g = document.createElementNS(NS, "g"); if (html) g.innerHTML = html; return g; };
const r2 = v => Math.round(v * 100) / 100;
/* ---------- colours ---------- */
const SKIN = {                      // [light, middle, shade]
  paul:  ["#efc4a0", "#dfa883", "#c48a66"],
  julie: ["#f3d0b4", "#e6b694", "#cc9674"],
  fair:  ["#f8dfca", "#eec8ab", "#d6a688"],
  light: ["#f0c8a4", "#e0ab85", "#c58c68"],
  tan:   ["#e3b58d", "#cd996d", "#ab7951"],
  brown: ["#c08b61", "#a37049", "#835534"],
  dark:  ["#966646", "#7a4f33", "#5d3923"]
};
const HAIR = {                      // [light, middle, dark]
  brown:   ["#7a5638", "#5a3d27", "#3f2a1a"],
  black:   ["#3a2a22", "#271b15", "#160f0b"],
  jet:     ["#34302f", "#201d1d", "#0f0e0e"],
  blond:   ["#efd592", "#d9b566", "#b38d42"],
  ginger:  ["#dd8a48", "#bb672d", "#8e481d"],
  dkbrown: ["#604635", "#473224", "#2f2116"],
  ltbrown: ["#b0865a", "#8e6843", "#6a4a2d"],
  grey:    ["#e6e6e3", "#c4c4bf", "#9a9a94"]
};
const COL = {                       // [light, dark] for clothes and things
  blue: ["#4d7fc4", "#3a64a3"], red: ["#d8483f", "#ad332c"], julieRed: ["#cf4a44", "#a8362f"],
  green: ["#5aa86d", "#3f8551"], teal: ["#3fa9a3", "#2b827d"], purple: ["#9076c8", "#6d55a1"],
  orange: ["#ee9a4a", "#cb782b"], yellow: ["#f0c648", "#cc9f26"], grey: ["#959daa", "#707885"],
  pink: ["#e88fb0", "#c56a8c"], navy: ["#4a5b84", "#324163"], lime: ["#a6c855", "#80a338"],
  brown: ["#a87e59", "#856140"], sky: ["#58a6e0", "#357fc0"],
  camel: ["#d2a76b", "#ab8149"], olive: ["#8a9863", "#667545"], plum: ["#9a6684", "#774863"],
  charcoal: ["#5b616d", "#3d424c"], straw: ["#ecd79f", "#ccb272"], felt: ["#8d919a", "#62666e"],
  brownfelt: ["#a07853", "#77563b"], mustard: ["#e3b53f", "#bb8e1f"], white: ["#fbfaf5", "#dedbd0"]
};
/* ---------- who is who: fixed looks for the people the lessons use; anybody else is derived from a hash ---------- */
const WHO = {
  // men
  "man|":            { s: "tan",   h: "dkbrown", st: "sidepart", t: "green" },
  "man|beard":       { s: "fair",  h: "ginger",  st: "sidepart", t: "teal" },
  "man|cap":         { s: "tan",   h: "jet",     st: "crew",     t: "grey",   a: "orange" },
  "man|backpack":    { s: "fair",  h: "blond",   st: "sidepart", t: "lime",   a: "purple" },
  "man|umbrella":    { s: "dark",  h: "jet",     st: "crew",     t: "yellow", a: "green" },
  "man|long hair":   { s: "light", h: "dkbrown", st: "longM",    t: "purple" },
  "man|suit":        { s: "brown", h: "jet",     st: "crew",     t: "navy",   a: "yellow" },
  "man|glasses":     { s: "light", h: "black",   st: "sidepart", t: "green" },
  "man|old":         { s: "fair",  h: "grey",    st: "old",      t: "brown" },
  "man|red jumper":  { s: "tan",   h: "ltbrown", st: "sidepart", t: "red" },
  "man|coat":        { s: "dark",  h: "jet",     st: "curly",    t: "yellow", a: "camel" },
  "man|bald":        { s: "light", h: "dkbrown", st: "bald",     t: "navy" },
  "man|short hair":  { s: "brown", h: "jet",     st: "crew",     t: "orange" },
  "man|hat":         { s: "brown", h: "black",   st: "sidepart", t: "teal",   a: "felt" },
  "man|scarf":       { s: "fair",  h: "dkbrown", st: "curly",    t: "grey",   a: "orange" },
  // women
  "woman|":            { s: "light", h: "ltbrown", st: "wavy",   t: "teal" },
  "woman|long hair":   { s: "fair",  h: "blond",   st: "xlong",  t: "teal" },
  "woman|glasses":     { s: "light", h: "ginger",  st: "wavy",   t: "green" },
  "woman|red dress":   { s: "brown", h: "jet",     st: "bun",    t: "red" },
  "woman|hat":         { s: "tan",   h: "dkbrown", st: "wavy",   t: "purple", a: "straw" },
  "woman|short hair":  { s: "tan",   h: "ltbrown", st: "bob",    t: "orange" },
  "woman|red jumper":  { s: "fair",  h: "dkbrown", st: "wavy",   t: "red" },
  "woman|cap":         { s: "light", h: "brown",   st: "long",   t: "yellow", a: "pink" },
  "woman|coat":        { s: "dark",  h: "jet",     st: "curlyF", t: "pink",   a: "plum" },
  "woman|ponytail":    { s: "light", h: "ltbrown", st: "pony",   t: "lime" },
  "woman|suit":        { s: "tan",   h: "black",   st: "bun",    t: "navy" },
  "woman|backpack":    { s: "fair",  h: "ginger",  st: "long",   t: "grey",   a: "sky" },
  "woman|umbrella":    { s: "brown", h: "black",   st: "wavy",   t: "pink",   a: "teal" },
  // boys
  "boy|":            { s: "tan",   h: "dkbrown", st: "kshort", t: "green" },
  "boy|glasses":     { s: "tan",   h: "jet",     st: "kshort", t: "orange" },
  "boy|backpack":    { s: "fair",  h: "blond",   st: "kshort", t: "teal",   a: "orange" },
  "boy|red jumper":  { s: "brown", h: "jet",     st: "kcurly", t: "red" },
  "boy|scarf":       { s: "fair",  h: "ginger",  st: "kshort", t: "navy",   a: "yellow" },
  "boy|cap":         { s: "tan",   h: "dkbrown", st: "kshort", t: "yellow", a: "sky" },
  "boy|hat":         { s: "light", h: "blond",   st: "kshort", t: "purple", a: "brownfelt" },
  "boy|coat":        { s: "light", h: "brown",   st: "kshort", t: "grey",   a: "mustard" },
  "boy|umbrella":    { s: "fair",  h: "dkbrown", st: "kshort", t: "lime",   a: "sky" },
  "boy|short hair":  { s: "tan",   h: "black",   st: "kcrew",  t: "teal" },
  // girls
  "girl|":           { s: "fair",  h: "ltbrown", st: "kbob",  t: "purple" },
  "girl|glasses":    { s: "brown", h: "jet",     st: "kbob",  t: "yellow" },
  "girl|pigtails":   { s: "light", h: "ginger",  st: "kpig",  t: "teal" },
  "girl|umbrella":   { s: "tan",   h: "black",   st: "kmid",  t: "orange", a: "purple" },
  "girl|cap":        { s: "fair",  h: "brown",   st: "kmid",  t: "green",  a: "pink" },
  "girl|ponytail":   { s: "dark",  h: "jet",     st: "kpony", t: "pink" },
  "girl|long hair":  { s: "light", h: "blond",   st: "klong", t: "lime" },
  "girl|backpack":   { s: "tan",   h: "dkbrown", st: "kbob",  t: "grey",   a: "pink" }
};
const SKINS = ["fair", "light", "tan", "brown", "dark"], HAIRS = ["dkbrown", "black", "blond", "ginger", "ltbrown", "jet", "brown"];
const TOPS = ["green", "teal", "purple", "orange", "yellow", "grey", "pink", "navy", "lime", "brown"];
const ACCS = ["orange", "sky", "green", "purple", "teal", "pink", "mustard"];
const DEF_STYLE = { man: ["sidepart", "crew", "curly"], woman: ["wavy", "long", "bun"], boy: ["kshort", "kcurly"], girl: ["kbob", "kmid"] };
function hashStr(s){ let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
const SAME = { "book bag": "bag", "on a bicycle": "bicycle", "tie": "suit", "sun glasses": "sunglasses" };
const MOOD = { "smiling": "yum", "likes it": "yum", "pulling a face": "yuck", "pulling face": "yuck", "does not like it": "yuck", "doesn't like it": "yuck",
  "feeling good": "good", "feeling so-so": "soso", "feeling so so": "soso", "feeling bad": "bad",
  hungry: "hungry", thirsty: "thirsty", cold: "cold", hot: "hot", tired: "tired", "feeling hungry": "hungry", "feeling thirsty": "thirsty", "feeling cold": "cold", "feeling hot": "hot", "feeling tired": "tired",
  happy: "good", content: "good", sad: "bad", surprised: "surprised", scared: "scared", afraid: "scared", frightened: "scared", angry: "angry", ill: "ill", sick: "ill", bored: "bored", plain: "plain",
  "feeling happy": "good", "feeling sad": "bad", "feeling surprised": "surprised", "feeling scared": "scared", "feeling angry": "angry", "feeling ill": "ill", "feeling sick": "ill", "feeling bored": "bored" };
// looks that change the face, not the person
/* (figures10) the moods drawn on the new head (FIG.close "feel"): the look -> the rig's mood. "smiling" / "pulling a face" (the eater's
   verdict) are the figure's too (yum, yuck) */
const FEEL_LOOK = { good: "good", soso: "soso", bad: "bad", hungry: "hungry", thirsty: "thirsty", cold: "cold", hot: "hot", tired: "tired", surprised: "surprised", scared: "scared", angry: "angry", ill: "ill", bored: "bored", plain: "plain" };
const feelOf = looks => { for (const x of looks || []){ const m = MOOD[lookName(x)] || ({ "so-so": "soso", "so so": "soso" })[lookName(x)] || (/^(good|bad)$/.test(lookName(x)) ? lookName(x) : ""); if (FEEL_LOOK[m]) return FEEL_LOOK[m]; } return ""; };
const HEIGHT = { tall: 1, short: 1 };
// looks that change the size of the whole figure, not the person
/* two strangers of Lesson 6 are "tall" only by name (head and shoulders, the word just picks who they are): they stay as they were */
const liveTall = spec => !spec.person && { "man|beard+tall": 1, "woman|long hair+tall": 1 }[spec.is + "|" + (spec.looks || []).map(x => String(x).toLowerCase().trim()).sort().join("+")] === 1;
function lookName(x){
  let t = String(x).toLowerCase().trim().replace(/^(wearing|with|in)\s+/, "").replace(/^(a|an)\s+/, "");
  if (String(x).toLowerCase().trim() === "on a bicycle") t = "bicycle";
  return SAME[t] || t;
}
/* the first word of what somebody is doing ("standing up" -> "standing"); "not smiling" stays whole (.50: the face that does not smile) */
const firstWord = x => { const t = String(x || "").toLowerCase(); return /^\s*not smil(e|es|ing)\b/.test(t) ? "not smiling" : /^\s*(go|goes|going) out\b/.test(t) ? "go out" : t.split(/[ ,]/)[0]; };
const doingOf = spec => firstWord(spec && spec.doing);
function traits(spec, variant){
  const looks = (spec.looks || []).map(lookName).filter(x => x !== "in a row" && x !== "a row" && !MOOD[x] && (!HEIGHT[x] || liveTall(spec))), L = {}; looks.forEach(x => L[x] = 1);
  let c;
  if (spec.person === "marie" || spec.person === "you"){
    const M = spec.person === "marie";                     // Marie: the tutor of index.html (her skin, hair and jumper); you: a neutral adult
    c = { named: spec.person, kind: M ? "woman" : "man", skin: M ? ["#f3cfae", "#e8b892", "#cf9873"] : SKIN.tan, hair: M ? ["#5c4132", "#4a3326", "#3a271c"] : HAIR.jet,
      top: M ? ["#4a6b86", "#36536b"] : COL.green, topName: M ? "slate" : "green", iris: M ? "#5e3f27" : "#4a3524", style: M ? "marie" : "you", beard: false,
      brow: M ? "#4a3326" : "#2a2422", lip: M ? "#c4626a" : "#bf6660", cap: "orange", hat: "felt", band: "#2b2b30", pack: "orange", umb: "yellow", scarf: "mustard",
      coat: "camel", suit: "charcoal", tie: null, glasses: "#26262b", round: false, bag: "mustard" };
    if (!M && spec.sex === "f") Object.assign(c, { kind: "woman", style: "youF", lip: "#c75a64", bow: "#3fa9a3" });
    /* the learner's own figure (PICS.setLearner): "you" is the person the learner made, in every picture (c.av: the whole spec, drawn by the figure) */
    if (!M && LEARNER){ const A = FIG.person(LEARNER), sp = FIG.specParse(FIG.specString(LEARNER)), tn = FIG.AV.top[Math.min(FIG.AV.top.length - 1, sp.top | 0)];
      Object.assign(c, { kind: A.fem ? "woman" : "man", skin: A.skin, hair: A.hair, top: A.top, topName: tn, iris: A.iris, beard: !!A.beard, brow: A.brow, lip: A.lip, bow: A.bow,
        style: A.headwear ? (A.fem ? "bun" : "crew") : ({ short: "you", side: "sidepart", crop: "crew", bald: "bald", pony: "pony", long: "long", loose: A.fem ? "marie" : "longM", wavy: "wavy", bob: "bob", tucked: "marie", pixie: "bob", pixieS: "bob" })[A.style] || (A.fem ? "pony" : "you"), av: A });
      if (A.glassesOn) L.glasses = 1; }      // "you" as a woman: the same skin, black hair and green top, her hair to the shoulder, framing the face (Marie's is brown and tucked behind the ears, Sylvie's long and down; a ponytail hid behind the head seen from the front)
  } else if (spec.person){
    const P = spec.person !== "julie";
    c = { named: P ? "paul" : "julie", kind: P ? "man" : "woman", skin: SKIN[P ? "paul" : "julie"], hair: HAIR[P ? "brown" : "black"],
      top: P ? COL.blue : COL.julieRed, topName: P ? "blue" : "julieRed", iris: P ? "#4b6f8f" : "#5a3a22", style: P ? "paul" : "julie", beard: P, face: P ? 0 : 4,
      cap: P ? "green" : "yellow", hat: P ? "felt" : "straw", band: P ? "#2b2b30" : "#3fa9a3", pack: P ? "orange" : "green", umb: P ? "yellow" : "purple",
      scarf: P ? "mustard" : "teal", coat: P ? "olive" : "camel", suit: "charcoal", tie: P ? "blue" : null, glasses: "#26262b", round: !P, bag: "mustard" };
  } else {
    const kind = DEF_STYLE[spec.is] ? spec.is : "man";
    const key = kind + "|" + looks.slice().sort().join("+") + (variant ? "#" + variant : "");
    const known = looks.find(x => WHO[kind + "|" + x]);
    const h = hashStr(key), w = variant ? null : (WHO[key] || (known ? WHO[kind + "|" + known] : null));
    const t = w || { s: SKINS[h % 5], h: HAIRS[(h >>> 4) % HAIRS.length], st: DEF_STYLE[kind][(h >>> 9) % DEF_STYLE[kind].length], t: TOPS[(h >>> 13) % TOPS.length] };
    const a = t.a || ACCS[(h >>> 17) % ACCS.length], kid = kind === "boy" || kind === "girl", fem = kind === "woman" || kind === "girl";
    c = { named: null, kind, skin: SKIN[t.s], skinName: t.s, hair: HAIR[t.h], top: COL[t.t], topName: t.t, style: t.st,
      iris: ["#5a3a22", "#4b6f8f", "#5d7a4a", "#3b2a1e"][t.s === "dark" || t.s === "brown" ? 3 : (h >>> 21) % 3],
      cap: a, hat: t.a && (t.a === "felt" || t.a === "straw" || t.a === "brownfelt") ? t.a : (fem ? "straw" : "felt"),
      band: fem ? COL[ACCS[(h >>> 5) % ACCS.length]][0] : "#2b2b30", pack: a, umb: a, scarf: a,
      coat: t.a && COL[t.a] && L.coat ? t.a : ["camel", "olive", "plum"][h % 3], suit: ["navy", "charcoal"][h % 2],
      tie: kind === "man" ? (t.a && L.suit ? t.a : ["red", "green", "yellow"][(h >>> 6) % 3]) : null,
      glasses: ["#26262b", "#7a3b2a", "#1f4a7a"][(h >>> 8) % 3], round: (h >>> 10) % 2 === 1 || kid, bag: "mustard", bow: ["#e8548a", "#f0b429", "#3fa9a3"][(h >>> 12) % 3] };
  }
  const kid = c.kind === "boy" || c.kind === "girl", fem = c.kind === "woman" || c.kind === "girl";
  // looks that change the person
  if (L.old){ c.old = true; c.hair = HAIR.grey; if (!c.named && c.kind === "man"){ c.style = "old"; c.stache = true; } }
  if (L.bald && !c.named) c.style = "bald";
  if (L.beard) c.beard = true;
  if (L["long hair"] && !c.named) c.style = kid ? "klong" : fem ? "xlong" : "longM";
  if (L["short hair"] && !c.named) c.style = kid ? (fem ? "kbob" : "kcrew") : fem ? "bob" : "crew";
  if (L.ponytail && !c.named) c.style = kid ? "kpony" : "pony";
  if (L.pigtails && !c.named) c.style = kid ? "kpig" : "pig";
  if (c.style === "longM") c.beard = true;        // long hair on a man: a beard keeps him a man at 60 px
  if ((L.hat || L.cap) && !c.named){        // hair that fits under a hat
    if (c.style === "bun" || c.style === "curlyF") c.style = "wavy";
    if (c.style === "curly") c.style = "sidepart";
    if (c.style === "kcurly") c.style = "kshort";
  }
  if (spec._top && TINT[spec._top]){ c.top = TINT[spec._top]; c.topName = spec._top; }      // PICS.thing boy / girl with a colour look: the jumper
  if (L["red jumper"] || L["red dress"]){ c.top = COL.red; c.topName = "red"; }
  if (L["green jumper"]){ c.top = COL.green; c.topName = "green"; }
  if (L.jumper){ c.top = COL.mustard; c.topName = "mustard"; }
  c.jumper = !!(L["red jumper"] || L["green jumper"] || L.jumper);
  if (L.raincoat){ L.coat = 1; c.coat = "yellow"; c.hood = true; }
  if (L.sunglasses){ L.glasses = 1; c.shades = true; c.glasses = "#17181c"; }
  c.L = L; c.kid = kid; c.fem = fem; c.mood = MOOD[(spec.looks || []).map(lookName).find(x => MOOD[x])] || "";
  return c;
}
/* the z of sleep (drawn round the sleeper's close-up) */
const zed = (x, y, s) => `<path d="M${x} ${y} h${s} l${-s} ${s} h${s}" fill="none" stroke="#fff" stroke-width="${r2(s * 0.3 + 3)}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M${x} ${y} h${s} l${-s} ${s} h${s}" fill="none" stroke="#3b55b3" stroke-width="${r2(s * 0.3)}" stroke-linecap="round" stroke-linejoin="round"/>`;
/* ---------- actions that the learner does, the teacher shows and Pierre and Sylvie are pictured doing ----------
   PICS.action(act, who, opts): act "dance" | "jump" | "smile" | "stand up" | "sit down" | "walk" | "raise hand" | "stop" | "eat" | "drink";
   who "you" | "marie" | "paul" | "julie"; opts.still = true gives one frozen frame ("smile", "not smiling", "eat" and "drink" are the head and shoulders). The figure is the usual head and shoulders, half size, on a jointed body; the joints
   are turned by SMIL <animateTransform> (no script timers), so the picture loops by itself wherever it is put.
   The poses were drawn from the Mulberry symbols (dance, jump, sit, stand, walk, get out of chair, smile) and from photographs
   of people jumping and walking (Stanford 40 Actions): a jump is knees tucked, arms flung up and the ground left behind; a dance is
   one arm up, the other out, one leg kicked to the side, the body swaying; a walk is a scissor stride with the arms low. */
const ACT_OF = { dancing: "dance", dance: "dance", jumping: "jump", jump: "jump", smiling: "smile", smile: "smile", "not smiling": "not smiling", standing: "stand up", stand: "stand up",
  sitting: "sit down", sit: "sit down", walking: "walk", walk: "walk",
  talking: "talk", talk: "talk", arriving: "arrive", arrive: "arrive", leaving: "leave", leave: "leave",
  working: "work", work: "work", calling: "call", call: "call", phoning: "call", "go out": "go out", playing: "play", play: "play", listening: "listen", listen: "listen",
  running: "run", run: "run", runs: "run", falling: "fall", fall: "fall", falls: "fall", swimming: "swim", swim: "swim", swims: "swim" };
// (.60) courir, tomber
const ACT2 = { raise: "raise hand", raising: "raise hand", raises: "raise hand", stop: "stop", stopped: "stop", stopping: "stop", eat: "eat", eating: "eat", drink: "drink", drinking: "drink", sleep: "sleep", sleeping: "sleep", sing: "sing", singing: "sing", read: "read", reading: "read", write: "write", writing: "write", writes: "write" };
const WHO_NAME = { paul: "Pierre", julie: "Sylvie", marie: "Marie" };

/* <<< the figure (one body, one camera) */
/* ================= the figure: ONE body seen from ONE camera =================
   (the visual overhaul, Nov 2026; Jon on the running card: "This is not anatomically possible. The torso can't be side on in this pose
   since if it was, the arms would be side on too. Look up reference images of someone running. That goes for all animations.")

   Every whole figure is now a jointed skeleton in three dimensions: pelvis, spine, chest, neck, head, shoulders, elbows, wrists, hands,
   hips, knees, ankles, feet, with the proportions of a person. A pose is the direction of every bone; the skeleton is posed, then seen
   through one camera (a turn about the upright axis and a small tilt from above), and every part is drawn where the camera puts it,
   the far parts first. The head, the shoulders, the hips and the limbs are therefore the projection of one body: a pose that a body
   cannot take cannot be drawn. The head is turned by the same camera (its face, ears and hair are placed on its surface and projected).

   The poses are not invented. Each action is keyed from motion capture of a person doing it (the CMU Graphics Lab Motion Capture
   Database, free for any use: mocap.cs.cmu.edu; which clip keyed which action is in CLIPS and in dev/design/refs/REFERENCES.md): of the
   capture only the direction of each bone and the height and sway of the hips are kept, frame by frame, and given to this skeleton.

   Light comes from the upper left: every form is drawn twice, in its shade tone and, a little smaller and nearer the light, in its
   lit tone. No outlines. A soft shadow lies on the ground under each foot and fades as the foot leaves it.

   The loop is drawn by script, frame by frame (the skeleton is posed again and projected again for each frame: sixty a second), in step
   with ONE clock: an <animate> marker of the loop's length that the app begins and reads as it does every other animation. */
const FIG = (() => {
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const basis = (x, y) => { x = nrm(x); const z = nrm(cross(x, y)); return { x, y: cross(z, x), z }; };       // x: its left, y: up, z: forward
const at = (o, B, v) => [o[0] + B.x[0] * v[0] + B.y[0] * v[1] + B.z[0] * v[2], o[1] + B.x[1] * v[0] + B.y[1] * v[1] + B.z[1] * v[2], o[2] + B.x[2] * v[0] + B.y[2] * v[1] + B.z[2] * v[2]];
const f1 = v => Math.round(v * 10) / 10, f2 = v => Math.round(v * 100) / 100;

/* ---------- the builds: lengths in body heights (a body height: the floor to the top of a real head; after Drillis and Contini's
   segment lengths, 1966, as in Winter, Biomechanics and Motor Control of Human Movement). The head is drawn larger than life so that
   the face can be known on a phone (about four heads to the whole figure), the legs a little shorter, the limbs and the trunk fuller.
   H: one body height in the picture box. r...: the half-thickness of a limb at its joints and at its fullest between them. ---------- */
const MAN = { hw: 0.058, sw: 0.118, sy: 0.08, sz: -0.008, thigh: 0.236, shin: 0.238, ankle: 0.042, foot: 0.104, toe: 0.046, spine: 0.2, nb: 0.1, neck: 0.05,
  ua: 0.178, fa: 0.146, hand: 0.108, chest: [0.115, 0.112, 0.086], waist: [0.102, 0.06, 0.08], hem: [0.107, 0.05, 0.083],
  rHip: 0.064, rTh: 0.06, rKnee: 0.048, rCalf: 0.047, rCuff: 0.041, rSh: 0.049, rUa: 0.043, rEl: 0.037, rFa: 0.038, rWr: 0.03, rNeck: 0.039, palm: 0.048, shoe: 1.28 };
const WOMAN = Object.assign({}, MAN, { hw: 0.058, sw: 0.088, sy: 0.078, nb: 0.098, neck: 0.04, chest: [0.086, 0.108, 0.078], waist: [0.064, 0.06, 0.062], hem: [0.1, 0.05, 0.08], rHip: 0.062, rTh: 0.054, rKnee: 0.04, rCalf: 0.039, rCuff: 0.033,
  rSh: 0.035, rUa: 0.031, rEl: 0.027, rFa: 0.028, rWr: 0.021, rNeck: 0.03, palm: 0.036, hand: 0.1, shoe: 1.08 });
/* (the teacher: her round-three proportions were set from these, the earlier woman's; TUT0 scales them) */
const TWOMAN = Object.assign({}, MAN, { hw: 0.06, sw: 0.1, chest: [0.098, 0.108, 0.08], waist: [0.084, 0.06, 0.07], hem: [0.106, 0.05, 0.083], rHip: 0.064, rTh: 0.057, rKnee: 0.044, rCalf: 0.042, rCuff: 0.036,
  rSh: 0.041, rUa: 0.036, rEl: 0.032, rFa: 0.032, rWr: 0.025, rNeck: 0.033, palm: 0.042, shoe: 1.14 });
/* the whole figure is `tall` units of the picture box at size 1 and `heads` heads high (the head is drawn larger than life so that the face
   can be known on a phone: an adult here is four and a half heads, a child four) */
const PORT = { rSh: 0.72, rUa: 0.9, sy: 0.016, nkY: 1.75, syM: 0.01, nkYM: 1.6, sw: 0.97 };
function build(kind, heads, girth){ const teen = kind === "teen" || kind === "teenf", b0 = kind === "woman" || kind === "teenf" ? WOMAN : kind === "teacher" ? TWOMAN : MAN, gw = [0.9, 1, 1.09, 1.2][girth == null ? 1 : girth], gl = [0.92, 1, 1.06, 1.14][girth == null ? 1 : girth], b = Object.assign({}, b0, { sw: b0.sw * (0.94 + 0.06 * gw), chest: [b0.chest[0] * gw, b0.chest[1], b0.chest[2] * gw], waist: [b0.waist[0] * (girth === 3 ? 1.36 : gw), b0.waist[1] * (girth === 3 ? 1.3 : 1), b0.waist[2] * (girth === 3 ? 1.5 : gw)], hem: [b0.hem[0] * (girth === 3 ? 1.22 : gw), b0.hem[1], b0.hem[2] * (girth === 3 ? 1.3 : gw)] }), n = heads || (kind === "kid" ? 4 : teen ? 4.25 : 4.5), hh = 0.866 / (2 * n - 1.84), tall = kind === "kid" ? 112 : kind === "teenf" ? 127 : teen ? 130 : kind === "woman" || kind === "teacher" ? 138 : 146;
  for (const r of ["rHip", "rTh", "rKnee", "rCalf", "rCuff", "rSh", "rUa", "rEl", "rFa", "rWr", "rNeck"]) b[r] = b0[r] * gl;
  if (n > 4.5) b.neck = b0.neck * hh / (0.866 / 7.16);
  if (n > 4.5 && kind !== "teacher"){ const P = PORT, m = b0 === MAN; b.rSh *= P.rSh; b.rUa *= P.rUa; b.rEl *= P.rUa; b.sy -= m ? P.syM : P.sy; b.nkY = m ? P.nkYM : P.nkY; b.sw *= P.sw; }      // (the portraits and the close-ups: the shoulders slope from a wider foot of the neck and their rounds are smaller, so that they are not square knobs)
  if (teen){ b.sw *= 0.93; b.chest = [b.chest[0] * 0.92, b.chest[1], b.chest[2] * 0.92]; b.waist = [b.waist[0] * 0.95, b.waist[1], b.waist[2] * 0.95]; b.hem = [b.hem[0] * 0.94, b.hem[1], b.hem[2] * 0.94];      // a teenager (13 to 17): between the child and the adult: a head between theirs, a narrower build, thinner limbs
    for (const r of ["rHip", "rTh", "rKnee", "rCalf", "rSh", "rUa", "rEl", "rFa", "rWr", "rNeck"]) b[r] *= 0.93; }          // (a figure of more heads, as the portraits are: the neck keeps its length against the head, not the body)
  return Object.assign({}, b, { hh, H: tall / (0.866 + 1.84 * hh), key: kind + n + "g" + girth }); }
const BUILDS = {}, bodyOf = (c, o) => { const kind = c.kid ? "kid" : c.teen ? (c.fem ? "teenf" : "teen") : c.fem ? "woman" : "man", k = kind + (o && o.heads || "") + "g" + c.girth; return BUILDS[k] || (BUILDS[k] = build(kind, o && o.heads, c.girth)); };

/* ---------- the keyed actions ---------- */
const CLIPS = {
  "run": { n: 16, dur: 0.56, loop: true, yaw: 60, still: 0.75, curl: 0.85, trav: 2.148,      // CMU 16_55 run (a fast run, still gathering speed: the body leans into it): one stride, 0.56 s at 120 frames a second
    data: "OOd(OOeHQ`MQN5d&WEQ)aV[qe[OLOcOFaa[lOOOOOOOOOOOOP=eCRaeIR;P;L_eEPvQu=@DzLyHTd<LyHTd<:]N:LCMmE4=+NF<xYSNF<xYSd*JsI(PW:HPXM8C4>KN{A4`&PaNueXO6=:Z3OQGy;iQ+:^RXQ(>?[eOUd0NaeFQcM<N@csWpPoaI]'eVOFQ+N_a^[nOOOOOOOOOOOOPAeFROeHR?PBL]eGP]R+<hF)K#OHe/K#OHe/:rNlJ{N?Hd;QL_<KX4L_<KX4ceIYH~P):SLnMXCF>:NG?z^jP3NdeYNp?m^]OmCY>$PA<1X\"P1B1`uOYdMN@eNQFM{NCcoWzPNaP]!e<ORS9MKb'['OOOOOOOOOOOOPFeBRjeGRHP6LTeEP]S?<iFOHXT'cyHXT'cy;YM1HgN|K6:mKK<\"VYKK<\"VYckI6IVOZ;JHoNPC6>>Ko='Y0M:I`dbO$A<`.OZ?RA_Oo?W^FOeHtdVO^dkN)eWPmP(N+cfX-OaaU[|eDO[RgMZaf[WOOOOOOOOOOOOP@eGRFeIR@P-L^eGPYU!=FF'FKS^c.FKS^c.<^K!G&OcK/:nK$;jU]K$;jU]dPIjKoO(<RF2O|BI>uKg:xLEJ];=SFNtAZ`HOj<wEIO[BoaGOHN!eWOfd~MweSQ%PcM`ctWcO?aX[we=OxS0M/aa[VOOOOOOOOOOOOPGeCR`eLR+P$LteIPmV->WDdEzMmc;EzMmc;=;J{EkO^Hy;GK:;pV#K:;pV#diJ5LaNr<GFJP5CJ>/K[<*H%J6;,MVNR@k_]PQ<AFYOECub0NfP@eYOee4M^eUPuPWMsd$WDN~aR[~e:PAS:LeaC[wOOOOOOOOOOOOPPeARoePQlOqM4eKPvU~?kBxIrEDb1IrEDb1?3F6EhO<Dv=4L-</W?L-</W?e-K@MYN_;6ITOYFb<<N6<(G8ND;8ITNR?\"]bQJ=%EDNtBgaAMoM|ePOYe/MDeXP&P]NadCV^NTaB]4e9PrS3LCa<[yOOOOOOOOOOOOPXe>S!eSQPOOMNeNPyUJ@-B9Q*?*]fQ*?*]f?*E?FsNV@H@dN2=&YfN2=&YfeGM?MHNo:GN:O\"If;1O=<KF@OZ<DFNO+<vYSQ[>.C[MnBVa-LlNTeIOAdsL|eJN)QxP5dPV:N#a&]Te8QQRzK{`w]?OOOOOOOOOOOOPYe=S%eUQ6O>MheQPtUY?hBlX<=4UGX<=4UG=8DqNvM`<{ERQ.@P_=Q.@P_=dUL>IbO]:yTCNPJu:uOK;IHsO{:jKAP*;OV<Q.>wBOM2Bca/LYP~eDO2dVLOe.M$S9Pld@VaM``Y^%e=Q8RlL:`b]bOOOOOOOOOOOOPFeBRieSQFNtMUePP[VVB0@c[_>9Pg[_>9Pg?9A}NmM>:vK9TUHMcjTUHMcjd*KcHUP8=OZTNZHW;SOS:GN.P5:iSQPi:YRGQ\"?JAoL!B|a/L#RHe-O5dDL<e'M*SfPDczWeMU`H^9eKP]Q|M9`f]pOOOOOOOOOOOOP9eHREeQQXNpM>ePP6W2Ft=l]#>PPN]#>PPN?~ASL*M/:OOQVtQud/VtQud/ceJ9HMOT@w_lOpCp=sO>;PVBOMC)aYPy:OMZPh?bARKgBK`cL+SAe!O@dDLVe?McR]P.chX1M]`W^(eWPuO}N1`s]kOOOOOOOOOOOOPJeJR2eSQIO3MLeRP\"VOJ&<>[H>)Pj[H>)Pj?XAtL]Km:gP}Y6X+a0Y6X+a0c0JbFpNuC!aSP[?>A{M!>r]<L|F0c<Px;[HKOx?uA8NR?P^;N.O~eWO@d_M9eRNUQ<Ovd!W]NV`m]ueUQ2O2N=a1]IOOOOOOOOOOOOPLeJR+eSQIO0MLeQP7T_J>;`Z_=_QGZ_=_QG?/B?M$Jm:uO)[+Wk`)[+Wk`)b1H4FPO@BLa-P.<YF&K4Bw`xKPJId[P]=@DhNj@\"A-RH;:TsS1B;`WO6dZMveXN7O^Pld6V|O#a2]LeVPlNVNtaG]/OOOOOOOOOOOOPAeHR>eQQ^O+M8eNPZSJHa;tY?=0S5Y?=0S5>=C9NAJ$;UK(]QQ]a!]QQ]a!a&HuD.P_A/_}No;~GFKFD*anL=N5eAQ4=1E+MiBP>wUN;JRKVpB'_'O3d`NJeZNtNqPId7V}OgaR]!eXP-NBOTaG]0OOOOOOOOOOOOPKeFRIeQQ^OAM7eNPRRoF$<uW,=(VQW,=(VQ=%E3OuJ8<yFp['H{`x['H{`x`]IwC&Q?>l]>Mi<lElLgCcanN)L;e@R$;SI\"M-G)<8Rt:_NZT?=9Y$O8dQNweWOdN)Oqd>VnP?ac[feYOUNIO}aJ],OOOOOOOOOOOOPNeDRYePQhOWM.eLP[RNBW?$T;>2Z]T;>2Z]<!GAOVK5>cCGVmAF^JVmAF^J`zJEC9QF<]XoM\"?+BDNICgb$P5NgeYQv:TN'MCJb;#P}:[LUR&;pVnOFd9O1eLQIMhN>d4W$Q4aR[te[ODNtOuaO]%OOOOOOOOOOOOPDeERTeIR>P0L[eFPgR4?=B3P[Am`UP[Am`U;\"JBN[LPAS?vR\"=lZiR\"=lZibhK4EhPz;.U!M$A>@#O1BgaAPsN}eWPJ:zTBNTKF:kPn:LMtQ>;eVf" },
  "walk": { n: 16, dur: 0.82, loop: true, yaw: 58, still: 0.55, curl: 0.4, trav: 2.080,      // CMU 07_12 brisk walk: one stride, 0.875 s
    data: "OOe,OOe:L{RGQTe8RwOBe[P*eRQBNSMgeKQVOOOOOOOOOOOORie!KUeZP/O*NreXP^Qe=HDjPc:OMLPc:OML>hOkBYKn:nQvT0A2_@T0A2_@`FH?CVN:>+[JNm;EU}Q%U3dkQ5^i_~R!<9G,R.=8E1P{AE`0OPKQe8OQdqOme8LnRKQge;RUOee[OqeUQ,NkMxeQQ%OOOOOOOOOOOORTdyK(eYP?NyNbeXP@Pi=IDXQ1;!JZQ1;!JZ>`Q.BnKc:pQuT-B$`,T-B$`,`UGnD,Mr>Z]+NH:]RbO~NIeXPMX.chQP<kEtQn>xBXOq<2X'NmAG`7OqdrP$eKO4R4OPeQQaPEeYOoeVPuNxN.eSPoOOOOOOOOOOOORUdtJreYPOO+NQeXP/PK<~E?QC;2IzQC;2Iz?MQgAuKw:bPSSOAb_~SOAb_~b2ITEWMa>#[7Mr:JNfP#Jhe)PLP0eXOx:xJ^R=DI=dNt:PM)M7;VV0P1e6OyeDPsRIMqeNQEP@eZOseXPgOhN7eSP|OOOOOOOOOOOORhdsJzeYPKO7NTeYP-Pq<=FgQ.:kKYQ.:kKY@DQ'@nLk:SO;RE@(^_RE@(^_c-J{F[MG<JXFMP:dL6P#JMe#PLO#eYN^:EP/S\"G!<LK.:tMoI*<YVNP7eZOYeLPMQ}N9eMQdOne[O{eWPcP@N7eRQ)OOOOOOOOOOOORhdzK:eYPPOQNNeWPKQI;LI&P{:HNmP{:HNmAMO&?bMC:XM3Q3=s[$Q3=s[$cVK}G)M=;<U<ME;$J^P+JCd~P^OjeXNZ;0U3RTC}>$JR<1VKI.C<`SPCe]OJeVPRP[NCeOQ[O^e[OpePQ0P~MgePPtOOOOOOOOOOOOR`e$K_eXPbOsN;eTPnR,:vKQP':aS+P':aS+A5LH@5M_:tK4Ol<%WiOl<%Wic}LcGmL~:cR>M7;WHlPMIgdmQ#O-eVO5<QXlQZ?1B7JQB9`3J.LWdfPJePO7eWPpOWN0eHR-Ore[OteLQDQDMPeNPtOOOOOOOOOOOORIe(K`eVQ\"OwMzeRPoS*:dN5NQ<,WsNQ<,Ws@xIwA8Mp;BI?N3:{T?N3:{T?d1LcH>Lx:UN5Li;nH;Q0I<d[QfN!eKOt=k[#PP;@I6LBJEdiLMWgcePLe:O-eSQ?NbMleDR>P-eZOteLQ5QMM^eOP{OOOOOOOOOOOOR7e*K^eUQ-OtMoeQPoSA:gP_M1>J[iM1>J[i@NGxBbN+;{GVLq:XQ3Lq:XQ3dtLdJbLm;^HgLS;YI\"QsGwd(R_Mve@Ph>Y]-Oi:EPJNXRLeFN^^i`&PLdvO0eHQzMuM=e>RJPReYOceJQMQLMDeLQ.OOOOOOOOOOOORBe&KPeUQ1OsMleRP]Rm:vRxLh@j_GLh@j_G?,G2E$N?<PF=Kr:bNgKr:bNge2L4LdM)<SFLLj<LFfPbE4bwQNK(e'Qh?*][OR:lShPcVed?PDb-[,PFdUOLeIQvMsM@e@R8P7eZOLeJQQQNMBeMPuOOOOOOOOOOOORed{K?eXPcOrN:eUPaRQ:}STLkB>`lLkB>`l=`GhG4NR<KFEKZ:wL^KZ:wL^e.L6LCM==fD8Lz=[DPPu@*^vR)Hbd@Ql?6]lPP:KQ6Q8PVeRP3_Q_AP5dSOdeVPlNSN@eLQsO^e[OWeIQUQOMAeNPbOOOOOOOOOOOORpdtK%eXP_O`N@eWP>R=:lRaM*B>`pM*B>`p=9H%GpNW<+G,Km:wLFKm:wLFe'LYKWNA<<FhL-A|?YRG:^Q@Tl>AZ_QV>w]IQ*:UM*QGJUd{POUnd]OqdxOfeWN_NAPLeQQJOSe[OreMQUPzMCeMPzOOOOOOOOOOOOR]d|K;eVP}OwN\"eUP=Qr:TQ&MaA&_nMaA&_n=JH'GGN.;VHVL::[NYL::[NYdJLqI$P0:QM#K(Fo<fTJ;%MQW4='VGQf=,YaQW;,J:R'IydeQ(RReBO_e9OIeXNKN|P[eERJO~eZP&eQQ`OsM?eKQ3OOOOOOOOOOOORYe$KYeWPrOvN*eTP^QW:MNzN5>p]JN5>p]J=@I6FbMi;\"JVLg:]QILg:]QIc]L=G,Pc:dS-KMEJ=AT7;VTeU}@-]MQv;lVhQf;aHQRTIjdYQQQ;eKOVeEO5eYNBOIP_eCRYP*eYPBeRQON|MUeKQEOOOOOOOOOOOORZe)KueXPoOWN.eRQ\"Qx:hL7N[<oYBN[<oYB=LJVE[MC:aLSN!;;ULN!;;ULc/KVFCP6</W}L]@R@qTf@s^nUKFbbhR=:}SdQd<AFpRPIBdOQ;QFeLOTeFO3eVN#P3Pre@ReOoeYPSeQQFNDMceLQIOOOOOOOOOOOORfe&KleYPQOANLeTP|RG;NICO+;:UZO+;:UZ>.L#C{Ld:XN.P9=#YfP9=#YfbOJtEHOE=QZYN$;hH*TmH~cuThS%d_R::UP0R(=$ERQrGwd)P9QFeRONe<O7eIM<Q=QEe8S\"OOeZPIePQJN>M`eJQaOOOOOOOOOOOORle#KeeZP;O7NdeVPsR><SFWP$:MQUP$:MQU>lMbBaL(:^P/RX?7]]RX?7]]a;IYD)Nm>&[GNo:KQ@QbQ-eKQd[<auR+:lL+R:=JDrQoEBbuP1O)eZ" },
  "jump": { n: 20, dur: 0.67, loop: true, yaw: 24, still: 0.5, curl: 0.12, trav: 0.000,      // CMU 13_39 jump: crouch, take-off, flight, landing (0.93 s, played 1.39 times faster, so the flight is made lower to match: 0.55 of the captured rise, as the faster playing implies); at the top the arms are those of CMU 22_16 (jumping jacks, frame 290: both arms thrown up)
    data: "OO_hOOeSQHOOMVeRP2O1b![?e[OOOZOIb_Z=OOOOOOOOOOOOPseVNbeVPGPfNNeRQ9Rm;TIAR&=z[!R&=z[!<NH_I<La;PI6M-=_ZVM-=_ZVaxGZFRRzB{a/LCBJ?1PwDXbSQmKTe-L1D.b\"QtBz>_JiBN`LK7Q@e+OG`\"OPeUQ6O-MjeUOoO6b1[(e[OMObOHbkZ)OOOOOOOOOOOOPaeRMgeUPgP_N4eWP-S;;'K]Q{@b_DQ{@b_D<4G~K5LG:zK_MJ?b^DMJ?b^Da^F0GGS&Bma#L<B2?FQ@D^bSR3Koe-LbCoauQqBq>fJDB@`5JyP`e*O@`YONeTQ.NaMreVO^O>bBZle[OTOfO?byYmOOOOOOOOOOOOPOeELNeUPrPNN0eWNyTb;#NjQ?F:cHQ?F:cH<kF(LdKN:iN_MuCSaqMuCSaq`zCwI%RhB.`TLnAV?oQ5Djb[QxL;e7MSC1aTQ+B=?'J^B6`5KFO~e6O8aWOSeUPxN^N'eWOPOFbaZ:e[OhOOO:c4Y?OOOOOOOOOOOOP4e3K<eUQ,P2MyeOM_Wj<:REOoNweZOoNweZ>,CLOJI5;HQQNpJNe\"NpJNe\"^t@BL:RFA!_YM6@d@UQQE5bqR$Lwe>NLAd`NP@AP?aJuBo`jK~PTe>O4c\"OjeWPcNjN:eXO&O2c8Y6eZO|O!O9cgX6OOOOOOOOOOOOOae(JbeRQQOEMMeFM.])?fUmNZV6dPNZV6dPAP@=T!Es=BTNP0QleOP0QleOX8<AQ?Qz?9]lM^?WAdQvELbyR7MbeDN~?]^KOf@>@lKMCUaLLWPieEO6e(P>eWPwOHN'eVNnNxd(WHeZP6O5NudIVNOOOOOOOOOOOOO[e!JDeRQZOCMDeDM&bXG?VfPM]/aFPM]/aFG3?lZ{@ABOVHO*Y(c?O*Y(c?Tg=:XoQ?<}YRND>'CXQRDjbXQgLde?O)=?Z;O<>bBbL6CBaNL}O;eMO2gqQ(eWPsOiN,eWO:NldsU'eZP>O_N_e'T;OOOOOOOOOOOOOydtIzeSQGOiM[eIM9e)Q\"S~TGawZFTGawZFP6C=ag;?L1TrJt`u]!Jt`u]!QLC+aPPZ;%TbOg<+G)QWB(`bQNKke4OK;6UNN<<[F%LfA1_kMGKue5O%iAQdeZP)OnNueVP~NZeERVeYPJOHNUeJR1OOOOOOOOOOOOP3dwJ)eWPyOMN&eSN1cqWfQVVScqT6VScqT6V@H2c+;8TnRHH,cXThH,cXThO9IwdtPD:FP9Q-:gKpVCAL^fV5@_]{OB:FPfMK:}JpKb??]UKgCyakNyjNQre[O`O?OAeRQXNGeKR!eYPMO9NTeOQ_OOOOOOOOOOOOP+e!JFeVPtNxN)eVNdbZZ6Q>V`d9QcV`d9QcX!J@c.<7WnR'H#d-QlH#d-QlO-LveLPK:FP0PM:tJwXDA}^+X:AX]jOK:CP\"N!;$JIJ)?o]YIoB8_{Nrk=QjeZP%NyN|eYPIN^e@RxeYP@O&NeeKR.OOOOOOOOOOOOOte)JjeTQ0NrMneUO$bZZ6Q>V`d9QcV`d9QcX!J@c.<7WnR'H#d-QlH#d-QlO-LveLP`:MQAOf;GHxU<=jYKUi?,[<Os:LQPMu;lH#LT<{Y5LT@}_VNnksQjeYPENpN[eYP1NeeARueZP(NxO!eJR9OOOOOOOOOOOOOde=KkeSQAO&M_eSP3bZZ6Q>V`d9QcV`d9QcX!J@c.<7WnR'H#d-QlH#d-QlO-LveLP]:NQPOe;XHFS>=&Y(S}@1^AP':SR.M^<0G/O8<BXLP5Au`_Nkl1QpeXPHNgNYeXPKNYeERReZP!NuO'eLR)OOOOOOOOOOOOOoeDL9eTQ?O9MbePPrbZZ6Q>V`d9QcV`d9QcX!J@c.<7WnR'H#d-QlH#d-QlO-LveLPL:JQ'P%;MHiRu>@[AS;Bc`tP):OQiMY<!GTOM=q[,PZE~c@Nel3QoeXPJNZNZeVPqNWeFRIeZO{NvO,eLR+OOOOOOOOOOOOO}eELBeVQ)O>MxeQQ'bZZ6Q>V`d9QcV`d9QcX!J@c.<7WnR'H#d-QlH#d-QlO-LveLPL:IPwP4;AI1SK?z^9SfEZbbP):MQSMX;jH-My?H^,NWF4cKN_kvQfeWP>NBNgeVPqNTeBRgeZOzNoO.eIRBOOOOOOOOOOOOP&eGLPeVP}O+N%ePQ3bZZ6Q>V`d9QcV`d9QcX!J@c.<7WnR'H#d-QlH#d-QlO-LveLP[:LQ6P?;?I8S,@]_(S8FgcCOx:KQEMK;]HTMmA``ENgK#e.NTk?QWeVP2N+NteWPgNae;S6eZO{NcO/eDRcOOOOOOOOOOOOO|eLLweUQ)NqM|eLQ]bZZ6Q>V`d9QcV`d9QcX!J@c.<7WnR'H#d-QlH#d-QlO-LveLPt:RQjPL;BI/RFA<_sR@GCclOm:JQ=M5;MI,OWD'b:PyP?eUNMjKQOeTP*MfN~eXPcNie:S<eXP\"NIO0eARyOOOOOOOOOOOOOueTMceSQ=NeMmeBRGd<VsP1Yab_S.Yab_S.TcHJcf:|TFPdDfbIRODfbIROQ}J;doQ(:YR:PJ;FI$R`Ai`8RUH[d8Of:JQ:M$;II@P*D}bnQNQ%eMNFi>QJeQOyMDO0eYPXNle<S5eXP'N@O.e<S6OOOOOOOOOOOOOyeYNJeSQANuMke6S8ctH8K4c;R+Xoc;R+XoGkC:_w<-H!KS;6R9Tm;6R9Tm[|C:[FQ+:`RdPH;IHxT,AE_ST9E|bhOs:NQfL};fHKMVCeayNjM3eONRgRQ4eSOmMSO8eZP<Nte)T5eYO}NRO2e)T6OOOOOOOOOOOOP;eXN^eWPvOKN-e;S&W@=CG}Z0@\"Y/Z0@\"Y/=XDKQWF&>7GjB)@6U=B)@6U=a5BpLsQC;'TUP#;nGkRn?E]iS%CiaeOF:yTGM^<bF#Kr@P^zLJGDciNye(PceVPQNDNOeYP'O:dEV[e[O_O\"OEdXV$OOOOOOOOOOOOP8eYNweVQ(O]M}e<RwS4<GG6UD>`ZpUD>`Zp<dFOKyJP<VGRG8>$X)G8>$X)a1D1I.R0<JX7N`=sCrPFBKa+PDPYeWMc<}YQNb>YBoN.?|^jONOFe[ONa^P(eDRgO$L6eCO0OrbkZ(e[O:OVO^cMXlOOOOOOOOOOOOPaeUN7eUPhPYN0ePQ=S%<CG7S2?[]zS2?[]z<yG'IwKG<&H<JN>EZpJN>EZpaPE:H7Rl?9]ZM#?zAFOtF8cOPbK$e,KzA-_XP`A??rLlB$`UM*PCeM" },
  "standup": { n: 14, dur: 1.3, loop: false, yaw: 78, still: 0.56, curl: 0.3, trav: 0.000, once: [0.1,0.46],      // CMU 75_18 high sit: rising from the seat, 0.47 s, at its own speed; then held, as the live picture does
    data: "OOZFOOe[OGOOOWe0K)Q,aI]#eYOSNLP)a<]>OOOOOOOOOOOONIe?RteVPMN;NceGRKNO?yA6Uq?>[QUq?>[Q;mGnOVM&>nBhL|C4aOL|C4aObWERJ}W4PYd.JC<IGzR@KCe#TFW&cZJfQ@e!Sw<*HCKmGLcbK~FccEOQZKOje[O)O0OueZNqQF_2_VeXOWN2P@_s^}OOOOOOOOOOOON>e4SUeVP`NKNMeFRHNiAq?DUA=;XMUA=;XM<MG>K:LJ@n@YL`@W_3L`@W_3aoEPHbVdPCdAJ^<UGKRRJfdrTFVScmJcQ\"e#Sv<7G~KOG?cVK]Ffc@OT[6PEeZNdO(P<eXPDQ<]Ua\"eXOVN?P=^t_zOOOOOOOOOOOON>e-SveVPjNYNBeERNO9A{?:U&;~UJU&;~UJ=%H'HCL(@{@SLK>b[zLK>b[za<F$FoV'NDdTK-=#F3RTJ;dhT&UXd4K$Nwe.SX<^FrK:G.cJK@Fpc?OU]AQ#eZN_OAPAeKR+Q;]Ja+eZOKNVP4^l`%OOOOOOOOOOOON8e5SLeXPiO&N<eIR/OB@z@1Tp;ISKTp;ISK<VI*HXL/?mAfKs='Y2Ks='Y2`PFgDoUYK^dBKZ=NE.RkJ!d]SzUud.KJL2d|S?=(ErJ]Frc0JIH*c]O^^tQ^eZNkN}P;e?S!Q2][`|eZOUN^P&_9_ZOOOOOOOOOOOON-eGR2eXPhOCN8eSP|O6@F@dTQ;BSOTQ;BSO<7IKI6LJ?%BWKU;wVGKU;wVGa4H@DeT|HDc[L'=^DeRtIedSShVNc}KkHtd6Rw==E=JAFmc'J(HscnOf`QR;eZO'N`P(e8SMQ.^J`<eYOwNLOt`(^iOOOOOOOOOOOOM{eRPreXPlOLN3eXOiO2?tA9Sj;NTlSj;NTl<6IaI'Lq>IC>KE;>T6KE;>T6bUI^F6T:E.b<LU=QDkRzIZdOSPW@cdL=EcbzR:=9E2J<Fmc%J&I7cyOlb,S%eXO7N:O|e;S>Q._j_!eVP:N1Oba8]DOOOOOOOOOOOOMceTOJeWPvOSN*eVNlO'?%B7S.<#VrS.<#Vr<2ISI=MK=eD7K9;&RmK9;&RmcBJ<GOS]B1`DM&=5E2RiI^dSS,WIcgLqBba*Q[='EDJ<Fwc)J)J,d4OtcXSzeWOBN(OpeGRSQ(aB].eTPPMxOJbXZGOOOOOOOOOOOOMTeON4eWP{O[N%eTNENt=xCjRq<vX}Rq<vX}<%I7J+N+<nEcK3:~R;K3:~R;cjJOHJRv?R]wMU<pEiR[I]dURhWucZM:@!^cQ'<kEmJ8G\"c-J+K*dKOzd{T}eVO@MxOjeVQ+P{bkY}eQP^MaO1cpW~OOOOOOOOOOOOM`eKMKeXPkOrN6eVNNNk<lE`Rp=rZ_Rp=rZ_;|HsJsNf;{GNK?;$RgK?;$Rgd7JVIlR-=;YtN0<DFWREI_dYR:X=cPMn=aZgPF<GFMJMG*c6JHJXdHP%f\"U~eVO:MwOhe[OrP`c~WVeQPXM`N}dcUaOOOOOOOOOOOOMreFLqeYPNP$NReWNUNf;yGSS->d[mS->d[m;xHNKdO6;6IRKW;5S|KW;5S|d]JaK:Q4;aV^Nm;tG^R%IOdYQcXPcNN9<$W]O`;zGLJvG-cBJvI5d.P&fgVneVO0M|One[ODPWdqU(eSPKMnNse8SLOOOOOOOOOOOON'eCLQeYP8P/NieYNcNr;AI0SN?A]SSN?A]S;mHBL`OS:hKLK~;VUYK~;VUYdzK#LZPP:iSKOF;IHsQfI=dVQ,Y=c.Ne;!TWO0;RHXK*G0cGK+I0d1P%g+WNeVO$N&Oze[O5PTe>R}eUP@N#NleRQJOOOOOOOOOOOONCeFLVeZOvP@O*e[O+O&:xJ_Sr?c]pSr?c]p;dHAMOO[:LMIK~<+W/K~<+W/drJ_LTP,:FP]Of;'J+QLI$dQPhY^b~O\":RR(No;6IUKDG>cSKEH.ctP#g4WxeWNnN5P/eZO9PSePQVeWP8N5NieZOwOOOOOOOOOOOON_eFLOeZOSPAOKe[ONO1:]L+T@?e]cT@?e]c;aH<N/Ob:CO?K~<hXZK~<hXZdqJILuP#:DNlOt:vJiQ9HydPPSY_c!O':FP^Ni;+I|K^GFc]K^G~csP\"g5X3eXNaNQP=eZO7POeUPteWP4N7NieZO$OOOOOOOOOOOON~eELCeZO'P:Owe[OfN|:KMWTs?)[aTs?)[a;NHdO2Or:FP[K}=;YZK}=;YZd{JRM_O~:GN7Ot:uJnQ3HrdNPNYdb|O':DP(Nn;*J!KZG?cXK[HCd\"" },
  "sitdown": { n: 14, dur: 1.3, loop: false, yaw: 78, still: 0.8, curl: 0.3, trav: 0.000, once: [0.1,0.45],      // CMU 75_18 high sit: sitting down, 0.45 s, at its own speed; then held
    data: "OOg*OOe[O3OOOleXPgP]dVU~e[O]O6OJdQV9OOOOOOOOOOOOOvbCZieYNLO~PVeOM?Mo;QHlR\"<HX8R\"<HX8;4K%KZOT:ULWMn<&WZMn<&WZd#K\"HkO^:LQXO;;0IfQ9HZdFPyY=c0NL:bS%NT;1IiK,G)cDK0Hpd)OLfuNBe[O1O<OpeOQqPec;Y*e[O[OBOKc3YAOOOOOOOOOOOOP'`e^#eXN=OhPbeWP,NA<JFHQT<9X\"QT<9X\";EK2JYO$:}JIN(<'WbN(<'WbcoK#H6Ou:pS|O0;/IiQ0HxdQP}X[cONF;.U'NZ;+J!K5G2cKK8Hnd)OJfJM$e[O%O1O~e7SPPla0]He[O^O`O:a-]ROOOOOOOOOOOOP;^}_seWN(ONPveDRJO#=|CcQ#</WtQ#</Wt;VKIIhN9;fH-N7<+WnN7<+WncPJpGSP<;`VjN|;2IaQ$IDd`Q\"XJcWN/<&W`Nr;(J)K@G.cKKAH<cxOGe]Kce[NzO/P,dkUEPm^J`>e[OeODOJ^S`;OOOOOOOOOOOOPG]*aJeWN$O9P}d{TWOi?jADP_<9X0P_<9X0;XKYISMC<lEsN8<8X.N8<8X.c;JSG2Px=.YrNO;;IFP}IhdkQ9X!ciMc=SZOO<;+IxKTG9cTKSH/cwO@dNJ]eZN^O:PDdIVLPrZebAe[OiO2OZZxb:OOOOOOOOOOOOPWZ>bZeVM|N~Q*dJV=P?A9?uPv<JXRPv<JXR;oK%I0LK=vD2Mz<GXJMz<GXJblIoFWQj?4]jN$;RHgPnJ#drQDW!d0M-?[^8Ox;9IGKRGGcZKOH1cwO>c'IxeZNjO-P<dIVMPwXecKe[OcO=OVX}cEOOOOOOOOOOOOP|Y'c;eTMmNoQ=d#WCPfB>?#QL<GXAQL<GXA<#JMH~KI>sC*MO<EX=MO<EX=b>I9E~RKAb`6MJ;wGnPsJ-duQbV)dKL=B6`[Pf;UHXKUGFcZKPH*ctO/a<IJeXNUNUPadWUzQCW^cve[OAO4OnX#coOOOOOOOOOOOOQ6XYcNeSM[NuQKcxWVP}BY>nR3<-WRR3<-WR<-J*H~JV?QBVLo<:WrLo<:WrakHdEGSADpb@Lt<?G!Q-J&dqR-UOdWKcE?b[Qd;}GcK+G:cLJzHud%O'_MI'eTNZMsPjdtTxQWW$d-e[O-N{P.WlcxOOOOOOOOOOOOQ?YGc'eTM_O&QDdHV;PrBT>qS#;zVdS#;zVd<HIRH^I~?|B9L&<1WAL&<1WAa:H5DvT*H3ckL<<[FSQ`I~dkRrUxdAK@H`d&R@<AG$JkG9cDJSI<d(O\"]cHdeNNWM5Pte)T#QbWIc{eYNwNSPYX3ceOOOOOOOOOOOOQ<[;azeTMcO2Q?e0SOP/B2?*Sz<9W#Sz<9W#<IHdIHI`@0B1KI<?WFKI<?WFa0GaE+TRKgdaL!<`FUQuJ#diS5VId+K#L+dsRl<MFuJ_G>cCJDI<d%Nu[8HFeJNALzQ$e?RfQtXacDeUNlM|Q1YCc+OOOOOOOOOOOOQ(^=`GeUMnOMQ1eUP%OGA-?~TJ<uX6TJ<uX6;wHPKeI]?kB]K#<gX0K#<gX0a+F|EYU!NtduKh<PG\"QeJ+dmS-U$dUJaO(e'SE<GG<JaG0c>JKHGchNlZ3H0eKN@M!PqeRQ$Q}Zvb+eRNWMXQW[9axOOOOOOOOOOOOPq`I^=eWN-O^PseELXO%?HAjTI=iYuTI=iYu;UHiMNI|>dCwJv=WYeJv=WYeaIF7FsUMQ;dbKL<;G`QrJ9dpSQV>d)J;QFduSx<8G|JxG/cCJlGdcVNWZ5H#eTNPMwP?eQMLRE]b`heNNDM<Qu^F`6OOOOOOOOOOOOPTbLZVeYNFOYPVdTHwN_=bD/TC?2]\"TC?2]\";GH}NmJb=NERK&>u[lK&>u[lajEZHEVEQ4dFJ~<<GwR.JhdwS~VoclJ3QEdrT<<7H8KCG;cRKUFSc6NDZHGueXNdNWP)e5KBRC_{^ZeNNAM<Qn`7^FOOOOOOOOOOOOPUchX-eXN;OXP[cNF;N-<^F%TR@W^YTR@W^Y;4IcPYKj<MG(K4@&^;K4@&^;bdF!JRW%Pod3Jg<7H5QwK%e\"SpV+d)J4Q%duTX<7HJKZG3cSKdFqcGNCZHGxeZO'NcObdpIkQvb;Z^ePNFMSQMb9ZjOOOOOOOOOOOOPEd]UpeXN5OMPWbIDCN1;qGmTIBy`hTIBy`h;(J[QyL_;XH|KmB+`IKmB+`IcJF^LKW<Phd*JR<;H6Q{K%e\"S{Uxd-ItQ'dmTy<>HNKdG2cUKqFbcB" },
  "dance": { n: 64, dur: 2.66, loop: true, yaw: 60, still: 0, curl: 0.4, trav: 0.000, ground: true,      // (figures 12; Jon, 16 Nov: "a modern kind of subtle dance") CMU 141_12 "Dance, Twist" (subject 141, general capture), frames 259 to 419 (1.33 s at its own speed: an easy groove on the spot, the weight rocking from foot to foot, knees soft, the arms bent at the elbows and swinging close to the body, the head with it; the loop closes on itself: pose error 2.3, travel 0.02 leg lengths); the lowest foot on the ground in every frame; the card: phase 0 (arms bent, knees soft, feet down). Was: CMU 90_30 russian dance 836-969 played 1.66 x (0.67 s)
    data: "OOfJOOdNIaS-T0d6UKQ=cnWrd_PcUfNZeVN:OOOOOOOOOOOOQve=Lae(M'S^R-eKNfR{?_^&JD_U^GJD_U^G@fBpWiI$?|Bc<kTRWy<kTRWyPM>D[qIV<nWGTS;UJXAoMD`MD:[b]ZM2:XMCM@<KFXO&G-cuO%VVdGO:fCO9dTJRSyS*dIURP>c{WcdrP4U)O!eYNZOOOOOOOOOOOOR'eAM0e+LfS6RAeIO8Tz=vYsL4]Q`nL4]Q`nBJA>X0EV?jEJ?mV(]%?mV(]%R8>R[lJ$<DV_Tp;fJ9AZNv`HDJ]<]2LX:UOEN,<:FoK|Hgd4L&WTcfO;f>O.dcLbU$PfdkU;Nsd-W<e(O3T<OzeZNtOOOOOOOOOOOOR<eCM`e0LURjRHeHOkV~<aUSOvZ6bcOvZ6bcCB@dXNBm?hIACWWF`&CWWF`&T*>g[RJF;lU3Th;wISANPw`9E[_RZYKU:nQDOK;vGUGkLBcxH?WibVO6f9O8dWN{V%NKe$TDM!d4Vde3M[S>QJeSO:OOOOOOOOOOOORce?M{e3L<R<R_eEP'XI<CPST9Woc?T9Woc?E]?JY'A@?tM{G=XFaoG=XFaoUZ>mZyK>;1SRT6<)HXB9R7`fGjagX{K.:~R1P.;9IKE,R`b]EaVza_N}f/OAd4PcW$Lle,S9K>d)V7e-LBRoR_eEOZOOOOOOOOOOOOS)e;N5e6L4Q}ReeCP5XP<nKGXuUAbPXuUAbPH5>&X{@z@MRRJnY(bgJnY(bgW^?1Z0LD:jR8T%<BGjC*Q|aIFT_8[dJS;;S1P-;'J.DQRlb8EkYk`3NPeyO4d!P_WSL|e7R^J!crUze(KjRUS3e=OrOOOOOOOOOOOOSYe4NIe2KnQfS*e=PBWU=fGB^9RQ`8^9RQ`8I{<vWtACABVCMQY1c2MQY1c2X~?0X{L}:eRIT}<zF}CFP6amE][i^YJ0;UT&Q,;+J2CAPwafE*ZP_7N'eSO%d#P4WTMDe9RlIZcsURe/L+RJRpeBP'OOOOOOOOOOOOT)e*NMe*K9QZS_e3PEVP>5ETa*Pg]Qa*Pg]QJS<]W]B+B(XqOMX^cTOMX^cTYi>qWPLa:qS\"Vp=hF_B*N-`kCIXg_1JN;fU'Qz;AI]C{Pib0E)Xb`IMce'Nud2P:W/M:e3S.J9d\"U`e9LeR>R6eJO~OOOOOOOOOOOOT+e)NGe'K1QeShe2P>VB=tF%aBR)[|aBR)[|J{=DYEBCAmXmPsWdcwPsWdcwY`>2V)L5:~SFX;>=Fv@wM%_XB)X+^DJ~<)VSRT;qH?EXPhc,F:W<apM7dfNUdTOpV.Mge,SgK>c~VOe?LoQqR.eLOrOOOOOOOOOOOOSje0NEe,KCQUSUe5P@W(=-H=`!Tz]k`!Tz]kKd>2[\"B,@jV]Q/VGdFQ/VGdFX.='U1Kg;GTsXx>_FtA.LW_fB.Wc^aLQ<9WdR`<VF]H@OLdDI<Z!ahLXdON-dzNVTgO1e&TFLtcrWUeDLxQQR%eMOsOOOOOOOOOOOOSQe5NAe,KDQUSSe5PPWs<RKG]KWY_)]KWY_)J]?]]XAz?_RzO{Ted|O{Ted|Wy<aT+KW<=WHXm>VFxBBM2`uEP^@[{Nr<)WoR&=ODeL$MMe8LPZ=bGKkd9Mde&L?S6QWdgU3NtcXXReFM<QbQ_eQP#OOOOOOOOOOOOS&e<N7e2K_QIS:e:PAWs<*O#YUYk_|YUYk_|HkA)^IBL>wN/M9Rqe7M9Rqe7XA<eSOL&=lZRW_=hGGDRO)bUH)`([cQ\";qW-R'>9CSNDLmeINU[HaxK&d%MNdmJ-QoS}d2UfPxc-YBeFM~R4PxeVP2OOOOOOOOOOOORVeBN.e9L$QCRveAP8Vo;xR_Vw[B`@Vw[B`@FVBE^MCz?&HxIOP<dgIOP<dgXV<eRwL_?`^4VI<fH`FKQ3cQIL`;]3R*;QUrS$>WC@NHMaeRN[[iabJactMDdbIGPiTzcvUoRfbTY~eCN]ReP5eXPLOOOOOOOOOOOOQ}eJN8e?L@Q5RYeEP>U*<+UiT^]D`IT^]D`ID-CZ]jF<?~DLEhM9c,EhM9c,Y0<wR>LrA3_oU=;xJ%G]RdcqJ[a3[OR$;2TiTN>`CfLMO!eGL~[<aqJQcdM;dcI?P,U6ctU^Spb%ZIe@NjRyO~eVPwOOOOOOOOOOOOQZeONBeDLbQ/R7eIPES\"<9WQS+];`yS+];`yA{D9[4HOAFAEC&J5`gC&J5`gZ6=JQqM@Ap`NT_;PJ{HQSGd&K9aL[BQ=;(T]UX>yCsJ8NTdzK.[:aOJCcRM:diIQOuU,czUVTSa{Z;e@NRRqP2eSQ>OOOOOOOOOOOOQDeRNYeGLtP}R$eJP^Q]<>X*Q^[7ayQ^[7ay@@D5X{I#BX@'B.G{_$B.G{_$Zl=`P]N5B#`fTC;GK(IXSwd=L)azZxQ$;,TtV,?6CgINN8deJP[>a<J=c?M6doIgO|Tsd!UXTNb&Z/eBN/RVPXeRQ<OOOOOOOOOOOOQUeQNmeFLaPrR6eGPiQ4<(W_Q6ZKbNQ6ZKbN?qD(WzGpBi@LBrGe_TBrGe_TZF=FO>N^B7`yTG;VJLJ/T'dHLLb)ZmQT;=UDUq??CMJUNxe$KD[1a[JFc-M-duJ'PJTId)UcSTb:Z2eCMdR=Q'ePQ0OOOOOOOOOOOOR%eLNqe@L7PpRaeBPgQk;XV6R8YhbjR8YhbjA+C#X_EqB,B;DfI(aQDfI(aQYX<yNtNDB4`uTf;uIVIqT)d@L3aq[*R%;^V:U1?>C/L)O4eAL[Zwb%Jeb{M)e\"JhQ8SSd=U^QtbXZ.eAM%Q{QjeJQ)OOOOOOOOOOOORTeFN}e9KqPyS%e;PqRx;,SwT`X|b`T`X|b`A{C!YqCl@|ETGJK3cUGJK3cUY$<]O;MPAe`FU@<IHNHhS\"d5Jg_a^GQy<&WHTI?4B{LyO,eMM?Z`b=K*bpM+e+KfR:RCdWUFP&bpY}e<L;QJRUe@Q5OOOOOOOOOOOORveAO*e7KiQ!S-e9PzSw:rPWWaWkb-WaWkb-C`BG[-BQ?qIeJKMMdxJKMMdxXr<TOyLM@i_AVd=JG4F{PockI-^]^rQD<QXXSs>yC+M&NpeMMCYfbrKIbdM2e&LbSNQ/djU3NQc%YVe7KeQ\"S-e6QCOOOOOOOOOOOOS.e>O5e7KfP|S/e8Q+T=;+LaZaUea>ZaUea>Er@q[=B5?.MrMJOTeRMJOTeRYf=$PSKY?.]=Yw?bF+D:K=avEeZP__P]=.YwSa>WCSL^NPeGL|Y9c'K_bYM@duMKT[P2dxTtMEc5Y(e3KDPSSPe.QSOOOOOOOOOOOOS?e;OGe8KrQ,R~e:Q7TW;wID^=SC`#^=SC`#G`?8ZPBQ>xQEP+Q(eUP+Q(eUZ(=6PUK==FYV^\"BSEcC\"Eh^OB/V0_LP.=gZzSU>3D&LDN@eCLeY)c,KkbMMLdZMlUhO`e$TOLcc@X`e0K3PTS`e*Q_OOOOOOOOOOOOSMe8OJe6KoQ=S\"e9Q8Tp<}Fn_wQI^n_wQI^nI!=dXtBz?+T$QzQXeDQzQXeDY^<|P1KC<7W/_ED,EfAhEQ](A-Wd]^Og>2[[SK=tDQL/N5e?LRY@b{KxbEMKd9MeVkOVe(T<L8c9X_e*K-Q4S_e(QxOOOOOOOOOOOOSIe9OBe7KxQFRwe;Q2U.=]Ed`iQ6]s`iQ6]sJ9<~X9C.?KUSS!QQe7S!QQe7YQ<uO[K_;cUp^hCsE(@GJW^LCq^KZ;O2>R])SL=aDpKaN)e7L*Y-b~L+b?MCd'M^W8OTe)T:L3c,Xwe!J}QsSce#R8OOOOOOOOOOOOS9e<OOe:L2QOR_e?Q5Uz=LFT`KRp]z`KRp]zJg=SYWBu?NU)RZQ$eARZQ$eAXn<ROPKJ;aUY]uC1Dh@>NH_/GXbTW,Nn>f]ASH=XD}KGNKe4KoXuc'L8b;M5c~M5W@Ond~T]LZb}Y@duJzR`SZe\"RKOOOOOOOOOOOOS$e@Oee<LDQWRGe?QRV^<cH~_+Tw^j_+Tw^jJ?>_[1B3?FRiPyP7eVPyP7eVX_<KOSJs<1Vd^%BiEJ@5Mw_\"FmauWhNU>`]7SX=XE$K\"Nge.KQY9bmL9bBM*d\"LMW$PNdqU+MebmYvdjK$SJSHe%RPOOOOOOOOOOOORVeFOfe@LmQjQ|eEQTV_;uL.[tVD`1[tVD`1H?@![zAf?LO/MZO.eSMZO.eSXc<NP!K#<YWo]uAwFF@IMZ_3FRaQX8ND>5[ZSq=jDpJUNve$K+Y2biL4bOM\"d'KZVKQBd`UQODbFZed^KDTCR{e+RWOOOOOOOOOOOOQ}eNOceBMBR*QFeKQNU[;:OeY8WKaMY8WKaME[AF[iB!?}J^IQMyddIQMyddX@<@P[Jl=;Y-]h@rG{@<MG_$Ei`kXmNE=XZ`T!>!DRJ=NHd{JxYUbPL.bcM&d+JhUjRBdQU]Q/az[<dLKpUBRDe3RYOOOOOOOOOOOOQKeSO_eAMzRYPheOQNS~;,RsV.X'b]V.X'b]BgBRZ:CV@rF!E>LWbkE>LWbkX9<BQ@JL>0ZN]R@!IJ@AKx^kCa^!Z^NN<kY;S_>ICgJXLvduKI[SaEL6bnM0d/J;U9RydDUiRQaY[Rd7L/V9Q{e9RXOOOOOOOOOOOOPveWO[e=NUS(P+eRQJR6;GUMRiXLcBRiXLcB@MC8WxF>AwB/AeK(_vAeK(_vXD<NQ~J)?#[W]#?2JY@TJe^^By[][ENW<9X3SH>yB|JrK{dmKp]g`TLKbtM@d3J8U&S\"dBUlS8a[[<c~L#VuQ~e7R^OOOOOOOOOOOOPVeYO^e8O+SMOPeSQLPH;uW@OsXicNOsXicN?.CXU[I0Bi?r?4IH[Q?4IH[QXv<sRqIv?R]0[@>QK5@lJB^kC([X[VNi<#W`SL?;BSJ{L`dyKu]V`cLlbwMRd6JMU/RkdIUbS3azZnckKVW1ROe3RROOOOOOOOOOOOPQeYOke3O>SfO9eRQXNk<6X.MsXucBMsXucB>>C{SiJuC->~=~H<Xt=~H<XtY.=*SCIe?a]:Zk>2K(A+J$^}C+[5[|O*;nW3S&?=BEKVMWe1LL]~`MM4b~Mhd,JqUnRAdXUFRXbLZ3cXK=WRRxe2R.OOOOOOOOOOOOPteWOqe,O2T,O@eQQ^ND;~WULbXpc7LbXpc7>7CgRiK'Bn?1=nHRXh=nHRXhXv=!SRIa?=[iZI>/JEA;J9_7C8[-]3Nt;nW2RK?4BBKzM_e8Lc]Y`oMcc3N&cuKHVoQkdpTgQSb~YPcIK3WqS<e2QROOOOOOOOOOOOQ,eUOue&O)TCOEeQQcNl;JV-LqXScHLqXScH>ICNRpJ+Ab@I>8IsZA>8IsZAX[=*TMIX>LZQZ8>DI>A2J^_:C#Za]DMo;mW\"Q~>nBhK9MDe)L/]V`hN9cVNJcZL:WvQ2e0SXO|c]XJcAJ^WeS}e'QCOOOOOOOOOOOOQDeSP'e!O!TXOFeNQxP-:tT,N&WRc~N&WRc~>TCHS4HY@\"Bs?EKQ]X?EKQ]XXp=QUPIW=?XQZ\">hH%@kKz_8BiZQ]9L6;|VvQO>'CcIzL{dfK)]P`UNmd*Nxc1MPY1PEeKR)N7d6Vzc8IoWHTqdqQDOOOOOOOOOOOOQjeOP6dwNkTtOTeMR'Qp:YQ^OxV)dVOxV)dV?'B}S{G.>SF%A/Lr_lA/Lr_lYh>8V.I{<.UwYA>rF{@CN3_3CH]:[6JI<TWDQJ=/E3GyMBd,I/[.`zO6d`OEbQN~ZQOPeYPLLld]U?c(HvW,UndVQIOOOOOOOOOOOOR7eIPBdoNZU2OceMR$S^:jO*R)T9dxR)T9dx@RAOT^Ek=eIKCFMgafCFMgafZr>nUjK0;3SKX)>[F*@mP2_`E]`1YaI3=,WnQb<-G?EpN=c9FpXxa>OPe/OgaWPG[vNXeYO2L&dsSybkHKWFVBdFQCOOOOOOOOOOOORoeAPIdeN4UPP(eLR'U<;@LwT1RFdvT1RFdvB3?yTiDV=`LHEaN2c0EaN2c0[L>pTZLe:^QUVf>5EdAuQ3`WG3a:Y=HR=AWjQK;:IaD2O;bAE'W^`|OhePOu`^Pt^&N?eWNfK`d~R{bOHUX-VJdFQ!OOOOOOOOOOOOSVe4PMdRM_U~PReIR6VX<$KAU~Q>dRU~Q>dRCq>aTlCf={N]G:NVcyG:NVcy[9>JS`Ms:JP<V$=nEyBNQTa#FS_tZsHG=9WNPr:kKPC>P.ahD,W)`YP'edP(_oQP^vMleRNCKZe)R<b2I0Y0V/dRPKOOOOOOOOOOOOT;e'P?d=M)VLQ.eGR&W4<<K6W?R,czW?R,czDz>FV%C0>@O^GyO6d6GyO6d6Za>#SSN5:FOJU_=TF2BBR%`qG9a$YhH'=.VsP':ZL;BjPFaBCWVy`;PBeoP2_OQD_:MneSNRKie/Q|awIjZ!Uqd^OyOOOOOOOOOOOOTQe#O}d.M%VtQ;eJQcW=;~M/WRTzc:WRTzc:E:?DXUC&>GO*G9OzczG9OzczZ'=rTDN%:HO!UJ=9F[A_RW`0Fza5Y2Gb=\"V,OR:XLGB7PW`wC!V[_}P[e|P4_^PP_3NAeXO6L=e5R1acJ<ZZUZdeOPOOOOOOOOOOOOTLe$OQczM>WMQ.eOQ5Vy;eP'VGX#bUVGX#bUDr@uZLCU>3M8E@P>c\"E@P>c\"Y^>(UpM[:KO.U;<yG3A!R`_SFnaSXOGX<cU(O):]L,AyP5`bBkVt_aPjf6P&`1NG^[O~eXPVLve3RwaUJ`Z~UPdhO)OOOOOOOOOOOOT(e,O(cwMhW^PleSPuUa;dSZT1ZZaqT1ZZaqBrB|ZuDl=xJ^BdP2a>BdP2a>Y!>CWHM#:QP#UF<`Gw@IR:_&FhakWzHI<#SbNE:iKUC\"O&aTDAY\"_ePqfYOv`2K~^5Que@R)Mwe(T%`zL6]ATHe#NGOOOOOOOOOOOOS{e-N_coN3WyPNeWPMSe<!VLQS]Ba.QS]Ba.A*D/Z#FZ=}Gb@+Oq^|@+Oq^|Wx>SXtL/:bQ%Uz<QHl?FQD^&Dd`7XWIM;DQpMr:{JkDAM|bDE-WJa,P{g$Ol`UJ!](SAduSNODdfUY`|M9]SSYe0MrOOOOOOOOOOOOSWe1N!c]N_XHP'eYP8Q2<VXhNq^N`?Nq^N`??BDyX/I/>>D{=gO>Z{=gO>Z{VH>MYyKC:wQzUw<:IP?\"Pj]`CK^zY,JF;!PCMK;(JLEmMvc4EsRNc(Q/gFOc`cHH[(T=dBTwPcd4W#`nNG]tRbe:M=OOOOOOOOOOOOSde(M1cSN_XZPZeXO*NZ=DZ@LK_(_NLK_(_N=}EJUdKf>tB~;{NZWO;{NZWOTt>MZlJV;5RqU_<%J!?\"PY]`CX_.Y\"K-:nO!M,;*JPFuLzc[FoOCciQOg[Oca#GwZ;TLd)U`QTcfW~`kO!]zR5e=L|OOOOOOOOOOOOSMe$LNcWO7XVPCeVN9LA>)['JM_+^wJM_+^w=GE?SPMp?fAQ;%MnTT;%MnTTSj>D[-Ib;SS@U7;tJ+?#Ps]_CN^~Y*KK:oMfL_;0JLE(L.bWE+KobRQqg`OgaAGvYgT7c~V.R%cNXH`vN}]lR-e?M&OOOOOOOOOOOOSJd}L.cVO^XXP=eQMLJx>^[GI+_*^DI+_*^D=8E.R!N?@^@P:fMIRr:fMIRrS%=sZYH};lSQTn;kJ&?'QX][EGa6WTK@:wM(L:;;J9D/KVatDGIZaOR$g[ObaNGkYHT3csVOR1cEXWa6NK]BRGe?MFOOOOOOOOOOOOSVd{L-cWOBXUPOeRMdJ~>O[5HY_\"^6HY_\"^6=GDkQeLvA:@):mNJSb:mNJSbRT=IZ$Hj;uS]TZ;cJ1?'QZ][Dv`dW{K*:zM8K{;@J5E-LUbaEbH*abR6gQOeaTH5Y]Snd%V:QucRXDaNMr[|Rpe;M_OOOOOOOOOOOOT#dwLIcKO'XoPpeQMhLF=bZKHp^U^lHp^U^l=wD/RLJ;Aa@D;LP^V,;LP^V,Qj='YWHs;iS/T0;XJ,?*R!]XE5a$WdJ[:~M}KY;BJEG&L5cXGOH*bYRUgFOmakIvZ<R:dWULQLckWwaeM\"[NSQe3N\"OOOOOOOOOOOOTGdtLwcCNUX|Q6eQN-N`<[X|J6]e`+J6]e`+>QC`SkG/AvA[<}S@Xx<}S@XxQ*=8Z%I1;PR.SA;KJ\"?2Rm]REKa:WQIm;.OCK1;FJVIUO&djInI;ctRwg=OvazL#ZvP=e\"TPPhd#WLb#KpZeTDe$NUOOOOOOOOOOOOTjdnM(cANBX}QEePN7Q9;_VULN[ZaTLN[ZaT?MC(UND\"B8Cc?1Up[??1Up[?Pi=bZmIu;0PsRE;:J)?@So]GEqa_W3I$;IQ(Jt;=K>I(QydNI.Kcd<S+g>P*b(My[-Nqe;S8Otd8V~bJJ4Y?UXdfO9OOOOOOOOOOOOTsdmM6cANIX}Q8eRNDSD;0ShOJZIbWOJZIbW@lBMW>AJBdF7A_Wl^.A_Wl^.Pf>%[BJ~:qODQO;.J2?STu]8EbaOW@I&;WRKJz;$LqIbZ6ahHhOfdRS0g@P=b#O*[=N+eFR:N|dNVAb]I&X5VMdJOdOOOOOOOOOOOOU%dlMRc=NBY(Q'eUNvTm;(PaR`Y/c#R`Y/c#B^AZXx?cC:HWCyY!_HCyY!_HQ?>F[kKh:fNAPr;-J!@,Ud]XFrb?VqIw;HS&K<:lN{K1aA[OHfVDc<S+g@PHb*O:[3N6eLQmM|d^UbbqH<W+V}d8P.OOOOOOOOOOOOUmdWM[c?MbXwR\"eKNLUj;CN!UjWhbvUjWhbvD}@AYm>mCaJ1E[YF`AE[YF`AR\">F[_L#:dMzPU;4Ib@zVG^1GPbUW!K\";/S(K[:jP|LGc~W%HSYraTS'g9PSb.O?[,N=eNQZM9dgU-c$H.VOV|d7PMOOOOOOOOOOOOVSdBMsc5LuXzRleBN[V;;jL*X*VkbCX*VkbCFX?TZ.>CCsK7F`Y1a(F`Y1a(RX>*[)Kx:eMvPI;>I>A^Vs^^GVb@WXKY;\"RyKi:pQxMDdiU*I<[9`xR{g-PZb9O9ZyNIeOQWL{djTtc6HCV3V_dAPWOOOOOOOOOOOOVvd6Mwc7L)X_STe6NnVA;wKMY.W!agY.W!agGe?<ZZ>7CzKXFyXZaSFyXZaSRi=_ZBKr:eN-P<;EI%BNVt_HH?bXWeKe:xRSKj:lQTLud0ViI>Y|ajRlf}PWbVNwZHNheNQrLzdcU-cLH]UnVEdKPJOOOOOOOOOOOOV^d?M~cIKxX0SQe7O+VQ;dM#X|Xh`|X|Xh`|H<?|[t>ZCcJiFCWuaZFCWuaZRI=2Y[Kr:bNhP3;GH{CRVC`PHGb!X}KW:wR>L\":_OqKna[[>IZV~cBRVfpPRc!NPY^O2eKR5MBdYU]ccI,UXUydZP5OOOOOOOOOOOOU}dTMwcaL$W`S5e=OCV|;fOiWJZf`SWJZf`SH+@k]h@$BdHrDoW7a\"DoW7a\"RL=-YRKg:cOVP3;IHtD9UNaCH+`vZWKA:wQwL5:eMHK{[=a`KCT^dVR6fdPGcKMeXaO|eCRkN9dKV@czJ#U`U(dsOyOOOOOOOOOOOOU0djMcc}L?W&RseBO;VW<$S`U]]n_dU]]n_dGHB$^^BFAXFJBWVR_aBWVR_aRk=NZ&KQ:kPqPV;JHwDDSsaxGE_<]5KX:lQ/LR;#K0LHV5d<L?T,dsQgfYP7cqLIWGQ6e.S^OTd7W%d4KBUwSoe2OPOOOOOOOOOOOOT>d}MOd8LZVKRVeFO-Un<gVxS$_0_<S$_0_<EfBw^EE[@UD:?uUH]L?uUH]LRP=oZbK/;%RVQ;;HI-D&Qob+Fz^]]`LG:XOiL};GIJM]SSe/M_T_dvQ7fRP+d%K#V0RUdjTYPsc~WSd<M0VQR1eKN}OOOOOOOOOOOOSNe-M>dRLnUaR>eJO1Tx=hYZP1_{^tP1_{^tCZCQ]6Hr?{Bl=MSrY]=MSrY]Qu>%[1JD;YTNR@;LIDC3OKaaEy]l]qM=:QN0MX;tGqNQQ^eONQQ+eTPmfQO{d,ImTwSbd>UPQZclWqd:NmVwPZeWNWOOOOOOOOOOOORqe6M)dcLxU,R7eJN~St>j[^MG`)^ZMG`)^ZB.CBZNK@?oAy;xRDVy;xRDVyQ!={[2IF<CV*SA;PInB8Mj`sDm]']cMa:WM*N!<;FnNGM1eMNHRne@PLfROkd5IAS|T1d(UxQlc^X,d:P\"VxOJeXN@OOOOOOOOOOOOR>e:LmdsM-TVR%eLNrRw?U]zK6_v^>K6_v^>A8C\"XsL1?yAW;AQpUH;AQpUHPJ>&[EH^<zV{T&;VJ.ASM'`2Cv[J]QMU:`LNMs<PFBNKI^djNHQveLP(fNOZdDIMSBT2d*UsQZc_X/dJPQVFNteWN:OOOOOOOOOOOOQxe=L`e#M6S}Q|eMNfRZ?t^EJ)_d^-J)_d^-@jBoWoK1@&Af;YR_Uv;YR_UvP9>6[^H]=,WBTI;YJAAFM#`%Co[T]BM8:bLTML<NFNNlG_d+NhSBe9" },
  "talk": { n: 14, dur: 0.66, loop: true, yaw: 24, still: 0.47, curl: 0.12, trav: 0.000,      // CMU 18_08 conversation, explaining with the hands: 0.63 s round frame 1572, where one open hand is raised to the height of the chest; own speed; the last third blended back to the start
    data: "OOg:OOeZNWOOPGeTQ(R(eMOgeELHN]RZeBPuOOOOOOOOOOOOVQdAQ;dZKHTRSHe6PZ_G@cQndrKSSPdrKSSPKOO{e8=*E/PX;DU>R<;DU>R<SiT[dTMn:OQ,MD;_HRNLHOdGNtLCeEKl:hMpKk;@J@ItG`c>KLP$e7OPg:OPeZNjOaP3eUQ'R0eLOleDLENQRae?Q3OOOOOOOOOOOOVAdGQ<dYKXTcS9e:PQ_%@;QCduL4S{duL4S{JzOAe-=;DlOw;HURR6;HURR6SWSvdhMd:OQ\"MM;_HPNGHLdFNkL*eAKg:hMxKi;AJ>IvGQc8K_PYe8OSg9OPe[O!OdO}eVP|R.eLOqeELHN[R[e@Q,OOOOOOOOOOOOV@dFQHd[KUTXS>e9PL^[?qQ#dkLHTTdkLHTTJ:N[d{=NDIOY;SUjRQ;SUjRQSrS]dhM[:OPvMO;ZH[NHHDdCNpLJeFKc:gN=Kj;JIzIxGGc5KTOne9ORg9OOeZNzOtP#eVP|R(eLOueGLRNuRPeAQ3OOOOOOOOOOOOV<dGQLd[KUTWS?e9PJ^<?SPndRL3UDdRL3UDI=Mld]=aD,O@;dUnSD;dUnSDTHRGdpM]:OPzMO;[HWNFHBdBNgKje;Kd:fNDKl;JIzIqG`c=KSP@e7OSg:OMeZO$P$OxeVQ\"R&eMOyeGLONqRSe?QFOOOOOOOOOOOOV.dMQAd^KcTYS3e<PA]d?$PUd-KvVJd-KvVJH%LYd&>(CSNt<$UmTj<$UmTjU<PDdlMW:OPtMT;YHZNGHHdDNjL*eAKe:fNDKk;HJ#IoGXc9KPP9e7OPg;OJeZNoP/P+eUQ%Q|eMP!eKLjO?R5eBQNOOOOOOOOOOOOV0dMQ7d^KjTaS1e=P+[q>BP+cQKVWocQKVWoFJK(c(>_BjNA<aUhVl<aUhVlVqNPd;MY:OP}MT;ZHXNGH@dBNhKee;Kf:gN5Kl;CJ8IqGac=KMP2e6ORg:OIeYNsP;P&eVQ\"QzeNP'eNM$OEQzeDQ^OOOOOOOOOOOOV,dOQ0dcKnTNS.e=P&Ze=XO<bCJuYkbCJuYkD8IiaK?PAlM_=LU+X~=LU+X~X/KHcAMP:PPwM];YHZNIH>dANiKie;Kc:gN:Kl;BJ9IlGZc9KKP=e6OSg;OFeYNxPOO~eUQ(QseNP5eNM%O/Q|eBQpOOOOOOOOOOOOUwdWPvdjL\"T@S$e@O`Y6<hNU`vIi[Q`vIi[QB2Gq_#@X@kL`>HSb[5>HSb[5Y4GRaOMP:PPuMZ;XH]NEH>d@NcK_e9K`:gNEKk;BJ9IiG[c8K;Oce4OTg;OCeXNrPUP%eUQ.QkeNP>ePM:ODQeeCQ}OOOOOOOOOOOOUwdXPadkL*TAS#e@O?WV<&MW^iGi^$^iGi^$@)EeZ/Al?oKn?RQ5^6?RQ5^6ZPDD^cMJ:QPzM[;XH[NNH>dANtLNeFK^:gNCKk;@JDIeGSc4KEPAe4OUg;ODeXNqPYP&eUQ(QfeOPCeQM?O9QbeBR%OOOOOOOOOOOOUsd[PHdkL)T?S,e>NzUZ;ILx[XE7^L[XE7^L>~CLTzC4>sK)@HN+_7@HN+_7[(A:Y~MI:QPzM[;XH[NPH=dANzLxeLK[:hNDKk;@JBIjGQc5KGP/e5ORg<OCeWNkPgP+eUQ+QheNPDeQMCOEQZeCR)OOOOOOOOOOOOUld_P5dmL2T;S(e>NdSL:wLnYbBH]YYbBH]Y>nBQOKDW>&J`ARJ6_KARJ6_K])?`U[MJ:QPzM_;YHYNPHBdCNwLieJK^:hN9Kl;<JRIlGGc1K>Oee5OTg;ODeXN|PSOzeVQ$QueMP:ePM9O6QfeBR&OOOOOOOOOOOOUnd]PLdmL.T:S)e>NvTj;)M|[BBG[*[BBG[*>aBcP!C#>vKO@=JJ^<@=JJ^<]W@2UvMV:OPzMK;YH_N]HHdEO9NNeYK^:gNHKk;BJ;IoGKc4KRPBe7OUg;OGeZNtP#P(eVPxQzeNP\"eLL|NpR'eBQaOOOOOOOOOOOOU|dTQ$deK|TRS1e=ORY*<`Ou`PEJXy`PEJXy@HGK[y?oAMM?=9NyZ1=9NyZ1[KE-^PMW:OPxMJ;WHdNTHGdEO&M?eQK^:gN?Ki;DJ2IrGOc6KJOje7OVg9OJe[NrONP.eVPxR$eMOleHL^NiRFeAQBOOOOOOOOOOOOV7dIQOd`KaTQS6e;PG^%?GQZcnIeUncnIeUnHTMldD=TD@OP;mSnUq;mSnUqV*PVdSMd:OQ$M?;ZHaNOHKdFO&MgeTKa:gN8Kh;GJ(IqGVc9KRP5e7" },
  "stand": { n: 2, dur: 1, loop: false, yaw: -20, still: 0, curl: 0.2, trav: 0.000,      // CMU 13_42, standing still before a jump, made the same on both sides; arms and feet set to an easy stance
    data: "OOgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOOOOOOOeZP4e[OOOOOOe[OnRb:YOOP~;5U9Ox;^Vh;ENII(L=:YOON!;5U9O';^VhdYNII(PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?OOgKONe[OOOOOOe[P-OOe[P#e[OOOOOOeYPTOOOOOOOOOOOOOOeZP4e[OOOOOOe[OvRb:YOOP~;5U9Ox;^Vh;ENII(L=:YOON!;5U9O';^VhdYNII(PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?" },
  "seat": { n: 2, dur: 1, loop: false, yaw: 0, still: 0, curl: 0.3, trav: 0.000,      // CMU 13_01 sit on high stool, frames 700 to 780: seated upright on the stool, the thighs sloping down (made the same on both sides)
    data: "OOcDOOe[OOOOOOdLHWOOe>S0e[OOOOOOd3W/OOOOOOOOOOOOOOeTQ@e[OOOOOOe[P+`-A;ODBE@0UlBE@0Ul[MA-E_?rA;OD]Y@0Ul]Y@0UlCQA-E_TmDoazQr;SH{STA<_ZRxHyd<J2DoazM-;SH{KJA<_ZL'Hyd<OOcDOMe[OOOOOOdFHEOOeBRse[OOOOOOd2W1OOOOOOOOOOOOOOePQke[OOOOOOeZPB`\"A1NSBT@QVuBT@QVuZf@jE>?}A1NS]J@QVu]J@QVuD9@jE>TlDmayQv;SH~SXA@_]S!HRd.J3DmayM);SH~KFA@_]K~HRd." },
  "sway": { n: 13, dur: 4, loop: false, yaw: 0, still: 0, curl: 0.3, trav: 0.000,      // CMU 86_15 walking, sitting, hand motions: frames 2390 to 2630, sitting still, hands on the thighs (2 s; made the same on both sides)
    data: "OO_MOOe[OOOOOOe[OkOOd6W&e[OOOOOObWZJOOOOOOOOOOOOOOeTQ=e[OOOOOOeXPaS4:fN-JmGbcVJmGbcV>~DUH+Kk:fN-T2GbcVT2GbcVa!DUH+T9LXdtN1:GO/UVHfcVU}Jzd)JfLXdtPn:GO/IHHfcVI\"Jzd)OO_KOOe[OOOOOOe[OfOOd0W6e[OOOOOObGZdOOOOOOOOOOOOOOeKR2e[OOOOOOeQQdS<:hN\"JoGoc[JoGoc[?\"DLH4Kc:hN\"T0Goc[T0Goc[`}DLH4T;L]dtN0:GO/UWH^cSV#Jzd(JdL]dtPo:GO/IGH^cSH|Jzd(OO_MOPe[OOOOOOe[OmOOd4W,e[OOOOOObUZLOOOOOOOOOOOOOOeZP8e[OOOOOOe[OFS2:fN&JuGicZJuGicZ>}DPH5Km:fN&T*GicZT*GicZa\"DPH5T9LXdtN2:GO,USHbcVU|K%d,JfLXdtPm:GO,IKHbcVI#K%d,OO_MOPe[OOOOOOe[OhOOd:Vze[OOOOOObhZ-OOOOOOOOOOOOOOeZNWe[OOOOOOeRMLS2:eN6JqGdcWJqGdcW?%DNH+Km:eN6T.GdcWT.GdcW`zDNH+T6LWdtN3:GO,UNHdcXUxK8d1JiLWdtPl:GO,IPHdcXI'K8d1OO_NONe[OOOOOOe[OOOOdCVce[OOOOOObkZ)OOOOOOOOOOOOOOe[OTe[OOOOOOeZNnS.:cNOJvGgcZJvGgcZ?\"DKH4Kq:cNOT)GgcZT)GgcZ`}DKH4T9LWdsN1:GO0UNHecXUzK?d2JfLWdsPn:GO0IPHecXI%K?d2OO_KOLe[OOOOOOe[ODOOd@Vje[OOOOOObYZFOOOOOOOOOOOOOOeRQYe[OOOOOOeVQ,S1:dNPJsGtc_JsGtc_>~DIH=Kn:dNPT,Gtc_T,Gtc_a!DIH=T6L[duN4:FO3UOHjcZUxK4d0JiL[duPk:FO3IOHjcZI'K4d0OO_KOMe[OOOOOOe[OROOd8W#e[OOOOOObLZ[OOOOOOOOOOOOOOeSQOe[OOOOOOeVQ!S5:fN4JkG{c`JkG{c`>vDRHAKj:fN4T4G{c`T4G{c`a)DRHAT7LZdtN3:FO2UNHgcYUuJyd,JhLZdtPl:FO2IPHgcYI*Jyd,OO_NOQe[OOOOOOe[O[OOd:V|e[OOOOOOb_Z=OOOOOOOOOOOOOOe[OOe[OOOOOOeZNVS1:eN6JoGjcYJoGjcY>{DRH4Kn:eN6T0GjcYT0GjcYa$DRH4T6LUdtN4:FO-UMHacWUuK!d-JiLUdtPk:FO-IQHacWI*K!d-OO_MOOe[OOOOOOe[OOOOdAVhe[OOOOOObgZ/OOOOOOOOOOOOOOe[O3e[OOOOOOeXN>S-:cNPJqGkcZJqGkcZ>{DQH8Kr:cNPT.GkcZT.GkcZa$DQH8T5LWdtN5:FO/UMHfcYUxK;d2JjLWdtPj:FO/IQHfcYI'K;d2OO_LOLe[OOOOOOe[O?OOdDV^e[OOOOOObfZ1OOOOOOOOOOOOOOeWPve[OOOOOOeYPLS-:bN]JtGycaJtGyca>yDLHEKr:bN]T+GycaT+Gycaa&DLHET3LZduN7:FO3UJHjc[UuKKd6JlLZduPh:FO3ITHjc[I*KKd6OO_MONe[OOOOOOe[ONOOd>Vqe[OOOOOObcZ7OOOOOOOOOOOOOOeZPDe[OOOOOOe[O^S,:cNHJsGtc`JsGtc`>uDSHBKs:cNHT,Gtc`T,Gtc`a*DSHBT6LWdtN4:FO1UIHccYUwKQd7JiLWdtPk:FO1IUHccYI(KQd7OO_MOPe[OOOOOOe[ODOOdBVde[OOOOOOb`Z<OOOOOOOOOOOOOOeOQte[OOOOOOePQkS.:cNVJiG}c`JiG}c`>fDkHBKq:cNVT6G}c`T6G}c`a9DkHBT5LWduN5:FO,ULH`cWUuK/d0JjLWduPj:FO,IRH`cWI*K/d0OO_HOJe[OOOOOOe[O4OOd=Vre[OOOOOObQZSOOOOOOOOOOOOOOe/Sze[OOOOOOe-T&S':bNTK$H6cpK$H6cp>hDSHdKx:bNTS{H6cpS{H6cpa7DSHdT5LbdvN5:FO8UMHpc^UtK8d2JjLbdvPj:FO8IQHpc^I+K8d2" },
  "thinker": { n: 8, dur: 6, loop: true, yaw: -18, still: 0.35, curl: 0.85, trav: 0.000,      // CMU 13_04 sit on stepstool, chin in hand: frames 1700 to 1940 (one knee up, the elbow on it, the chin on the hand: the pose of Rodin's Thinker), a slow loop of its own small movements (6 s)
    data: "OOZsOOe[OlOOO5dTHpQKcmWpe7L#QWQMbaZ(OOOOOOOOOOOOV?dFMUe.K%NpS~e\"QoQFD4b9C8`gIkC8`gIkM{GO;~G,@6CRQG:yS}QG:yS}b/NZCv_nXbZkD+=tLqRrCgafV+H)c/IAS\"dGN9:LQ-J4G<c7J$MkdpONZqOLe[O]OCO?dFHDQ2c~WNe/K^QfQ^bJZJOOOOOOOOOOOOV{d8P>dwJ?MoTxd8TaOTChb'DvaOHhDvaOHhOhGq;lG1@,CZQX;%TGQX;%TGbYNgD[`<X^Z/Cl>\"MPRqCfafV*Gmc%ILS#dJN3:LQ+J4G<c7J&MwdrOPZ{OCe[OmOXO7d;H'Q0d#WEe)KLR#QcbRZ<OOOOOOOOOOOOW.d3OkdpJ-MUU1d;T<P_D%b5E!a`I&E!a`I&M*Fq<CG6?sCxQM;+TcQM;+TcbQNJDP`'XKZ]Cv=|M7R]CHaTV4G|c'IIRodLN2:MQ7J3G<c7J$MkdpONZ{O@e[OVOKOGd4GrQ^d\"W>e$JqQARXbIZ7OOOOOOOOOOOOW}cmPhdYIULrUzcgUEP\"DKbPE`b@IrE`b@IrA;D7D^F4?tDcRb;1TCRb;1TC`mNpB(_wX^ZbD+=oM=RKC;aNU}Gmc)IQRjdON/:NQAJ,G;c4IzMUdlOSZ{OCe[O;OFO`d>H0Q{csWUe\"J^Q!Rub9ZIOOOOOOOOOOOOW{coPPdcIXMZUbcuU.OcDNbRF0b[IxF0b[Ix@'D]E|Ej@*DiS`;*S,S`;*S,^$OD?:_dXfZtD5=kM,R3BO`yU7F3bWIRRgdPN&:NQ7J&G8c1IvMUdkOTZyONe[O`OrOLd?H1QecmWke%J~QUR=bAZLOOOOOOOOOOOOW1d1P.d~JQN4T_d:TuOGDAbKEwbEIYEwbEIYBrDiBDF.@0DBS>;'S=S>;'S=_:OH@E_fXYZ{D,=uLiQ|BRa!TcEnbTIKRwdKMo:OQ/J,G)c-J$LbdeOSZtONeZOwP'O=dKHUQFclWve'KHR-Q^bKZHOOOOOOOOOOOOVSdHONe,JrOQSzd_T!OkD6bCDlaZI9DlaZI9IDEp=eFq@1CkRM;#SoRM;#So`sO!B/_HXg[:DB=mLFR5B|a<U#FWbpHsS-d7N/:NQ@JTFgc)JCL9dgOSZtOOeZP-OkO!dNH_Q?clWve,KlR7Q<bXZ9OOOOOOOOOOOOVHdJNTe*JiOYT\"drRsPTD4b?C^`mI0C^`mI0MyG.<.G>@=C=Qb;!T.Qb;!T.b)NdCm_BXa[EDD=nL9R[CFaSUYGGc%HoS'd6NM:LQ@JKG+c6J3M+dn" },
  "bow": { n: 22, dur: 2.2, loop: true, yaw: 40, still: 0.42, curl: 0.3, trav: 0.000,      // CMU 141_26 curtsey: frames 150 to 300, a grand bow (la reverence: one foot drawn back, the knees bent, the arms swept out and the head bowed, then up again), at about its own speed
    data: "OOg#OOeYPTOONJeUPjOTeVQ+eDRPPeL}dPI0OOOOOOOOOOOOMFd(GoeARvP0L<dxK-QG@D_.C$Y!^`C$Y!^`>LGOEtJ;C7`v]n[mZ@]n[mZ@``G}D0I};9LxK5<!HTM8MjeJSPcIW|R(<\"W:R.<'WDMh^z_nL~d*W!O,fTRXeSPcMwNDeVPbOWeXPme=S#PaLTd4HKOOOOOOOOOOOONld%GNeNQKP{Mxe\"JcP*BsaICJ^[YWCJ^[YW?lKrAnL8F1c2Yib$U>Yib$U>]2M]>bJ:;7LRKX=nDWMPJ!dmS4aT[HRS;vVoR);UV#QaZ,b]PBa3]GNHfcU)eUO$MkP)eUQ$N{eQQYe>S$P9LDd<HlOOOOOOOOOOOOP}d/GseHO\"RKPTe3KEO4B.`sC-]zZ+C-]zZ+B0P0?+N+E:byY\"bpSwY\"bpSwXDOQ<?Kh:hMvK^@r@gP[D)b8SA^?`\"S-;pVAR5:nRyPFSBe9NG`m]tM}f9VQe[O+N}OzeER]Nle9SCe:RzQ>LVdkJAOOOOOOOOOOOORmd9Hje\"M'SzR]e.L9Ni?q^bAqXe]fAqXe]fBlT&?6MjBxaEZc`4X-Zc`4X-XBSO<fL%:jM2K@Cw>>Pw?*]hSiX9c8Sg<aX-R_:YP\"Q?P1eSOlY,c>M`drW5eWNhPdOwd}T_NBdmU5e5RFRNM$e8LCOOOOOOOOOOOOSUd^JYdsKpShSMe5N8O;=QZYB&P'`lB&P'`l?fTLB?Kn@\"^F[iWU_c[iWU_c]pVo@pKy;OI`NFFb<>LP;PUbOAOze[Tj>b[0S%:mM\"RTOGeGPtW8d+MTb{W/eMNLQrOddOV@N.coWxe/QlS>M9ePN}OOOOOOOOOOOOT9dxLvd^JJSDTEe\"PmQE;tW-GzFhb3GzFhb3;mQPH)Ha=TX@XDL{cPXDL{cPc$U}GcL%<OFwP]GF<\"G'<fT@JeNxe(U1AY_DS+;/K%S=O1e;Q(X.ceMca%VxeLNLQ|OZd@VkMlb]Z4e0Q`SALyeEQJOOOOOOOOOOOOT^d}NndUINR<U'dZRkU#;aTARbA-_`RbA-_`:nK,OcE@=5RPPxCEaiPxCEaieWPJNGKf<IG4Q$J9;(DG=}S[JLNhe\"U(DsauRz;KIhSpNpe1Q^W?d!Mx_LW&eQNgQNOUdNVBMxay[?e6R,R_LGe0R[OOOOOOOOOOOOTcd|P3dTI%Q3ULd7T)Z'=:Q0]SB)Y@]SB)Y@>rDwW,BY?%LDFm>YXiFm>YXicfG=RWK5<(H?QIM2:WBo>ZPYI[L;dSU8GXc7RU;oHFTiN.dwRhUudCN/^?WJeWO)PuOLd^UsN=ab[fe9RER/L2e)RuOOOOOOOOOOOOU&dqP`dEHHPFV.cpTn_-@@Msc2G'T[c2G'T[ExB_^;A7BRFn?cALP2?cALP2]o@pVpK'<&HNQ%O7:HBw>QOdJQK\"dSUGIPctR9<?G$TZN#dzRCVMd7N;]|WseYO[PRO)doU8O-ar[SeFQOQpM.e6RoOOOOOOOOOOOOV.dPQ\"ciFqP-WXb~UeagC]LUe1K`QSe1K`QSK3>w[t@FFaCZ=4F`I_=4F`I_Vs<PU,Kb;zHHPqO::GBH>|MxIjJ,d,UpJAc~RT<mF+S]MSe-QqTMdvN2^FWue[O+O|OfdcUbP=ac[heSPHQ0N=e<S(OOOOOOOOOOOOVud5Q;cWFIOhX)biUibbEUKDeQM{Q\"eQM{Q\"MJ<lY-@7IvA}<wK[F3<wK[F3R0:lRlKP<'H5Q`N::PAO?jMVHKK*cyVGI=cMSQ<uF>QKMNeJOOU-drN&_TWgeVM|OYPudCVSQYaB]'eXO3PeOUe9SHOOOOOOOOOOOOW'd.QAc_FXP'WsbwUXadCwKLe9L%QGe9L%QGKU<bX<@+ImB1<tKYF;<tKYF;Ra:fQpJy<CGgR:L8:lA-@#NbGKLicqVZFNb7Sr<UG4P[N*eTOAS7e<N<a?WfePM:O7Q^ciWvR1aD[xeWNUP^P6e>S)OOOOOOOOOOOOV4dSORd9H0Q!VMd(S<^+?ULlcFF@QocFF@QoF5>QX\"@EEyD6=,GuHA=,GuHAUS;yTiJL=<F\"QZHm;UAJ?mQ0FUMlcVVMBx_~S`<\"HKO*O'e[N,Sse-O,ctX7eTMcOFQ/cGXiQHb)[&eQN`QMP,ePQbOOOOOOOOOOOOUUd`MpdLHjQ2V$dMQdVq;bO\"^V@#RP^V@#RP@FCJX'B;@SHS>vBSM]>vBSM]Yq@`ZIJ[=bE4O[Dg==Gf<%R?I>JPd(UG>}[;Rn;9JDN8OkeXMpRWe@P8f4Y\"eTMgOwP|c~WPOfc1YEeKO&R6OqeZP2OOOOOOOOOOOOU,djMUd`ILQ?UAdbQbQ7:]RDW_=,U~W_=,U~<BI:UzEo<fNECQ?9UjCQ?9Uj`:HY[hK+;xHqOYCK>-Ht;mSHJxN^e+SZ;vV:R#:[M>MQPEeQM8S%e4Q&gKYPeVN.P0PVdhUFP#d7W!ePP+QbO$eUMnOOOOOOOOOOOOSme)MJe-K^QxS&e1Q~MW;XV@Ox?W^FOx?W^F:]LuMCH<;qRLKBBG`VKBBG`VdbP@UaLB:kLbPz@S@]JbCgaEM]]|``RC:gR9QR:LOOLxQWeCLpSUe'Q8gZY-eWN3N|Pme6SGP_d}TWeUPaP_NTe1K5OOOOOOOOOOOOQMeDLwe=O#S3OOeRQQN2<TXjFzK2c@FzK2c@<rJtF`Hd<uVtSzL-dtSzL-dtd[UKM'N*:HNeR|=4ENKVJId]L9bdYeQO:MPJQ=:JP&MXS\"e8MuTJd}Q@gOWkeXN1OcPleHR/Pje=RyeSQ0PIN5djI`OOOOOOOOOOOON$e7KbdPSiTmJUe%OqND=`ZkD<UGaGD<UGaG=<K[EMHP>rZOXeUKbTXeUKbTc)S(F*N-:HNpS7<[FhFRHRb>K)bQY[Pc:UR)P,:FPVM:PeeMN-W5d,Q_g(UleXP9PFNneVPzP>eKR-eJR%P[MUdQI!OOOOOOOOOOOOKZdWJ3c:W$UZG7cuM{P|>,[ICQXU_CCQXU_C>2KwCvI;@']SZ-Zi^sZ-Zi^saoO_CFLY:tKmO0<$G9HxLwdGP>csWuO1;HV*N/:KPvKeNUe:McYubmQBfmSMeJQhQ-MGeQP1OTeMR#eEREPpM2dTI9OOOOOOOOOOOOJhcxH_bzX@TlF9c7L=S:>o[yBCXO^EBCXO^E>tHXDGJ!@7^%[k[A[z[k[A[za.L5BuKP;!L8MI<!GXJCN\"dzR:cvWFOB<[Y!OC:^R}FTUsbTEP^:]$PPfvQXeGQpQKM;ePP#NveTQ4e?RPQEM8dPI(OOOOOOOOOOOOK1clH$d)VsRGH*ctKPRm>n]&BfY/^=BfY/^=>gHODbIEAv_N^MZwZO^MZwZO`-IuBHK9;$L?L[;uH/K_N(e6R{cvW*PY='YjQm;/TgD-UNa;CZ`8W'Ohf{P/eUP~P;MueSPcO3eWPye;RnQFL{dIH|OOOOOOOOOOOOL,cwGrduTuPgJ7dRK9R!?z^XBGY\"^*BGY\"^*>xGzDiItBh`F^![^Z<^![^Z<`OHGC^JI;1L[Kb;|HBLnM~eGSVc_WHQ5<ZXoQd;XV8G4XoaTF#a_WF" },
  "jig": { n: 28, dur: 1.7, loop: true, yaw: 30, still: 0.15, curl: 0.5, trav: 0.000, ground: true,      // CMU 49_02 hop on one foot: frames 1080 to 1134 (one hop, 0.45 s), twice on the left foot then twice on the right (the same hop mirrored): the hop-hop-change of a jig
    data: "OOeHOOeVM~OOP}e6S?PHdhUKeWOHN+OeeOQqOOOOOOOOOOOOPpe%Jhe[OQOtOOeXN>Wy<gJ[R/BJ`vR/BJ`vD7@_EPKy;gHtOdBtaKOdBtaK^8BcEmM4;jVfLZ=3E?R4G{d&RlMee<TpKNdTKF@_A\"NP=#YcP,B8`{OOgYOdeTMZOAQCe.SYPBduT|eXOXN;OMeWPqOOOOOOOOOOOOPqe0K:e[OLOWORe[O0Xk<{KHQ7BzaGQ7BzaGCl@mElM:;SHvO*BhaBO*BhaB`1D\"G3Lv:iR^M8;YHdOCDpbgPQO?eYSDL4e\"L0A9@7MP<QXWNR@D_6OKi]OleQMMNTQ`e$T!PNdyTheWOLN)OVeZP6OOOOOOOOOOOOP}e;K{e[O<OPOceZP>Wi<FKqQ<B1`mQ<B1`mBYArEjN(;9IUNGA|`cNGA|`ca8E'GwMX:PQ*M^:oKONG@\"^pO2Gtd4R;L/e1MdC&>PNb;-U)O7={[;OGj2OqeMM'N`R%d}T%P/dxTseYO5NFOje[O?OOOOOOOOOOOOQ%eALGe[O3OVOkeWPrU|;fKhQlA#_fQlA#_fA0C4E~MS;%JQO<Am`YO<Am`Y`?DfFSM_:VQpMr:yJvM8AH`*MfIcdgSJK_dvMIDr=AO!:PQyOd<NXfOPiFO{eRMKO~QEe%T&OVe#TQe[OPO-OMe[O#OOOOOOOOOOOOQ7eCL^eZNlOHP4eSQ;U3;UKHRa?n^=Ra?n^=@dCyEjLi;\"K(OxB6`yOxB6`y_#CfE[M(:YQSMM:|JwLc@M_*M,G,chTKKmddLiDG=dNu:PQuOg<2X(O^g?P)eVN7PDPUe4SUNye-T\"e[OSOfOKe[O_OOOOOOOOOOOOQ4e?LDeZNgO@P8eVPqV?;sKYSa@K^gSa@K^gA[B`F#LQ;\"K5OpC3aaOpC3aa^}C,FAL}:lR{LS<*G^MCE+bjNXM*eMTZKpd`L7CG>LN.;,TxO#=DZCOVeEO|eZO*NxO}e?S$OMe\"TVeZOTNcOMeZP6OOOOOOOOOOOOPme@L6e[O<O#OfeWPnXJ<VLVU-CE`sU-CE`sC_?eGvLU;?IyNtCmb)NtCmb)^jB<G5M:;IUiKt=BE:P*H5d?PyM0eKTWL]dmL3A/@?NK<UXoOD?w^jOOeHOOeVM~OOP}e6S?PHdhUKeWOHN+OeeOQqOOOOOOOOOOOOPpe%Jhe[OQOtOOeXN>Wy<gJ[R/BJ`vR/BJ`vD7@_EPKy;gHtOdBtaKOdBtaK^8BcEmM4;jVfLZ=3E?R4G{d&RlMee<TpKNdTKF@_A\"NP=#YcP,B8`{OOgYOdeTMZOAQCe.SYPBduT|eXOXN;OMeWPqOOOOOOOOOOOOPqe0K:e[OLOWORe[O0Xk<{KHQ7BzaGQ7BzaGCl@mElM:;SHvO*BhaBO*BhaB`1D\"G3Lv:iR^M8;YHdOCDpbgPQO?eYSDL4e\"L0A9@7MP<QXWNR@D_6OKi]OleQMMNTQ`e$T!PNdyTheWOLN)OVeZP6OOOOOOOOOOOOP}e;K{e[O<OPOceZP>Wi<FKqQ<B1`mQ<B1`mBYArEjN(;9IUNGA|`cNGA|`ca8E'GwMX:PQ*M^:oKONG@\"^pO2Gtd4R;L/e1MdC&>PNb;-U)O7={[;OGj2OqeMM'N`R%d}T%P/dxTseYO5NFOje[O?OOOOOOOOOOOOQ%eALGe[O3OVOkeWPrU|;fKhQlA#_fQlA#_fA0C4E~MS;%JQO<Am`YO<Am`Y`?DfFSM_:VQpMr:yJvM8AH`*MfIcdgSJK_dvMIDr=AO!:PQyOd<NXfOPiFO{eRMKO~QEe%T&OVe#TQe[OPO-OMe[O#OOOOOOOOOOOOQ7eCL^eZNlOHP4eSQ;U3;UKHRa?n^=Ra?n^=@dCyEjLi;\"K(OxB6`yOxB6`y_#CfE[M(:YQSMM:|JwLc@M_*M,G,chTKKmddLiDG=dNu:PQuOg<2X(O^g?P)eVN7PDPUe4SUNye-T\"e[OSOfOKe[O_OOOOOOOOOOOOQ4e?LDeZNgO@P8eVPqV?;sKYSa@K^gSa@K^gA[B`F#LQ;\"K5OpC3aaOpC3aa^}C,FAL}:lR{LS<*G^MCE+bjNXM*eMTZKpd`L7CG>LN.;,TxO#=DZCOVeEO|eZO*NxO}e?S$OMe\"TVeZOTNcOMeZP6OOOOOOOOOOOOPme@L6e[O<O#OfeWPnXJ<VLVU-CE`sU-CE`sC_?eGvLU;?IyNtCmb)NtCmb)^jB<G5M:;IUiKt=BE:P*H5d?PyM0eKTWL]dmL3A/@?NK<UXoOD?w^jOOeHOOeVQ!OON\"e6S?NVdhUKeWOVPtO:eOQqOOOOOOOOOOOON/e%Jhe[OMO+OOeXN>S&;gHtO;BtaKO;BtaKAgBcEmG&<gJ[LpBJ`vLpBJ`vZh@_EPJ/KNdTSX@_A\"PN=#YcNsB8`{Qk;jVfRD=3E?LkG{d&L3Mee<OOgYOdeTQDO^M[e.SYN]duT|eXOFPdOQeWPqOOOOOOOOOOOON.e0K:e[OROGOLe[O0Qe;SHvOuBhaBOuBhaB?nD\"G3F4<{KHMhBzaGMhBzaG[3@mElKZL4e\"RoA9@7QN<QXWPL@D_6R):iR^Qg;YHdO[DpbgNMO?eYOSi]OleQQQPJM?e$T!NPdyTheWORPvOHeZP6OOOOOOOOOOOON\"e;K{e[OcONO<eZP>Pw;9IUPWA|`cPWA|`c>gE'GwG6<FKqMcB1`mMcB1`m]EArEjLdL/e1Q;C&>PP=;-U)Oh={[;QF:PQ*QA:oKOPW@\"^pOmGtd4OWj2OqeMQxP?Lzd}T%NpdxTseYOjPXO5e[O?OOOOOOOOOOOOMzeALGe[OlOHO4eWPrQK;%JQOcAm`YOcAm`Y?`DfFSI#;fKhM3A#_fM3A#_f^oC4E~KTK_dvQUDr=AO~:PQyO;<NXfQ@:VQpQ-:yJvQgAH`*Q9IcdgONiFO{eRQSO!MYe%T&OHe#TQe[ONOrOQe[O#OOOOOOOOOOOOMheCL^eZP3OVNkeSQ;R6;\"K(O'B6`yO'B6`y@|CfE[Il;UKHL>?n^=L>?n^=_;CyEjJSKmddR6DG=dP*:PQuO8<2X(Qw:YQSQQ:|JwR<@M_*QsG,chOAg?P)eVPhNZNIe4SUP&e-T\"e[OKO9OSe[O_OOOOOOOOOOOOMke?LDeZP8O_NgeVPqRM;\"K5O/C3aaO/C3aaA\"C,FAH`;sKYK>@K^gK>@K^g^CB`F#JDKpd`RhCG>LPq;,TxO|=DZCR\":lR{RK<*G^Q[E+bjPFM*eMOHeEO|eZOuP'O\"e?S$OQe\"TVeZOJP<OQeZP6OOOOOOOOOOOON2e@L6e[OcO|O9eWPnRI;?IyP+Cmb)P+Cmb)A5B<G5FT<VLVIrCE`sIrCE`s[@?eGvJGL]dmRlA/@?PS<UXoOZ?w^jQe;IUiS+=BE:NuH5d?N&M0eKOOeHOOeVQ!OON\"e6S?NVdhUKeWOVPtO:eOQqOOOOOOOOOOOON/e%Jhe[OMO+OOeXN>S&;gHtO;BtaKO;BtaKAgBcEmG&<gJ[LpBJ`vLpBJ`vZh@_EPJ/KNdTSX@_A\"PN=#YcNsB8`{Qk;jVfRD=3E?LkG{d&L3Mee<OOgYOdeTQDO^M[e.SYN]duT|eXOFPdOQeWPqOOOOOOOOOOOON.e0K:e[OROGOLe[O0Qe;SHvOuBhaBOuBhaB?nD\"G3F4<{KHMhBzaGMhBzaG[3@mElKZL4e\"RoA9@7QN<QXWPL@D_6R):iR^Qg;YHdO[DpbgNMO?eYOSi]OleQQQPJM?e$T!NPdyTheWORPvOHeZP6OOOOOOOOOOOON\"e;K{e[OcONO<eZP>Pw;9IUPWA|`cPWA|`c>gE'GwG6<FKqMcB1`mMcB1`m]EArEjLdL/e1Q;C&>PP=;-U)Oh={[;QF:PQ*QA:oKOPW@\"^pOmGtd4OWj2OqeMQxP?Lzd}T%NpdxTseYOjPXO5e[O?OOOOOOOOOOOOMzeALGe[OlOHO4eWPrQK;%JQOcAm`YOcAm`Y?`DfFSI#;fKhM3A#_fM3A#_f^oC4E~KTK_dvQUDr=AO~:PQyO;<NXfQ@:VQpQ-:yJvQgAH`*Q9IcdgONiFO{eRQSO!MYe%T&OHe#TQe[ONOrOQe[O#OOOOOOOOOOOOMheCL^eZP3OVNkeSQ;R6;\"K(O'B6`yO'B6`y@|CfE[Il;UKHL>?n^=L>?n^=_;CyEjJSKmddR6DG=dP*:PQuO8<2X(Qw:YQSQQ:|JwR<@M_*QsG,chOAg?P)eVPhNZNIe4SUP&e-T\"e[OKO9OSe[O_OOOOOOOOOOOOMke?LDeZP8O_NgeVPqRM;\"K5O/C3aaO/C3aaA\"C,FAH`;sKYK>@K^gK>@K^g^CB`F#JDKpd`RhCG>LPq;,TxO|=DZCR\":lR{RK<*G^Q[E+bjPFM*eMOHeEO|eZOuP'O\"e?S$OQe\"TVeZOJP<OQeZP6OOOOOOOOOOOON2e@L6e[OcO|O9eWPnRI;?IyP+Cmb)P+Cmb)A5B<G5FT<VLVIrCE`sIrCE`s[@?eGvJGL]dmRlA/@?PS<UXoOZ?w^jQe;IUiS+=BE:NuH5d?N&M0eK" },
  "cancan": { n: 18, dur: 1.5, loop: true, yaw: 35, still: 0.27, curl: 0.4, trav: 0.000, ground: true,      // CMU 143_24 kicking: frames 245 to 345 (a front kick to the height of the hip), with its mirror image: a kick of each leg; the kick is raised higher and the arms set (one hand on the hip, one up) in the rig (the wardrobe)
    data: "OOf/OOeXPaOON>eXO\"PaeWP7eWN:NgPrd{TXOOOOOOOOOOOOLAe\"SMe4PLKCNOeYOGPQ;nGsQX:TQHQX:TQH=4LeE;E@=cJ>[eG7_[[eG7_[^4Hv@oKk:bO=MG=<D{UMKodIU9QMdfOJ?{^nTj<&I*E;HoahE?Y{_kO4eVR5e'Q3T$MveUNsO1e[OFdpPGU.MTe6S.OOOOOOOOOOOOJbd{QceRQ/N<MkeTNdU+=9FFQ0:|T6Q0:|T6A/Jw@`H|=DFkVmM;d4VmM;d4bsHCGsL*;'K;N,>kB]T8Iqd=SgQke'N)?4]uTo;*M}?SPz^:@JXK[>NRf*U8a^OA[qPKeWNGJte,O'a=TQ[;HGd@Q/OOOOOOOOOOOOH\"d7PFeKR7O7LgeJNp]%@lFyT(:zQ?T(:zQ?IgLH;EI{<7HlQiU.dfQiU.dfc!E>P9Ir?7[iT2Hf<$O1<,WwLLDjbKL}<nY'Uz;FNM>?K)Z~>(V-YLNlh(XP[?V/`cOnc{G:ECbuM*]+WJ_MCAahPVOOOOOOOOOOOODKbMP^d`UUQ8I?daP_b1E_IEXU<FO7XU<FO7QYPk:PH^<8J+L|Y*c/L|Y*c/_~CaWaIL^*_PO[;\"J<EVK-b]H5Z5a3L(;2T5Ty;*NN=OHNX'=6VoW2NBi`ZPU0[n`cMcaTC/EJb)IPW%T5c`CSawOwOOOOOOOOOOOODKb@R'd[T_S?IidZROcwGLM5[V>9MY[V>9MYVIVG<iK5?jB$F#TDbgF#TDbgZN@?Y:F`T\"c0Y+JCbYEW]w]MGG[^_kP0:QQ|Qz:UQ);KHkOU:IMqO1N/hWZ}UWZSaKM&bMD`Fzb]HoTSTMdGDTbOMjOOOOOOOOOOOODSbOQ(dITpT%IVd^Qmb1CyP2^}@LRn^}@LRnX@Ss<lVsBM@W>\"P?[@>\"P?[@WO@h]BIkKQdK^NE2[QEOS[b^AYVV^iL=;#S`Ux;COA;'J+Oc:ENIOeNGgmZFYeX8`lLLc_G,H2cSI{Y$TubUF!cCNsOOOOOOOOOOOOF'c2RIe1S@QWKEe$RB^}@+OxXu>YX%Xu>YX%M6E#=;Ve@7Bj@kNG_[@kNG_[^HF0]CJ6@x^rZ)=cSfE'N-boB$T]_zLx;TU}VZ;`Mn:lPeSX:pM]SSN;fIXF`{Sr]\"M;e(K6K5dyL8`*Sz^$I>dcO}OOOOOOOOOOOOI(dGROeXPhO$N;eQQ:Z'=7N7PG>D[qPG>D[qHqCQ?FQp>FC<I9OVdbI9OVdbcWH[UGM;;bVQUP?rBYOgBuaKM1Jze!N.<kY6WR<(M6<wU_WL<7P'X1NAenUBd_Q_UJMPeQNYN'eWO5coQ2WsL8e+RpOOOOOOOOOOOOKKdxS(e@O/K{O{eZP1Vl;sLXKt?w^=Kt?w^=DZD{@hL9>wBkP;NJeXP;NJeXcuG1NCM%:[M8O$@-@~QqChavQKP6eRN->$[?Wx<0N0<XRjXB<^N@X}OOf/OOeXN>OOPaeXO\"N>eWP7eWPeP8N-d{TXOOOOOOOOOOOOR^e\"SMe4NRS[POeYOGY_=cJ>C:G7_[C:G7_[AkHv@oNM;nGsMF:TQHMF:TQHbkLeE;OT?{^nJ5<&I*YdHoahY`Y{_kS4:bO=QW=<D{IQKodIIfQMdfOkeVR5e'MlJ{Q)eUNsOne[OFdpNWIqQJe6S.OOOOOOOOOOOOT=d{QceRMpPcQ4eTNdV#=DFkH2M;d4H2M;d4=,HCGsIt=9FFMo:|T6Mo:|T6^pJw@`Pv?4]uJ0;*M}`KPz^:_TXK[>Ru;'K;Ps>kB]JgIqd=K8Qke'PLf*U8a^O^C.NSeWNGT+e,O'a=JMCdVWd@Q/OOOOOOOOOOOOV}d7PFeKLhOhR8eJNpU$<7HlM6U.dfM6U.df<~E>P9Bz@lFyJw:zQ?Jw:zQ?U8LH;ER\"<nY'I%;FNMa`K)Z~awV-YLU-?7[iJmHf<$On<,WwRRDjbKP3h(XP[?Hp?<O1c{G:Y[buM*]+GT@Q[^ahPVOOOOOOOOOOOOZSbMP^d`IIMgU`daP_VA<8J+R#Y*c/R#Y*c/@!CaWa=nE_IEFI<FO7FI<FO7MEPk:PRw;2T5J&;*NNbOHNX'biVoW2UR^*_POC;\"J<YHK-b]VjZ5a3P]i`ZPU0C1?<Q<aTC/YTb)IPW%Jj<?[KawOwOOOOOOOOOOOOZSb@R'd[J@K`U6dZROSj?jB$X|TDbgX|TDbgDP@?Y:<(GLM5CH>9MYCH>9MYHUVG<iNo:QQ|M%:UQ)dSHkOUeUMqO1X?T\"c0EtJCbYYG]w]MWW[^_kPphWZ}UWDK>SQybMD`X%b]HoTSJQ;WZJbOMjOOOOOOOOOOOOZKbOQ(dIJ/JzUHd^QmH,BM@Wa}P?[@a}P?[@GO@h]B=nCyP2A\"@LRnA\"@LRnF_Ss<lRb;#S`I';COAdxJ+OceYNIOeU4KQdKAPE2[QYOS[b^^EVV^iPWgmZFYeFg?3RRc_G,VmcSI{Y$J*=IX~cCNsOOOOOOOOOOOOXxc2RIe1K_MGSYe$RBH:@7Bj_4NG_[_4NG_[AVF0]CA\"@+OxF*>YX%F*>YX%QiE#=;R';TU}HD;`Mne3PeSXe/M]SSTi@x^rDv=cSfYxN-bo]{T]_zPdfIXF`{K-B}Qde(K6SjdyL8`*K%A{UadcO}OOOOOOOOOOOOUwdGROeXN7O{PdeQQ:M/>FC<UfOVdbUfOVdb<GH[UGDx=7N7NW>D[qNW>D[qV.CQ?FPq<kY6GL<(M6c(U_WLchP'X1Qd;bVQIN?rBYO8BuaKQnJze!P^enUBd_M@ITQNeQNYPxeWO5coMmG,Rge+RpOOOOOOOOOOOOSSdxS(e@OpS$O$eZP1Rf>wBkNdNJeXNdNJeX<*G1NCH3;sLXS+?w^=S+?w^=ZDD{@hPr>$[?G'<0N0cFRjXBcAN@X}Qz:[M8O{@-@~M.ChavMSP6eR" },
  "fall": { n: 19, dur: 1.4, loop: false, yaw: 76, still: 0.7, curl: 0.1, trav: 0.000, once: [0.13,0.67], lie: true,      // CMU 104_13 StumbleWalk, frames 62 to 126 (walking, the foot catches, the body pitches forward, the arms thrown out), then CMU 77_16 (laying down, getting up) played backwards from frame 232 to 128: down onto the hands and flat on the ground; one movement, played once, the end held (the older picture's length: 1.8 s)
    data: "OOf0OOd-Q=GuNqeBRlQ2duTid!P8GFQ2ddUHOOOOOOOOOOOOP<eWPXa{OgCXV!a~YGTE<|FW[|AVYB[|AVYB?/B8QMC(>_LUK5G%cEK5G%cE]R?GK8W%<=JvR3>2C`YPEw`KTCU_d,NX:LM`Ly=wD%LGJLdkMaPqePO'evP*d6PwH'O=eAR}Q6dRV!cyPQG;QNd;V_OOOOOOOOOOOOP9eJR2b<PQD-Uga7ZkR/>OC6[l>wT#[l>wT#>HC'P?Bz>OO~NIM1eMNIM1eM^??TNHXH<XLDRJ?.BJXED5`!T$RGdxO(:PM)MM>;CGLPJ7dgMSP1eRNcegP`dRPiHsORe7SUQ<c~WKcfPnFpR%c]X(OOOOOOOOOOOOPHe/SqbBQ1D?Uq`;]$P5@)A&Z_=oL=Z_=oL==VDhL@Cd>[T;QzRme6QzRme6_-@9P4Y2<fNaR\"?]AhZiEb_JUhS:d?OS:XLAN!>JC*LRIqd^MOPDeQNNeiQ=dpPhIuOVe&TDQGc6Y*cIQ5F:R`bsYJOOOOOOOOOOOOPZd[UpbIR#DYU{^|^NNcAz?<X=?aDYX=?aDY<CG0L,D|?SXOU]V1cWU]V1cW_3@?P(Y><wQfO~?@Au]5En^?YCPmc-OZ:sJuNC>>C8LqIRdXMdPgeQN<eyR#e)P2JjP3dgUQQbb2ZqbuQ^E?S_axZcOOOOOOOOOOOOPccvWjbORpDyU~]Z_fMDDP=VUwCK?BUwCK?B<GFKN^FY@[[XXqWOaaXqWOaa^n?{NxXb=IUOLZ>eB|]EEN]xZ]Rtb-OC;JHoNb=pCvMEHQd@N+Q,eQN)f7Rse6O(KIQ>d;VdR>`w]ObERDD[T_`T]7OOOOOOOOOOOOQ%c#YTbRSBE2V8[9`cL(H!<$T`GU<YT`GU<Y=bD+OFH1A=^A[lVz_}[lVz_}]t?GLXW+>.XqID>,E.ZkD{^x[ZRGaUNn<+G,Ne=WD=N>Etc;NwPaeXMqfWS{e1LwK{S;cXWdR|_M_!b*S1DEUG_\"^`OOOOOOOOOOOOQQb%[*bNSUE2VlY{aAKYKX;*T@Kj;9T@Kj;9?rA>NBIM@t^R_DTs^P_DTs^P[U?NHoTj>MZrGi=BGvV(E~b2Y8RYb~MN<oEkMk=cD6P@?U^AP??R^>Maf^UAd`J.L3UhbfX/S9^9`)a~T&DSUj]O_xOOOOOOOOOOOOQ4a@]/bdS~EjVIY2a{LBNq:YTxP,;(TxP,;(Bb?.KWJ}?@]Aa6QN]8a6QN]8YA@%D}Qn>3[GHR<4JFR^HLd1T~OrduL\"=3EQL[?%BTN?=ZZbN@=dZqMff!W\"d4H2M@W$b;X'SL]|`<bZTKEmU*[Da&OOOOOOOOOOOOP^a-]NbuT=F;UsY)b5N@Qx:SVWT5</VWT5</F->1GpLj=1Y`b%LwZ~b%LwZ~VhAZA=Nq=DZBII<#IzUCJ3d*TvH]cgI0=|ESK)B(?jEZ@iZ}F[Cu_iN/dpXPd>H3NuVObsW8SD]u`Cc0TIFvT>Z}aVOOOOOOOOOOOOOz`~]cc:TSG3TmY;bLQ=T::~YhVx>VYhVx>VJ,>1D]M8;8U,a(G7Yaa(G7YaT3Cw>KM~=z[2HY=WF^UIIQcsTpGTc@E9?<FXH{E$>@BKAsY%D+DT^SNid/YrdtIyO?TfcIW;SV]O`_cNU%H&SCZ1b?OOOOOOOOOOOOOv`Q^:cATqGXTZXXbsUSTf;y^dW>A{^dW>A{N{=JDQKw:`O-]JA@XA]JA@XASDG/<MMa=IZ>F~?4E&U%HCcYT$EqbgB'@0IwFVFe>LA)CoY]BME5]XOOd:[-dyJ?N%Toc:WXSM[UaEczU0ILRHY3c%OOOOOOOOOOOOO:`#^pcaU6HdS[X#cEYRU,=ibbU_FbbbU_FbQ7<dE{Hy<KI*VI<nVTVI<nVTU)J.;oLJ<_XVFS?mDRTBH%c`S+E:b]A@?mOODoEZ@/BAD{]8D3Fa`#OOU}^`eSQGOOO#Tfd|P1N,eVe6MuKfS$Loe0OOOOOOOOOOOOZMT*a{Yx`LFFaYJs[!aEJ9CxL\";<T[L\";<T[CNM3>9A7NS?xRw:}S5Rw:}S5]KN]>nT5C#?*M4W{<9XU>2GJWZ=9VJNeDM=NOMWU;{N[;dH,Nb:FNYOkSD_teQQTP<N]P#eYO%QFeSeHN3LqR%N$eHOOOOOOOOOOOOX9Vyb6Yy_hE9`+NA^c_pPWA!Ml:XR,Ml:XR,C^N9>$D*T|>UQD:NPgQD:NPg]WOb>vS8G^<7NLXd<PWD=cG9Ut<OV3NeIN;8O.Wq<)NE;fH*N]:FPFOzQW`=eXPVP%O.Kde;MfTEd}eYOHNDPZP7eWOOOOOOOOOOOOTeZxaNZU^&C^[YT2a1]^T6?^P7:SR+P7:SR+BcL|>sEuY)?<PK:EO;PK:EO;]{P:?6RcJt;,N]Y><lW==_G:UM<NVSNXM!:RO^Wl<&Mt;eH6N$:XR9P>Q7`]eZO[PANeI8d`M<Rwe7eZO1P,NtPVeXOOOOOOOOOOOOR8]x`W_~Y:DzWYVCbiX6Y(>mSS:nQ+SS:nQ+C3Kk>eJG]b?kL`:VNXL`:VNX^=N>?SQxK}:lO7YL<rVG==G:TI<3VTN/N/:KORW4;nMV;qGzMp:jS@P@Q+`QeZP?OgOLJ4d{LsR{e1eSN1PwN6QfeMOOOOOOOOOOOOQc`6^Ie&P|JoRvY^bdW)Ww=_U0<PVpU0<PVpF1F<>wMb[+=xHv;XR0Hv;XR0[lI;?MQVKv:jNfY<<kWv>+FvVg;zR{N&NS:IO@W0;mHT=7GJI+;CP/PHQ,`aeZP7P\"O4IgdoM#Rue4eWNjPgN@QheMOOOOOOOOOOOOPT]Na-b5X,GsTeU{cxaXQYC9KCB|a\"KCB|a\"LJ?4BEA*Sb@YQfBXa(QfBXa(S>?@BHQML-:eO!Y<<jWD>!F^VX;[P_N'NJ:JOXW.;lG]=PG`HG;fQuPNQ$`_eWPQPPNiJIe!MNROe>eYP!PQNJQ%eTOOOOOOOOOOOOO8XFc_]G`#I:VvQ7d5d3GsNxB=K@`MB=K@`ML|;lH;:lKANR^hJO_:^hJO_:Qx<IFcQJL4:dNLYF<qY%?pD~Y&?fE0McMk:POfW\";gCH?>I9C{=lOd" },
  "play": { n: 16, dur: 0.8, loop: true, yaw: 66, still: 0.52, curl: 0.3, trav: 0.000,      // CMU 10_01 soccer, kick ball: frames 548 to 668 (the leg drawn back, the kick, the follow-through), one second, played 1.25 times faster as a loop of the older picture's length (0.8 s); the last third blended back to the start
    data: "OOe>OOe)JhOOT*dMTYQxctWTeYO*PROPd<VuOOOOOOOOOOOOM[c{WQcfWgRKFxcbQda8B]P?c$ICWXc$ICWXHT;TP=Ef<hO+GgJ|c[GgJ|c[`tB^S)TBA7_?L&>PCGRyChafS~L3dtM,:RN@N<B*?3IJ?e]3K@JxddP*f@R@dhIMOEUDd3TDR:d4VYeZP:OzN[dkUBOOOOOOOOOOOOM\"czWDc@XFS'F.c;Q~bbD~M3e'M=Sle'M=SlL+;RURDH=kRgKpQ)e8KpQ)e8`:A{S=S8A5_ZN;:}JVQUH{dNQ|Ste#K~;SIOM&@I@tI5<2UBI4>.YkP}g\"UbdTHnOHV)d8S,RCdrTBeSQCNqMke2SNOOOOOOOOOOOOLLd!W%c)XgSJEdc%R*c5GAJ&eXPIPEeXPIPEOz<IXZD7>nU|MxTUd{MxTUd{_xAlT(R%?b^<P8:KQ?SNJ^daS=TRd`J)=?F0K?AB@BFr<9M}Fl<:NFQ{fSY+dAH:NcVhd?PMR3e@QheFR(MhM*eDQbOOOOOOOOOOOOL0d7V8c#XyS<EWc#QlcDIyGleARvO#eARvO#Ru;XUfD]>zVwL{UPdXL{UPdX`gC8U5R+?^^6O6:SR8Y_I_b)ZDN8bVGJ>FF$JUGK<WDx?+GBEm@CDCR}e-];d;HCMFVLdCM_R%eMOPe2RRLELGeFOFOOOOOOOOOOOOL-dLUUc%Y#RyEWc%QTcHJTGNdmU=O!dmU=O!U/<;V8E`=rUhItT:d=ItT:d=a-DdVmSh@;^SJ5;(N7YlI$ajXnFKa0D^>lHHJ:N5;&BUCmCTDNFk?cT3d*_Rd}JnM8SedpK[Q9eRNCe/RPL2LBeENyOOOOOOOOOOOOL'd-VPcEX=R{F4c8RNbrFeImdcUXP[dcUXP[S}>M[3H{;^R^ERN6c)ERN6c)aOF9W~Sy@X^lH#<LJ0YSHJacY*G6aGC>>6OoH~OI;E?XEHEuBaI??rUDcfa!eHMVM8Pod|JHO^eXN@e3S5MGKce;NzOOOOOOOOOOOOLBcfW`chWHS+F{cGSO`IAtLne!QHT7e!QHT7MH@g_NLa:WN>D4Eo_QD4Eo_Qb:G]WkRC?Z^.G$=ZH%YgH6aNYGG;a9E5@1YlFeDv?K=bDwSa?^C'I)V;cpb3eNP$M'N>dmIkN`eXNPe-T%OOJze-OlOOOOOOOOOOOOL@cRX,cvW,R|G:cNSk[`>6O{b[JxYAb[JxYAE?A[[jO{;(J(E}?@Y7E}?@Y7c?H%USP{>E[oFi>4G%YMG|aSY:GEaEJBB>`3I5;IQ_A!Qs_bAaDU[1Vbd=byeNPRM9M{d{JHN2eVNVdrTPR+JEe!O~OOOOOOOOOOOOLGcSX,d7VlQCG|cbT,VZ;uRv[WE]^h[WE]^h>tCzUXR|<6GTH=;zS)H=;zS)cDI|W4O|=DZCG'>(G\"Y+Gca[XpFzaGN]DtbhQ->8[XCWS9aSCjRUanW6dVcee2R:L4KxdYJ&N*eWO\"d>T^TeJ+dxOjOOOOOOOOOOOOLPd$V~dBVYN9Hbd/S4QV;,TcRDC7aLRDC7aL<HFvLRU+=@F8J;;)MpJ;;)Mpb\"J0Z%NW<aY'G?>2FTY#G5aJY^I9a{SpH*cmV^?1ZrOvP[eXPTO$eYWBdrdPduQAJ=L?deJ8N[eXN_cYTYVxJ$dwONOOOOOOOOOOOOLCdEUwd+VDK_HzdKQmN>;=UZGSCx`<GSCx`<C%E@AjUu=eF#Km;DJ2Km;DJ2_aI4]jNb<,WuG)>>FPY/G7aEYdI$aoY2JVb[Ym>dW0XjP2cMWkR|c[WKe/dHdRQSI)KrdtK:O'eZNtc=T7WuJJe\"O@OOOOOOOOOOOOLEdbTtczV8JfHpdQPaL1;~Vv@OF([#@OF([#OD>mBRUo=VF9L1;rHGL1;rHG[/GG`0Ne;`VjFd>7G#Y,Fza9YLH\"aV]DJm`W[5>GS__RO(_A^^Rg_qV-eEa%d^PLI3L}eGMhP#eXPVcZSWWRJxe*P`OOOOOOOOOOOOLSdlTUczVoK`H%d:O{J{<\"V<?%F'Xn?%F'XnQ8;gH3Tv=7F?KU;IJ1KU;IJ1Y1F+`jP-<&WiGG>\"FmWgFJaeWxGub>^&G7^J[X>4NC[pK:a,ZpQ7b7T-e]Zle%OvJWN)eRQ%PoeERHd*RTVkKqe#R~OOOOOOOOOOOOM!d^UAd(W7McGTd'P*L}:rS<DfB`]EDfB`]EL};LI7R6<QFZJQ:}PTJQ:}PTZlEU_@Q?=!YUI%=VFAUkEbb-V?IGcTZfA8Z@XS=kH?VvE/aDV>T'c|QoeYU<eQNMMZPAe4SYQ>dxTYdnP~U)M]ddUCOOOOOOOOOOOOM?dAVIc}W_OzG)cpPmT6:wP9`%E:YQ`%E:YQIC;qJ`MC;jH5I(>kZfI(>kZf_fE%YiR@>][wJ|=YE4T<E0b=U:KMdHU5;{U1S$>aC3N!>e]9QNKbe2P.eKP}eELGN]Rcd_T|QCdDVHe=O`S2O/d?VmOOOOOOOOOOOOMTd'W7cjWnQuFscbQJ]_>|P+d!IzULd!IzULHd;NOaHX;vKVH$FMb)H$FMb)a?CyTyS]@E^aK}=}D4S3DQb1T)L-dqO,:CP$Mv@m@EJb=AY4M7IVd_" },
  "call": { n: 6, dur: 0.8, loop: true, yaw: -24, still: 0.2, curl: 0.9, trav: 0.000,      // CMU 79_36 answering the phone: frames 286 to 350, the telephone held at the ear (the small movements of somebody on the telephone), a loop of the older picture's length (0.8 s)
    data: "OOh!OOe[NxOOP'eZO%MTeSOedlP{IlMMeKM`OOOOOOOOOOOOPid^I:eSMXP&QDeRP@Pi:~JUSh?6]=Sh?6]==4FHJ&I\"GMbzZu`PGeZu`PGeb4F1V:Q4:YR0R5;NI9N]H+d;LZb?ZNGf;pOxGf;pOxM(IjdcOPOze[OOh\"ONe[NuO^P*eZO&MWeSO`dqPyI}MSeLMgOOOOOOOOOOOOPvd]I7eRMTP<QGeRP:P_:~JRST?3]?ST?3]?=1FTIxHqGGbqZ|`RGsZ|`RGsb.F3VNQ0:XR0R8;OI8NZH/d<LWb@ZKGc;qOrGc;qOrLxIjdaOBOze[ONh!OKeZNrObP.eZO!M[eTOUdtPxJ+MWeMMlOOOOOOOOOOOOP|d[I5eQMQPNQJeRP:PX:}JUSF?2]ASF?2]A=1F]InH_GRbp[%`MGu[%`MGub)F0VWQ1:YR2R:;OI:NZH0d=LUbBZHG`;sOuG`;sOuLsIodbO>O~e[ONh!OHeZNqOeP.eZN~MYeTOSdvPzJ5MVeMMmOOOOOOOOOOOOP|dXI,eQMTPTQGeRP2P[:{J[SA?4]FSA?4]F=5FYIfHWGQbm[&`NGx[&`NGxb&F7VhQ3:YR4R9;MI=NYH2d=LVbAZIG`;sOuG`;sOuLqIpdbO<P!e[OOh\"OHe[NsO`P-eZO#M`eTOIdvQ&J6MLeLMpOOOOOOOOOOOOPqdZI/eRM]PNQ@eSP3P^:{J`SL?8]GSL?8]G=7FQImH[GWbq[$`MGr[$`MGrb(F6VaQ4:YR5R7;MI=NYH0d<LWb?ZLGa;rOtGa;rOtLuImdbO@O}e[OOh!ONe[NyOSP&eZO#M`eTONdpQ#I|MIeKMbOOOOOOOOOOOOPldYI+eSMZP/QCeSP,P`:zJcSg?6]=Sg?6]==3FIJ'HvGVbzZx`LGaZx`LGab2F3VCQ4:YR1R4;NI:N_H*d;L[b?ZMGg;pOxGg;pOxM%IldcOMO|e[" },
  "work": { n: 8, dur: 0.6, loop: true, yaw: 62, still: 0, curl: 0.45, trav: 0.000,      // CMU 79_85 typing on a laptop: frames 398 to 446 (the arms and hands of somebody typing, the head down on the screen), on the seated body of CMU 75_18 (high sit, frame 80); a loop of the older picture's length (0.6 s)
    data: "OOZHOOe[O'OOOvdpIlOOeHR$eZOdNcO<e[OrOOOOOOOOOOOOO}e/SyeZP2OeNjeHRBR'>~]#JjLjdiLtJ$dUP=9lQRO2>3aDRIMre|P?K+eiP(:7RpPiMDeHOO:CPAQZK:d~QZOOeHN6MDeHOO:CPAMDK:d~MDOOeHOOZHOOe[O'OOOvdpIlOOeHR$eZOeNdO<e[OuOOOOOOOOOOOOP#e,T)eZP,OdNqeERYQx?!]+JfLydfLqJ3dQOc:<Q<O<>0`mQmMxfAObK1f.Qw:wR'PiMDeHOO:CPAQZK:d~QZOOeHN6MDeHOO:CPAMDK:d~MDOOeHOOZHOOe[O'OOOvdpIlOOeHR$eYOjNOO7e[OsOOOOOOOOOOOOP$e+T,e[P.OVNpeER]Qr?!].J~M'dqM+J?d]O9:YQANI>C^^PrMoftNhK)f`Q\":ORvPiMDeHOO:CPAQZK:d~QZOOeHN6MDeHOO:CPAMDK:d~MDOOeHOOZHOOe[O'OOOvdpIlOOeHR$eYOjNGO6e[OoOOOOOOOOOOOOP)e+T+e[P%OUNzeERZQ|?!].KQM'e+M]J?dvNz:kQWL<?2ZVRDLzf!P9J4ekN;9lRxPiMDeHOO:CPAQZK:d~QZOOeHN6MDeHOO:CPAMDK:d~MDOOeHOOZHOOe[O'OOOvdpIlOOeHR$eXOmNCO3e[OlOOOOOOOOOOOOP$e*T0e[P(OMNxeER_R$?#]:KtM$e<N!J;e(N~:`QsJM@0X;UmL:cVSbIRcBMr:%Q)PiMDeHOO:CPAQZK:d~QZOOeHN6MDeHOO:CPAMDK:d~MDOOeHOOZHOOe[O'OOOvdpIlOOeHR$eXOvN@O+e[OmOOOOOOOOOOOOP#e+T.e[P+OKNueER_R'?$]?KrM&e;M}J>e'O.:RQ{JJ@5X(W8KEb;U-H^b'N8:^NyPiMDeHOO:CPAQZK:d~QZOOeHN6MDeHOO:CPAMDK:d~MDOOeHOOZHOOe[O'OOOvdpIlOOeHR$eYOpNNO0e[OlOOOOOOOOOOOOP#e\"TSe[P(OONye:SBR4?$]7KILve)MSJ0dsOW:9QgK{?=ZDUTL5ciSJIMcTO':PP1PiMDeHOO:CPAQZK:d~QZOOeHN6MDeHOO:CPAMDK:d~MDOOeHOOZHOOe[O'OOOvdpIlOOeHR$eZOeNbO;e[OnOOOOOOOOOOOOP$dzTme[P*OhNve2SjR-?\"]0JzLodqM'J(d^P%9|QUMZ>Q_:ScM6e/QWJMdyOP:8QyPiMDeHOO:CPAQZK:d~QZOOeHN6MDeHOO:CPAMDK:d~MDOOeH" },
  "listen": { n: 8, dur: 0.8, loop: true, yaw: -8, still: 0.25, curl: 0.2, trav: 0.000,      // the standing figure (CMU 13_42, as 'stand'), the head rocked from side to side by nine degrees (set in the builder: no capture of a person listening to music was found), a loop of the older picture's length (0.8 s)
    data: "OOgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOOOOOOOeZP4e[OOOOOOe[OnRb:YOOP~;5U9Ox;^Vh;ENII(L=:YOON!;5U9O';^VhdYNII(PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?OagKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOOOOOLQeGP4eHRMOOLQeHOnRb:YOOP~;5U9Ox;^Vh;ENII(L=:YOON!;5U9O';^VhdYNII(PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?OhgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOOOOOK=e3P4e4SbOOK=e4OnRb:YOOP~;5U9Ox;^Vh;ENII(L=:YOON!;5U9O';^VhdYNII(PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?OagKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOOOOOLQeGP4eHRMOOLQeHOnRb:YOOP~;5U9Ox;^Vh;ENII(L=:YOON!;5U9O';^VhdYNII(PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?OOgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOOOOOOOeZP4e[OOOOOOe[OnRb:YOOP~;5U9Ox;^Vh;ENII(L=:YOON!;5U9O';^VhdYNII(PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?O>gKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOOOOORMeGP4eHLQOORMeHOnRb:YOOP~;5U9Ox;^Vh;ENII(L=:YOON!;5U9O';^VhdYNII(PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?O7gKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOOOOOSbe3P4e4K=OOSbe4OnRb:YOOP~;5U9Ox;^Vh;ENII(L=:YOON!;5U9O';^VhdYNII(PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?O>gKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOOOOORMeGP4eHLQOORMeHOnRb:YOOP~;5U9Ox;^Vh;ENII(L=:YOON!;5U9O';^VhdYNII(PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?" },
  "raise": { n: 9, dur: 1.3, loop: false, yaw: -14, still: 1, curl: 0, trav: 0.000, once: [0.12,0.38],      // the standing figure (CMU 13_42), the right arm swung forward and up beside the head, the open hand above it, held (set in the builder: an arm's arc from hanging to straight up); played once, the end held (the older picture's length: 1.3 s)
    data: "OOgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOOOOOOOeZP4e[OOOOOOe[OnRb:YOOP~;5U9Ox;^Vh;ENII(LC:[PSN#:QQXOO;^VhdYNIUwPT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?OOgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOOcOOOOeZP4e[OOOOOOe[OnRb:YOOP~;5U9Ox;^Vh;ENII(LJ:uS(N);)TlOM;oW6d6NJV~PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?OOgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOP6OOOOeZP4e[OOOOOOe[OnRb:YOOP~;5U9Ox;^Vh;ENII(L[=&YFN5>p]KOC<dY2bjNRZ&PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?OOgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOP|OOOOeZP4e[OOOOOOe[OnRb:YOOP~;5U9Ox;^Vh;ENII(LpCDaYNBHndQNvC(aW_>Nd_SPT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?OOgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOQnOOOOeZP4e[OOOOOOe[OnRb:YOOP~;5U9Ox;^Vh;ENII(M(N\"eJNTV:dONab[Z?XYO\"cUPT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?OOgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOORaOOOOeZP4e[OOOOOOe[OnRb:YOOP~;5U9Ox;^Vh;ENII(MBY/c1Nh`g^!O!eHRIRaO?eEPT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?OOgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOSHOOOOeZP4e[OOOOOOe[OnRb:YOOP~;5U9Ox;^Vh;ENII(MYaS[rNwdgURO(eXPiOOOOe[PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?OOgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOSzOOOOeZP4e[OOOOOOe[OnRb:YOOP~;5U9Ox;^Vh;ENII(MidWUoO$eIRDO(eXPiOOOOe[PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?OOgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOT.OOOOeZP4e[OOOOOOe[OnRb:YOOP~;5U9Ox;^Vh;ENII(Mne4SAO(eIRDO(eXPiOOOOe[PT:EOdOm:DNrS+K8dtS+OOe?NJ:EOdO2:DNrKtK8dtKtOOe?" },
  "swim": { n: 20, dur: 1.2, loop: true, yaw: 50, still: 0.04, curl: 0.15, trav: 0.000, lie: true, pitch: 14,      // CMU 125_06 Free Style (the front crawl swum lying on a bench: the arms' whole stroke, one after the other, the legs' flutter): frames 3116 to 3335, one cycle of both arms (1.83 s), played 1.5 times faster as a loop of 1.2 s; the last quarter blended back to the start
    data: "OO^ZIke/KBQ1O^X'cmSxYUbT_KCIX<Ox]<a>OOOOOOOOOOOOOO`b^(e[OOOOOOe1SuYpI@arNGKPe6NGKPe6P`:iKVIMZ*>7D`F?`0D`F?`0Oa=4DwLACv>+O7MY:KPm:INDPi:VLoN@?yA7O3M2:ONq:LMSN{;3U@OR^IIhe+K/Q1OtXacRSJYabX^CBGXYP:]+aIOOOOOOOOOOOOOO`b^(e[OOOOOOe1Su[+Fq_uP,H9dAP,H9dARs;xH9G(Z[?[J,K!dIJ,K!dIIt<!IWKlC.>hO/Ld:TOr:COaOq:ENUN7?vA;OeMU:KN':eKuMy:iS;OD^:Iie1K:PYPLY,c<SUYSb^^zBTWuPM[gabOOOOOOOOOOOOOO`b^(e[OOOOOOe1Su_&E}[ON}Dcb_N}Dcb_X'>kEmDs]ZBjN8L5e@N8L5e@DP=jL%J[BG?[PCJ|:sMC<pY3MW:eRpN<@L@bOsN[:EMC;1J+M/:PPAO3^6Ike>KqOwPrYJc)T2Y`bH`nCwV=Q#[ga_OOOOOOOOOOOOOO`b^(e[OOOOOOe1Su`TEKXtLC=jZWLC=jZWVzD)?ABA_pI>QSJ|e$QSJ|e$C:>KLzK.B1?aO_K2:mOC;=UgOF:SR3NA@E@iOIO*:CMp;bH>Mg:MN9N|^/IdeCL5O(QHYBc)TgYhb5cJFeRhR([LaeOOOOOOOOOOOOOO`b^(e[OOOOOOe1Su`DBeU)H.;zRgH.;zRgSLJ_;>@f_2S'U0JTd8U0JTd8E8=)MoK^BK??N<La:WOp:CO5Ot:CO{N<?`ASNeM/:PMm:qK=Mz:OQ?Nc^%Ibe?L+N<R1YEb}TJYObJdjIYNfSGZca~OOOOOOOOOOOOOO`b^(e[OOOOOOe1Su`CAYPlBd>cPMBd>cPMM)P,:PBRXo^@V_KXc~V_KXc~H3;cN5K:BT?@MiM8:TN0:LMqNA:FP1N/?9B%MeKB:qK9:lP&K[;MU#NK^(Ige>LEMXR[Y$c)SBYObddzM)JeTnZ<asOOOOOOOOOOOOOO`b^(e[OOOOOOe1SuagCLMGA5@qTmA5@qTmHuN^;IHiQ;dKU6LydaU6LydaJb:{N9K)Ah@&M:M):ZMs:IO%N7:[RWNj?VAZKhKC;+K$;eUNKD<5W,N7^>I{e9LZLlS0X0cHS!Y<bucLR^FeU=[&a4OOOOOOOOOOOOOO`b^(e[OOOOOOe1SucbJzGwDJAAZ]DJAAZ]EdI7=pJxNZe+W+K'cdW+K'cdR.;>IlKQA[@&LCMa:aME:]LqMw:KP^N<@B@lK8Kk;-Iu<$UQIR;bSmN&^^J+e1LsK}SfW'ciS(YAbq`oVLD$UV[h`YOOOOOOOOOOOOOO`b^(e[OOOOOOe1Su^}RA@CKy@y_FKy@y_FC1DjB(K2MGe(WbJzcIWbJzcISa;pH|KrAv?eKaO4:dLs;6J,MN:RMhN0@l@CJ&K];JLp<oY%KB;<T,Mx^mJ6e*M;K>T2VlciS>YEbj^BXWBEUo]=`'OOOOOOOOOOOOOO`b^(e[OOOOOOe1SuY&V4=tRxAM_xRxAM_xD&A/E!JHL#ddV|JAcWV|JAcWTY<<H>KXAQ@-KwNY:bJv;nI<KE:tM<M(At?PJZLs;*HV<.TIGy;sQ]Mo^nJ1e-N&K.T(W=cXSVY@bg]BY;AtV-];_{OOOOOOOOOOOOOO`b^(e[OOOOOOe1SuW1WJ=MVADda@VADda@HN=RFpI;JVd)TGFrc/TGFrc/N=<6FuK+A$@eKrL~:oM^:OMzNW:hSHKtBR?4M0O;:OEd=DJeEc=#LHMe^aIye/NdK)SrWlcJSXY=bi]UYFB/V(]!`5OOOOOOOOOOOOOO`b^(e[OOOOOOe1SuYJWl>lSqH)cmSqH)cmOR;iGxG3HLbZQYC)aMQYC)aMFs?HDoK.AE@DK/N/:rL_:xKVMd:NPzLYAW?qMcND:LH><DJ&HS=bFOMj^PIne:NuKaS4XJc;S9Y?bn_,XOC1Ug[R`dOOOOOOOOOOOOOO`b^(e[OOOOOOe1Su^QXyBmN\"ISdeN\"ISdeU!;nJ*CiG=`%PC>N]!PC>N]!FBCw@CK$B^?>J{O[:qLI;RI;M=:UMZNE@6@xL2Kr:zJ3;'P^JI;2RHMy^FIeeFNkLJRSY)c)RRYub]aDVYDzTv[Aa.OOOOOOOOOOOOOO`b^(e[OOOOOOe1Sub<Y`JBI~K'dGI~K'dGU?;EL]AbD?ZzR=;SUqR=;SUqJ\"HY<;K8B4?ZK1O_:mKW<4GmKy;HIyN[@8@uLDL.:rIu;,OYI};,PMN-^6I_eNNuM&QyY;c'RdZ9bFc1TkG.Su[$a^OOOOOOOOOOOOOO`b^(e[OOOOOOe1SubxW+VOJ|N@e+J|N@e+Sc:kO8@kAiU{V{;pQWV{;pQWO4M0:OK{@MA&KdM$:qMH:dL=N0:IP[NPAH?iMGMr:RJA;CK[JC;9L2NC^.IaeRNjMXQQYCc(S^YrbJdTR'IBSDZnawOOOOOOOOOOOOOO`b^(e[OOOOOOe1Su_2PG_`MrPZeSMrPZeSTX;$P}?0BDR;Y9<hOwY9<hOwSVQ/:oL(?rAcMeK4:tPF:HPlPa:rSyOXB!?7MKMw:QJ;;\"O9JC;\"P=Nd^>IbeUN*NMQ$XwcBTCYTbJeGL~MnR=Ztb(OOOOOOOOOOOOOO`b^(e[OOOOOOe1SuZAM8bONEOueXNEOueXS$:`P(<KFAO6Xr<jRGXr<jRGU1O6;.KU@`@{OdK%:pP1;%TkP2:pSxO8A`?QN;N$:KK}:kM.L0:eQPO$^XIneSMZO7POX,ciTkY[b;dhIiQ@Q>[>axOOOOOOOOOOOOOO`b^(e[OOOOOOe1SuY0L^c(M&O9eNM&O9eNOF:CO7;SM[HmT]<yX4T]<yX4ZsJ[>CKsAO@)P-K,:oPB;mW-PR:YRMO*Aw?=NqO;:DNy;8INO+:CO3O<^hIzePM8P%OuX%cnU6YNb5d.H^S4Pl]4a@OOOOOOOOOOOOOO`b^(e[OOOOOOe1SuXDL\"cBM*NgeNM*NgeNO9:DNc?jTbBCMA>?[[MA>?[[Z)D!A:KhBc?*PpK6:pNH=<Z1O#:LQUO*A`?RO*Pl:GOy<:FfP-:MMJOG^eIteBLBPrONWwctTWYKbIahEVVXP1]Ta*OOOOOOOOOOOOOO`b^(e[OOOOOOe1SuY@K4bcMoMVeMMoMVeMP,:KMYF?Xl>tFSB%^+FSB%^+W*?$D^L8CI>KP8LY:VPc:tS~Pw:KN.N|@p@;N{O6:CQ(;^HGQH:KOH" },
  "sitfloor": { n: 2, dur: 1, loop: false, yaw: -24, still: 0, curl: 0.6, trav: 0.000, lie: true,      // set in the builder from the standing figure (CMU 13_42): sitting on the floor, legs out and apart, arms out
    data: "OOgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOOOOOOOeZP4e[OOOOOOe[On][AQXEZ'QZbaUvZ1aVI.K9d4BCAQXEDxQZbaI)Z1aVUqK9d4[/N6b(W*Mmd.UvaVZ1UxbdX'CpN6b(GuMmd.I)aVZ1I'bdX'OOgKOOe[OOOOOOe[P*OOe[O}e[OOOOOOeYPNOOOOOOOOOOOOOOeZP4e[OOOOOOe[On][AQXEZ'QZbaUvZ1aVI.K9d4BCAQXEDxQZbaI)Z1aVUqK9d4[/N6b(W*Mmd.UvaVZ1UxbdX'CpN6b(GuMmd.I)aVZ1I'bdX'" }
};
const DEC = {};
function clipOf(name){
  if (DEC[name]) return DEC[name];
  const C = CLIPS[name], s = C.data, n = C.n, keys = [], code = c => { c = c.charCodeAt(0); return c - 33 - (c > 92 ? 1 : 0); };
  for (let k = 0, p = 0; k < n; k++){ const a = new Float32Array(81); for (let i = 0; i < 81; i++, p += 2) a[i] = (code(s[p]) * 93 + code(s[p + 1])) / 8648 * 4.4 - 2.2; keys.push(a); }
  return DEC[name] = Object.assign({}, C, { keys });
}
/* the pose at phase t (0..1) of a clip: a smooth curve through its keys (Catmull-Rom), round the loop or held at the ends */
function keyAt(C, t){
  const n = C.n, x = C.loop ? (((t % 1) + 1) % 1) * n : Math.max(0, Math.min(1, t)) * (n - 1), i = Math.floor(x), u = x - i, K = C.keys;
  const ix = j => C.loop ? ((j % n) + n) % n : Math.max(0, Math.min(n - 1, j)), a = K[ix(i - 1)], b = K[ix(i)], c = K[ix(i + 1)], d = K[ix(i + 2)], o = new Float32Array(81), u2 = u * u, u3 = u2 * u;
  for (let j = 0; j < 81; j++) o[j] = 0.5 * (2 * b[j] + (c[j] - a[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * u2 + (3 * b[j] - a[j] - 3 * c[j] + d[j]) * u3);
  return o;
}
/* the skeleton posed: every joint, in body heights, the mover's own frame (x its left, y up, z the way it faces) */
function skeleton(k, B){
  const v = i => nrm([k[i], k[i + 1], k[i + 2]]), LL = B.thigh + B.shin, J = {};
  J.root = [k[0] * LL, k[1] * LL, k[2] * LL];
  const Bp = J.Bp = basis(v(3), v(6)), Bc = J.Bc = basis(v(12), v(15)), Bh = J.Bh = basis(v(27), v(30));
  J.chest = add(J.root, mul(v(9), B.spine));
  J.nb = at(J.chest, Bc, [0, B.nb, 0]); J.skull = add(J.nb, mul(v(24), B.neck)); J.head = at(J.skull, Bh, [0, B.hh * 0.74, B.hh * 0.1]);
  for (const s of [0, 1]){ const sg = s ? -1 : 1, a = 33 + s * 12, l = 57 + s * 12, d = 18 + s * 3, S = s ? "R" : "L";
    const sh = J["sh" + S] = at(J.chest, Bc, [(sg + k[d]) * B.sw, B.sy + k[d + 1] * B.sw, B.sz + k[d + 2] * B.sw]);
    const el = J["el" + S] = add(sh, mul(v(a), B.ua)), wr = J["wr" + S] = add(el, mul(v(a + 3), B.fa));
    J["hd" + S] = v(a + 6); J["pn" + S] = v(a + 9); J["ud" + S] = v(a); J["fd" + S] = v(a + 3);
    const hip = J["hip" + S] = at(J.root, Bp, [sg * B.hw, 0, 0]), kn = J["kn" + S] = add(hip, mul(v(l), B.thigh)), an = J["an" + S] = add(kn, mul(v(l + 3), B.shin));
    /* the foot: f from the ankle to the ball; the sole lies 12 degrees above it (the ankle stands higher than the ball); m: out of the sole, upward */
    const f = v(l + 6), up = mul(v(l + 3), -1), n0 = nrm(sub(up, mul(f, dot(up, f)))), c12 = 0.978, s12 = 0.208;
    const sole = add(mul(f, c12), mul(n0, s12)), m = sub(mul(n0, c12), mul(f, s12)), ball = add(an, mul(f, B.foot));
    J["ft" + S] = { an, ball, sole, m, heel: add(add(an, mul(sole, -0.032)), mul(m, -(B.ankle - 0.026))), toe: add(ball, mul(sole, B.toe)) }; }
  return J;
}
/* how far the lowest point of the feet is under the hips' zero in this key (the floor is put under the lowest key of the clip) */
function lowest(J){ let y = 1e9; for (const S of ["L", "R"]){ const F = J["ft" + S]; y = Math.min(y, F.heel[1] - 0.033, F.ball[1] - 0.034, F.toe[1] - 0.027); } return y; }
function floorOf(C, B){
  if (C["floor" + B.key] != null) return C["floor" + B.key];
  let y = 1e9; for (let i = 0; i < C.n; i++) y = Math.min(y, lowest(skeleton(C.keys[i], B)));
  return C["floor" + B.key] = y;
}

/* ---------- the camera ---------- */
function camera(yaw, pitch, scale, ox, oy){
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const lin = p => { const d = -p[0] * sy + p[2] * cy; return [(p[0] * cy + p[2] * sy) * scale, -(p[1] * cp - d * sp) * scale, d * cp + p[1] * sp]; };       // screen x, screen y (down), depth (toward the viewer)
  return { lin, pt: p => { const q = lin(p); return [ox + q[0], oy + q[1], q[2]]; }, view: [-sy * cp, sp, cy * cp], scale };
}

/* ---------- shapes ---------- */
/* a limb: two circles and the lines that touch both */
function capsule(ax, ay, r1, bx, by, r2){
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
  if (L <= Math.abs(r1 - r2) + 0.01){ const big = r1 >= r2, x = big ? ax : bx, y = big ? ay : by, r = Math.max(r1, r2, 0.01); return `M${f1(x - r)} ${f1(y)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0Z`; }
  const ux = dx / L, uy = dy / L, s = (r1 - r2) / L, c = Math.sqrt(1 - s * s), nx = -uy, ny = ux;
  const px = s * ux + c * nx, py = s * uy + c * ny, qx = s * ux - c * nx, qy = s * uy - c * ny;
  return `M${f1(ax + r1 * px)} ${f1(ay + r1 * py)}L${f1(bx + r2 * px)} ${f1(by + r2 * py)}A${f1(r2)} ${f1(r2)} 0 ${s < 0 ? 1 : 0} 0 ${f1(bx + r2 * qx)} ${f1(by + r2 * qy)}L${f1(ax + r1 * qx)} ${f1(ay + r1 * qy)}A${f1(r1)} ${f1(r1)} 0 ${s > 0 ? 1 : 0} 0 ${f1(ax + r1 * px)} ${f1(ay + r1 * py)}Z`;
}
/* an ellipsoid seen by the camera is an ellipse: centre c (screen), axes A (three vectors already through camera.lin) -> {c, a, b, th} */
function ellipse(c, A){
  let sxx = 0, sxy = 0, syy = 0; for (const a of A){ sxx += a[0] * a[0]; sxy += a[0] * a[1]; syy += a[1] * a[1]; }
  const m = (sxx + syy) / 2, d = Math.sqrt(((sxx - syy) / 2) ** 2 + sxy * sxy), th = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  return { c, a: Math.sqrt(m + d), b: Math.sqrt(Math.max(0, m - d)), th };
}
const ellPts = (E, n, grow, dx, dy, out) => { const ct = Math.cos(E.th), st = Math.sin(E.th), a = Math.max(0.01, E.a + grow), b = Math.max(0.01, E.b + grow);
  for (let i = 0; i < n; i++){ const t = i / n * 2 * Math.PI, x = a * Math.cos(t), y = b * Math.sin(t); out.push([E.c[0] + dx + x * ct - y * st, E.c[1] + dy + x * st + y * ct]); } return out; };
const ellPath = (E, grow, dx, dy) => { const a = Math.max(0.01, E.a + grow), b = Math.max(0.01, E.b + grow), ct = Math.cos(E.th) * a, st = Math.sin(E.th) * a, x = E.c[0] + dx, y = E.c[1] + dy, d = f1(E.th * 180 / Math.PI);
  return `M${f1(x - ct)} ${f1(y - st)}A${f1(a)} ${f1(b)} ${d} 1 0 ${f1(x + ct)} ${f1(y + st)}A${f1(a)} ${f1(b)} ${d} 1 0 ${f1(x - ct)} ${f1(y - st)}Z`; };
const disc = (c, r) => ({ c, a: r, b: r, th: 0 });
/* the outline round a set of points (convex hull) */
function hull(P){
  P.sort((p, q) => p[0] - q[0] || p[1] - q[1]); const n = P.length, H = []; if (n < 3) return P;
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  for (let i = 0; i < n; i++){ while (H.length >= 2 && cr(H[H.length - 2], H[H.length - 1], P[i]) <= 0) H.pop(); H.push(P[i]); }
  const t = H.length + 1; for (let i = n - 2; i >= 0; i--){ while (H.length >= t && cr(H[H.length - 2], H[H.length - 1], P[i]) <= 0) H.pop(); H.push(P[i]); }
  H.pop(); return H;
}
const poly = P => { let s = ""; for (let i = 0; i < P.length; i++) s += (i ? "L" : "M") + f1(P[i][0]) + " " + f1(P[i][1]); return s + "Z"; };
const hullOf = (Es, grow, dx, dy) => { const P = []; for (const E of Es) ellPts(E, E.n || 22, grow, dx, dy, P); return poly(hull(P)); };

/* ---------- colours ---------- */
const hex = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16)), toHex = c => "#" + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mixc = (a, b, t) => { const A = hex(a), B2 = hex(b); return toHex(A.map((v, i) => v + (B2[i] - v) * t)); };
const darker = (h, t) => mixc(h, "#1d2233", t);                       // shade leans to a cool dark, as shade does in daylight
/* a material: lit and shade tone, near the viewer and far from it */
const material = (lit, shade) => ({ n: [lit, shade, mixc(lit, "#ffffff", 0.42)], f: [mixc(lit, shade, 0.62), darker(shade, 0.2)] });
const LIGHT = [-0.6, -0.8], GY = 172;                                // ... and the ground of a picture is at y = 172 of its 160 x 190 box (the design language, 9.1)                                           // the light comes from the upper left of the picture

/* ---------- the head: an ellipsoid skull and a jaw; hair, ears and face are placed on its surface and projected ---------- */
/* the hair: where it ends, as the height on the skull (degrees up from its equator) at each angle round the head (0 = the face,
   180 = the back); v: how thick it lies */
const SHORT = [[-180, -40], [-140, -36], [-112, -22], [-97, 0], [-86, -4], [-75, 4], [-62, 20], [-40, 30], [-12, 35], [18, 41], [45, 36], [62, 22], [75, 4], [86, -4], [97, 0], [112, -22], [140, -36], [180, -40]];
const TIGHT = [[-180, -30], [-140, -26], [-112, -14], [-97, 4], [-86, 0], [-75, 8], [-62, 24], [-36, 40], [0, 44], [36, 40], [62, 24], [75, 8], [86, 0], [97, 4], [112, -14], [140, -26], [180, -30]];
const DOWN = [[-180, -52], [-112, -52], [-84, -46], [-68, -20], [-54, 16], [-30, 38], [0, 45], [30, 38], [54, 16], [68, -20], [84, -46], [112, -52], [180, -52]];       // hair that comes down over the ears: a parting in the middle
const SIDE = [[-180, -52], [-112, -52], [-84, -46], [-68, -20], [-56, 12], [-36, 30], [-10, 34], [20, 42], [46, 30], [62, 4], [74, -30], [88, -48], [112, -52], [180, -52]];   // ... a parting at the side
const FRINGE = [[-180, -50], [-112, -50], [-84, -44], [-70, -18], [-58, 6], [-34, 16], [0, 19], [34, 16], [58, 6], [70, -18], [84, -44], [112, -50], [180, -50]];          // ... a fringe on the forehead
/* a style: at = the edge of the hair on the skull (see lineAt); v, top, quiff = how proud of the skull it lies; mass = hair that hangs
   (a = where it hangs from, in half head-heights in the head's frame; drop = how far below that its middle is; r = its half-sizes: across,
   down, front to back); tail = a ponytail; ears: false = the hair covers them */
const STYLE = {
  short: { v: 0.09, top: 0.07, quiff: 0.07, at: SHORT },
  side:  { v: 0.1, top: 0.1, quiff: 0.14, at: SHORT.map(q => [-q[0], q[1]]).reverse(), flip: -1 },
  crop:  { v: 0.05, top: 0.02, quiff: 0, at: TIGHT },
  kid:   { v: 0.13, top: 0.12, quiff: 0.2, at: SHORT },
  pony:  { v: 0.07, top: 0.05, quiff: 0.04, ears: false, at: [[-180, -40], [-140, -36], [-112, -34], [-97, -32], [-86, -30], [-75, -4], [-62, 22], [-36, 38], [0, 42], [36, 38], [62, 22], [75, -4], [86, -30], [97, -32], [112, -34], [140, -36], [180, -40]], tail: { a: [0.36, 0.5, -0.8], len: 1.4, r: [0.3, 0.14] },
    mass: [{ a: [0.78, 0.3, 0.26], drop: 0.4, r: [0.1, 0.4, 0.12], fwd: 1, lock: [[-0.02, 0, 0.08, 0.08], [0.04, 0.4, 0.07, 0.14], [0.02, 0.8, 0.05, 0.08], [-0.04, 1.0, 0.025, 0.025]] }, { a: [-0.78, 0.3, 0.26], drop: 0.4, r: [0.1, 0.4, 0.12], fwd: 1, lock: [[0.02, 0, 0.08, 0.08], [-0.04, 0.4, 0.07, 0.14], [-0.02, 0.8, 0.05, 0.08], [0.04, 1.0, 0.025, 0.025]] }] },      // (and a lock left loose before each ear, down to the jaw)      // swept back over the ears; tied high at the back and a little to one side, so it shows beside the head from the front
  long:  { v: 0.09, top: 0.05, quiff: 0, at: DOWN, ears: false, mass: [{ a: [0, -0.1, -0.3], drop: 0.98, r: [0.9, 1.32, 0.5] }, { a: [0.76, -0.2, -0.08], drop: 0.62, r: [0.19, 0.9, 0.27] }, { a: [-0.76, -0.2, -0.08], drop: 0.62, r: [0.19, 0.9, 0.27] }] },
  loose: { v: 0.11, top: 0.06, quiff: 0.05, at: SIDE, ears: false, mass: [{ a: [0, -0.1, -0.3], drop: 0.6, r: [0.97, 0.94, 0.52] }, { a: [0.8, 0.1, -0.06], drop: 0.6, r: [0.2, 0.7, 0.3], fwd: 1, lock: [[0, 0, 0.14, 0.1], [0.03, 0.6, 0.16, 0.2], [0.07, 1.14, 0.2, 0.07]] },
    { a: [-0.8, 0.1, -0.06], drop: 0.6, r: [0.2, 0.7, 0.3], fwd: 1, lock: [[0, 0, 0.14, 0.1], [-0.03, 0.6, 0.16, 0.2], [-0.07, 1.14, 0.2, 0.07]] }] },      // to the shoulder, falling past the ears as one curtain beside the face (the learner as a woman: framing the face, read as a woman from the front at 80 px)
  wavy:  { v: 0.12, top: 0.06, quiff: 0.04, at: DOWN, ears: false, mass: [{ a: [0, -0.1, -0.3], drop: 0.8, r: [1.02, 1.12, 0.56] }, { a: [0.8, -0.2, -0.08], drop: 0.55, r: [0.24, 0.82, 0.3] }, { a: [-0.8, -0.2, -0.08], drop: 0.55, r: [0.24, 0.82, 0.3] }] },
  sylvie: { v: 0.1, top: 0.06, quiff: 0.06, at: [[-180, -52], [-112, -52], [-84, -46], [-68, -22], [-56, 6], [-36, 22], [-10, 28], [20, 38], [46, 26], [62, 2], [74, -30], [88, -48], [112, -52], [180, -52]], ears: false,      // long and straight, a side parting, the forehead framed (Sylvie)
    mass: [{ a: [0, -0.1, -0.3], drop: 1.0, r: [0.9, 1.34, 0.5] }, { a: [0.76, -0.2, -0.06], drop: 0.66, r: [0.19, 0.92, 0.27] }, { a: [-0.76, -0.2, -0.06], drop: 0.66, r: [0.19, 0.92, 0.27] }] },
  tucked: { v: 0.1, top: 0.06, quiff: 0.05, at: [[-180, -52], [-128, -50], [-108, -34], [-97, -2], [-86, -6], [-75, 4], [-60, 16], [-36, 30], [-10, 34], [20, 42], [46, 30], [62, 14], [75, 4], [86, -6], [97, -2], [108, -34], [128, -50], [180, -52]],      // to the shoulder, behind the ears (the teacher on the stage)
    mass: [{ a: [0, -0.1, -0.36], drop: 0.6, r: [0.97, 0.98, 0.5] }] },
  pixie: { v: 0.12, top: 0.08, quiff: 0.12, ears: false, at: [[-180, -44], [-140, -40], [-112, -36], [-97, -26], [-86, -20], [-75, 0], [-62, 16], [-40, 22], [-12, 26], [18, 34], [45, 30], [62, 16], [75, 0], [86, -20], [97, -26], [112, -36], [140, -40], [180, -44]],      // a woman's short cut: soft and full, over the tops of the ears, a little longer at the nape, a wisp before each ear
    mass: [{ a: [0, -0.2, -0.5], drop: 0.12, r: [0.62, 0.36, 0.36] }, { a: [0.8, 0.14, 0.24], drop: 0.3, r: [0.1, 0.3, 0.12], fwd: 1, lock: [[-0.02, 0, 0.09, 0.08], [0.02, 0.32, 0.07, 0.12], [-0.02, 0.56, 0.035, 0.035]] }, { a: [-0.8, 0.14, 0.24], drop: 0.3, r: [0.1, 0.3, 0.12], fwd: 1, lock: [[0.02, 0, 0.09, 0.08], [-0.02, 0.32, 0.07, 0.12], [0.02, 0.56, 0.035, 0.035]] }] },
  bob:   { v: 0.11, top: 0.05, quiff: 0, at: FRINGE, ears: false, mass: [{ a: [0, -0.1, -0.28], drop: 0.36, r: [0.95, 0.74, 0.6] }, { a: [0.82, 0.1, -0.02], drop: 0.4, r: [0.2, 0.5, 0.3], fwd: 1, lock: [[0, 0, 0.13, 0.1], [-0.02, 0.5, 0.14, 0.16], [-0.12, 0.92, 0.13, 0.07]] },
    { a: [-0.82, 0.1, -0.02], drop: 0.4, r: [0.2, 0.5, 0.3], fwd: 1, lock: [[0, 0, 0.13, 0.1], [0.02, 0.5, 0.14, 0.16], [0.12, 0.92, 0.13, 0.07]] }] },      // to the jaw, straight, its ends a little in: one curtain from the crown (never ear-muffs)
  scarf: { v: 0.07, top: 0.03, quiff: 0, cloth: true, ears: false, at: [[-180, -62], [-100, -62], [-72, -50], [-58, -12], [-46, 20], [-24, 34], [0, 38], [24, 34], [46, 20], [58, -12], [72, -50], [100, -62], [180, -62]],
    mass: [{ a: [0, -0.2, -0.3], drop: 0.72, r: [0.92, 0.98, 0.52] }, { a: [0, -0.88, 0.06], drop: 0.42, r: [0.84, 0.46, 0.78] }] },
  bald:  { v: 0.02, top: 0, quiff: 0, at: [[-180, -30], [-120, -24], [-97, 6], [-80, 10], [-60, 40], [0, 88], [60, 40], [80, 10], [97, 6], [120, -24], [180, -30]] }
};
STYLE.pixieS = Object.assign({}, STYLE.pixie, { at: STYLE.pixie.at.map(q => [-q[0], q[1]]).reverse(), flip: -1 });      // (the same, parted on the other side: the avatar's "side-parted" on a woman)
const HAIR_OF = { youF: "loose", you: "short", paul: "short", sidepart: "side", crew: "crop", old: "crop", curly: "short", kshort: "kid", kcurly: "kid", kcrew: "crop", pony: "pony", kpony: "pony", bun: "pony", marie: "tucked", longM: "loose",
  julie: "sylvie", long: "long", xlong: "long", klong: "long", wavy: "wavy", curlyF: "wavy", bob: "bob", kbob: "bob", kmid: "bob", kpig: "bob", pig: "bob", bald: "bald" };
/* the edge of the hair at an angle round the head: a smooth curve through the points (Catmull-Rom) */
function lineAt(L, az){ const a = L.at, n = a.length; let i = 1; while (i < n - 1 && az > a[i][0]) i++;
  const p0 = a[Math.max(0, i - 2)], p1 = a[i - 1], p2 = a[i], p3 = a[Math.min(n - 1, i + 1)], u = Math.max(0, Math.min(1, (az - p1[0]) / (p2[0] - p1[0]))), m1 = (p2[1] - p0[1]) / Math.max(1, p2[0] - p0[0]) * (p2[0] - p1[0]), m2 = (p3[1] - p1[1]) / Math.max(1, p3[0] - p1[0]) * (p2[0] - p1[0]), u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p1[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2[1] + (u3 - u2) * m2; }
function head(J, B, cam, c, out, zb){
  const hh = B.hh, Bh = J.Bh, o = J.head, S = cam.scale, sk = c.skinM, hr = c.hairM, px = hh * S, big = px >= 30;
  const ax = (r) => [cam.lin(mul(Bh.x, r[0] * hh)), cam.lin(mul(Bh.y, r[1] * hh)), cam.lin(mul(Bh.z, r[2] * hh))];
  const FS = [[0.72, 0.69, -0.31], [0.77, 0.66, -0.28], [0.68, 0.72, -0.34], [0.79, 0.7, -0.3], [0.63, 0.7, -0.31]][c.face || 0];          // the face: oval, round, long, square, narrow (the jaw's width, its depth, how low it hangs)
  const crC = [0, 0.12, -0.04], crR = [0.84, 0.88, 0.9], cr0 = at(o, Bh, mul(crC, hh)), jw0 = at(o, Bh, [0, FS[2] * hh, 0.13 * hh]), jwR = [FS[0], FS[1], 0.66];
  const Ecr = ellipse(cam.pt(cr0), ax(crR)), Ejw = ellipse(cam.pt(jw0), ax(jwR)); Ecr.n = 44; Ejw.n = 36;
  const z = cam.pt(o)[2] + zb, e = 0.05 * px, rim = Math.min(0.9, 0.035 * px);
  const vl = [dot(Bh.x, cam.view), dot(Bh.y, cam.view), dot(Bh.z, cam.view)];                    // the way to the viewer, in the head's own frame
  /* the hair lies on the skull, proud of it (v), prouder on top and at the front (the quiff), thinning to nothing at its edge behind the
     ears and at the nape. It is laid on as small patches from its edge to the crown; each patch is cut where the surface turns away from
     the viewer, so the outline of the hair is the outline of the head it lies on, from any side */
  const WD = c.wd || null, L0 = STYLE[WD && WD.wig ? WD.wig : c.headwear === "scarf" ? "scarf" : HAIR_OF[c.style] || c.style] || STYLE.short;
  const L = WD && WD.hat && !WD.wig ? Object.assign({}, L0, { top: L0.top * 0.3, quiff: L0.quiff * 0.2, v: Math.min(L0.v, 0.085) }) : L0;      // (a hat presses the hair down: the wardrobe)
  const unit = (az, lat) => { const a = az * Math.PI / 180, l = lat * Math.PI / 180; return [Math.cos(l) * Math.sin(a), Math.sin(l), Math.cos(l) * Math.cos(a)]; };
  const patches = (c0, R, a0, a1, N, M, lo, hi, grow) => { const w = nrm([vl[0] / R[0], vl[1] / R[1], vl[2] / R[2]]), col = []; let d = "";
    const put = v => { const u = v.u || v, g = grow(u, v.t == null ? 1 : v.t); return cam.pt(at(c0, Bh, [u[0] * R[0] * g * hh, u[1] * R[1] * g * hh, u[2] * R[2] * g * hh])); };
    for (let i = 0; i <= N; i++){ const az = a0 + i * (a1 - a0) / N, l0 = lo(az), l1 = hi(az), c1 = []; for (let j = 0; j <= M; j++) c1.push({ u: unit(az, l0 + (l1 - l0) * j / M), t: j / M }); col.push(c1); }
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++){ const Q = [col[i][j], col[i + 1][j], col[i + 1][j + 1], col[i][j + 1]], D = Q.map(v => dot(v.u, w));
      if (D.every(x => x < 0)) continue;
      const P = []; for (let q = 0; q < 4; q++){ const r = (q + 1) % 4; if (D[q] >= 0) P.push(put(Q[q]));
        if ((D[q] < 0) !== (D[r] < 0)){ const t = D[q] / (D[q] - D[r]); P.push(put({ u: nrm(add(mul(Q[q].u, 1 - t), mul(Q[r].u, t))), t: Q[q].t * (1 - t) + Q[r].t * t })); } }
      let A = 0; for (let q = 0; q < P.length; q++){ const r = P[(q + 1) % P.length]; A += P[q][0] * r[1] - r[0] * P[q][1]; }
      if (Math.abs(A) < 0.02) continue; if (A < 0) P.reverse(); d += poly(P); }
    return d; };
  const fl = L.flip || 1, sm = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  const hair = patches(cr0, crR, -180, 180, 44, 6, az => lineAt(L, az), () => 90, (u, t) => { const up = Math.max(0, u[1]), back = Math.max(L.mass ? 0 : sm((0.25 - u[2]) / 0.5), big ? sm((Math.abs(u[0]) - 0.5) / 0.3) : 0);      // (large: thin at its edge at the temples too, so that it meets the head there)
    return 1 + (L.v * (1 - back * (1 - sm(t * 2.6))) + L.top * up * up + L.quiff * Math.max(0, u[2]) * up * (1 + 0.5 * fl * u[0])); });
  /* a beard: the same, on the jaw, from under the nose down and back to the ears */
  const BEARD = { at: [[-112, 28], [-100, 20], [-85, 6], [-65, -6], [-45, -14], [-26, -16], [-14, -9], [0, -7], [14, -9], [26, -16], [45, -14], [65, -6], [85, 6], [100, 20], [112, 28]] };      // a trimmed full beard: the moustache, the cheek line rising from the corners of the mouth to the sideburns
  const beard = c.beard ? patches(jw0, jwR, -112, 112, 28, 4, () => -90, az => lineAt(BEARD, az), (u, t) => 1.035 + 0.025 * Math.min(1, t * 3)) : "";
  /* hair that hangs: each mass hangs straight down from the head (it keeps to the upright when the head tilts), turned with the head */
  const hx = nrm([Bh.x[0], 0, Bh.x[2]]), hz = [-hx[2], 0, hx[0]], extra = [];
  (L.mass || []).forEach((m, i) => { const top = at(o, Bh, mul(m.a, hh)), cen = [top[0], top[1] - m.drop * hh, top[2]], q = cam.pt(cen), E0 = ellipse(q, [cam.lin(mul(hx, m.r[0] * hh)), cam.lin([0, m.r[1] * hh, 0]), cam.lin(mul(hz, m.r[2] * hh))]), me = 0.07 * px;
    /* a lock (m.lock: [[across, down, half-width, half-height], ...] from where it hangs, across in the head's own sideways direction, down
       straight down): the outline round those ellipses, so hair can fall as one curtain beside the face and end bluntly */
    let E = E0; if (m.lock){ E = { lock: m.lock.map(k => { const Ek = ellipse(cam.pt(add(add(top, mul(hx, k[0] * hh)), [0, -k[1] * hh, 0])), [cam.lin(mul(hx, k[2] * hh)), cam.lin([0, k[3] * hh, 0]), cam.lin(mul(hz, m.r[2] * hh))]); Ek.n = 16; return Ek; }) }; }
    const shape = (g, dx, dy) => E.lock ? hullOf(E.lock, g, dx, dy) : ellPath(E, g, dx, dy);
    extra.push({ id: "hm" + i, z: m.fwd ? (vl[2] > 0.3 ? z - 0.001 : q[2] - 0.004) /* (hair to the shoulder: in front of the jumper, behind the face) */ : m.a[2] < 0 ? (vl[2] > 0.3 ? Math.min(q[2] - 0.004, cam.pt(J.chest)[2] - 0.006) : q[2] - 0.004) : q[2] + 0.033 /* hair down the back: behind the neck and the shoulders of a head that faces the viewer */, mat: "hm" + i, layers: [[shape(0, 0, 0), hr.n[1]], [shape(-me, LIGHT[0] * me, LIGHT[1] * me), hr.n[0]]] }); });
  if (L.tail){ const t = L.tail, A = at(o, Bh, mul(t.a, hh)), Z = add(add(A, [0, -t.len * hh, 0]), mul(Bh.z, -0.22 * hh)), M = [(A[0] + Z[0]) / 2 - Bh.z[0] * 0.14 * hh, (A[1] + Z[1]) / 2, (A[2] + Z[2]) / 2 - Bh.z[2] * 0.14 * hh];
    const Es = [disc(cam.pt(A), t.r[0] * px), disc(cam.pt(M), t.r[0] * 0.92 * px), disc(cam.pt(Z), t.r[1] * px)]; Es.forEach(E => E.n = 14); const te = 0.05 * px, zq = cam.pt(M)[2];
    extra.push({ id: "tail", z: zq - 0.004, mat: "tail", layers: [[hullOf(Es, 0, 0, 0), hr.n[1]], [hullOf(Es, -te, LIGHT[0] * te, LIGHT[1] * te), hr.n[0]]] });
    extra.push({ id: "band", z: zq - 0.003, mat: "band", layers: [[ellPath(disc(cam.pt(A), 0.13 * px), 0, 0, 0), c.bow || "#3fa9a3"]] }); }
  /* the ears: the far one before the skull, the near one after it and after the hair */
  const ear = sg => { const p = at(o, Bh, [sg * 0.83 * hh, -0.1 * hh, -0.1 * hh]), E = ellipse(cam.pt(p), ax([0.1, 0.2, 0.14])), near = vl[0] * sg > 0, fz = Math.sign(dot(Bh.z, [cam.view[2], 0, -cam.view[0]])) * sg;
    return { near, d: ellPath(E, 0, 0, 0), d2: ellPath(E, -0.05 * px, 0.035 * px * fz, 0) }; };
  const eL = ear(1), eR = ear(-1), nearEars = [eL, eR].filter(x => x.near), farEars = [eL, eR].filter(x => !x.near).map(x => x.d).join("");
  const skull = [Ecr, Ejw], skullD = hullOf(skull, 0, 0, 0);
  /* the features: each is drawn flat in a little frame of its own, which the camera turns with the surface it lies on (so the far eye
     narrows as the head turns); a feature is whole or it is not there (never a sliver at the edge of the face), and nothing of the face
     is drawn outside the head (the mouth of a head seen from the side ends at its edge) */
  const feat = (id, p, az, inner, min) => { const a = az * Math.PI / 180, U = cam.lin(at([0, 0, 0], Bh, [Math.cos(a), 0, -Math.sin(a)])), Vv = cam.lin(Bh.y), q = cam.pt(at(o, Bh, mul(p, hh)));
    const facing = dot(at([0, 0, 0], Bh, [Math.sin(a), 0, Math.cos(a)]), cam.view);
    const kk = c.featK && /^(eye|brow|mouth)/.test(id) ? c.featK : 1;      // (the moods: the eyes, brows and mouth drawn a little larger, to read at 80 px)
    return { id, tag: "g", clip: "skc", m: [U[0] * hh * kk, U[1] * hh * kk, -Vv[0] * hh * kk, -Vv[1] * hh * kk, q[0], q[1]].map(x => Math.round(x * 1000) / 1000), inner, hide: facing < (min == null ? 0.42 : min) }; };
  const iris = c.iris || "#4a3524", lid = "#2a1c15", fine = c.live || big;          // fine: the face as the teacher's is drawn (lashes, a firm lid line, a tapered brow) wherever a face is large
  /* (c.live: the teacher's eyes: the irises in a group that can look down, the upper lid in a group that comes down with them, and a shut lid for a blink) */
  const LV = c.live ? ` style="transition:transform .25s ease-in-out"` : "";
  /* (the close-ups: c.eyeMode = { lid: how far the upper lids come down, pup: how far the eyes look down, squint: 0 .. 1 the lower lids raised
     by a broad smile, shut: the eyes closed }, in head heights) */
  const EM = big && c.eyeMode || null, emT = v => v ? ` transform="translate(0 ${f2(v * 1000) / 1000})"` : "";
  const eyeArt0 = sg => big ? `<path d="M-.18 0Q0 -.166 .18 -.01Q0 .13 -.18 0Z" fill="#fbf7f1"/><clipPath id="${c.u}e${sg}"><path d="M-.18 0Q0 -.166 .18 -.01Q0 .13 -.18 0Z"/></clipPath><g clip-path="url(#${c.u}e${sg})"><g class="pup"${LV}${emT(EM && EM.pup)}><circle cy="-.012" r=".092" fill="${iris}"/><circle cy="-.012" r=".04" fill="#120d0a"/><circle cx=".03" cy="-.043" r=".022" fill="#fff"/></g>${EM && EM.squint ? (y0 => `<path d="M-.25 .2L-.25 ${f2(y0 * 100) / 100}Q0 ${f2((y0 - 0.09 * EM.squint) * 100) / 100} .25 ${f2((y0 - 0.02) * 100) / 100}L.25 .2Z" fill="${sk.n[0]}"/>`)(0.08 - 0.075 * EM.squint) : ""}</g>
      <g class="lid"${LV}${emT(EM && EM.lid)}>${c.live || EM ? `<path d="M-.205 .004Q0 -.188 .205 -.01Q.11 -.215 0 -.22Q-.11 -.215 -.205 .004Z" fill="${sk.n[0]}"/>` : ""}<path d="M-.19 0Q0 -.177 .19 -.013" stroke="${fine ? "#2e1f18" : lid}" stroke-width="${fine ? 0.04 : c.fem ? 0.05 : 0.038}" fill="none" stroke-linecap="round"/>` + (c.fem ? (fine ? `<path d="M${0.13 * sg} -.084Q${0.2 * sg} -.064 ${0.212 * sg} -.008" stroke="#2e1f18" stroke-width=".044" fill="none" stroke-linecap="round"/><path d="M${0.2 * sg} -.03q${0.04 * sg} -.008 ${0.052 * sg} -.034M${0.165 * sg} -.064q${0.03 * sg} -.014 ${0.034 * sg} -.04" stroke="${lid}" stroke-width=".017" fill="none" stroke-linecap="round"/>` : `<path d="M${0.19 * sg} -.016l${0.075 * sg} -.057M${0.14 * sg} -.068l${0.06 * sg} -.066" stroke="${lid}" stroke-width=".028" fill="none" stroke-linecap="round"/>`) : "") + `</g><path d="M-.14 .083Q0 .146 .14 .078" stroke="${sk.n[1]}" stroke-width=".022" fill="none" opacity="${fine ? 0.4 : 0.8}"/>`
      + (EM && EM.squint ? `<path d="M-.15 ${f2((0.13 - 0.07 * EM.squint) * 100) / 100}Q0 ${f2((0.08 - 0.09 * EM.squint) * 100) / 100} .15 ${f2((0.12 - 0.07 * EM.squint) * 100) / 100}" stroke="${sk.n[1]}" stroke-width=".026" fill="none" stroke-linecap="round" opacity=".75"/>` : "")
      + (c.live || (EM && EM.shut) ? `<g class="blk" visibility="${EM && EM.shut ? "visible" : "hidden"}"><path d="M-.21 .01Q0 -.2 .21 -.01Q0 .16 -.21 .01Z" fill="${sk.n[0]}"/><path d="M-.18 .012Q0 .1 .18 .004" stroke="${lid}" stroke-width=".04" fill="none" stroke-linecap="round"/>${EM && EM.shut && c.fem ? `<path d="M-.1 .05l-.025 .05M0 .06v.055M.1 .05l.025 .05" stroke="${lid}" stroke-width=".018" fill="none" stroke-linecap="round"/>` : ""}</g>` : "")
    : `<ellipse rx=".1" ry=".135" fill="${c.ink}"/><circle cx="-.03" cy="-.05" r=".036" fill="#fff" opacity=".9"/>` + (c.fem ? `<path d="M${0.06 * sg} -.1Q${0.14 * sg} -.15 ${0.19 * sg} -.2" stroke="${c.ink}" stroke-width=".05" fill="none" stroke-linecap="round"/>` : "");
  /* (the moods, figures10) c.eyeMode.mood: the eye drawn from its parts, so that it can open wide, the upper lid come down level or
     slanted, the lower lid rise and the eye look aside (FACS: AU5 the upper lid raised, AU7 the lower lid tensed, AU43 the lids lowered):
     { wide 0..1 (white over the iris), ld 0..1 (the upper lid down), sl -1..1 (the lid's edge slanted: + its inner end lower, a glare;
     - its outer end lower, sadness), lo 0..1 (the lower lid raised), gx, gy (the gaze, in iris widths), shut 1 (closed, bowed down) | 2
     (squeezed shut: a yawn), tear: a tear at the outer corner }. c.browMode: the brow from three points, { inn: the inner end up (AU1),
     out: the outer end up (AU2), dn: the brow down (AU4), kn: drawn together (AU4), ar: more (+) or less (-) arched } */
  const R3e = v => Math.round(v * 1000) / 1000;
  const moodEye = sg => { const M = EM.mood, w = M.wide || 0, ld = M.ld || 0, sl = M.sl || 0, lo = M.lo || 0, xi = -0.19 * sg, xo = 0.19 * sg, yo = -0.012, R = R3e, ink = "#2e1f18";
    if (M.shut) return `<g transform="scale(.9 .95)">` + (M.shut === 2
      ? `<path d="M${R(xi)} -.005Q${R(-0.02 * sg)} .07 ${R(xo)} -.03" stroke="${ink}" stroke-width=".05" fill="none" stroke-linecap="round"/><path d="M${R(xi * 0.7)} .085Q0 .13 ${R(xo * 0.75)} .07M${R(xi * 0.6)} -.075Q0 -.1 ${R(xo * 0.7)} -.09" stroke="${sk.n[1]}" stroke-width=".026" fill="none" stroke-linecap="round" opacity=".8"/><path d="M${R(xo + 0.03 * sg)} -.05l${R(0.07 * sg)} -.03M${R(xo + 0.035 * sg)} .0l${R(0.075 * sg)} .01M${R(xo + 0.02 * sg)} .045l${R(0.06 * sg)} .04" stroke="${sk.n[1]}" stroke-width=".022" fill="none" stroke-linecap="round" opacity=".85"/>`
      : `<path d="M${R(xi)} -.01Q0 .1 ${R(xo)} -.02" stroke="${ink}" stroke-width=".045" fill="none" stroke-linecap="round"/>` + (c.fem ? `<path d="M${R(-0.1 * sg)} .05l${R(-0.03 * sg)} .055M0 .06v.06M${R(0.1 * sg)} .045l${R(0.03 * sg)} .055" stroke="${ink}" stroke-width=".02" fill="none" stroke-linecap="round"/>` : ""))
      + (M.tear ? `<path d="M${R(xo + 0.01 * sg)} .06c.035 .06 .05 .1 .0 .12c-.05 -.02 -.035 -.06 .0 -.12Z" fill="#9fd6f6" stroke="#4d9ad6" stroke-width=".014"/>` : "") + `</g>`;
    const T = -0.17 - 0.15 * w, Bt = 0.13 + 0.06 * w, top = T * (1 - 0.95 * ld), c1 = top + sl * 0.1, c2 = top - sl * 0.1, low = Bt * (1 - 0.85 * lo), id = `${c.u}me${sg}`;
    const white = `M${R(xi)} 0Q0 ${R(T)} ${R(xo)} ${yo}Q0 ${R(Bt)} ${R(xi)} 0Z`, lidE = `M${R(xi)} 0C${R(xi * 0.45)} ${R(c1)} ${R(xo * 0.45)} ${R(c2)} ${R(xo)} ${yo}`;
    const lowE = `M${R(xi)} 0Q0 ${R(low)} ${R(xo)} ${yo}`, gx = (M.gx || 0) * 0.075, gy = (M.gy || 0) * 0.06 - 0.012 + 0.01 * w, ir = 0.092 - 0.008 * w, pr = 0.04 - 0.012 * w;
    return `<g transform="scale(.9 .95)"><path d="${white}" fill="#fbf7f1"/><clipPath id="${id}"><path d="${white}"/></clipPath><g clip-path="url(#${id})"><circle cx="${R(gx)}" cy="${R(gy)}" r="${R(ir)}" fill="${iris}"/><circle cx="${R(gx)}" cy="${R(gy)}" r="${R(pr)}" fill="#120d0a"/><circle cx="${R(gx + 0.03)}" cy="${R(gy - 0.031)}" r=".022" fill="#fff"/>`
      + `<path d="${lidE}L${R(xo * 1.4)} -.6L${R(xi * 1.4)} -.6Z" fill="${sk.n[0]}"/>` + (lo > 0.05 ? `<path d="${lowE}L${R(xo * 1.4)} .5L${R(xi * 1.4)} .5Z" fill="${sk.n[0]}"/>` : "") + `</g>`
      + `<path d="${lidE}" stroke="${ink}" stroke-width=".045" fill="none" stroke-linecap="round"/>`
      + (ld < 0.55 ? `<path d="M${R(xi * 0.8)} ${R(-0.03)}C${R(xi * 0.4)} ${R(c1 - 0.1 - 0.04 * w)} ${R(xo * 0.4)} ${R(c2 - 0.1 - 0.04 * w)} ${R(xo * 0.85)} ${R(yo - 0.05)}" stroke="${sk.n[1]}" stroke-width=".022" fill="none" stroke-linecap="round" opacity=".55"/>` : "")
      + `<path d="${lowE}" stroke="${sk.n[1]}" stroke-width="${lo > 0.05 ? 0.03 : 0.022}" fill="none" stroke-linecap="round" opacity="${lo > 0.05 ? 0.85 : 0.5}"/>`
      + (c.fem ? `<path d="M${R(xo)} ${yo}l${R(0.065 * sg)} ${R(-0.03 + 0.03 * sl)}M${R(xo * 0.72)} ${R(c2 * 0.62)}l${R(0.045 * sg)} -.05" stroke="${ink}" stroke-width=".02" fill="none" stroke-linecap="round"/>` : "")
      + (M.bags ? `<path d="M${R(xi * 0.75)} .12Q0 .2 ${R(xo * 0.8)} .1" stroke="${sk.n[1]}" stroke-width=".028" fill="none" stroke-linecap="round" opacity=".7"/>` : "")
      + (M.tear ? `<path d="M${R(xo * 0.8)} .08c.035 .06 .05 .1 .0 .12c-.05 -.02 -.035 -.06 .0 -.12Z" fill="#9fd6f6" stroke="#4d9ad6" stroke-width=".014"/>` : "") + `</g>`; };
  const moodBrow = sg => { const M = c.browMode, R = R3e, inn = M.inn || 0, out = M.out || 0, dn = M.dn || 0, kn = M.kn || 0, ar = M.ar || 0;
    const xi = (-0.2 - 0.06 * kn) * sg, xo = 0.25 * sg, yi = -0.03 - 0.17 * inn + 0.11 * dn, yo = 0.05 - 0.15 * out + 0.04 * dn, xp = 0.03 * sg, yp = (yi + yo) / 2 - 0.065 - 0.06 * ar;
    const cx = 2 * xp - (xi + xo) / 2, cy = 2 * yp - (yi + yo) / 2, ti = c.fem || c.kid ? 0.062 : 0.085, to = 0.02, tm = (ti + to) / 2;
    return `<path d="M${R(xi)} ${R(yi - ti / 2)}Q${R(cx)} ${R(cy - tm / 2)} ${R(xo)} ${R(yo - to / 2)}Q${R(xo + 0.02 * sg)} ${R(yo)} ${R(xo)} ${R(yo + to / 2)}Q${R(cx)} ${R(cy + tm / 2)} ${R(xi)} ${R(yi + ti / 2)}Q${R(xi - 0.025 * sg)} ${R(yi)} ${R(xi)} ${R(yi - ti / 2)}Z" fill="${mixc(c.browC, "#1d1410", c.fem || c.kid ? 0.25 : 0.2)}"/>`; };
  const eyeArt = sg => EM && EM.mood ? moodEye(sg) : EM && EM.shut ? `<g transform="scale(.9 .95)"><path d="M-.2 -.01Q0 .11 .2 -.02" stroke="#2e1f18" stroke-width=".045" fill="none" stroke-linecap="round"/><path d="M-.1 .05l-.03 .055M0 .06v.06M.1 .045l.03 .055" stroke="#2e1f18" stroke-width="${c.fem ? 0.02 : 0.014}" fill="none" stroke-linecap="round" opacity="${c.fem ? 1 : 0.7}"/></g>` : fine ? `<g transform="scale(.9 .95)">${eyeArt0(sg)}</g>` : eyeArt0(sg);      // (the teacher's eyes a little narrower than the cards' faces: calm, not wide)
  const browArt = sg => big && c.browMode ? moodBrow(sg) : fine && (c.fem || c.kid) ? `<path d="M${0.24 * sg} .055Q${0.08 * sg} -.13 ${-0.19 * sg} -.04Q${-0.225 * sg} -.015 ${-0.2 * sg} .008Q${0.07 * sg} -.065 ${0.24 * sg} .055Z" fill="${mixc(c.browC, "#1d1410", 0.25)}"/>`
    : fine ? `<path d="M${0.25 * sg} .05Q${0.06 * sg} -.11 ${-0.2 * sg} -.065Q${-0.24 * sg} -.02 ${-0.21 * sg} .035Q${0.05 * sg} -.025 ${0.25 * sg} .05Z" fill="${mixc(c.browC, "#1d1410", 0.2)}"/>`      /* (a man's: heavier, flatter) */ : big ? `<path d="M${0.21 * sg} .03q${-0.21 * sg} -.13 ${-0.42 * sg} -.04q${0.21 * sg} -.04 ${0.42 * sg} .08z" fill="${c.browC}"/>` : `<path d="M${0.15 * sg} .03Q${0.02 * sg} -.07 ${-0.15 * sg} -.01" stroke="${c.browC}" stroke-width=".07" fill="none" stroke-linecap="round"/>`;
  const sm2 = c.smile || 0, my = f2(-0.05 - 0.035 * sm2), mouthArt = c.mouthInner ? c.mouthInner(px) : big && c.speaks ? `<ellipse cy=".05" rx=".2" ry=".13" fill="#5a2326"/><path d="M-.2 .05A.2 .13 0 0 1 .2 .05" stroke="${c.lip}" stroke-width=".05" fill="none"/><path d="M-.2 .05A.2 .13 0 0 0 .2 .05" stroke="${c.lip}" stroke-width=".06" fill="none"/>` : big ? `<path d="M-.27 ${my}Q0 ${f2(0.135 + 0.07 * sm2)} .27 ${my}Q0 ${f2(0.03 + 0.03 * sm2)} -.27 ${my}Z" fill="${c.lip}"/>`
    : c.speaks ? `<ellipse cy=".04" rx=".15" ry=".12" fill="#5a2326"/><path d="M-.15 .04A.15 .12 0 0 1 .15 .04" stroke="${c.lipC}" stroke-width=".05" fill="none"/>`
    : `<path d="M-.2 ${f2(-0.03 - 0.03 * sm2)}Q0 ${f2(0.13 + 0.06 * sm2)} .2 ${f2(-0.03 - 0.03 * sm2)}" stroke="${c.lipC}" stroke-width="${c.fem ? 0.09 : 0.075}" fill="none" stroke-linecap="round"/>`;
  const noseArt = `<path d="M-.05 -.2Q-.09 .03 -.11 .15Q-.07 .2 -.01 .19" stroke="${sk.n[1]}" stroke-width=".034" fill="none" opacity=".75" stroke-linecap="round"/><ellipse cx="-.078" cy=".2" rx=".036" ry=".02" fill="#8f5c42" opacity=".5"/><ellipse cx=".078" cy=".2" rx=".036" ry=".02" fill="#8f5c42" opacity=".5"/>`;
  const nb = cam.pt(at(o, Bh, [0, -0.2 * hh, 0.74 * hh])), nt = cam.pt(at(o, Bh, [0, -0.38 * hh, 0.83 * hh])), nr = 0.075 * px, side = Math.abs(vl[0]) > 0.5;
  const parts = [];
  if (L.ears !== false) parts.push({ id: "earF", z: z - 0.02, mat: "earF", layers: [[farEars, sk.f[0]]] });      // (hair that covers the ears covers the far one too)
  parts.push({ id: "skull", z, mat: "skin", layers: [[skullD, sk.n[2]], [hullOf(skull, -rim / 2, -LIGHT[0] * rim / 2, -LIGHT[1] * rim / 2), sk.n[1]], [hullOf(skull, -e, LIGHT[0] * (e - rim), LIGHT[1] * (e - rim)), sk.n[0]]], cast: (dx, dy) => hullOf(skull, 0, dx, dy) });
  /* the nose stands out of the face: seen from the front it is the colour of the face (its line and nostrils are drawn on it); from the side it is the outline */
  parts.push({ id: "nose", z: z + 0.001, mat: "nose", layers: side ? [[capsule(nb[0], nb[1] + 0.02 * px, nr * 0.6, nt[0] + 0.02 * px, nt[1] + 0.03 * px, nr), sk.n[1]], [capsule(nb[0], nb[1], nr * 0.6, nt[0], nt[1], nr), sk.n[0]]] : [[capsule(nb[0], nb[1], nr * 0.6, nt[0], nt[1], nr), sk.n[0]]] });
  if (beard) parts.push({ id: "beard", z: z + 0.0015, mat: "beard", layers: [[beard, big ? hr.gh : hr.n[0]]] });
  parts.push({ id: "hair", z: z + 0.002, mat: "hair", layers: [[hair, hr.gh]] });
  for (const x of extra) parts.push(x);
  if (L.ears !== false) nearEars.forEach((x, i) => parts.push({ id: "earN" + i, z: z + 0.003, mat: "ear", layers: [[x.d, sk.n[1]], [x.d2, sk.n[0]]] }));
  parts.push({ id: "skc", z: z + 0.0035, tag: "cp", d: skullD });
  const blush = big && c.cheekG ? `<ellipse rx=".27" ry=".16" fill="${c.cheekG}"/>` : `<ellipse rx=".23" ry=".13" fill="url(#${c.u}bl)"/>`;
  const shine = `<path d="M-.24 .04Q0 -.09 .24 .02Q0 -.03 -.24 .04Z" fill="${hr.hi}" opacity=".3"/>`;
  const F = [{ id: "shine", tag: "g", m: (() => { const f = feat("x", [-0.25 * (vl[0] > 0 ? -1 : 1), 0.86 + L.top * 0.6, 0.32], vl[0] > 0 ? 30 : -30, "", -9); return f.m; })(), inner: shine, hide: L.v < 0.04 || !!L.cloth },
    feat("chkL", [0.42, -0.38, 0.6], 38, blush, 0.5), feat("chkR", [-0.42, -0.38, 0.6], -38, blush, 0.5),
    feat("eyeL", [0.34, -0.015, 0.73], 24, eyeArt(1)), feat("eyeR", [-0.34, -0.015, 0.73], -24, eyeArt(-1)), feat("browL", [0.34, 0.25, 0.74], 24, browArt(1)), feat("browR", [-0.34, 0.25, 0.74], -24, browArt(-1)),
    feat("mouth", [0, -0.64, 0.74], 0, mouthArt, 0.2)];
  if (big) F.push(feat("noseL", [0, -0.24, 0.82], 0, noseArt, 0.72));
  if (big && c.faceMarks) for (const m of c.faceMarks) F.push(feat(m.id, m.p, m.az || 0, m.inner, m.min == null ? 0.3 : m.min));      // (the moods: a furrow, forehead lines, a drop of sweat, a cold nose)
  if (c.freckles && big){ const fr = sg => [[-.1, -.04], [.02, .03], [.11, -.03], [-.03, -.09], [.07, .07], [-.14, .05]].map(q => `<circle cx="${q[0] * sg}" cy="${q[1]}" r=".017" fill="#9a5f3a" opacity=".55"/>`).join(""); F.push(feat("frL", [0.4, -0.3, 0.62], 36, fr(1), 0.5), feat("frR", [-0.4, -0.3, 0.62], -36, fr(-1), 0.5)); }
  if (c.old && big) F.push(feat("lines", [0, 0.44, 0.78], 0, `<path d="M-.22 0Q0 -.05 .22 0M-.17 .1Q0 .06 .17 .1" stroke="${sk.n[1]}" stroke-width=".022" fill="none" opacity=".8" stroke-linecap="round"/>`, 0.6));
  if (WD && WD.shades) F.push(...shadesOf(feat, big, WD.shades));
  else if (c.glasses){ const gw = big ? 0.036 : 0.06, ring = `<circle r=".2" fill="#ffffff" fill-opacity=".2" stroke="${c.glasses}" stroke-width="${gw}"/>`;
    F.push(feat("glL", [0.34, -0.02, 0.76], 24, ring), feat("glR", [-0.34, -0.02, 0.76], -24, ring), feat("glB", [0, -0.02, 0.84], 0, `<path d="M-.15 0Q0 -.06 .15 0" stroke="${c.glasses}" stroke-width="${gw}" fill="none"/>`, 0.5)); }
  F.forEach((x, i) => { x.z = z + 0.004 + i * 1e-4; parts.push(x); });
  if (WD && WD.hat) for (const p of hatParts(WD.hat, { o, Bh, hh, cam, px, z, L, L0, c, vl, crC, crR, big, skullD })) parts.push(p);      // (the wardrobe: a hat on the hair)
  for (const p of parts) out.push(p);
}

/* ---------- a hand with fingers (drawn where a hand is large: the teacher's) ----------
   The hand's own frame: hd (from the wrist along the fingers), pn (the way the palm faces), and across it toward the thumb. A palm; four
   fingers of three bones each, bent toward the palm at the knuckle and at the two joints (the far joint bends two thirds as much as the
   middle one, as it does in a real finger); a thumb of two parts that stands away from the palm's edge, comes over the palm and bends.
   Lengths after the proportions of the hand's bones (the palm a little over half the hand; the middle finger longest, then ring, index,
   little; each finger's bones about a half, three tenths and a fifth of it).
   A shape is the bends [knuckle, middle joint] of index, middle, ring and little finger, sp: how far the fingers fan, th: the thumb
   [how far from the palm's edge, how far over the palm, its own bend] (radians). relaxed: the hand at rest, each finger a little more
   bent than the one before it; point: the index straight, the others shut, the thumb laid over them; flat: the open hand, fingers together;
   palmup: the open hand offered, fingers a little apart, the thumb out; cup: the open hand hollowed (behind the ear) */
const HANDS = {
  relaxed: { f: [[0.24, 0.36], [0.32, 0.44], [0.4, 0.52], [0.48, 0.6]], sp: 0.01, th: [0.42, 0.3, 0.3] },
  point:   { f: [[0.02, 0.04], [1.38, 1.62], [1.44, 1.68], [1.46, 1.66]], sp: 0, th: [0.18, 1.02, 0.8] },
  flat:    { f: [[0.06, 0.05], [0.05, 0.05], [0.06, 0.05], [0.08, 0.07]], sp: 0.012, th: [0.34, 0.1, 0.12] },
  palmup:  { f: [[0.16, 0.26], [0.2, 0.3], [0.25, 0.34], [0.3, 0.38]], sp: 0.06, th: [0.5, 0.18, 0.28] },
  cup:     { f: [[0.34, 0.42], [0.38, 0.46], [0.42, 0.5], [0.48, 0.54]], sp: 0, th: [0.08, 0.3, 0.3] },
  fist:    { f: [[1.36, 1.6], [1.4, 1.62], [1.44, 1.64], [1.46, 1.66]], sp: 0, th: [0.3, 0.95, 0.75] }      // (figures 16) closed round a pole, the thumb over the fingers
};
const handFlat = H => [H.f[0][0], H.f[0][1], H.f[1][0], H.f[1][1], H.f[2][0], H.f[2][1], H.f[3][0], H.f[3][1], H.sp, H.th[0], H.th[1], H.th[2]];
function fingers(wr, hd, pn, left, hp, B, P, S, SK, id){
  const HL = B.hand * (hp[12] || 1), PW = HL * (B.pwk || 0.235), th = left ? cross(pn, hd) : cross(hd, pn), parts = [], LX = LIGHT[0], LY = LIGHT[1];
  const bend = (d, n, a) => { const c = Math.cos(a), s = Math.sin(a); return [add(mul(d, c), mul(n, s)), sub(mul(n, c), mul(d, s))]; };
  const Q = (p, r) => { const q = P(p); return [q[0], q[1], r * S, q[2]]; };
  const tube = pts => (g, dx, dy) => { let d = ""; for (let i = 0; i + 1 < pts.length; i++) d += capsule(pts[i][0] + dx, pts[i][1] + dy, Math.max(0.3, pts[i][2] + g), pts[i + 1][0] + dx, pts[i + 1][1] + dy, Math.max(0.3, pts[i + 1][2] + g)); return d; };
  const lay = (fn, e) => [[fn(0, 0, 0), SK[1]], [fn(-e, LX * e, LY * e), SK[0]]];
  const KN = [0.5, 0.52, 0.495, 0.445], OFF = [0.74, 0.25, -0.24, -0.71], LEN = [0.405, 0.45, 0.42, 0.33], RF = [0.265, 0.27, 0.255, 0.225], knuckles = [];
  const zw = P(wr)[2], view = dot(pn, [0, 0, 1]);
  for (let i = 0; i < 4; i++){
    const a = (1.2 - i) * hp[8], d0 = nrm(add(mul(hd, Math.cos(a)), mul(th, Math.sin(a)))), n0 = nrm(sub(pn, mul(d0, dot(pn, d0)))), p0 = add(add(wr, mul(hd, KN[i] * HL)), mul(th, OFF[i] * PW)), L = LEN[i] * HL, r = RF[i] * PW;
    const [d1, n1] = bend(d0, n0, hp[i * 2]), p1 = add(p0, mul(d1, L * 0.48)), [d2, n2] = bend(d1, n1, hp[i * 2 + 1]), p2 = add(p1, mul(d2, L * 0.29)), [d3] = bend(d2, n2, hp[i * 2 + 1] * 0.66), p3 = add(p2, mul(d3, L * 0.23));
    const pts = [Q(p0, r), Q(p1, r * 0.97), Q(p2, r * 0.91), Q(p3, r * 0.82)]; knuckles.push(pts[0]);
    parts.push({ id: id + "f" + i, z: (pts[1][3] + pts[2][3] + pts[3][3]) / 3 + 0.0004 * i, mat: id + "f" + i, layers: lay(tube(pts), Math.max(0.5, r * S * 0.3)) });
  }
  /* the thumb: from the heel of the hand on the thumb's side */
  { const A = hp[9], O = hp[10], b0 = add(add(wr, mul(hd, 0.15 * HL)), mul(th, 0.78 * PW)), dA = nrm(add(mul(hd, Math.cos(A)), mul(th, Math.sin(A)))), d1 = nrm(add(mul(dA, Math.cos(O)), mul(pn, Math.sin(O))));
    const nb = nrm(sub(add(add(mul(pn, 0.6), mul(hd, 0.45)), mul(th, -0.65)), mul(d1, dot(add(add(mul(pn, 0.6), mul(hd, 0.45)), mul(th, -0.65)), d1)))), [d2] = bend(d1, nb, hp[11]);
    const p1 = add(b0, mul(d1, 0.27 * HL)), p2 = add(p1, mul(d2, 0.17 * HL)), pts = [Q(b0, 0.36 * PW), Q(p1, 0.3 * PW), Q(p2, 0.26 * PW)];
    parts.push({ id: id + "t", z: (pts[0][3] + pts[1][3] * 2 + pts[2][3]) / 4 + (O > 0.6 ? 0.004 : 0), mat: id + "t", layers: lay(tube(pts), Math.max(0.5, 0.09 * PW * S)) }); }
  /* the palm: from the wrist to the knuckles, the heel of the thumb and the heel of the hand */
  const D = [Q(add(wr, mul(th, 0.5 * PW)), 0.5 * PW), Q(add(wr, mul(th, -0.52 * PW)), 0.46 * PW), Q(add(add(wr, mul(hd, 0.2 * HL)), mul(th, 0.62 * PW)), 0.52 * PW), Q(add(add(wr, mul(hd, 0.24 * HL)), mul(th, -0.66 * PW)), 0.42 * PW)].concat(knuckles.map(k => [k[0], k[1], k[2] * 1.06, k[3]]));
  const Es = D.map(q => { const E = disc([q[0], q[1]], q[2]); E.n = 10; return E; }), palm = (g, dx, dy) => hullOf(Es, g, dx, dy), zp = P(add(wr, mul(hd, 0.28 * HL)))[2];
  parts.push({ id: id + "p", z: zp, mat: id + "p", layers: lay(palm, Math.max(0.6, 0.1 * PW * S)) });
  /* the palm's side, when it is the side seen: a lighter hollow and its two lines */
  if (dot(pn, [0, Math.sin(7 * Math.PI / 180), Math.cos(7 * Math.PI / 180)]) > 0.35){ const c0 = P(add(add(wr, mul(hd, 0.27 * HL)), mul(th, -0.04 * PW))), U = sub(P(add(add(wr, mul(hd, 0.27 * HL)), mul(th, 0.6 * PW))), c0), V = sub(P(add(wr, mul(hd, 0.44 * HL))), P(add(wr, mul(hd, 0.1 * HL)))), r3 = v => Math.round(v * 1000) / 1000;
    parts.push({ id: id + "h", z: zp + 0.0001, tag: "g", m: [U[0], U[1], V[0], V[1], c0[0], c0[1]].map(r3), inner: `<ellipse rx=".8" ry=".42" fill="${mixc(SK[0], "#ffffff", 0.22)}" opacity=".75"/><path d="M-.55 .1Q-.1 -.2 .62 -.02M-.35 .26Q.1 .02 .6 .2" stroke="${SK[1]}" stroke-width=".05" fill="none" stroke-linecap="round" opacity=".55"/>` }); }
  const zs = parts.map(x => x.z), zmax = Math.max(...zs);
  return { parts, z: zmax, cast: (g, dx, dy) => palm(g, dx, dy) };
}

/* ---------- the whole figure, one frame: the parts with their depth ---------- */
function frame(k, B, cam, c, floor, o){
  const J = skeleton(k, B), parts = [], S = cam.scale, P = p => cam.pt([p[0], p[1] - floor, p[2]]), T = c.topM, G = c.legM, sk = c.skinM, SH = c.shoeM;
  const part = o && o.part, doBody = part !== "arms", doArms = part !== "body", WD = c.wd || null;      // (WD: what the learner wears from the wardrobe, see "the wardrobe")          // (the teacher is drawn as two groups: her body, and her arms in front of it)
  const zmid = (a, b) => (P(a)[2] + P(b)[2]) / 2, zt = P(J.chest)[2], lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const RIM = Math.min(1.1, 0.0075 * S), lax = (Bx, r) => [cam.lin(mul(Bx.x, r[0])), cam.lin(mul(Bx.y, r[1])), cam.lin(mul(Bx.z, r[2]))];
  /* a form in its tones: fn(grow, dx, dy) gives its outline grown and moved. Near the viewer: a thin light rim on the lit edge, the shade
     tone, and the lit tone, smaller and moved to the light (so the shade is one shape on the side away from the light). Far: shade and lit */
  const form = (fn, M, e, far, norim) => far ? [[fn(0, 0, 0), M.f[1]], [fn(-e, LIGHT[0] * e, LIGHT[1] * e), M.f[0]]] : norim ? [[fn(0, 0, 0), M.n[1]], [fn(-e, LIGHT[0] * e, LIGHT[1] * e), M.n[0]]]
    : [[fn(0, 0, 0), M.n[2]], [fn(-RIM / 2, -LIGHT[0] * RIM / 2, -LIGHT[1] * RIM / 2), M.n[1]], [fn(-e, LIGHT[0] * (e - RIM), LIGHT[1] * (e - RIM)), M.n[0]]];
  /* a limb is ONE tapered outline from its root to its end, with a smooth bend at the joint: rounds laid along its middle line (root, the
     fullest point of the first bone, the bend, the fullest point of the second, the end), each joined to the next by the lines that touch both */
  const chain = (A, Jt, Z, R) => { const l1 = Math.hypot(...sub(Jt, A)), l2 = Math.hypot(...sub(Z, Jt)), b1 = Math.min(0.42, R[2] * 1.15 / l1), b2 = Math.min(0.42, R[2] * 1.15 / l2), c0 = lerp(A, Jt, 1 - b1), c1 = lerp(Jt, Z, b2);
    const bez = t => add(add(mul(c0, (1 - t) * (1 - t)), mul(Jt, 2 * t * (1 - t))), mul(c1, t * t)), rc = R[2] * 1.03;
    const pts = [[A, R[0]], [lerp(A, Jt, 0.36), R[1]], [c0, R[2] + (R[1] - R[2]) * Math.max(0, (0.64 - (1 - b1 - 0.36)) / 0.64) * 0], [bez(0.33), rc], [bez(0.67), rc], [c1, R[2]], [lerp(Jt, Z, Math.max(b2 + 0.05, 0.34)), R[3]], [Z, R[4]]];
    return pts.map(([p, r]) => { const q = P(p); return [q[0], q[1], r * S, q[2]]; }); };
  const sweep = (Q, lo, hi) => (g, dx, dy) => { let d = ""; for (let i = lo; i < hi; i++) d += capsule(Q[i][0] + dx, Q[i][1] + dy, Math.max(0.3, Q[i][2] + g), Q[i + 1][0] + dx, Q[i + 1][1] + dy, Math.max(0.3, Q[i + 1][2] + g)); return d; };
  const cast = []; let castD = "";                          // what stands in front of the trunk throws its shadow on it
  /* the trunk: one garment, from the cross-sections of the body: the hem round the hips, the waist, the chest, the yoke of the shoulders
     (two round shoulder caps and the foot of the neck) */
  const Ech = ellipse(P(at(J.chest, J.Bc, [0, 0.012, 0.004])), lax(J.Bc, B.chest)), Ehm = ellipse(P(at(J.root, J.Bp, [0, 0.012, 0])), lax(J.Bp, B.hem)), Ewa = ellipse(P(lerp(J.root, J.chest, 0.45)), lax(J.Bp, B.waist));
  const EsL = disc(P(J.shL), B.rSh * S), EsR = disc(P(J.shR), B.rSh * S), Enb = disc(P(at(J.nb, J.Bc, [0, -0.012, 0])), B.rNeck * S * (B.nkY || 1.3)); if (B.nkV){ Enb.b = B.rNeck * S * B.nkV; Enb.c = [Enb.c[0], Enb.c[1] + B.nkDy * S]; }      // (the teacher: the foot of the neck wide and low, so that the line of the shoulders slopes gently from it)
  Ech.n = 36; Ehm.n = 30; Ewa.n = 26; EsL.n = EsR.n = 18; Enb.n = 12;
  const mixE = (A, Bq, t, bulge) => { const E = { c: [A.c[0] + (Bq.c[0] - A.c[0]) * t, A.c[1] + (Bq.c[1] - A.c[1]) * t], a: (A.a + (Bq.a - A.a) * t) * bulge, b: A.b + (Bq.b - A.b) * t, th: A.th + (Bq.th - A.th) * t }; E.n = 26; return E; };
  const rings = [Ehm, mixE(Ehm, Ewa, 0.5, 0.995), Ewa, mixE(Ewa, Ech, 0.5, 1.012), Ech];
  const trunkFn = (g, dx, dy) => { let d = ""; for (let i = 0; i < 4; i++) d += hullOf([rings[i], rings[i + 1]], g, dx, dy); return d + hullOf([Ech, EsL, EsR, Enb], g, dx, dy); }, trunkD = doBody ? trunkFn(0, 0, 0) : "";
  const BUST = !!(o && o.bust) && !WD;                      // (a head-and-shoulders portrait, arms hanging: the sleeves fall from the shoulders as part of the jumper, see the arms)
  const trunkL = doBody ? form(trunkFn, T, 0.03 * S, false, BUST) : null;      // (not while only the arms are drawn: the teacher's arm moves)
  const trunkUp = () => { let d = ""; for (let i = 1; i < 4; i++) d += hullOf([rings[i], rings[i + 1]], 0, 0, 0); return d + hullOf([Ech, EsL, EsR, Enb], 0, 0, 0); };      // (the teacher: the arms' shadow kept off the hem, where it showed as a dark point under the cuff)
  if (doBody){
  parts.push({ id: "trunk", z: zt, mat: "top", layers: trunkL });
  /* the tops of the shoulders face the light from above: lit on both sides (the trunk's shade begins under them), so that the sleeve's top,
     lit as well, lies on the shoulder without a ring */
  parts.push({ id: "trunkS", z: zt + 0.0001, mat: "top", layers: [[ellPath(EsL, 0, 0, 0) + ellPath(EsR, 0, 0, 0), T.n[0]]] });
  /* its ribbed hem: a band that follows the lower edge (the lower half of the ring, and the same line again a band's width higher) */
  const band = (E, w) => { const ct = Math.cos(E.th), st = Math.sin(E.th), lo = [], hi = []; for (let i = 0; i <= 14; i++){ const t = i / 14 * Math.PI, x = (E.a + 0.4) * Math.cos(t), y = (E.b + 0.4) * Math.sin(t), X = E.c[0] + x * ct - y * st, Y = E.c[1] + x * st + y * ct; lo.push([X, Y]); hi.push([X, Y - w]); }
    return poly(lo.concat(hi.reverse())); };
  if (part === "body"){ const ct = Math.cos(Ehm.th), st = Math.sin(Ehm.th), q = [Ehm.c[0] - Ehm.a * ct - 0.004 * S, Ehm.c[1] - Ehm.a * st - 0.02 * S];      // (the teacher: the hem's near corner in the lit tone, where the lit shape, drawn smaller, left a dark point)
    parts.push({ id: "hemC", z: zt + 0.00015, tag: "clip", clip: trunkD, d: ellPath({ c: q, a: 0.03 * S, b: 0.05 * S, th: 0 }, 0, 0, 0), fill: T.n[0] }); }
  if (!(WD && WD.noRib)) parts.push({ id: "rib", z: zt + 0.0003, mat: "rib", layers: [[band(Ehm, 0.03 * S), T.rib]] });
  if (WD) parts.push({ id: "tkc", z: zt, tag: "cp", d: trunkD }, { id: "tkl", z: zt, tag: "cp", d: trunkL[trunkL.length - 1][0] });
  if (c.fem && !c.kid && B.chest[0] * S > 10 && dot(J.Bc.z, cam.view) > 0.5){      // (large, and the chest toward the viewer: see wearer())
    const Bc = J.Bc, on = (x, y, zk) => P(at(J.chest, Bc, [x, y, B.chest[2] * zk])), cv = on(0, B.chest[1] * 0.42, 0.95), cs0 = on(0, -B.chest[1] * 0.05, 0.9), cs1 = P(lerp(J.root, J.chest, 0.15));
    const Ev = ellipse(cv, [cam.lin(mul(Bc.x, B.chest[0] * 1.05)), cam.lin(mul(Bc.y, B.chest[1] * 0.6)), [0, 0, 0]]), wS = B.chest[0] * S * 1.3;
    parts.push({ id: "chV", z: zt + 0.00031, tag: "clip", clip: trunkD, d: ellPath(Ev, 0, 0, 0), fill: `url(#${c.u}cv)` });
    parts.push({ id: "chS", z: zt + 0.00032, tag: "clip", clip: trunkD, d: poly([[cs0[0] - wS, cs0[1]], [cs0[0] + wS, cs0[1]], [cs1[0] + wS, cs1[1]], [cs1[0] - wS, cs1[1]]]), fill: `url(#${c.u}cs)` }); }
  /* a name tag on the chest: it lies on the chest and turns with it (it is gone when the chest has turned away) */
  if (c.tag){ const Bc = J.Bc, U = cam.lin(Bc.x), Vv = cam.lin(Bc.y), TA = c.tagAt || [0, 0.02], q = P(at(J.chest, Bc, [TA[0], TA[1], B.chest[2] * 0.96 * Math.sqrt(Math.max(0.2, 1 - (TA[0] / B.chest[0]) ** 2))])), w = c.tagBox ? c.tagBox[0] : Math.min(B.chest[0] * 1.5, 0.03 + 0.021 * c.tag.length), h = c.tagBox ? c.tagBox[1] : 0.052, fs = c.tagBox ? Math.min(h * 0.545, w * 1.25 / c.tag.length) : Math.min(h * 0.77, w * 1.7 / c.tag.length), r3 = v => Math.round(v * 1000) / 1000;
    parts.push({ id: "tag", z: zt + 0.0008, tag: "g", m: [U[0], U[1], -Vv[0], -Vv[1], q[0], q[1]].map(r3), hide: dot(Bc.z, cam.view) < 0.3,
      inner: `<g class="nametag"${c.tagId ? ` id="${c.tagId}" transform="rotate(-3)${c.tagFlip ? " scale(-1 1)" : ""}"` : c.tagFlip ? ` transform="scale(-1 1)"` : ""}><rect x="${r3(-w / 2)}" y="${-h / 2}" width="${r3(w)}" height="${h}" rx=".008" fill="#fffdf6" stroke="#b9ae98" stroke-width=".003"/><rect x="${r3(-w / 2)}" y="${-h / 2}" width="${r3(w)}" height="${r3(h * 0.23)}" rx=".006" fill="#d8483f"/><text x="0" y="${r3(h / 2 - h * 0.21)}" text-anchor="middle" font-size="${r3(fs)}" font-weight="700" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" fill="#2b2b30">${c.tag}</text></g>` }); }
  /* the shadow of the hem on the legs; the neck of the jumper round the foot of the neck (its back, the neck, then its front edge) */
  const hemS = { id: "hemS", z: zt - 0.001, mat: "hemS", layers: [[ellPath(Ehm, -0.004 * S, 0.006 * S, 0.02 * S), G.f[1]]] }; parts.push(hemS); let legsD = "";      // (the hem's shadow lies on the legs only: cut to them below, so no dark point shows beside the thighs)
  const Ecl = ellipse(P(at(J.nb, J.Bc, [0, -0.01, 0.004])), lax(J.Bc, [B.rNeck * 1.5, 0.02, B.rNeck * 1.42])), nk = (a, b) => capsule(a[0], a[1], B.rNeck * S, b[0], b[1], B.rNeck * 0.97 * S);
  if (!(WD && WD.noCollar)) parts.push({ id: "collar", z: zt + 0.001, mat: "collar", layers: [[ellPath(Ecl, 0, 0, 0), T.f[1]]] });
  parts.push({ id: "neck", z: zt + 0.002, mat: "neck", layers: [[nk(P(add(J.nb, mul(sub(J.nb, J.skull), 0.05))), P(J.skull)), sk.n[1]]] });
  if (!(WD && WD.noCollar)) parts.push({ id: "collarF", z: zt + 0.0025, mat: "collarF", layers: [[band(Ecl, 0.017 * S), T.rib]] });
  /* legs: thigh and shin in one outline (its root lies under the hem), the shoe; the hips in the colour of the legs */
  const Epv = ellipse(P(at(J.root, J.Bp, [0, -0.012, 0])), lax(J.Bp, [(B.hw + B.rHip * 0.92) * (B.hipK || 1), 0.062, 0.07]));
  if (!(o && o.noLegs)) parts.push({ id: "hips", z: zt - 0.004, mat: "hips", layers: [[ellPath(Epv, 0, 0, 0), part === "body" ? G.n[0] : G.n[1]]] });      // (the teacher seated: the lap between her knees in the lit tone, so the knees do not read as two outlined rounds)
  const lapQ = {};                                             // (the teacher seated: the thighs' outlines, for her lap below)
  if (!(o && o.noLegs)) for (const s of ["L", "R"]){
    const hip = J["hip" + s], kn = J["kn" + s], an = J["an" + s], F = J["ft" + s];
    const farLeg = P(hip)[2] < P(J.root)[2], zb = farLeg ? -0.02 : 0.02, Q = chain(hip, kn, an, [B.rHip, B.rTh, B.rKnee, B.rCalf, B.rCuff]), e = B.rCuff * S * 0.3, mat = "leg" + s; lapQ[s] = Q;
    legsD += sweep(Q, 0, 7)(0, 0, 0); const LM = WD && WD.legSkin ? sk : G, zl = (zmid(hip, kn) + zmid(kn, an)) / 2 + zb, zL = WD && WD.skirt ? Math.min(zl, zt - 0.003) : zl; Q.z = zL;
    parts.push({ id: "tr" + s, z: Math.min(zt - 0.002, zmid(hip, kn) + zb), mat: WD && WD.legSkin ? "legS" + s : mat, layers: form(sweep(Q, 0, 2), LM, e, farLeg, true) });
    parts.push({ id: "lg" + s, z: zL, mat: WD && WD.legSkin ? "legS" + s : part === "body" && !farLeg ? "legN" : mat, layers: form(sweep(Q, 1, 7), LM, e, farLeg, true) });
    if (WD && WD.legParts) for (const p of WD.legParts({ s, Q, sweep, form, P, S, z: Math.max(zL, Math.min(zt - 0.002, zmid(hip, kn) + zb)), far: farLeg, G, sk, e, B })) parts.push(p);
    /* the shoe: an upper (heel, ball, toe, the ankle) standing on its sole; the toe turns up a little */
    const m = F.m, hc = add(F.heel, mul(m, 0.004)), up = (p, d) => add(p, mul(m, d)), q = B.shoe, rs = 0.0105 * q, lift = rs * 1.5;
    const Ssole = [disc(P(up(hc, rs - 0.027 * q)), rs * S), disc(P(up(F.ball, 0.004 + rs - 0.026 * q)), rs * S), disc(P(up(F.toe, 0.01 + rs - 0.021 * q)), rs * S)];
    const U = [disc(P(up(hc, lift * 0.5)), (0.027 * q - lift * 0.5) * S), disc(P(up(F.ball, 0.004 + lift * 0.5)), (0.026 * q - lift * 0.5) * S), disc(P(up(F.toe, 0.01 + lift * 0.5)), (0.021 * q - lift * 0.5) * S), disc(P(an), 0.031 * S)];
    Ssole.forEach(E => E.n = 12); U.forEach(E => E.n = 16); const fe = 0.008 * S;
    parts.push({ id: "ft" + s, z: (WD && WD.skirt ? Math.min(zmid(an, F.toe) + zb, zt - 0.003) : zmid(an, F.toe) + zb) - 0.004, mat: "shoe" + s, layers: [[hullOf(Ssole, 0, 0, 0), farLeg ? SH.soleF : SH.sole], [hullOf(U, 0, 0, 0), farLeg ? SH.f[1] : SH.n[1]], [hullOf(U, -fe, LIGHT[0] * fe * 0.8, LIGHT[1] * fe * 0.8), farLeg ? SH.f[0] : SH.n[0]]] });
    /* its shadow on the ground: under the foot, soft, fainter as the foot rises */
    const mid = mul(add(F.heel, F.toe), 0.5), hgt = Math.max(0, Math.min(F.heel[1], F.toe[1]) - floor - 0.035), g0 = cam.pt([mid[0], 0, mid[2]]), fd = nrm([F.sole[0], 0, F.sole[2]]);
    parts.push({ id: "sh" + s, z: -99, mat: "shadow" + s, layers: [[ellPath(ellipse(g0, [cam.lin(mul(fd, 0.15)), cam.lin([fd[2] * 0.085, 0, -fd[0] * 0.085]), [0, 0.03 * S]]), 0, 0, 0), c.shadow]], op: f2(Math.max(0, 1 - hgt / 0.24)) });
  }
  if (legsD){ hemS.tag = "clip"; hemS.clip = legsD; hemS.d = hemS.layers[0][0]; hemS.fill = G.f[1]; delete hemS.layers; }
  /* (the teacher seated, knees together, the thighs toward us: from the front the knees, foreshortened end-on, read as two separate
     rounds with the dark of the jumper between them. Her LAP is one surface: the space between the knees filled in the lit tone of the
     trousers (drawn over both knees, from just under their tops), so the two knees are one lap with the hem resting on it, and a soft
     fold where they meet) */
  if (B.key === "tutor" && B.lap && part === "body" && lapQ.L && lapQ.R && !(WD && WD.skirt)){
    const dk = (q, k, dy) => { const D = disc([q[0], q[1] + (dy || 0)], q[2] * k); D.n = 20; return D; }, L = lapQ.L, R = lapQ.R, lk = B.lapK == null ? 0.78 : B.lapK, zz = Math.max(L.z, R.z) + 0.0002;
    const lap = hullOf([dk(L[1], lk), dk(R[1], lk), dk(L[2], lk), dk(R[2], lk)], 0, 0, 0), mx = (L[2][0] + R[2][0]) / 2, my = Math.max(L[2][1], R[2][1]) + Math.min(L[2][2], R[2][2]) * 0.7;
    const ct = Math.cos(Ehm.th), st = Math.sin(Ehm.th), lo = []; for (let i = 0; i <= 20; i++){ const t = i / 20 * Math.PI, x = (Ehm.a + 0.4) * Math.cos(t), y = (Ehm.b + 0.4) * Math.sin(t); lo.push([Ehm.c[0] + x * ct - y * st, Ehm.c[1] + x * st + y * ct]); }
    const under = poly(lo.concat([[lo[lo.length - 1][0] - 0.3 * S, lo[lo.length - 1][1] + 0.6 * S], [lo[0][0] + 0.3 * S, lo[0][1] + 0.6 * S]]));      // below the hem's lower edge: the lap shows only there (the hem rests on it)
    parts.push({ id: "lap", z: zz, tag: "clip", clip: under, d: lap, fill: G.n[0] });
    parts.push({ id: "lapF", z: zz + 0.00005, mat: "lapF", layers: [[`M${f1(mx - 0.006 * S)} ${f1(my)}Q${f1(mx - 0.001 * S)} ${f1(my - 0.03 * S)} ${f1(mx + 0.001 * S)} ${f1(my - 0.06 * S)}L${f1(mx + 0.004 * S)} ${f1(my - 0.058 * S)}Q${f1(mx + 0.003 * S)} ${f1(my - 0.03 * S)} ${f1(mx + 0.004 * S)} ${f1(my)}Z`, G.n[1]]] }); }
  }
  /* arms: the sleeve from the shoulder cap to the wrist in one outline, its cuff, the hand (a palm, the fingers together, a thumb) */
  const armBox = {}, armOf = s => {
    const sh = J["sh" + s], el = J["el" + s], wr = J["wr" + s], hd = J["hd" + s], pn = J["pn" + s], Q = chain(sh, el, wr, [B.rSh, B.rUa, B.rEl, B.rFa, B.rWr * 1.08]), e = B.rWr * S * 0.34, mat = "arm" + s;
    { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const q of Q){ x0 = Math.min(x0, q[0] - q[2]); x1 = Math.max(x1, q[0] + q[2]); y0 = Math.min(y0, q[1] - q[2]); y1 = Math.max(y1, q[1] + q[2]); }
      const hq = P(wr), hr = B.hand * S * 1.4; armBox[s] = [Math.min(x0, hq[0] - hr), Math.min(y0, hq[1] - hr), Math.max(x1, hq[0] + hr), Math.max(y1, hq[1] + hr)]; }
    const zu = zmid(sh, el), zf = zmid(el, wr), farU = !part && zu < zt - 0.012, far = !part && zf < zt - 0.012;
    /* the shoulder is the jumper's, not a ball joint: the sleeve's round top lies under the yoke's own outline (the trunk's shoulder cap is
       the same round), and it is drawn all in the lit tone (no shade crescent round it), so that no circle shows on the shoulder: the
       sleeve's shade edge begins below, at the armpit, as the cloth's fold does */
    const cap = (() => { const c0 = P(sh), rr = B.rSh * S * (B.capK == null ? 1 : B.capK) + 0.5, q1 = Q[1], k = 0;
      return (g, dx, dy) => g < 0 ? capsule(c0[0] + LIGHT[0] * k, c0[1] + LIGHT[1] * k, rr, q1[0] + dx, q1[1] + dy, Math.max(0.3, q1[2] + g)) : ""; })();
    const swA = sweep(Q, 0, 7), swU = sweep(Q, 0, 4), withY = fn => B.capK === 0 ? fn : (g, dx, dy) => fn(g, dx, dy) + cap(g, dx, dy);
    const slv = WD && WD.sleeve != null && WD.sleeve < 1 ? WD.sleeve : null;
    if (slv != null){ const se = lerp(sh, el, slv), q0 = P(sh), q1 = P(se), r1 = Math.max(B.rUa * 1.32, B.rSh * 0.95) * S, slf = (g, dx, dy) => capsule(q0[0] + dx, q0[1] + dy, Math.max(0.3, B.rSh * S * 1.05 + g), q1[0] + dx, q1[1] + dy, Math.max(0.3, r1 + g)) + cap(g, dx, dy);
      parts.push({ id: "ak" + s, z: (zu + zf) / 2, mat: "askin" + s + (far ? "f" : "n"), layers: form(sweep(Q, 1, 7), sk, e, far, true) });
      parts.push({ id: "sl" + s, z: Math.max(zu, (zu + zf) / 2) + 0.0002, mat: "sleeve" + s + (farU ? "f" : "n"), layers: form(slf, T, e, farU, true) });
      if (!far) parts.push({ id: "slb" + s, z: Math.max(zu, (zu + zf) / 2) + 0.0003, mat: "slb" + s, layers: [[capsule(q1[0], q1[1], r1 * 0.98, q1[0] + (q1[0] - q0[0]) * 0.06, q1[1] + (q1[1] - q0[1]) * 0.06, r1 * 0.98), T.rib]] }); }
    else if (BUST) parts.push({ id: "ar" + s, z: zt - 0.0025, mat: mat + "n", layers: form(withY(swA), T, e, false, true) });      // (behind the jumper's body: only the sleeve's outer side shows, no tube beside the trunk)
    else if (farU === far && (zu > zt) === (zf > zt)) parts.push({ id: "ar" + s, z: (zu + zf) / 2, mat: mat + (far ? "f" : "n"), layers: form(withY(swA), T, e, far, true) });
    else { parts.push({ id: "ua" + s, z: zu, mat: mat + (farU ? "f" : "n"), layers: form(withY(swU), T, e, farU, true) }); parts.push({ id: "fa" + s, z: zf, mat: mat + (far ? "f" : "n"), layers: form(sweep(Q, 3, 7), T, e, far, true) }); }
    const kz = z => Math.max(1, Math.min(B.castMax || 3.2, 1 + (z - zt - 0.03) / 0.035));          // a part held well out from the body throws its shadow further from itself
    if (zu > zt) cast.push(sweep(Q, 0, 4)); if (zf > zt){ const k2 = kz(zf), sw = sweep(Q, 3, 7); cast.push((g, dx, dy) => sw(g, dx * k2, dy * k2)); }
    if (WD && WD.armParts) for (const p of WD.armParts({ s, Q, sweep, form, P, S, zu, zf, far, farU, T, sk, e, J, B, slv, cam })) parts.push(p);
    if (slv == null || WD.gloves){ const a0 = add(wr, mul(J["fd" + s], -0.026)), A = P(a0), Z = P(wr); const GL = WD && WD.gloves; parts.push({ id: "cf" + s, z: zf + 0.0005, mat: "cuff" + s, layers: [[capsule(A[0], A[1], B.rWr * (GL && GL.cuff || 1.2) * S, Z[0], Z[1], B.rWr * (GL && GL.cuff || 1.2) * S), GL ? (far ? GL.M.f[1] : GL.M.n[1]) : far ? T.f[1] : T.rib]] }); }
    if (o && o.hands){                                         // a hand with fingers (at the size of the teacher): see fingers()
      const HP = fingers(wr, hd, pn, s === "L", o.hands[s], B, P, S, WD && WD.gloves ? (far ? WD.gloves.M.f : WD.gloves.M.n) : far ? sk.f : sk.n, "hn" + s);
      for (const x of HP.parts) parts.push(x);
      if (HP.z > zt){ const k2 = kz(HP.z); cast.push((g, dx, dy) => HP.cast(g, dx * k2, dy * k2)); }
      return; }
    const curl = WD && WD["curl" + s] != null ? WD["curl" + s] : c.curl == null ? 0.5 : c.curl, HL = B.hand, th = s === "L" ? cross(pn, hd) : cross(hd, pn), ca = Math.cos(curl * 1.9), sa = Math.sin(curl * 1.9), fdir = add(mul(hd, ca), mul(pn, sa)), fn = sub(mul(pn, ca), mul(hd, sa));
    const kn = add(wr, mul(hd, HL * 0.5)), pc = add(wr, mul(hd, HL * 0.27)), fc = add(kn, mul(fdir, HL * 0.21)), he = 0.006 * S;
    const Ep = ellipse(P(pc), [cam.lin(mul(hd, HL * 0.33)), cam.lin(mul(th, B.palm)), cam.lin(mul(pn, 0.023))]), Ef = ellipse(P(fc), [cam.lin(mul(fdir, HL * 0.3)), cam.lin(mul(th, B.palm * 0.94)), cam.lin(mul(fn, 0.02))]);
    const t0 = P(add(add(wr, mul(hd, HL * 0.2)), mul(th, B.palm * 0.72))), t1 = P(add(add(add(wr, mul(hd, HL * (0.56 - 0.12 * curl))), mul(th, B.palm * (1.3 - 0.35 * curl))), mul(pn, 0.012 + 0.03 * curl)));
    const hz = zmid(wr, kn) + (P(kn)[2] - P(wr)[2]) * 0.5, tc = e2 => capsule(t0[0] + LIGHT[0] * e2, t0[1] + LIGHT[1] * e2, 0.0155 * S - e2, t1[0] + LIGHT[0] * e2, t1[1] + LIGHT[1] * e2, 0.013 * S - e2), SK = WD && WD.gloves ? (far ? WD.gloves.M.f : WD.gloves.M.n) : far ? sk.f : sk.n;
    parts.push({ id: "hn" + s, z: hz, mat: "hand" + s, layers: [[ellPath(Ep, 0, 0, 0) + ellPath(Ef, 0, 0, 0) + tc(0), SK[1]], [ellPath(Ep, -he, LIGHT[0] * he, LIGHT[1] * he) + ellPath(Ef, -he, LIGHT[0] * he, LIGHT[1] * he) + tc(he * 0.8), SK[0]]] });
    /* at a large size: the breaks between the fingers, drawn on the fingers and turned with them */
    if (B.palm * S > 9 && Math.abs(dot(fn, cam.view)) > 0.4){ const U = cam.lin(mul(fdir, HL * 0.3)), V = cam.lin(mul(th, B.palm * 0.94)), q = P(fc), r3 = v => Math.round(v * 1000) / 1000;
      parts.push({ id: "fg" + s, z: hz + 0.0002, tag: "g", m: [U[0], U[1], V[0], V[1], q[0], q[1]].map(r3), inner: `<path d="M-.5 -.36H.86M-.62 0H.96M-.5 .36H.82" stroke="${SK[1]}" stroke-width=".05" fill="none" stroke-linecap="round" opacity=".8" vector-effect="non-scaling-stroke" style="stroke-width:${f1(Math.max(0.5, 0.006 * S))}px"/>` }); }
    if (hz > zt){ const D = disc(P(kn), B.palm * S); D.n = 12; cast.push((g, dx, dy) => hullOf([D], g, dx, dy)); }
  };
  /* (the teacher's speed) an arm whose pose and hand have not changed since it was last worked out is not worked out again: its parts and
     its shadow on the jumper are kept (o.armKeep, by the signature o.armSig[s]); and an arm's shadow is worked out only when the arm's
     box, moved as far as a shadow goes, reaches the trunk's box (elsewhere the trunk's own outline cuts it away: nothing is seen of it) */
  const AK = o && o.armKeep, CK = B.castK || 1, CDX = -LIGHT[0] * 0.028 * S * CK, CDY = -LIGHT[1] * 0.032 * S * CK;
  if (doArms) for (const s of ["L", "R"]){
    if (AK && AK[s] && AK[s].sig === o.armSig[s]){ for (const p of AK[s].parts) parts.push(p); continue; }
    const p0 = parts.length, c0 = cast.length; armOf(s);
    if (AK){ let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const E of [Ech, Ehm, Ewa, EsL, EsR, Enb]){ const r = Math.max(E.a, E.b); x0 = Math.min(x0, E.c[0] - r); x1 = Math.max(x1, E.c[0] + r); y0 = Math.min(y0, E.c[1] - r); y1 = Math.max(y1, E.c[1] + r); }
      const b = armBox[s], mx = Math.abs(CDX) * 3.2 + 0.003 * S + 1, my = Math.abs(CDY) * 3.2 + 0.003 * S + 1, near = b[2] + mx >= x0 && b[0] - mx <= x1 && b[3] + my >= y0 && b[1] - my <= y1; let d = "";
      if (near) for (let i = c0; i < cast.length; i++) d += cast[i](0.003 * S, CDX, CDY);
      AK[s] = { sig: o.armSig[s], parts: parts.slice(p0), castS: d }; cast.length = c0; }
  }
  const headParts = []; if (doBody) head(J, B, Object.assign({}, cam, { pt: P }), c, headParts, 0.03);
  for (const p of headParts) parts.push(p);
  if (WD && WD.parts && doBody) for (const fn of WD.parts) for (const p of fn({ J, B, P, S, cam, c, zt, trunkD, Ech, Ehm, Ewa, Enb, EsL, EsR, form, sweep, chain, zmid, lerp, lax, T, G, sk, RIM })) parts.push(p);      // (the wardrobe: what is worn or held, placed by the joints)
  if (o && o.extra) for (const p of o.extra(J, P, S)) parts.push(p);          // (the close-ups: what the figure holds, placed by its joints and drawn among its parts by depth)
  const skull = headParts.find(p => p.id === "skull");
  /* the shadows that the arms, the hands and the head throw on the trunk: their own shapes, moved away from the light, kept inside the trunk */
  { const ck = B.castK || 1, dx = -LIGHT[0] * 0.028 * S * ck, dy = -LIGHT[1] * 0.032 * S * ck; let d = ""; for (const fn of cast) d += fn(0.003 * S, dx, dy);
    if (part === "arms") castD = AK ? AK.L.castS + AK.R.castS : d;                  // (the teacher: the arms' shadow belongs to the body's group, under her name tag: handed back with the list)
    else { if (skull && skull.z > zt) d += skull.cast(dx * 1.4, dy * 1.9);
      parts.push({ id: "trunkC", z: zt + 0.0005, tag: "clip", clip: B.key === "tutor" ? trunkUp() : trunkD, d: part ? d + (o.cast || "") : d, fill: T.n[1] }); } }
  /* the far parts first; parts of one material that follow each other are drawn tone by tone (all their shade, then all their light), so
     that where two of them meet there is no seam */
  parts.sort((a, b) => a.z - b.z);
  const list = [];
  for (let i = 0; i < parts.length;){ let j = i; while (j < parts.length && parts[j].mat === parts[i].mat && !parts[j].tag) j++; if (j === i) j = i + 1;
    const run = parts.slice(i, j); let n = 0; for (const p of run) if (p.layers) n = Math.max(n, p.layers.length);
    for (const p of run){ if (p.tag) list.push(p); else if (p.stroke) list.push({ id: p.id, d: p.stroke[0], stroke: p.stroke[1], sw: p.stroke[2] }); }
    for (let q = 0; q < n; q++) for (const p of run){ const L = p.layers; if (!L) continue; const t = L.length === n ? q : q - (n - L.length); if (t >= 0 && L[t][0]) list.push({ id: p.id + t, d: L[t][0], fill: L[t][1], op: p.op }); }
    i = j; }
  if (part === "arms") list.cast = castD;
  return list;
}
const nodeHTML = (n, u) => n.tag === "clip" ? `<g data-p="${n.id}"><clipPath id="${u}${n.id}"><path d="${n.clip}"/></clipPath><path clip-path="url(#${u}${n.id})" d="${n.d}" fill="${n.fill}"/></g>`
  : n.tag === "cp" ? `<clipPath data-p="${n.id}" id="${u}${n.id}"><path d="${n.d}"/></clipPath>`
  : n.tag ? `<g data-p="${n.id}"${n.clip ? ` clip-path="url(#${u}${n.clip})"` : ""}${n.hide ? ` visibility="hidden"` : ""}><g transform="matrix(${n.m.join(" ")})">${n.inner}</g></g>`
  : n.stroke ? `<path data-p="${n.id}" d="${n.d}" fill="none" stroke="${n.stroke}" stroke-width="${n.sw}" stroke-linecap="round"/>` : `<path data-p="${n.id}" d="${n.d}" fill="${n.fill}"${n.op != null ? ` opacity="${n.op}"` : ""}/>`;
function nodeSet(el, n){
  if (n.tag === "clip"){ el.firstChild.firstChild.setAttribute("d", n.clip); el.lastChild.setAttribute("d", n.d); }
  else if (n.tag === "cp") el.firstChild.setAttribute("d", n.d);
  else if (n.tag){ el.firstChild.setAttribute("transform", `matrix(${n.m.join(" ")})`); if (n.hide) el.setAttribute("visibility", "hidden"); else el.removeAttribute("visibility"); if (n.dyn && el._in !== n.inner){ el.firstChild.innerHTML = n.inner; el._in = n.inner; } }
  else { if (el._d !== n.d){ el.setAttribute("d", n.d); el._d = n.d; } if (n.stroke){ if (el._w !== n.sw){ el.setAttribute("stroke-width", n.sw); el._w = n.sw; } return; }      // (what a part already has is not set again, nor read back from the page)
    if (el._f !== n.fill){ if (el._f != null || el.getAttribute("fill") !== n.fill) el.setAttribute("fill", n.fill); el._f = n.fill; } if (n.op != null && el._o !== n.op){ el.setAttribute("opacity", n.op); el._o = n.op; } }
}

/* ---------- who wears what: each material has a lit tone, a shade tone and a light rim, near the viewer, and a lit and a shade tone far
   from it (u is the prefix of the ids of the figure's own gradients: the hair's, the ground shadow's, the blush) ---------- */
function wearer(c, o, u){
  const legs = (c.wd && c.wd.legs) || o.legs || ["#5a6272", "#3f4654"], defs = [];
  defs.push(`<linearGradient id="${u}hg" x1=".1" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="${mixc(c.hair[0], "#ffffff", 0.1)}"/><stop offset=".45" stop-color="${c.hair[1]}"/><stop offset="1" stop-color="${c.hair[2]}"/></linearGradient>`);
  defs.push(`<radialGradient id="${u}sh"><stop offset="0" stop-color="#1d2233" stop-opacity=".34"/><stop offset=".55" stop-color="#1d2233" stop-opacity=".16"/><stop offset="1" stop-color="#1d2233" stop-opacity="0"/></radialGradient>`);
  defs.push(`<radialGradient id="${u}bl"><stop offset="0" stop-color="#e98a7a" stop-opacity="${c.kid ? 0.5 : 0.34}"/><stop offset="1" stop-color="#e98a7a" stop-opacity="0"/></radialGradient>`);
  const top = material(c.top[0], c.top[1]); top.rib = mixc(c.top[0], c.top[1], 0.55);
  /* a woman's chest in a jumper: no drawn lines, only the cloth's light: a soft lit volume across the upper chest, and a broad soft shade
     below it where the knit falls to the waist */
  if (c.fem && !c.kid) defs.push(`<radialGradient id="${u}cv"><stop offset="0" stop-color="${mixc(c.top[0], "#ffffff", 0.16)}" stop-opacity=".42"/><stop offset=".6" stop-color="${mixc(c.top[0], "#ffffff", 0.08)}" stop-opacity=".2"/><stop offset="1" stop-color="${c.top[0]}" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="${u}cs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${darker(c.top[1], 0.1)}" stop-opacity="0"/><stop offset=".45" stop-color="${darker(c.top[1], 0.1)}" stop-opacity=".2"/><stop offset="1" stop-color="${darker(c.top[1], 0.1)}" stop-opacity="0"/></linearGradient>`);
  const W0 = { u, skinM: material(mixc(c.skin[0], c.skin[1], 0.62), mixc(c.skin[1], c.skin[2], 0.3)), hairM: Object.assign(material(c.hair[1], c.hair[2]), { hi: mixc(c.hair[0], "#ffffff", 0.2), gh: `url(#${u}hg)` }), topM: top, legM: material(legs[0], legs[1]),
    shoeM: { n: ["#4a4340", "#2c2623"], f: ["#3a3431", "#231e1c"], sole: "#e6dfd2", soleF: "#bdb6aa" }, style: c.style, ink: "#2a2422", browC: c.brow || c.hair[2], lip: c.lip || "#bf6660", lipC: mixc(c.lip || "#bf6660", "#7a3030", 0.3), iris: c.iris,
    curl: o.curl, smile: o.smile, speaks: o.speaks, shadow: `url(#${u}sh)`, defs: defs.join(""), fem: c.fem, kid: c.kid, beard: c.beard, bow: c.bow, tag: o.tag, face: c.face, freckles: c.freckles, old: c.old,
    glasses: c.glassesOn ? (c.glasses || "#26262b") : null, headwear: c.headwear, live: o.live, mouthInner: o.mouthInner, tagAt: o.tagAt, tagBox: o.tagBox, tagFlip: o.tagFlip, tagId: o.tagId };
  if (c.wd){ W0.wd = c.wd; if (c.wd.shoeM) W0.shoeM = c.wd.shoeM; if (c.wd.defs) defs.push(c.wd.defs(u)); W0.defs = defs.join(""); }
  if (c.headwear === "scarf" && !(c.wd && c.wd.wig)){ const sc = c.scarfCol || ["#8a9863", "#667545"]; W0.hairM = Object.assign(material(sc[0], sc[1]), { hi: sc[0], gh: sc[0] }); }
  return W0;
}

/* ---------- the animation clock: every moving figure on the page, one requestAnimationFrame ---------- */
const LIVE = new Set(); let ticking = false;
const STAT = { frames: 0, ms: 0 };                                      // how long the drawing takes (for the measurements in dev/design)
function tick(){
  let any = false; const t00 = performance.now();
  for (const f of LIVE){ const g = f.ref.deref ? f.ref.deref() : f.ref; if (!g){ LIVE.delete(f); continue; } any = true;
    if (!g.isConnected) continue;
    let t = 0; try { const svg = f.mark.ownerSVGElement; t = svg.getCurrentTime() - f.mark.getStartTime(); } catch (e){ t = -1; }
    if (t < 0){ if (f.t0 == null) continue; t = 0; }
    const ph = t / f.dur; if (f.last === ph) continue; f.last = ph; f.t0 = 1; f.draw(g, ph); }
  STAT.frames++; STAT.ms += performance.now() - t00;
  if (any) requestAnimationFrame(tick); else ticking = false;
}
function play(g, mark, dur, draw){ LIVE.add({ ref: typeof WeakRef === "function" ? new WeakRef(g) : g, mark, dur, draw }); if (!ticking){ ticking = true; requestAnimationFrame(tick); } }

/* FIG.figure(c, o): the <g> of a whole figure. c: the person (traits); o.clip: the action; o.still: one frame (o.phase, 0..1, default the
   clip's own); o.x, o.y: where the middle of the feet stands in the picture box; o.k: its size; o.yaw: the camera (degrees; 0 = the figure
   faces the viewer, 90 = it faces right). A loop is drawn at sixty phases a second of its length; each is worked out once and kept. */
function figure(c, o){
  c = lookWear(c);
  const C = clipOf(o.clip), B = bodyOf(c, o), u = "f" + (seq++) + "_", W = wearer(c, o, u), yaw = (o.yaw != null ? o.yaw : C.yaw) * Math.PI / 180, pitch = (o.pitch != null ? o.pitch : C.pitch || 7) * Math.PI / 180;
  if (o.curl == null) W.curl = C.curl;
  const cam = camera(yaw, pitch, B.H * (o.k || 1), o.x != null ? o.x : 80, o.y != null ? o.y : GY), floor = floorOf(C, B);
  const once = C.once, prog = ph => once ? Math.max(0, Math.min(1, (ph - once[0]) / (once[1] - once[0]))) : ph;      // a movement made once: held at its start, made, held at its end
  const lowAll = J => Math.min(lowest(J), J.wrL[1] - B.palm * 1.2, J.wrR[1] - B.palm * 1.2, J.chest[1] - B.chest[2] * 1.05, J.root[1] - B.hem[2] * 1.05);      // (a fall: whatever is lowest lies on the ground: the feet, then the hands, then the body)
  const flAt = k => o.clip === "swim" ? swimLevel(C, B) : C.ground ? lowest(skeleton(k, B)) : C.lie ? lowAll(skeleton(k, B)) : o.still && !C.once && o.clip !== "jump" && o.clip !== "swim" ? lowest(skeleton(k, B)) : floor;      // (a dance: the lowest foot on the ground in every frame)
  const fixK = k => W.wd && W.wd.keyFix ? W.wd.keyFix(k, B) : k;      // (the wardrobe: an arm that holds something)
  const listAt = ph => { const k = fixK(keyAt(C, prog(ph))); return frame(k, B, cam, W, flAt(k), o); };
  const g = mk(""), ph0 = o.phase != null ? o.phase : (C.still || 0), html = L => L.map(n => nodeHTML(n, u)).join("");
  const first = o.still ? (k => frame(k, B, cam, W, flAt(k), o))(fixK(keyAt(C, ph0))) : listAt(0);
  if (o.still || C.n < 2){ g.innerHTML = `<defs>${W.defs}</defs>` + html(first); return g; }
  const dur = o.dur || C.dur, NF = Math.max(8, Math.round(dur * 60)), kept = new Array(NF);
  g.innerHTML = `<defs>${W.defs}</defs><g class="fig">` + html(first) + `</g><g opacity="1"><animate attributeName="opacity" values="1;1" dur="${f2(dur)}s" repeatCount="indefinite"/></g>`;
  const mark = g.lastChild.firstChild;
  let order = first.map(n => n.id).join(" "), byId = null;
  /* (figures 12) a one-way action (once) is drawn from its first frame to its last and the last held: no wrap, no fade */
  play(g, mark, dur, (root, ph) => { const host = root.children[1], i = once ? Math.max(0, Math.min(Math.round(ph * NF), NF - 1)) : ((Math.round(ph * NF) % NF) + NF) % NF, K = kept[i] || (kept[i] = (() => { const L = listAt(i / NF); return { L, ord: L.map(n => n.id).join(" ") }; })()), list = K.L;
    if (root._fi === i) return; root._fi = i;
    if (!byId){ byId = {}; for (const el of host.children) if (el.hasAttribute("data-p")) byId[el.getAttribute("data-p")] = el; }
    if (K.ord !== order){ order = K.ord; const seen = {}; for (const n of list){ let el = byId[n.id]; if (!el){ el = mk(nodeHTML(n, u)).firstChild; byId[n.id] = el; } host.appendChild(el); seen[n.id] = 1; }
      for (const id in byId) if (!seen[id]){ byId[id].remove(); delete byId[id]; } }
    for (const n of list){ const el = byId[n.id]; if (el) nodeSet(el, n); } });
  return g;
}
/* how far the figure reaches in an action, seen by the action's camera: left, right and up from the middle of its feet's ground, in body
   heights (over the whole loop, so that the frozen card and the moving one are framed alike) */
function extent(C, B, yaw){ const key = B.key + "|" + yaw; C.ext = C.ext || {}; if (C.ext[key]) return C.ext[key];
  const cam = camera(yaw * Math.PI / 180, 7 * Math.PI / 180, 1, 0, 0), E = { x0: 1e9, x1: -1e9, top: 0 }; let fl = floorOf(C, B);
  const put = (p, r) => { const q = cam.pt([p[0], p[1] - fl, p[2]]); E.x0 = Math.min(E.x0, q[0] - r); E.x1 = Math.max(E.x1, q[0] + r); E.top = Math.max(E.top, -q[1] + r); };
  const n = C.loop || C.once ? 12 : 1;
  for (let i = 0; i < n; i++){ const J = skeleton(keyAt(C, C.loop ? i / n : n > 1 ? i / (n - 1) : (C.still || 0)), B); if (C.ground) fl = lowest(J);
    put(J.head, B.hh * 1.16); for (const s of ["L", "R"]){ put(J["sh" + s], B.rSh); put(J["el" + s], B.rEl); put(add(J["wr" + s], mul(J["hd" + s], B.hand * 0.8)), B.palm); put(J["kn" + s], B.rKnee); put(J["ft" + s].heel, 0.035); put(J["ft" + s].toe, 0.03); } put(J.root, B.hem[0]); }
  return C.ext[key] = E; }
/* (figures 15) swimming: the water line is at the chest (the mean height of the chest joint over the loop: the body does not bob with its
   lowest point), and the card is framed by what shows above the water: the head, the shoulders and the arms over the loop, as large as
   the card's width (SWIM.l to SWIM.r) and its height above the water line (SWIM.top to SWIM.surf) allow; the legs, and a hand deep in
   its pull, under the water, may go out of the card */
const SWIM = { surf: 126, top: 30, l: 14, r: 150, kmax: 2.2, drop: 0.035, deep: 0.06 };
function swimLevel(C, B){ const key = "sw" + B.key; if (C[key] != null) return C[key]; let y = 0; for (let i = 0; i < C.n; i++) y += skeleton(C.keys[i], B).chest[1] / C.n; return C[key] = y; }
function swimFrame(C, B, o){
  const yaw = (o.yaw != null ? o.yaw : C.yaw) * Math.PI / 180, cam = camera(yaw, (o.pitch != null ? o.pitch : C.pitch || 7) * Math.PI / 180, 1, 0, 0), fl = swimLevel(C, B), E = { x0: 1e9, x1: -1e9, top: 0 };
  const put = (p, r) => { if (p[1] - fl < -SWIM.deep) return; const q = cam.pt([p[0], p[1] - fl, p[2]]); E.x0 = Math.min(E.x0, q[0] - r); E.x1 = Math.max(E.x1, q[0] + r); E.top = Math.max(E.top, -q[1] + r); };      // (what is deep under the water may leave the card)
  for (let i = 0; i < 12; i++){ const J = skeleton(keyAt(C, i / 12), B); put(J.head, B.hh * 1.16); for (const s of ["L", "R"]){ put(J["sh" + s], B.rSh); put(J["el" + s], B.rEl); put(add(J["wr" + s], mul(J["hd" + s], B.hand * 0.8)), B.palm); } }
  const k = Math.max(0.6, Math.min(SWIM.kmax, Math.min((SWIM.r - SWIM.l) / (E.x1 - E.x0), (SWIM.surf - SWIM.top) / E.top) / B.H));
  return { k, x: SWIM.r - E.x1 * B.H * k, y: SWIM.surf - SWIM.drop * B.H * k }; }
/* the part of the 160 x 190 box a figure may fill in each action's card (the rest is for what stands round it) */
const FRAME = { swim: [6, 154, 70], fall: [10, 150, 40], play: [2, 126, 12], call: [10, 112, 16], work: [8, 100, 22], listen: [26, 134, 16], raise: [26, 134, 12], run: [30, 152, 14], talk: [6, 122, 18], dance: [12, 148, 16], standup: [14, 126, 14], sitdown: [14, 126, 14], jump: [16, 144, 12], stand: [20, 140, 14] };
/* FIG.act(act, c, o): the picture of an action in the 160 x 190 box: the figure and what stands round it (the ground that goes by under a
   walker or a runner at the speed of the feet, the lines behind a runner, the arcs under a jump). o.still: the frozen frame (the card);
   o.k, o.ox: size and place (the action's own in MOVES) */
function act(name, c, o){
  c = lookWear(c);
  if (name === "call") c = withWd(c, w => { w.parts.push(phonePart); });
  if (name === "listen") c = withWd(c, w => { if (!w.hat){ w.hat = { kind: "cans", M: material("#DB4D3A", "#AB3529") }; w.tall = Math.max(w.tall || 0, 0.3); } });
  if (o.card) c = withWd(c, w => { addFix(w, keyArm("L", () => ({ wr: [0.37, -0.01, 0.08], hd: [1, 0.35, 0.1], pn: [0, -0.2, 1], pole: [0.3, -1, -0.3] }))); w.curlL = 0.7; });
  const C = clipOf(name), B = bodyOf(c, o), still = !!o.still, g = mk(""), u = "fg" + (seq++) + "_"; let x = 80 + (o.ox || 0), k = o.k || 1;
  if (!o.k && o.fit !== false){                             // a card is a poster of its action: the figure fills it (its whole reach in the loop, a small margin, the feet on the ground line)
    const E = extent(C, B, o.yaw != null ? o.yaw : C.yaw), F = o.house ? (o.house === "left" ? [62, 154, 46] : [6, 98, 46]) : FRAME[name] || [14, 146, 12];
    const chair = name === "standup" || name === "sitdown" ? 0.2 : 0, x0 = Math.min(E.x0, -chair * 1.5), x1 = E.x1;
    const tall = c.wd && c.wd.tall ? c.wd.tall * B.hh : 0;      // (a hat, an umbrella: the figure a little smaller, so that it is whole in the card)
    k = Math.max(0.6, Math.min(o.kmax || 1.5, Math.min((F[1] - F[0]) / (x1 - x0), (GY - F[2]) / (E.top + tall)) / B.H)); k = Math.round(k * 1000) / 1000;
    x = (F[0] + F[1]) / 2 - (x0 + x1) / 2 * B.H * k; }

  if (name === "play" && !o.k && k < 0.95){ k = 0.95; }      // (the kick's reach is wide: the player is kept large, the ends of the swing may leave the card)
  let back = "", front = "", deskFront = "", swimMid = null; const ph0f = () => o.phase != null ? o.phase : (C.still || 0);
  let swimY = 0, swimBud = null; if (name === "swim"){ const F2 = swimFrame(C, B, o); swimY = o.y != null ? o.y : F2.y; if (!o.k && o.fit !== false){ k = F2.k; x = F2.x + (o.ox || 0); }
    if (o.buddy){ const k0 = k, x0 = x; k = k0 * 0.7; x = SWIM.r - (SWIM.r - x0) * 0.7; swimY = o.y != null ? o.y : SWIM.surf - SWIM.drop * B.H * k; swimBud = { k: k0 * 0.56, x: SWIM.r - 50 - (SWIM.r - x0) * 0.56, y: swimY - 26 }; }      // (figures 15) two in one pool: the near one smaller, the other in the far lane
    o = Object.assign({}, o, { y: swimY }); }      // (figures 15) swimming: the chest at the water line (o.y), the swimmer framed by what is above the water
  if (o.post){ k = (o.post === "short" ? 0.66 : 1) * (c.kid ? 0.86 : 1) * 156 / ((0.866 + 1.84 * B.hh) * B.H); x = 90; }      // tall / short: the same person at two heights on the same floor
  if (o.card){ k = 0.66; x = 46; }
  if (o.door){ k = 0.6; x = 34 + (o.ox || 0); }
  if (C.trav && !o.bare && !o.door){                        // the ground goes by: marks on it, one stride's length to the loop, so that a foot on the ground does not slide
    const yaw = C.yaw * Math.PI / 180, cam = camera(yaw, 7 * Math.PI / 180, B.H * k, x, o.y != null ? o.y : GY), T = C.trav * (B.thigh + B.shin), m = Math.max(1, Math.round(T * B.H * k * Math.sin(yaw) / 24)), sp = T / m;
    const a = cam.pt([-0.2, 0, 0]), b = cam.pt([-0.2, 0, 0.07]), d = cam.lin([0, 0, -sp]); let marks = "";
    for (let i = -8; i <= 8; i++) marks += `M${f1(a[0] - d[0] * i)} ${f1(a[1] - d[1] * i)}L${f1(b[0] - d[0] * i)} ${f1(b[1] - d[1] * i)}`;
    back += `<clipPath id="${u}g"><rect x="12" y="146" width="136" height="44"/></clipPath><g clip-path="url(#${u}g)"><g>` + (still ? "" : `<animateTransform attributeName="transform" type="translate" values="0 0;${f2(d[0])} ${f2(d[1])}" dur="${f2(C.dur / m)}s" repeatCount="indefinite"/>`) +
      `<path d="${marks}" stroke="#414B5E" stroke-opacity=".2" stroke-width="2.4" stroke-linecap="round"/></g></g>`;
  }
  const D1 = f2(C.dur), fade = (vals, kts) => still ? "" : `<animate attributeName="opacity" values="${vals}" keyTimes="${kts}" dur="${D1}s" repeatCount="indefinite"/>`, INK = `stroke="#414B5E" stroke-opacity=".3"`;
  if (o.house && !o.bare){                                  // arriving / leaving: the house, and the arrow on the ground to its door or from it
    const left = o.house === "left", y = 183, x0 = left ? 46 : 24, x1 = left ? 150 : 112;
    back += `<g transform="translate(${left ? -4 : 88} 72) scale(.5)">${oneThing({ is: "house", looks: ["red roof"] }).outerHTML}</g>`;
    front += `<path d="M${x0} ${y} H${x1 - 8}" stroke="#3fae5a" stroke-width="6" stroke-linecap="round"/><path d="M${x1 - 14} ${y - 8} L${x1} ${y} L${x1 - 14} ${y + 8}" stroke="#3fae5a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if ((name === "standup" || name === "sitdown") && !o.bare){ // the chair, seen by the figure's own camera, under the hips of the seated key; in the frozen frame an arrow says which way
    const yaw = (o.yaw != null ? o.yaw : C.yaw) * Math.PI / 180, cam = camera(yaw, 7 * Math.PI / 180, B.H * k, x, o.y != null ? o.y : GY), K = skeleton(C.keys[name === "standup" ? 0 : C.n - 1], B), fl = floorOf(C, B);
    const sy = K.root[1] - fl - B.rHip * 0.92, cx = K.root[0], cz = K.root[2] - 0.035, w = 0.125, dp = 0.12, P3 = (a, b2, c2) => cam.pt([cx + a, b2, cz + c2]), ln = (p, q, sw, col) => `<path d="M${f1(p[0])} ${f1(p[1])}L${f1(q[0])} ${f1(q[1])}" stroke="${col}" stroke-width="${f1(sw * B.H * k)}" stroke-linecap="round"/>`;
    const WD = ["#b08a62", "#8a6a4a", "#6e5238"]; let ch = "";
    for (const [a, c2] of [[w, -dp], [-w, -dp]]) ch += ln(P3(a, 0.01, c2), P3(a, sy + 0.34, c2 - 0.02), 0.03, WD[2]);
    ch += ln(P3(w, sy + 0.3, -dp - 0.018), P3(-w, sy + 0.3, -dp - 0.018), 0.075, WD[1]) + ln(P3(w, sy + 0.17, -dp - 0.012), P3(-w, sy + 0.17, -dp - 0.012), 0.03, WD[1]);
    for (const [a, c2] of [[w, dp], [-w, dp]]) ch += ln(P3(a, 0.01, c2), P3(a, sy - 0.02, c2), 0.03, a < 0 ? WD[1] : WD[2]);
    const q = [P3(w, sy - 0.012, -dp), P3(w, sy - 0.012, dp), P3(-w, sy - 0.012, dp), P3(-w, sy - 0.012, -dp)];
    ch += `<path d="${poly(q)}" fill="${WD[0]}" stroke="${WD[0]}" stroke-width="${f1(0.03 * B.H * k)}" stroke-linejoin="round"/><path d="M${f1(q[1][0])} ${f1(q[1][1] + 0.016 * B.H * k)}L${f1(q[2][0])} ${f1(q[2][1] + 0.016 * B.H * k)}" stroke="${WD[1]}" stroke-width="${f1(0.016 * B.H * k)}" stroke-linecap="round"/>`;
    const g0 = P3(0, 0, 0); back += `<ellipse cx="${f1(g0[0])}" cy="${f1(g0[1])}" rx="${f1(0.2 * B.H * k)}" ry="${f1(0.035 * B.H * k)}" fill="#1d2233" opacity=".1"/>` + ch;
    if (still || o.arrow){ const up = name === "standup", ax = 136, y0 = up ? 92 : 48, y1 = up ? 48 : 92, hd = up ? 1 : -1; front += `<path d="M${ax} ${y0} V${y1 + hd * 4}" stroke="#3fae5a" stroke-width="7" stroke-linecap="round"/><path d="M${ax - 11} ${y1 + hd * 12} L${ax} ${y1} L${ax + 11} ${y1 + hd * 12}" stroke="#3fae5a" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; }
  }
  if (name === "talk" && !o.bare){                          // the speech bubble: its dots come one after the other, and go
    const dot = i => { const f = f2(0.08 + i * 0.12); return `<circle cx="${112 + i * 15}" cy="34" r="4.4" fill="#6a55b8">${fade("0;0;1;1;0", `0;${f};${f2(f + 0.14)};0.86;1`)}</circle>`; };
    front += `<path d="M104 14H148Q154 14 154 20V48Q154 54 148 54H118L104 66L108 54H104Q98 54 98 48V20Q98 14 104 14Z" fill="#fffdf8" stroke="#414B5E" stroke-opacity=".55" stroke-width="2" stroke-linejoin="round"/>` + dot(0) + dot(1) + dot(2);
  }
  if (name === "dance" && !o.bare){                         // music in the air: two notes that bob
    const note = (nx, ny, sc) => `<g transform="translate(${nx} ${ny}) scale(${sc})"><ellipse rx="6" ry="4.4" fill="#6a55b8" transform="rotate(-20)"/><path d="M5.4 -1V-22q9 2 11 10" stroke="#6a55b8" stroke-width="3" fill="none" stroke-linecap="round"/></g>`, bob = v => still ? "" : `<animateTransform attributeName="transform" type="translate" values="${v}" dur="${D1}s" repeatCount="indefinite"/>`;
    front += `<g>${bob("0 0;0 -5;0 0")}${note(16, 40, 0.9)}</g><g>${bob("0 -5;0 0;0 -5")}${note(140, 30, 0.8)}</g>`;      // (in the corners, clear of the larger figure)
  }
  if (name === "run" && !o.bare) front += `<g>` + (still ? "" : `<animate attributeName="opacity" values="1;0.4;1;0.4;1" keyTimes="0;0.25;0.5;0.75;1" dur="${C.dur}s" repeatCount="indefinite"/>`) + `<path d="M16 92h20M9 108h24M18 124h15" stroke="#414B5E" stroke-opacity=".3" stroke-width="2.8" stroke-linecap="round"/></g>`;
  if (name === "jump" && still && !o.bare) front += `<path transform="translate(${f1(x - 80)} 0)" d="M62 157Q80 165 98 157M69 165Q80 169.5 91 165" stroke="#414B5E" stroke-opacity=".3" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  /* ---------- (figures 11) falling, playing, calling, working, listening, going out; the card held; the measuring post ---------- */
  const camA = (ph) => { const yw = (o.yaw != null ? o.yaw : C.yaw) * Math.PI / 180, cm = camera(yw, 7 * Math.PI / 180, B.H * k, x, o.y != null ? o.y : GY), kk = keyAt(C, ph), J = skeleton(kk, B), fl = C.lie ? Math.min(lowest(J), J.wrL[1] - B.palm * 1.2, J.wrR[1] - B.palm * 1.2, J.chest[1] - B.chest[2] * 1.05, J.root[1] - B.hem[2] * 1.05) : floorOf(C, B); return { J, P: p => cm.pt([p[0], p[1] - fl, p[2]]), S: B.H * k, cm }; };
  const SND = `stroke="#6a55b8" fill="none" stroke-linecap="round"`;
  const ballArt = R => { const el = oneThing({ is: "ball", looks: ["red"], placed: 1 }); el.querySelectorAll("ellipse").forEach(e => { if ((+e.getAttribute("cy") || 0) > 130 && (+e.getAttribute("ry") || 0) < 16) e.remove(); }); const b2 = measure(el), f = 2 * R / Math.max(b2.w, b2.h);      // the course's own ball (things.js), without its shadow
    return el.childNodes.length ? `<g transform="translate(${f1(-(b2.x + b2.w / 2) * f)} ${f1(-(b2.y + b2.h / 2) * f)}) scale(${f2(f * 100) / 100})">${el.innerHTML}</g>` : `<circle r="${f1(R)}" fill="#AB3529"/><circle r="${f1(R * 0.88)}" cx="${f1(-R * 0.08)}" cy="${f1(-R * 0.1)}" fill="#DB4D3A"/>`; };
  if (name === "fall" && !o.bare){                          // the stone the foot catches on, the dust where the body lands; in the frozen frame arcs behind the falling body
    const A = camA(0.22), ft = A.P(A.J.ftR.toe[2] < A.J.ftL.toe[2] ? A.J.ftR.toe : A.J.ftL.toe), Z = camA(1), hd = Z.P(Z.J.chest), sx = f1(ft[0] + 5), sy = f1(GY + 1);
    back += `<path d="M${f1(ft[0] - 4)} ${sy}Q${f1(ft[0] - 3)} ${f1(GY - 8)} ${sx} ${f1(GY - 9)}Q${f1(ft[0] + 13)} ${f1(GY - 8)} ${f1(ft[0] + 14)} ${sy}Z" fill="#9b9488"/><path d="M${f1(ft[0] - 1)} ${f1(GY - 5)}Q${sx} ${f1(GY - 8.5)} ${f1(ft[0] + 9)} ${f1(GY - 7)}" stroke="#c9c3b6" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    const puff = (px, py, r) => `<circle cx="${f1(px)}" cy="${f1(py)}" r="${r}" fill="#ddd6c8"/>`, hx = Math.min(146, hd[0] + 14);
    if (still){ const M = camA(ph0f()), q = M.P(M.J.chest); front += `<path d="M${f1(q[0] - 46)} ${f1(q[1] - 30)}Q${f1(q[0] - 30)} ${f1(q[1] - 40)} ${f1(q[0] - 16)} ${f1(q[1] - 34)}M${f1(q[0] - 54)} ${f1(q[1] - 12)}Q${f1(q[0] - 40)} ${f1(q[1] - 22)} ${f1(q[0] - 28)} ${f1(q[1] - 16)}M${f1(q[0] - 30)} ${f1(q[1] - 46)}Q${f1(q[0] - 12)} ${f1(q[1] - 54)} ${f1(q[0] + 4)} ${f1(q[1] - 46)}" ${INK} stroke-width="3.6" fill="none" stroke-linecap="round"/>`; }
    else front += `<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;${f2(C.once[1] - 0.04)};${f2(C.once[1])};0.72;0.82;1" dur="${D1}s" repeatCount="indefinite"/>` + puff(hx, GY - 3, 6) + puff(hx + 9, GY - 8, 4.4) + puff(hx - 12, GY - 1, 4) + puff(hd[0] - 30, GY - 2, 3.6) + `<path d="M${f1(hx - 2)} ${GY - 16}l-3 -8M${f1(hx + 9)} ${GY - 16}l4 -7M${f1(hx - 14)} ${GY - 12}l-6 -5" ${INK} stroke-width="2.6" stroke-linecap="round"/></g>`;
  }
  if (name === "play" && !o.bare){                          // the ball: struck by the foot, it goes up, slows, and comes down on the foot again (a thrown ball's curve)
    const tk = 0.5, A = camA(tk), kf = A.J.ftL.toe[2] > A.J.ftR.toe[2] ? A.J.ftL : A.J.ftR, q0 = A.P(add(kf.toe, [0, 0.03, 0.06])), R = Math.max(11, 0.085 * A.S), bx = Math.min(150 - R, q0[0] + R * 0.5), by = Math.min(GY - R, q0[1] - R * 0.3), H = Math.min(by - R - 8, 0.8 * A.S), AMP = Math.max(0, Math.min(16, 151 - R - bx)), pts = [];
    for (let i = 0; i <= 10; i++){ const u = i / 10; pts.push([u, bx + AMP * Math.sin(u * Math.PI), by - H * 4 * u * (1 - u)]); }
    const seq2 = pts.map(p => ({ t: (tk + p[0]) % 1, x: p[1], y: p[2] })); seq2.pop(); seq2.sort((a, b2) => a.t - b2.t); const p0 = seq2[0], full = [{ t: 0, x: p0.t ? seq2[seq2.length - 1].x + (p0.x - seq2[seq2.length - 1].x) * (1 - seq2[seq2.length - 1].t) / (1 - seq2[seq2.length - 1].t + p0.t) : p0.x, y: p0.t ? seq2[seq2.length - 1].y + (p0.y - seq2[seq2.length - 1].y) * (1 - seq2[seq2.length - 1].t) / (1 - seq2[seq2.length - 1].t + p0.t) : p0.y }].concat(seq2.filter(q => q.t > 0)); full.push({ t: 1, x: full[0].x, y: full[0].y });
    const sx2 = bx + AMP * Math.sin(0.1 * Math.PI), sy2 = by - H * 4 * 0.1 * 0.9;
    front += `<g transform="translate(${f1(still ? sx2 : full[0].x)} ${f1(still ? sy2 : full[0].y)})">` + (still ? `<path d="M${f1(-R * 0.5)} ${f1(R + 3)}v7M${f1(R * 0.5)} ${f1(R + 3)}v7M0 ${f1(R + 5)}v8" ${INK} stroke-width="2.6" stroke-linecap="round"/>` : `<animateTransform attributeName="transform" type="translate" values="${full.map(q => f1(q.x) + " " + f1(q.y)).join(";")}" keyTimes="${full.map(q => f2(q.t)).join(";")}" dur="${D1}s" repeatCount="indefinite"/>`) +
      ballArt(R) + `</g>`;
  }
  if (name === "call" && !o.bare){                          // the telephone at the ear (drawn with the figure: PHONE below); its signal goes out, and another telephone rings
    const A = camA(0), hq = A.P(A.J.head), hx = hq[0] - 0.75 * B.hh * A.S, hy = hq[1] - 0.3 * B.hh * A.S, arc = (r, a0, a1) => `M${f1(hx + r * Math.cos(a0))} ${f1(hy + r * Math.sin(a0))}A${r} ${r} 0 0 1 ${f1(hx + r * Math.cos(a1))} ${f1(hy + r * Math.sin(a1))}`;
    front += [0, 1, 2].map(i => `<path d="${arc(13 + i * 8.5, -2.5, -1.75)}" ${SND} stroke-width="3.2">${fade("0;0;1;1;0;0", `0;${f2(0.04 + i * 0.1)};${f2(0.1 + i * 0.1)};${f2(0.62 + i * 0.1)};${f2(0.7 + i * 0.1)};1`)}</path>`).join("") +
      `<g transform="translate(132 40)"><g transform="rotate(${still ? 10 : 0})">` + (still ? "" : `<animateTransform attributeName="transform" type="rotate" values="0;0;-11;11;-11;11;-11;0;0" keyTimes="0;0.3;0.38;0.46;0.54;0.62;0.7;0.78;1" dur="${D1}s" repeatCount="indefinite"/>`) +
      `<rect x="-11.5" y="-19" width="23" height="38" rx="5" fill="#2c3142"/><rect x="-11.5" y="-19" width="21" height="36.5" rx="4.6" fill="#4c5366"/><rect x="-8.5" y="-14" width="16" height="25" rx="1.6" fill="#cfe8fb"/><circle cy="-1.5" r="5.4" fill="#3fae5a"/><circle cy="14.6" r="1.6" fill="#aeb5c0"/>
      <path d="M16 -17q6 7 2 15M22 -21q8 11 3 23M-16.5 5q-6 7-2 13" ${SND} stroke-width="2.8">${fade("0;0;1;1;0;0", "0;0.3;0.36;0.78;0.86;1")}</path></g></g>`;
  }
  if (name === "work" && !o.bare){                          // the chair under the hips, the desk before the knees, a screen turned a little to the viewer, the keyboard under the hands, papers
    const A = camA(0), J = A.J, P3 = A.P, sc = A.S, ln = (p, q, sw, col) => `<path d="M${f1(p[0])} ${f1(p[1])}L${f1(q[0])} ${f1(q[1])}" stroke="${col}" stroke-width="${f1(sw * sc)}" stroke-linecap="round"/>`, quad = (pts, fill) => `<path d="${poly(pts.map(p => [p[0], p[1]]))}" fill="${fill}"/>`;
    const fl = lowest(J), gy = fl, hipY = J.root[1] - B.rHip * 0.92, cz = J.root[2] - 0.03, w = 0.125, dp = 0.12, WD2 = ["#b08a62", "#8a6a4a", "#6e5238"], Q = (a, y, z2) => P3([a, y, z2]);
    let ch = ""; for (const [a, c2] of [[w, -dp], [-w, -dp]]) ch += ln(Q(a, gy + 0.01, cz + c2), Q(a, hipY + 0.34, cz + c2 - 0.02), 0.03, WD2[2]);
    ch += ln(Q(w, hipY + 0.3, cz - dp - 0.018), Q(-w, hipY + 0.3, cz - dp - 0.018), 0.075, WD2[1]);
    for (const [a, c2] of [[w, dp], [-w, dp]]) ch += ln(Q(a, gy + 0.01, cz + c2), Q(a, hipY - 0.02, cz + c2), 0.03, a < 0 ? WD2[1] : WD2[2]);
    ch += quad([Q(w, hipY - 0.012, cz - dp), Q(w, hipY - 0.012, cz + dp), Q(-w, hipY - 0.012, cz + dp), Q(-w, hipY - 0.012, cz - dp)], WD2[0]);
    const g0 = Q(0, gy, cz + 0.2); back += `<ellipse cx="${f1(g0[0])}" cy="${f1(g0[1])}" rx="${f1(0.36 * sc)}" ry="${f1(0.04 * sc)}" fill="#1d2233" opacity=".1"/>` + ch;
    /* the desk: its top at the height of the wrists, from before the trunk forward; the screen on it, facing the worker and a little to us */
    const hand = J.wrL, ty = hand[1] - 0.045, z0 = J.root[2] + 0.2, z1 = z0 + 0.5, dw = 0.26, TOP = ["#d9b27a", "#b98a52", "#8f6a3c"];
    let dk = ln(Q(-dw, gy + 0.01, z1 - 0.04), Q(-dw, ty, z1 - 0.04), 0.03, TOP[2]) + ln(Q(-dw, gy + 0.01, z0 + 0.06), Q(-dw, ty, z0 + 0.06), 0.03, TOP[2]);
    let dn = ln(Q(dw, gy + 0.01, z1 - 0.04), Q(dw, ty, z1 - 0.04), 0.03, TOP[1]) + quad([Q(dw, ty, z0), Q(dw, ty, z1), Q(dw, ty - 0.03, z1), Q(dw, ty - 0.03, z0)], TOP[1]) + quad([Q(-dw, ty, z0), Q(dw, ty, z0), Q(dw, ty, z1), Q(-dw, ty, z1)], TOP[0]);
    const sz = z1 - 0.13, sw2 = 0.17, sh2 = 0.22, s0 = ty + 0.06, scr = [Q(-sw2, s0, sz + 0.05), Q(sw2, s0, sz - 0.05), Q(sw2, s0 + sh2, sz - 0.05), Q(-sw2, s0 + sh2, sz + 0.05)], inn = (u, v) => { const a = [scr[0][0] + (scr[1][0] - scr[0][0]) * u, scr[0][1] + (scr[1][1] - scr[0][1]) * u], b2 = [scr[3][0] + (scr[2][0] - scr[3][0]) * u, scr[3][1] + (scr[2][1] - scr[3][1]) * u]; return [a[0] + (b2[0] - a[0]) * v, a[1] + (b2[1] - a[1]) * v]; };
    const blink = still ? "" : `<animate attributeName="opacity" values="1;0.35;1;0.35;1" keyTimes="0;0.25;0.5;0.75;1" dur="${D1}s" repeatCount="indefinite"/>`;
    dn += ln(Q(0, ty, sz), Q(0, s0 + 0.02, sz), 0.03, "#4c5366") + ln(Q(-0.07, ty + 0.004, sz), Q(0.07, ty + 0.004, sz), 0.022, "#4c5366") + `<path d="${poly(scr.map(p => [p[0], p[1]]))}" fill="#2c3142" stroke="#2c3142" stroke-width="${f1(0.022 * sc)}" stroke-linejoin="round"/><path d="${poly([inn(0.05, 0.07), inn(0.95, 0.07), inn(0.95, 0.93), inn(0.05, 0.93)])}" fill="#cfe8fb"/>` +
      `<path d="${[[0.78, 0.4], [0.62, 0.7], [0.46, 0.4], [0.3, 0.6]].map(([v, u1]) => { const a = inn(0.14, v), b2 = inn(0.14 + 0.72 * u1, v); return `M${f1(a[0])} ${f1(a[1])}L${f1(b2[0])} ${f1(b2[1])}`; }).join("")}" stroke="#4489C8" stroke-width="${f1(Math.max(1.2, 0.014 * sc))}" stroke-linecap="round">${blink}</path>`;
    const kb = [Q(-0.13, ty + 0.012, hand[2] - 0.03), Q(0.13, ty + 0.012, hand[2] - 0.03), Q(0.13, ty + 0.012, hand[2] + 0.09), Q(-0.13, ty + 0.012, hand[2] + 0.09)]; dn += quad(kb, "#e6e9ed") + `<path d="M${f1((kb[0][0] + kb[3][0]) / 2)} ${f1((kb[0][1] + kb[3][1]) / 2)}L${f1((kb[1][0] + kb[2][0]) / 2)} ${f1((kb[1][1] + kb[2][1]) / 2)}" stroke="#aeb5c0" stroke-width="${f1(0.012 * sc)}" stroke-dasharray="2 1.6"/>`;
    for (let i = 0; i < 3; i++){ const y = ty + 0.004 + i * 0.016; dn += quad([Q(-0.22 + i * 0.01, y, z1 - 0.2), Q(-0.07 + i * 0.01, y, z1 - 0.2), Q(-0.07 + i * 0.01, y, z1 - 0.04), Q(-0.22 + i * 0.01, y, z1 - 0.04)], i === 1 ? "#f0c648" : "#fbf9f3"); }
    back += dk; deskFront = dn;
  }
  if (name === "swim" && !o.bare){                          // (figures 15) the pool: the far water and a lane rope behind; in front, the water over the swimmer up to the chest (seen through), its surface in waves that run back; the ring of foam round the body, the splash where the forward hand goes in
    const SW = B.H * k, ys = swimY + SWIM.drop * SW, ph = still ? (o.phase != null ? o.phase : C.still || 0) : C.still || 0, yawS = (o.yaw != null ? o.yaw : C.yaw) * Math.PI / 180, camS = camera(yawS, (o.pitch != null ? o.pitch : C.pitch || 7) * Math.PI / 180, SW, x, swimY), flS = swimLevel(C, B), PS = p => camS.pt([p[0], p[1] - flS, p[2]]);
    const Js = skeleton(keyAt(C, ph), B), ch = PS(Js.chest), hdF = [PS(Js.wrL), PS(Js.wrR)].sort((a, b2) => b2[0] - a[0])[0];
    const wave = (y, amp, n) => { let d = `M-40 ${f1(y)}`; for (let i = 0; i < n; i++) d += `q10 ${-amp} 20 0t20 0`; return d; }, run = (dx, dur2) => still ? "" : `<animateTransform attributeName="transform" type="translate" values="0 0;${dx} 0" dur="${dur2}s" repeatCount="indefinite"/>`;
    const fd = (vals) => still ? "" : `<animate attributeName="opacity" values="${vals}" keyTimes="0;0.25;0.5;0.75;1" dur="${f2(C.dur)}s" repeatCount="indefinite"/>`;
    const sp = (px, py, s2) => { const d = `M${f1(px - 3 * s2)} ${f1(py)}q${f1(-4 * s2)} ${f1(-9 * s2)} ${f1(-10 * s2)} ${f1(-12 * s2)}M${f1(px)} ${f1(py - 1)}q${f1(1 * s2)} ${f1(-10 * s2)} ${f1(-1 * s2)} ${f1(-16 * s2)}M${f1(px + 3 * s2)} ${f1(py)}q${f1(5 * s2)} ${f1(-8 * s2)} ${f1(11 * s2)} ${f1(-10 * s2)}`;
      return `<path d="${d}" stroke="#ffffff" stroke-width="${f1(3 * s2)}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#8fd0f5" stroke-width="${f1(1.3 * s2)}" fill="none" stroke-linecap="round"/>`; };
    const bud = o.buddy ? swimBud : null, ys2 = bud ? bud.y + SWIM.drop * B.H * bud.k : 0, yr = bud ? (ys2 + ys) / 2 + 3 : ys - 22, floats = Array.from({ length: 18 }, (_, i) => `<ellipse cx="${-40 + i * 12}" cy="${f1(yr)}" rx="5.2" ry="3.6" fill="${i % 2 ? "#ffffff" : "#DB4D3A"}" stroke="#414B5E" stroke-opacity=".25" stroke-width="0.8"/>`).join("");
    const wy = ys - 34, wt = Math.max(24, wy - 50), tiles = Array.from({ length: 12 }, (_, i) => `M${i * 14 + 7} ${f1(wt + 6)}V${f1(wy)}`).join("") + `M0 ${f1((wt + 6 + wy) / 2)}H160`;      // the far wall of the pool: pale tiles under the edge of the deck
    back += `<clipPath id="${u}w"><rect x="4" y="16" width="152" height="170" rx="12"/></clipPath><g clip-path="url(#${u}w)"><rect x="0" y="${f1(wt)}" width="160" height="${f1(wy - wt)}" fill="#e8f1f3"/><path d="${tiles}" stroke="#c9dde3" stroke-width="1.2"/><rect x="0" y="${f1(wt)}" width="160" height="6" fill="#d9cbb4"/><path d="M0 ${f1(wt + 6)}H160" stroke="#b9a98f" stroke-width="1.2"/>`
      + `<rect x="0" y="${f1(wy)}" width="160" height="${f1(190 - wy)}" fill="#cfeaf8"/><path d="M0 ${f1(wy)}H160" stroke="#a9d6ee" stroke-width="2"/>`
      + (bud ? "" : `<path d="M-40 ${f1(yr)}H200" stroke="#414B5E" stroke-opacity=".35" stroke-width="1.2"/><g>${run(-24, 1.2)}${floats}</g>`) + `<g>${run(-40, 1.2)}<path d="${wave(bud ? ys2 - 8 : ys - 10, 2.5, 7)}V${f1(ys + 4)}H-40Z" fill="#e3f3fb"/></g></g>`;
    const ring = `<path d="M${f1(ch[0] - 0.42 * SW)} ${f1(ys + 1)}q${f1(0.1 * SW)} ${f1(-0.03 * SW)} ${f1(0.2 * SW)} 0M${f1(ch[0] + 0.12 * SW)} ${f1(ys + 2)}q${f1(0.12 * SW)} ${f1(-0.035 * SW)} ${f1(0.24 * SW)} -1" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    if (bud){                                               // (figures 15) together: the other swimmer in the far lane (smaller, higher), behind the lane rope, in water to the chest too
      swimMid = mk(`<g clip-path="url(#${u}w)"></g>`).firstChild; swimMid.appendChild(figure(o.buddy.c, Object.assign({}, o, { clip: name, x: bud.x, y: bud.y, k: bud.k, legs: o.buddy.legs, tag: o.buddy.tag, buddy: null })));
      const m2 = mk(`<g>${run(-40, 0.6)}<path d="${wave(ys2, 3, 7)}V190H-40Z" fill="#3d97d6" opacity=".8"/><path d="${wave(ys2, 3, 7)}" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/></g><g>${run(-24, 1.2)}<path d="M-40 ${f1(yr)}H200" stroke="#414B5E" stroke-opacity=".35" stroke-width="1.2"/>${floats}</g>`); while (m2.firstChild) swimMid.appendChild(m2.firstChild); }
    front = `<g clip-path="url(#${u}w)"><g>${run(-40, 0.6)}<path d="${wave(ys, 4, 7)}V190H-40Z" fill="#3d97d6" opacity=".8"/><path d="${wave(ys, 4, 7)}" stroke="#ffffff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".95"/>`
      + `<path d="${wave(ys + 24, 3, 7)}M-30 ${f1(ys + 46)}q10 -3 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" stroke="#bfe3f7" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/></g>${ring}`
      + `<g>${fd("1;0.35;1;0.35;1")}${sp(Math.min(146, hdF[0]), ys, Math.max(0.7, SW / 120))}</g></g>` + front;
  }
  if (name === "listen" && !o.bare){                        // the sound at both ears (the headphones are on the head: w.hat "cans")
    const A = camA(0), hq = A.P(A.J.head), r = B.hh * A.S, wave = (sg, d, a, b2) => `<path d="M${f1(hq[0] + sg * (r * 1.5 + d))} ${f1(hq[1] - r * 0.5 - d * 0.5)}q${f1(sg * (5 + d * 0.5))} ${f1(r * 0.5 + d * 0.5)} 0 ${f1(r + d)}" ${SND} stroke-width="${d ? 4.6 : 4}">${fade(`${a};${b2};${a};${b2};${a}`, "0;0.25;0.5;0.75;1")}</path>`;
    front += wave(-1, 0, 1, 0.15) + wave(1, 0, 1, 0.15) + wave(-1, 9, 0.15, 1) + wave(1, 9, 0.15, 1);
  }
  if (o.post){                                              // tall / short: a measuring post behind, a mark from it at the top of the head
    const top = GY - (0.866 + 1.84 * B.hh) * B.H * k, px = 20;
    back += `<path d="M${px} 10V${GY + 4}" stroke="#aeb5c0" stroke-width="5" stroke-linecap="round"/><path d="${Array.from({ length: 10 }, (_, i) => `M${px} ${GY - i * 17}h${i % 2 ? 7 : 11}`).join("")}" stroke="#838B99" stroke-width="2.2" stroke-linecap="round"/><path d="M${px} ${f1(top)}H${f1(x + 6)}" stroke="#DB4D3A" stroke-width="2.6" stroke-dasharray="5 4"/><path d="M${px} ${f1(top)}l-11 -6v12z" fill="#DB4D3A"/>`;
  }
  let cardBack = "";
  if (o.card){                                              // going to do it: the picture card of the action held up beside the head (o.card: the card's markup in the 160 x 190 box)
    const yw = (o.yaw != null ? o.yaw : C.yaw) * Math.PI / 180, cm = camera(yw, 7 * Math.PI / 180, B.H * k, x, o.y != null ? o.y : GY), W = lookWear(c), kk = W.wd && W.wd.keyFix ? W.wd.keyFix(keyAt(C, 0), B) : keyAt(C, 0), J = skeleton(kk, B), fl = floorOf(C, B), hp = add(J.wrL, mul(J.hdL, B.hand * 0.5)), q = cm.pt([hp[0], hp[1] - fl, hp[2]]);
    const cs = 0.6, cx = Math.min(159 - 148 * cs, q[0] - 22 * cs), cy = Math.max(1, q[1] - 174 * cs); cardBack = `<g transform="translate(${f1(cx)} ${f1(cy)}) scale(${cs})">${o.card}</g>`;
  }
  if (o.door){                                              // going out: the house cut open (the room, its window and lamp), the open door, the garden and the sun; the arrow from inside to outside. The figure really walks out, once, and fades
    const DUR = 1.7, GO = 96, T1 = 0.72;
    if (!o.bare){ back += `<path d="M-4 52L44 12L96 52Z" fill="#AB3529"/><path d="M-4 52L44 12L60 25L26 52Z" fill="#DB4D3A"/><rect x="4" y="50" width="86" height="${GY - 46}" fill="#F6E7C6"/><rect x="4" y="150" width="86" height="${GY - 146}" fill="#E4CC9C"/><path d="M4 150H90" stroke="#D2B781" stroke-width="1.6"/>
        <rect x="13" y="76" width="30" height="34" rx="2" fill="#FBF8F0"/><rect x="16" y="79" width="24" height="28" fill="#CBE6F0"/><path d="M28 79V107M16 93H40" stroke="#FBF8F0" stroke-width="2.4"/><path d="M16 79h10l-10 12z" fill="#E4F2F7"/>
        <path d="M56 52V63" stroke="#838B99" stroke-width="1.6"/><path d="M47 76L51 63H61L65 76Z" fill="#F3BC3F"/><path d="M47 76L51 63H55L52 76Z" fill="#F8D47A"/>
        <ellipse cx="128" cy="${GY + 6}" rx="38" ry="7" fill="#77B97F"/><ellipse cx="122" cy="${GY + 4}" rx="26" ry="4" fill="#93CB98"/><circle cx="138" cy="28" r="11" fill="#F3BC3F"/><circle cx="136" cy="26" r="8" fill="#F8D47A"/>
        <rect x="0" y="48" width="6" height="${GY - 40}" fill="#B9B0A0"/><rect x="0" y="46" width="96" height="6" fill="#B9B0A0"/><rect x="90" y="50" width="6" height="22" fill="#B9B0A0"/><rect x="0" y="${GY + 2}" width="96" height="6" fill="#A99F8E"/>
        <path d="M96 72L118 66V${GY + 1}L96 ${GY + 4}Z" fill="#B58349"/><path d="M96 72L118 66V${GY + 1}L96 ${GY + 4}Z" fill="#DDAA6C" transform="translate(-1.5 0)"/><path d="M101 80L113 77V114L101 116ZM101 124L113 122V${GY - 8}L101 ${GY - 6}Z" fill="#C4935A"/><circle cx="114" cy="121" r="2.2" fill="#F3BC3F"/>`;
      front += `<path d="M24 185H142" stroke="#3fae5a" stroke-width="6" stroke-linecap="round"/><path d="M136 177L150 185L136 193" stroke="#3fae5a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; }
    const fg = figure(c, Object.assign({}, o, { clip: name, x, y: GY, k, phase: still ? 0.55 : o.phase })), wrap = mk(still ? "" : `<animateTransform attributeName="transform" type="translate" values="0 0;${GO} 0;${GO} 0" keyTimes="0;${T1};1" dur="${DUR}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.82;0.93;1" dur="${DUR}s" repeatCount="indefinite"/>`);
    if (still) wrap.setAttribute("transform", `translate(${GO * 0.5} 0)`);
    wrap.appendChild(fg); g.innerHTML = back; g.appendChild(wrap); const f0 = mk(front); while (f0.firstChild) g.appendChild(f0.firstChild); return g; }
  if (C.once && !still){ const one = s => s.replace(/repeatCount="indefinite"/g, 'fill="freeze"'); back = one(back); cardBack = one(cardBack); front = one(front); deskFront = one(deskFront); }      // (figures 12) a one-way action: what stands round it is played once too
  g.innerHTML = back + cardBack; if (swimMid) g.appendChild(swimMid); const fgA = figure(c, Object.assign({}, o, { clip: name, x, y: o.y != null ? o.y : GY, k }));
  if (name === "swim" && !o.bare){ const cw = mk(`<g clip-path="url(#${u}w)"></g>`).firstChild; cw.appendChild(fgA); g.appendChild(cw); } else g.appendChild(fgA);      // (figures 15) the swimmer's legs go out of the card under the water: clipped to it
  if (deskFront) front = deskFront + front; const f = mk(front); while (f.firstChild) g.appendChild(f.firstChild);
  return g;
}
/* ---------- a person from a spec (the avatar the learner makes; and, in time, everybody in the course) ----------
   One small object describes a person; the same spec draws the head and shoulders, the whole figure standing, and every action, from any
   camera. Each field is an index into a list below (so a spec is saved as a short string: specString / specParse).
     body "m" | "f"; age "c" (a child) | "t" (a teenager, 13 to 17) | "a" | "o" (older: lines on the brow); girth 0 slim .. 3 heavy; skin; face (0 oval, 1 round, 2 long,
     3 square, 4 narrow); eyes (colour); hair (style); hairc (colour); beard, glasses, freckles 0 | 1; head 0 | 1 (a headscarf); scarf
     (its colour, from the clothes' colours); top (colour of the jumper); legs (colour of the trousers) */
const AV = { skin: ["fair", "light", "julie", "tan", "brown", "dark"], eyes: ["#4a3524", "#5a3a22", "#3b2a1e", "#4b6f8f", "#5d7a4a", "#6b6f76"],
  hair: ["short", "side", "crop", "bald", "pony", "long", "loose", "wavy", "bob"], hairc: ["jet", "black", "dkbrown", "brown", "ltbrown", "blond", "ginger", "grey", "white"],
  /* the learner's clothes leave out blue, navy, sky and red: Marie's, Pierre's and Sylvie's (any colour within 25 degrees of hue of theirs) */
  top: ["green", "teal", "purple", "orange", "yellow", "grey", "lime", "brown", "olive", "plum", "mustard", "charcoal", "white", "pink"],
  legs: [["#5a6272", "#3f4654"], ["#5b616d", "#3d424c"], ["#77614f", "#5a4738"], ["#b9a57e", "#96825c"], ["#3a3d45", "#26282e"], ["#6f7f95", "#536277"]] };
const AV_ORDER = ["body", "age", "girth", "skin", "face", "eyes", "hair", "hairc", "beard", "glasses", "freckles", "head", "scarf", "top", "legs"];
const AV_DEFAULT = { body: "m", age: "a", girth: 1, skin: 3, face: 0, eyes: 0, hair: 0, hairc: 0, beard: 0, glasses: 0, freckles: 0, head: 0, scarf: 8, top: 0, legs: 0 };
const specString = sp => "1." + AV_ORDER.map(k => { const v = sp[k] == null ? AV_DEFAULT[k] : sp[k]; return typeof v === "number" ? v.toString(36) : v; }).join(".");
const specParse = str => { const a = String(str || "").split("."), sp = Object.assign({}, AV_DEFAULT); if (a[0] !== "1") return sp;
  AV_ORDER.forEach((k, i) => { const v = a[i + 1]; if (v == null || v === "") return; sp[k] = typeof AV_DEFAULT[k] === "number" ? Math.max(0, parseInt(v, 36) || 0) : v; }); return sp; };
const HAIRW = { white: ["#f6f6f3", "#e2e2de", "#bdbdb8"] };
function person(sp){ sp = Object.assign({}, AV_DEFAULT, typeof sp === "string" ? specParse(sp) : sp);
  const pick = (a, i) => a[Math.min(a.length - 1, Math.max(0, i | 0))], fem = sp.body === "f", hc = pick(AV.hairc, sp.hairc), hair = HAIRW[hc] || HAIR[hc], top = COL[pick(AV.top, sp.top)], skinName = pick(AV.skin, sp.skin), deep = skinName === "brown" || skinName === "dark";
  return { kid: sp.age === "c", teen: sp.age === "t", fem, old: sp.age === "o", girth: sp.girth, skin: SKIN[skinName], hair, style: fem ? ({ short: "pixie", side: "pixieS" })[pick(AV.hair, sp.hair)] || pick(AV.hair, sp.hair) : pick(AV.hair, sp.hair), top, legs: pick(AV.legs, sp.legs), beard: !!sp.beard && !fem && sp.age !== "c" && sp.age !== "t", face: sp.face, iris: pick(AV.eyes, sp.eyes),
    brow: hc === "grey" || hc === "white" ? "#9a9a94" : hair[2], lip: fem ? (deep ? "#a8404e" : "#cf5266") : (deep ? "#8a4a44" : "#b8645f"), glassesOn: !!sp.glasses, freckles: !!sp.freckles, headwear: sp.head ? "scarf" : "", scarfCol: COL[pick(AV.top, sp.scarf)], bow: "#3fa9a3" }; }
/* FIG.bust(c, o): the head and shoulders of a person (c: traits) in the 160 x 190 box, turned a little as the portraits are (o.yaw), the head
   o.head units high about y = o.cy, a small smile (o.smile) */
function bustOf(c, o){ o = o || {}; const B = bodyOf(c, o), k = (o.head || 78) / (2 * B.hh * B.H);
  return act("stand", c, { still: true, legs: o.legs || c.legs, k, y: (o.cy || 90) + (0.842 + 0.74 * B.hh) * B.H * k, bare: true, smile: o.smile == null ? 0.5 : o.smile, yaw: o.yaw == null ? -12 : o.yaw, heads: o.heads, bust: true }); }
/* FIG.avatar(spec, o): o.view "portrait" (head and shoulders) | "standing" | "doing" (o.doing: an action; o.still: its frozen frame) */
function avatar(sp, o, c0){ o = o || {}; const c = c0 || person(sp), B = bodyOf(c, o);
  if (o.view === "portrait"){ const heads = o.heads || (c.kid ? null : c.teen ? 5 : 5.6), Bp = bodyOf(c, { heads }), k = 78 / (2 * Bp.hh * Bp.H);      // (head and shoulders: an adult's shoulders against the head, as the course's portraits; a teenager's between)
    return act("stand", c, { still: true, legs: c.legs, k, y: 90 + (0.842 + 0.74 * Bp.hh) * Bp.H * k, bare: true, smile: 0.5, yaw: o.yaw == null ? -12 : o.yaw, heads, bust: true }); }
  if (o.view === "doing" && CLIPS[o.doing]) return act(o.doing, c, { still: !!o.still, legs: c.legs, k: o.k || (o.doing === "jump" ? 0.88 : 1), ox: o.doing === "run" || o.doing === "walk" ? -2 : 0, yaw: o.yaw, phase: o.phase });
  return act("stand", c, { still: true, legs: c.legs, k: o.k || 1, smile: 0.5, yaw: o.yaw }); }
/* ---------- the wardrobe: what the learner buys with tokens and wears outside the lessons (home, You, the wardrobe, celebrations) ----------
   Every item is drawn ON the figure, by the figure's own camera and light: a hat is a shell laid over the hair (the hair pressed down under
   it), glasses lie on the face as the face's features do, a scarf is wrapped round the neck's own joint, a coat's skirt hangs from the hips
   and follows the thighs, a held thing is placed by the hand that holds it (the arm set by its two bones), and what is printed or sewn on
   cloth (stripes, checks, dots, buttons, lapels) is drawn flat on the chest's own plane, twice: in the cloth's shade tone over the whole
   garment and in its lit tone over the lit part, so a pattern keeps the figure's light. So each item works on every body (man, woman,
   teenager, child, older), every hair, in every view (portrait, standing, walking, any action) and on every frame of a loop.
   WARD[id] = { slot, tier (the price), on(c, wd) }: on() writes what the item changes into the person (c: clothes' colours) and into wd (the
   wardrobe's drawing state, read by head() and frame(): hat, shades, sleeve, gloves, legSkin, skirt, noRib, noCollar, parts, armFns, legFns,
   keyFix, curlL / curlR, pose, dance, tall). Items are named by the ids the shell lists (next/shell.js, WARDROBE). */
const WCOL = { cap: ["#e2553f", "#b63c2b"], teal: ["#2f8f86", "#1f6c65"], cream: ["#f3ead6", "#d6c8a8"], mustard: ["#e6ae3c", "#bd8a1f"], rust: ["#c45b37", "#9a4124"],
  white: ["#fbfaf6", "#d9dbe0"], tee: ["#fbfaf6", "#d8d9de"], buff: ["#c8433a", "#9b2f28"], heather: ["#a7acb4", "#80858f"], oat: ["#dccba5", "#b7a47c"], camel: ["#c08f5c", "#93683d"],
  trench: ["#d3bb8c", "#a99064"], black: ["#3a3a40", "#222227"], ink: ["#273149", "#18203a"], dotRed: ["#d8433f", "#ab2f2c"], straw: ["#ecd496", "#c6a75f"], plum: ["#8c2f4f", "#651d36"],
  silk: ["#c8345c", "#962244"], bread: ["#d99a4e", "#a96a2a"], smock: ["#8db3d6", "#6a90b6"], yellow: ["#f7d31c", "#d4ab00"], tabard: ["#3f72bd", "#2b5592"], doublet: ["#5a2a35", "#3d1a22"],
  boot: ["#6b4a33", "#4a3222"], leather: ["#c79a62", "#9c7240"], suit: ["#f1f3f5", "#c9ced6"], felt: ["#3b2b24", "#241a15"], brocade: ["#7b2b46", "#561b30"], velvet: ["#b3243a", "#821427"],
  gold: ["#f1c75a", "#c4952a"], pastry: ["#e2a24f", "#b5702a"], iron: ["#9a6b44", "#6e4a2b"], grey: ["#5b5f68", "#3f434b"], pack: ["#d9483b", "#a8322a"] };
const WM = {}; for (const k in WCOL) WM[k] = material(WCOL[k][0], WCOL[k][1]);
const R3 = v => Math.round(v * 1000) / 1000;
/* flat art on a plane of the body: o3 its origin, ax / ay its two axes (one body height long each; ay points DOWN the plane) */
const planeM = (P, cam, o3, ax, ay) => { const q = P(o3), U = cam.lin(ax), V = cam.lin(ay); return [U[0], U[1], V[0], V[1], q[0], q[1]].map(R3); };
/* the same art twice, to keep the light: art(tone) in the shade tone clipped to the whole garment, in the lit tone clipped to its lit part */
const deco = (id, z, m, art, clipAll, clipLit, hide) => [{ id: id + "s", z, tag: "g", m, clip: clipAll, inner: art(0), hide }, { id: id + "l", z: z + 0.00001, tag: "g", m, clip: clipLit, inner: art(1), hide }];
/* a form in the figure's three tones from an outline function fn(grow, dx, dy) */
const tones = (id, z, fn, M, e, rim, far) => ({ id, z, mat: id, layers: far ? [[fn(0, 0, 0), M.f[1]], [fn(-e, LIGHT[0] * e, LIGHT[1] * e), M.f[0]]]
  : rim ? [[fn(0, 0, 0), M.n[2]], [fn(-rim / 2, -LIGHT[0] * rim / 2, -LIGHT[1] * rim / 2), M.n[1]], [fn(-e, LIGHT[0] * (e - rim), LIGHT[1] * (e - rim)), M.n[0]]]
  : [[fn(0, 0, 0), M.n[1]], [fn(-e, LIGHT[0] * e, LIGHT[1] * e), M.n[0]]] });
const hullFn = Es => (g, dx, dy) => hullOf(Es, g, dx, dy);
const ballE = (q, r) => { const E = disc(q, r); E.n = 14; return E; };
/* a path through points (screen), closed or not */
const pathOf = (Q, close) => Q.map((p, i) => (i ? "L" : "M") + f1(p[0]) + " " + f1(p[1])).join("") + (close ? "Z" : "");
/* ---------- the head's things: hats, a wig, sunglasses ---------- */
/* a shell over the skull from an edge up to the crown (as the hair is laid): edge(az) = the height of its lower edge in head units (az 0 = the
   face); R: the skull's half sizes times grow; the visible part only (cut where it turns away), as one path */
function shellD(H, R, edge, dx, dy, lat1, az0, az1){
  const { o, Bh, hh, cam, vl, crC } = H, w = nrm([vl[0] / R[0], vl[1] / R[1], vl[2] / R[2]]), N = 36, M = 5; let d = "";
  const unit = (az, lat) => { const a = az * Math.PI / 180, l = lat * Math.PI / 180; return [Math.cos(l) * Math.sin(a), Math.sin(l), Math.cos(l) * Math.cos(a)]; };
  const put = u => { const q = cam.pt(at(o, Bh, [(crC[0] + u[0] * R[0]) * hh, (crC[1] + u[1] * R[1]) * hh, (crC[2] + u[2] * R[2]) * hh])); return [q[0] + dx, q[1] + dy]; };
  const latOf = (az, y) => Math.asin(Math.max(-0.99, Math.min(0.99, (y - crC[1]) / R[1]))) * 180 / Math.PI, A0 = az0 == null ? -180 : az0, A1 = az1 == null ? 180 : az1, cols = [];
  for (let i = 0; i <= N; i++){ const az = A0 + i * (A1 - A0) / N, l0 = latOf(az, edge(az)), l1 = lat1 == null ? 90 : latOf(az, lat1(az)), c1 = []; for (let j = 0; j <= M; j++) c1.push(unit(az, l0 + (l1 - l0) * j / M)); cols.push(c1); }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++){ const Q = [cols[i][j], cols[i + 1][j], cols[i + 1][j + 1], cols[i][j + 1]], D = Q.map(v => dot(v, w));
    if (D.every(x => x < 0)) continue; const Pq = [];
    for (let q = 0; q < 4; q++){ const r = (q + 1) % 4; if (D[q] >= 0) Pq.push(put(Q[q])); if ((D[q] < 0) !== (D[r] < 0)){ const t = D[q] / (D[q] - D[r]); Pq.push(put(nrm(add(mul(Q[q], 1 - t), mul(Q[r], t))))); } }
    let A = 0; for (let q = 0; q < Pq.length; q++){ const r = Pq[(q + 1) % Pq.length]; A += Pq[q][0] * r[1] - r[0] * Pq[q][1]; } if (Math.abs(A) < 0.01) continue; if (A < 0) Pq.reverse(); d += poly(Pq); }
  return d; }
/* a line over the shell along a meridian (a seam), only where it faces the viewer */
function shellLine(H, R, az, y0, y1){ const { o, Bh, hh, cam, vl, crC } = H, w = nrm([vl[0] / R[0], vl[1] / R[1], vl[2] / R[2]]); let d = "", on = false;
  for (let j = 0; j <= 10; j++){ const y = y0 + (y1 - y0) * j / 10, l = Math.asin(Math.max(-0.99, Math.min(0.99, (y - crC[1]) / R[1]))), a = az * Math.PI / 180, u = [Math.cos(l) * Math.sin(a), Math.sin(l), Math.cos(l) * Math.cos(a)];
    if (dot(u, w) < 0.08){ on = false; continue; } const q = cam.pt(at(o, Bh, [(crC[0] + u[0] * R[0]) * hh, (crC[1] + u[1] * R[1]) * hh, (crC[2] + u[2] * R[2]) * hh])); d += (on ? "L" : "M") + f1(q[0]) + " " + f1(q[1]); on = true; }
  return d; }
/* a ring (a circle of the hat, level in the head's frame) as screen points: centre c (head units), radii rx, rz, at height y */
const ringPts = (H, c, rx, rz, n, tilt) => { const P = []; for (let i = 0; i < n; i++){ const a = i / n * 2 * Math.PI, x = c[0] + Math.sin(a) * rx, z = c[2] + Math.cos(a) * rz, y = c[1] + (tilt ? tilt[0] * Math.sin(a) * rx + tilt[1] * Math.cos(a) * rz : 0);
  P.push(Object.assign(H.cam.pt(at(H.o, H.Bh, [x * H.hh, y * H.hh, z * H.hh])), { a })); } return P; };
const ptsD = P => poly(P.map(p => [p[0], p[1]]));
/* the part of a band (between two rings of one hat) that faces the viewer */
function bandD(H, c, r0, r1, y0, y1, n){ const v = H.vl, lo = [], hi = []; for (let i = 0; i <= n; i++){ const a = -Math.PI + i / n * 2 * Math.PI, nx = Math.sin(a), nz = Math.cos(a); if (nx * v[0] + nz * v[2] < -0.02) continue;
    lo.push(H.cam.pt(at(H.o, H.Bh, [(c[0] + nx * r0) * H.hh, (c[1] + y0) * H.hh, (c[2] + nz * r0) * H.hh]))); hi.push(H.cam.pt(at(H.o, H.Bh, [(c[0] + nx * r1) * H.hh, (c[1] + y1) * H.hh, (c[2] + nz * r1) * H.hh]))); }
  if (lo.length < 2) return ""; return poly(lo.concat(hi.reverse()).map(p => [p[0], p[1]])); }
/* a fluffy ball (a pompom, a cloud of feathers): a scalloped round */
const fluff = (q, r, k, ph) => { let d = ""; const n = 22; for (let i = 0; i <= n; i++){ const a = i / n * 2 * Math.PI, rr = r * (1 + 0.09 * Math.sin(a * k + (ph || 0))); d += (i ? "L" : "M") + f1(q[0] + Math.cos(a) * rr) + " " + f1(q[1] + Math.sin(a) * rr); } return d + "Z"; };
function hatParts(h, H){
  const { o, Bh, hh, cam, px, z, L, crR, c, vl, big } = H, out = [], hg = 1 + L.v + L.top * 0.5 + 0.03, zH = z + 0.007, face = vl[2] > 0.25;
  const hp = v => cam.pt(at(o, Bh, mul(v, hh))), e = Math.max(0.5, 0.06 * px), M = h.M;
  const lit = (id, zz, d, MM, ee) => { const sh = (ee == null ? e : ee); return [{ id, z: zz, mat: id, layers: [[d(0, 0), MM.n[1]]] }, { id: id + "L", z: zz + 0.00001, tag: "clip", clip: d(0, 0), d: d(LIGHT[0] * sh, LIGHT[1] * sh), fill: MM.n[0] }]; };
  const shade = (id, zz, dd, op) => face ? [{ id, z: zz, tag: "clip", clip: H.skullD, d: dd, fill: `rgba(29,34,51,${op})` }] : [];
  if (h.kind === "cap" || h.kind === "cyc"){
    const cyc = h.kind === "cyc", R = [crR[0] * hg * 1.03, crR[1] * hg * (cyc ? 0.98 : 1.06), crR[2] * hg * 1.03], edge = az => (cyc ? 0.38 : 0.36) + 0.17 * Math.cos(az * Math.PI / 180);
    out.push(...lit("capC", zH, (dx, dy) => shellD(H, R, edge, dx, dy), M));
    if (cyc){ const st = [[-14, 14, "#2b5bb5"], [-4, 4, "#fbfaf6"], [4, 14, "#d63b3b"]]; for (const [a0, a1, col] of st) out.push({ id: "cyS" + a0, z: zH + 0.00002, tag: "clip", clip: shellD(H, R, edge, 0, 0), d: shellD(H, [R[0] * 1.01, R[1] * 1.01, R[2] * 1.01], edge, 0, 0, null, a0 * 1.8, a1 * 1.8), fill: col }); }
    let seams = ""; for (const az of [0, 60, -60, 120, -120, 180]) seams += shellLine(H, R, az, edge(az) + 0.05, crC1(H) + R[1] * 0.97);
    out.push({ id: "capSeam", z: zH + 0.00003, mat: "capSeam", stroke: [seams || "M0 0", mixc(M.n[1], "#1d2233", 0.25), f2(Math.max(0.35, 0.022 * px))] });
    const top = hp([0, crC1(H) + R[1] + 0.02, -0.04]); out.push({ id: "capB", z: zH + 0.00004, mat: "capB", layers: [[ellPath(disc(top, Math.max(0.6, 0.07 * px)), 0, 0, 0), M.n[1]]] });
    /* the peak: from the front of the band, out and a little down; its top lit, its edge darker */
    const inn = [], outr = [], A = cyc ? 62 : 78, ext = cyc ? 0.34 : 0.68, rise = cyc ? 0.2 : -0.1;
    for (let i = 0; i <= 12; i++){ const az = -A + 2 * A * i / 12, a = az * Math.PI / 180, y = edge(az), l = Math.asin(Math.max(-0.99, Math.min(0.99, (y - crC1(H)) / R[1]))), rr = Math.cos(l);
      const p0 = [Math.sin(a) * R[0] * rr, y, -0.04 + Math.cos(a) * R[2] * rr], k = Math.pow(Math.max(0, Math.cos(az / A * Math.PI / 2)), 0.7), dir = [Math.sin(a), 0, Math.cos(a)];
      inn.push(hp(p0)); outr.push(hp(add(p0, add(mul(dir, ext * k + 0.04), [0, rise * k - 0.03 * (1 - k), 0])))); }
    const vis = inn.concat(outr.slice().reverse()), cz = hp([0, edge(0), 1.2])[2], zV = cz > hp([0, 0, 0])[2] ? zH + 0.0001 : z - 0.008, vd = ptsD(vis), up = Math.max(0.5, 0.05 * px);
    out.push({ id: "capV", z: zV, mat: "capV", layers: [[vd, mixc(M.n[1], "#1d2233", 0.2)], [ptsD(vis.map(p => [p[0], p[1] - up])), cyc ? "#fbfaf6" : mixc(M.n[0], M.n[1], 0.35)]] });
    if (!cyc) out.push(...shade("capSh", z + 0.0062, ptsD(inn.concat(outr.slice().reverse()).map(p => [p[0], p[1] + 0.18 * px])), 0.16));
  }
  else if (h.kind === "cans"){
    /* (figures 11) headphones: a band over the top of the head from ear to ear, a round cup on each ear (the far one behind the head) */
    const R = [crR[0] * hg * 1.06, crR[1] * hg * 1.08], cy0 = H.crC[1] - 0.1, band = [], z0 = hp([0, 0, 0])[2];
    for (let i = 0; i <= 16; i++){ const a = (-90 + i * 180 / 16) * Math.PI / 180; band.push(hp([Math.sin(a) * R[0], cy0 + Math.cos(a) * (R[1] + 0.1), -0.06])); }
    out.push({ id: "cnB", z: zH, mat: "cnB", stroke: [pathOf(band), "#2c3142", f2(Math.max(1.2, 0.16 * px))] }, { id: "cnBl", z: zH + 0.00001, mat: "cnBl", stroke: [pathOf(band.map(p => [p[0] + LIGHT[0] * 0.04 * px, p[1] + LIGHT[1] * 0.04 * px])), "#5c6377", f2(Math.max(0.5, 0.05 * px))] });
    for (const sg of [1, -1]){ const q = hp([sg * (R[0] + 0.04), cy0 - 0.12, -0.06]), near = q[2] >= z0 - 0.001, r = 0.42 * px, zz = near ? zH + 0.0001 : z - 0.02;
      out.push({ id: "cnC" + sg, z: zz, mat: "cnC" + sg, layers: [[ellPath({ c: q, a: r * 0.78, b: r, th: 0 }, 0, 0, 0), M.n[1]], [ellPath({ c: [q[0] + LIGHT[0] * r * 0.12, q[1] + LIGHT[1] * r * 0.12], a: r * 0.6, b: r * 0.82, th: 0 }, 0, 0, 0), M.n[0]], [ellPath({ c: q, a: r * 0.28, b: r * 0.5, th: 0 }, 0, 0, 0), mixc(M.n[0], "#ffffff", 0.45)]] }); }
  }
  else if (h.kind === "woolly"){
    const R = [crR[0] * hg * 1.06, crR[1] * hg * 1.2, crR[2] * hg * 1.06], edge = az => 0.17 + 0.22 * Math.cos(az * Math.PI / 180) + 0.04 * Math.cos(2 * az * Math.PI / 180), Rb = R.map(v => v * 1.05);
    out.push(...lit("wlC", zH, (dx, dy) => shellD(H, R, edge, dx, dy), M));
    if (h.stripe){ const s0 = az => edge(az) + 0.62, s1 = az => edge(az) + 0.78, d = shellD(H, R.map(v => v * 1.004), s0, 0, 0, s1); out.push({ id: "wlSt", z: zH + 0.00002, mat: "wlSt", layers: [[d, WM.cream.n[1]]] }, { id: "wlStL", z: zH + 0.00003, tag: "clip", clip: d, d: shellD(H, R, s0, LIGHT[0] * e, LIGHT[1] * e, s1), fill: WM.cream.n[0] }); }
    const bandTop = az => edge(az) + 0.36, bd = (dx, dy) => shellD(H, Rb, edge, dx, dy, bandTop);
    out.push(...lit("wlB", zH + 0.00005, bd, M, e * 0.8)); let ribs = ""; for (let az = -170; az <= 180; az += 12) ribs += shellLine(H, Rb.map(v => v * 1.003), az, edge(az) + 0.04, bandTop(az) - 0.03);
    out.push({ id: "wlR", z: zH + 0.00007, mat: "wlR", stroke: [ribs || "M0 0", mixc(M.n[1], "#1d2233", 0.12), f2(Math.max(0.3, 0.026 * px))] });
    const pq = hp([0, crC1(H) + R[1] + 0.16, -0.06]), pr = 0.36 * px, PM = h.pom || WM.cream;
    out.push({ id: "wlP", z: zH + 0.0001, mat: "wlP", layers: [[fluff(pq, pr, 9), PM.n[1]], [fluff([pq[0] + LIGHT[0] * pr * 0.16, pq[1] + LIGHT[1] * pr * 0.16], pr * 0.8, 9, 1), PM.n[0]]] });
  }
  else if (h.kind === "straw" || h.kind === "felt" || h.kind === "mime" || h.kind === "toque" || h.kind === "musk"){
    /* a crown standing on the head (a short cylinder, or the chef's tall pleated one), a flat brim round it, a band */
    const T = { straw: { y: 0.58, r: 0.92, hgt: 0.5, brim: 1.62, top: 1 }, felt: { y: 0.56, r: 0.92, hgt: 0.56, brim: 1.34, top: 0.88, fb: 1.0 }, mime: { y: 0.46, r: 0.8, hgt: 0.86, brim: 1.12, top: 0.94 }, toque: { y: 0.42, r: 0.93, hgt: 1.5, brim: 0, top: 1.34 }, musk: { y: 0.42, r: 0.92, hgt: 0.62, brim: 1.5, top: 0.86, fb: 0.86 } }[h.kind];      // (T4: the musketeer's brim narrower, and shorter front to back: it was very large seen from the side)
    const cy = T.y * hg, c0 = [0, cy, -0.04], tilt = h.kind === "musk" ? [0.16, 0.05] : h.kind === "mime" ? [-0.08, 0.04] : null;
    const bot = ringPts(H, c0, T.r * hg, T.r * hg * 1.04, 28), topR = ringPts(H, [c0[0], cy + T.hgt, c0[2]], T.r * hg * T.top, T.r * hg * T.top * 1.04, 28, h.kind === "mime" ? [0.12, -0.08] : null);
    if (T.brim){ const br = ringPts(H, [0, cy - 0.02, -0.04], T.brim * hg, T.brim * hg * (T.fb || 1.08), 40, tilt), bd = ptsD(br), bq = br.reduce((a, p) => [a[0] + p[0] / br.length, a[1] + p[1] / br.length], [0, 0]);
      const inner = ptsD(br.map(p => [bq[0] + (p[0] - bq[0]) * 0.93 + LIGHT[0] * e * 0.6, bq[1] + (p[1] - bq[1]) * 0.9 + LIGHT[1] * e * 0.6]));
      out.push({ id: "hbR", z: zH, mat: "hbR", layers: [[bd, M.n[1]], [inner, M.n[0]]] });
      if (h.kind === "straw"){ let wv = ""; for (const k of [0.62, 0.78]) wv += ptsD(br.map(p => [bq[0] + (p[0] - bq[0]) * k, bq[1] + (p[1] - bq[1]) * k])); out.push({ id: "hbW", z: zH + 0.00001, mat: "hbW", stroke: [wv, mixc(M.n[1], M.n[0], 0.3), f2(Math.max(0.3, 0.02 * px))] }); }
      out.push(...shade("hbSh", z + 0.0062, ptsD(br.map(p => [p[0], p[1] + 0.3 * px])), 0.14)); }
    const pleat = h.kind === "toque";
    out.push(...lit("hcS", zH + 0.0002, (dx, dy) => poly(hull(bot.concat(topR).map(p => [p[0] + dx, p[1] + dy]))), M, e * 1.4));
    if (pleat){ let pl = ""; for (let i = -5; i <= 5; i++){ const a = i * 0.27; if (Math.cos(a) * vl[2] + Math.sin(a) * vl[0] < 0.05) continue; const p0 = hp([Math.sin(a) * T.r * hg, cy + 0.05, -0.04 + Math.cos(a) * T.r * hg]), p1 = hp([Math.sin(a) * T.r * hg * T.top, cy + T.hgt - 0.05, -0.04 + Math.cos(a) * T.r * hg * T.top]); pl += `M${f1(p0[0])} ${f1(p0[1])}L${f1(p1[0])} ${f1(p1[1])}`; }
      out.push({ id: "hcP", z: zH + 0.00025, mat: "hcP", stroke: [pl || "M0 0", "#c9ced8", f2(Math.max(0.35, 0.03 * px))] });
      const pq = hp([0, cy + T.hgt + 0.12, -0.04]), pr = T.r * hg * T.top * px * 1.08;
      out.push({ id: "hcT", z: zH + 0.0003, mat: "hcT", layers: [[fluff(pq, pr, 7), M.n[1]], [fluff([pq[0] + LIGHT[0] * pr * 0.12, pq[1] + LIGHT[1] * pr * 0.14], pr * 0.84, 7, 0.7), M.n[0]], [fluff([pq[0] - pr * 0.25, pq[1] - pr * 0.25], pr * 0.32, 5, 2), "#ffffff"]] });
      out.push({ id: "hcB", z: zH + 0.00027, mat: "hcB", layers: [[bandD(H, c0, T.r * hg * 1.01, T.r * hg * 1.03, 0, 0.3, 24), M.n[1]]] }); }
    else { out.push({ id: "hcTop", z: zH + 0.00028, mat: "hcTop", layers: [[ptsD(topR), mixc(M.n[0], "#ffffff", h.kind === "straw" ? 0.12 : 0.06)]] });
      const bandC = h.band || ["#2b2b33", "#1c1c22"]; out.push({ id: "hcB", z: zH + 0.0003, mat: "hcB", layers: [[bandD(H, c0, T.r * hg * 1.01, T.r * hg * (1 + (T.top - 1) * 0.3) * 1.01, 0.02, T.hgt * 0.3, 24), bandC[1]], [bandD(H, c0, T.r * hg * 1.01, T.r * hg * 1.01, 0.08, T.hgt * 0.24, 24), bandC[0]]] }); }
    if (h.kind === "straw"){ let wv = ""; for (const k of [0.45, 0.65, 0.85]) wv += bandD(H, c0, T.r * hg * 1.002, T.r * hg * 1.002, T.hgt * k, T.hgt * k + 0.012, 18) ; out.push({ id: "hcW", z: zH + 0.00029, mat: "hcW", layers: [[wv, mixc(M.n[1], M.n[0], 0.4)]] }); }
    if (h.kind === "mime" || h.kind === "musk"){
      /* the mime's red flower on the band; the musketeer's great plume, sweeping back over the brim */
      const sg = -1, fq = hp([sg * T.r * hg * 0.9, cy + 0.18, 0.4]);
      if (h.kind === "mime"){ let pet = ""; for (let i = 0; i < 6; i++){ const a = i / 6 * 2 * Math.PI; pet += ellPath({ c: [fq[0] + Math.cos(a) * 0.13 * px, fq[1] + Math.sin(a) * 0.13 * px], a: 0.11 * px, b: 0.07 * px, th: a }, 0, 0, 0); }
        out.push({ id: "mFl", z: zH + 0.0004, mat: "mFl", layers: [[pet, "#d23b3b"], [ellPath(disc(fq, 0.07 * px), 0, 0, 0), "#f2c94c"]] }); }
      else { const pts = [], n = 10; for (let i = 0; i < n; i++){ const t = i / (n - 1), p = hp([sg * (0.55 + 1.05 * t), cy + 0.35 + 0.75 * Math.sin(t * 2.6), 0.15 - 0.75 * t]); pts.push([p, (0.14 + 0.26 * Math.sin(t * Math.PI * 0.9)) * px]); }
        const Es = pts.map(([q, r]) => ballE(q, r)), zP = vl[2] > -0.2 ? zH + 0.0004 : z - 0.009;
        out.push({ id: "mPl", z: zP, mat: "mPl", layers: [[hullOf(Es, 0, 0, 0), "#d9d6cf"], [hullOf(Es, -0.05 * px, LIGHT[0] * 0.04 * px, LIGHT[1] * 0.04 * px), "#fbfaf6"]] });
        let barbs = ""; for (let i = 1; i < n - 1; i++){ const [q, r] = pts[i]; barbs += `M${f1(q[0])} ${f1(q[1])}l${f1(r * 0.7)} ${f1(r * 0.75)}M${f1(q[0])} ${f1(q[1])}l${f1(-r * 0.6)} ${f1(r * 0.8)}`; }
        out.push({ id: "mPb", z: zP + 0.00001, mat: "mPb", stroke: [barbs, "#c9c3b6", f2(Math.max(0.3, 0.025 * px))] });
        const tq = pts[2][0]; out.push({ id: "mPr", z: zP + 0.00002, mat: "mPr", layers: [[ellPath(disc([tq[0], tq[1] + 0.12 * px], 0.2 * px), 0, 0, 0), "#c23a3a"]] }); }
    }
  }
  else if (h.kind === "beret" || h.kind === "beretP"){
    /* a soft round of felt lying on the head, pulled to one side, the little stalk on top */
    const big2 = h.kind === "beretP" ? 1.18 : 1, sg = h.side || 1, cen = [sg * 0.16, crC1(H) + crR[1] * hg * 0.84, -0.06], rl = nrm([sg * 0.22, 1, -0.08]), ax = nrm(cross([0, 0, 1], rl)), az2 = nrm(cross(ax, rl));
    const W3 = (v, s) => cam.lin(at([0, 0, 0], Bh, mul(v, s * hh))), Ce = hp(cen), E = ellipse(Ce, [W3(ax, 1.08 * hg * big2), W3(rl, 0.2 * big2), W3(az2, 1.04 * hg * big2)]); E.n = 30;
    out.push({ id: "brC", z: zH, mat: "brC", layers: [[ellPath(E, 0, 0, 0), M.n[1]], [ellPath(E, -e, LIGHT[0] * e, LIGHT[1] * e), M.n[0]], [ellPath({ c: [Ce[0] - E.a * 0.3, Ce[1] - E.b * 0.35], a: E.a * 0.32, b: E.b * 0.22, th: E.th }, 0, 0, 0), mixc(M.n[0], "#ffffff", 0.12)]] });
    const st = hp(add(cen, mul(rl, 0.26))), st0 = hp(add(cen, mul(rl, 0.12))); out.push({ id: "brS", z: zH + 0.0001, mat: "brS", layers: [[capsule(st0[0], st0[1], 0.05 * px, st[0], st[1], 0.035 * px), M.n[1]]] });
    out.push(...shade("brSh", z + 0.0062, ellPath({ c: [Ce[0], Ce[1] + E.b * 0.9], a: E.a * 0.8, b: E.b * 0.7, th: E.th }, 0, 0, 0), 0.12));
  }
  else if (h.kind === "helmet"){
    /* the astronaut's helmet: a glass bubble round the head, a gold visor raised over its top, a white ring at the neck (drawn with the suit) */
    const cq = hp([0, -0.05, 0.08]), r = 1.42 * px, ring = disc(cq, r);
    out.push({ id: "hmG", z: zH, mat: "hmG", layers: [[ellPath(ring, 0, 0, 0), "rgba(214,232,250,.28)"]] });
    const vis = ellPath({ c: [cq[0] - vl[0] * 0.15 * px, cq[1] - r * 0.55], a: r * 0.93, b: r * 0.5, th: 0 }, 0, 0, 0);
    out.push({ id: "hmV", z: zH + 0.0001, tag: "clip", clip: ellPath(ring, 0, 0, 0), d: vis, fill: `url(#${c.u}gold)` });
    out.push({ id: "hmR", z: zH + 0.0002, mat: "hmR", stroke: [ellPath(ring, 0, 0, 0), "#e6eaf0", f2(0.09 * px)] });
    out.push({ id: "hmH", z: zH + 0.0003, mat: "hmH", stroke: [`M${f1(cq[0] - r * 0.72)} ${f1(cq[1] + r * 0.05)}A${f1(r * 0.75)} ${f1(r * 0.75)} 0 0 1 ${f1(cq[0] - r * 0.3)} ${f1(cq[1] - r * 0.66)}`, "rgba(255,255,255,.8)", f2(0.08 * px)] });
  }
  else if (h.kind === "wig"){
    /* the court wig: rows of powdered curls falling past the shoulders each side of the face (the cap of the wig is the hair style "wig") */
    for (const sg of [1, -1]){ const top = at(o, Bh, [sg * 0.86 * hh, 0.25 * hh, -0.05 * hh]), sx = nrm([Bh.x[0], 0, Bh.x[2]]);
      const near = vl[0] * sg > -0.3, zz = face ? z - 0.001 + (near ? 0 : -0.0005) : cam.pt(top)[2] + 0.004;
      for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++){ const p = add(add(top, mul(sx, sg * (j * 0.28 - 0.02 + (i % 2) * 0.1) * hh)), [0, -(i * 0.36 + j * 0.16) * hh, 0]), q = cam.pt(p), r = (0.25 - i * 0.012) * px;
        out.push({ id: `wg${sg}_${i}_${j}`, z: zz + (j ? -0.00001 : 0) - i * 0.000001, mat: "wigC", layers: [[ellPath(disc(q, r), 0, 0, 0), H.c.hairM.n[1]], [ellPath(disc(q, r * 0.78), 0, LIGHT[0] * r * 0.18, LIGHT[1] * r * 0.18), H.c.hairM.n[0]]] });
        out.push({ id: `wgs${sg}_${i}_${j}`, z: zz + 0.000001, mat: "wigS", stroke: [`M${f1(q[0] + r * 0.4)} ${f1(q[1])}A${f1(r * 0.4)} ${f1(r * 0.4)} 0 1 1 ${f1(q[0])} ${f1(q[1] - r * 0.4)}`, H.c.hairM.n[1], f2(Math.max(0.3, 0.035 * px))] }); } }
  }
  else if (h.kind === "eiffel"){
    /* the top of the tower worn as a hat: its narrowing lattice, the last platform, the mast */
    const y0 = crC1(H) + crR[1] * hg * 0.82, H3 = 2.3, W0 = 0.62, W1 = 0.13, q = (x, y) => hp([x, y0 + y, -0.04]);
    const legL = [q(-W0, 0), q(-W1, H3), q(W1, H3), q(W0, 0)], body = ptsD(legL);
    out.push({ id: "efH", z: zH, mat: "efH", layers: [[body, M.n[1]], [ptsD([q(-W0 * 0.8, 0), q(-W1 * 0.7, H3), q(W1 * 0.3, H3), q(W0 * 0.1, 0)]), M.n[0]]] });
    let lat = ""; for (let i = 0; i < 6; i++){ const t0 = i / 6, t1 = (i + 1) / 6, w0 = W0 + (W1 - W0) * t0, w1 = W0 + (W1 - W0) * t1, a = q(-w0, H3 * t0), b = q(w1, H3 * t1), c2 = q(w0, H3 * t0), d2 = q(-w1, H3 * t1); lat += `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}M${f1(c2[0])} ${f1(c2[1])}L${f1(d2[0])} ${f1(d2[1])}`; }
    out.push({ id: "efL", z: zH + 0.00001, mat: "efL", stroke: [lat, mixc(M.n[1], "#1d2233", 0.35), f2(Math.max(0.35, 0.05 * px))] });
    const pl = [q(-W1 * 2, H3), q(W1 * 2, H3)], m0 = q(0, H3), m1 = q(0, H3 + 0.9);
    out.push({ id: "efP", z: zH + 0.00002, mat: "efP", layers: [[capsule(pl[0][0], pl[0][1], 0.09 * px, pl[1][0], pl[1][1], 0.09 * px), M.n[1]], [capsule(m0[0], m0[1], 0.08 * px, m1[0], m1[1], 0.04 * px), M.n[0]]] });
  }
  return out;
}
const crC1 = H => H.crC[1];
/* sunglasses: dark lenses with a shine, a bridge and the arms toward the ears (laid on the face as the features are) */
function shadesOf(feat, big, S){ const rim = S.frame || "#1c1c22", lens = `<path d="M-.24 -.14Q0 -.2 .24 -.14Q.27 .08 .12 .17Q0 .2 -.14 .16Q-.27 .08 -.24 -.14Z" fill="${S.lens || "#23262e"}" stroke="${rim}" stroke-width="${big ? 0.045 : 0.07}"/><path d="M-.16 -.09L-.04 -.12M-.17 -.01L.06 -.11" stroke="#ffffff" stroke-opacity="${S.shine || 0.55}" stroke-width=".035" stroke-linecap="round"/>`;
  return [feat("sgL", [0.36, -0.03, 0.78], 24, lens, 0.2), feat("sgR", [-0.36, -0.03, 0.78], -24, `<g transform="scale(-1 1)">${lens}</g>`, 0.2),
    feat("sgB", [0, 0.0, 0.86], 0, `<path d="M-.16 -.04Q0 -.11 .16 -.04" stroke="${rim}" stroke-width="${big ? 0.05 : 0.08}" fill="none"/>`, 0.4),
    feat("sgTL", [0.7, 0.02, 0.5], 70, `<path d="M-.22 -.06L.32 -.02" stroke="${rim}" stroke-width=".06" stroke-linecap="round"/>`, 0.15), feat("sgTR", [-0.7, 0.02, 0.5], -70, `<path d="M.22 -.06L-.32 -.02" stroke="${rim}" stroke-width=".06" stroke-linecap="round"/>`, 0.15)]; }
STYLE.wig = { v: 0.17, top: 0.24, quiff: 0.12, ears: false, at: [[-180, -40], [-112, -40], [-84, -30], [-68, -6], [-54, 22], [-30, 40], [0, 46], [30, 40], [54, 22], [68, -6], [84, -30], [112, -40], [180, -40]],
  mass: [{ a: [0, -0.05, -0.32], drop: 0.95, r: [1.12, 1.3, 0.6] }] };
/* ---------- the body's things ---------- */
const at0 = (Bx, v) => at([0, 0, 0], Bx, v);
const chestM = (X, dz) => planeM(X.P, X.cam, at(X.J.chest, X.J.Bc, [0, 0, X.B.chest[2] * (dz || 0.98)]), X.J.Bc.x, mul(X.J.Bc.y, -1));
const backM = X => planeM(X.P, X.cam, at(X.J.chest, X.J.Bc, [0, 0, -X.B.chest[2] * 0.98]), mul(X.J.Bc.x, -1), mul(X.J.Bc.y, -1));
const faces = (X, Bx, sg) => dot(Bx.z, X.cam.view) * (sg || 1);
const tone2 = (M, t) => t ? M.n[0] : M.n[1];
/* on the chest's plane (x across: the figure's left is +; y down from the chest's middle; in body heights): the neck's foot is at y = -nb,
   the hem near y = +spine */
const onTrunk = (X, id, art, dz) => deco(id, X.zt + 0.0004, chestM(X, dz), art, "tkc", "tkl", faces(X, X.J.Bc) < 0.12);
/* stripes round the body (the marinière, the mime): bands across the chest, sagging a little as rings round a body seen from above */
const stripes = (X, col, y0, y1, step, w) => onTrunk(X, "stp", t => { let d = ""; for (let y = y0; y < y1; y += step) d += `M-.3 ${R3(y)}Q0 ${R3(y + 0.024)} .3 ${R3(y)}V${R3(y + w)}Q0 ${R3(y + w + 0.024)} -.3 ${R3(y + w)}Z`; return `<path d="${d}" fill="${tone2(col, t)}"/>`; });
/* ... and on the sleeves: bands across each arm's two bones */
function armBands(A, col, step, w, id){ const { J, s, Q, sweep, e, far, P } = A, out = [], cam = A.cam, segs = [["u", J["sh" + s], J["el" + s], 0, 4, A.zu], ["f", J["el" + s], J["wr" + s], 3, 7, A.zf]];
  for (const [k, a, b, i0, i1, zz] of segs){ const L = Math.hypot(...sub(b, a)), d = nrm(sub(b, a)), pp = nrm(cross(d, cam.view)), m = planeM(P, cam, a, d, pp), fA = sweep(Q, i0, i1), cid = `${id}${k}${s}`;
    out.push({ id: cid + "a", z: zz, tag: "cp", d: fA(0, 0, 0) }, { id: cid + "b", z: zz, tag: "cp", d: fA(-e, LIGHT[0] * e, LIGHT[1] * e) });
    out.push(...deco(cid, zz + 0.00015, m, t => { let dd = ""; for (let x = (k === "u" ? 0.035 : 0.01); x < L + 0.02; x += step) dd += `M${R3(x)} -.08H${R3(x + w)}V.08H${R3(x)}Z`; return `<path d="${dd}" fill="${far ? (t ? col.f[0] : col.f[1]) : tone2(col, t)}"/>`; }, cid + "a", cid + "b")); }
  return out; }
/* buttons down the front; a placket */
const buttons = (n, x, y0, dy, r, fill) => { let s = ""; for (let i = 0; i < n; i++) s += `<circle cx="${x}" cy="${R3(y0 + i * dy)}" r="${r}" fill="${fill}"/>`; return s; };
/* a coat's (a dress's, an apron's) skirt: from the hem of the trunk round the thighs, down to `len` of the thigh (more than 1: below the knee) */
function skirtOf(X, len, flare, M, id){ const { J, B, P, S } = X, Es = [Object.assign({}, X.Ehm, { a: X.Ehm.a * 1.02, b: X.Ehm.b * 1.02 })], out = [];
  for (const sd of ["L", "R"]){ const hip = J["hip" + sd], kn = J["kn" + sd], an = J["an" + sd], p = len <= 1 ? lerp3(hip, kn, len) : lerp3(kn, an, len - 1), r = B.rTh * (1.25 + flare) * S;
    Es.push(ballE(P(lerp3(hip, kn, 0.3)), B.rTh * 1.25 * S), ballE(P(p), r)); }
  const fn = hullFn(Es), e = 0.03 * S, RIM = Math.min(1.1, 0.0075 * S); out.push(Object.assign(tones("top", X.zt + 0.00005, fn, M || X.T, e, RIM), { id: id || "skirt" }));
  out.push({ id: (id || "skirt") + "a", z: X.zt, tag: "cp", d: fn(0, 0, 0) }, { id: (id || "skirt") + "b", z: X.zt, tag: "cp", d: fn(-e, LIGHT[0] * (e - RIM), LIGHT[1] * (e - RIM)) });
  return { out, fn, Es }; }
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const hipM = X => planeM(X.P, X.cam, at(X.J.root, X.J.Bp, [0, 0.0, X.B.hem[2] * 1.05]), X.J.Bp.x, mul(X.J.Bp.y, -1));
/* a scarf round the neck: two turns of a soft tube, the near half before the neck, the far half behind it; ends hanging on the chest */
function neckWrap(X, M, rr, turns, y0){ const { J, B, P, S } = X, out = [], Bc = J.Bc, r0 = B.rNeck * 1.55, zN = P(J.nb)[2];
  for (let t = 0; t < turns; t++){ const y = (y0 || 0.0) + t * rr * 1.5, near = [], farr = [];
    for (let i = 0; i <= 24; i++){ const a = i / 24 * 2 * Math.PI, p = at(J.nb, Bc, [Math.sin(a) * r0 * (1 + 0.1 * t), y - 0.012 + 0.004 * Math.cos(a), Math.cos(a) * r0 * 1.05 + 0.006]), q = P(p), E = ballE(q, rr * S * (1 + 0.08 * Math.sin(a * 3 + t)));
      (q[2] >= zN ? near : farr).push(E); }
    const mk2 = (L, zz, k) => { if (L.length < 2) return; const fn = (g, dx, dy) => { let d = ""; for (let i = 0; i + 1 < L.length; i++) d += hullOf([L[i], L[i + 1]], g, dx, dy); return d; }; out.push(tones("nw" + k + t, zz, fn, M, rr * S * 0.35)); };
    mk2(farr, zN - 0.004, "f"); mk2(near, X.zt + 0.0028 + t * 0.00001, "n"); }
  return out; }
/* an arm set by its two bones: the wrist at wr (the body's own frame), the fingers toward hd, the palm toward pn, the elbow toward pole */
function armTo(k, B, side, wr, hd, pn, pole){ const J = skeleton(k, B), sg = side === "L" ? 1 : -1, off = side === "L" ? 33 : 45, sh = J["sh" + side], a = B.ua, b = B.fa;
  const setv = (i, v) => { const n = nrm(v); k[i] = n[0]; k[i + 1] = n[1]; k[i + 2] = n[2]; };
  let d = sub(wr, sh), L = Math.hypot(d[0], d[1], d[2]); const mx = (a + b) * 0.995, mn = Math.abs(a - b) + 0.02; if (L > mx){ d = mul(d, mx / L); L = mx; } if (L < mn){ d = mul(d, mn / (L || 1)); L = mn; }
  const uu = mul(d, 1 / L), x = (a * a - b * b + L * L) / (2 * L), h = Math.sqrt(Math.max(0, a * a - x * x)); let pl = pole || [sg * 0.55, -1, 0.1]; pl = nrm(sub(pl, mul(uu, dot(pl, uu))));
  const el = add(add(sh, mul(uu, x)), mul(pl, h)); setv(off, sub(el, sh)); setv(off + 3, sub(add(sh, d), el)); setv(off + 6, hd); setv(off + 9, sub(pn, mul(nrm(hd), dot(pn, nrm(hd))))); }
const keyArm = (side, f) => (k, B) => { k = Float32Array.from(k); const J = skeleton(k, B), Bc = J.Bc, T = f(J, B), sg = side === "L" ? 1 : -1;
  armTo(k, B, side, at(J.chest, Bc, [T.wr[0] * sg, T.wr[1], T.wr[2]]), at0(Bc, [T.hd[0] * sg, T.hd[1], T.hd[2]]), at0(Bc, [T.pn[0] * sg, T.pn[1], T.pn[2]]), at0(Bc, [T.pole[0] * sg, T.pole[1], T.pole[2]])); return k; };
const handAt = (J, B, s) => add(J["wr" + s], mul(J["hd" + s], B.hand * 0.42));
/* ---------- the things themselves ---------- */
/* a scarf's two ends hanging on the chest, striped, fringed */
const scarfEnds = (X, A, Bm) => { const m = chestM(X, 1.02), Bc = X.J.Bc, hide = faces(X, Bc) < 0.1, nb = X.B.nb;
  const end = (x0, x1, y1, w, id, zz) => { const tip = `M${R3(x0 - w)} ${R3(-nb + 0.02)}L${R3(x0 + w)} ${R3(-nb + 0.02)}L${R3(x1 + w)} ${R3(y1)}L${R3(x1 - w)} ${R3(y1)}Z`; let st = ""; for (let y = -nb + 0.05; y < y1 - 0.02; y += 0.045){ const t = (y + nb) / (y1 + nb), x = x0 + (x1 - x0) * t; st += `M${R3(x - w)} ${R3(y)}h${R3(2 * w)}v.016h${R3(-2 * w)}Z`; }
    let fr = ""; for (let i = 0; i < 5; i++){ const x = x1 - w + (i + 0.5) * 2 * w / 5; fr += `M${R3(x)} ${R3(y1)}v.022`; }
    return { id, z: zz, tag: "g", m, hide, inner: `<path d="${tip}" fill="${A.n[1]}"/><path d="${tip}" transform="translate(-.004 -.003) scale(.97 1)" fill="${A.n[0]}"/><path d="${st}" fill="${Bm.n[0]}"/><path d="${fr}" stroke="${A.n[1]}" stroke-width=".008" stroke-linecap="round"/>` }; };
  return [end(-0.045, -0.06, 0.13, 0.026, "scE1", X.zt + 0.0026), end(-0.02, -0.01, 0.06, 0.024, "scE2", X.zt + 0.00265)]; };
const boatNeck = X => onTrunk(X, "boat", t => `<path d="M-.07 ${R3(-X.B.nb - 0.004)}Q0 ${R3(-X.B.nb + 0.022)} .07 ${R3(-X.B.nb - 0.004)}" stroke="${t ? "#c9cbd2" : "#a9abb3"}" stroke-width=".01" fill="none"/>`);
const lapels = (X, M, under, len, btn, rows) => onTrunk(X, "lap", t => { const nb = X.B.nb, y1 = -nb + len, v = `M-.03 ${R3(-nb - 0.01)}L0 ${R3(y1)}L.03 ${R3(-nb - 0.01)}Z`;
  const lap = sg => `M${R3(sg * 0.028)} ${R3(-nb - 0.012)}L${R3(sg * 0.075)} ${R3(-nb + 0.04)}L${R3(sg * 0.062)} ${R3(-nb + 0.055)}L${R3(sg * 0.07)} ${R3(-nb + 0.068)}L${R3(sg * 0.004)} ${R3(y1 + 0.004)}Z`;
  const bt = rows ? buttons(3, -0.028, y1 + 0.03, 0.045, 0.008, btn) + buttons(3, 0.028, y1 + 0.03, 0.045, 0.008, btn) : buttons(3, 0, y1 + 0.03, 0.045, 0.008, btn);
  return `<path d="${v}" fill="${tone2(under, t)}"/><path d="${lap(1)}${lap(-1)}" fill="${t ? mixc(M.n[0], "#ffffff", 0.08) : M.n[1]}" stroke="${mixc(M.n[1], "#1d2233", 0.3)}" stroke-width=".004"/>${bt}`; });
const collarBack = (X, M, h) => { const { J, B, P, S } = X, Bc = J.Bc, Es = [-1, -0.5, 0, 0.5, 1].map(u => ballE(P(at(J.nb, Bc, [u * B.rNeck * 1.5, 0.012 + (h || 0.02) * (1 - Math.abs(u) * 0.3), -B.rNeck * 0.9])), B.rNeck * 0.75 * S));
  return [tones("cBk", P(J.nb)[2] - 0.003, hullFn(Es), M, B.rNeck * S * 0.3)]; };
/* the bouquet (the hand holds it at the chest, its flowers up) */
const bouquet = X => { const { J, B, P, S, cam } = X, h = handAt(J, B, "R"), up = at0(J.Bc, [-0.15, 1, 0.25]), base = add(h, mul(up, -0.05)), top = add(h, mul(up, 0.13)), zh = P(h)[2], out = [];
  const wrapE = [ballE(P(base), 0.012 * S), ballE(P(add(h, mul(up, 0.02))), 0.024 * S), ballE(P(top), 0.058 * S)];
  out.push(tones("bqW", zh - 0.0022, hullFn(wrapE), material("#f2b8c6", "#d58a9e"), 0.01 * S));
  const fl = [[0, 0.03, "#e85d8a"], [0.045, 0.01, "#f7d14a"], [-0.045, 0.012, "#fbfaf6"], [0.025, 0.055, "#f08a4b"], [-0.025, 0.058, "#c45fd0"], [0.0, 0.08, "#f7d14a"], [0.055, 0.045, "#fbfaf6"], [-0.055, 0.04, "#e85d8a"]];
  const side = at0(J.Bc, [1, 0, 0]); let lv = ""; for (const sg of [1, -1]){ const q = P(add(top, add(mul(side, sg * 0.05), mul(up, -0.01)))); lv += ellPath({ c: q, a: 0.03 * S, b: 0.011 * S, th: sg * 0.6 }, 0, 0, 0); }
  out.push({ id: "bqL", z: zh - 0.0021, mat: "bqL", layers: [[lv, "#4f9a49"]] });
  fl.forEach(([x, y, col], i) => { const q = P(add(top, add(mul(side, x), mul(up, y)))), r = 0.024 * S; let pet = ""; for (let j = 0; j < 5; j++){ const a = j / 5 * 2 * Math.PI + i; pet += ellPath(disc([q[0] + Math.cos(a) * r * 0.55, q[1] + Math.sin(a) * r * 0.55], r * 0.55), 0, 0, 0); }
    out.push({ id: "bqF" + i, z: zh - 0.002 + i * 0.00001, mat: "bqF" + i, layers: [[pet, mixc(col, "#1d2233", 0.18)], [ellPath(disc([q[0] - r * 0.08, q[1] - r * 0.1], r * 0.78), 0, 0, 0), col], [ellPath(disc(q, r * 0.26), 0, 0, 0), col === "#f7d14a" ? "#c98a1e" : "#f7d14a"]] }); });
  return out; };
/* the baguette, under the arm and held by the hand */
const baguette = X => { const { J, B, P, S } = X, el = J.elL, h = handAt(J, B, "L"), d = nrm(sub(h, el)), a = add(add(el, mul(d, -0.17)), at0(J.Bc, [0.01, 0.025, 0])), b = add(h, mul(d, 0.2)), A = P(a), Bq = P(b), r = 0.021 * S;
  const za = (P(el)[2] + P(J.wrL)[2]) / 2, z = Math.max(X.zt + 0.0002, za - 0.0012), fn = (g, dx, dy) => capsule(A[0] + dx, A[1] + dy, Math.max(0.3, r * 0.8 + g), Bq[0] + dx, Bq[1] + dy, Math.max(0.3, r * 0.85 + g));
  let sc = ""; const L = Math.hypot(Bq[0] - A[0], Bq[1] - A[1]), ux = (Bq[0] - A[0]) / L, uy = (Bq[1] - A[1]) / L; for (let i = 1; i <= 5; i++){ const t = i / 6, x = A[0] + (Bq[0] - A[0]) * t, y = A[1] + (Bq[1] - A[1]) * t; sc += `M${f1(x - ux * r * 0.9 + uy * r * 0.4)} ${f1(y - uy * r * 0.9 - ux * r * 0.4)}l${f1(ux * r * 1.6 - uy * r * 0.6)} ${f1(uy * r * 1.6 + ux * r * 0.6)}`; }
  return [tones("bgt", z, fn, WM.bread, r * 0.4), { id: "bgtS", z: z + 0.00001, mat: "bgtS", stroke: [sc, "#f3d7a0", f2(Math.max(0.4, r * 0.28))] }]; };
/* the backpack: its body on the back (drawn by its own depth), straps over the shoulders and down the chest */
const backpack = (M, big) => X => { const { J, B, P, S, cam } = X, Bc = J.Bc, k = big || 1, cen = at(J.chest, Bc, [0, -0.025, -(B.chest[2] + 0.06 * k)]), hs = [0.095 * k, 0.12 * k, 0.05 * k], out = [];
  const cn = []; for (const x of [-1, 1]) for (const y of [-1, 1]) for (const zz of [-1, 1]) cn.push(ballE(P(at(cen, Bc, [x * hs[0], y * hs[1], zz * hs[2]])), 0.03 * S * k));
  const zc = P(cen)[2]; out.push(tones("bpk", zc, hullFn(cn), M, 0.016 * S, Math.min(1.1, 0.0075 * S)));
  if (dot(Bc.z, cam.view) < 0.2){ const m = planeM(P, cam, at(cen, Bc, [0, 0, -hs[2] - 0.028 * k]), mul(Bc.x, -1), mul(Bc.y, -1)); out.push({ id: "bpF", z: zc + 0.0001, tag: "g", m, inner: `<path d="M-.085 -.13Q0 -.16 .085 -.13V-.04Q0 -.02 -.085 -.04Z" fill="${M.n[1]}"/><rect x="-.06" y=".02" width=".12" height=".08" rx=".02" fill="${mixc(M.n[1], "#1d2233", 0.12)}"/><path d="M-.05 .035h.1" stroke="#e8e2d0" stroke-width=".006"/>` }); }
  if (k > 1.2) return out;
  for (const sg of [1, -1]){ const pts = [at(cen, Bc, [sg * 0.055, hs[1] * 0.9, hs[2]]), at(J.chest, Bc, [sg * 0.07, B.sy + 0.035, -0.01]), at(J.chest, Bc, [sg * 0.075, 0.06, B.chest[2] * 1.02]), at(J.chest, Bc, [sg * 0.08, -0.09, B.chest[2] * 0.95])].map(P);
    for (let i = 0; i < 3; i++){ const a = pts[i], b = pts[i + 1], fz = i === 0 ? Math.min(a[2], b[2]) - 0.001 : X.zt + 0.0006; out.push({ id: `bpS${sg}${i}`, z: fz, mat: "bpS", layers: [[capsule(a[0], a[1], 0.011 * S, b[0], b[1], 0.011 * S), mixc(M.n[1], "#1d2233", 0.3)]] }); } }
  return out; };
/* the polka dots on cloth */
const dotsArt = (col, x0, x1, y0, y1, r, st) => t => { let d = ""; for (let y = y0, i = 0; y < y1; y += st, i++) for (let x = x0 + (i % 2) * st / 2; x < x1; x += st) d += `M${R3(x - r)} ${R3(y)}a${r} ${r} 0 1 0 ${R3(2 * r)} 0a${r} ${r} 0 1 0 ${R3(-2 * r)} 0Z`; return `<path d="${d}" fill="${t ? col[0] : col[1]}"/>`; };
/* a tall boot over the shin (or a sock) */
const bootOf = (M, from, cuff) => A => { const { s, Q, sweep, S, z, far, e } = A, fn = (g, dx, dy) => sweep(Q, from, 7)(g + 0.006 * S, dx, dy), out = [tones("bt" + s, z + 0.0002, fn, M, e, 0, far)];
  if (cuff){ const q = Q[from], r = q[2] * 1.45; out.push({ id: "btc" + s, z: z + 0.0003, mat: "btc" + s, layers: [[ellPath({ c: [q[0], q[1]], a: r, b: r * 0.55, th: 0 }, 0, 0, 0), far ? M.f[1] : M.n[1]], [ellPath({ c: [q[0] - r * 0.1, q[1] - r * 0.1], a: r * 0.85, b: r * 0.42, th: 0 }, 0, 0, 0), far ? M.f[0] : M.n[0]]] }); }
  return out; };
const shortsOf = (M, upto) => A => { const { s, Q, sweep, S, z, far, e } = A, fn = (g, dx, dy) => sweep(Q, 0, upto)(g + 0.004 * S, dx, dy); return [tones("shs" + s, z + 0.0002, fn, M, e, 0, far)]; };
const sparkles = (pts, col, dur) => pts.map(([x, y, r, d]) => `<path d="M${x} ${y - r}L${x + r * 0.25} ${y - r * 0.25}L${x + r} ${y}L${x + r * 0.25} ${y + r * 0.25}L${x} ${y + r}L${x - r * 0.25} ${y + r * 0.25}L${x - r} ${y}L${x - r * 0.25} ${y - r * 0.25}Z" fill="${col}" opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.2;.45;1" dur="${dur}s" begin="${d}s" repeatCount="indefinite"/></path>`).join("");
/* the croissant: crescent segments of pastry round the body from the chest down past the hips, its horns down beside the thighs; glazed */
const croissant = X => { const { J, B, P, S, cam } = X, Bc = J.Bc, M = material("#eaa950", "#b8742c"), C = lerp3(J.root, J.chest, 0.36), zc = P(at(C, Bc, [0, 0, 0.14]))[2] + 0.004, E = [], ctr = [];
  for (let i = -4; i <= 4; i++){ const th = i * 0.43, r = 0.15 * (1 - Math.pow(Math.abs(i) / 4.7, 1.6)), tg = [Math.cos(th), -Math.sin(th), 0], rd = [Math.sin(th), Math.cos(th), 0], p = at(C, Bc, [Math.sin(th) * 0.24, Math.cos(th) * 0.2 - 0.08, 0.11 - Math.abs(i) * 0.012]);
    const e = ellipse(P(p), [cam.lin(at0(Bc, mul(tg, r * 0.7))), cam.lin(at0(Bc, mul(rd, r))), cam.lin(at0(Bc, [0, 0, r * 0.9]))]); e.n = 22; E.push(e); ctr.push([p, th, r]); }
  const fn = (g, dx, dy) => { let d = ""; for (let i = 0; i + 1 < E.length; i++) d += hullOf([E[i], E[i + 1]], g, dx, dy); return d; }, out = [tones("crs", zc, fn, M, 0.03 * S, Math.min(1.1, 0.0075 * S))];
  let cr = "", gl = ""; for (let i = 0; i + 1 < ctr.length; i++){ const [p0, t0, r0] = ctr[i], [p1, t1, r1] = ctr[i + 1], th = (t0 + t1) / 2, r = (r0 + r1) / 2 * 0.95, m = lerp3(p0, p1, 0.5), rd = [Math.sin(th), Math.cos(th), 0];
    const a = P(add(m, at0(Bc, mul(rd, -r * 0.85)))), b = P(add(m, at0(Bc, mul(rd, r * 0.85)))), c2 = P(add(m, at0(Bc, [Math.cos(th) * r * 0.25, -Math.sin(th) * r * 0.25, r * 0.6])));
    cr += `M${f1(a[0])} ${f1(a[1])}Q${f1(c2[0])} ${f1(c2[1])} ${f1(b[0])} ${f1(b[1])}`; }
  for (let i = 1; i + 1 < ctr.length; i++){ const [p, th, r] = ctr[i], a = P(add(p, at0(Bc, [Math.sin(th - 0.12) * r * 0.55, Math.cos(th - 0.12) * r * 0.55, r * 0.5]))), b = P(add(p, at0(Bc, [Math.sin(th + 0.12) * r * 0.55, Math.cos(th + 0.12) * r * 0.55, r * 0.5]))); gl += `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`; }
  out.push({ id: "crsC", z: zc + 0.00002, mat: "crsC", stroke: [cr, "#94561f", f2(Math.max(0.6, 0.009 * S))] }, { id: "crsG", z: zc + 0.00003, mat: "crsG", stroke: [gl, "rgba(255,240,205,.75)", f2(Math.max(0.6, 0.012 * S))] });
  return out; };
/* the Eiffel Tower worn: a lattice of iron from the shoulders, its legs flaring to an arch round the knees, two platforms; lights that twinkle */
const eiffel = X => { const { J, B, P, S, cam } = X, Bc = J.Bc, Bp = J.Bp, M = WM.iron, top = at(J.chest, Bc, [0, B.sy + 0.02, 0.0]), out = [], gy0 = lowestY(J);
  /* (T4) the costume hangs from the shoulders and goes with the body: its axis is the trunk's (it leans in the run), and when the legs
     stride (walk, run, dance) its foot rises toward the knees, so the legs move under it instead of poking out through its sides; standing
     still it reaches the ground as the tower does */
  const fwd = nrm([Bp.z[0], 0, Bp.z[2]]), stride = Math.abs(dot(sub(J.ftL.ball, J.ftR.ball), fwd)) + Math.max(0, Math.abs(J.ftL.ball[1] - J.ftR.ball[1]) - 0.02) * 2;
  const kneeY = Math.min(J.knL[1], J.knR[1]), fS = Math.max(0, Math.min(1, (stride - 0.12) / 0.25)), gy = gy0 + (Math.max(gy0, kneeY - 0.06) - gy0) * fS;
  const a0 = nrm(sub(J.root, top)), ax = nrm([a0[0] * 0.35, -1, a0[2] * 0.35]), lean = add(top, mul(ax, (top[1] - gy) / Math.max(0.6, -ax[1]))), along = y => { const t = (top[1] - y) / Math.max(1e-6, top[1] - gy); return [top[0] + (lean[0] - top[0]) * t, y, top[2] + (lean[2] - top[2]) * t]; };
  const w = (y, k) => [0.09 + 0.17 * Math.pow(1 - (y - gy) / (top[1] - gy), 2.2), 0.08 + 0.12 * Math.pow(1 - (y - gy) / (top[1] - gy), 2.2)];
  const ring = (y, k) => { const c2 = along(y), W2 = w(y); return [-1, 1].flatMap(sx => [-1, 1].map(sz => P(add(c2, add(mul(nrm([Bp.x[0], 0, Bp.x[2]]), sx * W2[0]), mul(nrm([Bp.z[0], 0, Bp.z[2]]), sz * W2[1])))))); };
  const ys = []; for (let i = 0; i <= 8; i++) ys.push(gy + 0.05 + (top[1] - gy - 0.05) * i / 8);
  const sil = poly(hull(ys.flatMap(y => ring(y).map(p => [p[0], p[1]])))), zz = X.zt + 0.0003;
  /* the arch between the legs (cut out of the outline: the legs show through it) */
  const ac = P(along(gy + 0.05)), aw = w(gy + 0.05)[0] * S * 0.62, ah = (ys[3] - gy) * S * 0.9;
  const fill = `<path d="${sil}M${f1(ac[0] - aw)} ${f1(ac[1] + 2)}Q${f1(ac[0])} ${f1(ac[1] - ah * 1.6)} ${f1(ac[0] + aw)} ${f1(ac[1] + 2)}Z" fill-rule="evenodd" fill="${M.n[1]}"/>`;
  let lat = ""; for (let i = 0; i < 8; i++){ const A = ring(ys[i]), Bq = ring(ys[i + 1]), fr = [A[0], A[2], Bq[0], Bq[2]].map(p => p); lat += `M${f1(A[1][0])} ${f1(A[1][1])}L${f1(Bq[3][0])} ${f1(Bq[3][1])}M${f1(A[3][0])} ${f1(A[3][1])}L${f1(Bq[1][0])} ${f1(Bq[1][1])}`; }
  const pl = i => { const A = ring(ys[i]); return `M${f1(Math.min(...A.map(p => p[0])) - 2)} ${f1((A[1][1] + A[3][1]) / 2)}H${f1(Math.max(...A.map(p => p[0])) + 2)}`; };
  out.push({ id: "eif", z: zz, tag: "g", m: [1, 0, 0, 1, 0, 0], dyn: 1, inner: fill + `<path d="${sil}" fill="${M.n[0]}" opacity=".55" transform="translate(${f1(LIGHT[0] * 3)} ${f1(LIGHT[1] * 3)})" clip-path="url(#${X.c.u}eifc)"/><clipPath id="${X.c.u}eifc"><path d="${sil}"/></clipPath>`
    + `<path d="${lat}" stroke="${mixc(M.n[1], "#1d2233", 0.4)}" stroke-width="${f2(0.006 * S)}" fill="none"/><path d="${pl(3)}${pl(6)}" stroke="${mixc(M.n[1], "#1d2233", 0.5)}" stroke-width="${f2(0.018 * S)}" stroke-linecap="round"/>` });
  return out; };
const lowestY = J => Math.min(...["L", "R"].map(s => Math.min(J["ft" + s].heel[1] - 0.033, J["ft" + s].ball[1] - 0.034)));
/* the court cape: red velvet from the shoulders, its ermine edge, behind the body */
const cape = X => { const { J, B, P, S } = X, Bc = J.Bc, gy = lowestY(J), out = [], Es = [];
  for (const sg of [1, -1]){ Es.push(ballE(P(at(J.chest, Bc, [sg * B.sw * 1.1, B.sy, -0.03])), 0.04 * S)); const lo = [J.root[0] + Bc.x[0] * sg * 0.24, gy + 0.2, J.root[2] + Bc.x[2] * sg * 0.24 - Bc.z[2] * 0.08]; Es.push(ballE(P(lo), 0.05 * S)); }
  const zc = Math.min(P(J.chest)[2], P(J.root)[2]) - 0.02;
  out.push(tones("cape", zc, hullFn(Es), WM.velvet, 0.03 * S));
  out.push({ id: "capeE", z: zc - 0.0001, mat: "capeE", layers: [[hullOf(Es, 0.012 * S, 0, 0.004 * S), "#fbfaf6"]] });
  return out; };
/* the lace jabot at the throat: a cascade of white ruffles */
const jabot = X => onTrunk(X, "jab", t => { const nb = X.B.nb; let d = ""; for (let i = 0; i < 4; i++){ const y = -nb + 0.005 + i * 0.026, w = 0.03 + i * 0.006; d += `M${-w} ${R3(y)}Q0 ${R3(y + 0.01)} ${w} ${R3(y)}Q${R3(w * 0.8)} ${R3(y + 0.034)} 0 ${R3(y + 0.036)}Q${R3(-w * 0.8)} ${R3(y + 0.034)} ${-w} ${R3(y)}Z`; }
  return `<path d="${d}" fill="${t ? "#ffffff" : "#e3e2df"}" stroke="#cfcdc7" stroke-width=".003"/>`; });
/* the painter's palette (left hand) and brush (right hand) */
const palette = X => { const { J, B, P, S, cam } = X, h = handAt(J, B, "L"), Bc = J.Bc, n = nrm(at0(Bc, [0.2, 0.25, 1])), u = nrm(cross([0, 1, 0], n)), v = nrm(cross(n, u)), o3 = add(h, at0(Bc, [0.04, 0.01, 0.02]));
  const m = planeM(P, cam, o3, u, mul(v, -1)), zh = P(h)[2] + 0.0015, cols = ["#e8403a", "#f2c230", "#3f8fd8", "#4fae5a", "#fbfaf6", "#8a5cc8"]; let bl = "";
  cols.forEach((col, i) => { const a = -2.4 + i * 0.62, x = Math.cos(a) * 0.065, y = Math.sin(a) * 0.045 - 0.005; bl += `<circle cx="${R3(x)}" cy="${R3(y)}" r=".012" fill="${col}"/>`; });
  return [{ id: "pal", z: zh, tag: "g", m, inner: `<path d="M-.1 0Q-.1 -.07 -.01 -.075Q.1 -.075 .1 -.01Q.1 .06 .03 .06Q-.01 .06 -.02 .035Q-.03 .015 -.06 .03Q-.1 .045 -.1 0Z" fill="#c9965d"/><path d="M-.09 -.004Q-.09 -.06 -.01 -.064Q.09 -.064 .09 -.01" stroke="#e0b47c" stroke-width=".008" fill="none"/><circle cx="-.035" cy=".02" r=".012" fill="#8f6438"/>${bl}` }]; };
const brush = X => { const { J, B, P, S } = X, h = handAt(J, B, "R"), d = nrm(at0(J.Bc, [-0.25, 0.85, 0.35])), a = P(add(h, mul(d, -0.05))), b = P(add(h, mul(d, 0.16))), tip = P(add(h, mul(d, 0.2))), zh = P(h)[2] + 0.002;
  return [{ id: "brH", z: zh, mat: "brH", layers: [[capsule(a[0], a[1], 0.006 * S, b[0], b[1], 0.005 * S), "#8b5a2b"], [capsule(b[0], b[1], 0.007 * S, tip[0], tip[1], 0.003 * S), "#e8403a"]] }]; };
/* the musketeer's cross on the tabard, his sword */
const muskCross = X => onTrunk(X, "mcr", t => { const c = t ? "#f5f3ec" : "#d8d5cc", y = 0.02, s = 0.06, w = 0.016;
  const arm = (dx, dy) => `M${R3(dx * w)} ${R3(y + dy * w)}L${R3(dx * s + dy * w * 1.6)} ${R3(y + dy * s + dx * w * 1.6)}L${R3(dx * s * 1.08)} ${R3(y + dy * s * 1.08)}L${R3(dx * s - dy * w * 1.6)} ${R3(y + dy * s - dx * w * 1.6)}Z`;
  return `<path d="${arm(1, 0)}${arm(-1, 0)}${arm(0, 1)}${arm(0, -1)}" fill="${c}"/><circle cx="0" cy="${y}" r="${w * 1.2}" fill="${c}"/>`; });
const sword = X => { const { J, B, P, S } = X, Bp = J.Bp, hilt = at(J.root, Bp, [B.hw + 0.06, 0.04, 0.05]), tipp = at(J.root, Bp, [B.hw + 0.1, -0.42, -0.2]), a = P(hilt), b = P(tipp), g0 = P(at(hilt, Bp, [0, 0.02, 0.03])), g1 = P(at(hilt, Bp, [0, 0.015, -0.03])), zz = Math.max(a[2], b[2]) + 0.02;
  return [{ id: "swS", z: zz, mat: "swS", layers: [[capsule(a[0], a[1], 0.011 * S, b[0], b[1], 0.007 * S), "#5b3a26"]] }, { id: "swH", z: zz + 0.0001, mat: "swH", layers: [[capsule(g0[0], g0[1], 0.007 * S, g1[0], g1[1], 0.007 * S), "#d9b85a"], [ellPath(disc(P(at(hilt, Bp, [0, 0.07, 0.01])), 0.012 * S), 0, 0, 0), "#e8c868"]] }]; };
/* the astronaut: the ring at the neck, the box on the chest, the flag on the arm */
const astroRing = X => { const { J, B, P, S } = X, E = ellipse(P(at(J.nb, J.Bc, [0, -0.005, 0])), X.lax(J.Bc, [B.rNeck * 2.3, 0.03, B.rNeck * 2.2])); E.n = 30; const zz = P(J.nb)[2] + 0.0029;
  return [{ id: "asR", z: zz, mat: "asR", layers: [[ellPath(E, 0.01 * S, 0, 0), "#9aa3b0"], [ellPath(E, 0.004 * S, -0.003 * S, -0.004 * S), "#e3e7ec"]] }]; };
const astroBox = X => onTrunk(X, "asB", t => `<rect x="-.055" y=".0" width=".11" height=".07" rx=".012" fill="${t ? "#dfe3e8" : "#b9bfc8"}"/><rect x="-.042" y=".012" width=".05" height=".024" rx=".004" fill="#2c3a4f"/><circle cx=".025" cy=".024" r=".008" fill="#e8403a"/><circle cx=".04" cy=".024" r=".008" fill="#f2c230"/><circle cx="-.03" cy=".05" r=".007" fill="#3fae5a"/><circle cx="-.01" cy=".05" r=".007" fill="#3f8fd8"/><rect x=".012" y=".044" width=".03" height=".012" rx=".003" fill="#8b96a5"/>`);
const flagPatch = A => { if (A.far || A.s !== "L") return []; const { J, s, P, S } = A, a = J["sh" + s], b = J["el" + s], d = nrm(sub(b, a)), pp = nrm(cross(d, A.cam.view)), m = planeM(P, A.cam, lerp3(a, b, 0.3), pp, d);
  return [{ id: "flg", z: A.zu + 0.0003, tag: "g", m, inner: `<rect x="-.024" y="-.015" width=".016" height=".03" fill="#2b5bb5"/><rect x="-.008" y="-.015" width=".016" height=".03" fill="#fbfaf6"/><rect x=".008" y="-.015" width=".016" height=".03" fill="#d63b3b"/>` }]; };
const tierGlow = { everyday: 0, nicer: 1, costume: 2, wild: 3, move: 4 };
const WARD = {
  cap: { slot: "head", tier: "everyday", on: (c, w) => { w.hat = { kind: "cap", M: WM.cap }; w.tall = 0.2; } },
  woolly: { slot: "head", tier: "everyday", on: (c, w) => { w.hat = { kind: "woolly", M: WM.teal, stripe: 1, pom: WM.cream }; w.tall = 0.75; } },
  scarf: { slot: "neck", tier: "everyday", on: (c, w) => { const warm = /^#(f0c648|e3b53f|ee9a4a|ecd79f)/.test(c.top[0]), A = warm ? WM.teal : WM.mustard, Bm = warm ? WM.cream : WM.rust;      // (against a yellow or orange jumper the scarf is teal and cream)
    w.parts.push(X => neckWrap(X, A, 0.03, 2, -0.012).concat(scarfEnds(X, A, Bm))); } },
  tshirt: { slot: "top", tier: "everyday", on: (c, w) => { const own = c.top; c.top = WCOL.tee; w.sleeve = 0.42; w.parts.push(X => onTrunk(X, "tee", t => `<path d="M0 .045C-.04 .018 -.034 -.018 -.012 -.014Q-.003 -.012 0 0Q.003 -.012 .012 -.014C.034 -.018 .04 .018 0 .045Z" fill="${t ? own[0] : own[1]}"/>`)); } },
  checked: { slot: "top", tier: "everyday", on: (c, w) => { c.top = WCOL.buff; w.noCollar = 1; w.noRib = 1;
    w.parts.push(X => onTrunk(X, "chk", t => { let d = ""; for (let x = -0.3; x < 0.3; x += 0.05) d += `M${R3(x)} -.3h.022v.6h-.022Z`; let h = ""; for (let y = -0.2; y < 0.3; y += 0.05) h += `M-.3 ${R3(y)}h.6v.022h-.6Z`; return `<path d="${d}" fill="#1f1718" opacity=".42"/><path d="${h}" fill="#1f1718" opacity=".42"/>`; }).concat(
      onTrunk(X, "shc", t => { const nb = X.B.nb; return `<path d="M-.004 ${R3(-nb + 0.004)}V.2" stroke="#1f1718" stroke-opacity=".45" stroke-width=".005"/>${buttons(4, 0.008, -nb + 0.035, 0.05, 0.006, "#f1e6d6")}<path d="M0 ${R3(-nb + 0.012)}L-.05 ${R3(-nb - 0.012)}L-.032 ${R3(-nb + 0.04)}ZM0 ${R3(-nb + 0.012)}L.05 ${R3(-nb - 0.012)}L.032 ${R3(-nb + 0.04)}Z" fill="${t ? "#d6574d" : "#a8372f"}" stroke="#2a1a1a" stroke-opacity=".5" stroke-width=".004"/>`; }), collarBack(X, X.T, 0.022)));
    w.armFns.push(A => { if (A.slv != null) return []; return armBands(A, material("#3a2526", "#231617"), 0.05, 0.022, "chA"); }); } },
  hoodie: { slot: "top", tier: "everyday", on: (c, w) => { c.top = WCOL.heather; w.noCollar = 1;
    w.parts.push(X => { const { J, B, P, S } = X, Bc = J.Bc, Es = [[0.07, 0.0, -0.035], [-0.07, 0.0, -0.035], [0.05, 0.06, -0.075], [-0.05, 0.06, -0.075], [0, 0.085, -0.085]].map(v => ballE(P(at(J.nb, Bc, v)), 0.045 * S));
      return [tones("hood", P(J.nb)[2] - 0.006, hullFn(Es), X.T, 0.02 * S)].concat(neckWrap(X, X.T, 0.024, 1, 0.002),
        onTrunk(X, "hdp", t => `<path d="M-.07 .1Q0 .09 .07 .1L.085 .19H-.085Z" fill="${t ? "#9a9fa8" : "#767b85"}"/><path d="M-.072 .105Q0 .095 .072 .105" stroke="#6d727c" stroke-width=".006" fill="none"/><path d="M-.022 ${R3(-B.nb + 0.02)}v.075M.022 ${R3(-B.nb + 0.02)}v.065" stroke="#f3f1ea" stroke-width=".007" stroke-linecap="round"/>`)); }); } },
  cardigan: { slot: "top", tier: "everyday", on: (c, w) => { c.top = WCOL.oat; w.noCollar = 1;
    w.parts.push(X => onTrunk(X, "cdg", t => { const nb = X.B.nb; return `<path d="M-.035 ${R3(-nb - 0.012)}Q0 ${R3(-nb + 0.02)} .035 ${R3(-nb - 0.012)}L.02 .22H-.02Z" fill="${t ? "#fbfaf6" : "#d8d9de"}"/><path d="M-.035 ${R3(-nb - 0.012)}L-.02 .22M.035 ${R3(-nb - 0.012)}L.02 .22" stroke="${t ? "#c7b58e" : "#a59268"}" stroke-width=".012"/>${buttons(4, -0.026, -nb + 0.06, 0.045, 0.0065, "#8a5a32")}<path d="M-.11 .12h.05v.05h-.05zM.06 .12h.05v.05h-.05z" fill="none" stroke="${t ? "#c7b58e" : "#a59268"}" stroke-width=".005"/>`; })); } },
  shades: { slot: "face", tier: "everyday", on: (c, w) => { w.shades = {}; } },
  backpack: { slot: "hand", tier: "everyday", on: (c, w) => { w.parts.push(backpack(WM.pack)); } },
  flowers: { slot: "hand", tier: "everyday", on: (c, w) => { w.keyFix.push(keyArm("R", () => ({ wr: [0.035, -0.105, 0.17], hd: [0.9, 0.3, 0.15], pn: [0.1, -0.2, -1], pole: [0.55, -1, -0.25] }))); w.curlR = 1; w.parts.push(bouquet); } },
  beret: { slot: "outfit", tier: "nicer", on: (c, w) => { c.top = WCOL.white; w.noCollar = 1; w.hat = { kind: "beret", M: WM.black, side: 1 }; w.tall = 0.3;
    w.parts.push(X => stripes(X, WM.ink, -X.B.nb + 0.03, 0.26, 0.034, 0.014).concat(boatNeck(X))); w.armFns.push(A => armBands(A, WM.ink, 0.034, 0.014, "mrA")); } },
  coat: { slot: "top", tier: "nicer", on: (c, w) => { const own = material(c.top[0], c.top[1]); c.top = WCOL.camel; w.noRib = 1; w.noCollar = 1; w.skirt = 1;
    w.parts.push(X => skirtOf(X, 0.85, 0.2).out.concat(lapels(X, X.T, own, 0.11, "#5a3a24", 1), collarBack(X, X.T, 0.03))); } },
  trench: { slot: "top", tier: "nicer", on: (c, w) => { const own = material(c.top[0], c.top[1]); c.top = WCOL.trench; w.noRib = 1; w.noCollar = 1; w.skirt = 1;
    w.parts.push(X => skirtOf(X, 1.18, 0.3).out.concat(lapels(X, X.T, own, 0.09, "#6b5434", 1), collarBack(X, X.T, 0.035),
      onTrunk(X, "blt", t => `<path d="M-.3 .135h.6v.026h-.6z" fill="${t ? "#c2a674" : "#957a4c"}"/><rect x="-.02" y=".129" width=".04" height=".038" rx=".005" fill="none" stroke="#5b4426" stroke-width=".007"/>`))); } },
  dots: { slot: "outfit", tier: "nicer", on: (c, w) => { c.top = WCOL.dotRed; w.sleeve = 0.36; w.noRib = 1; w.noCollar = 1; w.skirt = 1; w.legSkin = 1;
    w.parts.push(X => { const sk2 = skirtOf(X, 1.02, 0.7, null, "drs"); return sk2.out.concat(onTrunk(X, "dts", dotsArt(["#ffffff", "#e7d9d7"], -0.3, 0.3, -0.15, 0.3, 0.008, 0.04)),
      deco("dtk", X.zt + 0.0002, hipM(X), dotsArt(["#ffffff", "#e7d9d7"], -0.4, 0.4, -0.05, 0.6, 0.009, 0.045), "drsa", "drsb"),
      onTrunk(X, "pp", t => { const nb = X.B.nb; return `<path d="M0 ${R3(-nb + 0.016)}Q-.05 ${R3(-nb + 0.03)} -.055 ${R3(-nb - 0.01)}L-.01 ${R3(-nb - 0.012)}ZM0 ${R3(-nb + 0.016)}Q.05 ${R3(-nb + 0.03)} .055 ${R3(-nb - 0.01)}L.01 ${R3(-nb - 0.012)}Z" fill="${t ? "#ffffff" : "#e2e2e6"}"/><path d="M-.3 .13h.6v.014h-.6z" fill="#7e1f22"/>`; })); }); } },
  bowtie: { slot: "neck", tier: "nicer", on: (c, w) => { w.parts.push(X => { const { J, B, P, cam } = X, m = planeM(P, cam, at(J.nb, J.Bc, [0, -0.008, B.rNeck * 1.25]), J.Bc.x, mul(J.Bc.y, -1)), hide = faces(X, J.Bc) < 0.2;
    return [{ id: "btC", z: X.zt + 0.0027, tag: "g", m, hide, inner: `<path d="M0 .004L-.036 -.018L-.03 .016ZM0 .004L.036 -.018L.03 .016Z" fill="#fbfaf6" stroke="#d0d0d4" stroke-width=".003"/>` },
      { id: "btB", z: X.zt + 0.0029, tag: "g", m, hide, inner: `<path d="M0 .02L-.042 .002Q-.05 .02 -.042 .038ZM0 .02L.042 .002Q.05 .02 .042 .038Z" fill="#7a1f3a"/><path d="M-.004 .02L-.038 .008Q-.04 .016 -.036 .02Z" fill="#c4486c"/><path d="M.006 .02L.04 .008Q.042 .014 .04 .018Z" fill="#a8335a"/><rect x="-.009" y=".011" width=".018" height=".019" rx=".005" fill="#5c1529"/>` }]; }); } },
  straw: { slot: "head", tier: "nicer", on: (c, w) => { w.hat = { kind: "straw", M: WM.straw, band: ["#2b4d8a", "#1c3466"] }; w.tall = 0.75; } },
  silk: { slot: "neck", tier: "nicer", on: (c, w) => { w.parts.push(X => { const nb = X.B.nb, M = WM.silk, end = (sg, l) => `M${R3(sg * 0.006)} ${R3(-nb + 0.004)}Q${R3(sg * 0.03)} ${R3(-nb + 0.03)} ${R3(sg * 0.026 + sg * 0.012)} ${R3(-nb + l)}L${R3(sg * 0.004)} ${R3(-nb + l - 0.012)}Q${R3(sg * 0.012)} ${R3(-nb + 0.03)} ${R3(-sg * 0.004)} ${R3(-nb + 0.006)}Z`, d = end(1, 0.07) + end(-1, 0.06), u = X.c.u;
    return neckWrap(X, M, 0.017, 1, 0.0).concat([{ id: "slk", z: X.zt + 0.00285, tag: "g", m: chestM(X, 1.03), hide: faces(X, X.J.Bc) < 0.1,
      inner: `<path d="${d}" fill="${M.n[1]}"/><path d="${d}" transform="translate(-.002 -.002)" fill="${M.n[0]}"/><clipPath id="${u}slkc"><path d="${d}"/></clipPath><g clip-path="url(#${u}slkc)">${dotsArt(["#fbf3dc", "#fbf3dc"], -0.05, 0.05, -nb, -nb + 0.09, 0.0035, 0.014)(1)}</g><ellipse cx="0" cy="${R3(-nb + 0.006)}" rx=".014" ry=".011" fill="${M.n[1]}"/><path d="M-.006 ${R3(-nb + 0.002)}q.006 -.003 .012 0" stroke="#ffffff" stroke-opacity=".5" stroke-width=".004" fill="none"/>` }]); }); } },
  baguette: { slot: "hand", tier: "nicer", on: (c, w) => { w.keyFix.push(keyArm("L", () => ({ wr: [0.06, -0.15, 0.14], hd: [-0.15, 0.1, 1], pn: [-0.8, 0.5, 0], pole: [0.2, -1, -0.6] }))); w.curlL = 0.75; w.parts.push(baguette); } },
  chef: { slot: "outfit", tier: "costume", on: (c, w) => { c.top = WCOL.white; c.legs = ["#5b5f68", "#3f434b"]; w.noCollar = 1; w.noRib = 1; w.hat = { kind: "toque", M: material("#ffffff", "#d7dbe3") }; w.tall = 2.5;
    w.parts.push(X => { const ap = skirtOf(X, 0.95, 0.12, material("#ffffff", "#dde0e6"), "apr"); return ap.out.concat(onTrunk(X, "chb", t => buttons(3, -0.035, -0.03, 0.05, 0.008, "#2d2d33") + buttons(3, 0.035, -0.03, 0.05, 0.008, "#2d2d33")),
      neckWrap(X, material("#d8433f", "#ab2f2c"), 0.018, 1, 0.0), onTrunk(X, "aps", t => `<path d="M-.3 .145h.6v.016h-.6z" fill="${t ? "#ffffff" : "#dde0e6"}"/>`)); }); } },
  painter: { slot: "outfit", tier: "costume", on: (c, w) => { c.top = WCOL.smock; w.noRib = 1; w.noCollar = 1; w.skirt = 1; w.hat = { kind: "beretP", M: WM.plum, side: -1 }; w.tall = 0.35;
    w.keyFix.push(keyArm("L", () => ({ wr: [0.1, -0.12, 0.13], hd: [-0.6, 0.2, 0.8], pn: [-0.1, 1, 0], pole: [0.6, -1, -0.2] })), keyArm("R", () => ({ wr: [0.06, -0.05, 0.2], hd: [0.1, 0.9, 0.4], pn: [0.9, 0, -0.3], pole: [0.6, -1, -0.3] }))); w.curlL = 0.4; w.curlR = 0.95;
    w.parts.push(X => skirtOf(X, 0.6, 0.35).out.concat(onTrunk(X, "spl", t => `<circle cx="-.06" cy=".05" r=".014" fill="#e8403a"/><circle cx=".05" cy="-.02" r=".011" fill="#f2c230"/><circle cx=".07" cy=".12" r=".013" fill="#4fae5a"/><circle cx="-.03" cy=".16" r=".01" fill="#8a5cc8"/><circle cx=".0" cy=".08" r=".008" fill="#f2c230"/>`),
      onTrunk(X, "lav", t => { const nb = X.B.nb; return `<path d="M0 ${R3(-nb + 0.01)}Q-.06 ${R3(-nb - 0.02)} -.065 ${R3(-nb + 0.025)}Q-.03 ${R3(-nb + 0.04)} 0 ${R3(-nb + 0.01)}ZM0 ${R3(-nb + 0.01)}Q.06 ${R3(-nb - 0.02)} .065 ${R3(-nb + 0.025)}Q.03 ${R3(-nb + 0.04)} 0 ${R3(-nb + 0.01)}ZM-.005 ${R3(-nb + 0.015)}L-.03 ${R3(-nb + 0.09)}L-.012 ${R3(-nb + 0.085)}ZM.005 ${R3(-nb + 0.015)}L.03 ${R3(-nb + 0.08)}L.014 ${R3(-nb + 0.085)}Z" fill="#26262c"/>`; }), palette(X), brush(X))); } },
  mime: { slot: "outfit", tier: "costume", on: (c, w) => { c.top = WCOL.white; c.legs = ["#33343a", "#202126"]; c.skin = ["#ffffff", "#f3f1ec", "#d4d0c8"]; c.lip = "#c8202c"; c.brow = "#1c1c20"; w.noCollar = 1;
    w.gloves = { M: material("#ffffff", "#d9dbe0"), cuff: 1.45 }; w.hat = { kind: "mime", M: WM.black, band: ["#3a3a40", "#2a2a2e"] }; w.tall = 1.05;
    w.parts.push(X => stripes(X, WM.black, -X.B.nb + 0.03, 0.26, 0.034, 0.015).concat(boatNeck(X), onTrunk(X, "brc", t => `<path d="M-.06 ${R3(-X.B.nb - 0.02)}L-.05 .25h.018L-.042 ${R3(-X.B.nb - 0.02)}ZM.06 ${R3(-X.B.nb - 0.02)}L.05 .25h-.018L.042 ${R3(-X.B.nb - 0.02)}Z" fill="#1d1d22"/>`)));
    w.armFns.push(A => armBands(A, WM.black, 0.034, 0.015, "mmA")); } },
  cyclist: { slot: "outfit", tier: "costume", on: (c, w) => { c.top = WCOL.yellow; w.sleeve = 0.55; w.noRib = 1; w.legSkin = 1; w.hat = { kind: "cyc", M: material("#fbfaf6", "#d9dbe0") }; w.tall = 0.2;
    w.shoeM = { n: ["#f2f2f0", "#c9c9cc"], f: ["#d8d8da", "#a9a9ad"], sole: "#2d2d33", soleF: "#222227" };
    w.legFns.push(shortsOf(material("#2d2e34", "#1c1d21"), 2), bootOf(material("#fbfaf6", "#dcdde2"), 6));
    w.parts.push(X => onTrunk(X, "zip", t => `<path d="M0 ${R3(-X.B.nb - 0.01)}V.2" stroke="#9b7d00" stroke-width=".006"/><path d="M-.3 .09h.6v.012h-.6z" fill="#2b5bb5"/><path d="M-.3 .102h.6v.012h-.6z" fill="#fbfaf6"/><path d="M-.3 .114h.6v.012h-.6z" fill="#d63b3b"/>`)); } },
  musketeer: { slot: "outfit", tier: "costume", on: (c, w) => { c.top = WCOL.tabard; c.legs = WCOL.doublet; w.noRib = 1; w.noCollar = 1; w.skirt = 1; w.hat = { kind: "musk", M: WM.felt, band: ["#c9a84a", "#9c7e2a"] }; w.tall = 1.3;
    w.gloves = { M: WM.leather, cuff: 2.1 }; w.legFns.push(bootOf(WM.boot, 4, 1)); w.shoeM = { n: WCOL.boot, f: [mixc(WCOL.boot[0], WCOL.boot[1], 0.6), WCOL.boot[1]], sole: "#2a1c12", soleF: "#21160e" };
    w.parts.push(X => skirtOf(X, 0.55, 0.25).out.concat(muskCross(X), onTrunk(X, "lace", t => { const nb = X.B.nb; return `<path d="M-.075 ${R3(-nb - 0.01)}Q0 ${R3(-nb + 0.03)} .075 ${R3(-nb - 0.01)}L.06 ${R3(-nb + 0.04)}Q0 ${R3(-nb + 0.075)} -.06 ${R3(-nb + 0.04)}Z" fill="${t ? "#ffffff" : "#e2e2e6"}" stroke="#cfcfd4" stroke-width=".003"/>`; }), sword(X))); } },
  astronaut: { slot: "outfit", tier: "costume", on: (c, w) => { c.top = WCOL.suit; c.legs = WCOL.suit; w.noRib = 1; w.noCollar = 1; w.gloves = { M: material("#d6dbe2", "#aab1bc"), cuff: 1.7 }; w.hat = { kind: "helmet" }; w.tall = 0.5;
    w.legFns.push(bootOf(material("#dfe3e8", "#b5bcc6"), 5)); w.shoeM = { n: ["#c9ced6", "#9aa2ad"], f: ["#b0b6bf", "#868d98"], sole: "#5b5f68", soleF: "#4a4d55" };
    w.defsFns.push(u => `<linearGradient id="${u}gold" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#fbe7a2" stop-opacity=".95"/><stop offset=".5" stop-color="#e3b04a" stop-opacity=".9"/><stop offset="1" stop-color="#b9842a" stop-opacity=".85"/></linearGradient>`);
    w.parts.push(X => astroRing(X).concat(astroBox(X), backpack(material("#eef0f3", "#c3c9d2"), 1.25)(X))); w.armFns.push(flagPatch); } },
  croissant: { slot: "outfit", tier: "wild", on: (c, w) => { w.parts.push(croissant); w.shine = [[22, 40, 7, 0], [140, 66, 6, 0.8], [130, 150, 5, 1.6], [28, 130, 5, 2.2]]; } },
  eiffel: { slot: "outfit", tier: "wild", on: (c, w) => { w.hat = { kind: "eiffel", M: WM.iron }; w.tall = 3.2; w.parts.push(eiffel); w.shine = [[60, 60, 5, 0], [100, 90, 5, 0.6], [70, 130, 6, 1.2], [96, 150, 5, 1.8], [80, 30, 5, 2.4]]; w.shineCol = "#fff3b0"; } },
  versailles: { slot: "outfit", tier: "wild", on: (c, w) => { c.top = WCOL.brocade; c.legs = ["#f3efe6", "#d7d1c3"]; c.hair = ["#ffffff", "#ecebe6", "#c9c5bc"]; c.brow = "#8a8780"; w.wig = "wig"; w.hat = { kind: "wig" }; w.tall = 0.45; w.noRib = 1; w.noCollar = 1; w.skirt = 1;
    w.shoeM = { n: ["#7b2b46", "#561b30"], f: ["#5e2236", "#3f1424"], sole: "#2a1a12", soleF: "#21160e" };
    w.parts.push(X => cape(X).concat(skirtOf(X, 0.95, 0.4).out, jabot(X), onTrunk(X, "gld", t => `<path d="M-.012 ${R3(-X.B.nb)}V.26M.012 ${R3(-X.B.nb)}V.26" stroke="${t ? "#f1c75a" : "#c4952a"}" stroke-width=".01"/>${buttons(5, -0.03, -0.02, 0.045, 0.007, "#f1c75a")}${buttons(5, 0.03, -0.02, 0.045, 0.007, "#f1c75a")}`)));
    w.shine = [[24, 50, 6, 0.3], [138, 44, 6, 1.1], [136, 140, 5, 1.9]]; w.shineCol = "#ffe9a8"; } },
  thinker: { slot: "pose", tier: "move", on: (c, w) => { w.pose = "thinker"; } },
  bow: { slot: "dance", tier: "move", on: (c, w) => { w.dance = "bow"; } },
  jig: { slot: "dance", tier: "move", on: (c, w) => { w.dance = "jig"; } },
  cancan: { slot: "dance", tier: "move", on: (c, w) => { w.dance = "cancan"; } }
};
/* the person dressed: c is copied, the items applied (an outfit first, then the slots over it) */
const SLOT_ORDER = ["outfit", "top", "head", "neck", "face", "hand", "pose", "dance"];
function dressUp(c, wear){ const ids = (Array.isArray(wear) ? wear : wear ? [wear] : []).filter(id => WARD[id]); if (!ids.length) return c;
  c = Object.assign({}, c); const w = { ids, parts: [], armFns: [], legFns: [], keyFix: [], defsFns: [], tall: 0 }; c.wd = w;
  ids.sort((a, b) => SLOT_ORDER.indexOf(WARD[a].slot) - SLOT_ORDER.indexOf(WARD[b].slot));
  const hasOutfit = ids.some(id => WARD[id].slot === "outfit"), covers = ["astronaut", "croissant", "eiffel", "versailles", "chef"].some(id => ids.includes(id));
  for (const id of ids){ const it = WARD[id]; if (hasOutfit && (it.slot === "top" || it.slot === "head") ) continue; if (covers && it.slot === "neck") continue; if (ids.includes("astronaut") && it.slot === "face") continue; it.on(c, w); }
  if (w.armFns.length) w.armParts = A => [].concat(...w.armFns.map(f => f(A)));
  if (w.legFns.length) w.legParts = A => [].concat(...w.legFns.map(f => f(A)));
  const kf = w.keyFix; w.keyFix = kf.length ? (k, B) => kf.reduce((kk, f) => f(kk, B), k) : null;
  if (w.defsFns.length) w.defs = u => w.defsFns.map(f => f(u)).join("");
  return c; }
/* ---------- (figures 11) the course's looks, worn: "il porte un manteau", a hat, a cap, a scarf, a backpack, a bag, a suit, a red dress, an
   umbrella, sunglasses. The SAME drawing system as the wardrobe (hatParts, neckWrap, skirtOf, lapels, backpack ...): lookWear(c) reads the
   looks people.js found (c.L) and the colours it chose for this person (c.cap, c.hat, c.band, c.coat, c.scarf, c.pack, c.umb, c.suit,
   c.tie, c.bag: names in COL) and writes the drawing state c.wd, as dressUp() does for what the learner bought. A person with no such look
   is returned as given (glasses are the face's own: c.glassesOn). */
const colM = (n, d) => { const p = COL[n] || COL[d] || COL.grey; return material(p[0], p[1]); };
/* an umbrella held up in the right hand: the stick from the fist to the middle of a dome over the head, its ribs, a ferrule */
const umbrellaOf = M => X => { const { J, B, P, S } = X, h = handAt(J, B, "R"), topY = J.head[1] + B.hh * 1.5, cen = [J.head[0] * 0.55 + h[0] * 0.45, topY + 0.115, J.head[2] * 0.55 + h[2] * 0.45], out = [];
  const a = P([h[0], h[1] - 0.05, h[2]]), b = P(cen), zh = P(h)[2], R = Math.min(0.3, 64 / S), rim = [], N = 12;      // (in a head and shoulders the dome is kept inside the card)
  for (let i = 0; i < N; i++){ const t = i / N * 2 * Math.PI; rim.push([cen[0] + Math.sin(t) * R, cen[1] - 0.1, cen[2] + Math.cos(t) * R * 0.95]); }
  const Es = rim.map(p => ballE(P(p), 0.008 * S)).concat([ballE(P([cen[0], cen[1] + 0.012, cen[2]]), 0.03 * S)]), fn = hullFn(Es), zc = P(cen)[2] + 0.02;
  out.push({ id: "umS", z: zh - 0.0015, mat: "umS", stroke: [`M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`, "#5b616d", f2(Math.max(0.6, 0.012 * S))] });
  out.push(tones("umC", zc, fn, M, 0.035 * S, Math.min(1.1, 0.0075 * S)));
  let ribs = ""; const t0 = P([cen[0], cen[1] + 0.03, cen[2]]); for (const p of rim){ const q = P(p); if (q[2] >= P(cen)[2] - 0.02) ribs += `M${f1(t0[0])} ${f1(t0[1])}Q${f1((t0[0] + q[0]) / 2)} ${f1(t0[1] + (q[1] - t0[1]) * 0.2)} ${f1(q[0])} ${f1(q[1])}`; }
  out.push({ id: "umR", z: zc + 0.00001, mat: "umR", stroke: [ribs || "M0 0", mixc(M.n[1], "#1d2233", 0.25), f2(Math.max(0.35, 0.006 * S))] });
  const f0 = P([cen[0], cen[1] + 0.07, cen[2]]); out.push({ id: "umF", z: zc + 0.00002, mat: "umF", stroke: [`M${f1(t0[0])} ${f1(t0[1])}L${f1(f0[0])} ${f1(f0[1])}`, "#5b616d", f2(Math.max(0.6, 0.012 * S))] });
  return out; };
/* a bag on a strap across the chest, hanging at the left hip */
const shoulderBag = M => X => { const { J, B, P, S } = X, Bp = J.Bp, cen = at(J.root, Bp, [B.hw + 0.07, 0.0, 0.03]), hs = [0.035, 0.06, 0.065], cn = [], out = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const zz of [-1, 1]) cn.push(ballE(P(at(cen, Bp, [x * hs[0], y * hs[1], zz * hs[2]])), 0.016 * S));
  out.push(tones("sbg", Math.max(P(cen)[2], X.zt + 0.0031), hullFn(cn), M, 0.012 * S, Math.min(1.1, 0.0075 * S)));
  return out.concat(onTrunk(X, "sbS", t => `<path d="M-.105 ${R3(-X.B.nb - 0.02)}L-.085 ${R3(-X.B.nb - 0.03)}L.17 .3L.15 .31Z" fill="${t ? "#8a6240" : "#6a4a2a"}"/>`)); };
const tieArt = col => X => onTrunk(X, "tie", t => { const nb = X.B.nb; return `<path d="M-.012 ${R3(-nb - 0.002)}h.024l.006 .02l-.018 .012l-.018 -.012z M-.012 ${R3(-nb + 0.03)}L.012 ${R3(-nb + 0.03)}L.02 ${R3(-nb + 0.14)}L0 ${R3(-nb + 0.165)}L-.02 ${R3(-nb + 0.14)}Z" fill="${t ? col[0] : col[1]}"/>`; });
/* pigtails: a bunch of hair at each side of the head, tied (the near one before the head, the far one behind it) */
const pigtails = X => { const { J, B, P, S, c } = X, hh = B.hh, M = c.hairM, z0 = P(J.head)[2], out = [];
  for (const sg of [1, -1]){ const p = y => P(at(J.head, J.Bh, [sg * (0.98 + 0.12 * (0.1 - y)) * hh, y * hh, -0.12 * hh])), a = p(0.1), b = p(-0.45), d = p(-1.0), near = a[2] >= z0, zz = near ? z0 + 0.03 : z0 - 0.03;
    out.push(tones("pig" + sg, zz, hullFn([ballE(a, 0.16 * hh * S), ballE(b, 0.3 * hh * S), ballE(d, 0.2 * hh * S)]), M, 0.07 * hh * S), { id: "pigB" + sg, z: zz + 0.0001, mat: "pigB" + sg, layers: [[ellPath(disc(a, 0.17 * hh * S), 0, 0, 0), c.bow || "#e8548a"]] }); }
  return out; };
function lookWear(c, noHold){ const L = Object.assign({}, c.L); if (c.wd) return c; if (noHold) L.umbrella = 0;      // (noHold: the hands are busy: a close-up, a thing handed over)
  const spec = L.glasses && !c.shades, worn = L.hat || L.cap || L.coat || L.scarf || L.backpack || L["red dress"] || L.suit || L.umbrella || L.bag || c.shades || L.pigtails;
  if (!spec && !worn) return c;
  c = Object.assign({}, c); if (spec) c.glassesOn = true; if (!worn) return c;
  const w = { ids: [], parts: [], armFns: [], legFns: [], keyFix: [], defsFns: [], tall: 0 }; c.wd = w;
  if (L["red dress"]){ w.sleeve = 0.36; w.noRib = 1; w.noCollar = 1; w.skirt = 1; w.legSkin = 1;
    w.parts.push(X => skirtOf(X, 1.02, 0.7, null, "drs").out.concat(onTrunk(X, "blt", t => `<path d="M-.3 .13h.6v.016h-.6z" fill="${t ? mixc(c.top[1], "#1d2233", 0.1) : mixc(c.top[1], "#1d2233", 0.3)}"/>`))); }
  if (L.suit){ const own = material(c.top[0], c.top[1]), white = material("#fbfaf6", "#d8d9de"), sc = COL[c.suit] || COL.charcoal, shirt = c.named === "julie" ? own : white; c.top = sc; c.legs = sc; w.legs = sc; w.noRib = 1; w.noCollar = 1; w.skirt = 1;
    w.parts.push(X => skirtOf(X, 0.3, 0.06).out.concat(lapels(X, X.T, shirt, 0.17, "#23252b", 0), collarBack(X, X.T, 0.022))); if (c.tie && !c.fem) w.parts.push(tieArt(COL[c.tie] || COL.red)); }
  if (L.coat){ const own = material(c.top[0], c.top[1]), long = !!c.hood; c.top = COL[c.coat] || COL.camel; w.noRib = 1; w.noCollar = 1; w.skirt = 1;
    w.parts.push(X => skirtOf(X, long ? 1.15 : 0.9, 0.24).out.concat(lapels(X, X.T, own, 0.11, mixc(c.top[1], "#1d2233", 0.45), 1), collarBack(X, X.T, 0.03))); }
  if (L.scarf){ const A = colM(c.scarf, "mustard"), Bm = material(mixc(A.n[0], "#ffffff", 0.55), mixc(A.n[1], "#ffffff", 0.3)); w.parts.push(X => neckWrap(X, A, 0.03, 2, -0.012).concat(scarfEnds(X, A, Bm))); }
  if (L.pigtails && !L.hat && !L.cap) w.parts.push(pigtails);
  if (L.backpack) w.parts.push(backpack(colM(c.pack, "orange")));
  if (L.bag) w.parts.push(shoulderBag(colM(c.bag, "mustard")));
  if (L.umbrella){ w.keyFix.push(keyArm("R", () => ({ wr: [0.2, -0.04, 0.16], hd: [-0.25, 0.2, 0.95], pn: [-1, 0, 0.1], pole: [0.5, -1, -0.3] }))); w.curlR = 1; w.parts.push(umbrellaOf(colM(c.umb, "yellow"))); w.tall = 3.1; w.wide = 0.2; }
  if (L.hat){ const straw = c.hat === "straw"; w.hat = { kind: straw ? "straw" : "felt", M: colM(c.hat, "felt"), band: [c.band || "#2b2b30", mixc(c.band || "#2b2b30", "#1d2233", 0.3)] }; w.tall = Math.max(w.tall, straw ? 0.75 : 0.7); }
  else if (L.cap){ w.hat = { kind: "cap", M: colM(c.cap, "orange") }; w.tall = Math.max(w.tall, 0.2); }
  if (c.shades) w.shades = {};
  if (w.armFns.length) w.armParts = A => [].concat(...w.armFns.map(f => f(A)));
  const kf = w.keyFix; w.keyFix = kf.length ? (k, B) => kf.reduce((kk, f) => f(kk, B), k) : null;
  return c; }
/* a copy of the person with one more thing in the drawing state (what an action itself puts on the figure: a telephone, headphones, an arm held up) */
const withWd = (c, f) => { c = lookWear(c); const w0 = c.wd || { ids: [], parts: [], armFns: [], legFns: [], keyFix: null, defsFns: [], tall: 0 }, w = Object.assign({}, w0, { parts: w0.parts.slice() }); f(w); return Object.assign({}, c, { wd: w }); };
const addFix = (w, f) => { const k0 = w.keyFix; w.keyFix = k0 ? (k, B) => f(k0(k, B), B) : f; };
/* the telephone at the ear, in the hand that is there (the capture's right hand): a dark slab along the side of the head, its top above the hand */
const phonePart = X => { const { J, B, P, S } = X, hh = B.hh, a = P(at(J.head, J.Bh, [-0.86 * hh, -0.62 * hh, 0.2 * hh])), b = P(at(J.head, J.Bh, [-0.98 * hh, 0.42 * hh, 0.02 * hh])), z = Math.max(a[2], b[2], P(J.wrR)[2]) + 0.004, r = 0.2 * hh * S;
  return [{ id: "phn", z, mat: "phn", layers: [[capsule(a[0], a[1], r, b[0], b[1], r), "#2c3142"], [capsule(a[0] + LIGHT[0] * r * 0.25, a[1] + LIGHT[1] * r * 0.25, r * 0.72, b[0] + LIGHT[0] * r * 0.25, b[1] + LIGHT[1] * r * 0.25, r * 0.72), "#4c5366"]] }]; };
/* the dances' own arms and the cancan's higher kick (set in the rig, as the held things are) */
const DANCE_FIX = {
  cancan: (k, B) => { k = Float32Array.from(k); const J = skeleton(k, B), Bp = J.Bp, Bc = J.Bc;
    for (const [o, s] of [[57, "L"], [69, "R"]]){ const th = [k[o], k[o + 1], k[o + 2]], up = Math.max(0, th[2]) ; if (up > 0.25){ const a = Math.atan2(th[2], -th[1]), a2 = Math.min(1.75, a * 1.45), l = Math.hypot(th[1], th[2]); k[o + 1] = -Math.cos(a2) * l; k[o + 2] = Math.sin(a2) * l;
      const sh = [k[o + 3], k[o + 4], k[o + 5]], b = Math.atan2(sh[2], -sh[1]), b2 = Math.min(1.9, b + (a2 - a) * 1.1), m = Math.hypot(sh[1], sh[2]); k[o + 4] = -Math.cos(b2) * m; k[o + 5] = Math.sin(b2) * m; } }
    armTo(k, B, "L", at(J.root, Bp, [B.hw + 0.075, 0.07, 0.0]), at0(Bp, [-0.2, -0.5, -0.85]), at0(Bp, [-0.9, 0, 0.3]), at0(Bc, [1, -0.2, -0.4]));
    armTo(k, B, "R", at(J.chest, Bc, [-0.16, 0.36, 0.06]), at0(Bc, [-0.3, 1, 0.1]), at0(Bc, [0, 0, 1]), at0(Bc, [-1, 0.1, -0.2])); return k; },
  bow: (k, B) => { k = Float32Array.from(k); const C = clipOf("bow"); if (C.hi == null){ C.hi = Math.max(...C.keys.map(q => q[1])); C.lo = Math.min(...C.keys.map(q => q[1])); }
    const dp = Math.max(0, Math.min(1, (C.hi - k[1]) / Math.max(0.05, C.hi - C.lo))), a = 0.3 * dp * dp * (3 - 2 * dp), ax = nrm([k[3], k[4], k[5]]);      // (T5: 0.5 -> 0.3: the deepest point read as a stumble at small sizes)
    const rot = (i, f) => { const v = [k[i], k[i + 1], k[i + 2]], cs = Math.cos(a * f), sn = Math.sin(a * f), d = dot(ax, v), cr = cross(ax, v), r = [v[0] * cs + cr[0] * sn + ax[0] * d * (1 - cs), v[1] * cs + cr[1] * sn + ax[1] * d * (1 - cs), v[2] * cs + cr[2] * sn + ax[2] * d * (1 - cs)]; k[i] = r[0]; k[i + 1] = r[1]; k[i + 2] = r[2]; };
    rot(9, 1); rot(12, 1); rot(15, 1); rot(24, 1.3); rot(27, 1.5); rot(30, 1.5); for (const o of [33, 36, 39, 42, 45, 48, 51, 54]) rot(o, 0.6); return k; },
  jig: (k, B) => { k = Float32Array.from(k); const J = skeleton(k, B), Bp = J.Bp, Bc = J.Bc;
    for (const s of ["L", "R"]){ const sg = s === "L" ? 1 : -1; armTo(k, B, s, at(J.root, Bp, [sg * (B.hw + 0.075), 0.07, 0.0]), at0(Bp, [-sg * 0.2, -0.5, -0.85]), at0(Bp, [-sg * 0.9, 0, 0.3]), at0(Bc, [sg, -0.2, -0.4])); } return k; }
};
/* the thinker's rock under him */
const rock = X => { const { J, B, P, S } = X, gy = lowestY(J), top = J.root[1] - B.rHip * 0.9, c2 = [J.root[0], 0, J.root[2] - 0.03], out = [];
  const Es = [[-0.13, gy + 0.02, 0.1], [0.13, gy + 0.02, 0.1], [-0.12, gy + 0.02, -0.12], [0.12, gy + 0.02, -0.12], [-0.08, top, 0.06], [0.09, top - 0.01, 0.05], [-0.06, top + 0.005, -0.1], [0.08, top, -0.1]].map(v => ballE(P([c2[0] + v[0], v[1], c2[2] + v[2]]), 0.05 * S));
  out.push(tones("rock", Math.min(P(J.root)[2], P(J.chest)[2]) - 0.03, hullFn(Es), material("#a9a59a", "#7f7b72"), 0.03 * S, Math.min(1.1, 0.0075 * S)));
  return out; };
/* FIG.avatar(spec, o) with o.wear (the ids worn): the learner's figure dressed; o.view "portrait" | "standing" | "doing" | "celebrate" (the
   dance worn, or a jump for joy when none is). A pose worn is the figure's pose in "standing" and "portrait" (on home). Tall hats are fitted
   into the box (the picture is made smaller about its feet). */
function avatarW(sp, o){ o = o || {}; const wear = o.wear && o.wear.length ? o.wear : null;
  if (!wear && o.view !== "celebrate") return avatar(sp, o);
  const c = wear ? dressUp(person(sp), wear) : person(sp), w = c.wd || { tall: 0 }, B = bodyOf(c, {});
  let g, top;
  if (o.view === "celebrate" || (o.view === "doing" && w.dance && o.doing === "dance")){ const name = w.dance || "jump", C = clipOf(name), E = extent(C, B, o.yaw != null ? o.yaw : C.yaw);
    if (DANCE_FIX[name]) { c.wd = Object.assign({}, w, { keyFix: w.keyFix ? (k, Bq) => DANCE_FIX[name](w.keyFix(k, Bq), Bq) : DANCE_FIX[name] }); }
    g = act(name, c, { still: !!o.still, phase: o.phase, legs: c.legs, yaw: o.yaw, bare: name !== "jump" || o.bare, kmax: 1.1, smile: 1 });
    top = 30 - w.tall * B.hh * B.H; }
  else if (w.pose && (o.view === "standing" || o.view === "portrait" || !o.view)){
    c.wd = Object.assign({}, w, { parts: w.parts.concat([rock]) });
    if (o.view === "portrait"){ const heads = c.kid ? null : c.teen ? 5 : 5.6, Bp = bodyOf(c, { heads }), C = clipOf(w.pose), k = 70 / (2 * Bp.hh * Bp.H), yaw = (o.yaw != null ? o.yaw : C.yaw) * Math.PI / 180;
      const J = skeleton(keyAt(C, C.still), Bp), fl = floorOf(C, Bp), q = camera(yaw, 7 * Math.PI / 180, Bp.H * k, 0, 0).pt([J.head[0], J.head[1] - fl, J.head[2]]);
      g = act(w.pose, c, { still: true, legs: c.legs, k, ox: -q[0] - 4, y: 92 - q[1], bare: true, heads, smile: 0.3 }); top = 92 - 35 - w.tall * 35; }
    else { g = act(w.pose, c, { still: true, legs: c.legs, k: o.k || 1.12, smile: 0.3 }); top = 60 - w.tall * B.hh * B.H * 1.12; } }
  else { g = avatar(sp, o, c);
    if (o.view === "portrait") top = 51 - w.tall * 39;
    else if (o.view === "doing" && CLIPS[o.doing]){ const C = clipOf(o.doing), E = extent(C, B, o.yaw != null ? o.yaw : C.yaw), k = o.k || (o.doing === "jump" ? 0.88 : 1); top = GY - (E.top + w.tall * B.hh) * B.H * k; }
    else top = GY - (0.866 + 1.84 * B.hh + w.tall * B.hh) * B.H * (o.k || 1); }
  const lim = o.view === "portrait" ? 4 : 6, base = o.view === "portrait" ? 190 : GY;
  if (top < lim){ const s = (base - lim) / (base - top); const h = mk(""); h.setAttribute("transform", `translate(80 ${base}) scale(${f2(s * 100) / 100}) translate(-80 ${-base})`); h.appendChild(g); g = mk(""); g.appendChild(h); }
  if (w.shine && !o.noShine){ const f = mk(sparkles(w.shine, w.shineCol || "#fff6c8", 2.6)); while (f.firstChild) g.appendChild(f.firstChild); }
  return g; }
/* PICS.wardrobeThumb(id, spec): the shop's picture of an item, on the learner's own figure, in the 160 x 190 box: framed on the item (a hat or
   glasses on the head and shoulders, a top or a held thing on the half figure, a costume on the whole figure, a pose or a dance as the
   figure doing it), on a plate whose richness goes with the price (everyday: the card; nicer: a warm glow; costumes: a coloured round;
   something wild: a deep round with twinkles; poses and dances: a stage and its light, and the dance played as a flip book) */
const THUMB_VIEW = { head: "portrait", face: "portrait", neck: "portrait", top: "half", outfit: "whole", hand: "half", pose: "pose", dance: "dance" };
const PLATE = { everyday: null, nicer: ["#fff4dc", "#fde7bb"], costume: ["#e3f0f7", "#c4ddea"], wild: ["#f3e3f6", "#d9b8e4"], move: ["#2d2a4a", "#4a3f73"] };
const THUMBS = new Map();
function wardrobeThumb(id, sp, opt){ const it = WARD[id]; if (!it) return null; sp = sp || {}; opt = opt || {};
  const key = id + "|" + (typeof sp === "string" ? sp : specString(Object.assign({}, AV_DEFAULT, sp))) + "|" + (opt.live ? 1 : 0);
  if (!opt.live && THUMBS.has(key)){ const g0 = mk(THUMBS.get(key)); return g0; }      // (the same picture again: kept, made once)
  const g = wardrobeThumb0(id, typeof sp === "string" ? specParse(sp) : sp, opt); if (!opt.live){ if (THUMBS.size > 120) THUMBS.clear(); THUMBS.set(key, g.innerHTML); } return g; }
function wardrobeThumb0(id, sp, opt){ const it = WARD[id], v = THUMB_VIEW[it.slot], g = mk(""), u = "wt" + (seq++), P = PLATE[it.tier];
  let back = "";
  if (P){ back += `<defs><radialGradient id="${u}p" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="${P[0]}"/><stop offset="1" stop-color="${P[1]}"/></radialGradient></defs>`;
    back += it.tier === "move" ? `<rect x="0" y="0" width="160" height="190" fill="url(#${u}p)"/><path d="M48 0L18 176H142L112 0Z" fill="#fff6d8" opacity=".14"/><ellipse cx="80" cy="174" rx="64" ry="11" fill="#fff6d8" opacity=".22"/>`
      : `<circle cx="80" cy="${v === "portrait" ? 92 : 98}" r="${it.tier === "nicer" ? 74 : 78}" fill="url(#${u}p)"/>`;
    if (it.tier === "wild" || it.tier === "move") back += sparkles([[22, 30, 6, 0], [138, 40, 7, 0.9], [134, 120, 5, 1.7], [24, 110, 5, 2.3]], it.tier === "move" ? "#ffe9a8" : "#ffffff", 2.8); }
  g.innerHTML = back;
  const S = Object.assign({}, sp), wear = [id], put = (x, tr) => { const h = mk(""); if (tr) h.setAttribute("transform", tr); h.appendChild(x); g.appendChild(h); };
  if (v === "portrait"){ const f = avatarW(S, { view: "portrait", wear, noShine: 1 }); put(f, id === "woolly" || id === "straw" ? "translate(80 190) scale(.92) translate(-80 -186)" : it.slot === "neck" ? "translate(80 66) scale(1.3) translate(-80 -80)" : it.slot === "face" ? "translate(80 70) scale(1.18) translate(-80 -80)" : null); }
  else if (v === "half"){ const f = avatarW(S, { view: "standing", wear, noShine: 1 }); const B = bodyOf(person(S), {}), hy = GY - (0.866 + 1.84 * B.hh) * B.H, k = 1.95 * 146 / (GY - hy) ** 0.0 / 146 * (146 / (GY - hy)) ** 0.25; put(f, `translate(80 16) scale(${f2(k)}) translate(-80 ${f1(-hy + 3)})`); }
  else if (v === "whole"){ const f = avatarW(S, { view: "standing", wear, noShine: 1 }); put(f, "translate(80 184) scale(1.1) translate(-80 -174)"); }
  else if (v === "pose"){ const f = avatarW(S, { view: "standing", wear, noShine: 1 }); put(f, "translate(80 180) scale(1.0) translate(-80 -172)"); }
  else if (opt.live){ const f = avatarW(S, { view: "celebrate", wear, noShine: 1 }); put(f, "translate(80 184) scale(1) translate(-80 -176)"); }
  else { const C = clipOf(id), f = avatarW(S, { view: "celebrate", wear, still: true, phase: ({ bow: 0.25 })[id] != null ? ({ bow: 0.25 })[id] : C.still % 1, noShine: 1 }); put(f, "translate(80 184) scale(1) translate(-80 -176)"); }      // (T4: in the grid a dance is ONE still frame, its card frame (the bow: the bend on the way down, the deepest point read as a fall): the 8-frame flip book was ~260 KB of markup each; the item's own sheet asks {live: true} and plays the loop)
  if (it.tier === "costume" || it.tier === "wild") { const f = mk(sparkles([[132, 30, 5, 0.4], [30, 52, 4, 1.4]], "#ffffff", 3)); while (f.firstChild) g.appendChild(f.firstChild); }
  return g; }
/* ---------- (figures 13) the two moments of the ceremonies: the high five (rank-up) and putting a thing on (the wardrobe) ----------
   The shell puts these pictures in its page as MARKUP (outerHTML), so they cannot be the live figure (drawn by script at every frame):
   each is a short FILM in SMIL alone, begun when it is put in the page and held on its last frame. A film is a few POSES of the figure
   (the rig's own drawing of a key), shown one after another (<set> of visibility), and between the poses the whole figure is moved by
   transforms (a step, a lean, a hop, a squash: animateTransform), so that a few drawings make a smooth movement. Parts of the drawing
   that are the same in several poses are written once (<defs>) and used (<use>): the head, the legs, the trunk are drawn once.
   Ids from the file's own sequence; no filters. */
const MOM = { pitch: 7 * Math.PI / 180 };
/* a pose drawn: c (the person, dressed), o: {yaw, k, x, y (the ground), legs, tag, smile, curl, fix: [key fixes], armK: the arms longer (a stretch)}, key: the body's key */
function momPose(c, o, key){ c = lookWear(c); const B0 = bodyOf(c, o), B = o.armK ? Object.assign({}, B0, { ua: B0.ua * o.armK, fa: B0.fa * o.armK }) : B0, W = wearer(c, o, o.u), cam = camera(o.yaw * Math.PI / 180, MOM.pitch, B.H * o.k, o.x, o.y);
  W.curl = o.curl != null ? o.curl : 0.45; let k = Float32Array.from(key); if (W.wd && W.wd.keyFix) k = W.wd.keyFix(k, B); for (const f of o.fix || []) k = f(k, B);
  const J = skeleton(k, B), fl = lowest(J); return { list: frame(k, B, cam, W, fl, o), defs: W.defs, B, cam, k, J, fl, P: p => cam.pt([p[0], p[1] - fl, p[2]]) }; }
/* where a point given in the chest's frame (x the figure's left, y up, z forward) is drawn */
function momAt(p, v){ return p.P(at(p.J.chest, p.J.Bc, v)); }
/* the wrist target (chest frame) whose drawn place is (X, Y): x across kept; y and z solved (the drawing is linear in them) */
function momReach(p, x, X, Y, y0, z0){ const f = (y, z) => momAt(p, [x, y, z]), a = f(y0, z0), b = f(y0 + 0.1, z0), c = f(y0, z0 + 0.1);
  const m11 = (b[0] - a[0]) / 0.1, m12 = (c[0] - a[0]) / 0.1, m21 = (b[1] - a[1]) / 0.1, m22 = (c[1] - a[1]) / 0.1, dx = X - a[0], dy = Y - a[1], det = m11 * m22 - m12 * m21;
  return [x, y0 + (dx * m22 - dy * m12) / det, z0 + (m11 * dy - m21 * dx) / det]; }
/* the wrist target (chest frame) whose drawn place is (X, Y) and that is nearest the shoulder s (chest frame): the point of the camera's ray
   through (X, Y) closest to s */
function momRay(p, X, Y, s){ const a = momAt(p, [0, 0, 0]), e = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map(v => { const q = momAt(p, v); return [q[0] - a[0], q[1] - a[1]]; });
  const A = [[e[0][0], e[1][0], e[2][0]], [e[0][1], e[1][1], e[2][1]]], n = [A[0][1] * A[1][2] - A[0][2] * A[1][1], A[0][2] * A[1][0] - A[0][0] * A[1][2], A[0][0] * A[1][1] - A[0][1] * A[1][0]];
  /* a particular solution in the plane y,z (x = 0) */
  const dx = X - a[0], dy = Y - a[1], det = A[0][1] * A[1][2] - A[0][2] * A[1][1], v0 = [0, (dx * A[1][2] - dy * A[0][2]) / det, (A[0][1] * dy - A[1][1] * dx) / det];
  const nn = n[0] * n[0] + n[1] * n[1] + n[2] * n[2], t = ((s[0] - v0[0]) * n[0] + (s[1] - v0[1]) * n[1] + (s[2] - v0[2]) * n[2]) / nn;
  return [v0[0] + t * n[0], v0[1] + t * n[1], v0[2] + t * n[2]]; }
/* an arm put where T says (chest frame, the figure's own side sg: 1 left, -1 right), its hand open (curl) */
const momArm = (side, T) => keyArm(side, () => T);
/* the film: figs = [{u, defs, poses: [{t (ms from which it shows), list}], move: {tr: [[t, x, y]], rot: [[t, deg]], sq: [[t, sx, sy]], cx, cy}}];
   dur: ms to the held last frame. Returns the markup of one <g> */
function momFilm(figs, dur){
  const D = f2(dur / 1000), kt = (L, f) => { if (L[0][0] !== 0) L = [[0].concat(L[0].slice(1))].concat(L); if (L[L.length - 1][0] < dur) L = L.concat([[dur].concat(L[L.length - 1].slice(1))]);
    return `values="${L.map(f).join(";")}" keyTimes="${L.map(x => f2(x[0] / dur)).join(";")}"`; };
  let out = "";
  for (const F of figs){ const P = F.poses, clips = new Map(), hash = t => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
    /* a part clipped by a shape of its own (the arms' shadow on the trunk ...): its clip shape written once for every pose that has the same */
    const html = (n, u) => { if (n.tag !== "clip") return nodeHTML(n, u); const id = u + n.id + hash(n.clip); if (!clips.has(id)) clips.set(id, `<clipPath id="${id}"><path d="${n.clip}"/></clipPath>`);
      return `<path data-p="${n.id}" clip-path="url(#${id})" d="${n.d}" fill="${n.fill}"/>`; };
    const raw = P.map(p => p.list.map(n => html(n, p.u)));
    /* the ids defined in the parts (clip shapes and the like, named by other parts): an id whose defining part is not the same in every pose
       is made each pose's own, with every name of it in that pose */
    const defsOf = new Map(); raw.forEach((L, i) => L.forEach(str => { for (const m of str.matchAll(/ id="([^"]+)"/g)){ if (!defsOf.has(m[1])) defsOf.set(m[1], { strs: new Set(), poses: new Set() }); const d = defsOf.get(m[1]); d.strs.add(str); d.poses.add(i); } }));
    const vary = [...defsOf].filter(([, d]) => d.strs.size > 1 || d.poses.size < P.length).map(([x]) => x);
    const strs = raw.map((L, i) => L.map(str => { for (const x of vary) if (str.includes(x)) str = str.split(`id="${x}"`).join(`id="${x}p${i}"`).split(`url(#${x})`).join(`url(#${x}p${i})`).split(`href="#${x}"`).join(`href="#${x}p${i}"`); return str; }));
    const count = new Map(); strs.forEach(L => new Set(L).forEach(s => count.set(s, (count.get(s) || 0) + 1)));
    const ids = new Map(); let defs = F.defs + [...clips.values()].join(""), nId = 0;
    for (const [s, n] of count) if (n > 1){ if (/^<clipPath/.test(s)){ defs += s; ids.set(s, ""); continue; }
      const id = `${F.u}s${nId++}`; ids.set(s, id); defs += s.replace(/^<(path|g) /, `<$1 id="${id}" `); }
    let poses = "", poseDefs = "";
    strs.forEach((L, i) => { const t0 = P[i].t, t1 = i + 1 < P.length ? P[i + 1].t : null;
      const body = L.map(s => { if (ids.has(s)) return ids.get(s) ? `<use href="#${ids.get(s)}"/>` : ""; if (/^<clipPath/.test(s)){ poseDefs += s; return ""; }      // (a pose's own clip shapes in the film's defs, never under a hidden group)
        return s; }).join("");
      poses += i === 0 ? `<g>${t1 != null ? `<set attributeName="visibility" to="hidden" begin="${f2(t1 / 1000)}s" fill="freeze"/>` : ""}${body}</g>`
        : `<g visibility="hidden"><set attributeName="visibility" to="visible" begin="${f2(t0 / 1000)}s"${t1 != null ? ` dur="${f2((t1 - t0) / 1000)}s"` : ` fill="freeze"`}/>${body}</g>`; });
    const M = F.move || {}, cx = f1(M.cx || 0), cy = f1(M.cy || 0), has = L => L && L.length > 1;
    const tr = has(M.tr) ? `<animateTransform attributeName="transform" type="translate" ${kt(M.tr, x => f1(x[1]) + " " + f1(x[2]))} dur="${D}s" fill="freeze"/>` : "";
    const rot = has(M.rot) ? `<animateTransform attributeName="transform" type="rotate" ${kt(M.rot, x => f2(x[1]) + " " + cx + " " + cy)} dur="${D}s" fill="freeze"/>` : "";
    const sq = has(M.sq) ? `<animateTransform attributeName="transform" type="scale" ${kt(M.sq, x => f2(x[1]) + " " + f2(x[2]))} dur="${D}s" fill="freeze"/>` : "";
    const t0 = M.tr && M.tr.length ? `translate(${f1(M.tr[0][1])} ${f1(M.tr[0][2])})` : "", r0 = M.rot && M.rot.length ? `rotate(${f2(M.rot[0][1])} ${cx} ${cy})` : "";
    out += `<defs>${defs}${poseDefs}</defs><g transform="${t0}">${tr}<g transform="${r0}">${rot}<g transform="translate(${cx} ${cy})"><g>${sq}<g transform="translate(${-cx} ${-cy})">${poses}</g></g></g></g></g>`; }
  return out; }

/* ---------- FIG.highFive(cM, cY, o): Marie (cM, on the left, facing right) and the learner (cY, dressed, on the right, facing left) meet
   in the middle of a 320 x 200 box and give each other a high five. o: {legsM, legsY, tagM}. The timing of RANKUP.md 5: a step each toward
   the other (0-350 ms), the wind-up (350-620: the arm nearest the other raised up and back, the palm open, leaning in), CONTACT at 620 ms
   (the palms meet above the heads at the middle, a slight squash), the follow-through (620-900: the arms swing down and out, the learner
   hops), settled by 1600 ms (Marie's other hand open, "bravo"), the last frame held. ---------- */
const HF = { dur: 1600, contact: 620, gy: 188, yaw: 80, h: 122, half: 32, step: 16, lean: 3, stretch: 1.24 };      // (stretch: the arms at the contact, a cartoon's stretch on the snap)
const fwd = T => T;      // (targets are in the chest's frame, z forward: the way the face looks)
function highFive(cM, sp, wear, o){ o = o || {}; wear = (wear || []).filter(id => WARD[id] && WARD[id].slot !== "pose" && WARD[id].slot !== "dance");
  const cY0 = person(sp), cY = wear.length ? dressUp(cY0, wear) : cY0; o.legsY = o.legsY || cY.legs || cY0.legs;
  const stand = clipOf("stand"), K0 = Float32Array.from(keyAt(stand, 0)), uM = "hm" + (seq++) + "_", uY = "hy" + (seq++) + "_";
  const BM = bodyOf(lookWear(cM), {}), k = HF.h / ((0.866 + 1.84 * BM.hh) * BM.H);      // one scale for both (a child is smaller)
  const open = (c, side) => withWd(c, w => { w["curl" + side] = 0; });
  /* Marie faces right (yaw 78, near profile: the reach is along the line between them), the learner left (yaw -78); each raises the FAR
     arm (Marie's left, the learner's right): it rises behind the head, so no arm crosses a face, and the two arms make an inverted V above */
  const M = { c: open(cM, "L"), side: "L", sg: 1, dir: -1, x: 160 - HF.half, o: { yaw: HF.yaw, k, y: HF.gy, legs: o.legsM, tag: o.tagM || "Marie", smile: 1.1, u: uM } };
  const Y = { c: open(cY, "R"), side: "R", sg: -1, dir: 1, x: 160 + HF.half, o: { yaw: -HF.yaw, k, y: HF.gy, legs: o.legsY, smile: 1.1, u: uY } };
  const armLen = F => { const B = bodyOf(lookWear(F.c), F.o); return (B.ua + B.fa) * HF.stretch * 0.99; };
  /* the meeting height: as high as both can reach at the middle (above the heads) */
  let yC = 30, sol = null;
  for (; yC < 120; yC += 1){ const r = [M, Y].map(F => { const p = momPose(F.c, Object.assign({}, F.o, { x: F.x, armK: HF.stretch }), K0), B = p.B, sh = p.J["sh" + F.side], Bc = p.J.Bc, ch = p.J.chest;
      const inv = v => [v[0] - ch[0], v[1] - ch[1], v[2] - ch[2]], dl = inv(sh), sC = [dl[0] * Bc.x[0] + dl[1] * Bc.x[1] + dl[2] * Bc.x[2], dl[0] * Bc.y[0] + dl[1] * Bc.y[1] + dl[2] * Bc.y[2], dl[0] * Bc.z[0] + dl[1] * Bc.z[1] + dl[2] * Bc.z[2]];
      const hand = B.hand * 0.42 * B.H * F.o.k;      // the palm's middle above the wrist (the hand up)
      /* the meeting point in the figure's own picture before its lean (the figure leans toward the other about its feet) */
      const a = -F.dir * HF.lean * Math.PI / 180, X0 = 160 + F.dir * 2.2 - F.x, Y0 = yC + hand - HF.gy, ca = Math.cos(-a), sa = Math.sin(-a), Xl = F.x + X0 * ca - Y0 * sa, Yl = HF.gy + X0 * sa + Y0 * ca;
      const w = momRay(p, Xl, Yl, sC), d = Math.hypot(w[0] - sC[0], w[1] - sC[1], w[2] - sC[2]);
      return { w, ok: d <= armLen(F) }; });
    if (r[0].ok && r[1].ok){ sol = r; break; } }
  M.wr = sol ? sol[0].w : [-0.05, 0.3, 0.25]; Y.wr = sol ? sol[1].w : [0.05, 0.3, 0.25];
  /* the arm's poses: keyArm's own convention (x outward from the arm's own side, y up, z forward); the hit's wrist is solved in the chest's
     own frame, so its x is turned to the arm's side */
  const A = (F, name) => { const s = F.sg, W = F.wr;
    return ({ rest: null,
      wind1: { wr: [0.16, 0.1, 0.0], hd: [0.1, 1, -0.1], pn: [0, 0, 1], pole: [1, -0.6, -0.2] },
      wind2: { wr: [0.06, 0.37, -0.1], hd: [0, 1, -0.3], pn: [0, 0.2, 1], pole: [0.6, -0.3, -0.8] },
      hit: { wr: [W[0] * s, W[1], W[2]], hd: [0, 1, 0.3], pn: [0, -0.25, 1], pole: [0.5, -1, -0.4] },
      after: { wr: [0.27, -0.2, -0.03], hd: [0.35, -0.9, -0.15], pn: [0.9, 0, 0.2], pole: [0.3, -1, 0.2] },
      settle: { wr: [0.17, -0.27, 0.05], hd: [0.15, -0.95, 0.2], pn: [-0.9, 0, 0.2], pole: [0.4, -1, -0.2] } })[name]; };
  const bravo = { wr: [0.1, -0.03, 0.15], hd: [-0.15, 0.85, 0.5], pn: [0.3, 0.2, 1], pole: [0.7, -1, -0.1] };      // Marie's other (right, near) hand: open, up, "bravo"
  const pose = (F, name, c, extra) => { const T = A(F, name), fix = T ? [momArm(F.side, T)] : []; if (extra) fix.push(extra); return momPose(c || F.c, Object.assign({}, F.o, { x: F.x, fix }, name === "hit" ? { armK: HF.stretch } : null), K0); };
  const cMb = withWd(M.c, w => { w.curlR = 0.05; });
  const PM = [[0, pose(M, "rest")], [400, pose(M, "wind2")], [620, pose(M, "hit")], [720, pose(M, "after")], [950, pose(M, "settle", cMb, keyArm("R", () => bravo))]];
  const PY = [[0, pose(Y, "rest")], [400, pose(Y, "wind2")], [620, pose(Y, "hit")], [720, pose(Y, "after")], [950, pose(Y, "rest")]];      // (the learner settles as at rest: drawn once, used twice)
  const st = HF.step, lean = HF.lean;
  const figM = { u: uM, defs: PM[0][1].defs, poses: PM.map(([t, p]) => ({ t, list: p.list, u: uM })), move: { cx: M.x, cy: HF.gy,
    tr: [[0, -st, 0], [175, -st / 2, -2.5], [350, 0, 0], [900, 0, 0], [1200, -3, 0]], rot: [[0, 0], [350, 0], [560, lean], [660, lean], [760, lean * 0.4], [900, 0]], sq: [[0, 1, 1], [450, 1, 1], [600, 0.99, 1.03], [630, 1.03, 0.965], [700, 1, 1]] } };
  const figY = { u: uY, defs: PY[0][1].defs, poses: PY.map(([t, p]) => ({ t, list: p.list, u: uY })), move: { cx: Y.x, cy: HF.gy,
    tr: [[0, st, 0], [175, st / 2, -2.5], [350, 0, 0], [700, 0, 0], [780, 1, -11], [880, 2, 0], [940, 3, -2.5], [1000, 3, 0], [1200, 4, 0]], rot: [[0, 0], [350, 0], [560, -lean], [660, -lean], [760, -lean * 0.4], [900, 0]],
    sq: [[0, 1, 1], [450, 1, 1], [600, 0.99, 1.03], [630, 1.03, 0.965], [700, 1.04, 0.94], [760, 0.97, 1.05], [880, 1.04, 0.95], [960, 1, 1]] } };
  const g = mk(momFilm([figM, figY], HF.dur));
  g.setAttribute("data-contact", String(HF.contact)); g.setAttribute("data-dur", String(HF.dur)); g.setAttribute("data-hand", `160 ${f1(yC)}`);
  return g; }

/* ---------- FIG.putOn(sp, wear, item): the learner puts on what they have just bought, in the 160 x 190 standing framing (as avatar's
   "standing" view); plays once in 1.2 s at most, the thing ON at data-on (600 ms), the last frame held. By the item's slot: a hat set
   on the head with both hands and tugged; glasses brought up by one hand, slid on, pushed at the bridge, a nod; a neck thing straightened
   with both hands; a top or an outfit: a quarter turn and back, the clothes changing on the turn, arms out "ta-da"; a thing carried
   swung up and held out. A pose or a dance: null (the shell shows them its own way). ---------- */
const PO = { dur: 1200, on: 600 };
function putOn(sp, wear, item){ const it = WARD[item]; if (!it || it.slot === "pose" || it.slot === "dance") return null;
  wear = (wear || []).filter(id => WARD[id] && WARD[id].slot !== "pose" && WARD[id].slot !== "dance"); const before = wear.filter(id => id !== item);
  const c0 = person(sp), cB = before.length ? dressUp(person(sp), before) : c0, cA = dressUp(person(sp), wear.indexOf(item) < 0 ? wear.concat([item]) : wear);
  const B = bodyOf(cA, {}), C = clipOf("stand"), yaw0 = C.yaw;
  const K0 = Float32Array.from(keyAt(C, 0)), u = "po" + (seq++) + "_", base = { k: 1, x: 80, y: GY, legs: cA.legs || c0.legs, smile: 0.5, yaw: yaw0, u };      // (as avatar's standing view: k 1)
  const P = (c, fixes, extra) => Object.assign(momPose(c, Object.assign({}, base, { fix: fixes || [] }, extra || {}), K0), { u });
  /* the arms' targets in keyArm's own convention: x outward from the arm's own side, y up, z forward (the chest's frame) */
  const both = T => [keyArm("L", () => T), keyArm("R", () => T)], one = (side, T) => [keyArm(side, () => T)];
  const head = (y, z, x) => ({ wr: [x || 0.11, y, z], hd: [-0.55, 0.8, 0.1], pn: [-1, 0, 0], pole: [1, -0.5, -0.3] });
  const nod = (a) => (k2) => { const r = Float32Array.from(k2), c = Math.cos(a), s = Math.sin(a), rot = i => { const y = r[i + 1], z = r[i + 2]; r[i + 1] = y * c - z * s; r[i + 2] = y * s + z * c; }; rot(24); rot(27); rot(30); return r; };
  const opn = c => withWd(c, w => { w.curlL = 0.15; w.curlR = 0.15; });
  let poses = [], move = { cx: 80, cy: GY, tr: [[0, 0, 0]], rot: [[0, 0]], sq: [[0, 1, 1]] };
  const slot = it.slot;
  if (slot === "head"){
    poses = [[0, P(cB)], [220, P(opn(cB), both(head(0.06, 0.12, 0.2)))], [420, P(opn(cB), both(head(0.27, 0.05)))],
      [600, P(opn(cA), both(head(0.25, 0.04)))], [760, P(opn(cA), both(head(0.21, 0.05)))], [900, P(cA, [], { smile: 1 })]];
    move.sq = [[0, 1, 1], [600, 1, 1], [700, 1.02, 0.975], [800, 1, 1]]; }
  else if (slot === "face"){
    const R = T => one("R", T), at = (y, z, xx) => ({ wr: [xx, y, z], hd: [-0.3, 0.9, 0.3], pn: [-0.6, 0, 1], pole: [1, -0.6, -0.2] });
    poses = [[0, P(cB)], [200, P(opn(cB), R(at(-0.02, 0.2, 0.1)))], [400, P(opn(cB), R(at(0.16, 0.15, 0.14)))], [600, P(opn(cA), R(at(0.2, 0.08, 0.15)))],
      [760, P(withWd(cA, w => { w.curlR = 0.6; }), R({ wr: [0.02, 0.19, 0.14], hd: [-0.05, 1, 0.1], pn: [0, 0, 1], pole: [1, -0.7, -0.1] }))], [920, P(cA, [nod(0.16)], { smile: 1 })], [1060, P(cA, [], { smile: 1 })]]; }
  else if (slot === "neck"){
    const th = (y, z, xx) => ({ wr: [xx, y, z], hd: [-0.7, 0.6, 0.2], pn: [0, 0, -1], pole: [1, -0.8, 0] });
    poses = [[0, P(cB)], [250, P(opn(cB), both(th(-0.02, 0.12, 0.12)))], [450, P(opn(cB), both(th(0.05, 0.1, 0.06)))],
      [600, P(opn(cA), both(th(0.05, 0.1, 0.06)))], [760, P(opn(cA), both(th(0.0, 0.12, 0.1)))], [920, P(cA, [], { smile: 1 })]]; }
  else if (slot === "hand"){
    const hs = handSideOf(cA);
    poses = [[0, P(cB)], [250, P(cB, one(hs, { wr: [0.2, -0.12, 0.2], hd: [0.2, 0.2, 1], pn: [-1, 0, 0], pole: [0.6, -1, -0.2] }))], [600, P(cA)],
      [780, P(cA, one(hs, { wr: [0.24, 0.07, 0.22], hd: [0.25, 0.7, 0.65], pn: [-0.4, 0, 1], pole: [0.7, -1, -0.3] }), { smile: 1 })]];
    move.tr = [[0, 0, 0], [780, 0, 0], [850, 0, -3], [940, 0, 0]]; }
  else {      // a top or an outfit: a quarter turn and back, the clothes changing on the turn, then "ta-da"
    const ta = both({ wr: [0.36, 0.08, 0.1], hd: [0.8, 0.5, 0.2], pn: [0.2, 0.2, 1], pole: [0.3, -1, -0.3] });
    /* (three drawings: the turn away is the figure narrowing, the change seen turned, then the front) */
    poses = [[0, P(cB)], [600, P(cA, [], { yaw: yaw0 + 75 })], [800, P(opn(cA), ta, { smile: 1 })]];
    move.sq = [[0, 1, 1], [200, 1, 1], [600, 0.55, 1], [640, 0.8, 1], [800, 1, 1], [860, 1.02, 0.98], [940, 1, 1]]; move.tr = [[0, 0, 0], [800, 0, 0], [860, 0, -3], [940, 0, 0]]; }
  const film = momFilm([{ u, defs: poses[poses.length - 1][1].defs, poses: poses.map(([t, p]) => ({ t, list: p.list, u })), move }], PO.dur);      // (one id prefix: the drawing before and after share every part they have alike; the dressed one's defs hold the undressed one's)
  let g = mk(film); const top = GY - (0.866 + 1.84 * B.hh + (cA.wd && cA.wd.tall || 0) * B.hh) * B.H;      // (as the standing view: a tall hat, the whole a little smaller)
  if (top < 6){ const s = (GY - 6) / (GY - top), h = mk(""); h.setAttribute("transform", `translate(80 ${GY}) scale(${f2(s * 100) / 100}) translate(-80 ${-GY})`); h.appendChild(g); g = mk(""); g.appendChild(h); }
  g.setAttribute("data-dur", String(PO.dur)); g.setAttribute("data-on", String(PO.on)); return g; }
/* the hand that carries a thing (the wardrobe's own keyArm side for it), else the right */
function handSideOf(c){ const ids = (c.wd && c.wd.ids) || []; return ids.indexOf("baguette") >= 0 ? "L" : "R"; }
/* ---------- the close-ups: smiling, not smiling, eating, drinking, sleeping, singing, reading, writing ----------
   The same body, head and camera as every other figure, seen close: the head and shoulders (smiling and not smiling: the face alone, filling
   the card), the arms put where the action needs the hands by the lengths of the two bones (the elbow found as an elbow bends), the hands
   with fingers, what is held placed by the hand and drawn among the body's parts by its depth. Each card means what the earlier drawing
   meant (the learners have learned those): the apple bitten at the mouth; the glass tipped at the lips; the head on a pillow, the eyes shut,
   z z z; the microphone, the mouth wide open, the notes; the open book held up in both hands, the eyes on it; the sheet on a table, the pen
   at the end of a written line, the eyes on it; the broad smile (lips parted on the teeth, the corners up, the cheeks raising the lower
   lids) against the face that does not smile (the lips closed and level, the eyes open). The mouth is the teacher's (her mouth shapes). */
HANDS.grip = { f: [[1.0, 1.2], [1.05, 1.25], [1.1, 1.25], [1.15, 1.25]], sp: 0, th: [0.75, 0.8, 0.35] };          // round a glass or a microphone
HANDS.ball = { f: [[0.55, 0.62], [0.6, 0.66], [0.66, 0.7], [0.72, 0.76]], sp: 0.05, th: [0.8, 0.45, 0.25] };       // round an apple
HANDS.pen = { f: [[0.55, 0.5], [0.95, 1.05], [1.2, 1.3], [1.3, 1.4]], sp: 0, th: [0.5, 0.75, 0.3] };               // a pen between the thumb and the first two fingers
HANDS.book = { f: [[0.12, 0.18], [0.14, 0.2], [0.16, 0.22], [0.2, 0.26]], sp: 0.01, th: [0.7, -0.1, 0.1] };        // the fingers on the cover, the thumb round its edge
/* a mouth shape drawn once (the teacher's drawing, rig.mouth.draw, as a still picture): v = [open, width, protrusion, closed, teeth, fv,
   tongue], smile 0 .. 1.3; in the teacher's units (a head height of 50.5), scaled to the head's own */
function mouthSVG(v, smile, u, lipC, dimC, grin){
  const [open, width, protr, closed, teeth, fv, tongue] = v, T = TUT0, F = n => n.toFixed(2), gr = grin || 0;      // grin: the close-up's smile, broader than the teacher's (it is a taught picture: it must read at 80 px)
  const bs = (closed > 0.5 || open < 0.08) ? Math.max(0, Math.min(1, (smile - 1) / 0.3)) : 0, sm = smile * (1 - 0.8 * protr), Wd = 6 + 10 * width - 3 * protr + 2.4 * sm + (T.smW + 2.2 * gr) * bs;
  let H = closed > 0.5 ? 0.1 : Math.max(0.1, 0.6 + 8 * open); if (closed < 0.5 && protr > 0.3) H = Math.max(H, Wd * 0.75 * protr); if (bs) H = Math.max(H, (T.smH + 1.6 * gr) * bs);
  const L = 2.3 + 1.8 * protr, lift = 2.6 * sm + (T.smLift + 1.8 * gr) * bs, xl = -Wd - L * 0.75, xr = Wd + L * 0.75, yc = -lift + 0.4, up = -H - L * 1.05, dn = H + L * 1.4;
  const lips = `M${F(xl)} ${F(yc)}Q${F(-Wd * 0.55)} ${F(up - 0.8)} -1.8 ${F(up + 0.2)}Q0 ${F(up + 1.1)} 1.8 ${F(up + 0.2)}Q${F(Wd * 0.55)} ${F(up - 0.8)} ${F(xr)} ${F(yc)}Q${F(Wd * 0.6)} ${F(dn + 0.8)} 0 ${F(dn)}Q${F(-Wd * 0.6)} ${F(dn + 0.8)} ${F(xl)} ${F(yc)}Z`;
  const yi = -lift * 0.7, hIn = fv > 0.5 ? 0.8 : H, inner = `M${F(-Wd)} ${F(yi)}Q0 ${F(-hIn * 1.05 - lift * 0.25)} ${F(Wd)} ${F(yi)}Q0 ${F(hIn * 1.05 + lift * 0.6)} ${F(-Wd)} ${F(yi)}Z`;
  const th = teeth > 0.05 ? Math.min(H * 1.2, 2.2 + 1.4 * teeth) : bs ? H * 1.15 : 0;
  let s = `<g transform="scale(${(1 / 50.5).toFixed(5)})"><path d="${lips}" fill="${lipC}"/>`;
  if (H > 0.7) s += `<path d="${inner}" fill="#4a1c22"/><clipPath id="${u}"><path d="${inner}"/></clipPath><g clip-path="url(#${u})"><rect x="${F(-Wd)}" y="${F(-H - lift * 0.3)}" width="${F(2 * Wd)}" height="${F(th)}" fill="#f7f3ec"/>`
    + (open > 0.25 ? `<rect x="${F(-Wd)}" y="${F(H - Math.min(1.6, H * 0.4))}" width="${F(2 * Wd)}" height="1.6" fill="#ece6dc"/>` : "") + (open > 0.15 ? `<ellipse cy="${F(H - 1.5 - 3.5 * tongue * open)}" rx="${F(Wd * 0.7)}" ry="3" fill="#cf6b74" opacity="${(0.55 + 0.45 * tongue).toFixed(2)}"/>` : "") + `</g>`;
  if (H <= 1.2) s += `<path d="M${F(xl + 1.2)} ${F(yc + 0.2)}Q0 ${F(lift * 0.95 + 0.3)} ${F(xr - 1.2)} ${F(yc + 0.2)}" stroke="#8e3d45" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M${F(-Wd * 0.38)} ${F(dn - 1.3)}Q0 ${F(dn - 0.6)} ${F(Wd * 0.38)} ${F(dn - 1.3)}" stroke="#e39aa0" stroke-width=".8" fill="none" stroke-linecap="round" opacity=".4"/>`;
  const dm = Math.min(1, Math.max(0, sm - 0.95) * 1.2); if (dm > 0) s += `<path d="M${F(xl - 1.6)} ${F(yc - 3.4)}q-2.2 3.2 0 6.6M${F(xr + 1.6)} ${F(yc - 3.4)}q2.2 3.2 0 6.6" stroke="${dimC}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="${dm.toFixed(2)}"/>`;
  return s + `</g>`;
}
const sm01c = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
/* each close-up: how long its loop is (the earlier drawing's: the page waits for a whole loop, so these are teaching times and stay as they
   were; reading had no loop and has none), which phase is the card, where the card puts the head (x, y of the head's middle, its height) */
/* (figures 12; Jon: "the sleeping one is too long and the smiling one is too long ... It gets boring") the loops brought to the range of
   jump / stand up / sit down (0.67 / 1.3 s): smile 3.2 -> 1.6 s, eat 2.2 -> 1.4, drink 2.4 -> 1.5, sleep 2.8 -> 1.6, sing 2.8 -> 1.6, write 1.6 -> 1.4 */
const CLOSE = { hold: { dur: 0, still: 0, at: [112, 62, 50], yaw: -10 }, smile: { dur: 1.6, still: 0.5, at: [80, 74, 146], yaw: -8 }, neutral: { dur: 1.6, still: 0, at: [80, 74, 146], yaw: -8 },
  eat: { dur: 1.4, still: 0.42, at: [84, 66, 64] }, drink: { dur: 1.5, still: 0.45, at: [86, 66, 64] }, sleep: { dur: 1.6, still: 0.3, at: [86, 74, 64] },
  sing: { dur: 1.6, still: 0.25, at: [82, 64, 64] }, read: { dur: 0, still: 0.3, at: [80, 58, 62] }, write: { dur: 1.4, still: 0.6, at: [80, 52, 60], pitch: 16 } };
/* ---------- the moods (figures10): how a person feels, on the new head ----------
   FIG.close("feel", c, {mood, frame}): frame "face" (the face card: the head and the tops of the shoulders, no hands: the face, and what is
   round it, tell) or "half" (the person's state on PICS.person: from the waist up, the posture and the hands tell too). The moods (the
   course's: ça va bien / ça va / ça va pas (Lessons 11-20, told apart by the face), il a faim / soif, il a froid / chaud, il est fatigué
   (Lessons 21-40: "Il est fatigué ou il a faim ?", "a man shivering, a man in the sun"), and later content, surpris, malade, avoir peur;
   angry and bored are drawn too). Each after the Facial Action Coding System (Ekman and Friesen) as the illustrators' guides use it:
   good: AU6 + AU12, the cheeks raise the lower lids, a broad smile; so-so: the lids a little down, the mouth level, pulled to one side;
   bad (sad): AU1 + AU4 (the inner ends of the brows up and together), AU15 (the corners down), the lids lowered, the eyes down, the head
   hung; surprised: AU1 + AU2 (the brows up and round), AU5 (white over the iris), AU26 (the jaw dropped, a round open mouth); scared:
   AU1 + AU2 + AU4 (the brows up but drawn together, flat), AU5 + AU7, AU20 (the lips stretched sideways, the teeth showing); angry: AU4
   (the brows down and together, a furrow), AU5 + AU7 (a glare under a slanted lid), AU23 + AU24 (the lips pressed, the corners down);
   tired: the yawn (the jaw wide, the eyes squeezed, a tear, the brows up); ill: the lids heavy, the brows' inner ends up, pale, a
   thermometer in the mouth; bored: the lids half down, the eyes aside, the mouth flat to one side, the head on a hand. */
const FEEL_OF = { good: "good", "feeling good": "good", happy: "good", content: "good", glad: "good", soso: "soso", "so-so": "soso", "feeling so-so": "soso",
  bad: "bad", "feeling bad": "bad", sad: "bad", unhappy: "bad", hungry: "hungry", thirsty: "thirsty", cold: "cold", hot: "hot", tired: "tired", sleepy: "tired",
  surprised: "surprised", scared: "scared", afraid: "scared", frightened: "scared", angry: "angry", cross: "angry", ill: "ill", sick: "ill", unwell: "ill", bored: "bored" };
const FEEL = {
  good:      { eyes: { squint: 0.85, lid: 0.012 }, brows: { inn: 0.2, out: 0.3, ar: 0.5 }, mouth: [0, 0.62, 0, 1, 0, 0, 0], smile: 1.35, grin: 1.5, head: [-0.04, 0.06, 0] },
  soso:      { eyes: { mood: { ld: 0.18, gx: -0.2 } }, brows: { inn: 0.05, out: -0.05, ar: -0.6 }, mouth: [0, 0.4, 0, 1, 0, 0, 0], smile: 0, mskew: [0.03, -5], head: [0, 0.1, 0.02] },
  bad:       { eyes: { mood: { ld: 0.3, sl: -1, gy: 0.9 } }, brows: { inn: 1.05, out: -0.3, kn: 0.7, ar: -0.5 }, mart: "frown", head: [0.14, 0.1, 0], sh: -0.1, lean: 0.14 },
  hungry:    { eyes: { mood: { wide: 0.15, gx: 0.9, gy: -0.9 } }, brows: { inn: 0.6, out: 0.15 }, mart: "lick", head: [-0.12, -0.12, 0.1] },
  thirsty:   { eyes: { mood: { ld: 0.3, sl: -0.4, gx: 0.9, gy: -0.8 } }, brows: { inn: 0.75, out: 0, kn: 0.3, ar: -0.2 }, mart: "pant", head: [-0.08, -0.1, 0.1] },
  cold:      { eyes: { mood: { wide: 0.3, lo: 0.25 } }, brows: { inn: 0.9, out: 0.1, kn: 0.55, ar: -0.3 }, mart: "chatter", head: [0.06, 0, 0], sh: 0.3, skin: ["#9ab2dc", 0.12], cheek: ["#7f94e6", 0.7], nose: "#e8808a", lip: "#9a86c0" },
  hot:       { eyes: { mood: { ld: 0.45, sl: -0.45 } }, brows: { inn: 0.65, out: -0.1, ar: -0.2 }, mart: "pant", head: [-0.1, 0.14, 0], skin: ["#e87a5c", 0.14], cheek: ["#ec4a36", 0.8], sweat: 1 },
  tired:     { eyes: { mood: { shut: 2, tear: 1 } }, brows: { inn: 0.75, out: 0.45, ar: 0.2 }, mouth: [1.35, 0.42, 0.05, 0, 0.45, 0, 0.5], smile: -0.1, head: [-0.16, 0.2, 0], sh: -0.04 },
  surprised: { eyes: { mood: { wide: 1 } }, brows: { inn: 1.1, out: 1.15, ar: 0.8 }, mouth: [0.9, 0.16, 0.25, 0, 0.15, 0, 0.2], smile: 0, head: [-0.1, 0, 0], lines: 1 },
  scared:    { eyes: { mood: { wide: 1, lo: 0.2, gx: -0.6 } }, brows: { inn: 1.1, out: 0.35, kn: 0.9, ar: -0.7 }, mart: "stretch", head: [0.08, -0.08, 0.16], sh: 0.24, lean: -0.1, furrow: 1, sweat: 1 },
  angry:     { eyes: { mood: { wide: 0.3, sl: 1, lo: 0.35 } }, brows: { dn: 1.05, kn: 1, out: 0.4, inn: -0.1, ar: -0.7 }, mart: "press", head: [0.12, 0, 0], lean: 0.06, cheek: ["#e4553e", 0.55], furrow: 1 },
  ill:       { eyes: { mood: { ld: 0.52, sl: -0.55, bags: 1 } }, brows: { inn: 0.85, out: -0.1, kn: 0.45 }, mart: "therm", head: [0.08, 0.18, 0], skin: ["#a8c080", 0.3], cheek: ["#9fb874", 0.5], sh: 0.12, lean: 0.1, sweat: 1 },
  /* (figures 11) the eater's verdict: it is good (the eyes shut in arches, a broad open grin) / it is not (the eyes screwed up, the brows knitted, the tongue out, the head turned away) */
  yum:       { eyes: { squint: 1, lid: 0.03 }, brows: { inn: 0.35, out: 0.5, ar: 0.7 }, mouth: [0.3, 0.64, 0, 0, 0.95, 0, 0], smile: 1.35, grin: 1.5, head: [-0.08, 0.07, 0], cheek: ["#ee7a66", 0.5] },
  yuck:      { eyes: { mood: { shut: 2 } }, brows: { dn: 0.9, kn: 1, out: 0.2, inn: -0.1, ar: -0.6 }, mart: "pant", head: [0.02, -0.12, 0.22], sh: 0.14, furrow: 1, skin: ["#a8c080", 0.12] },
  plain:     { mouth: [0, 0.4, 0, 1, 0, 0, 0], smile: 0.45, head: [0, 0, 0] },      // (the learner's everyday face: "Ça va." without a look)
  bored:     { eyes: { mood: { ld: 0.58, gx: -0.9, gy: -0.5 } }, brows: { inn: -0.05, out: -0.2, ar: -0.8 }, mouth: [0, 0.3, 0, 1, 0, 0, 0], smile: -0.3, mskew: [-0.05, 7], head: [0.02, -0.32, -0.06] } };
/* the mouths that mouthSVG does not draw, in head heights round the mouth's middle */
function feelMouth(kind, lipC, u, v){
  const R = x => Math.round(x * 1000) / 1000, dark = "#4a1c22", tooth = "#f7f3ec", gap = "#cdbfae";
  if (kind === "chatter" || kind === "stretch"){
    /* the teeth: cold, clenched and chattering (the jaw shut, the lips drawn back); scared, the lips stretched sideways (AU20), parted */
    const w = kind === "stretch" ? 0.25 : 0.215, t = kind === "stretch" ? -0.055 : -0.05, b = kind === "stretch" ? 0.085 : 0.05, dw = kind === "stretch" ? 0.02 : 0;
    const inner = `M${R(-w)} ${R(t + 0.02)}Q0 ${R(t - 0.02)} ${R(w)} ${R(t + 0.02)}Q${R(w + 0.02)} ${R((t + b) / 2)} ${R(w - dw)} ${R(b)}Q0 ${R(b + 0.03)} ${R(-w + dw)} ${R(b)}Q${R(-w - 0.02)} ${R((t + b) / 2)} ${R(-w)} ${R(t + 0.02)}Z`;
    let s = `<path d="${inner}" fill="${lipC}" stroke="${lipC}" stroke-width=".07" stroke-linejoin="round"/><path d="${inner}" fill="${dark}"/><clipPath id="${u}fm"><path d="${inner}"/></clipPath><g clip-path="url(#${u}fm)">`;
    if (kind === "chatter"){ s += `<rect x="${R(-w)}" y="${R(t - 0.03)}" width="${R(2 * w)}" height="${R(b - t + 0.06)}" fill="${tooth}"/><path d="M${R(-w)} ${R((t + b) / 2 + 0.004)}l.03 -.01l.03 .01l.03 -.01l.03 .01l.03 -.01l.03 .01l.03 -.01l.03 .01l.03 -.01l.03 .01l.03 -.01l.03 .01l.03 -.01l.03 .01" stroke="${gap}" stroke-width=".016" fill="none"/>`;
      for (const x of [-0.15, -0.08, 0, 0.08, 0.15]) s += `<path d="M${x} ${R(t - 0.02)}V${R(b + 0.02)}" stroke="${gap}" stroke-width=".01"/>`; }
    else { s += `<rect x="${R(-w)}" y="${R(t - 0.03)}" width="${R(2 * w)}" height=".062" fill="${tooth}"/><rect x="${R(-w)}" y="${R(b - 0.032)}" width="${R(2 * w)}" height=".06" fill="#ece6dc"/>`;
      for (const x of [-0.12, -0.04, 0.04, 0.12]) s += `<path d="M${x} ${R(t - 0.02)}V${R(t + 0.03)}M${x} ${R(b - 0.03)}V${R(b + 0.02)}" stroke="${gap}" stroke-width=".009"/>`; }
    return s + `</g>`; }
  if (kind === "frown") return `<path d="M-.22 .1Q-.12 -.04 0 -.045Q.12 -.04 .22 .1Q.12 .02 0 .025Q-.12 .02 -.22 .1Z" fill="${lipC}" stroke="${lipC}" stroke-width=".035" stroke-linejoin="round"/><path d="M-.23 .105Q-.12 -.035 0 -.035Q.12 -.035 .23 .105" stroke="#7a2e34" stroke-width=".04" fill="none" stroke-linecap="round"/><path d="M-.11 .13Q0 .075 .11 .13" stroke="${v.dimC}" stroke-width=".024" fill="none" stroke-linecap="round" opacity=".75"/>`;
  if (kind === "press") return `<path d="M-.19 .045Q-.1 -.005 0 -.005Q.1 -.005 .19 .045Q.1 .035 0 .04Q-.1 .035 -.19 .045Z" fill="${lipC}" stroke="${lipC}" stroke-width=".03" stroke-linejoin="round"/><path d="M-.2 .05Q-.1 .0 0 .005Q.1 .0 .2 .05" stroke="#7a2e34" stroke-width=".035" fill="none" stroke-linecap="round"/><path d="M-.1 .13Q0 .1 .1 .13" stroke="${v.dimC}" stroke-width=".022" fill="none" stroke-linecap="round" opacity=".7"/>`;
  if (kind === "therm") return `<path d="M-.12 .03Q0 .0 .1 .02" stroke="#8e3d45" stroke-width=".04" fill="none" stroke-linecap="round"/><path d="M-.13 .03Q0 .1 .11 .03" stroke="${lipC}" stroke-width=".05" fill="none" stroke-linecap="round" opacity=".8"/>`
    + `<g transform="translate(.06 .02) rotate(24)"><rect x="0" y="-.042" width=".62" height=".084" rx=".042" fill="#f4fafd" stroke="#5f84a3" stroke-width=".018"/><rect x=".05" y="-.016" width=".38" height=".032" rx=".016" fill="#e0453a"/><path d="M.22 -.042v.02M.3 -.042v.02M.38 -.042v.02M.46 -.042v.02" stroke="#5f84a3" stroke-width=".01"/></g>`;
  if (kind === "lick" || kind === "pant"){
    /* hungry: the lips parted, the tongue's tip on the upper lip at one corner (licking the lips at the thought of food); thirsty and hot:
       the mouth open, the tongue out over the lower lip (panting) */
    const base = mouthSVG(kind === "lick" ? [0.18, 0.36, 0.05, 0, 0.4, 0, 0.6] : [0.42, 0.34, 0.05, 0, 0.45, 0, 1], kind === "lick" ? 0.35 : -0.25, u + "fo", lipC, v.dimC, 0);
    return base + (kind === "lick" ? `<path d="M.07 -.02Q.12 -.1 .2 -.06Q.22 .0 .14 .03Z" fill="#d86a74"/><path d="M.12 -.04Q.16 -.06 .19 -.04" stroke="#b44f5a" stroke-width=".012" fill="none"/>`
      : `<path d="M-.085 .07Q-.1 .25 0 .26Q.1 .25 .085 .07Z" fill="#d86a74"/><path d="M0 .1V.2" stroke="#b44f5a" stroke-width=".014" stroke-linecap="round"/>`); }
  return "";
}
/* what is drawn round the head, in the card's pixels: hx, hy the head's middle, hs its height */
function feelFront(m, hx, hy, hs, half){
  const R = x => Math.round(x * 10) / 10, out = [];
  const bubble = inner => { const r = hs * (half ? 0.42 : 0.31), bx = Math.min(160 - 5 - r, hx + hs * 0.66), by = Math.max(5 + r, hy - hs * 0.66);
    return `<g><circle cx="${R(hx + hs * 0.36)}" cy="${R(hy - hs * 0.5)}" r="${R(hs * 0.035)}" fill="#fff" stroke="#8d97a6" stroke-width="1.6"/><circle cx="${R((hx + hs * 0.36 + bx) / 2 - r * 0.25)}" cy="${R((hy - hs * 0.5 + by) / 2 + r * 0.25)}" r="${R(hs * 0.06)}" fill="#fff" stroke="#8d97a6" stroke-width="1.8"/>`
      + `<circle cx="${R(bx)}" cy="${R(by)}" r="${R(r)}" fill="#fff" stroke="#8d97a6" stroke-width="2.2"/><g transform="translate(${R(bx)} ${R(by)}) scale(${R(r / 30 * 100) / 100})">${inner}</g></g>`; };
  if (m === "hungry") out.push(bubble(`<path d="M-8 -9q-3.5 -4.5 0 -9M0 -10q-3.5 -4.5 0 -9M8 -9q-3.5 -4.5 0 -9" stroke="#a9b0ba" stroke-width="2.2" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="9" rx="22" ry="8" fill="#e9e6df"/><ellipse cx="0" cy="7.5" rx="22" ry="7.5" fill="#fdfcf8" stroke="#a7aeb8" stroke-width="1.4"/><ellipse cx="0" cy="7" rx="14" ry="4.4" fill="none" stroke="#e1ddd3" stroke-width="1.2"/>`
    + `<path d="M-15 7Q-16 -6 -4 -7Q2 -11 8 -6Q16 -4 15 7Q0 12 -15 7Z" fill="#c8793a"/><path d="M-9 -2Q-4 -6 3 -5" stroke="#e7a865" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="-6" cy="5" r="2.6" fill="#6aa64a"/><circle cx="1" cy="6" r="2.6" fill="#6aa64a"/><circle cx="8" cy="4.5" r="2.4" fill="#e04b3a"/>`));
  if (m === "thirsty") out.push(bubble(`<path d="M-11 -17L-8.5 16H8.5L11 -17Z" fill="#eef6fc" stroke="#5d86ad" stroke-width="2" stroke-linejoin="round"/><path d="M-10.2 -6L-8.4 15H8.4L10.2 -6Z" fill="#5aaeea"/><path d="M-10.2 -6H10.2" stroke="#2f7fcc" stroke-width="1.4"/><path d="M-5.5 -2.5L-4.5 11" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/><path d="M15 -14c2.6 3.6 3 5.4 0 7c-3 -1.6 -2.6 -3.4 0 -7Z" fill="#8fd0f5" stroke="#3f8fd0" stroke-width="1"/>`));
  if (m === "cold"){ const zz = (x, y, f, s) => `<path d="M${R(x)} ${R(y)}l${R(4 * f * s)} ${R(5 * s)}l${R(-4 * f * s)} ${R(5 * s)}l${R(4 * f * s)} ${R(5 * s)}" stroke="#5f93d6" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const s = hs / 100, dx = Math.min(hs * 0.56, 80 - 25 * s); out.push(zz(hx - dx - 6 * s, hy - hs * 0.25, -1, s * 1.2) + zz(hx - dx - 15 * s, hy - hs * 0.05, -1, s) + zz(hx + dx + 6 * s, hy - hs * 0.25, 1, s * 1.2) + zz(hx + dx + 15 * s, hy - hs * 0.05, 1, s)); }
  if (m === "hot"){ const s = hs / 100, wv = (x, y) => `<path d="M${R(x)} ${R(y)}q${R(-5 * s)} ${R(-6 * s)} 0 ${R(-12 * s)}t0 ${R(-12 * s)}" stroke="#f08a3c" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    const dr = (x, y, k) => `<path d="M0 -7C4.6 0 5.6 3 0 6.6C-5.6 3 -4.6 0 0 -7Z" fill="#8fd0f5" stroke="#3f8fd0" stroke-width="1.2" transform="translate(${R(x)} ${R(y)}) scale(${R(k * s * 100) / 100})"/>`;
    out.push(wv(hx - 22 * s, hy - hs * 0.6) + wv(hx, hy - hs * 0.66) + wv(hx + 22 * s, hy - hs * 0.6) + dr(Math.max(9, hx - hs * 0.62), hy - hs * 0.12, 1.3) + dr(Math.min(151, hx + hs * 0.64), hy - hs * 0.2, 1.1) + dr(Math.min(152, hx + hs * 0.58), hy + hs * 0.12, 0.9)); }
  if (m === "surprised"){ const s = hs / 100, L = (a, r0, r1) => { const c = Math.cos(a), sn = Math.sin(a); return `M${R(hx + c * r0)} ${R(hy - hs * 0.08 + sn * r0)}L${R(hx + c * r1)} ${R(hy - hs * 0.08 + sn * r1)}`; };
    out.push(`<path d="${[-2.35, -2.0, -1.65, -1.49, -1.14, -0.79].map(a => L(a, hs * 0.66, hs * 0.66 + 12 * s)).join("")}" stroke="#e0a030" stroke-width="3" stroke-linecap="round"/>`); }
  if (m === "scared"){ const s = hs / 100, ar = (x, y, f) => `<path d="M${R(x)} ${R(y)}q${R(4 * f * s)} ${R(7 * s)} 0 ${R(14 * s)}M${R(x + 6 * f * s)} ${R(y - 3 * s)}q${R(5 * f * s)} ${R(10 * s)} 0 ${R(20 * s)}" stroke="#7d8fb3" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    out.push(ar(hx - hs * 0.58, hy - hs * 0.2, -1) + ar(hx + hs * 0.58, hy - hs * 0.2, 1)); }
  return out.join("");
}
HANDS.fist = { f: [[1.45, 1.7], [1.5, 1.72], [1.52, 1.72], [1.5, 1.68]], sp: 0, th: [0.25, 1.0, 0.55] };
HANDS.thumb = { f: [[1.45, 1.7], [1.5, 1.72], [1.52, 1.72], [1.5, 1.68]], sp: 0, th: [1.35, -0.15, 0.0] };
HANDS.spread = { f: [[0.04, 0.05], [0.03, 0.04], [0.05, 0.05], [0.08, 0.07]], sp: 0.2, th: [0.8, 0.05, 0.05] };
HANDS.rest = { f: [[0.3, 0.35], [0.34, 0.4], [0.4, 0.45], [0.46, 0.52]], sp: 0.03, th: [0.45, 0.25, 0.2] };
/* where the card puts the head of a mood (x, y of its middle, its height): the face card large; the half figure smaller (the hands and the
   shoulders tell too); with a thought bubble (hungry, thirsty) the head moves down and left to leave the corner to it */
const feelFrame = o => { const half = o.frame !== "face", bub = o.mood === "hungry" || o.mood === "thirsty";
  return { dur: 0, still: 0, yaw: half ? -12 : -8, at: half ? (bub ? [70, 84, 60] : [80, 80, 68]) : (bub ? [66, 106, 104] : [80, 100, 120]) }; };
/* FIG.close(name, c, o): name smile | neutral | eat | drink | sleep | sing | read | write | feel (o.mood, o.frame); o.still (the card), o.phase, o.tag, o.legs */
/* (figures 12; Jon, 16 Nov: the learner's smile in the action box drawn far outside its card) a close-up is drawn larger than its card
   (the smile closes in on the face; the body and arms run on below the card's foot): it is clipped to the card's own box, 160 x 190 with
   the cards' rounded corners, wherever it is put (the action box, a row); o.box false: not clipped (two side by side, clipped together) */
const inCard = g => { const u = "cc" + (seq++), w = mk(`<clipPath id="${u}"><rect width="160" height="190" rx="16"/></clipPath><g clip-path="url(#${u})"></g>`); w.lastChild.appendChild(g); return w; };
function closeUp(name, c, o){
  c = lookWear(c, true);
  o = o || {}; const card = o.still && o.phase == null, D = name === "feel" ? feelFrame(o) : CLOSE[name] || CLOSE.neutral, heads = c.kid ? null : c.teen ? 5 : 5.6, B = bodyOf(c, { heads }), u = "cu" + (seq++) + "_", hh = B.hh;
  const setv = (k, i, v) => { const n = nrm(v); k[i] = n[0]; k[i + 1] = n[1]; k[i + 2] = n[2]; }, getv = (k, i) => [k[i], k[i + 1], k[i + 2]];
  const rot = (v, ax, a) => { ax = nrm(ax); const cs = Math.cos(a), sn = Math.sin(a), d = dot(ax, v), cr = cross(ax, v); return [v[0] * cs + cr[0] * sn + ax[0] * d * (1 - cs), v[1] * cs + cr[1] * sn + ax[1] * d * (1 - cs), v[2] * cs + cr[2] * sn + ax[2] * d * (1 - cs)]; };
  const base = Float32Array.from(clipOf("seat").keys[0]); setv(base, 27, [1, 0, 0]); setv(base, 30, [0, 1, 0.03]); setv(base, 24, [0, 1, 0.12]);
  const rest = (k, i, sg) => { setv(k, i, [0.14 * sg, -0.99, 0.02]); setv(k, i + 3, [0.08 * sg, -0.95, 0.3]); setv(k, i + 6, [0.03 * sg, -0.93, 0.36]); setv(k, i + 9, [-0.94 * sg, -0.05, -0.3]); };
  rest(base, 33, 1); rest(base, 45, -1);
  const J0 = skeleton(base, B), floor = lowest(J0), yawD = D.yaw != null ? D.yaw : -14, yaw = yawD * Math.PI / 180, pitch = (D.pitch || 7) * Math.PI / 180, S = D.at[2] / (2 * hh);
  const cam0 = camera(yaw, pitch, S, 0, 0), q0 = cam0.pt([J0.head[0], J0.head[1] - floor, J0.head[2]]), cam = camera(yaw, pitch, S, D.at[0] - q0[0], D.at[1] - q0[1]);
  const lipC = c.fem ? "#c4626a" : mixc(c.lip || "#b8645f", "#c4626a", 0.3), dimC = mixc(c.skin[1], c.skin[2], 0.55);
  /* the arm: the wrist at wr (the body's own frame), the elbow down and out (pole), the hand pointing hd with its palm toward pn */
  const arm = (k, J, side, wr, hd, pn, pole) => { const sg = side === "L" ? 1 : -1, off = side === "L" ? 33 : 45, sh = J["sh" + side], a = B.ua, b = B.fa;
    let d = sub(wr, sh), L = Math.hypot(d[0], d[1], d[2]); const mx = (a + b) * 0.995, mn = Math.abs(a - b) + 0.02; if (L > mx){ d = mul(d, mx / L); L = mx; } if (L < mn){ d = mul(d, mn / (L || 1)); L = mn; }
    const uu = mul(d, 1 / L), x = (a * a - b * b + L * L) / (2 * L), h = Math.sqrt(Math.max(0, a * a - x * x)); let pl = pole || [sg * 0.55, -1, 0.1]; pl = nrm(sub(pl, mul(uu, dot(pl, uu))));
    const el = add(add(sh, mul(uu, x)), mul(pl, h)); setv(k, off, sub(el, sh)); setv(k, off + 3, sub(add(sh, d), el)); setv(k, off + 6, hd); setv(k, off + 9, sub(pn, mul(nrm(hd), dot(pn, nrm(hd))))); };
  const hand = (shape, sc) => handFlat(HANDS[shape] || HANDS.relaxed).concat([sc || 1]);
  /* the head turned on the neck: pitch (down +), roll (toward its own right +), yaw */
  const headTo = (k, pch, roll, yw) => { let X = getv(k, 27), Y = getv(k, 30); const Z = cross(X, Y);
    if (yw){ X = rot(X, [0, 1, 0], yw); Y = rot(Y, [0, 1, 0], yw); }
    if (pch) Y = rot(Y, X, pch);
    if (roll){ const Zn = nrm(cross(X, Y)); X = rot(X, Zn, roll); Y = rot(Y, Zn, roll); }
    setv(k, 27, X); setv(k, 30, Y); const n = getv(k, 24); setv(k, 24, rot(n, X, pch * 0.4)); };
  const mouthAt = J => at(J.head, J.Bh, [0, -0.64 * hh, 0.74 * hh]);
  const R3 = v => Math.round(v * 1000) / 1000, F1 = f1;
  /* the things held, drawn in the figure's light: a lit tone and a shade tone */
  const ball = (id, p, r, lit, shade, P, S2, z) => { const q = P(p), e = r * S2 * 0.18; return { id, z: z == null ? q[2] : z, mat: id, layers: [[ellPath(disc(q, r * S2), 0, 0, 0), shade], [ellPath(disc(q, r * S2), -e, LIGHT[0] * e, LIGHT[1] * e), lit]] }; };
  function pose(ph){
    const k = Float32Array.from(base); let J = skeleton(k, B); const E = { mouth: [0, 0.42, 0, 1, 0, 0, 0], smile: 0.3, eyes: null, hands: { L: hand("relaxed"), R: hand("relaxed") }, extra: [] };
    const tw = ph * 2 * Math.PI;
    if (name === "smile" || name === "neutral"){
      const s = name === "smile" ? (card ? 1 : sm01c((ph - 0.1) / 0.18) * (1 - sm01c((ph - 0.8) / 0.15))) : 0;
      E.smile = 1.32 * s; E.grin = s; E.mouth = [0, 0.42 + 0.12 * s, 0, 1, 0, 0, 0]; E.eyes = s > 0.02 ? { squint: 0.8 * s, lid: 0.012 * s } : null; headTo(k, -0.02 * s, 0, 0); }
    else if (name === "eat"){
      /* the apple brought up to the mouth, bitten, taken a little away while the mouth chews */
      const up = card ? 1 : sm01c(ph / 0.3) * (1 - 0.35 * sm01c((ph - 0.55) / 0.2)) , bite = card ? 1 : Math.max(0, Math.sin(Math.min(1, Math.max(0, (ph - 0.28) / 0.2)) * Math.PI));
      headTo(k, -0.04 - 0.05 * bite, 0, -0.1); J = skeleton(k, B); const M = mouthAt(J), rA = 0.55 * hh;
      const A = add(add(M, mul(J.Bh.z, rA * 0.75)), [-0.045 - 0.02 * (1 - up), -0.02 - 0.16 * (1 - up), 0.02 * (1 - up)]), hd = nrm([0.35, 0.82, 0.25]), pn = nrm([0.25, -0.15, 0.95]);
      const wr = sub(sub(A, mul(hd, B.hand * 0.42)), mul(nrm(sub(pn, mul(hd, dot(pn, hd)))), rA * 0.95));
      arm(k, J, "R", wr, hd, pn, [-0.6, -1, 0.25]); E.hands.R = hand("ball");
      const chew = card ? 0 : Math.max(0, Math.sin((ph - 0.45) * 6 * Math.PI)) * (ph > 0.45 ? 1 : 0);
      E.mouth = bite > 0.05 ? [0.32 * bite, 0.42, 0.05, 0, 0.9, 0, 0] : [0.04 + 0.1 * chew, 0.4, 0.1, chew > 0.3 ? 0 : 1, 0, 0, 0]; E.smile = 0.25;
      E.extra.push((J2, P, S2) => { const A2 = A, q = P(A2), r = rA * S2, bt = disc([q[0] + r * 0.62, q[1] - r * 0.15], r * 0.48);
        const warm = (() => { const h = hex(c.top[0]); return h[0] > 190 && h[1] < 175 && h[2] < 190; })(), L = ball("apple", A2, rA, warm ? "#9ccb58" : "#d8443a", warm ? "#6fa038" : "#a8302a", P, S2, P(A2)[2] + 0.004), st = P(add(A2, [0, rA * 1.05, 0])), st0 = P(add(A2, [0, rA * 0.7, 0]));
        return [L, { id: "appleB", z: L.z + 0.0002, tag: "clip", clip: ellPath(disc(q, r), 0, 0, 0), d: ellPath(bt, 0, 0, 0), fill: "#f4e7c4" },
          { id: "appleH", z: L.z + 0.0003, mat: "appleH", layers: [[ellPath({ c: [q[0] - r * 0.4, q[1] - r * 0.38], a: r * 0.22, b: r * 0.13, th: -0.6 }, 0, 0, 0), warm ? "#cfe89a" : "#f2a28f"]] },
          { id: "appleS", z: L.z + 0.0004, mat: "appleS", layers: [[capsule(st0[0], st0[1], r * 0.07, st[0] + r * 0.12, st[1], r * 0.05), "#6b4a2a"], [ellPath({ c: [st[0] + r * 0.42, st[1] + r * 0.02], a: r * 0.34, b: r * 0.14, th: -0.35 }, 0, 0, 0), "#5aa04a"]] }]; }); }
    else if (name === "drink"){
      /* the glass tipped at the lips, the head back a little */
      const up = card ? 1 : sm01c(ph / 0.28) * (1 - sm01c((ph - 0.78) / 0.18)), tip = up * (card ? 1 : sm01c((ph - 0.2) / 0.2));
      headTo(k, -0.1 * tip, 0, -0.08); J = skeleton(k, B); const M = mouthAt(J), rg = 0.56 * hh, hg = 1.62 * hh;      // (the glass larger: it must read at 80 px)
      const ax = nrm([0.8 * tip, 1 - 0.45 * tip, -0.35 * tip]), rim = add(add(M, mul(J.Bh.z, 0.01)), [-0.01, -0.012 - 0.15 * (1 - up), 0.03 * (1 - up)]), rc = add(rim, mul(ax, -rg * 0.15)), bc = sub(rim, mul(ax, hg));
      const gc = add(rim, mul(ax, -hg * 0.55)), hd = nrm(cross(ax, [0, 0, 1])), hd2 = nrm([hd[0] > 0 ? hd[0] : -hd[0], 0.35, 0.15]), pn = nrm(sub([0, 0, -1], mul(ax, dot([0, 0, -1], ax))));
      const wr = add(add(gc, mul(nrm([-1, -0.2, 0.3]), rg * 1.9)), [0, -0.01, 0.02]);
      arm(k, J, "R", wr, nrm(add(hd2, mul(ax, 0.2))), nrm([0.2, 0.1, -1]), [-0.7, -1, 0.1]); E.hands.R = hand("grip");
      E.mouth = [0.06, 0.32, 0.6, 0, 0, 0, 0]; E.smile = 0;
      E.extra.push((J2, P, S2) => { const a1 = nrm(cross(ax, [1, 0, 0])), a2 = nrm(cross(ax, a1)), el = (p, r) => { const Q = ellipse(P(p), [cam.lin(mul(a1, r)), cam.lin(mul(a2, r)), [0, 0, 0]]); Q.n = 24; return Q; };
        const Er = el(rc, rg), Eb = el(bc, rg * 0.82), lvl = add(bc, mul(ax, hg * 0.55)), Ew = el(lvl, rg * 0.92), z = P(gc)[2] + 0.01, Eb2 = el(add(bc, mul(ax, rg * 0.15)), rg * 0.78);
        return [{ id: "glass", z, mat: "glass", layers: [[hullOf([Er, Eb], 0, 0, 0), "#cfe6f6"], [hullOf([Ew, Eb2], 0, 0, 0), "#7cc0ee"]] },
          { id: "glassE", z: z + 0.0001, mat: "glassE", layers: [[ellPath(Er, 0, 0, 0), "#9cc4e4"], [ellPath(Er, -Math.max(0.6, rg * S2 * 0.12), 0, 0), "#e8f4fc"]] },
          { id: "glassH", z: z + 0.0002, mat: "glassH", layers: [[capsule(...(p => [p[0], p[1]])(P(add(rc, mul(a1, rg * 0.55)))), Math.max(0.5, rg * S2 * 0.08), ...(p => [p[0], p[1]])(P(add(bc, mul(a1, rg * 0.5)))), Math.max(0.4, rg * S2 * 0.06)), "rgba(255,255,255,.75)"]] }]; }); }
    else if (name === "sleep"){
      /* the head laid over on a pillow, the eyes shut, breathing */
      const br = card ? 0 : Math.sin(tw) * 0.5 + 0.5; headTo(k, 0.06, 0.36, 0.1); J = skeleton(k, B);
      E.eyes = { shut: 1 }; E.mouth = [0.05 + 0.04 * br, 0.14, 0.55, 0, 0, 0, 0]; E.smile = 0;
      E.extra.push((J2, P, S2) => { const hc = P(J2.head), w = 2.6 * hh * S2, h = 1.7 * hh * S2, cx = hc[0] - 0.55 * hh * S2, cy = hc[1] + 0.25 * hh * S2, a = -18, rr = h * 0.3;
        const rect = (g, dx, dy) => { const x0 = -w / 2 - g, y0 = -h / 2 - g, ww = w + 2 * g, hh2 = h + 2 * g, r = Math.max(1, rr + g); return `M${F1(x0 + r)} ${F1(y0)}H${F1(x0 + ww - r)}Q${F1(x0 + ww)} ${F1(y0)} ${F1(x0 + ww)} ${F1(y0 + r)}V${F1(y0 + hh2 - r)}Q${F1(x0 + ww)} ${F1(y0 + hh2)} ${F1(x0 + ww - r)} ${F1(y0 + hh2)}H${F1(x0 + r)}Q${F1(x0)} ${F1(y0 + hh2)} ${F1(x0)} ${F1(y0 + hh2 - r)}V${F1(y0 + r)}Q${F1(x0)} ${F1(y0)} ${F1(x0 + r)} ${F1(y0)}Z`; };
        return [{ id: "pillow", z: P(J2.head)[2] - 0.25, tag: "g", m: [Math.cos(a * Math.PI / 180), Math.sin(a * Math.PI / 180), -Math.sin(a * Math.PI / 180), Math.cos(a * Math.PI / 180), cx, cy].map(R3),
          inner: `<path d="${rect(0)}" fill="#a9c2e6"/><path d="${rect(-w * 0.04)}" transform="translate(${F1(-w * 0.03)} ${F1(-h * 0.05)})" fill="#d4e3f7"/><path d="M${F1(-w * 0.38)} ${F1(-h * 0.3)}Q0 ${F1(-h * 0.2)} ${F1(w * 0.38)} ${F1(-h * 0.3)}" stroke="#eef4fc" stroke-width="${F1(h * 0.04)}" fill="none" stroke-linecap="round" opacity=".8"/>` }]; }); }
    else if (name === "sing"){
      /* the microphone held up before the mouth, the mouth wide open on the notes */
      const op = card ? 1 : 0.55 + 0.45 * Math.abs(Math.sin(tw * 3)); headTo(k, -0.1, 0.06, -0.05); J = skeleton(k, B); const M = mouthAt(J), rb = 0.3 * hh;
      const G = add(add(M, mul(J.Bh.z, 0.075)), [-0.02, -0.025, 0]), hax = nrm([0.12, 1, 0.45]), h0 = sub(G, mul(hax, rb + 0.01)), h1 = sub(G, mul(hax, 0.13));
      const wr = sub(add(mul(add(h0, h1), 0.5), mul(nrm([-0.6, 0, 0.3]), 0.012)), mul(hax, 0.05));
      arm(k, J, "R", wr, nrm([0.9, 0.15, 0.3]), nrm([0.1, -0.2, -1]), [-0.25, -1, 0.3]); E.hands.R = hand("grip");
      E.mouth = [0.5 * op, 0.4, 0.15, 0, 0.7, 0, 0.3]; E.smile = 0.2; E.eyes = { lid: 0.03 };
      E.extra.push((J2, P, S2) => { const a = P(h0), b = P(h1), g = P(G), z = g[2] - 0.004, r = rb * S2;
        return [{ id: "micH", z: (a[2] + b[2]) / 2, mat: "micH", layers: [[capsule(a[0], a[1], 0.085 * hh * S2, b[0], b[1], 0.13 * hh * S2), "#2c2f36"], [capsule(a[0] - 0.4, a[1] - 0.2, 0.05 * hh * S2, b[0] - 0.4, b[1] - 0.3, 0.08 * hh * S2), "#4a4e58"]] },
          { id: "micG", z, mat: "micG", layers: [[ellPath(disc(g, r), 0, 0, 0), "#7e848f"], [ellPath(disc(g, r), -r * 0.16, LIGHT[0] * r * 0.16, LIGHT[1] * r * 0.16), "#b9bec7"]] },
          { id: "micM", z: z + 0.0001, tag: "g", m: [r, 0, 0, r, g[0], g[1]].map(R3), inner: `<path d="M-.7 -.35H.7M-.85 0H.85M-.7 .35H.7M-.35 -.7V.7M0 -.85V.85M.35 -.7V.7" stroke="#6a707b" stroke-width=".07" opacity=".7"/>` }]; }); }
    else if (name === "read"){
      /* the open book held up in both hands, its covers to the viewer, the eyes on its pages */
      headTo(k, 0.36, 0, 0); J = skeleton(k, B); E.eyes = { lid: 0.032, pup: 0.065 };      // (the lids lower only a little: the eyes read open at 80 px, looking down) E.mouth = [0, 0.38, 0, 1, 0, 0, 0]; E.smile = 0.25;
      const what = o.reading === "newspaper" || o.reading === "letter" ? o.reading : "book", news = what === "newspaper", letter = what === "letter";
      const sp0 = add(J.chest, [0, -0.03, 0.2]), Wb = 0.95 * hh * (news ? 2.1 : letter ? 0.95 : 1.6), Hb = 1.6 * hh * (news ? 1.45 : 1.25), open = letter ? 0.06 : news ? 0.4 : 0.5;
      const cov = sg => [sp0, add(sp0, [sg * Wb * Math.cos(open), 0, -Wb * Math.sin(open)])];
      for (const [side, sg] of [["L", 1], ["R", -1]]){ const e = cov(sg)[1], wr = add(e, [sg * 0.03, -Hb * 0.12, -0.01]);
        arm(k, J, side, wr, nrm([-sg * 0.85, 0.2, 0.35]), nrm([sg * 0.3, 0, -1]), [sg * 0.8, -1, -0.2]); E.hands[side] = hand("book"); }
      E.extra.push((J2, P, S2) => { const out = [], c0 = P(add(sp0, [0, -Hb / 2, 0])), c1 = P(add(sp0, [0, Hb / 2, 0]));
        for (const sg of [1, -1]){ const e = cov(sg)[1], q = [P(add(sp0, [0, -Hb / 2, 0])), P(add(e, [0, -Hb / 2, 0])), P(add(e, [0, Hb / 2, 0])), P(add(sp0, [0, Hb / 2, 0]))];
          const pg = [P(add(sp0, [0, Hb / 2 - 0.004, -0.004])), P(add(add(e, mul(sub(sp0, e), 0.04)), [0, Hb / 2 - 0.004, -0.01])), P(add(add(e, mul(sub(sp0, e), 0.04)), [0, Hb / 2 + 0.008, -0.03])), P(add(sp0, [0, Hb / 2 + 0.01, -0.03]))];
          const z = Math.max(q[0][2], q[1][2]) + 0.002;
          if (what === "book") out.push({ id: "pages" + sg, z: z - 0.001, mat: "pages" + sg, layers: [[poly(pg.map(p => [p[0], p[1]])), "#f4efe2"]] });
          out.push({ id: "cover" + sg, z, mat: "cover" + sg, layers: [[poly(q.map(p => [p[0], p[1]])), what === "book" ? (sg > 0 ? "#c23a32" : "#d8483f") : news ? (sg > 0 ? "#dedbd0" : "#f1eee4") : (sg > 0 ? "#ece6d6" : "#fbf9f3")]] });
          if (what !== "book"){ const at2 = (a, b3) => { const t0 = [q[0][0] + (q[1][0] - q[0][0]) * a, q[0][1] + (q[1][1] - q[0][1]) * a], t1 = [q[3][0] + (q[2][0] - q[3][0]) * a, q[3][1] + (q[2][1] - q[3][1]) * a]; return [t0[0] + (t1[0] - t0[0]) * b3, t0[1] + (t1[1] - t0[1]) * b3]; }, ln = (a0, a1, b3) => { const A1 = at2(a0, b3), B1 = at2(a1, b3); return `M${F1(A1[0])} ${F1(A1[1])}L${F1(B1[0])} ${F1(B1[1])}`; };
            let tx = ""; for (let i = 0; i < (news ? 7 : 6); i++) tx += ln(0.12, i % 3 === 2 ? 0.6 : 0.88, (news ? 0.66 : 0.82) - i * (news ? 0.085 : 0.12));
            out.push({ id: "txt" + sg, z: z + 0.0005, mat: "txt" + sg, stroke: [tx, letter ? "#7f93d6" : "#9a9a94", F1(Math.max(0.7, 0.012 * S2))] });
            if (news) out.push({ id: "hdl" + sg, z: z + 0.0006, mat: "hdl" + sg, stroke: [ln(0.12, 0.88, 0.84), "#3d424c", F1(Math.max(1.4, 0.04 * S2))] }, sg < 0 ? { id: "npic", z: z + 0.0007, mat: "npic", layers: [[poly([at2(0.5, 0.34), at2(0.88, 0.34), at2(0.88, 0.1), at2(0.5, 0.1)]), "#a9c7de"]] } : { id: "npx", z: z + 0.0007, mat: "npx", layers: [["M0 0", "#fff"]] }); } }
        if (what === "book") out.push({ id: "spine", z: P(sp0)[2] + 0.003, mat: "spine", layers: [[capsule(c0[0], c0[1], 0.7, c1[0], c1[1], 0.7), "#a52e27"]] });
        if (what !== "book") return out;
        const t0 = P(add(cov(-1)[1], [0.02, Hb * 0.22, 0])), t1 = P(add(add(sp0, mul(sub(cov(-1)[1], sp0), 0.35)), [0, Hb * 0.22, 0])), t2 = P(add(cov(-1)[1], [0.02, Hb * 0.1, 0])), t3 = P(add(add(sp0, mul(sub(cov(-1)[1], sp0), 0.5)), [0, Hb * 0.1, 0]));
        out.push({ id: "title", z: P(sp0)[2] + 0.004, mat: "title", layers: [[capsule(t0[0], t0[1], 0.9, t1[0], t1[1], 0.9) + capsule(t2[0], t2[1], 0.9, t3[0], t3[1], 0.9), "#f08a80"]] });
        return out; }); }
    else if (name === "write"){
      /* at a table: the sheet on it, the pen at the end of the line being written, the other hand on the sheet; the eyes on the pen */
      headTo(k, 0.26, -0.04, 0); J = skeleton(k, B); E.eyes = { lid: 0.032, pup: 0.065 }; E.mouth = [0, 0.36, 0, 1, 0, 0, 0]; E.smile = 0.2;
      const yT = J.chest[1] - 0.13, z0 = J.chest[2] + 0.08, P0 = [0.0, yT, z0 + 0.14], ux = nrm([1, 0, 0.12]), uz = nrm([0.12, 0, -1]), pw = 0.3, ph2 = 0.18;
      const onP = (a, b) => add(add(P0, mul(ux, a)), mul(uz, b));          // a point of the sheet: a across (to the figure's right), b toward the figure
      const lines = [0.045, 0.085, 0.125], wl = 0.2, w3 = card ? 2.6 : Math.min(2.999, ph * 3.15), li = Math.floor(w3), prog = card ? 0.6 : 0.06 + 0.92 * (w3 - li), pen = onP(-wl / 2 + wl * prog, ph2 / 2 - lines[li]);      // (the loop writes the three lines one after the other)
      const wr = add(pen, [0.03, 0.035, -0.045]); arm(k, J, "L", wr, nrm([-0.4, -0.35, 0.85]), nrm([-0.2, -0.9, -0.1]), [0.5, -1, -0.3]); E.hands.L = hand("pen", 0.95);
      arm(k, J, "R", add(onP(-0.17, -0.01), [0, 0.012, 0]), nrm([0.55, -0.12, 0.8]), nrm([0, -1, 0]), [-0.5, -1, -0.3]); E.hands.R = hand("flat", 0.95);
      E.extra.push((J2, P, S2) => { const out = [], tq = [P([-0.6, yT, J.chest[2] + 0.06]), P([0.6, yT, J.chest[2] + 0.06]), P([0.6, yT, z0 + 0.6]), P([-0.6, yT, z0 + 0.6])], te = [tq[0], tq[1], P([0.6, yT - 0.03, J.chest[2] + 0.06]), P([-0.6, yT - 0.03, J.chest[2] + 0.06])];
        const zt = P(J.chest)[2] + 0.06, xy = p => [p[0], p[1]];
        out.push({ id: "table", z: zt, mat: "table", layers: [[poly(tq.map(xy)), "#b98a58"], [poly(tq.map(xy)), "#c99a62"]] });
        const sq = [onP(-pw / 2, -ph2 / 2), onP(pw / 2, -ph2 / 2), onP(pw / 2, ph2 / 2), onP(-pw / 2, ph2 / 2)].map(p => P([p[0], p[1] + 0.002, p[2]]));
        out.push({ id: "sheet", z: zt + 0.001, mat: "sheet", layers: [[poly(sq.map(p => [p[0] + 0.8, p[1] + 1.2])), "#a3784a"], [poly(sq.map(xy)), "#fbf9f3"]] });
        let ink = ""; lines.forEach((b, i) => { const n = i < li ? 1 : i === li ? prog : 0; if (n <= 0) return; let d = ""; const N = Math.max(2, Math.round(24 * n));
          for (let j = 0; j <= N; j++){ const a = -wl / 2 + wl * n * j / N, w = Math.sin(j / N * n * 26) * 0.006, p = P(add(onP(a, ph2 / 2 - b + w), [0, 0.003, 0])); d += (j ? "L" : "M") + F1(p[0]) + " " + F1(p[1]); } ink += d; });
        out.push({ id: "ink", z: zt + 0.002, mat: "ink", stroke: [ink || "M0 0", "#2f4fb0", 1.8] });
        const pt = P(pen), pb = P(add(pen, [0.03, 0.09, 0.06]));
        out.push({ id: "pen", z: P(wr)[2] + 0.01, mat: "pen", layers: [[capsule(pt[0], pt[1], 0.5, pb[0], pb[1], 1.3), "#2a2d36"]] });
        return out; }); }

    else if (name === "hold"){
      /* (figures 11) somebody holds a thing up in one hand, to show it: the person at the right of the card, the arm out to the side, the thing large beside them, its foot in the hand */
      E.smile = 0.75; headTo(k, 0, 0.04, 0.12); J = skeleton(k, B); const T = o.thing || { html: "", box: [0, 0, 1, 1] }, wr = add(J.shR, mul(nrm([-0.62, -0.05, 0.6]), (B.ua + B.fa) * 0.84));
      arm(k, J, "R", wr, nrm([-0.1, 1, 0.15]), nrm([0.6, 0, 0.8]), [-0.5, -1, -0.3]); E.hands.R = hand("hold", 1.1);
      E.extra.push((J2, P, S2) => { const q = P(add(wr, [0, B.hand * 0.55, 0.01])), b = T.box, f = Math.min(76 / b[2], Math.max(40, q[1] - 6) / b[3]), R1 = v => Math.round(v * 1000) / 1000;
        const cx = Math.max(b[2] * f / 2 + 3, Math.min(q[0], 160 - b[2] * f / 2)); return [{ id: "held", z: q[2] - 0.004, tag: "g", m: [R1(f), 0, 0, R1(f), R1(cx - (b[0] + b[2] / 2) * f), R1(q[1] + 3 - (b[1] + b[3]) * f)], inner: T.html }]; }); }
    else if (name === "feel"){
      /* a mood (FEEL): the face (eyes, brows, mouth, the cheeks' colour, marks on the face), the head's set, the shoulders, the hands */
      const M = FEEL[o.mood] || FEEL.soso, half = o.frame !== "face"; if (o.mood !== "plain") E.featK = 1.2; const AL = B.ua + B.fa, lc = mixc(c.skin[1], c.skin[2], 0.6);
      E.mouth = M.mouth || [0, 0.4, 0, 1, 0, 0, 0]; E.smile = M.smile || 0; E.grin = M.grin || 0; E.eyes = M.eyes; E.brows = M.brows; E.mart = M.mart; E.mskew = M.mskew; E.skin = M.skin; E.cheek = M.cheek; E.lip = M.lip; E.marks = [];
      if (M.sh){ k[19] += M.sh; k[22] += M.sh; }
      if (M.lean) for (const i of [9, 12, 15]) setv(k, i, rot(getv(k, i), [1, 0, 0], M.lean));
      const hd0 = M.head || [0, 0, 0]; headTo(k, hd0[0], hd0[1], hd0[2]); J = skeleton(k, B);
      if (M.furrow) E.marks.push({ id: "fFur", p: [0, 0.2, 0.82], inner: `<path d="M-.05 -.075Q-.03 0 -.045 .075M.05 -.075Q.03 0 .045 .075" stroke="${lc}" stroke-width=".024" fill="none" stroke-linecap="round" opacity=".85"/>` });
      if (M.lines) E.marks.push({ id: "fLin", p: [0, 0.52, 0.74], inner: `<path d="M-.3 .02Q0 -.05 .3 .02M-.24 .12Q0 .06 .24 .12M-.22 -.09Q0 -.15 .22 -.09" stroke="${lc}" stroke-width=".022" fill="none" stroke-linecap="round" opacity=".75"/>` });
      if (M.nose) E.marks.push({ id: "fNos", p: [0, -0.31, 0.86], inner: `<ellipse rx=".085" ry=".06" fill="${M.nose}" opacity=".75"/>` });
      if (M.sweat){ const dr = `<path d="M0 -.1C.065 0 .075 .045 0 .09C-.075 .045 -.065 0 0 -.1Z" fill="#a8dcf7" stroke="#3f8fd0" stroke-width=".014"/>`;
        E.marks.push({ id: "fSw1", p: [-0.5, 0.42, 0.56], az: -40, inner: dr }); if (o.mood === "hot") E.marks.push({ id: "fSw2", p: [0.28, 0.5, 0.66], az: 20, inner: dr }); }
      const set = (side, wr, hd, pn, pole, shape) => { arm(k, J, side, wr, nrm(hd), nrm(pn), pole); E.hands[side] = hand(shape); };
      const A = (side, v) => add(J["sh" + side], mul(v, AL)), H = (p, v) => add(p, mul(v, hh)), m = o.mood;
      const belly = add(add(mul(J.chest, 0.5), mul(J.root, 0.5)), [0, 0, 0.8 * hh]), mouthP = mouthAt(J);
      if (half){
        if (m === "good") set("R", A("R", [0.02, -0.26, 0.62]), [0.15, 0.1, 1], [1, 0, -0.1], [-0.6, -1, -0.2], "thumb");
        else if (m === "soso"){ const wr = A("R", [0.25, -0.3, 0.64]); set("R", wr, [0.75, -0.05, 0.6], [0, -1, 0.05], [-0.8, -1, 0], "flat");
          E.extra.push((J2, P) => { const q = P(add(wr, mul(nrm([0.75, 0, 0.6]), B.hand * 0.55))), r = B.hand * 0.75 * cam.scale, R1 = f1;
            return [{ id: "rock", z: q[2] + 0.02, tag: "g", m: [1, 0, 0, 1, 0, 0], inner: `<path d="M${R1(q[0] - r)} ${R1(q[1] - r * 0.55)}q${R1(-r * 0.3)} ${R1(r * 0.55)} 0 ${R1(r * 1.1)}M${R1(q[0] + r)} ${R1(q[1] - r * 0.55)}q${R1(r * 0.3)} ${R1(r * 0.55)} 0 ${R1(r * 1.1)}" stroke="#7a8597" stroke-width="2.2" fill="none" stroke-linecap="round"/>` }]; }); }
        else if (m === "hungry"){ set("R", H(belly, [-0.55, 0.15, 0.05]), [1, -0.2, 0.15], [0, 0.1, -1], [-0.7, -1, -0.3], "rest"); set("L", H(belly, [0.6, -0.35, 0.0]), [-1, -0.1, 0.15], [0, 0.1, -1], [0.7, -1, -0.3], "rest"); }
        else if (m === "cold"){ set("R", A("L", [-0.1, -0.33, 0.3]), [0.6, 0.35, -0.7], [0.4, 0, -1], [-0.3, -1, 0.6], "rest"); set("L", A("R", [0.1, -0.36, 0.26]), [-0.6, 0.35, -0.7], [-0.4, 0, -1], [0.3, -1, 0.6], "rest"); }
        else if (m === "hot"){ const wr = H(J.head, [-1.15, -1.25, 0.45]); set("R", wr, [0.2, 1, 0.1], [0.95, 0, 0.3], [-0.6, -1, 0.2], "flat");
          E.extra.push((J2, P) => { const q = P(add(wr, [0, B.hand * 0.6, 0])), r = B.hand * 0.6 * cam.scale, R1 = f1;
            return [{ id: "fan", z: q[2] + 0.02, tag: "g", m: [1, 0, 0, 1, 0, 0], inner: `<path d="M${R1(q[0] - r * 1.3)} ${R1(q[1] - r * 0.6)}q${R1(-r * 0.4)} ${R1(r * 0.6)} 0 ${R1(r * 1.2)}M${R1(q[0] - r * 1.75)} ${R1(q[1] - r * 0.85)}q${R1(-r * 0.5)} ${R1(r * 0.85)} 0 ${R1(r * 1.7)}" stroke="#7a8597" stroke-width="2.2" fill="none" stroke-linecap="round"/>` }]; }); }
        else if (m === "surprised"){ set("R", A("R", [-0.2, -0.3, 0.5]), [-0.1, 1, 0.2], [0, 0, 1], [-0.8, -1, 0], "spread"); set("L", A("L", [0.2, -0.3, 0.5]), [0.1, 1, 0.2], [0, 0, 1], [0.8, -1, 0], "spread"); }
        else if (m === "scared"){ set("R", H(J.chest, [-0.95, 0.05, 1.45]), [0.1, 1, 0.1], [0, -0.1, 1], [-0.8, -1, 0], "spread"); set("L", H(J.chest, [0.95, -0.05, 1.4]), [-0.1, 1, 0.1], [0, -0.1, 1], [0.8, -1, 0], "spread"); }
        else if (m === "angry"){ set("R", A("R", [0.02, -0.36, 0.52]), [0.3, -0.1, 1], [1, 0, 0], [-0.7, -1, -0.3], "fist"); set("L", A("L", [-0.02, -0.36, 0.52]), [-0.3, -0.1, 1], [-1, 0, 0], [0.7, -1, -0.3], "fist"); }
        else if (m === "yum" && o.eating){ const wr = A("R", [0.05, -0.2, 0.62]); set("R", wr, [0.1, 1, 0.15], [1, 0, 0.1], [-0.7, -1, -0.2], "fist");      // a fork held up with the next bite
          E.extra.push((J2, P, S2) => { const h0 = add(wr, [0, B.hand * 0.2, 0.01]), a = P(add(h0, [0, -0.02, 0])), b2 = P(add(h0, [0.004, 0.13, 0])), t = P(add(h0, [0.005, 0.17, 0])), z = P(h0)[2] + 0.012, tw2 = 0.03 * S2;
            const hw = Math.max(1, 0.012 * S2), tl = 0.045 * S2; let d = `M${f1(a[0])} ${f1(a[1])}L${f1(b2[0])} ${f1(b2[1])}M${f1(b2[0] - tw2)} ${f1(b2[1])}H${f1(b2[0] + tw2)}`; for (const dx of [-1, -0.33, 0.33, 1]) d += `M${f1(b2[0] + dx * tw2)} ${f1(b2[1])}v${f1(-tl)}`;
            return [{ id: "fork", z, mat: "fork", stroke: [d, "#8b93a1", f2(hw * 2)] }, { id: "forkL", z: z + 0.00005, mat: "forkL", stroke: [d, "#d5dae2", f2(hw * 0.8)] },
              { id: "bite", z: z + 0.0001, mat: "bite", layers: [[ellPath({ c: [t[0], b2[1] - tl * 1.05], a: tw2 * 1.25, b: tl * 0.62, th: 0 }, 0, 0, 0), "#b9762c"], [ellPath({ c: [t[0] - tw2 * 0.15, b2[1] - tl * 1.15], a: tw2 * 1.0, b: tl * 0.42, th: 0 }, 0, 0, 0), "#e9b464"]] }]; }); }
        else if (m === "yuck" && o.eating) set("R", H(J.chest, [-0.75, 0.0, 1.5]), [0.1, 1, 0.15], [0, -0.1, 1], [-0.8, -1, 0], "spread");      // the open hand that pushes it away
        else if (m === "bored") set("R", at(J.head, J.Bh, [-0.2 * hh, -1.45 * hh, 0.6 * hh]), [0.25, 1, -0.1], [0.3, 0, -1], [-0.3, -1, 0.6], "fist");
      } }
    return { k, E };
  }
  const listAt = ph => { const { k, E } = pose(ph), W = wearer(E.skin ? Object.assign({}, c, { skin: c.skin.map(t => mixc(t, E.skin[0], E.skin[1])) }) : c, { legs: o.legs, tag: name === "feel" && /^(cold|scared)$/.test(o.mood) ? "" : o.tag,      /* (hugged arms, hands up: no name tag behind them) */ smile: E.smile, tagAt: name === "sing" ? [B.chest[0] * 0.36, 0.012] : name === "feel" && o.mood === "bored" ? [B.chest[0] * 0.45, 0.06] : name === "feel" && /^(hungry|soso|good)$/.test(o.mood) ? [0, 0.08] : undefined }, u);      // (singing: the tag on the far side of the chest, clear of the microphone's arm)
    W.eyeMode = E.eyes; W.mouthInner = px => { const lc = E.lip || lipC, mu = E.mart ? feelMouth(E.mart, lc, u + "f" + Math.round(ph * 1000), { dimC }) : mouthSVG(E.mouth, E.smile, u + "m" + Math.round(ph * 1000), lc, dimC, E.grin);
      return E.mskew ? `<g transform="translate(${E.mskew[0]} 0) rotate(${E.mskew[1]})">${mu}</g>` : mu; };
    if (E.brows) W.browMode = E.brows;
    if (E.featK) W.featK = E.featK;
    if (E.cheek){ W.defs += `<radialGradient id="${u}bm"><stop offset="0" stop-color="${E.cheek[0]}" stop-opacity="${E.cheek[1]}"/><stop offset="1" stop-color="${E.cheek[0]}" stop-opacity="0"/></radialGradient>`; W.cheekG = `url(#${u}bm)`; }
    if (E.marks && E.marks.length) W.faceMarks = E.marks;
    const list = frame(k, B, cam, W, floor, { hands: E.hands, noLegs: 1, extra: (J, P, S2) => [].concat(...E.extra.map(f => f(J, P, S2))) });
    return { list, defs: W.defs }; };
  /* round the picture: the z z z of sleep, the notes of a song (as the earlier drawings had them) */
  let front = "";
  if (name === "sleep"){ const z = (x, y, s, d) => `<g opacity="${o.still ? 1 : 0}">${o.still ? "" : `<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${d};${f2(d + 0.15)};0.85;1" dur="${D.dur}s" repeatCount="indefinite"/>`}${zed(x, y, s)}</g>`; front = z(114, 52, 9, 0) + z(124, 34, 12, 0.2) + z(136, 12, 15, 0.4); }
  if (name === "sing"){ const note = (nx, ny, sc, d) => `<g transform="translate(${nx} ${ny}) scale(${sc})">${o.still ? "" : `<animateTransform attributeName="transform" type="translate" values="${nx} ${ny};${nx + 4} ${ny - 12}" dur="${D.dur}s" begin="${d}s" repeatCount="indefinite" additive="replace"/>`}<ellipse rx="5" ry="3.7" fill="#6a55b8" transform="rotate(-20)"/><path d="M4.6 -1V-17q7 2 9 8" stroke="#6a55b8" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`;
    front = note(120, 52, 0.9, 0) + note(136, 30, 1.05, -0.5) + note(112, 22, 0.75, -1); }
  if (name === "feel") front = feelFront(o.mood, D.at[0], D.at[1], D.at[2], o.frame !== "face");
  const g = mk(""), ph0 = o.phase != null ? o.phase : D.still, html = L => L.map(n => nodeHTML(n, u)).join("");
  if (o.still || !D.dur){ const F = listAt(ph0); g.innerHTML = `<defs>${F.defs}</defs>` + html(F.list) + front; return o.box === false ? g : inCard(g); }
  /* the loop: drawn by script at sixty phases a second, with the clock of the page (as figure() is) */
  const dur = D.dur, NF = Math.round(dur * 30), kept = new Array(NF), F0 = listAt(0);
  g.innerHTML = `<defs>${F0.defs}</defs><g class="fig">${html(F0.list)}</g><g opacity="1"><animate attributeName="opacity" values="1;1" dur="${f2(dur)}s" repeatCount="indefinite"/></g>` + front;
  const mark = g.children[2].firstChild; let order = F0.list.map(n => n.id).join(" "), byId = null;
  play(g, mark, dur, (root, ph) => { const host = root.children[1], i = ((Math.round(ph * NF) % NF) + NF) % NF, K = kept[i] || (kept[i] = (() => { const L = listAt(i / NF).list; return { L, ord: L.map(n => n.id).join(" ") }; })()), list = K.L;
    if (root._fi === i) return; root._fi = i;
    if (!byId){ byId = {}; for (const el of host.children) if (el.hasAttribute("data-p")) byId[el.getAttribute("data-p")] = el; }
    if (K.ord !== order){ order = K.ord; const seen = {}; for (const n of list){ let el = byId[n.id]; if (!el){ el = mk(nodeHTML(n, u)).firstChild; byId[n.id] = el; } host.appendChild(el); seen[n.id] = 1; }
      for (const id in byId) if (!seen[id]){ byId[id].remove(); delete byId[id]; } }
    for (const n of list){ const el = byId[n.id]; if (!el) continue; nodeSet(el, n); if (n.tag === "g" && el._in !== n.inner){ if (el._in != null) el.firstChild.innerHTML = n.inner; el._in = n.inner; } } });      // (a face that changes: the mouth's and the eyes' drawing)
  return o.box === false ? g : inCard(g);
}
/* ---------- (figures 11) a part of the body, shown on the person: une tête, un bras ----------
   The person stands pale (everything of them), and the part alone is in colour in a soft yellow light: the picture names the part, not the
   person. FIG.part(c, "head" | "arm", o): the head on a head and shoulders; the arm held out from the shoulder, bent at the elbow (o.straight:
   held out straight), on a half figure, the hand left pale (the hand has its own picture). */
function partPic(c, part, o){ o = o || {}; c = lookWear(c, true); const head = part === "head", C = clipOf("stand"), heads = c.kid ? undefined : 5.6, B = bodyOf(c, { heads }), u = "pt" + (seq++) + "_";
  const c2 = head ? c : withWd(c, w => { addFix(w, keyArm("L", () => o.straight ? ({ wr: [0.42, -0.03, 0.06], hd: [1, -0.1, 0.1], pn: [0, -0.3, 1], pole: [0.2, -1, -0.4] }) : ({ wr: [0.3, 0.02, 0.1], hd: [0.5, 0.85, 0.1], pn: [-0.3, 0, 1], pole: [0.6, -1, -0.1] }))); w.curlL = 0.25; w.sleeve = 0.22; });
  const k = (head ? 78 : 56) / (2 * B.hh * B.H), x = head ? 80 : 56, y = (head ? 90 : 62) + (0.842 + 0.74 * B.hh) * B.H * k, yawD = head ? -8 : -4, O = { still: true, legs: o.legs, k, ox: x - 80, y, bare: true, smile: 0.5, yaw: yawD, heads, fit: false };
  const cam = camera(yawD * Math.PI / 180, 7 * Math.PI / 180, B.H * k, x, y), fl = floorOf(C, B), kk = c2.wd && c2.wd.keyFix ? c2.wd.keyFix(keyAt(C, 0), B) : keyAt(C, 0), J = skeleton(kk, B), P = p => cam.pt([p[0], p[1] - fl, p[2]]), S = B.H * k;
  let clip, gx, gy, gr;
  if (head){ const q = P(J.head), nb = P(J.nb), r = B.hh * S; clip = ellPath({ c: [q[0], q[1] - r * 0.08], a: r * 1.22, b: r * 1.3, th: 0 }, 0, 0, 0) + capsule(q[0], q[1] + r * 0.6, r * 0.5, nb[0], nb[1] + r * 0.12, r * 0.5); gx = q[0]; gy = q[1]; gr = r * 2.1; }
  else { const a = P(lerp3(J.shL, J.elL, 0.3)), b = P(J.elL), w = P(J.wrL), r = B.rSh * S * 1.5; clip = capsule(a[0], a[1], r, b[0], b[1], r * 0.9) + capsule(b[0], b[1], r * 0.9, w[0], w[1], r * 0.72); gx = (a[0] + b[0] + w[0]) / 3; gy = (a[1] + b[1] + w[1]) / 3; gr = Math.max(Math.hypot(a[0] - w[0], a[1] - w[1]), Math.hypot(a[0] - b[0], a[1] - b[1])) * 0.95 + r; }
  const g = mk(`<defs><radialGradient id="${u}g"><stop offset=".5" stop-color="#ffe27a" stop-opacity=".85"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient><clipPath id="${u}c"><path d="${clip}"/></clipPath></defs><circle cx="${f1(gx)}" cy="${f1(gy)}" r="${f1(gr)}" fill="url(#${u}g)"/><g opacity=".3"></g><g clip-path="url(#${u}c)"></g>`);
  g.children[2].appendChild(act("stand", c2, O)); g.children[3].appendChild(act("stand", c2, O)); return g; }
/* ---------- the handed thing (voilà / merci; donner): one person hands a thing to another ----------
   FIG.handOver(cA, cB, o): A (the giver, on the left, facing right) holds the thing in front of the waist, holds it out; B (on the right,
   facing left) raises a hand and takes it; A lets go and lowers the arm; B brings it in and holds it (the end state). Both stand turned to
   each other and a little to the viewer, as two people are photographed handing something over (refs/hands/handover). One world, one
   camera: the two figures are placed in it by their feet, the thing by its middle; each hand is put on the thing by the two bones of the arm
   (armTo), with fingers. The thing is the caller's picture (o.thing = {html, box: [x, y, w, h] in its own 160 x 190 box, size: its longest
   side in body heights}); it lies in the picture plane, the giver's thumb in front of it, the taker's fingers over its far edge.
   o.mirror (figures 15): the other way round, the giver on the right (the picture mirrored in the card; names and the thing read as ever);
   o.w: the box's width (340: the two from the thighs up, large; 160: both whole, standing); o.still, o.phase (default HO.still: both hands
   on it); o.tagA / o.tagB: name tags; o.legsA / o.legsB. The loop is HO.dur seconds: one hand-over, the end held, a fade, and again. */
HANDS.hold = { f: [[0.55, 0.75], [0.6, 0.8], [0.66, 0.84], [0.72, 0.86]], sp: 0, th: [0.35, 0.95, 0.15] };       // the thing's edge between the thumb (in front) and the fingers (behind)
HANDS.take = { f: [[0.16, 0.2], [0.18, 0.22], [0.22, 0.26], [0.28, 0.3]], sp: 0.12, th: [0.85, 0.3, 0.1] };        // reaching for it, the hand open
HANDS.over = { f: [[0.5, 0.55], [0.55, 0.6], [0.6, 0.65], [0.66, 0.7]], sp: 0, th: [0.45, 0.8, 0.2] };          // the taker's fingers over the far edge
/* (figures 16, the standing rule) the timeline is the reference's (CMU 22_13 / 23_13, tools/fig16/ho_ref.js): the reach 200-270 (0.58 s),
   both on it 270-320 (0.42 s), the giver lets go and her hand drops 320-380 (0.5 s), the taker settles 380-440: t = [reach starts, contact,
   the taker's grip closed, release, the giver's hand clear, the taker's hand in, the giver at rest (once: the end held), the fade] */
const HOREF = { f0: 160, step: 5, knots: [[200, 'reach'], [270, 'contact'], [320, 'release'], [380, 'giver at rest'], [440, 'settled']], t: [[-0.5,-0.06,0.33,0,0,0,0,0,0,-0.08,-0.96,0.11,0,0,0,0,0,0,0,-0.06,0.6,0,0,0,0,0,0,-0.12,-0.96,-0.05,0,0,0,0,0,0,0,0],[-0.49,-0.14,0.32,0,0,0,0,0,0,-0.08,-0.96,0.1,0,0,0,0,0,0,0,-0.14,0.59,0,0,0,0,0,0,-0.12,-0.96,-0.05,0,0,0,0,0,0,0,0],[-0.47,-0.22,0.3,0,0,0,0,0,0,-0.07,-0.96,0.1,0,0,0,0,0,0,0,-0.22,0.56,0,0,0,0,0,0,-0.12,-0.96,-0.05,0,0,0,0,0,0,0,0],[-0.45,-0.29,0.28,0,0,0,0,0,0,-0.07,-0.96,0.11,0,0,0,0,0,0,-0.01,-0.29,0.53,0,0,0,0,0,0,-0.12,-0.96,-0.04,0,0,0,0,0,0,0,0],[-0.43,-0.36,0.25,0,0,0,0,0,0,-0.06,-0.96,0.11,0,0,0,0,0,0,-0.02,-0.36,0.49,0,0,0,0,0,0,-0.13,-0.96,-0.04,0,0,0,0,0,0,0,0],[-0.41,-0.41,0.24,0,0,0,0,0,0,-0.05,-0.95,0.12,0,0,0,0,0,0,-0.02,-0.41,0.47,0,0,0,0,0,0,-0.13,-0.95,-0.03,0,0,0,0,0,0,0,0],[-0.38,-0.46,0.24,0,0,0,0,0,0,-0.04,-0.95,0.13,0,0,0,0,0,0,-0.01,-0.46,0.45,0,0,0,0,0,0,-0.13,-0.95,-0.01,0,0,0,0,0,0,0,0],[-0.36,-0.49,0.24,0,0,0,0,0,0,-0.03,-0.95,0.13,0,0,0,0,0,0,0,-0.49,0.43,0,0,0,0,0,0,-0.13,-0.95,0,0,0,0,0,0,0,0,0],[-0.34,-0.51,0.25,0,0,0,0,0,0,-0.02,-0.95,0.13,0,0,0,0,0,0,0.03,-0.51,0.43,0,0,0,0,0,0,-0.13,-0.95,0.01,0,0,0,0,0,0,0,0],[-0.33,-0.52,0.28,0,0,0,0,0,0,-0.01,-0.94,0.14,0,0,0,0,0,0,0.05,-0.52,0.43,0,0,0,0,0,0,-0.14,-0.94,0.03,0,0,0,0,0,0,0.001,-0.003],[-0.31,-0.53,0.32,0,0,0,0,0,0,0,-0.94,0.15,0,0,0,0,0,0,0.09,-0.53,0.44,0,0,0,0,0,0,-0.15,-0.94,0.04,0,0,0,0,0,0,0.001,-0.004],[-0.3,-0.53,0.36,0,0,0,0,0,0,0.02,-0.93,0.16,0,0,0,0,0,0,0.13,-0.53,0.45,0,0,0,0,0,0,-0.15,-0.93,0.05,0,0,0,0,0,0,0.002,-0.005],[-0.29,-0.53,0.41,0,0,0,0,0,0,0.03,-0.91,0.17,0,0,0,0,0,0,0.17,-0.53,0.47,0,0,0,0,0,0,-0.16,-0.91,0.07,0,0,0,0,0,0,0.002,-0.007],[-0.28,-0.52,0.46,0,0,0,0,0,0,0.05,-0.89,0.18,0,0,0,0,0,0,0.22,-0.52,0.5,0,0,0,0,0,0,-0.16,-0.89,0.1,0,0,0,0,0,0,0.003,-0.009],[-0.28,-0.5,0.53,0,0,0,0,0,0,0.08,-0.86,0.21,0,0,0,0,0,0,0.27,-0.5,0.53,0,0,0,0,0,0,-0.18,-0.86,0.13,0,0,0,0,0,0,0.004,-0.013],[-0.27,-0.48,0.59,0,0,0,0,0,0,0.1,-0.82,0.23,0,0,0,0,0,0,0.32,-0.48,0.57,0,0,0,0,0,0,-0.19,-0.82,0.15,0,0,0,0,0,0,0.003,-0.015],[-0.27,-0.45,0.66,0,0,0,0,0,0,0.12,-0.77,0.27,0,0,0,0,0,0,0.38,-0.45,0.61,0,0,0,0,0,0,-0.22,-0.77,0.19,0,0,0,0,0,0,0.003,-0.019],[-0.27,-0.41,0.72,0,0,0,0,0,0,0.15,-0.73,0.31,0,0,0,0,0,0,0.42,-0.41,0.64,0,0,0,0,0,0,-0.25,-0.73,0.23,0,0,0,0,0,0,0.002,-0.021],[-0.27,-0.37,0.78,0,0,0,0,0,0,0.17,-0.69,0.34,0,0,0,0,0,0,0.47,-0.37,0.67,0,0,0,0,0,0,-0.28,-0.69,0.26,0,0,0,0,0,0,0.002,-0.024],[-0.26,-0.33,0.82,0,0,0,0,0,0,0.18,-0.66,0.37,0,0,0,0,0,0,0.51,-0.33,0.7,0,0,0,0,0,0,-0.3,-0.66,0.28,0,0,0,0,0,0,0.002,-0.028],[-0.26,-0.29,0.86,0,0,0,0,0,0,0.2,-0.63,0.39,0,0,0,0,0,0,0.54,-0.29,0.72,0,0,0,0,0,0,-0.31,-0.63,0.3,0,0,0,0,0,0,0.001,-0.031],[-0.25,-0.27,0.88,0,0,0,0,0,0,0.2,-0.6,0.38,0,0,0,0,0,0,0.57,-0.27,0.72,0,0,0,0,0,0,-0.31,-0.6,0.3,0,0,0,0,0,0,0.001,-0.034],[-0.25,-0.26,0.9,0,0,0,0,0,0,0.2,-0.58,0.38,0,0,0,0,0,0,0.57,-0.26,0.73,0,0,0,0,0,0,-0.31,-0.58,0.3,0,0,0,0,0,0,0.002,-0.038],[-0.25,-0.24,0.9,0,0,0,0,0,0,0.2,-0.56,0.36,0,0,0,0,0,0,0.59,-0.24,0.73,0,0,0,0,0,0,-0.29,-0.56,0.28,0,0,0,0,0,0,0.001,-0.042],[-0.24,-0.23,0.91,0,0,0,0,0,0,0.18,-0.55,0.33,0,0,0,0,0,0,0.6,-0.23,0.73,0,0,0,0,0,0,-0.28,-0.55,0.26,0,0,0,0,0,0,0.001,-0.045],[-0.24,-0.22,0.91,0,0,0,0,0,0,0.17,-0.54,0.31,0,0,0,0,0,0,0.61,-0.22,0.73,0,0,0,0,0,0,-0.26,-0.54,0.24,0,0,0,0,0,0,0,-0.049],[-0.23,-0.22,0.92,0,0,0,0,0,0,0.16,-0.52,0.29,0,0,0,0,0,0,0.62,-0.22,0.72,0,0,0,0,0,0,-0.24,-0.52,0.22,0,0,0,0,0,0,-0.001,-0.051],[-0.23,-0.22,0.92,0,0,0,0,0,0,0.16,-0.51,0.28,0,0,0,0,0,0,0.63,-0.22,0.72,0,0,0,0,0,0,-0.23,-0.51,0.22,0,0,0,0,0,0,-0.001,-0.053],[-0.22,-0.22,0.92,0,0,0,0,0,0,0.16,-0.5,0.27,0,0,0,0,0,0,0.64,-0.22,0.71,0,0,0,0,0,0,-0.23,-0.5,0.22,0,0,0,0,0,0,-0.003,-0.056],[-0.22,-0.21,0.93,0,0,0,0,0,0,0.16,-0.49,0.27,0,0,0,0,0,0,0.64,-0.21,0.7,0,0,0,0,0,0,-0.22,-0.49,0.22,0,0,0,0,0,0,-0.004,-0.057],[-0.22,-0.21,0.93,0,0,0,0,0,0,0.16,-0.49,0.26,0,0,0,0,0,0,0.64,-0.21,0.71,0,0,0,0,0,0,-0.21,-0.49,0.22,0,0,0,0,0,0,-0.005,-0.058],[-0.21,-0.21,0.93,0,0,0,0,0,0,0.17,-0.49,0.25,0,0,0,0,0,0,0.64,-0.21,0.71,0,0,0,0,0,0,-0.2,-0.49,0.22,0,0,0,0,0,0,-0.007,-0.06],[-0.21,-0.22,0.93,0,0,0,0,0,0,0.18,-0.49,0.24,0,0,0,0,0,0,0.64,-0.22,0.7,0,0,0,0,0,0,-0.19,-0.49,0.23,0,0,0,0,0,0,-0.007,-0.061],[-0.2,-0.24,0.91,0,0,0,0,0,0,0.18,-0.49,0.22,0,0,0,0,0,0,0.64,-0.24,0.68,0,0,0,0,0,0,-0.18,-0.49,0.23,0,0,0,0,0,0,-0.008,-0.061],[-0.19,-0.28,0.89,0,0,0,0,0,0,0.21,-0.49,0.19,0,0,0,0,0,0,0.63,-0.28,0.65,0,0,0,0,0,0,-0.14,-0.49,0.25,0,0,0,0,0,0,-0.009,-0.063],[-0.18,-0.34,0.84,0,0,0,0,0,0,0.23,-0.5,0.17,0,0,0,0,0,0,0.6,-0.34,0.61,0,0,0,0,0,0,-0.11,-0.5,0.27,0,0,0,0,0,0,-0.008,-0.064],[-0.16,-0.41,0.78,0,0,0,0,0,0,0.26,-0.51,0.15,0,0,0,0,0,0,0.58,-0.41,0.55,0,0,0,0,0,0,-0.09,-0.51,0.29,0,0,0,0,0,0,-0.009,-0.065],[-0.14,-0.5,0.7,0,0,0,0,0,0,0.29,-0.53,0.13,0,0,0,0,0,0,0.51,-0.5,0.5,0,0,0,0,0,0,-0.06,-0.53,0.31,0,0,0,0,0,0,-0.008,-0.066],[-0.12,-0.61,0.61,0,0,0,0,0,0,0.31,-0.53,0.11,0,0,0,0,0,0,0.45,-0.61,0.43,0,0,0,0,0,0,-0.03,-0.53,0.33,0,0,0,0,0,0,-0.008,-0.066],[-0.09,-0.72,0.5,0,0,0,0,0,0,0.33,-0.54,0.09,0,0,0,0,0,0,0.37,-0.72,0.35,0,0,0,0,0,0,0,-0.54,0.34,0,0,0,0,0,0,-0.008,-0.067],[-0.06,-0.82,0.39,0,0,0,0,0,0,0.34,-0.54,0.07,0,0,0,0,0,0,0.3,-0.82,0.26,0,0,0,0,0,0,0.03,-0.54,0.34,0,0,0,0,0,0,-0.006,-0.067],[-0.02,-0.91,0.28,0,0,0,0,0,0,0.33,-0.54,0.04,0,0,0,0,0,0,0.22,-0.91,0.17,0,0,0,0,0,0,0.05,-0.54,0.33,0,0,0,0,0,0,-0.006,-0.068],[0.01,-0.96,0.16,0,0,0,0,0,0,0.33,-0.54,0.03,0,0,0,0,0,0,0.14,-0.96,0.08,0,0,0,0,0,0,0.06,-0.54,0.33,0,0,0,0,0,0,-0.006,-0.069],[0.04,-0.98,0.06,0,0,0,0,0,0,0.33,-0.54,0.01,0,0,0,0,0,0,0.07,-0.98,0,0,0,0,0,0,0,0.08,-0.54,0.32,0,0,0,0,0,0,-0.006,-0.069],[0.07,-0.99,-0.02,0,0,0,0,0,0,0.31,-0.55,-0.01,0,0,0,0,0,0,0.02,-0.99,-0.07,0,0,0,0,0,0,0.09,-0.55,0.3,0,0,0,0,0,0,-0.007,-0.068],[0.1,-0.98,-0.07,0,0,0,0,0,0,0.31,-0.56,-0.03,0,0,0,0,0,0,0,-0.98,-0.12,0,0,0,0,0,0,0.1,-0.56,0.29,0,0,0,0,0,0,-0.008,-0.069],[0.12,-0.98,-0.09,0,0,0,0,0,0,0.29,-0.56,-0.03,0,0,0,0,0,0,0,-0.98,-0.15,0,0,0,0,0,0,0.1,-0.56,0.28,0,0,0,0,0,0,-0.009,-0.069],[0.13,-0.97,-0.08,0,0,0,0,0,0,0.28,-0.57,-0.04,0,0,0,0,0,0,0.02,-0.97,-0.15,0,0,0,0,0,0,0.1,-0.57,0.27,0,0,0,0,0,0,-0.01,-0.068],[0.14,-0.97,-0.05,0,0,0,0,0,0,0.28,-0.58,-0.05,0,0,0,0,0,0,0.05,-0.97,-0.14,0,0,0,0,0,0,0.1,-0.58,0.26,0,0,0,0,0,0,-0.012,-0.068],[0.13,-0.98,-0.01,0,0,0,0,0,0,0.27,-0.58,-0.05,0,0,0,0,0,0,0.08,-0.98,-0.1,0,0,0,0,0,0,0.09,-0.58,0.26,0,0,0,0,0,0,-0.014,-0.068],[0.12,-0.98,0.04,0,0,0,0,0,0,0.28,-0.58,-0.07,0,0,0,0,0,0,0.11,-0.98,-0.06,0,0,0,0,0,0,0.11,-0.58,0.26,0,0,0,0,0,0,-0.016,-0.068],[0.1,-0.97,0.1,0,0,0,0,0,0,0.28,-0.58,-0.08,0,0,0,0,0,0,0.14,-0.97,0,0,0,0,0,0,0,0.12,-0.58,0.27,0,0,0,0,0,0,-0.017,-0.067],[0.06,-0.97,0.16,0,0,0,0,0,0,0.28,-0.57,-0.07,0,0,0,0,0,0,0.16,-0.97,0.06,0,0,0,0,0,0,0.11,-0.57,0.27,0,0,0,0,0,0,-0.018,-0.067],[0.02,-0.95,0.21,0,0,0,0,0,0,0.28,-0.57,-0.07,0,0,0,0,0,0,0.17,-0.95,0.13,0,0,0,0,0,0,0.1,-0.57,0.28,0,0,0,0,0,0,-0.019,-0.067],[-0.02,-0.93,0.26,0,0,0,0,0,0,0.29,-0.57,-0.07,0,0,0,0,0,0,0.18,-0.93,0.19,0,0,0,0,0,0,0.1,-0.57,0.28,0,0,0,0,0,0,-0.02,-0.067],[-0.06,-0.91,0.3,0,0,0,0,0,0,0.28,-0.56,-0.06,0,0,0,0,0,0,0.19,-0.91,0.24,0,0,0,0,0,0,0.09,-0.56,0.28,0,0,0,0,0,0,-0.021,-0.067],[-0.09,-0.89,0.33,0,0,0,0,0,0,0.28,-0.56,-0.06,0,0,0,0,0,0,0.19,-0.89,0.28,0,0,0,0,0,0,0.09,-0.56,0.27,0,0,0,0,0,0,-0.021,-0.067]] };
const HO = { dur: 2.6, still: 0.42, yaw: 48, pitch: 7, t: [0.08, 0.304, 0.344, 0.464, 0.51, 0.56, 0.656, 0.95] };
function handOver(cA, cB, o){
  cA = lookWear(cA, true); cB = lookWear(cB, true);
  o = o || {}; const W0 = o.w || 340, wide = W0 > 200, u = "ho" + (seq++) + "_", T = HO.t;
  const MIR = o.mirror ? `<g transform="translate(${W0} 0) scale(-1 1)">` : "", MIRz = o.mirror ? "</g>" : "";      // (figures 15; Lesson 14) o.mirror: the same hand-over the other way round (the giver on the right): the picture mirrored inside the card, the names and the thing turned back so that they read
  const C = clipOf("stand"), BA = bodyOf(cA, {}), BB = bodyOf(cB, {}), WA = wearer(cA, { legs: o.legsA, tag: o.tagA || "", smile: 0.7, tagAt: [BA.chest[0] * 0.1, 0.05], tagFlip: !!o.mirror }, u + "a"), WB = wearer(cB, { legs: o.legsB, tag: o.tagB || "", smile: 0.7, tagFlip: !!o.mirror }, u + "b");
  WA.curl = WB.curl = 0.3;
  const k = wide ? 2.0 : 0.96, man = 146 * k, gy = wide ? 8 + man : 174, cx = W0 / 2; let gap = (wide ? 0.52 : 0.5) * man;
  const pitch = HO.pitch * Math.PI / 180, cp = Math.cos(pitch), sp = Math.sin(pitch);
  const fig = (c, B, W, side) => { const yawD = side * HO.yaw, yaw = yawD * Math.PI / 180, x = cx - side * gap / 2, s = B.H * k;
    return { c, B, W, side, x, s, cam: camera(yaw, pitch, s, x, gy), cy: Math.cos(yaw), sy: Math.sin(yaw), floor: floorOf(C, B), base: Float32Array.from(C.keys[0]) }; };
  let A = fig(cA, BA, WA, 1), Bf = fig(cB, BB, WB, -1);
  /* world (px, before the camera's pitch): x right from the box's middle, y up from the ground, z toward the viewer */
  const toFrame = (F, w) => { const wx = w[0] - (F.x - cx); return [(wx * F.cy - w[2] * F.sy) / F.s, w[1] / F.s + F.floor, (wx * F.sy + w[2] * F.cy) / F.s]; };
  const dirFrame = (F, v) => nrm([v[0] * F.cy - v[2] * F.sy, v[1], v[0] * F.sy + v[2] * F.cy]);
  const toWorld = (F, p) => [(p[0] * F.cy + p[2] * F.sy) * F.s + (F.x - cx), (p[1] - F.floor) * F.s, (-p[0] * F.sy + p[2] * F.cy) * F.s];
  const scr = w => [cx + w[0], gy - (w[1] * cp - w[2] * sp)], depth = (F, w) => (w[2] * cp + w[1] * sp) / F.s;
  /* the thing: its size on the picture and where its middle goes */
  const TH = o.thing ? (o.mirror ? Object.assign({}, o.thing, { html: `<g transform="translate(${f2(2 * (o.thing.box[0] + o.thing.box[2] / 2))} 0) scale(-1 1)">${o.thing.html}</g>` }) : o.thing) : null, tb = TH ? TH.box : [0, 0, 1, 1], tsz = (TH ? TH.size : 0.17) * man, tk = tsz / Math.max(tb[2], tb[3]), tw = tb[2] * tk, tht = tb[3] * tk;
  /* (figures 16; Jon: "Hands are wrong") where the hands go on the thing: a thing with a pole (a flag: TH.pole, the pole's x in its drawing)
     is held by the pole (the giver on it, the taker just below her fist, as the reference's taker takes the can below the giver's hand); anything else by its side edges (the giver the near edge, the taker the
     other), and at the end the taker's other hand under it, palm up, carrying it. Mirrored, the drawing is turned in the world: so is its pole */
  const PO = TH && TH.pole != null ? (() => { const u = (TH.pole - tb[0]) / tb[2]; return (o.mirror ? 1 - u : u) - 0.5; })() : null;
  const gripA = Tm => PO != null ? add(Tm, [PO * tw + 0.008 * man, -0.34 * tht, 0]) : add(Tm, [-tw / 2 + Math.min(tw * 0.18, 0.02 * man), -tht * 0.3, 0]);      // (figures 16: held low on its edge, near the lower corner: the taker's palm under it then comes where the reference's taker's hand comes)
  const gripB = Tm => PO != null ? add(Tm, [PO * tw + 0.004 * man, -0.46 * tht, 0]) : add(Tm, [tw / 2 - Math.min(tw * 0.04, 0.006 * man), tht * 0.04, 0]);
  const mj = t => { t = Math.max(0, Math.min(1, t)); return t * t * t * (10 - 15 * t + 6 * t * t); };          // (for the blends onto the thing only)
  const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const restOf = (F, s) => { const J = skeleton(F.base, F.B); return { wr: J["wr" + s], hd: J["hd" + s], pn: J["pn" + s] }; };
  const onEdge = (F, g, hdW, pnW, s) => { const hd = dirFrame(F, hdW), pn = dirFrame(F, pnW), p = toFrame(F, g);
    return { wr: sub(sub(p, mul(hd, F.B.hand * 0.52)), mul(nrm(sub(pn, mul(hd, dot(pn, hd)))), -0.012)), hd, pn }; };
  const gripOf = (F, h) => toWorld(F, add(add(h.wr, mul(h.hd, F.B.hand * 0.52)), mul(nrm(sub(h.pn, mul(h.hd, dot(h.pn, h.hd)))), -0.012)));      // the grip point of a hand (the inverse of onEdge), in the world
  const mixH = (a, b, t) => ({ wr: lerp3(a.wr, b.wr, t), hd: nrm(lerp3(a.hd, b.hd, t)), pn: nrm(lerp3(a.pn, b.pn, t)) });
  const headTurn = (k2, pch) => { const X = [k2[27], k2[28], k2[29]], Y = [k2[30], k2[31], k2[32]], ax = nrm(X), cs = Math.cos(pch), sn = Math.sin(pch), d = dot(ax, Y), cr = cross(ax, Y);
    const Y2 = nrm([Y[0] * cs + cr[0] * sn + ax[0] * d * (1 - cs), Y[1] * cs + cr[1] * sn + ax[1] * d * (1 - cs), Y[2] * cs + cr[2] * sn + ax[2] * d * (1 - cs)]); k2[30] = Y2[0]; k2[31] = Y2[1]; k2[32] = Y2[2]; };
  const hp = (name, sc) => handFlat(HANDS[name]).concat([sc || 1]), blendH = (a, b, t, sa, sb) => { const x = hp(a, sa), y = hp(b, sb); return x.map((v, i) => v + (y[i] - v) * t); };
  /* the grips (world ways): GA the giver's on a side edge (the fingers behind it, the thumb over the front); FA / FB fists round a pole, the
     thumb on top (the giver's left and the taker's right, each behind the pole, the fingers wrapped over its front); TP the taker's palm under a
     thing (palm up, the fingers toward the giver and into the picture): received on the open hand and carried so, as the reference's taker
     holds the can before the body with the elbow bent about 105 degrees */
  const HK = 1.3, GA = { hd: [0.85, -0.25, -0.45], pn: [0.3, 0.15, 0.94] }, FA = { hd: [1, 0, -0.25], pn: [0.25, 0, 1] }, FB = { hd: [-1, 0, -0.25], pn: [-0.25, 0, 1] }, TP = { hd: [-0.7, 0.06, -0.7], pn: [0, 1, 0.05] };
  const underR = Tm => add(Tm, [0.1 * tw, -0.5 * tht - 0.012 * man, 0.004 * man]);      // the taker's palm under the thing's bottom edge, a little to his side of its middle
  const offA = gripA([0, 0, 0]), offB = PO != null ? gripB([0, 0, 0]) : underR([0, 0, 0]);      // from the thing's middle to each grip
  /* THE REFERENCE (HOREF): at phase ph, the captured frame (the knots above: a captured time mapped piece by piece, the capture's own speeds
     inside each piece), and from it each working hand in its person's PARTNER frame (z the way to the other, y up, x the left), relative to
     the shoulder and in arm lengths; turned into our picture's world for each figure (their arms' own length) */
  const KN = [[0, 175], [T[0], 200], [T[1], 270], [T[3], 320], [T[6], 380], [T[7], 440], [1, 440]];
  const refF = ph => { for (let i = 1; i < KN.length; i++) if (ph <= KN[i][0]){ const [p0, f0] = KN[i - 1], [p1, f1] = KN[i]; return f0 + (f1 - f0) * (p1 > p0 ? (ph - p0) / (p1 - p0) : 0); } return 440; };
  const refAt = ph => { const R = HOREF.t, n = R.length, x = Math.max(0, Math.min(n - 1, (refF(ph) - HOREF.f0) / HOREF.step)), i = Math.min(n - 2, Math.floor(x)), u = x - i, a = R[Math.max(0, i - 1)], b = R[i], c = R[i + 1], d = R[Math.min(n - 1, i + 2)], u2 = u * u, u3 = u2 * u;
    return b.map((v, j) => 0.5 * (2 * v + (c[j] - a[j]) * u + (2 * a[j] - 5 * v + 4 * c[j] - d[j]) * u2 + (3 * v - a[j] - 3 * c[j] + d[j]) * u3)); };      // (Catmull-Rom through the samples)
  const PW = (F, v) => [v[2] * F.side, v[1], -v[0] * F.side];      // the partner frame -> the world (the figure faces the other along x: its left is -z for the giver, +z for the taker)
  /* each working hand from both frames: the PARTNER frame (z toward the other) while they reach to each other and pass it, the BODY frame
     (z the way the figure faces: the hand held before oneself) before the reach and after the release; blended by the captured frame */
  const wP = ph => { const f = refF(ph), sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }; return sm((f - 200) / 25) * (1 - sm((f - 325) / 35)); };
  const handRef = (F, s2, rP, rB, w) => { const J = skeleton(F.base, F.B), Lb = Math.hypot(...sub(J["el" + s2], J["sh" + s2])) + Math.hypot(...sub(J["wr" + s2], J["el" + s2])), sh = toWorld(F, J["sh" + s2]);
    const wrP = toFrame(F, add(sh, mul(PW(F, rP.slice(0, 3)), Lb * F.s))), wrB = add(J["sh" + s2], mul(rB.slice(0, 3), Lb));
    const hdP = dirFrame(F, nrm(PW(F, rP.slice(3, 6)))), thP = dirFrame(F, nrm(PW(F, rP.slice(6, 9)))), hd = nrm(lerp3(rB.slice(3, 6), hdP, w)), th = nrm(lerp3(rB.slice(6, 9), thP, w));
    return { wr: lerp3(wrB, wrP, w), hd, pn: nrm(cross(th, hd)) }; };
  const refA = (ph, F) => { const r = refAt(ph); return handRef(F || A, "L", r.slice(0, 9), r.slice(18, 27), wP(ph)); }, refB = (ph, F) => { const r = refAt(ph); return handRef(F || Bf, "R", r.slice(9, 18), r.slice(27, 36), wP(ph)); };
  /* THE BODIES MOVE (physics from the reference): each figure stands where the reference's person stands along the line between them, by
     the phase: the taker steps in by 0.07 body heights while he takes it (so his elbow can bend as the reference's, the hands staying on it) */
  const shiftF = (F, dx) => dx ? Object.assign({}, F, { x: F.x + dx, cam: camera(F.side * HO.yaw * Math.PI / 180, pitch, F.s, F.x + dx, gy) }) : F;
  const figsAt = ph => { const r = refAt(ph); return [shiftF(A, r[36] * man), shiftF(Bf, r[37] * man)]; };      // the giver's LEFT hand (nearer the other, as the reference's A), the taker's right
  /* the giver holds the thing with the reference's wrist and the grip's way of the hand: the thing where that hand holds it */
  const giverHolding = (ph, Fa) => { Fa = Fa || figsAt(ph)[0]; const r = refA(ph, Fa), GAx = PO != null ? FA : GA, h = { wr: r.wr, hd: dirFrame(Fa, GAx.hd), pn: dirFrame(Fa, GAx.pn) }; return { h, Tm: sub(gripOf(Fa, h), offA) }; };
  const takerOn = (Tm, Fb) => onEdge(Fb, add(Tm, offB), (PO != null ? FB : TP).hd, (PO != null ? FB : TP).pn, "R");
  /* THE GAP (IK only: if the reach cannot be made, the bodies move, never the hand): the two stand so that, at the contact, the taker's
     reference wrist is where his grip on the thing needs it (along the line between them; solved twice) */
  for (let it = 0; it < 3; it++){ const [F1a, F1b] = figsAt(T[1]), need = toWorld(F1b, takerOn(giverHolding(T[1], F1a).Tm, F1b).wr), ref = toWorld(F1b, refB(T[1], F1b).wr), d = (need[0] - ref[0]); if (Math.abs(d) < 0.5) break; gap = Math.max(0.3 * man, gap + d); A = fig(cA, BA, WA, 1); Bf = fig(cB, BB, WB, -1); }      // (the thing beyond his hand: they stand too close; apart by that much, each half)
  const dB = (() => { const [F3a, F3b] = figsAt(T[3]), on = takerOn(giverHolding(T[3], F3a).Tm, F3b), r = refB(T[3], F3b); return sub(on.wr, r.wr); })();      // at the release: where his hand is on the thing, against the reference's (faded out as he brings it in)
  /* IK WITH LIMITS: the arm set by armTo; if its elbow comes inside the trunk (nearer the spine than 0.09 body heights), the elbow's pole is
     turned further out to its own side and back, a step at a time, until it is clear (the hand stays where it is) */
  const armSafe = (k2, B, side, h, pole) => { const sg = side === "L" ? 1 : -1; let pl = pole.slice();
    for (let it = 0; it < 8; it++){ armTo(k2, B, side, h.wr, h.hd, h.pn, pl); const J = skeleton(k2, B), a = J.root, b = J.chest, e = J["el" + side], ab = sub(b, a), t = Math.max(0, Math.min(1, dot(sub(e, a), ab) / dot(ab, ab))), dd = Math.hypot(...sub(e, add(a, mul(ab, t))));
      if (dd >= 0.09) return; pl = [pl[0] + sg * 0.45, pl[1], pl[2] - 0.3]; } };
  const leanTo = (k2, a) => { if (!a) return; for (const i of [9, 12, 15]){ const v = [k2[i], k2[i + 1], k2[i + 2]], c = Math.cos(a), sn = Math.sin(a); k2[i + 1] = v[1] * c - v[2] * sn; k2[i + 2] = v[1] * sn + v[2] * c; } };
  function pose(ph){
    const ka = Float32Array.from(A.base), kb = Float32Array.from(Bf.base), Ha = { R: hp("relaxed", 1), L: hp(PO != null ? "fist" : "hold", HK) }, Hb = { L: hp("relaxed", 1), R: hp("relaxed", 1) };
    const [Fa, Fb] = figsAt(ph);      // (no lean added: the reference's wrists are measured from its own shoulders, its bodies' motion is the step)
    /* THE GIVER: holding until the release (the reference's wrist, the grip's hand); after it, the reference's own hand, opening, dropping to rest */
    const G = giverHolding(Math.min(ph, T[3]), ph <= T[3] ? Fa : figsAt(T[3])[0]); let hA = ph <= T[3] ? G.h : mixH(G.h, refA(ph, Fa), mj((ph - T[3]) / (T[4] - T[3])));
    if (ph > T[3]){ const r = refA(ph, Fa), rs = restOf(Fa, "L"), t3 = mj((ph - T[3]) / (T[6] - T[3])); hA = { wr: r.wr, hd: nrm(lerp3(G.h.hd, rs.hd, t3)), pn: nrm(lerp3(G.h.pn, rs.pn, t3)) }; Ha.L = blendH(PO != null ? "fist" : "hold", "relaxed", Math.min(1, (ph - T[3]) / (T[4] - T[3])), HK, 1); }      // (the wrist the reference's; the hand turns from the grip to hanging at rest, the fingers down: never end on to us, a stump)
    armSafe(ka, A.B, "L", hA, [0.7, -1, -0.2]);      // (the elbow out to its own side and down: never into the body)
    /* THE TAKER: the reference's hand rising; over the last third of the reach it is drawn onto the thing (his grip on it at the contact),
       holds with the giver until the release; after it he carries it: the reference's hand (bringing it in, the elbow bent) with the thing on it */
    let hB, Tm; const rB = refB(ph, Fb), b0 = T[1] - 0.35 * (T[1] - T[0]);
    if (ph < T[3]){ Tm = giverHolding(ph, Fa).Tm; const on = takerOn(Tm, Fb), rs = restOf(Fb, "R"), t0 = mj((ph - T[0]) / (b0 - T[0])), rB2 = { wr: rB.wr, hd: nrm(lerp3(rs.hd, on.hd, t0)), pn: nrm(lerp3(rs.pn, on.pn, t0)) };      // (the wrist the reference's; the hand turns from hanging to the grip's way as it rises)
      hB = ph <= b0 ? rB2 : ph < T[1] ? mixH(rB2, on, mj((ph - b0) / (T[1] - b0))) : on;
      Hb.R = ph < T[1] ? blendH("relaxed", "take", Math.min(1, Math.max(0, (ph - T[0]) / (b0 - T[0]))), 1, HK) : blendH("take", PO != null ? "fist" : "palmup", Math.min(1, (ph - T[1]) / (T[2] - T[1])), HK, HK); }
    else { const fade = 1 - mj((ph - T[3]) / (T[5] - T[3])), on = takerOn([0, 0, 0], Fb); hB = { wr: add(rB.wr, mul(dB, fade)), hd: on.hd, pn: on.pn }; Tm = sub(gripOf(Fb, hB), offB); Hb.R = hp(PO != null ? "fist" : "palmup", HK); }
    armSafe(kb, Bf.B, "R", hB, [-0.7, -1, -0.2]);
    const look = Math.sin(Math.max(0, Math.min(1, (ph - T[0]) / (T[5] - T[0]))) * Math.PI) * 0.16; headTurn(ka, look); headTurn(kb, look);
    return { ka, kb, Ha, Hb, Tm, Fa, Fb, holder: ph < T[3] ? "A" : "B", gripA: ph < T[3] + 0.02, gripB: ph >= (PO != null ? b0 : T[1] - 0.02), gripBL: false };      // (on a pole his palm goes behind it as his hand is drawn onto it: his open hand never covers her fist)
  }
  const thingPart = (F, Tm) => { const q = scr(Tm); return { id: "thing", z: depth(F, Tm), tag: "g", m: [tk, 0, 0, tk, q[0] - (tb[0] + tb[2] / 2) * tk, q[1] - (tb[1] + tb[3] / 2) * tk].map(v => Math.round(v * 1000) / 1000), inner: TH ? TH.html : "" }; };
  const pre = (L, p) => L.map(n => Object.assign({}, n, { id: p + n.id }));
  const listAt = ph => { const S0 = pose(ph);
    const la = frame(S0.ka, A.B, S0.Fa.cam, A.W, A.floor, { hands: S0.Ha, extra: () => S0.holder === "A" && TH ? [thingPart(S0.Fa, S0.Tm)] : [] });      // (each figure where it stands this frame)
    let lb = frame(S0.kb, Bf.B, S0.Fb.cam, Bf.W, Bf.floor, { hands: S0.Hb, extra: () => S0.holder === "B" && TH ? [thingPart(S0.Fb, S0.Tm)] : [] });
    /* (figures 10, 16) every hand on the thing grips it round its edge (or its pole): the hand, palm and fingers, drawn just behind the
       thing, the thumb over its front; the part of the hand beyond the edge shows. Whichever list carries the thing */
    let L = pre(la, "a").concat(pre(lb, "b"));
    if (TH){ const on = (S0.gripA ? ["ahnL"] : []).concat(S0.gripB ? ["bhnR"] : [], S0.gripBL ? ["bhnL"] : []), sub = PO != null ? /^(p|h)\d*$/ : /^(f[0-3]|p|h)\d*$/, isHand = n => on.some(h => n.id === h || (n.id.startsWith(h) && sub.test(n.id.slice(h.length))));      // (on a pole: the giver's fist all in front of it; the taker's palm behind it, the fingers over its front) (the parts' ids carry their layer: hnRp0, hnRf00 ...)
      const hands = L.filter(isHand); if (hands.length){ L = L.filter(n => !isHand(n)); const ti = L.findIndex(n => n.id === "athing" || n.id === "bthing"); if (ti >= 0) L.splice(ti, 0, ...hands); else L = L.concat(hands); } }
    return L.map(n => n.id === "athing" || n.id === "bthing" ? Object.assign(n, { id: "thing" }) : n); };
  /* the still frame says which way it goes: a green arc over the thing, from the giver to the taker */
  const arrow = ph => { const q = scr(pose(ph).Tm), y = q[1] - tht / 2 - (wide ? 22 : 12), w = wide ? 32 : 18, sw = wide ? 5.4 : 4, h = wide ? 12 : 7;
    return `<path d="M${f1(q[0] - w)} ${f1(y + h * 0.4)}Q${f1(q[0])} ${f1(y - h)} ${f1(q[0] + w - sw)} ${f1(y + h * 0.1)}" stroke="#3fae5a" stroke-width="${sw}" fill="none" stroke-linecap="round"/><path d="M${f1(q[0] + w - 3.4 * sw)} ${f1(y - 1.2 * sw)}L${f1(q[0] + w)} ${f1(y + h * 0.25)}L${f1(q[0] + w - 3 * sw)} ${f1(y + h * 0.25 + 1.6 * sw)}" stroke="#3fae5a" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; };
  const g = mk(""), html = L => L.map(n => nodeHTML(n, u)).join(""), clip = `<clipPath id="${u}box"><rect width="${W0}" height="190" rx="16"/></clipPath>`, defs = `<defs>${WA.defs}${WB.defs}${clip}</defs>`;
  const ground = wide ? "" : `<ellipse cx="${cx}" cy="${gy + 2}" rx="${f1(gap * 0.95)}" ry="5" fill="#1d2233" opacity=".06"/>`;
  if (o.still || o.phase != null){ const ph = o.phase != null ? o.phase : HO.still; g.innerHTML = defs + `<g clip-path="url(#${u}box)">${MIR}${ground}${html(listAt(ph))}${MIRz}</g>` + (o.still && o.arrow !== false ? MIR + arrow(ph) + MIRz : ""); return g; }
  const dur = HO.dur, NF = Math.round(dur * 30), kept = new Array(NF), F0 = listAt(0);
  /* (.72; the reader of Lesson 13, C2 a: "Pierre's 'Merci.' is said over an empty box and then over Marie holding the phone again") o.once:
     one hand-over, then its end state (the taker holding the thing, the giver's hand at rest: HO.t[6]) held for as long as the picture is
     on the screen; no fade, no second hand-over. The page (actBox) asks for it; without o.once the loop is as before. */
  const once = !!o.once, endI = Math.round(T[6] * NF);
  const fade = once ? `<animate attributeName="opacity" values="0;1" dur="${f2(dur * 0.03)}s" fill="freeze"/>`
    : `<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.03;${T[6]};${T[7]};1" dur="${f2(dur)}s" repeatCount="indefinite"/>`;
  g.innerHTML = defs + `<g clip-path="url(#${u}box)">${MIR}${ground}<g class="fig">${fade}${html(F0)}</g>${MIRz}</g><g opacity="1"><animate attributeName="opacity" values="1;1" dur="${f2(dur)}s" repeatCount="indefinite"/></g>`;
  const mark = g.lastChild.firstChild; let order = F0.map(n => n.id).join(" "), byId = null;
  play(g, mark, dur, (root, ph) => { const host = root.querySelector(".fig"), i = once ? Math.max(0, Math.min(Math.round(ph * NF), endI)) : ((Math.round(ph * NF) % NF) + NF) % NF, K = kept[i] || (kept[i] = (() => { const L = listAt(i / NF); return { L, ord: L.map(n => n.id).join(" ") }; })()), list = K.L;
    if (root._fi === i) return; root._fi = i;
    if (!byId){ byId = {}; for (const el of host.children) if (el.hasAttribute("data-p")) byId[el.getAttribute("data-p")] = el; }
    if (K.ord !== order){ order = K.ord; const seen = {}; for (const n of list){ let el = byId[n.id]; if (!el){ el = mk(nodeHTML(n, u)).firstChild; byId[n.id] = el; } host.appendChild(el); seen[n.id] = 1; }
      for (const id in byId) if (!seen[id]){ byId[id].remove(); delete byId[id]; } }
    for (const n of list){ const el = byId[n.id]; if (el) nodeSet(el, n); } });
  return g;
}
/* ---------- the teacher: a half figure, seated, facing the learner, in the 400 x 700 space of the stage ----------
   The same body and the same camera as every other figure, at a large size (five and a half heads, so that the head is the size it has
   always had on the stage: its middle at 200, 348; the shoulders at 146, 448 and 254, 448; the mouth at 200, 385). Seated as a person sits
   (CMU 75_18); the stage crops her at its bottom edge.
   FIG.tutor(c, o) -> { node, rig }. node: <g id="tutor"> holding <g id="tutorBody"> (trunk, legs, neck, head) and, after it, <g id="arms">
   (both arms and hands, and the shadows they throw on her), and the 2D hand shapes hs_point ... the page itself uses.
   The page keeps everything that is teaching (what is said when, which arm does what on which cue and how fast, when she looks, when she
   nods); the rig only draws what it is given:
     rig.mouth.draw(v, smile)   one mouth shape: v = [open, width, protrusion, closed, teeth, fv, tongue] (the page's own), smile 0 .. 1.3
     rig.arms.draw(pose)        both arms: pose = {L, R} of {x, y, shape, rot, scale, fs} (the page's own, L = the viewer's left): the wrist is
                                put at x, y; the hand takes the shape (relaxed, point, flat, palmup, cup) and the turn
     rig.arms.tip(side)         where the tip of that hand's index finger is now
     rig.gaze(where)            "learner": the eyes look down at the model learner; anything else: at the real learner
     rig.nod()                  two small nods, 170 ms down and 170 ms up each (a promise, as the page's own)
     rig.blink()                one blink; she also blinks by herself when nothing is being said or shown (o.autoBlink false: never)
     rig.still(on)              on: no blink and no breath until it is turned off (for the page to hold her still through a cue) */
const TUT0 = { rim: 0.12, castMax: 1.35, sw: 44, chest: 0.9, waist: 0.72, hip: 1.0, rSh: 0.9, sy: 0.08, nb: 0.15, shY: 440, mouthY: 385, arm: 0.78, pwk: 0.21, elOut: 0.3, nkY: 1.6, nkV: 1.0, castK: 0.5, legK: 0.86, nkDy: 0, tagX: 0.014, bust: 0, bustX: 0.043, bustY: 0.05, chairUp: 0.16, fwd: 0.4, palmHd: [0.55, -0.2, 0.8], palmPn: [-0.15, 0.85, 0.45], palmOut: 16, palmK: 1.2, smW: 2, smH: 2.2, smLift: 1.8, smLid: 0.03, lid: 0.018, tagY: 0.079, selfDy: 24, chestDx: -10, chestDy: -14, chestRot: -112, rNeck: 0.9, chairCol: ["#b0a291", "#857767"],
  legs: [[-0.13, -0.13, 0.98, 0.02, -0.98, -0.18, 0.06, -0.3, 0.95], [-0.13, -0.13, 0.98, -0.01, -0.99, 0.04, 0.04, -0.3, 0.95]] };      // (T4: the thighs turned in a little more, -0.07 -> -0.13: the knees touch, one lap, not two separate rounds)
function tutor(c, o){
  o = o || {}; const TUT = Object.assign({}, TUT0, o.tut); if (o.down){ TUT.shY += o.down; TUT.mouthY += o.down; }      // (PICS.tutor({down: 4}): the top of her hair at 293.6 instead of 289.6, clear of a board of four lines; her body, head and chair move, her hands go to the places the page gives as before, so rig.arms.tip() needs no correction)
  const u = "tu" + (seq++) + "_", SEAT = clipOf("seat"), SWAY = clipOf("sway"); let B = Object.assign({}, build(c.fem === false ? "man" : "teacher", 6, 1), { key: "tutor", sy: 0.06, nb: 0.112 });        // her shoulders slope from the neck, as shoulders do
  for (const r of ["rUa", "rEl", "rFa"]) B[r] *= TUT.arm;
  const PX = 50.5, S = PX / B.hh; B.sw = TUT.sw / S; B.hand = 57.8 / S;
  B.chest = [B.chest[0] * TUT.chest, B.chest[1], B.chest[2] * 1.04]; B.waist = [B.waist[0] * TUT.waist, B.waist[1], B.waist[2] * 1.04]; B.hem = [B.hem[0] * (TUT.hip == null ? TUT.waist : TUT.hip), B.hem[1], B.hem[2]]; B.pwk = TUT.pwk; B.lap = TUT.lap; B.lapK = TUT.lapK; B.nkY = TUT.nkY; B.nkV = TUT.nkV; B.nkDy = TUT.nkDy; B.castK = TUT.castK; for (const r of ["rHip", "rTh", "rKnee", "rCalf", "rCuff"]) B[r] *= TUT.legK; B.rKnee *= TUT.kneeK == null ? 1 : TUT.kneeK; B.rTh *= TUT.thK == null ? 1 : TUT.thK; B.hipK = TUT.hipK; B.rSh *= TUT.rSh; B.sy = TUT.sy; B.nb = TUT.nb; B.rNeck *= TUT.rNeck;      // the hand 58 long, as the page's poses expect (the pointing fingertip 55 from the wrist); the shoulders, chest and waist fuller than the woman of the cards (a grown woman's frame on the stage, as the present drawing's)
  const pitch = 7 * Math.PI / 180, cp = Math.cos(pitch), sp = Math.sin(pitch), now = () => performance.now();
  const setv = (k, i, v) => { const n = nrm(v); k[i] = n[0]; k[i + 1] = n[1]; k[i + 2] = n[2]; }, getv = (k, i) => [k[i], k[i + 1], k[i + 2]];
  const base = Float32Array.from(SEAT.keys[0]); setv(base, 27, [1, 0, 0]); setv(base, 30, [0, 1, 0.03]);          // the head level, facing the learner
  for (const [i, sg] of [[57, 1], [69, -1]]){ const L = TUT.legs[sg > 0 ? 0 : 1]; setv(base, i, [L[0] * sg, L[1], L[2]]); setv(base, i + 3, [L[3] * sg, L[4], L[5]]); setv(base, i + 6, [L[6] * sg, L[7], L[8]]); }      // the thighs as on a chair of ordinary height (CMU 86_15), the knees together and the feet side by side, one a little forward (a composed sitter: see REFERENCES)
  /* the neck's length is set so that the mouth is where the stage's close-up expects it: 63 above the line of the shoulders */
  { const up = nk => { B.neck = nk; const J = skeleton(base, B), m = at(J.head, J.Bh, [0, -0.64 * B.hh, 0.74 * B.hh]); return ((m[1] - (J.shL[1] + J.shR[1]) / 2) * cp - (m[2] - (J.shL[2] + J.shR[2]) / 2) * sp) * S; }, a = up(0.04), b = up(0.1); B.neck = 0.04 + (TUT.shY - TUT.mouthY - a) / (b - a) * 0.06; }
  const J0 = skeleton(base, B), floor = lowest(J0), ys0 = (J0.shL[1] + J0.shR[1]) / 2, zs0 = (J0.shL[2] + J0.shR[2]) / 2;
  const ox = 200, oy = TUT.shY + ((ys0 - floor) * cp - zs0 * sp) * S, cam = camera(0, pitch, S, ox, oy);
  const unproj = (X, Y, z) => [(X - ox) / S, floor + ((oy - Y) / S + z * sp) / cp, z];
  /* ----- the chair she sits on (the stage's present chair, in the figures' finish): an upholstered back seen from the front behind her
     shoulders, the seat's cushion under her, two front legs of dark wood; the same camera as her body; light from the upper left ----- */
  function chairSVG(J){
    if (o.chair === false) return "";
    const stool = o.chair === "stool";                       // (the other option: a small upholstered seat under her and no back, as the round-one drawing the owner liked)
    const Q = (x, y, z) => { const q = cam.pt([x, y - floor, z]); return [q[0], q[1]]; }, R = v => v.toFixed(1);
    const ys = J.root[1] - 0.058, zf = J.root[2] + 0.165, zb = J.root[2] - 0.13, hw = 0.148, th = 0.052, ysh = (J.shL[1] + J.shR[1]) / 2;
    const up = TUT.chairUp, zk = zb - 0.035;                         // the back: a padded panel standing behind her, its top `up` above her shoulders
    const rr = (x0, y0, x1, y1, r) => `M${R(x0 + r)} ${R(y0)}H${R(x1 - r)}Q${R(x1)} ${R(y0)} ${R(x1)} ${R(y0 + r)}V${R(y1 - r)}Q${R(x1)} ${R(y1)} ${R(x1 - r)} ${R(y1)}H${R(x0 + r)}Q${R(x0)} ${R(y1)} ${R(x0)} ${R(y1 - r)}V${R(y0 + r)}Q${R(x0)} ${R(y0)} ${R(x0 + r)} ${R(y0)}Z`;
    const UP = TUT.chairCol, M = material(UP[0], UP[1]), wood = ["#5f4838", "#46352a"];
    const b0 = Q(-hw * 0.96, ysh + up, zk), b1 = Q(hw * 0.96, ys, zk), bw = b1[0] - b0[0], e = bw * 0.06;
    if (stool){ const sw2 = 0.105, t0s = Q(-sw2, ys, zb + 0.05), t1s = Q(sw2, ys, zf - 0.02), f0s = Q(-sw2, ys, zf - 0.02), f1s = Q(sw2, ys - th * 0.8, zf - 0.02), rs = (f1s[1] - f0s[1]) * 0.45, SM = material("#6d5848", "#4e3e33");
      const lg = sg => { const a = Q(sg * (sw2 - 0.02), ys - th * 0.8, zf - 0.04), b = Q(sg * (sw2 - 0.012), 0, zf - 0.04), w = (f1s[0] - f0s[0]) * 0.05; return `<path d="M${R(a[0] - w)} ${R(a[1])}L${R(b[0] - w * 0.8)} ${R(b[1])}H${R(b[0] + w * 0.8)}L${R(a[0] + w)} ${R(a[1])}Z" fill="${wood[1]}"/>`; };
      return `<g class="chair">` + lg(-1) + lg(1) + `<path d="${rr(t0s[0], t0s[1], t1s[0], t1s[1] + rs, rs)}" fill="${SM.n[0]}"/><path d="${rr(f0s[0], f0s[1] - 1, f1s[0], f1s[1], rs)}" fill="${SM.n[1]}"/></g>`; }
    const back = rr(b0[0], b0[1], b1[0], b1[1], bw * 0.16), backS = rr(b0[0] + e, b0[1] + e * 0.9, b1[0], b1[1], bw * 0.16), backL = rr(b0[0], b0[1], b1[0] - e, b1[1] - e * 0.9, bw * 0.16);
    const t0 = Q(-hw, ys, zb), t1 = Q(hw, ys, zf), f0 = Q(-hw, ys, zf), f1 = Q(hw, ys - th, zf), rad = (f1[1] - f0[1]) * 0.45;
    const seatTop = rr(t0[0], t0[1], t1[0], t1[1] + rad, rad), front = rr(f0[0], f0[1] - 1, f1[0], f1[1], rad), frontS = rr(f0[0] + e * 0.7, f0[1] + (f1[1] - f0[1]) * 0.45, f1[0], f1[1], rad);
    const leg = sg => { const a = Q(sg * (hw - 0.03), ys - th, zf - 0.03), b = Q(sg * (hw - 0.032), 0.0, zf - 0.03), w = (f1[0] - f0[0]) * 0.055;
      return `<path d="M${R(a[0] - w)} ${R(a[1])}L${R(b[0] - w * 0.8)} ${R(b[1])}H${R(b[0] + w * 0.8)}L${R(a[0] + w)} ${R(a[1])}Z" fill="${wood[0]}"/><path d="M${R(a[0] + w * 0.15)} ${R(a[1])}L${R(b[0] + w * 0.1)} ${R(b[1])}H${R(b[0] + w * 0.8)}L${R(a[0] + w)} ${R(a[1])}Z" fill="${wood[1]}"/>`; };
    const hipS = Q(0, ys, J.root[2] + 0.06), hipW = (J.hipL ? Math.abs(Q(J.hipL[0], 0, 0)[0] - Q(J.hipR[0], 0, 0)[0]) : 80) * 0.9;
    return `<g class="chair">` + leg(-1) + leg(1) +
      `<path d="${back}" fill="${M.n[1]}"/><path d="${backL}" fill="${M.n[0]}"/><path d="${rr(b0[0] + e * 0.35, b0[1] + e * 0.3, b0[0] + bw * 0.5, b0[1] + e * 1.2, e * 0.4)}" fill="${M.n[2]}" opacity=".45"/>` +
      `<path d="${rr(b0[0] + e * 1.6, b0[1] + e * 1.6, b1[0] - e * 1.6, b1[1] - e, bw * 0.12)}" fill="none" stroke="${M.n[1]}" stroke-width="${R(e * 0.22)}" opacity=".55"/>` +
      `<path d="${seatTop}" fill="${M.n[0]}"/><path d="${front}" fill="${M.n[1]}"/><path d="${rr(f0[0], f0[1] - 1, f1[0] - e * 0.7, f1[1] - (f1[1] - f0[1]) * 0.5, rad)}" fill="${mixc(M.n[0], M.n[1], 0.45)}"/>` +
      `<ellipse cx="${R(hipS[0] + 3)}" cy="${R(hipS[1] + 4)}" rx="${R(hipW * 0.75)}" ry="${R(Math.max(6, (t1[1] - t0[1]) * 0.55))}" fill="#1d2233" opacity=".16"/></g>`;
  }
  /* ----- the mouth: the page's own drawing of a mouth shape (lips, the dark of the open mouth, teeth, tongue, the line of the closed lips,
     the dimples of a smile), laid on the head in the mouth's place and turned with it; units: the stage's, from the middle of the mouth ----- */
  const f2s = n => n.toFixed(2), dimple = mixc(c.skin[1], c.skin[2], 0.55);
  const mouthInner = px => `<g transform="scale(${(1 / px).toFixed(5)})"><path class="mLips" fill="#c4626a"/><path class="mIn" fill="#4a1c22"/><clipPath id="${u}mc"><path class="mClip"/></clipPath><g clip-path="url(#${u}mc)"><rect class="mTU" fill="#f7f3ec"/><rect class="mTL" fill="#ece6dc"/><ellipse class="mTg" ry="3" fill="#cf6b74"/></g>` +
    `<path class="mLine" stroke="#8e3d45" stroke-width="1.3" fill="none" stroke-linecap="round"/><path class="mHi" stroke="#e39aa0" stroke-width=".8" fill="none" stroke-linecap="round" opacity=".4"/><rect class="mTF" x="-7" y="-3" width="14" height="3" rx="1" fill="#f7f3ec" opacity="0"/><path class="mDim" stroke="${dimple}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".6"/></g>`;
  let M = null, lastV = [0.04, 0.5, 0, 1, 0, 0, 0], lastSmile = 0.8, mouthT = 0, smileLid = 0, lidHook = null;
  function mouthDraw(v, smile){
    if (smile == null) smile = lastSmile; lastSmile = smile;
    if (!(v[3] > 0.5) && v[0] > 0.08 || Math.abs(v[0] - lastV[0]) > 0.004 || Math.abs(v[1] - lastV[1]) > 0.004) mouthT = now();          // she is speaking: no blink, no breath
    lastV = v; if (!M) return;
    const open = v[0], width = v[1], protr = v[2], closed = v[3], teeth = v[4], fv = v[5], tongue = v[6], cx = 0, cy = 0;
    /* the broad smile (smile above 1, the page's smile(true) after a right answer, when she is not speaking): wider, the corners higher, the lips
       parted on the upper teeth, the cheeks raising the lower lids: so that it reads at the stage's size against her resting smile */
    const bs = (closed > 0.5 || open < 0.08) ? Math.max(0, Math.min(1, (smile - 1) / 0.3)) : 0;
    const sm = smile * (1 - 0.8 * protr), Wd = 6 + 10 * width - 3 * protr + 2.4 * sm + TUT.smW * bs;
    let H = closed > 0.5 ? 0.1 : Math.max(0.1, 0.6 + 8 * open); if (closed < 0.5 && protr > 0.3) H = Math.max(H, Wd * 0.75 * protr); if (bs) H = Math.max(H, TUT.smH * bs);
    if (smileLid !== bs){ smileLid = bs; if (lidHook) lidHook(); }
    const L = 2.3 + 1.8 * protr, lift = 2.6 * sm + TUT.smLift * bs, xl = cx - Wd - L * 0.75, xr = cx + Wd + L * 0.75, yc = cy - lift + 0.4, up = cy - H - L * 1.05, dn = cy + H + L * 1.4;
    M.lips.setAttribute("d", `M${f2s(xl)} ${f2s(yc)} Q${f2s(cx - Wd * 0.55)} ${f2s(up - 0.8)} ${f2s(cx - 1.8)} ${f2s(up + 0.2)} Q${f2s(cx)} ${f2s(up + 1.1)} ${f2s(cx + 1.8)} ${f2s(up + 0.2)} Q${f2s(cx + Wd * 0.55)} ${f2s(up - 0.8)} ${f2s(xr)} ${f2s(yc)} Q${f2s(cx + Wd * 0.6)} ${f2s(dn + 0.8)} ${f2s(cx)} ${f2s(dn)} Q${f2s(cx - Wd * 0.6)} ${f2s(dn + 0.8)} ${f2s(xl)} ${f2s(yc)} Z`);
    M.lips.setAttribute("fill", protr > 0.5 ? "#b5535c" : "#c4626a");
    const hIn = fv > 0.5 ? 0.8 : H, yi = cy - lift * 0.7, inner = `M${f2s(cx - Wd)} ${f2s(yi)} Q${f2s(cx)} ${f2s(cy - hIn * 1.05 - lift * 0.25)} ${f2s(cx + Wd)} ${f2s(yi)} Q${f2s(cx)} ${f2s(cy + hIn * 1.05 + lift * 0.6)} ${f2s(cx - Wd)} ${f2s(yi)} Z`;
    M.inn.setAttribute("d", inner); M.clip.setAttribute("d", inner); M.inn.setAttribute("opacity", H > 0.7 || fv > 0.5 ? 1 : 0);
    M.line.setAttribute("d", `M${f2s(xl + 1.2)} ${f2s(yc + 0.2)} Q${f2s(cx)} ${f2s(cy + lift * 0.95 + 0.3)} ${f2s(xr - 1.2)} ${f2s(yc + 0.2)}`); M.line.setAttribute("opacity", H > 1.2 ? 0 : 1);
    M.hi.setAttribute("d", `M${f2s(cx - Wd * 0.38)} ${f2s(dn - 1.3)} Q${f2s(cx)} ${f2s(dn - 0.6)} ${f2s(cx + Wd * 0.38)} ${f2s(dn - 1.3)}`);
    M.dim.setAttribute("d", `M${f2s(xl - 1.6)} ${f2s(yc - 3.4)} q-2.2 3.2 0 6.6 M${f2s(xr + 1.6)} ${f2s(yc - 3.4)} q2.2 3.2 0 6.6`); M.dim.setAttribute("opacity", f2s(Math.max(0, sm - 0.95) * 1.2));
    const th = teeth > 0.05 ? Math.min(H * 1.2, 2.2 + 1.4 * teeth) : bs ? H * 1.15 : 0;
    M.tu.setAttribute("x", f2s(cx - Wd)); M.tu.setAttribute("width", f2s(2 * Wd)); M.tu.setAttribute("y", f2s(cy - H - lift * 0.3)); M.tu.setAttribute("height", f2s(th));
    M.tl.setAttribute("x", f2s(cx - Wd)); M.tl.setAttribute("width", f2s(2 * Wd)); M.tl.setAttribute("y", f2s(cy + H - Math.min(1.6, H * 0.4))); M.tl.setAttribute("height", (open > 0.25 || teeth > 0.95) ? "1.60" : "0");
    M.tg.setAttribute("cy", f2s(cy + H - 1.5 - 3.5 * tongue * open)); M.tg.setAttribute("rx", f2s(Wd * 0.7)); M.tg.setAttribute("opacity", (open > 0.15 ? 0.55 + 0.45 * tongue : 0).toFixed(2));
    M.tf.setAttribute("opacity", fv > 0.5 ? 1 : 0);
  }
  const W = wearer(c, { legs: o.legs || ["#5a6272", "#3f4654"], tag: o.tag == null ? "Marie" : o.tag, tagAt: [TUT.tagX, TUT.tagY], tagBox: [50 / S, 23 / S], tagId: "claireTag", live: true, mouthInner, smile: 0.5 }, u);
  if (TUT.rim !== 0.42) for (const m of ["skinM", "topM"]) W[m] = Object.assign({}, W[m], { n: [W[m].n[0], W[m].n[1], mixc(W[m].n[0], "#ffffff", TUT.rim)] });      // her rim: a little lighter than the lit tone, not a white line (the face in the close-up, the top of the shoulder)
  B.castMax = TUT.castMax;
  /* ----- the body: the seated pose; the small sway of sitting still (x: 0 .. 1 along the captured two seconds; only the trunk's part of
     it: the head stays level and the hands stay where they are); the head bent forward for a nod (a: radians) ----- */
  const keyOf = (x, a) => { const k = Float32Array.from(base);
    if (x){ const s = keyAt(SWAY, x), s0 = SWAY.keys[0]; for (let i = 0; i < 18; i++) k[i] += (s[i] - s0[i]); for (const i of [3, 6, 9, 12, 15]) setv(k, i, getv(k, i)); }
    if (a){ const cs = Math.cos(a), sn = Math.sin(a), n = getv(k, 24), up = getv(k, 30); setv(k, 24, [n[0], n[1] * Math.cos(a / 3) - n[2] * Math.sin(-a / 3), n[1] * Math.sin(a / 3) + n[2] * Math.cos(a / 3)]); setv(k, 30, [up[0], up[1] * cs - up[2] * sn, up[1] * sn + up[2] * cs]); }
    return k; };
  /* ----- the arms: each wrist is put where the page asks, in three dimensions: its depth is that of the surface it is in front of (the
     chest; the lap, low down; beside the head, high up), further forward the more the page foreshortens the forearm (fs); the elbow is found
     from the two bones' lengths and bends down, out and a little back, as an elbow does ----- */
  const REST = { L: { x: 150, y: 582, shape: "relaxed", rot: "auto", scale: 1, fs: 1 }, R: { x: 250, y: 582, shape: "relaxed", rot: "auto", scale: 1, fs: 1 } };
  const sm01 = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  function depth(X, Y, fs, J){
    const xb = (X - ox) / S, yb = floor + (oy - Y) / S / cp, yr = J.root[1], yc = J.chest[1] + 0.012, ysh = (J.shL[1] + J.shR[1]) / 2;
    const t = (yb - yr) / (yc - yr), tw = Math.max(0, Math.min(1, t)), a = t < 0.45 ? B.hem[0] + (B.waist[0] - B.hem[0]) * tw / 0.45 : B.waist[0] + (B.chest[0] - B.waist[0]) * (tw - 0.45) / 0.55, d = t < 0.45 ? B.hem[2] + (B.waist[2] - B.hem[2]) * tw / 0.45 : B.waist[2] + (B.chest[2] - B.waist[2]) * (tw - 0.45) / 0.55;
    const zc = J.root[2] + (J.chest[2] - J.root[2]) * tw;
    let z = zc + d * Math.sqrt(Math.max(0, 1 - (xb / a) * (xb / a))) + 0.016;                                 // on the trunk
    z += (0.135 - z) * sm01((yr + 0.1 - yb) / 0.07);                                                          // on the lap
    z += (J.head[2] - 0.03 - z) * sm01((yb - ysh - 0.015) / 0.06);                                            // beside the head
    return z + (1 - (fs == null ? 1 : fs)) * TUT.fwd;
  }
  function reach(sh, X, Y, z){                                 // the place of the wrist: on the line of sight through X, Y, as near depth z as the arm's length allows
    const W0 = unproj(X, Y, 0), r = [0, sp / cp, 1], mx = (B.ua + B.fa) * 0.985, v = sub(W0, sh), rr = dot(r, r), b = dot(v, r), cc = dot(v, v) - mx * mx, disc2 = b * b - rr * cc;
    if (disc2 <= 0) z = -b / rr; else { const q = Math.sqrt(disc2), z1 = (-b - q) / rr, z2 = (-b + q) / rr; z = Math.max(z1, Math.min(z2, z)); }
    return add(W0, mul(r, z)); }
  function elbow(sh, wr, sg){
    let d = sub(wr, sh), L = Math.hypot(d[0], d[1], d[2]); const a = B.ua, b = B.fa, mx = (a + b) * 0.999, mn = Math.abs(a - b) + 0.02;
    if (L > mx){ d = mul(d, mx / L); L = mx; } if (L < mn){ d = mul(d, mn / (L || 1)); L = mn; }
    const uu = mul(d, 1 / L), x = (a * a - b * b + L * L) / (2 * L), h = Math.sqrt(Math.max(0, a * a - x * x)), up = sm01((d[1] + 0.16) / 0.14);      // a hand in the lap: the elbow back, beside the body; a hand raised: the elbow out
    let pole = [sg * (TUT.elOut + 0.4 * up), -0.62, -0.7 + 0.55 * up]; pole = nrm(sub(pole, mul(uu, dot(pole, uu))));
    const el = add(add(sh, mul(uu, x)), mul(pole, h)), w2 = add(sh, d); return { ud: nrm(sub(el, sh)), fd: nrm(sub(w2, el)) }; }
  /* the hand: which way it points and which way its palm faces, for each shape the page asks for */
  const perp = (v, h) => nrm(sub(v, mul(h, dot(v, h)))), PNR = { L: getv(base, 42), R: getv(base, 54) };
  function orient(p, fd, side, sg){
    const sh = p.shape, r = p.rot; let hd, pn;
    if (sh === "cup"){ hd = nrm([sg * 0.16, 1, 0.2]); pn = perp([-sg * 0.62, 0, 1], hd); }                    // behind the ear: fingers up, the palm forward and a little to the head
    else if (sh === "palmup"){ const H = TUT.palmHd, N = TUT.palmPn; hd = nrm([H[0] * sg, H[1], H[2]]); pn = perp([N[0] * sg, N[1], N[2]], hd); }            // offered to the learner: fingers toward him and a little out, the palm up
    else if (r === "auto" || r == null){ hd = fd; pn = sh === "relaxed" ? perp([-sg * 0.42, -0.62, -0.66], hd) : perp([sg * 0.2, -0.3, -1], hd); }      // at rest the palm lies on the thigh (down, and turned a little inward, as the capture's hands lie)
    else { const a = r * Math.PI / 180; hd = nrm([-Math.sin(a), -Math.cos(a), sh === "point" ? -0.1 : -0.03]); pn = perp([0, 0, -1], hd); }      // on her chest: the hand lies on it, turned as the page says
    return { hd, pn, hp: handFlat(HANDS[sh] || HANDS.relaxed).concat([(p.scale || 1) * (sh === "palmup" ? TUT.palmK : 1)]) }; }      // the page's own size for the hand in this pose (a hand held out to the viewer is nearer, and larger)
  const ST = { L: {}, R: {} }, mixv = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t), TIP = {};
  let pose = REST, blendUntil = 0, armsT = 0, lastArmsDraw = 0, armCast = "", castEl = null, headCast = "";
  const ARMKEEP = {};
  function armsList(k, t){
    const J = skeleton(k, B), hands = {};
    for (const ps of ["L", "R"]){ const side = ps === "L" ? "R" : "L", sg = side === "L" ? 1 : -1, off = side === "L" ? 33 : 45, p0 = pose[ps] || REST[ps], st = ST[ps], sh = J["sh" + side];
      const p = p0.shape === "flat" && typeof p0.rot === "number" && p0.y < 500 && Math.abs(p0.rot + 118) < 20 ? Object.assign({}, p0, { x: p0.x + (ps === "L" ? 1 : -1) * TUT.chestDx, y: p0.y + TUT.chestDy, rot: TUT.chestRot })
        : p0.shape === "point" && typeof p0.rot === "number" && Math.abs(Math.abs(p0.rot) - 90) < 15 && p0.y > 440 && p0.y < 500 && Math.abs(p0.x - 200) < 60 ? Object.assign({}, p0, { y: p0.y + TUT.selfDy }) : p0;      // her finger on her own name tag: on the tag where this body wears it      // the flat hand on her chest lies higher, on the breastbone, its fingers toward the far shoulder: above her name tag, which stays readable
      const offer = p.shape === "palmup" && (p.fs == null ? 1 : p.fs) < 0.9, px = p.x + (offer ? (ps === "L" ? -1 : 1) * TUT.palmOut : 0);      // the open hand offered: a little out to the side as well as forward
      const wr = reach(sh, px, p.y, depth(px, p.y, p.fs, J)), E = elbow(sh, wr, sg), O = orient(p, E.fd, side, sg), key = p.shape + "|" + (typeof p.rot === "number" ? "n" : p.rot);
      if (st.key !== key){ const jump = st.x != null && Math.hypot(p.x - st.x, p.y - st.y) > 45; st.from = st.last && !jump && st.key ? st.last : null; st.t = t; st.key = key; }      // a new shape: the hand changes into it over 130 ms (at once if the arm was put there at once)
      st.x = p.x; st.y = p.y;
      let w = st.from ? (t - st.t) / 130 : 1; if (w >= 1){ w = 1; st.from = null; } else blendUntil = Math.max(blendUntil, st.t + 140);
      const e = sm01(w), hd = st.from ? nrm(mixv(st.from.hd, O.hd, e)) : O.hd, pn = st.from ? perp(mixv(st.from.pn, O.pn, e), hd) : O.pn, hp = st.from ? mixv(st.from.hp, O.hp, e) : O.hp;
      st.last = { hd, pn, hp };
      setv(k, off, E.ud); setv(k, off + 3, E.fd); setv(k, off + 6, hd); setv(k, off + 9, pn); hands[side] = hp;
      { const HL = B.hand, th = side === "L" ? cross(pn, hd) : cross(hd, pn), q = cam.pt((p => [p[0], p[1] - floor, p[2]])(add(add(wr, mul(hd, 0.956 * HL)), mul(th, 0.74 * B.pwk * HL)))); TIP[ps] = { x: q[0], y: q[1] }; } }
    const sigOf = side => { const off = side === "L" ? 33 : 45; let sg = ""; for (let i = 0; i < 33; i++) sg += k[i].toFixed(5) + ","; for (let i = off; i < off + 12; i++) sg += k[i].toFixed(5) + ","; return sg + hands[side].join(","); };      // all that an arm's drawing depends on: the body's pose, the arm's four directions, the hand's shape
    const list = frame(k, B, cam, W, floor, { part: "arms", hands, armKeep: ARMKEEP, armSig: { L: sigOf("L"), R: sigOf("R") } }); armCast = list.cast || "";
    for (const ps of ["L", "R"]){ const p = pose[ps] || REST[ps], st = ST[ps]; if (p.shape !== "cup") continue;      // the hand cupped behind the ear: the ear is in front of the palm
      const side = ps === "L" ? "R" : "L", sg = side === "L" ? 1 : -1, hh = B.hh, e3 = at(J.head, J.Bh, [sg * 0.83 * hh, -0.1 * hh, -0.1 * hh]), q = cam.pt([e3[0], e3[1] - floor, e3[2]]);
      const E = ellipse(q, [cam.lin(mul(J.Bh.x, 0.1 * hh)), cam.lin(mul(J.Bh.y, 0.2 * hh)), cam.lin(mul(J.Bh.z, 0.14 * hh))]), op = f2(st.from ? sm01((t - st.t) / 130) : 1);
      E.a *= 1.12; E.b *= 1.12;
      list.push({ id: "earO" + ps + "0", d: ellPath(E, 0, 0.02 * PX * sg, 0.012 * PX), fill: W.skinM.f[1], op }, { id: "earO" + ps + "1", d: ellPath(E, 0, 0, 0), fill: W.skinM.n[1], op }, { id: "earO" + ps + "2", d: ellPath(E, -0.045 * PX, -0.03 * PX * sg, 0), fill: W.skinM.n[0], op }); }
    return list;
  }
  /* ----- the page ----- */
  const g = document.createElementNS(NS, "g"); g.setAttribute("id", "tutor");
  /* o.zoom (a proposal, not the default): the whole teacher drawn larger about (200, 340), so that the stage's lower edge crops her at the lap
     (1.3: her legs fall below the edge at 390 x 844). The page's poses keep their numbers (they are scaled with her); tip() gives the place on
     the stage. NOTE for the page if it is chosen: the mouth moves to y 398 (faceZoom's centre), and her resting hands come down to y 685-708,
     into the mic tab's zone */
  const ZM = o.zoom && o.zoom !== 1 ? o.zoom : 0, zpt = q => ZM ? { x: 200 + (q.x - 200) * ZM, y: 340 + (q.y - 340) * ZM } : q;
  if (ZM) g.setAttribute("transform", `translate(200 340) scale(${ZM}) translate(-200 -340)`);
  const P2 = p => [p[0] * S, -p[1] * S, p[2]], shapeDef = (name, hd, pn, dx) => { const R = fingers([0, 0, 0], nrm(hd), perp(pn, nrm(hd)), false, handFlat(HANDS[name]), B, P2, S, W.skinM.n, "x"); R.parts.sort((a, b) => a.z - b.z);
    return `<g id="hs_${name}"><g transform="translate(${dx} 0)">` + R.parts.map(n => n.tag ? `<g transform="matrix(${n.m.join(" ")})">${n.inner}</g>` : n.layers.map(l => `<path d="${l[0]}" fill="${l[1]}"/>`).join("")).join("") + `</g></g>`; };
  /* the hand shapes the page itself draws with (the learners' pointing hand, the small hands of a tap turn): the same hand, flat on the page,
     the wrist at 0, 0, pointing down; the tip of the pointing finger where it has always been (8.5, 55.3) */
  const defs = shapeDef("relaxed", [0, -1, 0], [0, 0, -1], 0) + shapeDef("point", [0, -1, 0], [0, 0, -1], f2(8.55 - 0.74 * B.pwk * B.hand * S)) + shapeDef("flat", [0, -1, 0], [0, 0, -1], 0) + shapeDef("palmup", [0, -0.58, 0.81], [0, 0.81, 0.58], 0) + shapeDef("cup", [0, 1, 0], [0, 0, 1], 0);
  g.innerHTML = `<defs>${W.defs}${defs}</defs><g id="tutorBody">${chairSVG(J0)}</g><g id="arms"></g>`;
  const hostB = g.children[1], hostA = g.children[2];
  const syncer = host => { let order = null; const byId = {}, last = {}, fixed = host.children.length; return list => { const ord = list.map(n => n.id).join(" ");
    if (ord !== order){ order = ord; const seen = {}; for (const n of list) seen[n.id] = 1; for (const id in byId) if (!seen[id]){ byId[id].remove(); delete byId[id]; delete last[id]; }
      let ref = host.children[fixed] || null; for (const n of list){ let el = byId[n.id]; if (!el){ el = mk(nodeHTML(n, u)).firstChild; byId[n.id] = el; } if (el === ref) ref = ref.nextSibling; else host.insertBefore(el, ref); } }      // (only a part whose place changed is moved: each move wakes the page's watcher of added nodes)
    for (const n of list){ const sig = n.tag ? null : n.d + "|" + n.fill + "|" + n.op; if (sig !== null && last[n.id] === sig) continue; last[n.id] = sig; nodeSet(byId[n.id], n); } }; };      // (a part that has not changed is left alone: an arm at rest costs nothing while the other moves)
  const syncB = syncer(hostB), syncA = syncer(hostA);
  let swayX = 0, nodA = 0, kNow = keyOf(0, 0);
  /* the jumper over her bust: a soft shade under each breast, laid on the chest and turned with it
     (TUT.bust: how much; 0: none) */
  const bustOf = k => { if (!TUT.bust) return []; const J = skeleton(k, B), Bc = J.Bc, T = W.topM, q = v => { const r = cam.pt([v[0], v[1] - floor, v[2]]); return [r[0], r[1]]; }, bz = TUT.bust, out = [];
    const on = (x, y) => at(J.chest, Bc, [x, y, B.chest[2] * 1.0 * Math.sqrt(Math.max(0.05, 1 - (x / B.chest[0]) ** 2)) - 0.004]), R = v => v.toFixed(1);
    let dS = "";
    for (const sg of [1, -1]){ const cx = sg * TUT.bustX, y0 = TUT.bustY, w = 0.036, dep = 0.022 * bz;
      const A = [], Bq = []; for (let i = 0; i <= 10; i++){ const t = i / 10, x = cx + sg * (-w + 2 * w * t) * 1, sa = Math.sin(Math.PI * t); A.push(q(on(x, y0 - dep * sa - 0.004 * t))); Bq.push(q(on(x, y0 - dep * 0.45 * sa - 0.004 * t + 0.002))); }
      dS += "M" + A.map(p => R(p[0]) + " " + R(p[1])).join("L") + "L" + Bq.reverse().map(p => R(p[0]) + " " + R(p[1])).join("L") + "Z";
    }
    out.push({ id: "bustS", d: dS, fill: T.n[1], op: f2(0.55) });
    return out; };
  const bodyKept = {}, bodyList = (x, a) => { const id = x.toFixed(3) + "|" + a.toFixed(3); if (bodyKept[id]) return bodyKept[id];
    const k = keyOf(x, a), L = frame(k, B, cam, W, floor, { part: "body" }), bs = bustOf(k); if (bs.length){ let i = -1; L.forEach((n, j) => { if (/^trunk\d/.test(n.id)) i = j; }); L.splice(i + 1, 0, ...bs); }
    return (bodyKept[id] = L); };
  let castWas = null; const castSet = () => { if (!castEl) castEl = hostB.querySelector('[data-p="trunkC"]'); const d = headCast + armCast; if (castEl && d !== castWas){ castWas = d; castEl.lastChild.setAttribute("d", d); } };
  function drawBody(){ kNow = keyOf(swayX, 0); const L = bodyList(swayX, nodA); syncB(L); headCast = (L.find(n => n.id === "trunkC") || {}).d || ""; castSet(); }
  function drawArms(){ const t = now(); lastArmsDraw = t; syncA(armsList(Float32Array.from(kNow), t)); castSet(); if (t < blendUntil) requestAnimationFrame(() => { if (now() - lastArmsDraw > 8) drawArms(); }); }
  drawBody(); drawArms();
  { const mg = hostB.querySelector('[data-p="mouth"]'), q = s => mg.querySelector(s); M = { lips: q(".mLips"), inn: q(".mIn"), clip: q(".mClip"), tu: q(".mTU"), tl: q(".mTL"), tg: q(".mTg"), line: q(".mLine"), hi: q(".mHi"), tf: q(".mTF"), dim: q(".mDim") }; mouthDraw(lastV, 0.8); }
  const eyes = ["eyeL", "eyeR"].map(id => hostB.querySelector(`[data-p="${id}"]`)), pups = eyes.map(e => e.querySelector(".pup")), lids = eyes.map(e => e.querySelector(".lid")), blks = eyes.map(e => e.querySelector(".blk"));
  /* the eyes: looking down at the model learner (the irises and the lids come down together, as the page's did: 2.3 and 2.4 of the stage's units in a quarter of a second) */
  let down = false, shut = 0, held = false, nodding = false;
  const lidSet = () => { const dy = (down ? 2.4 : 0) / PX + shut * 0.075 + TUT.lid + TUT.smLid * smileLid; lids.forEach(l => l.style.transform = `translate(0px,${dy.toFixed(4)}px)`); blks.forEach(b => b.setAttribute("visibility", shut >= 1 ? "visible" : "hidden")); };
  lidHook = lidSet; lidSet();
  function gaze(where){ down = where === "learner"; pups.forEach(p2 => p2.style.transform = down ? `translate(0px,${(2.3 / PX).toFixed(4)}px)` : "translate(0px,0px)"); lidSet(); }
  /* a blink: the lids half down, shut, half down, open (about a seventh of a second) */
  let blinking = false;
  function blink(){ if (blinking) return; blinking = true; lids.forEach(l => l.style.transition = "none"); shut = 0.5; lidSet();
    setTimeout(() => { shut = 1; lidSet(); }, 34); setTimeout(() => { shut = 0.5; lidSet(); }, 110); setTimeout(() => { shut = 0; lidSet(); lids.forEach(l => l.style.transition = "transform .25s ease-in-out"); blinking = false; }, 150); }
  /* she is quiet when nothing is being said (the mouth has been at rest for a while), both hands are at rest and she is not nodding: only
     then may she blink or breathe */
  const atRest = () => ["L", "R"].every(s => { const p = pose[s] || REST[s]; return p.shape === "relaxed" && Math.abs(p.x - REST[s].x) < 0.5 && Math.abs(p.y - REST[s].y) < 0.5; });
  const quiet = () => !held && !nodding && atRest() && now() - mouthT > 700 && now() - armsT > 700;
  if (o.autoBlink !== false){ const again = () => setTimeout(() => { if (!g.isConnected && again.n++ > 40) return; if (g.isConnected && quiet() && !document.hidden) blink(); again(); }, 2600 + Math.random() * 3200); again.n = 0; again(); }
  /* the nod: the head bends forward on the neck nine degrees (the chin comes down by 7 of the stage's units, as the page's nod did) and comes
     back, twice; each way eased over 160 ms, the next beginning 170 ms after the last, as the page's did. Its frames are worked out once */
  const NODS = [0, 0.25, 0.5, 0.75, 1].map(f => f * 9 * Math.PI / 180), easeIO = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const nodWarm = () => { for (const a of NODS) bodyList(swayX, a); };
  function nod(){ nodding = true; const t0 = now(); nodWarm();
    return new Promise(res => { (function f(){ const t = now() - t0, seg = Math.min(3, Math.floor(t / 170)), u2 = easeIO(Math.min(1, (t - seg * 170) / 160)), v = seg % 2 === 0 ? u2 : 1 - u2, a = NODS[Math.round(v * 4)];
      if (a !== nodA){ nodA = a; drawBody(); }
      if (t < 680) requestAnimationFrame(f); else { nodA = 0; drawBody(); nodding = false; res(); } })(); }); }
  if (typeof requestIdleCallback === "function") requestIdleCallback(nodWarm, { timeout: 3000 }); else setTimeout(nodWarm, 1200);
  const rig = { mouth: { draw: mouthDraw }, arms: { draw(p){ const P0 = pose; pose = { L: Object.assign({}, REST.L, p && p.L), R: Object.assign({}, REST.R, p && p.R) }; if (!atRest() || P0 !== REST) armsT = now(); drawArms(); }, tip: s => TIP[s] && zpt(TIP[s]) },
    gaze, nod, blink, still(on){ held = !!on; }, _: { B, S, cam, quiet } };
  return { node: g, rig };
}
return { figure, act, highFive, putOn, part: partPic, worn: lookWear, avatar: avatarW, wardrobeThumb, WARD, person, tutor, close: closeUp, handOver, HO, bust: bustOf, specString, specParse, AV, CLIPS, clipOf, STAT };
})();
/* the figure >>> */
/* ---------- PICS.action(act, who, opts): every action is the ONE figure (FIG), for everybody, with whatever they wear ----------
   (figures 11: the older drawings are gone.) The whole figure keyed from motion capture: run, walk, jump, dance, talk, stand up, sit down,
   arrive, leave, stop, fall, play, call, work, listen, go out, raise hand, swim; the close-ups: smile, not smiling, eat, drink, sleep, sing,
   read, write. opts.looks are worn on the figure (FIG.worn: a hat, a cap, a coat, a scarf, a backpack, a bag, a suit, a red dress, an
   umbrella, glasses: one drawing system with the wardrobe); opts.card: the person stands holding up the picture card of that action;
   opts.size "tall" | "short": by a measuring post; opts.still: the frozen frame (the card); opts.sex "f": the learner as a woman. */
const CLOSEFIG = { smile: "smile", "not smiling": "neutral", eat: "eat", drink: "drink", sleep: "sleep", sing: "sing", read: "read", write: "write" };
const FIGCLIP = { run: "run", walk: "walk", jump: "jump", dance: "dance", talk: "talk", "stand up": "standup", "sit down": "sitdown", arrive: "walk", leave: "walk", stop: "stand",
  fall: "fall", play: "play", call: "call", work: "work", listen: "listen", "go out": "walk", "raise hand": "raise", swim: "swim" };
const FIGOPT = { talk: { speaks: 1 }, arrive: { house: "right" }, leave: { house: "left" }, stop: { smile: 0.5, kmax: 1.12 }, "go out": { door: 1 }, listen: { smile: 0.8 }, play: { smile: 0.6 }, "raise hand": { smile: 0.5 } };
const IDTOP = { marie: "#2E4A6B", paul: "#3F6FB5", julie: "#C0453B" };       // the three identity colours (the design language, 9.1), as the middle tone of the jumper
/* a person as the figure draws them: the traits (the learner's own figure when one is made, with the colours chosen for what they wear),
   the identity top unless a look gives another jumper, the trousers, and Marie's hair tucked. variant: another person of the same kind */
function figOf(spec, variant){
  const cT = traits(spec, variant), L = cT.L || {}, who = spec.person, ID = IDTOP[who];
  const c = cT.av ? Object.assign({ cap: cT.cap, hat: cT.hat, band: cT.band, pack: cT.pack, umb: cT.umb, scarf: cT.scarf, coat: cT.coat, suit: cT.suit, tie: cT.tie, bag: cT.bag, shades: cT.shades, hood: cT.hood, named: cT.named }, cT.av, { L }) : cT;
  if (cT.av && (cT.jumper || L["red dress"])) c.top = cT.top;
  if (ID && !cT.jumper && !L["red dress"]) c.top = [tone(ID, 0.14), tone(ID, -0.2)];
  if (who === "marie") c.style = "tucked";
  const legs = cT.av ? cT.av.legs : spec.is ? [COL.navy, COL.charcoal, COL.brown][hashStr(c.kind + c.topName + c.style) % 3] : who === "paul" ? COL.navy : who === "julie" ? COL.charcoal : who === "marie" ? ["#77614f", "#5a4738"] : ["#5a6272", "#3f4654"];
  return { c, legs };
}
function action(act, who, opts){
  opts = opts || {};
  const word = x => firstWord(String(x || "").trim());
  act = ACT_OF[word(act)] || ACT2[word(act)] || "smile";
  who = who === "marie" || who === "paul" || who === "julie" ? who : "you";
  const still = !!opts.still, spec = opts.spec && !opts.spec.person && opts.spec.is ? { is: opts.spec.is } : { person: who }, tag = who === "you" || spec.is ? "" : (opts.name || WHO_NAME[who]) || "";
  if (opts.looks && opts.looks.length) spec.looks = opts.looks;
  if (opts.sex === "f" && spec.person === "you") spec.sex = "f";      // the learner as a woman (opts.sex "f"; "m", the default, is the man)
  const F = figOf(spec);
  if (opts.card)                                            // about to do it: standing still, the picture card of the action held up
    return FIG.act("stand", F.c, { still: true, legs: F.legs, tag, smile: 0.5, card: cardArt({ doing: opts.card, sex: spec.sex }).innerHTML });
  if (opts.size) return FIG.act("stand", F.c, { still: true, legs: F.legs, tag, smile: 0.5, post: opts.size === "short" ? "short" : "tall" });
  if (CLOSEFIG[act]) return FIG.close(CLOSEFIG[act], F.c, { still: act === "not smiling" || still, tag, phase: opts.phase, reading: opts.reading, box: opts.box });
  const buddy = opts.buddy && act === "swim" ? (() => { const b2 = opts.buddy === "you" || opts.buddy === "marie" || opts.buddy === "paul" || opts.buddy === "julie" ? opts.buddy : "marie", F2 = figOf({ person: b2 }); return { c: F2.c, legs: F2.legs, tag: b2 === "you" ? "" : WHO_NAME[b2] || "" }; })() : null;      // (figures 15) a second swimmer in the far lane (PICS.together)
  return FIG.act(opts.clip || FIGCLIP[act], F.c, Object.assign({ still: act === "stop" || still, legs: F.legs, heads: opts.heads, buddy, y: opts.y, tag, yaw: opts.yaw, phase: opts.phase, bare: !!opts.bare || opts.k > 1.6, ox: opts.ox || 0, arrow: !!opts.arrow }, FIGOPT[act], opts.k ? { k: opts.k } : null));
}

/* ---------- PICS.person(spec, name): somebody, as the course's entity describes them ----------
   several ("in a row", count): whole figures side by side, each another person; doing something: the action's picture (PICS.action; eating,
   drinking, sleeping, singing and reading are the frozen frame, as these pictures always were; writing and the whole-figure actions move
   unless spec.still); card / tall, short / did: the standing figure with the card, by the post, just stopped; holding: the thing held up;
   a mood look: the person feeling it (from the waist up); else the head and shoulders, with what they wear and a name tag when named */
const STILL_DOING = { eat: 1, drink: 1, sleep: 1, sing: 1, read: 1 };
function person(spec, name){
  spec = spec || {};
  const looks = spec.looks || [], n = spec.count || 1;
  if (!spec.person && (n > 1 || looks.indexOf("in a row") >= 0)) return row(spec, n);
  const who = spec.person === "paul" || spec.person === "julie" || spec.person === "marie" || spec.person === "you" ? spec.person : null;
  const high = liveTall(spec) ? null : looks.map(lookName).find(x => HEIGHT[x]);
  const o = { looks: looks.filter(x => !HEIGHT[lookName(x)] || liveTall(spec)), name, sex: spec.sex }; if (!who) o.spec = { is: DEF_STYLE[spec.is] ? spec.is : "man" };
  if (spec.card || high) return action("stop", who, Object.assign(o, { card: spec.card, size: high }));      // about to do it: the picture card held up; tall / short: by the measuring post
  if (spec.did) return action("stop", who, o);              // has just stopped: standing still
  if (spec.holding) return holder(spec, name);
  const d = doingOf(spec), act = ACT_OF[d] || ACT2[d], verdict = MOOD[looks.map(lookName).find(x => MOOD[x] === "yum" || MOOD[x] === "yuck")];
  if (verdict) return feelPerson(spec, name, verdict, d === "eating");       // the eater's verdict: with the fork / the hand that pushes it away while eating, the face alone after
  if (act) return action(act, who, Object.assign(o, { still: spec.still != null ? !!spec.still : !!STILL_DOING[act] || (!who && (act === "walk" || act === "smile")), reading: spec.reading }));
  const m = feelOf(looks) || (spec.person === "you" && !looks.length ? "plain" : "");      // a mood (or the learner's own everyday face): from the waist up
  if (m) return feelPerson(spec, name, m);
  return bustPic(spec, name);
}
/* a person feeling something (a mood look; "you" with no look: the learner's everyday face): the same person as their portrait and their
   figures, from the waist up: the face, the shoulders and the hands tell (FIG.close "feel", frame "half") */
function feelPerson(spec, name, mood, eating){
  const F = figOf(spec);
  return FIG.close("feel", F.c, { mood, frame: "half", still: true, tag: name || "", eating: !!eating });
}
/* the face card (PICS.thing "face"): the head large, the tops of the shoulders; no hands (index.html puts its hand sign in the corner). The
   person: "man" (the usual: tan, brown hair, a teal top), "woman", "girl" / "boy" / "child", "old" (an older man; "old woman"); the skin:
   fair | light | tan | brown | dark. The same person in every mood */
const FACE_WHO = { man: { skin: "tan", hair: "brown", style: "crew", top: "teal" }, woman: { skin: "light", hair: "dkbrown", style: "wavy", top: "plum" },
  boy: { skin: "brown", hair: "black", style: "kshort", top: "yellow" }, girl: { skin: "brown", hair: "black", style: "kbob", top: "orange" } };
function feelFace(spec){
  const looks = (spec.looks || []).map(lookName), has = w => looks.includes(w), mood = feelOf(looks) || "soso";
  const kind = has("girl") ? "girl" : has("boy") || has("child") ? "boy" : has("woman") || (spec.sex === "f" && !has("man")) ? "woman" : "man", old = has("old") || has("older");
  const c = traits({ is: kind, looks: old && !/girl|boy/.test(kind) ? ["old"] : [] }), W = FACE_WHO[kind];
  if (!old){ c.hair = HAIR[W.hair]; c.style = W.style; }
  c.skin = SKIN[["fair", "light", "tan", "brown", "dark"].find(has) || (old ? "fair" : W.skin)]; c.top = COL[old ? "navy" : W.top]; c.iris = "#4a3524";
  return FIG.close("feel", c, { mood, frame: "face", still: true, tag: "" });
}
/* the head and shoulders of somebody (the portrait of the figure, with what they wear; a tall hat or an umbrella makes the picture a
   little smaller so that it is whole); a name tag when a name is given */
const boxed = fig => { const u = "bx" + (seq++), g = mk(`<clipPath id="${u}"><rect width="160" height="190"/></clipPath><g clip-path="url(#${u})"></g>`); g.lastChild.appendChild(fig); return g; };      // a head and shoulders ends at the bottom edge of its picture
const flatTag = (lines, w, h, tws, MAXT) => `<g class="nametag"><rect x="${r2(80 - w / 2)}" y="146" width="${r2(w)}" height="${h}" rx="4" fill="#fffdf6" stroke="#b9ae98" stroke-width="1.5"/><rect x="${r2(80 - w / 2)}" y="146" width="${r2(w)}" height="5" rx="2" fill="#c8453b"/>` +
  lines.map((t, i) => `<text x="80" y="${166 + i * 16}" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="14" font-weight="700" fill="#2a2522"${tws && tws[i] > MAXT ? ` textLength="${MAXT}" lengthAdjust="spacingAndGlyphs"` : ""}>${String(t).replace(/[<&"]/g, ch => ({ "<": "&lt;", "&": "&amp;", '"': "&quot;" }[ch]))}</text>`).join("") + `</g>`;
function bustPic(spec, name){
  const F = figOf(spec), c = FIG.worn(F.c), tall = c.wd && c.wd.tall || 0, top = 39 - tall * 41;
  let fig = FIG.bust(c, { head: 82, cy: 80, yaw: (c.L || {}).ponytail || (c.L || {}).backpack ? -32 : -6, heads: c.kid ? undefined : 5.6, legs: F.legs });      // (a ponytail, a backpack: turned, so that it is seen)
  if (top < 5){ const h = mk(""); h.setAttribute("transform", `translate(80 190) scale(${r2((190 - 5) / (190 - top))}) translate(-80 -190)`); h.appendChild(fig); fig = h; }
  const g = boxed(fig);
  if (name) g.appendChild(mk(flatTag([name], spec.person === "julie" ? 56 : spec.person ? 50 : Math.max(50, Math.min(148, String(name).length * 8.4 + 14)), 24)).firstChild);
  return g;
}
/* several people standing side by side, to be counted: whole figures, each another person of the kind (the first is the kind's usual one) */
function row(spec, n){
  n = Math.max(1, Math.min(7, n | 0));
  const kind = DEF_STYLE[spec.is] ? spec.is : "man", g = mk(""), k = Math.min(1, 3.75 / n), pitch = Math.min(52 * k, 150 / n), y = 172 - (1 - k) * 44;
  for (let i = 0; i < n; i++){ const F = figOf({ is: kind }, i ? "row" + i : 0);
    g.appendChild(FIG.act("stand", F.c, { still: true, legs: F.legs, bare: true, k, ox: (i - (n - 1) / 2) * pitch, y, smile: 0.5, yaw: [-14, 10, -6, 14, -10, 6, 0][i] })); }
  return g;
}
/* somebody holding one thing up in one hand, to show it: the person at the right, the thing large beside them in their hand */
function holder(spec, name){
  const plain = Object.assign({}, spec); delete plain.holding;
  const F = figOf(plain);
  return FIG.close("hold", F.c, { still: true, tag: name || "", thing: heldThing(spec.holding, true) });
}

/* ---------- several of a thing, laid out to be counted ---------- */
let meter = null;
function measure(el){                                      // the drawn extent of a picture, in the 160 x 190 box
  try {
    if (!meter || !meter.isConnected){
      meter = document.createElementNS(NS, "svg");
      meter.setAttribute("width", "160"); meter.setAttribute("height", "190"); meter.setAttribute("aria-hidden", "true");
      meter.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none";
      (document.body || document.documentElement).appendChild(meter);
    }
    const wrap = document.createElementNS(NS, "g"); wrap.appendChild(el); meter.appendChild(wrap);
    const b = wrap.getBBox(); meter.removeChild(wrap); wrap.removeChild(el);
    if (b && b.width > 4 && b.height > 4){
      const x0 = Math.max(0, b.x), y0 = Math.max(0, b.y), x1 = Math.min(160, b.x + b.width), y1 = Math.min(190, b.y + b.height);
      if (x1 - x0 > 4 && y1 - y0 > 4) return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }
  } catch (e){}
  return { x: 22, y: 36, w: 116, h: 128 };
}
function group(n, drawOne){
  n = Math.max(1, n | 0);
  const g = document.createElementNS(NS, "g"), first = drawOne(), b = measure(first);
  const W = 150, H = 178, gap = 5;                         // the part of the box that is used, and the least space between things
  let best = null;
  for (let cols = 1; cols <= n; cols++){
    const rows = Math.ceil(n / cols);
    const s = Math.min((W - gap * (cols - 1)) / (cols * b.w), (H - gap * (rows - 1)) / (rows * b.h));
    if (!best || s > best.s * 1.04) best = { s, cols, rows };
  }
  const s = Math.min(best.s, n <= 4 ? 0.6 : 0.52), rows = best.rows, cols = best.cols;
  // how many in each row: as even as it goes, the fuller rows first (5 in two columns: 2, 1, 2)
  let per = [];
  if (n === 5 && cols === 2) per = [2, 1, 2];
  else if (n === 7 && cols === 3) per = [2, 3, 2];
  else if (n === 3 && cols === 2) per = [1, 2];
  else { let left = n; for (let r = 0; r < rows; r++){ const k = Math.ceil(left / (rows - r)); per.push(k); left -= k; } }
  const cw = Math.min((W + gap) / cols, b.w * s * 1.3 + gap), ch = Math.min((H + gap) / rows, b.h * s * 1.3 + gap);
  const y0 = 95 - ch * (rows - 1) / 2;
  let i = 0;
  per.forEach((k, r) => {
    const x0 = 80 - cw * (k - 1) / 2;
    for (let j = 0; j < k; j++, i++){
      const c = document.createElementNS(NS, "g"), px = x0 + j * cw, py = y0 + r * ch;
      c.setAttribute("transform", `translate(${r2(px - (b.x + b.w / 2) * s)} ${r2(py - (b.y + b.h / 2) * s)}) scale(${r2(s * 1000) / 1000})`);
      c.appendChild(i === 0 ? first : drawOne()); g.appendChild(c);
    }
  });
  return g;
}

/* ---------- the parts of a body that are pictures of their own, in the figure's light (no outline: a lit tone, a shade tone on the side
   away from the light): the hand (fingers to count; the open hand with a thing on it), the bare foot ---------- */
const mix2 = (a, b, t) => "#" + [1, 3, 5].map(i => Math.round(parseInt(a.substr(i, 2), 16) * (1 - t) + parseInt(b.substr(i, 2), 16) * t).toString(16).padStart(2, "0")).join("");
const skinTones = S => [mix2(S[0], S[1], 0.62), mix2(S[1], S[2], 0.3)];        // the figure's skin: lit, shade
/* a form in two tones: the shape in its shade tone and, cut to it, the same shape in its lit tone moved toward the light (fx -1: for a
   picture that is mirrored afterwards) */
const twoTone = (d, M, e, fx) => { const id = "tt" + (seq++); return `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${M[1]}"/><g clip-path="url(#${id})"><path d="${d}" fill="${M[0]}" transform="translate(${r2(-0.6 * e * (fx || 1))} ${r2(-0.8 * e)})"/></g>`; };
const capD = (x0, y0, x1, y1, r) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = r2(-dy / L * r), ny = r2(dx / L * r);
  return `M${r2(x0 + nx)} ${r2(y0 + ny)}L${r2(x1 + nx)} ${r2(y1 + ny)}A${r} ${r} 0 0 0 ${r2(x1 - nx)} ${r2(y1 - ny)}L${r2(x0 - nx)} ${r2(y0 - ny)}A${r} ${r} 0 0 0 ${r2(x0 + nx)} ${r2(y0 + ny)}Z`; };
/* an open hand, the palm to the viewer, the fingers up, about (0 0) at the middle of the palm: o.n fingers held up (the others folded
   down on the palm; 5: the thumb out too; null: all four up and together, the thumb beside them: the hand as a thing), o.spread (the
   fingers apart, to be counted), o.cuff: the sleeve [lit, shade] at the wrist, o.fx -1: drawn for a mirrored picture */
function handArt(S, o){
  o = o || {}; const M = skinTones(S), all = o.n == null, n = all ? 4 : o.n, X = [-21.4, -7.2, 7.2, 21.4], LEN = [50, 60, 57, 44], fx = o.fx || 1, sp = o.spread ? 0.085 : 0.012; let s = "";
  if (o.cuff) s += twoTone(`M-21 40H21L26 78H-26Z`, o.cuff, 3, fx) + `<path d="M-21.6 44H21.6" stroke="${o.cuff[1]}" stroke-width="3.4" stroke-linecap="round"/>`;
  s += twoTone(all || n >= 5 ? capD(-24, 26, all ? -40 : -50, all ? -8 : -4, 7.6) : capD(-26, 24, -29, 4, 7.4), M, 2.4, fx);       // the thumb: out, or along the edge of the palm
  s += twoTone(`M-29 -4Q-30 -13 -20 -13H20Q30 -13 29 -4L25 34Q23 48 10 48H-10Q-23 48 -25 34Z`, M, 3.2, fx);
  X.forEach((x, i) => { const a = sp * (i - 1.5) * 2; if (i < n) s += twoTone(capD(x, -8, r2(x + Math.sin(a) * LEN[i]), r2(-8 - Math.cos(a) * LEN[i]), 6.9), M, 2.2, fx); });
  X.forEach((x, i) => { if (i >= n) s += twoTone(capD(x, -9, x, 5, 6.9), [mix2(M[0], M[1], 0.35), M[1]], 2, fx); });       // a finger folded down: its knuckle and first joint on the palm
  if (!all && n < 5) s += twoTone(capD(-24, 12, n >= 4 ? -8 : 6, 16, 6.6), M, 2, fx);      // ... and the thumb laid over the folded fingers
  return s + `<path d="M-14 20Q0 12 15 22" stroke="${M[1]}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".6"/>`;
}
/* PICS.fingers(n): a hand (two hands from 6) holding up n fingers, to 10 */
function fingers(n){
  n = Math.max(0, Math.min(10, n | 0));
  const cuff = ["#4a6b86", "#36536b"], one = (m, x, s, flip) => `<g transform="translate(${x} ${r2(112 - 6 * s)}) scale(${flip ? -s : s} ${s})">${handArt(SKIN.light, { n: m, spread: 1, cuff, fx: flip ? -1 : 1 })}</g>`;
  return mk(n <= 5 ? one(n, n === 5 ? 86 : 80, 1.42) : one(5, 46, 0.98) + one(n - 5, 116, 0.98, true));      // two hands as the learner sees their own: the left one with all five up, then the right one with the rest
}
function handPic(spec){ const k = lookOf(spec); return mk(`<ellipse cx="80" cy="181" rx="34" ry="4" fill="#1d2233" opacity=".1"/><g transform="translate(82 110) scale(1.3)">${handArt(skinOf(k), { cuff: COL.blue })}</g>`); }
const skinOf = k => SKIN[["fair", "light", "tan", "brown", "dark"].find(x => k.has(x)) || "light"];
/* a bare foot from the side, the toes to the right, the leg cut above the ankle */
function footPic(spec){
  const S = skinOf(lookOf(spec)), M = skinTones(S), toe = (x, y, r) => `M${r2(x - r)} ${y}a${r} ${r2(r * 0.9)} 0 1 0 ${2 * r} 0a${r} ${r2(r * 0.9)} 0 1 0 ${-2 * r} 0Z`;
  return mk(`<ellipse cx="84" cy="158" rx="68" ry="6" fill="#1d2233" opacity=".1"/>` + [[89, 117, 5.8], [99, 120, 6.4], [110, 123.5, 7.2], [123, 127, 8.4]].map(t => twoTone(toe(t[0], t[1], t[2]), M, 1.8)).join("") +
    twoTone(`M32 54Q45 50 58 54L60 96Q64 110 84 116Q110 122 131 126Q150 130 150 142Q150 155 134 156H42Q16 156 16 132Q16 112 28 100Q32 90 32 54Z`, M, 4.2) + twoTone(toe(140, 132, 11.6), M, 2.4) +
    `<ellipse cx="45" cy="54" rx="13" ry="3.6" fill="${M[1]}"/><ellipse cx="54" cy="102" rx="6.4" ry="5.4" fill="${M[1]}" opacity=".45"/><path d="M72 128Q90 139 114 137" stroke="${M[1]}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/><path d="M144 126q5 1.5 6 6" stroke="${mix2(M[0], "#ffffff", 0.6)}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`);
}
/* the head / the arm: the part in colour, in a soft light, on the person drawn pale (FIG.part). Looks: the skin (fair ... dark), "woman";
   the arm: "straight" (held out; the usual one is bent at the elbow) */
function partPic(part){ return spec => { const k = lookOf(spec), fem = k.has("woman", "girl") || spec.sex === "f", c = traits({ is: fem ? "woman" : "man" }); c.skin = skinOf(k); c.top = ["#eef1f4", "#d3d9e0"];
  c.hair = HAIR[k.has("dark") ? "black" : k.has("brown") ? "dkbrown" : k.has("tan") ? "brown" : "ltbrown"]; return FIG.part(c, part, { straight: k.has("straight"), legs: COL.charcoal }); }; }
/* a boy, a girl as things to be named (whole figures: the child's build of the figure); a colour look colours the jumper; other looks as on
   PICS.person (cap, backpack, glasses, short hair, scarf, ponytail ...). A baby: sitting on the floor in a romper (a colour look colours
   it; "hat": a bonnet) */
function kidPic(spec){
  const is = String(spec.is).toLowerCase() === "girl" ? "girl" : "boy", k = lookOf(spec), ps = { is, looks: (spec.looks || []).filter(x => !(TINT[String(x).toLowerCase().trim()] && (spec.looks || []).length < 3)) };
  if (k.cn && !k.has("jumper")) ps._top = k.cn;
  const F = figOf(ps); return FIG.act("stand", F.c, { still: true, legs: F.legs, smile: 0.7, kmax: 1.6 });
}
function babyPic(spec){
  const k = lookOf(spec), hatOn = k.has("hat", "bonnet"), P = hatOn && !k.has("romper") ? COL.sky : TINT[k.cn] || COL.sky, c = traits({ is: "boy", looks: hatOn ? ["cap"] : [] });
  Object.assign(c, { skin: SKIN.fair, hair: HAIR.ltbrown, style: "kcrew", top: P, cap: hatOn && k.cn ? k.cn : "yellow", iris: "#4b6f8f" });
  return FIG.act("sitfloor", c, { still: true, legs: P, heads: 3.3, smile: 0.9, kmax: 2.4 });
}

/* ---------- the things: drawn by things.js (window.THINGS, loaded after this file); here only the kinds that are people or parts of
   people, the picture card, the face card, and the pictures that PUT things somewhere ---------- */
const TINT = Object.assign({ black: ["#5a5b65", "#2c2d33"], cream: ["#fdf4da", "#ecdcae"], silver: ["#e3e6ea", "#a7adb6"], gold: ["#f2d268", "#c99c28"],
  wooden: ["#d3a56e", "#a67a48"], chocolate: ["#8c5834", "#5e381e"], ginger: ["#eb9d52", "#c4722c"], brick: ["#c66f50", "#9a4e36"], golden: ["#e9b85a", "#bd872a"] }, COL);
const tone = (hex, f) => "#" + [1, 3, 5].map(i => { const v = parseInt(hex.substr(i, 2), 16);
  return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))).toString(16).padStart(2, "0"); }).join("");
function lookOf(spec){
  const S = " " + (spec.looks || []).join(" ").toLowerCase().replace(/[^a-z'\- ]+/g, " ").replace(/\s+/g, " ").trim() + " ";
  return { S, cn: S.trim().split(" ").find(x => TINT[x]), has: (...w) => w.some(x => S.indexOf(" " + x + " ") >= 0) };
}
/* a picture card: a white card with the learner's figure doing spec.doing (any act of PICS.action; spec.sex "f": the woman), frozen: it
   tells which action to command. spec.moving: the same card with the action going on (the card lit in the naming of an action word: the
   app draws it so from the cue until the answer). A colour look colours its border. The figure on a moving card is the live figure (a
   node, not markup: its loop is drawn by the figure's clock).
   (figures 12; Jon, 16 Nov, Lesson 5 "Dis.": one card moving among still ones "is leading me", and the moving stand-up card had no
   arrow) a card in a row is always the frozen card with its arrow: spec.moving is ignored unless window.FIG_CARDS_MOVE is true (and
   then the moving card shows its arrow too) */
function cardArt(spec){
  spec = spec || {}; const k = lookOf(spec), u = "pc" + (seq++) + "_", w = firstWord(String(spec.doing || "").trim()), a = ACT_OF[w] || ACT2[w] || "smile", close = a === "smile" || a === "not smiling", face = !close && !!CLOSEFIG[a], s = close ? 0.9 : face ? 0.86 : 0.84;
  const g = mk(`<g transform="rotate(-3 80 95)"><rect x="15" y="14" width="136" height="170" rx="9" fill="#1d2233" opacity=".12"/><rect x="12" y="10" width="136" height="170" rx="9" fill="#fffdf8" stroke="${k.cn ? TINT[k.cn][1] : "#aeb5c0"}" stroke-width="${k.cn ? 6 : 2.4}"/>
    <clipPath id="${u}c"><rect x="14" y="12" width="132" height="166" rx="7"/></clipPath><g clip-path="url(#${u}c)"><g transform="translate(${r2(80 - 80 * s)} ${close ? r2(95 - 95 * s) : face ? r2(181 - 190 * s) : r2(172 - 186 * s)}) scale(${s})"></g></g></g>`);
  const moves = !!spec.moving && typeof window !== "undefined" && window.FIG_CARDS_MOVE === true;
  g.firstChild.lastChild.firstChild.appendChild(action(a, "you", { still: !moves, arrow: true, sex: spec.sex === "f" ? "f" : "m" }));
  return g;
}
/* --- helpers to put a thing somewhere at a size, whole or as a faint ghost in a dashed outline (it was there) --- */
function fitted(el, cx, yb, mw, mh, ghost, maxF){
  const b = measure(el), f = Math.min(mw / b.w, mh / b.h, maxF || 9), x = cx - (b.x + b.w / 2) * f, y = yb - (b.y + b.h) * f;
  const inner = `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(f * 1000) / 1000})">${el.outerHTML}</g>`;
  return { w: b.w * f, h: b.h * f, s: ghost ? `<g opacity=".3">${inner}</g><rect x="${r2(cx - b.w * f / 2 - 3)}" y="${r2(yb - b.h * f - 3)}" width="${r2(b.w * f + 6)}" height="${r2(b.h * f + 6)}" rx="12" fill="none" stroke="#7d848e" stroke-width="2" stroke-dasharray="5 5" opacity=".8"/>` : inner };
}
const bare = el => { el.querySelectorAll('ellipse[fill="#000"]').forEach(e => e.remove()); return el; };      // without its shadow on the ground
/* --- PICS.hand: an open hand seen from above, palm up, and what lies on it. The learner's own hand comes up from the bottom of the
   picture (their skin, the sleeve of their top); the teacher's comes down from the top (her navy sleeve): "I have" / "you have" differ at
   a glance. spec = {who: "you" | "marie", holding: {is, looks} | null, was: {is, looks} | null}: holding null: the empty hand; was: the
   empty hand and a faint ghost of the thing --- */
function handCard(spec, draw){
  spec = spec || {};
  const M = spec.who === "marie", F = figOf({ person: M ? "marie" : "you", sex: spec.sex }), e = spec.holding || spec.was; let t = "";
  if (e){ const el = bare((draw || oneThing)(Object.assign({}, e, { count: 1, placed: 1 }))), cy = M ? 76 : 114, hh = fitted(el, 80, 0, 78, 78, false, 0.66).h; t = fitted(el, 80, cy + hh / 2, 78, 78, !spec.holding, 0.66).s; }
  return mk(`<g${M ? ' transform="rotate(180 80 95)"' : ""}><g transform="translate(80 106) scale(1.34)">${handArt(F.c.skin, { n: 5, spread: 1, cuff: F.c.top, fx: M ? -1 : 1 })}</g></g>` + t);
}
/* --- a car seen from the front (for PICS.place: in front of the car is at its nose): windscreen, two headlights, grille, bumper --- */
function carFront(k){
  const P = TINT[["red", "black", "green", "blue", "yellow", "white"].find(c => k.has(c)) || "red"], M = [P[0], P[1]], G = ["#CBE6F0", "#98C1D6"], D = ["#4C5366", "#2C3142"];
  return `<ellipse cx="80" cy="153" rx="62" ry="6" fill="#1d2233" opacity=".12"/>` + twoTone(`M28 126h20v20q0 6-6 6h-8q-6 0-6-6Z`, D, 2) + twoTone(`M112 126h20v20q0 6-6 6h-8q-6 0-6-6Z`, D, 2) +
    twoTone(`M38 100L49 64Q52 55 62 55H98Q108 55 111 64L122 100Z`, M, 3.4) + twoTone(`M46 98L55 67Q56.5 62 62 62H98Q103.5 62 105 67L114 98Z`, G, 3) +
    twoTone(`M20 138V112Q20 100 34 98H126Q140 100 140 112V138Q140 143 135 143H25Q20 143 20 138Z`, M, 4.4) + `<rect x="56" y="107" width="48" height="17" rx="4" fill="${D[1]}"/><path d="M60 112.5H100M60 118.5H100" stroke="#838B99" stroke-width="1.6"/>` +
    [38, 122].map(x => `<circle cx="${x}" cy="115" r="9.5" fill="#C8911F"/><circle cx="${x - 1}" cy="114" r="8" fill="#FBF3C4"/><circle cx="${x - 2.5}" cy="112.5" r="3" fill="#ffffff"/>`).join("") + twoTone(`M21 129H139Q144 129 144 134.500Q144 140 139 140H21Q16 140 16 134.500Q16 129 21 129Z`, ["#D9DDE3", "#9AA2B0"], 2.4) + `<rect x="66" y="130.5" width="28" height="8" rx="1.5" fill="#FFFDF8"/>`;
}
/* --- PICS.place: one thing on / in / under / in front of / behind / next to a ground. on and under: the same table or chair, only the
   thing moves; in: an open box or bag; in front of / behind / next to: the same ground (a closed box, a house, a car seen from the front)
   in the same spot, the thing low and whole in front, higher and two thirds hidden behind (behind the house it looks out from behind the
   left wall), whole at the right with a clear gap next to it. spec.was: the thing a faint ghost. draw (optional): a function
   (entity) -> <g> for the thing, so that the app can pass its own pictures; the grounds are things.js's --- */
function placePic(spec, draw){
  spec = spec || {};
  const D = draw || oneThing, rel = String(spec.rel || "on").toLowerCase().replace(/[^a-z]+/g, " ").trim(), G = spec.ground || {}, gk = String(G.is || "table").toLowerCase().trim(), ghost = !!spec.was;
  const T = bare(D(Object.assign({}, spec.thing, { count: 1, placed: 1 }))), put = (cx, yb, mw, mh) => fitted(T, cx, yb, mw, mh, ghost, 0.8);
  const gl = lookOf({ looks: G.looks }), gc = gl.cn ? [gl.cn] : [], own = (kind, more, hook) => { const k = lookOf({ looks: gc.concat(more || []) }); Object.assign(k, hook); return (window.THINGS && THINGS.ground && THINGS.ground(kind, k)) || ""; };
  const lay = (cx, cy, s, inner) => `<g transform="translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})">${inner}</g>`;
  if (gk === "table" && (rel === "on" || rel === "under"))
    return mk(rel === "on" ? lay(80, 172, 0.9, own("table")) + put(80, 97, 86, 80).s : lay(80, 172, 0.9, own("table", [], { under: put(80, 161, 66, 44).s })));
  if (gk === "chair" && (rel === "on" || rel === "under"))
    return mk(rel === "on" ? own("chair") + put(82, 124, 64, 74).s : own("chair", [], { under: put(79, 178, 58, 37).s }));
  if (gk === "box" && rel === "in") return mk(lay(84, 170, 0.92, own("box", ["open"], { inside: put(82, 97 + Math.min(20, put(82, 0, 66, 76).h * 0.35), 66, 76).s })));
  if (gk === "box" && rel === "on") return mk(lay(84, 164, 0.8, own("box")) + put(84, 99, 76, 82).s);
  if (gk === "bag" && rel === "in") return mk(own("bag", [], { inside: put(80, 109 + Math.min(16, put(80, 0, 70, 96).h * 0.3), 70, 96).s }));
  const g = gk === "car" ? mk(carFront(gl)) : D(Object.assign({}, G, { count: 1 })), gb = measure(g), f = Math.min(96 / gb.w, 112 / gb.h, 1), gx = 56 - gb.w * f / 2, top = 150 - gb.h * f;
  const gs = `<g transform="translate(${r2(56 - (gb.x + gb.w / 2) * f)} ${r2(150 - (gb.y + gb.h) * f)}) scale(${r2(f * 1000) / 1000})">${g.outerHTML}</g>`, sh = (cx, y, w) => ghost ? "" : `<ellipse cx="${r2(cx)}" cy="${y}" rx="${r2(w * 0.42)}" ry="${r2(Math.max(3.4, w * 0.042))}" fill="#1d2233" opacity=".12"/>`;
  if (rel === "next to" || rel === "beside"){ const t = put(133, 147, 46, 78); return mk(gs + sh(133, 148, t.w) + t.s); }
  if (rel === "behind" || rel === "under"){
    if (gk === "house"){ const w = put(0, 0, 58, 62).w, cx = gx + gb.w * f * 0.19 + w * 0.07; return mk(`<g transform="translate(${r2(2 * cx)} 0) scale(-1 1)">${put(cx, 138, 58, 62).s}</g>` + gs); }
    const t = put(0, 0, 66, 66), hid = /^(cat|dog)$/.test(String(spec.thing && spec.thing.is).toLowerCase().trim()) ? 0.55 : 0.63;      // (an animal: its head and the line of its back look over the far edge)
    return mk(put(gk === "box" ? 62 : 56, top + t.h * hid, 66, 66).s + gs);
  }
  if (rel === "on") return mk(gs + put(56, top + 10, 80, top - 4).s);
  const t = put(56, 180, 62, 56); return mk(gs + sh(56, 181, t.w) + t.s);
}
/* --- PICS.going({who, to: {is, of}}): who walks toward a framed picture of the place at the right, a green arrow on the ground between
   them. PICS.at({who, place: {is, of}}): who stands in the place, which fills the box. who: "you" | "marie" | "paul" | "julie" | a person
   spec ({is: "man", looks: [...]}); the place: any place things.js draws (park, beach, garden, shop, station, kitchen, restaurant; "cafe":
   the restaurant; house ...); of: a name (somebody's house): on a plate under the picture --- */
const placeOf = p => { p = typeof p === "string" ? { is: p } : (p || {}); return [String(p.is || "house").toLowerCase().trim().replace(/^(the|a) /, "").replace(/^caf[eé]$/, "restaurant"), p.of]; };
function whoFig(who, act, sex, o){
  const s = typeof who === "string" ? { person: who, sex } : Object.assign({ sex }, who || { person: "you" }), named = s.person === "paul" || s.person === "julie" || s.person === "marie" || s.person === "you";
  return action(act, named ? s.person : "you", Object.assign({ still: true, looks: s.looks, name: s.name, sex: s.sex, spec: named ? null : { is: DEF_STYLE[s.is] ? s.is : "man" }, bare: true }, o));
}
const plate = of => { const nm = of ? String(of).replace(/[&<>]/g, "") : "", tw = Math.max(30, nm.length * 7.4 + 12); return nm ? `<rect x="${r2(80 - tw / 2)}" y="166" width="${r2(tw)}" height="19" rx="4" fill="#fffdf6" stroke="#b9ae98" stroke-width="1.5"/><text x="80" y="180" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="13" font-weight="700" fill="#2a2522">${nm}</text>` : ""; };
function goingPic(spec){
  spec = spec || {};
  const u = "pg" + (seq++) + "_", p = placeOf(spec.to), g = mk(`<clipPath id="${u}c"><rect width="160" height="190" rx="16"/></clipPath><g transform="translate(62 40) scale(.6)"><rect width="160" height="190" rx="16" fill="#fffdf8"/><g clip-path="url(#${u}c)">${oneThing({ is: p[0], looks: [] }).outerHTML}${plate(p[1])}</g><rect width="160" height="190" rx="16" fill="none" stroke="#aeb5c0" stroke-width="3"/></g>
    <path d="M26 183H58" stroke="#3fae5a" stroke-width="6" stroke-linecap="round"/><path d="M50 174.500L61 183L50 191.500" stroke="#3fae5a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  g.appendChild(whoFig(spec.who, "walk", spec.sex, { k: 0.62, ox: -48, y: 170 }));
  return g;
}
function atPic(spec){
  spec = spec || {};
  const p = placeOf(spec.place), g = mk(oneThing({ is: p[0], looks: [] }).outerHTML + plate(p[1]));
  g.appendChild(whoFig(spec.who, "stop", spec.sex, { k: 0.7, ox: -42, y: 178 }));
  return g;
}
/* "big" and "small" on the kinds drawn here: the same picture at two sizes, standing on the same line (things.js sizes its own kinds) */
const SMALL = { boy: 0.62, girl: 0.62 };       // how small "small" is (0.55 of big unless said here)
function sized(el, big, is){
  const b = measure(el), f = Math.min(150 / b.w, 168 / b.h, 1.3) * (big ? 1 : SMALL[is] || 0.55), g = mk(""), o = mk("");
  g.setAttribute("transform", `translate(${r2(80 - (b.x + b.w / 2) * f)} ${r2(180 - (b.y + b.h) * f)}) scale(${r2(f * 1000) / 1000})`);
  g.appendChild(el); o.appendChild(g);
  return o;
}
const OWN = { boy: kidPic, girl: kidPic, baby: babyPic, foot: footPic, hand: handPic, head: partPic("head"), arm: partPic("arm"), face: feelFace, "picture card": cardArt, card: cardArt };
function oneThing(spec){
  spec = spec || {};
  const is = String(spec.is || "").toLowerCase().trim();
  if ((spec.looks || []).some(x => String(x).toLowerCase() === "in an open box"))      // what is found in an open box ('Oh ! Un téléphone !')
    return placePic({ thing: { is: spec.is, looks: (spec.looks || []).filter(x => String(x).toLowerCase() !== "in an open box") }, rel: "in", ground: { is: "box", looks: ["red"] } });
  { const T = window.THINGS && THINGS.one, ls = (spec.looks || []).map(x => String(x).trim()), sz = ls.find(x => /^(big|small)$/i.test(x)); let t = T && T(spec); if (t) return t;      // things.js: every thing that is not a person
    if (T && sz && (t = T(Object.assign({}, spec, { looks: ls.filter(x => x !== sz) })))) return sized(t, /^big$/i.test(sz), is); }      // (a size things.js has no picture of its own for, the big door: the same picture at that size)
  const f = OWN[is];
  if (!f) return mk("");
  const sizable = is !== "face" && is !== "picture card" && is !== "card", k = lookOf(spec), size = !sizable ? 0 : k.has("big") ? 1 : k.has("small") ? -1 : 0;
  const el = f(size ? Object.assign({}, spec, { looks: (spec.looks || []).filter(x => !/^(big|small)$/i.test(String(x).trim())) }) : spec);
  return size ? sized(el, size > 0, is) : el;
}
function thing(spec){
  spec = spec || {};
  const n = spec.count || 1;
  return n > 1 ? group(n, () => oneThing(spec)) : oneThing(spec);
}
const kindPic = is => spec => thing(Object.assign({}, spec, { is }));      // PICS.key, PICS.dog, PICS.car: the things' own pictures, by name

/* ---------- the learner and the teacher side by side, doing the same thing in step (the loops share the clock of the picture) ---------- */
function together(act, opts){
  opts = opts || {};
  const w = firstWord(String(act || "").trim()), a = ACT_OF[w] || ACT2[w] || "smile", close = a === "smile" || a === "not smiling", face = !close && !!CLOSEFIG[a], s = close ? 0.5 : face ? 0.66 : 0.62, g = mk("");
  if (a === "swim") return action(act, "you", Object.assign({}, opts, { buddy: "marie" }));      // (figures 15) the two of them in one pool, side by side in two lanes (the learner near, Marie in the far lane)
  if (a === "go out"){                                      // one house, the two of them going out of it one behind the other
    g.appendChild(action(act, "you", Object.assign({}, opts, { ox: -12 }))); g.appendChild(action(act, "marie", Object.assign({}, opts, { ox: 12, bare: true })));
    return g; }
  ["you", "marie"].forEach((who, i) => {
    const c = mk("");
    c.setAttribute("transform", close || a === "work" ? `translate(${i ? 80 : 0} 47.5) scale(.5)`      // the smile fills its picture when it closes in, a desk is wide: the two side by side, not overlapping
      : `translate(${r2((i ? 120 : 40) + (face ? (i ? -1 : 1) : 0) - 80 * s)} ${r2(face ? 190 - 190 * s : 108 - 110 * s)}) scale(${s})`);
    c.appendChild(action(act, who, face || close ? Object.assign({}, opts, { box: false }) : a === "dance" && i ? Object.assign({}, opts, { bare: true }) : opts)); g.appendChild(c);
  });
  if (!(face || close)) return g;      // (figures 12) two close-ups: clipped together to the one card (160 x 190, the cards' rounded corners)
  const cid = "ct" + (seq++), box = mk(`<clipPath id="${cid}"><rect width="160" height="190" rx="16"/></clipPath><g clip-path="url(#${cid})"></g>`); box.lastChild.appendChild(g); return box;
}
/* ---------- PICS.handOver(spec): one person hands a thing to another (voilà / merci; donner) ----------
   spec = { from, to, thing: {is, looks}, phase, still, w, names: {you: "the learner's name"}, once, mirror }
     from, to   "marie" | "paul" | "julie" | "you" | a person spec ({person: "paul"}, {is: "man" | "woman" | "boy" | "girl", looks: [...]})
     thing      any kind PICS.thing draws; a thing nobody carries (a house, a train, a horse ...) is handed as a picture card of it
     mirror     (figures 15) true: the same hand-over the other way round: the giver on the right, the taker on the left (names and the
                thing still read the right way)
     w          340 (default: the box of two cards side by side, x 30-370 of the stage: the two from the thighs up, large) | 160 (one card: both whole)
     still      the card: one frame, both hands on the thing, a green arc from the giver to the taker; phase 0..1: that frame (no arc)
     once       (.72) one hand-over, then the end state held (the taker holding the thing): what the lesson's page asks for
   The giver stands on the left facing right, the taker on the right facing left (the thing travels left to right; with mirror, right to left); Marie, Pierre and
   Sylvie wear their name tags, "you" the learner's name when spec.names.you is given, an unnamed man or woman none. Moving: one hand-over
   in FIG.HO.dur seconds (2.6 s: held 0.2 s, out and taken by 1.2 s, brought in by 2.1 s, held, a fade, and again); the page's wait for a
   whole loop is that loop (actLoopMs reads it). */
const HO_CARRY = /^(house|train|car|town|restaurant|bus|door|street|horse|mountain|sea|shop|table|chair|tree|bicycle|motorbike|plane|window|park|beach|garden|station|kitchen|metro|weather|dog|cat|face|baby|boy|girl)$/;
const HO_SIZE = { key: 0.1, pen: 0.13, phone: 0.12, apple: 0.1, tomato: 0.1, banana: 0.14, letter: 0.15, heart: 0.12, photo: 0.15, leaf: 0.13, flower: 0.18, glass: 0.12, coffee: 0.12, ball: 0.13, shoe: 0.15,
  box: 0.2, computer: 0.22, radio: 0.18, bag: 0.2, cake: 0.17, pizza: 0.2, bread: 0.2, bottle: 0.19, hat: 0.18, shirt: 0.22, dress: 0.25, trousers: 0.25, newspaper: 0.18, plate: 0.17, soup: 0.16, cheese: 0.15, lamp: 0.2, fish: 0.17, flag: 0.2, book: 0.17 };
function heldThing(spec, whole){                           // whole: held up to be shown (PICS.person holding): nothing is turned into a picture card
  spec = Object.assign({}, spec || { is: "book" }, { count: 1, placed: 1 }); const is = String(spec.is || "").toLowerCase();
  if (is === "book" && !whole && !(spec.looks || []).some(l => /open|thin|thick/.test(l))) spec.looks = (spec.looks || []).concat(["thin"]);      // (figures 16) a book handed over stands, its front board to us (things.js "thin"): held square, by its edges
  let el = oneThing(spec), size = HO_SIZE[is] || 0.17;
  el.querySelectorAll('ellipse[fill="#000"]').forEach(e => e.remove());
  el.querySelectorAll("ellipse").forEach(e => { const f = e.getAttribute("fill") || "", ry = +e.getAttribute("ry") || 0, cy = +e.getAttribute("cy") || 0; if (/^url\(/.test(f) && ry < 16 && cy > 120) e.remove(); });      // its shadow on the ground
  if (HO_CARRY.test(is) && !whole){                         // nobody hands over a house: a picture card of it
    const b = measure(el), f = Math.min(104 / b.w, 120 / b.h);
    el = mk(`<rect x="22" y="20" width="116" height="150" rx="10" fill="#cbbfa8"/><rect x="20" y="17" width="116" height="150" rx="10" fill="#fffdf8" stroke="#b9ae98" stroke-width="3"/><g transform="translate(${r2(78 - (b.x + b.w / 2) * f)} ${r2(92 - (b.y + b.h / 2) * f)}) scale(${r2(f * 1000) / 1000})">${el.outerHTML}</g>`); size = 0.21; }
  const b = measure(el), pl = el.querySelector('rect[fill="#9AA1AC"]');      // (figures 16) a flag's pole: the hands hold it there
  return { html: el.innerHTML, box: [b.x, b.y, b.w, b.h], size: size * 1.3, pole: pl && !HO_CARRY.test(is) ? +pl.getAttribute("x") + (+pl.getAttribute("width") || 0) / 2 : null };       // a little larger than life: it must read at phone size
}
function handOverPic(spec){
  spec = spec || {};
  const one = w => { const sp = typeof w === "string" ? { person: w } : Object.assign({}, w || { person: "you" }), who = sp.person;
    if (who === "you" && !sp.sex && spec.sex) sp.sex = spec.sex;
    const F = figOf(sp), tag = who === "you" ? (spec.names && spec.names.you || "") : who ? (spec.names && spec.names[who]) || WHO_NAME[who] || "" : "";
    return { c: F.c, lg: F.legs, tag }; };
  const A = one(spec.from || "marie"), B = one(spec.to || "you"), w = spec.w === 160 ? 160 : 340;
  return FIG.handOver(A.c, B.c, { w, legsA: A.lg, legsB: B.lg, tagA: A.tag, tagB: B.tag, thing: heldThing(spec.thing), still: !!spec.still, phase: spec.phase, once: !!spec.once, mirror: !!spec.mirror });
}
/* PICS.setLearner(spec): the learner's own figure (the spec of the avatar maker: an object, or the string PICS.avatarString gives; null:
   the usual learner again). From then on every picture of "you" is that person. PICS.learner(): the spec now set, or null */
function setLearner(spec){ LEARNER = spec ? (typeof spec === "string" ? FIG.specParse(spec) : Object.assign({}, spec)) : null; return LEARNER; }
/* PICS.portrait(who, name): Pierre ("paul"), Sylvie ("julie") or Marie, head and shoulders in the 160 x 190 box, on the figure (drawn at
   5.6 heads: an adult's shoulders against the head), with the name tag where the stage expects it (class nametag: x 80 - w/2, y 146, w 50
   or 56 for Sylvie, h 24).
   PICS.learnerCard(name, sex): the learner's own card: the learner's figure (the one made in the avatar maker when PICS.setLearner has been
   given it, else the usual learner, a man or with sex "f" a woman) with the name on the tag; a long name goes on two lines, as the stage's
   own card did (the tag's size is left on the picture as g.tagBox = {w, h}, and given to the stage's LEARNER_TAG when it is there) */
function portraitPic(who, name){ who = who === "julie" || who === "marie" ? who : "paul"; return bustPic({ person: who }, name || WHO_NAME[who]); }
function learnerCardPic(name, sex){ name = String(name || ""); const c = figOf({ person: "you", sex: sex === "f" ? "f" : "m" }).c;
  let cv = learnerCardPic.cv; const width = t => { try { cv = cv || (learnerCardPic.cv = document.createElement("canvas").getContext("2d")); cv.font = '700 14px "Atkinson Hyperlegible Next",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif'; return cv.measureText(t).width; } catch (e){ return t.length * 8.4; } };
  const MAXT = 136; let lines = [name];
  if (width(name) > MAXT){ const cuts = [...name.matchAll(/[ -]/g)].map(m => m.index); if (cuts.length){ const q = cuts.reduce((a, b) => Math.abs(b - name.length / 2) < Math.abs(a - name.length / 2) ? b : a); lines = [name.slice(0, name[q] === "-" ? q + 1 : q), name.slice(q + 1)]; } }
  const tws = lines.map(width), w = Math.max(50, Math.min(MAXT + 12, Math.max(...tws) + 14)), h = lines.length > 1 ? 40 : 24;
  const g = boxed(FIG.bust(c, { head: 82, cy: 80, yaw: -6, heads: 5.6 })); g.appendChild(mk(flatTag(lines, w, h, tws, MAXT)).firstChild); g.tagBox = { w, h };
  try { if (typeof LEARNER_TAG === "object" && LEARNER_TAG){ LEARNER_TAG.w = w; LEARNER_TAG.h = h; } } catch (e){}
  return g; }

/* ---------- (figures 13) the ceremonies' two films (dev/design/RANKUP.md 5 and 7; the shell calls them through guarded hooks) ----------
   PICS.highFive({you, wear, marie}): Marie and the learner give each other a high five (320 x 200; data-contact, data-dur, data-hand).
   PICS.putOn(spec, {wear, item}): the learner puts on what they have just bought (160 x 190, standing; data-dur, data-on); null for a pose
   or a dance. Both are SMIL alone (the shell puts their markup in its page) and play once, the last frame held. */
function highFivePic(o){ o = o || {}; const M = figOf({ person: "marie" });
  return FIG.highFive(M.c, o.you || null, o.wear || [], { legsM: M.legs, tagM: WHO_NAME.marie || "Marie" }); }
function putOnPic(spec, o){ o = o || {}; return FIG.putOn(spec || null, o.wear || [], o.item); }
/* the teacher on the stage (see FIG.tutor): Marie as the course knows her (her skin, her brown hair to the shoulder, her navy) */
function tutorFig(opts){ const c = traits({ person: "marie" }); c.top = [tone("#2E4A6B", 0.14), tone("#2E4A6B", -0.2)]; c.style = "tucked"; return FIG.tutor(c, Object.assign({ legs: ["#77614f", "#5a4738"] }, opts)); }
window.PICS = { _fig: FIG, _thingsHook: true, _thingsDogKey: true, tutor: tutorFig, portrait: portraitPic, learnerCard: learnerCardPic, setLearner, learner: () => LEARNER, avatar: FIG.avatar, wardrobeThumb: FIG.wardrobeThumb, wardrobe: FIG.WARD, avatarString: FIG.specString, avatarParse: FIG.specParse, avatarOptions: FIG.AV, person, key: kindPic("key"), group, fingers, dog: kindPic("dog"), car: kindPic("car"), action, thing, together, place: placePic, going: goingPic, at: atPic, hand: handCard, handOver: handOverPic, highFive: highFivePic, putOn: putOnPic,
  things: ["cake", "pizza", "coffee", "glass", "banana", "plate", "bus", "table", "chair", "bag", "box", "house", "door", "window", "cat", "tree", "bicycle", "horse", "face", "french flag", "picture card", "newspaper", "letter", "weather",
    "ball", "hat", "phone", "bread", "flower", "lamp", "shirt", "trousers", "dress", "fish", "cheese", "tomato", "plane", "motorbike", "baby", "heart", "foot", "hand", "head", "town", "street", "restaurant", "photo", "metro", "sea", "mountain", "leaf", "arm",
    "train", "park", "beach", "garden", "shop", "station", "kitchen"] };
})();
