/* people.js: pictures for Lessons 5-10 of Faultless French. Plain JavaScript, no dependencies. Defines window.PICS:

     PICS.person(spec, name)   a person, drawn in the app's 160 x 190 picture box, returned as an SVG <g>
        spec.person  "paul" | "julie"          Pierre or Sylvie (the same faces as portrait() in index.html) with a name
                                               tag that shows `name`
        spec.is      "man" | "woman" | "boy" | "girl"     somebody else: no name tag
        spec.doing   "eating" | "sleeping"     (optional)
        spec.looks   [ ... ]                   clothes, things carried, hair (see LOOKS below)
        spec.count   2-5 with the look "in a row": that many people standing side by side, to be counted
     PICS.key(spec)            a door key; looks gold / silver / red / black, old, big, small, plastic, on a ring;
                               spec.count > 1 gives that many keys laid out to be counted
     PICS.group(n, drawOne)    n copies of the <g> that drawOne() returns, laid out in the box so they can be counted
     PICS.fingers(n)           a hand (two hands from 6) holding up n fingers (to 10), in the style of fingerCard()
     PICS.dog(spec)            a dog: looks grey / golden / brown / black / white / spotted, puppy, big, small, running,
                               sitting, lying down; spec.doing "sleeping" | "eating"; spec.count > 1 lays several out
     PICS.action(act, who, opts)   an action shown in a loop: act "dance" | "jump" | "smile" | "stand up" | "sit down" | "walk";
                               who "you" (the learner: a neutral adult, no name tag) | "marie" (the teacher) | "paul" | "julie";
                               opts.still = true: one frozen frame; opts.name: the text of the name tag; opts.looks: as for a person.
                               PICS.person({person: "paul" | "julie", doing: "dancing" | "jumping" | "smiling" | "standing up" |
                               "sitting down" | "walking"}) gives the same (spec.still = true for the frozen frame)
     PICS.car(spec)            a car: looks red / black / green / blue, old, sports, small; spec.count > 1 lays several out
        (for a person, spec.doing may also be "drinking": a glass of water at the mouth, or "walking": a whole figure
        in mid-stride; looks may be written "in a coat", "with a hat", "wearing glasses")

   Nothing is random: the same spec always gives the same picture. Every gradient and clip path has its own id, so the
   same picture can be on the screen several times. No written words, except the name tags and the "z z Z" of sleep. */
(function(){
"use strict";
const NS = "http://www.w3.org/2000/svg";
let seq = 0;
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
const WARM = { red: 1, julieRed: 1, orange: 1, pink: 1 };       // a red apple would not show against these: green apple

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
function lookName(x){
  let t = String(x).toLowerCase().trim().replace(/^(wearing|with|in)\s+/, "").replace(/^(a|an)\s+/, "");
  if (String(x).toLowerCase().trim() === "on a bicycle") t = "bicycle";
  return SAME[t] || t;
}
const doingOf = spec => String(spec && spec.doing || "").toLowerCase().split(/[ ,]/)[0];
function traits(spec, variant){
  const looks = (spec.looks || []).map(lookName).filter(x => x !== "in a row" && x !== "a row"), L = {}; looks.forEach(x => L[x] = 1);
  let c;
  if (spec.person === "marie" || spec.person === "you"){
    const M = spec.person === "marie";                     // Marie: the tutor of index.html (her skin, hair and jumper); you: a neutral adult
    c = { named: spec.person, kind: M ? "woman" : "man", skin: M ? ["#f3cfae", "#e8b892", "#cf9873"] : SKIN.tan, hair: M ? ["#5c4132", "#4a3326", "#3a271c"] : HAIR.jet,
      top: M ? ["#4a6b86", "#36536b"] : COL.green, topName: M ? "slate" : "green", iris: M ? "#5e3f27" : "#4a3524", style: M ? "marie" : "you", beard: false,
      brow: M ? "#4a3326" : "#2a2422", lip: M ? "#c4626a" : "#bf6660", cap: "orange", hat: "felt", band: "#2b2b30", pack: "orange", umb: "yellow", scarf: "mustard",
      coat: "camel", suit: "charcoal", tie: null, glasses: "#26262b", round: false, bag: "mustard" };
  } else if (spec.person){
    const P = spec.person !== "julie";
    c = { named: P ? "paul" : "julie", kind: P ? "man" : "woman", skin: SKIN[P ? "paul" : "julie"], hair: HAIR[P ? "brown" : "black"],
      top: P ? COL.blue : COL.julieRed, topName: P ? "blue" : "julieRed", iris: P ? "#4b6f8f" : "#5a3a22", style: P ? "paul" : "julie", beard: P,
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
  if (L["red jumper"] || L["red dress"]){ c.top = COL.red; c.topName = "red"; }
  if (L["green jumper"]){ c.top = COL.green; c.topName = "green"; }
  if (L.jumper){ c.top = COL.mustard; c.topName = "mustard"; }
  c.jumper = !!(L["red jumper"] || L["green jumper"] || L.jumper);
  if (L.raincoat){ L.coat = 1; c.coat = "yellow"; c.hood = true; }
  if (L.sunglasses){ L.glasses = 1; c.shades = true; c.glasses = "#17181c"; }
  c.L = L; c.kid = kid; c.fem = fem;
  return c;
}

/* ---------- parts of a face ---------- */
function eye(u, cx, cy, o){
  let s;
  if (o.closed){
    s = `<path d="M${cx - 7} ${cy + 0.4} Q${cx} ${cy + 6.2} ${cx + 7} ${cy + 0.4}" stroke="#2a1c15" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M${cx - 4.8} ${cy + 3.6} l-1.3 2.5 M${cx} ${cy + 4.6} v2.8 M${cx + 4.8} ${cy + 3.6} l1.3 2.5" stroke="#2a1c15" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
  } else {
    s = `<path d="M${cx - 7} ${cy} Q${cx} ${cy - 6.4} ${cx + 7} ${cy - 0.4} Q${cx} ${cy + 5} ${cx - 7} ${cy} Z" fill="#fbf7f1"/>
      <clipPath id="${u}e${cx}"><path d="M${cx - 7} ${cy} Q${cx} ${cy - 6.4} ${cx + 7} ${cy - 0.4} Q${cx} ${cy + 5} ${cx - 7} ${cy} Z"/></clipPath>
      <g clip-path="url(#${u}e${cx})"><circle cx="${cx}" cy="${cy - 0.4}" r="3.5" fill="${o.iris}"/><circle cx="${cx}" cy="${cy - 0.4}" r="1.5" fill="#120d0a"/><circle cx="${cx + 1.1}" cy="${cy - 1.6}" r="0.85" fill="#fff"/></g>
      <path d="M${cx - 7.4} ${cy} Q${cx} ${cy - 6.8} ${cx + 7.4} ${cy - 0.5}" stroke="#2a1c15" stroke-width="${o.lash ? 1.9 : 1.4}" fill="none" stroke-linecap="round"/>
      <path d="M${cx - 5.5} ${cy + 3.2} Q${cx} ${cy + 5.6} ${cx + 5.5} ${cy + 3}" stroke="${o.shade}" stroke-width="0.9" fill="none" opacity=".7"/>` +
      (o.lash ? `<path d="M${cx + o.lash * 7.2} ${cy - 0.6} l${o.lash * 3} -2.2 M${cx + o.lash * 5.4} ${cy - 2.6} l${o.lash * 2.4} -2.6" stroke="#2a1c15" stroke-width="1.1" fill="none" stroke-linecap="round"/>` : "");
  }
  if (o.half && !o.closed) s += `<path d="M${cx - 7.6} ${cy + 0.2} Q${cx} ${cy - 7.4} ${cx + 7.6} ${cy - 0.3} Q${cx} ${cy - 2.6} ${cx - 7.6} ${cy + 0.2} Z" fill="${o.half}"/>
      <path d="M${cx - 7.4} ${cy + 0.2} Q${cx} ${cy - 2.6} ${cx + 7.4} ${cy - 0.3}" stroke="#2a1c15" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  return o.s && o.s !== 1 ? `<g transform="translate(${cx} ${cy}) scale(${o.s}) translate(${-cx} ${-cy})">${s}</g>` : `<g>${s}</g>`;
}
const zed = (x, y, s) => `<path d="M${x} ${y} h${s} l${-s} ${s} h${s}" fill="none" stroke="#fff" stroke-width="${r2(s * 0.3 + 3)}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M${x} ${y} h${s} l${-s} ${s} h${s}" fill="none" stroke="#3b55b3" stroke-width="${r2(s * 0.3)}" stroke-linecap="round" stroke-linejoin="round"/>`;

/* ---------- hair: {back (behind the body), front (on the head), over (in front of the shoulders)} ---------- */
function hairOf(style, u, c){
  const H = `url(#${u}h)`, hl = c.hair[0], bow = c.bow || "#e8548a";
  const circles = a => a.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fill="${H}"/>`).join("");
  const strand = d => `<path d="${d}" stroke="${hl}" stroke-width="1.1" fill="none" opacity=".55"/>`;
  switch (style){
    case "paul": return { front: `<path d="M47 84 q-2-40 33-42 q35 2 33 42 q-4-14-12-20 q-12 4-24 2 q-12-2-18-6 q-8 8-12 24z" fill="${H}"/>
         <path d="M58 54 q8-6 22-6 M64 50 q10-4 22 0 M72 47 q10-2 20 2" stroke="#8c6545" stroke-width="1.1" fill="none" opacity=".6"/>` };
    case "marie": { const T = `transform="translate(80 48) scale(.744) translate(-200 -302)"`;   // the tutor's own hair paths, at the size of these heads
      return { back: `<path ${T} d="M153 352 q-3-58 47-60 q50 2 47 60 q2 36-5 58 q-10 4-20 0 h-44 q-10 4-20 0 q-7-22-5-58z" fill="${H}"/>`,
        front: `<path ${T} d="M156 354 q-2-58 44-60 q46 2 44 60 q-4-26-16-38 q-14-6-30-3 q-10 4-22 3 q-6 4-10 12 q-6 10-10 26z" fill="${H}"/>
          <path ${T} d="M188 297 q-14 8-22 26 M190 302 q-12 10-17 22 M214 299 q12 8 18 26 M222 302 q10 10 13 24" stroke="#6b4b39" stroke-width="1.6" fill="none" opacity=".5" stroke-linecap="round"/>` }; }
    case "you": return { back: `<path d="M44.5 92 Q40 39 80 36.5 Q120 39 115.5 92 Q117 104 111.5 113 L103 102 H57 L48.5 113 Q43 104 44.5 92Z" fill="${H}"/>`,
      front: `<path d="M47 86 q-3-45 33-47 q36 2 33 47 q-3-14-9-21 q-10 6-24 4 q-14-1-24-8 q-6 9-9 25z" fill="${H}"/>` + strand("M60 53 q12-8 28-6 M68 48 q10-3 20 1") };
    case "julie": return { back: `<path d="M40 98 q-2-64 40-66 q42 2 40 66 q2 50-8 78 q-32 8-64 0 q-10-28-8-78z" fill="${H}"/>`,
      front: `<path d="M47 90 q-3-46 33-48 q36 2 33 48 q-6-22-18-30 q-12 8-34 6 q-8 6-10 12 q-2 4-4 12z" fill="${H}"/>
         <path d="M78 44 q-14 6-22 24 M86 45 q12 8 18 26" stroke="#4a372d" stroke-width="1.1" fill="none" opacity=".6"/>` };
    /* men */
    case "sidepart": return { front: `<path d="M47 84 q-3-43 33-45 q36 2 33 45 q-3-13-9-20 q-20 6-38-2 q-5-2-8-6 q-8 9-11 28z" fill="${H}"/>` + strand("M60 52 q12-8 30-5 M66 47 q10-4 24 0") };
    case "crew": return { front: `<path d="M48 82 Q46 44 80 43 Q114 44 112 82 Q109 66 100 60 Q80 54 60 60 Q51 66 48 82 Z" fill="${H}"/>` };
    case "curly": return { front: `<path d="M47 84 Q45 44 80 42 Q115 44 113 84 Q108 66 98 61 Q80 56 62 61 Q52 66 47 84Z" fill="${H}"/>` +
      circles([[50, 72, 7], [52, 60, 8.5], [59, 50, 9], [69, 43.5, 9.5], [80, 41, 9.5], [91, 43.5, 9.5], [101, 50, 9], [108, 60, 8.5], [110, 72, 7], [64, 57, 7], [76, 54, 7], [88, 54, 7], [97, 58, 6.5]]) };
    case "old": return { front: `<path d="M47 88 q-3-42 33-45 q36 3 33 45 q-2-13-7-20 q-5-9-26-11 q-21 2-26 11 q-5 7-7 20z" fill="${H}" stroke="#8f8f89" stroke-width="1.2"/>` };
    case "bald": return { front: `<path d="M48.6 84 Q46.5 43.5 80 42.5 Q113.5 43.5 111.4 84 Z" fill="url(#${u}s)"/>
        <path d="M48.4 88 q-1.2-14 3-25 q0.6 12 0.4 22z M111.6 88 q1.2-14 -3-25 q-0.6 12 -0.4 22z" fill="${c.hair[1]}" opacity=".55"/>
        <ellipse cx="68" cy="56" rx="11" ry="5.5" fill="#fff" opacity=".28" transform="rotate(-18 68 56)"/>` };
    case "longM": return { back: `<path d="M42 98 Q38 36 80 34 Q122 36 118 98 Q121 118 116 136 L44 136 Q39 118 42 98Z" fill="${H}"/>`,
      front: `<path d="M47 92 q-4-49 33-51 q37 2 33 51 q-3-22-12-32 q-10-9-21-11 q-11 2-21 11 q-9 10-12 32z" fill="${H}"/>` + strand("M78 44 q-14 6-21 24 M82 44 q14 6 21 24") };
    /* women */
    case "long": return { back: `<path d="M40 98 q-2-64 40-66 q42 2 40 66 q2 50-8 78 q-32 8-64 0 q-10-28-8-78z" fill="${H}"/>`,
      front: `<path d="M47 92 q-4-49 33-51 q37 2 33 51 q-3-22-12-32 q-10-9-21-11 q-11 2-21 11 q-9 10-12 32z" fill="${H}"/>` + strand("M78 44 q-14 6-21 24 M82 44 q14 6 21 24") };
    case "wavy": return { back: `<path d="M41 96 Q36 34 80 32 Q124 34 119 96 Q125 108 119 120 Q125 132 117 141 Q108 146 104 136 L56 136 Q52 146 43 141 Q35 132 41 120 Q35 108 41 96Z" fill="${H}"/>`,
      front: `<path d="M47 92 q-4-49 33-51 q37 2 33 51 q-2-20-10-30 q-16 2-30-10 q-14 8-19 18 q-5 9-7 22z" fill="${H}"/>` + strand("M74 46 q-12 6-18 22 M84 45 q12 8 18 22") };
    case "bun": return { back: `<circle cx="80" cy="33" r="14" fill="${H}"/>`,
      front: `<path d="M48 84 q-3-40 32-42 q35 2 32 42 q-5-20-14-27 q-18-7-36 0 q-9 7-14 27z" fill="${H}"/>` + strand("M62 56 q8-8 18-9 M98 56 q-8-8-18-9") };
    case "bob": return { back: `<path d="M43 96 Q40 36 80 34 Q120 36 117 96 Q118 110 112 119 Q105 122 103 113 L57 113 Q55 122 48 119 Q42 110 43 96Z" fill="${H}"/>`,
      front: `<path d="M48 86 q-3-44 32-46 q35 2 32 46 q-3-14-9-22 q-14 8-30 6 q-10 0-16-6 q-6 8-9 22z" fill="${H}"/>` + strand("M62 52 q10-7 26-5") };
    case "pony": return { back: `<path d="M102 48 Q128 42 135 68 Q140 98 128 128 Q121 134 115 127 Q123 100 119 80 Q115 64 100 60 Z" fill="${H}"/>`,
      front: `<path d="M48 84 q-3-40 32-42 q35 2 32 42 q-5-20-14-27 q-18-7-36 0 q-9 7-14 27z" fill="${H}"/><circle cx="107" cy="53" r="5.5" fill="${bow}"/>` + strand("M62 56 q8-8 18-9 M98 56 q-8-8-18-9") };
    case "pig": return { back: `<path d="M48 80 Q28 74 22 92 Q18 112 26 132 Q34 138 40 130 Q38 108 50 94 Z M112 80 Q132 74 138 92 Q142 112 134 132 Q126 138 120 130 Q122 108 110 94 Z" fill="${H}"/>`,
      front: `<path d="M47 92 q-4-49 33-51 q37 2 33 51 q-3-22-12-32 q-10-9-21-11 q-11 2-21 11 q-9 10-12 32z" fill="${H}"/><circle cx="47" cy="86" r="5" fill="${bow}"/><circle cx="113" cy="86" r="5" fill="${bow}"/>` };
    case "xlong": return { back: `<path d="M37 100 q-2-68 43-70 q45 2 43 70 q2 46-4 90 h-78 q-6-44-4-90z" fill="${H}"/>`,
      front: `<path d="M47 92 q-4-49 33-51 q37 2 33 51 q-3-22-12-32 q-10-9-21-11 q-11 2-21 11 q-9 10-12 32z" fill="${H}"/>` + strand("M78 44 q-14 6-21 24 M82 44 q14 6 21 24"),
      over: `<path d="M40 100 q-5 38 2 80 q9 5 17-1 q-5-36-2-66 q-6-10-17-13z M120 100 q5 38-2 80 q-9 5-17-1 q5-36 2-66 q6-10 17-13z" fill="${H}"/>` };
    case "curlyF": return { back: `<ellipse cx="80" cy="78" rx="40" ry="42" fill="${H}"/>` +
        circles([[46, 104, 13], [40, 86, 13], [41, 67, 13], [49, 50, 13], [63, 39, 13], [80, 35, 13], [97, 39, 13], [111, 50, 13], [119, 67, 13], [120, 86, 13], [114, 104, 13], [52, 118, 11], [108, 118, 11]]),
      front: circles([[52, 70, 7.5], [58, 59, 8.5], [69, 53, 9], [80, 51, 9], [91, 53, 9], [102, 59, 8.5], [108, 70, 7.5]]) };
    /* children (rounder head: face 47..113, 54..124) */
    case "kshort": return { front: `<path d="M45.5 92 q-5-52 34.5-54 q39.5 2 34.5 54 q-2-12-7-19 q-7 5-13 0 q-7 6-15 1 q-7 5-15 0 q-6 5-12 0 q-5 7-7 18z" fill="${H}"/>
        <path d="M73 40 q3-12 15-10 q-7 3-6 11z" fill="${H}"/>` + strand("M60 52 q10-8 24-7 M70 47 q10-3 22 3") };
    case "kcrew": return { front: `<path d="M46 90 Q44 47 80 46 Q116 47 114 90 Q111 72 102 65 Q80 58 58 65 Q49 72 46 90Z" fill="${H}"/>` };
    case "kcurly": return { front: `<path d="M46 90 Q44 46 80 44 Q116 46 114 90 Q109 72 100 66 Q80 60 60 66 Q51 72 46 90Z" fill="${H}"/>` +
      circles([[49, 79, 7.5], [50, 66, 9], [57, 55, 9.5], [68, 47.5, 10], [80, 45, 10], [92, 47.5, 10], [103, 55, 9.5], [110, 66, 9], [111, 79, 7.5], [63, 62, 7.5], [75, 59, 7.5], [87, 59, 7.5], [98, 62, 7]]) };
    case "kbob": return { back: `<path d="M41 100 Q38 38 80 36 Q122 38 119 100 Q120 116 113 125 Q106 128 104 118 L56 118 Q54 128 47 125 Q40 116 41 100Z" fill="${H}"/>`,
      front: `<path d="M46 92 q-4-52 34-54 q38 2 34 54 q-3-12-8-19 q-26 7-52 0 q-5 7-8 19z" fill="${H}"/>
        <path d="M100 52 l-11 -7 v14z M100 52 l11 -7 v14z" fill="${bow}"/><circle cx="100" cy="52" r="3.4" fill="${bow}" stroke="#0002" stroke-width="1"/>` + strand("M62 54 q10-8 22-8") };
    case "kmid": return { back: `<path d="M40 100 Q37 38 80 36 Q123 38 120 100 Q124 124 118 142 L42 142 Q36 124 40 100Z" fill="${H}"/>`,
      front: `<path d="M46 92 q-4-52 34-54 q38 2 34 54 q-3-12-8-19 q-26 7-52 0 q-5 7-8 19z" fill="${H}"/>
        <path d="M49 66 Q80 44 111 66" stroke="${bow}" stroke-width="6" fill="none" stroke-linecap="round"/>` };
    case "kpig": return { back: `<path d="M48 76 Q28 66 20 84 Q14 104 22 126 Q30 133 37 125 Q35 104 50 90 Z M112 76 Q132 66 140 84 Q146 104 138 126 Q130 133 123 125 Q125 104 110 90 Z" fill="${H}"/>`,
      front: `<path d="M46 92 q-4-52 34-54 q38 2 34 54 q-4-22-13-31 q-10-9-21-11 q-11 2-21 11 q-9 9-13 31z" fill="${H}"/><circle cx="46.5" cy="82" r="5.5" fill="${bow}"/><circle cx="113.5" cy="82" r="5.5" fill="${bow}"/>` + strand("M80 40 v12") };
    case "kpony": return { back: `<path d="M102 46 Q130 38 138 64 Q143 92 132 118 Q125 124 119 117 Q126 92 121 76 Q116 62 100 58 Z" fill="${H}"/>`,
      front: `<path d="M46 92 q-4-52 34-54 q38 2 34 54 q-4-20-12-28 q-22-8-44 0 q-8 8-12 28z" fill="${H}"/><circle cx="108" cy="50" r="6" fill="${bow}"/>` };
    case "klong": return { back: `<path d="M37 102 q-2-66 43-68 q45 2 43 68 q2 44-4 88 h-78 q-6-44-4-88z" fill="${H}"/>`,
      front: `<path d="M46 92 q-4-52 34-54 q38 2 34 54 q-3-12-8-19 q-26 7-52 0 q-5 7-8 19z" fill="${H}"/>` + strand("M62 54 q10-8 22-8"),
      over: `<path d="M40 104 q-5 36 2 76 q8 5 16-1 q-5-34-2-62 q-6-10-16-13z M120 104 q5 36-2 76 q-8 5-16-1 q5-34 2-62 q6-10 16-13z" fill="${H}"/>` };
  }
  return {};
}

/* ---------- one person, head and shoulders ---------- */
function bust(spec, name, variant){
  const c = traits(spec, variant), L = c.L, u = "pk" + (seq++) + "_", kid = c.kid, fem = c.fem, P = c.named === "paul", J = c.named === "julie";
  const act = doingOf(spec), sleeping = act === "sleeping", eating = act === "eating", drinking = act === "drinking";
  const skin = c.skin, top = c.top;
  const smile = spec._smile || "";                         // "anim" | "still": the mouth goes from neutral to a broad smile (PICS.action "smile")
  // body shape: Pierre and Sylvie keep the portrait's; other women are a little narrower; children much narrower
  const B = kid ? { x0: 36, x1: 124, yt: 133, cw: 28, drop: 30, neck: "M73 112 h14 v20 q-7 5-14 0z", vw: 10, vb: 168 }
    : (fem && !c.named) ? { x0: 27, x1: 133, yt: 132, cw: 31, drop: 36, neck: "M71 110 h18 v20 q-9 7-18 0z", vw: 13, vb: 174 }
    : { x0: 20, x1: 140, yt: 130, cw: 36, drop: 38, neck: "M70 110 h20 v18 q-10 8-20 0z", vw: 14, vb: 174 };
  const torso = (x0, x1, yt, cw, drop) => `M${x0} 190 v-${190 - yt - drop} q0-${drop - 6} ${cw}-${drop} h${x1 - x0 - 2 * cw} q${cw} 6 ${cw} ${drop} v${190 - yt - drop}z`;
  const TP = torso(B.x0, B.x1, B.yt, B.cw, B.drop), nx0 = B.x0 + B.cw, nx1 = B.x1 - B.cw, yt = B.yt;
  const outerName = L.coat ? c.coat : L.suit ? c.suit : null, outer = outerName ? COL[outerName] : null;
  const acc = n => COL[n] || COL.orange;
  const plain = c.named && !sleeping && !eating && !drinking && !smile && !Object.keys(L).length;
  const hair = hairOf(c.style, u, c);
  const browCol = c.old ? "#b9b9b4" : c.brow ? c.brow : P ? "#4f3622" : J ? "#2a1d17" : c.hair[2];
  const lip = c.lip ? c.lip : P ? "#b8645f" : J ? "#c75a64" : fem ? (c.skinName === "dark" || c.skinName === "brown" ? "#a8404e" : "#cf5266") : (c.skinName === "dark" || c.skinName === "brown" ? "#8a4a44" : "#b8645f");

  let defs = `<radialGradient id="${u}s" gradientUnits="userSpaceOnUse" cx="76" cy="${kid ? 82 : 78}" r="46"><stop offset="0" stop-color="${skin[0]}"/><stop offset=".65" stop-color="${skin[1]}"/><stop offset="1" stop-color="${skin[2]}"/></radialGradient>
      <linearGradient id="${u}h" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${c.hair[0]}"/><stop offset=".55" stop-color="${c.hair[1]}"/><stop offset="1" stop-color="${c.hair[2]}"/></linearGradient>
      <linearGradient id="${u}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top[0]}"/><stop offset="1" stop-color="${top[1]}"/></linearGradient>
      <radialGradient id="${u}b" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e98a7a" stop-opacity="${kid ? ".5" : ".3"}"/><stop offset="1" stop-color="#e98a7a" stop-opacity="0"/></radialGradient>`;
  const grad = (id, pair) => `<linearGradient id="${u}${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pair[0]}"/><stop offset="1" stop-color="${pair[1]}"/></linearGradient>`;
  if (outer) defs += grad("o", outer);

  /* --- behind the body --- */
  let behind = "";
  if (sleeping) behind += `<g transform="rotate(-18 54 79)"><rect x="8" y="48" width="92" height="62" rx="17" fill="#cddff8" stroke="#7b98cb" stroke-width="2.6"/>
      <path d="M16 58 q38 10 76 0 M16 100 q38-10 76 0" stroke="#9db6dd" stroke-width="1.8" fill="none"/></g>`;
  if (L.umbrella){
    const U = acc(c.umb);
    behind += `<path d="M26 34 Q28 5 88 4 Q148 5 150 34 Q134.5 25 119 34 Q103.5 25 88 34 Q72.5 25 57 34 Q41.5 25 26 34 Z" fill="${U[0]}"/>
      <path d="M88 4 Q28 5 26 34 Q41.5 25 57 34 Q62 12 88 4Z M88 4 Q112 12 119 34 Q103.5 25 88 34 Z" fill="${U[1]}"/>
      <path d="M26 34 Q28 5 88 4 Q148 5 150 34 Q134.5 25 119 34 Q103.5 25 88 34 Q72.5 25 57 34 Q41.5 25 26 34 Z" fill="none" stroke="${U[1]}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M88 4.5 v-3" stroke="#4b4f57" stroke-width="2.6" stroke-linecap="round"/>`;
  }
  if (L.backpack){
    const K = acc(c.pack); defs += grad("k", K);
    const px0 = kid ? 28 : 22, px1 = kid ? 132 : 138, py = kid ? 104 : 98;
    behind += `<path d="M${px0} 190 V${py + 20} q0-20 20-20 h${px1 - px0 - 40} q20 0 20 20 V190z" fill="url(#${u}k)" stroke="${K[1]}" stroke-width="1.5"/>
      <path d="M${px0 + 5} ${py + 26} v40 M${px1 - 5} ${py + 26} v40" stroke="${K[1]}" stroke-width="2" opacity=".6" stroke-linecap="round"/>`;
  }
  if (c.hood){ const O = COL[c.coat]; behind += `<path d="M38 ${yt + 8} Q34 ${yt - 44} 80 ${yt - 48} Q126 ${yt - 44} 122 ${yt + 8} Z" fill="${O[1]}" stroke="#a37f18" stroke-width="1.4"/>`; }
  if (hair.back) behind += sleeping ? `<g transform="rotate(-16 80 122)">${hair.back}</g>` : drinking ? `<g transform="rotate(5 80 122)">${hair.back}</g>` : hair.back;

  /* --- body and clothes --- */
  let body = "";
  let sleeve = top;                                    // the colour of the arm that brings the apple up
  if (L["red dress"]){
    body += `<path d="${TP}" fill="${skin[1]}"/><path d="M${nx0 + 6} ${yt + 3} q${(nx1 - nx0 - 12) / 2} 9 ${nx1 - nx0 - 12} 0" stroke="${skin[2]}" stroke-width="1.2" fill="none" opacity=".6"/>
      <path d="M${B.x0 + 13} 190 V${yt + 31} Q${B.x0 + 20} ${yt + 17} ${nx0 + 2} ${yt + 14} L${nx0 - 3} ${yt + 0.6} h10 L${nx0 + 10} ${yt + 14} Q80 ${yt + 30} ${nx1 - 10} ${yt + 14} L${nx1 - 7} ${yt + 0.6} h10 L${nx1 - 2} ${yt + 14} Q${B.x1 - 20} ${yt + 17} ${B.x1 - 13} ${yt + 31} V190 Z" fill="url(#${u}t)"/>
      <path d="M${nx0 + 10} ${yt + 14} Q80 ${yt + 30} ${nx1 - 10} ${yt + 14}" stroke="${top[1]}" stroke-width="2" fill="none"/>`;
    sleeve = [skin[1], skin[2]];
  } else {
    body += `<path d="${TP}" fill="url(#${u}t)"/>`;
    if (c.jumper){
      body += `<path d="M${nx0 + 4} ${yt + 1.5} q${(nx1 - nx0 - 8) / 2} ${kid ? 12 : 15} ${nx1 - nx0 - 8} 0" stroke="${L["red jumper"] ? "#8f2620" : top[1]}" stroke-width="7.5" fill="none" stroke-linecap="round"/>
        <path d="M${nx0 + 4} ${yt + 1.5} q${(nx1 - nx0 - 8) / 2} ${kid ? 12 : 15} ${nx1 - nx0 - 8} 0" stroke="${L["red jumper"] ? "#e8756c" : "#fff"}" stroke-width="1.2" fill="none" stroke-dasharray="1.6 3" opacity=".9"/>
        <path d="M${B.x0 + 16} ${yt + 30} v${60 - 30} M${B.x1 - 16} ${yt + 30} v30" stroke="${L["red jumper"] ? "#8f2620" : top[1]}" stroke-width="1.6" opacity=".45"/>`;
    } else if (c.named){
      body += `<path d="M62 131 q18 ${P ? 10 : 14} 36 0" stroke="${P ? "#2f538a" : J ? "#8a2a25" : top[1]}" stroke-width="3.5" fill="none" opacity="${P || J ? ".55" : ".9"}" stroke-linecap="round"/>`;
    } else if (fem && !kid){                           // a scooped neck
      body += `<path d="M${nx0 + 5} ${yt + 0.4} q${(nx1 - nx0 - 10) / 2} 22 ${nx1 - nx0 - 10} 0z" fill="${skin[1]}"/>
        <path d="M${nx0 + 5} ${yt + 0.6} q${(nx1 - nx0 - 10) / 2} 22 ${nx1 - nx0 - 10} 0" stroke="${top[1]}" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
    } else {
      body += `<path d="M${nx0 + 5} ${yt + 1} q${(nx1 - nx0 - 10) / 2} ${kid ? 9 : 10} ${nx1 - nx0 - 10} 0" stroke="${top[1]}" stroke-width="3.5" fill="none" opacity=".8" stroke-linecap="round"/>`;
      if (kid && c.kind === "boy" && !outer) body += `<path d="M${B.x0} 170 H${B.x1} M${B.x0} 182 H${B.x1}" stroke="#fff" stroke-width="5" opacity=".5"/>`;
    }
  }
  if (L.coat){
    const O = outer, vw = B.vw, vb = B.vb; sleeve = O;
    body += `<path d="${torso(B.x0 - 4, B.x1 + 4, yt - 2, B.cw + 2, B.drop + 2)}" fill="url(#${u}o)"/>
      <path d="M${80 - vw} ${yt - 1} L${80 + vw} ${yt - 1} L80 ${vb} Z" fill="url(#${u}t)"/>
      <path d="M${80 - vw + 1} ${yt - 3} L${80 - vw - 15} ${yt + 2} L${80 - vw - 9} ${yt + 24} L80 ${vb + 5} L80 ${vb - 7} Z" fill="${O[0]}" stroke="${O[1]}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M${80 + vw - 1} ${yt - 3} L${80 + vw + 15} ${yt + 2} L${80 + vw + 9} ${yt + 24} L80 ${vb + 5} L80 ${vb - 7} Z" fill="${O[0]}" stroke="${O[1]}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M80 ${vb + 3} V190" stroke="${O[1]}" stroke-width="1.8"/>
      <circle cx="72" cy="${vb + 9}" r="3.6" fill="#4a3524"/><circle cx="88" cy="${vb + 9}" r="3.6" fill="#4a3524"/>
      <path d="M${B.x0 + 10} ${yt + 26} q-3 18 -1 34 M${B.x1 - 10} ${yt + 26} q3 18 1 34" stroke="${O[1]}" stroke-width="1.8" fill="none" opacity=".6"/>`;
  }
  if (L.suit){
    const O = outer, vw = B.vw, vb = B.vb + 2; sleeve = O;
    const shirt = J ? `url(#${u}t)` : "#f8f6f0";
    body += `<path d="${TP}" fill="url(#${u}o)"/>
      <path d="M${80 - vw} ${yt - 1} L${80 + vw} ${yt - 1} L80 ${vb} Z" fill="${shirt}"/>`;
    if (c.tie){ const T = acc(c.tie);
      body += `<path d="M${80 - vw} ${yt - 1} L80 ${yt + 8} L${80 - vw + 4} ${yt + 17} Z M${80 + vw} ${yt - 1} L80 ${yt + 8} L${80 + vw - 4} ${yt + 17} Z" fill="#fff" stroke="#cfccc2" stroke-width="1"/>
        <path d="M76 ${yt + 6} h8 l-1.6 7 h-4.8z" fill="${T[1]}"/><path d="M77.6 ${yt + 13} h4.8 l4 ${vb - yt - 22} l-6.4 8 l-6.4 -8z" fill="${T[0]}"/>`;
    } else body += `<path d="M${80 - vw} ${yt - 1} L${80 - 2} ${yt + 14} L${80 - vw + 2} ${yt + 20} Z M${80 + vw} ${yt - 1} L${80 + 2} ${yt + 14} L${80 + vw - 2} ${yt + 20} Z" fill="${J ? COL.julieRed[0] : "#fff"}" stroke="${J ? COL.julieRed[1] : "#cfccc2"}" stroke-width="1"/>`;
    body += `<path d="M${80 - vw} ${yt - 2} L${80 - vw - 13} ${yt + 4} L${80 - vw - 5} ${yt + 21} L${80 - vw - 10} ${yt + 26} L80 ${vb + 5} L80 ${vb - 8} Z" fill="${O[0]}" stroke="${O[1]}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M${80 + vw} ${yt - 2} L${80 + vw + 13} ${yt + 4} L${80 + vw + 5} ${yt + 21} L${80 + vw + 10} ${yt + 26} L80 ${vb + 5} L80 ${vb - 8} Z" fill="${O[0]}" stroke="${O[1]}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M80 ${vb + 3} V190" stroke="${O[1]}" stroke-width="1.8"/><circle cx="80" cy="${vb + 10}" r="2.8" fill="#23252b"/>
` + (c.named ? "" : `<path d="M${B.x1 - 34} ${yt + 28} h13 l-1 5 h-11z" fill="#fff" opacity=".95"/>`);
  }
  body += `<path d="${B.neck}" fill="${skin[2]}"/>`;
  if (L.scarf){
    const S = acc(c.scarf); defs += grad("a", S);
    body += kid
      ? `<path d="M103 134 q7-4 13 2 l5 30 q-8 5-16 1z" fill="url(#${u}a)" stroke="${S[1]}" stroke-width="1.2"/><path d="M106.5 152 l13.5 -1 M107.5 160 l13.5 -1" stroke="#fff" stroke-width="3" opacity=".6"/>
         <path d="M58 116 Q80 129 102 116 Q107 126 104 139 Q80 151 56 139 Q53 126 58 116Z" fill="url(#${u}a)" stroke="${S[1]}" stroke-width="1.2"/>
         <path d="M57 127 Q80 140 103 127" stroke="#fff" stroke-width="3.2" fill="none" opacity=".6"/><path d="M57 133 Q80 146 104 133" stroke="${S[1]}" stroke-width="1.4" fill="none" opacity=".7"/>`
      : `<path d="M108 133 q8-4 14 2 l6 34 q-9 5-17 1z" fill="url(#${u}a)" stroke="${S[1]}" stroke-width="1.2"/><path d="M111 152 l15 -1.4 M112 161 l15.5 -1.4" stroke="#fff" stroke-width="3.2" opacity=".6"/>
         <path d="M54 113 Q80 128 106 113 Q112 125 108 139 Q80 152 52 139 Q48 125 54 113 Z" fill="url(#${u}a)" stroke="${S[1]}" stroke-width="1.2"/>
         <path d="M52 126 Q80 141 108 126" stroke="#fff" stroke-width="3.4" fill="none" opacity=".6"/><path d="M52 133 Q80 147 108 133" stroke="${S[1]}" stroke-width="1.4" fill="none" opacity=".7"/>`;
  }
  if (L.backpack){
    const K = acc(c.pack), sx = kid ? 60 : 53, ex = kid ? 53 : 45;
    body += `<path d="M${sx} ${yt + 1} Q${ex} ${yt + 22} ${ex} 190 M${160 - sx} ${yt + 1} Q${160 - ex} ${yt + 22} ${160 - ex} 190" stroke="${K[1]}" stroke-width="11" fill="none"/>
      <path d="M${sx - 2} ${yt + 3} Q${ex - 2.5} ${yt + 22} ${ex - 2.5} 190 M${162 - sx} ${yt + 3} Q${162.5 - ex} ${yt + 22} ${162.5 - ex} 190" stroke="${K[0]}" stroke-width="3" fill="none" opacity=".9"/>
      <rect x="${ex - 6.5}" y="${yt + 33}" width="13" height="7" rx="2" fill="#e9e9e4" stroke="#8a8a84" stroke-width="1"/><rect x="${160 - ex - 6.5}" y="${yt + 33}" width="13" height="7" rx="2" fill="#e9e9e4" stroke="#8a8a84" stroke-width="1"/>
      <path d="M${ex} 181 H${160 - ex}" stroke="${K[1]}" stroke-width="4.5"/><rect x="74" y="177" width="12" height="8" rx="2" fill="#e9e9e4" stroke="#8a8a84" stroke-width="1"/>`;
  }
  if (L.bag){
    const G = acc(c.bag); defs += grad("g", G);
    body += `<path d="M117 ${yt + 4} Q128 ${yt + 12} 130 152" stroke="#6a4a2a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M116 152 h30 q4 0 4 4 v24 q0 4-4 4 h-30 q-4 0-4-4 v-24 q0-4 4-4z" fill="url(#${u}g)" stroke="#8a6a1e" stroke-width="1.5"/>
      <path d="M112 157 q0-5 4-5 h30 q4 0 4 5 v5 q-19 12-38 0z" fill="${G[1]}"/><circle cx="131" cy="168" r="3.2" fill="#f6e7a8" stroke="#8a6a1e" stroke-width="1"/>`;
  }
  if (L.umbrella) body += `<path d="M120.5 152 L88 30" stroke="#4b4f57" stroke-width="3.2" stroke-linecap="round"/>`;

  /* --- the head: everything here tilts together when the person sleeps --- */
  const F = kid ? { face: "M80 54 C101 54 113 68 113 89 C113 108 100 123 80 124 C60 123 47 108 47 89 C47 68 59 54 80 54 Z", ex: [66, 94], ey: 93, es: 1.2, earx: [47.5, 112.5], eary: 93, my: 1, bl: [62, 98, 104] }
                : { face: "M80 48 C100 48 112 63 112 85 C112 106 101 122 80 125 C59 122 48 106 48 85 C48 63 60 48 80 48 Z", ex: [67, 93], ey: 87, es: 1, earx: [48.5, 111.5], eary: 90, my: 0, bl: [64, 96, 101] };
  let head = `<ellipse cx="${F.earx[0]}" cy="${F.eary}" rx="${kid ? 4.8 : 4.2}" ry="7.5" fill="${skin[2]}"/><ellipse cx="${F.earx[1]}" cy="${F.eary}" rx="${kid ? 4.8 : 4.2}" ry="7.5" fill="${skin[2]}"/>
     <path d="${F.face}" fill="url(#${u}s)"/>
     <ellipse cx="${F.bl[0]}" cy="${F.bl[2]}" rx="9" ry="${kid ? 6 : 5}" fill="url(#${u}b)"/><ellipse cx="${F.bl[1]}" cy="${F.bl[2]}" rx="9" ry="${kid ? 6 : 5}" fill="url(#${u}b)"/>`;
  if (fem && !c.named && !kid && (c.style === "bun" || c.style === "pony" || c.style === "bob"))
    head += `<circle cx="48.5" cy="99.5" r="2.6" fill="#f2cf5a" stroke="#b8922c" stroke-width=".8"/><circle cx="111.5" cy="99.5" r="2.6" fill="#f2cf5a" stroke="#b8922c" stroke-width=".8"/>`;
  if (c.old) head += `<path d="M66 65 q14-3.5 28 0 M68 70.5 q12-3 24 0" stroke="${skin[2]}" stroke-width="1.2" fill="none" opacity=".85"/>
     <path d="M55.5 85 l-4.5 -2.4 M55.5 88.5 l-4.6 1 M104.5 85 l4.5 -2.4 M104.5 88.5 l4.6 1" stroke="${skin[2]}" stroke-width="1.1" fill="none" opacity=".9"/>
     <path d="M69 99 q-5 7 -3.5 14 M91 99 q5 7 3.5 14" stroke="${skin[2]}" stroke-width="1.2" fill="none" opacity=".85"/>
     <path d="M60.5 93.5 q6.5 3.4 13 0 M86.5 93.5 q6.5 3.4 13 0" stroke="${skin[2]}" stroke-width="1" fill="none" opacity=".8"/>`;
  head += hair.front || "";
  if (c.beard){
    if (P) head += `<path d="M49 92 q2 28 31 33 q29-5 31-33 q-3 12-10 17 q-6-6-21-6 q-15 0-21 6 q-7-5-10-17z" fill="url(#${u}h)" opacity=".95"/>
         <path d="M66 105 q14-5 28 0 q-4 4-14 4 q-10 0-14-4z" fill="url(#${u}h)"/>`;
    else head += `<path d="M48.6 90 q0 34 31.4 43 q31.4-9 31.4-43 q-3 14-10.4 19 q-6-6-21-6 q-15 0-21 6 q-7.4-5-10.4-19z" fill="url(#${u}h)" opacity=".97"/>
         <path d="M65 105 q15-5.5 30 0 q-4 4.4-15 4.4 q-11 0-15-4.4z" fill="url(#${u}h)"/>`;
  }
  // brows
  if (kid) head += `<path d="M58.5 82.6 q7.5-4.6 15-1.4 M101.5 82.6 q-7.5-4.6 -15-1.4" stroke="${browCol}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/>`;
  else { const bx = (P || (!fem && !c.named)) ? 59 : 60, bh = (P || (!fem && !c.named)) ? 4 : 5.5;
    head += `<path d="M${bx} 77 q8-${bh} 16-1.5 q-8-1.6-16 3z" fill="${browCol}"/><path d="M${160 - bx} 77 q-8-${bh} -16-1.5 q8-1.6 16 3z" fill="${browCol}"/>`; }
  // eyes
  const eo = { iris: c.iris, shade: skin[2], closed: sleeping, s: F.es, half: drinking ? skin[1] : null };
  head += eye(u, F.ex[0], F.ey, Object.assign({ lash: fem && !c.named ? -1 : 0 }, eo)) + eye(u, F.ex[1], F.ey, Object.assign({ lash: fem && !c.named ? 1 : 0 }, eo));
  // nose
  head += kid ? `<path d="M77.6 102.4 q2.4 2.6 5 0.2" stroke="${skin[2]}" stroke-width="1.4" fill="none" opacity=".8" stroke-linecap="round"/>`
    : `<path d="M78 88 Q76.4 97 75.8 101.5 Q77.4 103.6 79.6 103.2" stroke="${skin[2]}" stroke-width="1.2" fill="none" opacity=".55"/>
     <ellipse cx="77" cy="103.4" rx="1.4" ry=".8" fill="#8f5c42" opacity=".5"/><ellipse cx="83" cy="103.4" rx="1.4" ry=".8" fill="#8f5c42" opacity=".5"/>`;
  // mouth
  const my = F.my;
  if (smile){
    /* neutral mouth -> broad smile and back: the corners go out and up, the teeth show, the cheeks lift and the eyes narrow */
    const an = smile === "anim", K = `keyTimes="0;0.14;0.4;0.8;1" dur="1.3s" repeatCount="indefinite" calcMode="spline" keySplines="0 0 1 1;0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1"`;
    const A = (attr, a, b) => an ? `<animate attributeName="${attr}" values="${a};${a};${b};${b};${a}" ${K}/>` : "";
    const V = (a, b) => an ? a : b;
    const m0 = "M70.5 109.6 Q80 110.8 89.5 109.6 Q80 112.4 70.5 109.6 Z", m1 = "M63.5 105.4 Q80 111.4 96.5 105.4 Q80 127 63.5 105.4 Z";
    const t0 = "M72 109.9 Q80 110.9 88 109.9 Q80 111.3 72 109.9 Z", t1 = "M66.4 107 Q80 112.2 93.6 107 Q80 118.4 66.4 107 Z";
    head += `<path d="${V(m0, m1)}" fill="#5a1b1d" stroke="${lip}" stroke-width="2.4" stroke-linejoin="round">${A("d", m0, m1)}</path>
      <path d="${V(t0, t1)}" fill="#fffdf8">${A("d", t0, t1)}</path>
      <g opacity="${V(0, 1)}">${A("opacity", 0, 1)}<ellipse cx="60.5" cy="99" rx="10" ry="6.4" fill="url(#${u}b)"/><ellipse cx="99.5" cy="99" rx="10" ry="6.4" fill="url(#${u}b)"/>
        <path d="M58.4 94.6 q8.6 -5.2 17.2 0 q-8.6 5.6 -17.2 0z M84.4 94.6 q8.6 -5.2 17.2 0 q-8.6 5.6 -17.2 0z" fill="${skin[1]}"/>
        <path d="M59 93.6 q8 -4.4 16 0 M85 93.6 q8 -4.4 16 0" stroke="${skin[2]}" stroke-width="1.3" fill="none" stroke-linecap="round"/></g>`;
  }
  else if (eating) head += `<ellipse cx="81.5" cy="${111.4 + my}" rx="8.4" ry="7.4" fill="#551a1a" stroke="${lip}" stroke-width="1.8"/>
     <path d="M74.6 ${108.2 + my} Q81.5 ${104.6 + my} 88.4 ${108.2 + my} Q88 ${110.6 + my} 81.5 ${109.6 + my} Q75 ${110.6 + my} 74.6 ${108.2 + my} Z" fill="#fff"/>
     <ellipse cx="81.5" cy="${116 + my}" rx="4.6" ry="2.2" fill="#d9706f"/>`;
  else if (drinking) head += `<path d="M73.5 ${112.6 + my} Q80 ${118.2 + my} 86.5 ${112.2 + my}" stroke="${lip}" stroke-width="3" fill="none" stroke-linecap="round"/>`;   // the lower lip, under the rim
  else if (sleeping) head += `<ellipse cx="80" cy="${111.6 + my}" rx="3.9" ry="3.3" fill="#6e2424" stroke="${lip}" stroke-width="1.5"/>`;
  else if (kid) head += `<path d="M71.5 ${109.6 + my} Q80 ${117.4 + my} 88.5 ${109.6 + my} Q80 ${112.4 + my} 71.5 ${109.6 + my} Z" fill="${lip}"/><path d="M72 ${109.8 + my} Q80 ${114.6 + my} 88 ${109.8 + my}" stroke="#8a3b3b" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
  else head += `<path d="M69.5 109.4 Q80 116.5 90.5 109.4 Q80 112.6 69.5 109.4 Z" fill="${lip}"/>
     <path d="M70 109.6 Q80 114.2 90 109.6" stroke="#8a3b3b" stroke-width="1.1" fill="none" stroke-linecap="round"/>
     <path d="M68 108 q-1.4 1.6 0 3.4 M92 108 q1.4 1.6 0 3.4" stroke="${skin[2]}" stroke-width="0.9" fill="none" opacity=".7"/>`;
  if (false) head += "";
  if (!c.beard && c.stache) head += (c.old ? "" : `<path d="M49 92 q2 28 31 33 q29-5 31-33 q-3 12-10 17 q-6-6-21-6 q-15 0-21 6 q-7-5-10-17z" fill="${c.hair[1]}" opacity=".42"/>`) + `<path d="M63 ${106.4 - (eating ? 2.4 : 0)} q17-8.4 34 0 q-3 5.4-9.4 3.6 q-7.6-2.8-15.2 0 q-6.4 1.8-9.4-3.6z" fill="url(#${u}h)"${c.old ? ' stroke="#8f8f89" stroke-width="1"' : ""}/>` +
      (c.old ? "" : `<path d="M71 ${118.5 + (eating ? 2.5 : 0)} q9 4 18 0 q-1.5 7.5-9 8 q-7.5-.5-9-8z" fill="url(#${u}h)" opacity=".95"/>`);
  if (kid && !sleeping && (hashStr(c.kind + c.style + c.topName) % 2 === 0))
    head += `<g fill="${skin[2]}" opacity=".75"><circle cx="60" cy="101" r="1"/><circle cx="64.5" cy="103.4" r="1"/><circle cx="57" cy="104.6" r="1"/><circle cx="100" cy="101" r="1"/><circle cx="95.5" cy="103.4" r="1"/><circle cx="103" cy="104.6" r="1"/></g>`;
  if (L.glasses){
    const gc = c.glasses, ey = F.ey, x0 = F.ex[0], x1 = F.ex[1], lens = `fill="${c.shades ? "#23262d" : "#cfe6f5"}" fill-opacity="${c.shades ? ".93" : ".3"}" stroke="${gc}" stroke-width="${kid ? 3 : 2.8}"`;
    head += (c.round ? `<circle cx="${x0 - 0.5}" cy="${ey + 0.5}" r="${kid ? 12 : 11}" ${lens}/><circle cx="${x1 + 0.5}" cy="${ey + 0.5}" r="${kid ? 12 : 11}" ${lens}/>`
                     : `<rect x="${x0 - 12}" y="${ey - 8.5}" width="23.5" height="17.5" rx="6" ${lens}/><rect x="${x1 - 11.5}" y="${ey - 8.5}" width="23.5" height="17.5" rx="6" ${lens}/>`) +
      `<path d="M${x0 + (c.round ? (kid ? 11.5 : 10.5) : 11.5)} ${ey - 1} q${(x1 - x0) / 2 - (c.round ? (kid ? 11.5 : 10.5) : 11.5)} -3.4 ${(x1 - x0) - 2 * (c.round ? (kid ? 11.5 : 10.5) : 11.5)} 0 M${x0 - (c.round ? (kid ? 12.5 : 11.5) : 12)} ${ey - 1.5} L${F.earx[0] - 1} ${ey - 4} M${x1 + (c.round ? (kid ? 12.5 : 11.5) : 12)} ${ey - 1.5} L${F.earx[1] + 1} ${ey - 4}" stroke="${gc}" stroke-width="${kid ? 3 : 2.8}" fill="none" stroke-linecap="round"/>`;
  }
  if (L.hat){
    const Hc = acc(c.hat), wide = c.hat === "straw"; defs += grad("c", Hc);
    head += `<ellipse cx="80" cy="56" rx="${wide ? 57 : 51}" ry="${wide ? 11 : 9.5}" fill="${Hc[1]}"/>
      <ellipse cx="80" cy="54.6" rx="${wide ? 57 : 51}" ry="${wide ? 10.4 : 9}" fill="url(#${u}c)"/>
      <path d="M54 55 Q49 22 64 16 Q72 13 80 17 Q88 13 96 16 Q111 22 106 55 Q80 63 54 55Z" fill="url(#${u}c)"/>
      <path d="M53.6 46 Q80 54 106.4 46 L106 55 Q80 63 54 55 Z" fill="${c.band}"/>
      <path d="M61 24 Q70 19 80 22" stroke="#fff" stroke-width="2" fill="none" opacity=".3" stroke-linecap="round"/>`;
  }
  if (L.cap){
    const C = acc(c.cap); defs += grad("c", C);
    head += `<path d="M43.5 67 Q41 25 80 24 Q119 25 116.5 67 Q100 58 80 58 Q60 58 43.5 67 Z" fill="url(#${u}c)"/>
      <path d="M80 24 V57 M61 28.5 Q54 44 54.5 60 M99 28.5 Q106 44 105.5 60" stroke="${C[1]}" stroke-width="1.3" fill="none" opacity=".7"/>
      <circle cx="80" cy="24.6" r="3.4" fill="${C[1]}"/>
      <path d="M41 64 Q76 49 113 61 Q117 68 104 71 Q76 75 50 73 Q37 71 41 64Z" fill="${C[1]}"/>
      <path d="M45 66.5 Q76 55 109 64" stroke="#fff" stroke-width="1.6" fill="none" opacity=".3" stroke-linecap="round"/>`;
  }
  head = sleeping ? `<g transform="rotate(-16 80 122)">${head}</g>` : drinking ? `<g transform="rotate(5 80 122)">${head}</g>` : `<g>${head}</g>`;

  /* --- in front: long hair over the shoulders, name tag, arms and things held, z z Z --- */
  let front = hair.over ? (sleeping ? `<g transform="rotate(-6 80 122)">${hair.over}</g>` : hair.over) : "";
  if (c.named && name !== null && name !== undefined && name !== ""){
    const nm = String(name).replace(/[&<>]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
    const tw = Math.max(J ? 56 : 50, nm.length * 7.6 + 4);
    front += `<g class="nametag"><rect x="${80 - tw / 2}" y="146" width="${tw}" height="24" rx="4" fill="#fffdf6" stroke="#b9ae98" stroke-width="1.5"/>
     <rect x="${80 - tw / 2}" y="146" width="${tw}" height="5" rx="2" fill="#c8453b"/>
     <text x="80" y="166" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="14" font-weight="700" fill="#2a2522">${nm}</text></g>`;
  }
  const armStroke = (d, w) => `<path d="${d}" stroke="${sleeve[1]}" stroke-width="${w + 2.4}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${sleeve[0]}" stroke-width="${w - 1}" fill="none" stroke-linecap="round" opacity=".85"/>`;
  if (L.umbrella){
    front += armStroke("M127 200 L123.5 165", 19) +
      `<path d="M120.5 152 L124.4 166 q2 8.6 -5.2 9 q-6 0 -6 -6" stroke="#8a5a36" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
       <ellipse cx="121.6" cy="155" rx="9.4" ry="9" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/>
       <path d="M114 152 q7 2.4 14.6 0.4 M113.4 156.4 q8 2.4 16 0.4 M114.6 160.6 q7 2 13.6 0.2" stroke="${skin[2]}" stroke-width="1.1" fill="none" opacity=".9"/>`;
  }
  if (eating){
    const red = !WARM[outerName || c.topName], A = red ? { c: "#c9302c", d: "#8f1d1b", l: "#ef6a55" } : { c: "#7fb03a", d: "#4f7a1f", l: "#b6d86c" };
    defs += `<radialGradient id="${u}r" cx=".36" cy=".34" r=".78"><stop offset="0" stop-color="${A.l}"/><stop offset=".55" stop-color="${A.c}"/><stop offset="1" stop-color="${A.d}"/></radialGradient>`;
    const ay = 119 + my;
    front += armStroke("M33 200 L37.5 153", 19) +
      // the apple, a bite out of it on the side of the mouth
      `<path d="M62 ${ay - 14} C52 ${ay - 21} 43.5 ${ay - 12} 44 ${ay} C44.6 ${ay + 12} 53 ${ay + 18} 60 ${ay + 17} C61.4 ${ay + 16.6} 62 ${ay + 16} 63 ${ay + 16} C64 ${ay + 16} 64.6 ${ay + 16.6} 66 ${ay + 17} C73 ${ay + 18} 80.4 ${ay + 12} 81 ${ay} C81.2 ${ay - 4} 80.4 ${ay - 7.4} 78.8 ${ay - 10} Q73.4 ${ay - 8.4} 70.6 ${ay - 12.6} Q69 ${ay - 15.6} 70.4 ${ay - 17.4} C67.6 ${ay - 17.6} 64.6 ${ay - 16.2} 62 ${ay - 14} Z" fill="url(#${u}r)" stroke="${A.d}" stroke-width="1"/>
       <path d="M78.8 ${ay - 10} Q73.4 ${ay - 8.4} 70.6 ${ay - 12.6} Q69 ${ay - 15.6} 70.4 ${ay - 17.4}" stroke="#fbf0c9" stroke-width="3.4" fill="none" stroke-linecap="round"/>
       <path d="M62.4 ${ay - 13} C61.6 ${ay - 18} 62 ${ay - 21} 64.4 ${ay - 24}" stroke="#5a3a22" stroke-width="2.6" fill="none" stroke-linecap="round"/>
       <path d="M63.6 ${ay - 21} C58 ${ay - 28} 49 ${ay - 27} 46.6 ${ay - 24} C51 ${ay - 19} 58 ${ay - 18} 63.6 ${ay - 21} Z" fill="#5f9a3a" stroke="#3f6f24" stroke-width=".8"/>
       <ellipse cx="53.5" cy="${ay - 5}" rx="4" ry="6.4" fill="#fff" opacity=".28" transform="rotate(-20 53.5 ${ay - 5})"/>` +
      // the hand that holds it: fingers in front of the apple
      `<g transform="translate(37.5 ${151 + my}) rotate(-50)"><rect x="-6" y="-11.5" width="22" height="23" rx="9" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/>
         ${[-10.6, -5.2, 0.2, 5.6].map((y, i) => `<rect x="10" y="${y}" width="${[17, 20, 20, 17][i]}" height="5.6" rx="2.8" fill="${skin[0]}" stroke="${skin[2]}" stroke-width="1"/>`).join("")}
         <path d="M2 -11 q9 -6.5 15 -1.6 q-5 3 -9 4.4z" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1"/></g>`;
  }
  if (drinking){
    /* A glass of water being drunk, drawn from photographs and symbols of people drinking: the rim is on the lips and the
       glass is tipped up, its base out to the side and higher than the rim; the hand is wrapped round the side of the
       glass, fingers across the front; the forearm comes up from below; the water lies level and has run to the rim. */
    const rx = 81, ry = 112.5 + my, tilt = 200;            // rim centre, on the lower lip; 200 = the base points left and 20 degrees up
    const glass = "M0 -11 L45 -8.8 Q48.4 -8.6 48.4 -6 L48.4 6 Q48.4 8.6 45 8.8 L0 11 Z", T = `translate(${rx} ${ry}) rotate(${tilt})`;
    defs += `<clipPath id="${u}w"><path d="${glass}" transform="${T}"/></clipPath>`;
    front += armStroke(`M31 200 L38.4 ${137 + my}`, 18) +
      `<g transform="${T}">
         <rect x="21.5" y="-30" width="26.5" height="25" rx="10" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/>
         <ellipse cx="16.5" cy="-11.8" rx="6.2" ry="4.2" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.1"/>
         <path d="${glass}" fill="#f6fbff" fill-opacity=".62"/></g>
       <rect x="20" y="${ry - 5}" width="70" height="40" fill="#4fa9ee" fill-opacity=".9" clip-path="url(#${u}w)"/>
       <path d="M22 ${ry - 5} H88" stroke="#2f7fcc" stroke-width="1.6" clip-path="url(#${u}w)"/>
       <g transform="${T}">
         <path d="M42.6 -8.9 L45 -8.8 Q48.4 -8.6 48.4 -6 L48.4 6 Q48.4 8.6 45 8.8 L42.6 8.9 Z" fill="#9db9d6" fill-opacity=".8"/>
         <path d="${glass}" fill="none" stroke="#3f6a98" stroke-width="2.3" stroke-linejoin="round"/>
         <ellipse cx="0" cy="0" rx="3.4" ry="11" fill="#ffffff" fill-opacity=".6" stroke="#4a7099" stroke-width="1.8"/>
         <path d="M6 7.4 L19 6.8" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".95"/>
         ${[22.6, 28.6, 34.6, 40.6].map((x, i) => `<rect x="${x}" y="${[-16, -17.5, -17.5, -16][i]}" width="5.7" height="${[22.5, 25, 24.6, 22][i]}" rx="2.85" fill="${skin[0]}" stroke="${skin[2]}" stroke-width="1"/>`).join("")}
       </g>`;
  }
  if (L.bicycle){                                          // handlebars held in both hands, under the name tag
    front += `<path d="M26 181 Q80 171 134 181" stroke="#7d828a" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="M26 180 Q80 170 134 180" stroke="#d9dde2" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M80 176 V190" stroke="#5f646b" stroke-width="7"/><circle cx="96" cy="172" r="6" fill="#e9e9e4" stroke="#8a8a84" stroke-width="1.4"/><circle cx="96" cy="172" r="1.8" fill="#8a8a84"/>
      <path d="M24 181.4 L42 178.4 M118 178.4 L136 181.4" stroke="#23252b" stroke-width="8.5" stroke-linecap="round"/>
      <ellipse cx="38" cy="178" rx="9.5" ry="8.6" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/><ellipse cx="122" cy="178" rx="9.5" ry="8.6" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/>
      <path d="M31 175 q7 2.4 14 0.4 M31 179.6 q7 2.4 14 0.4 M115 175.4 q7 2 14 -0.4 M115 180 q7 2 14 -0.4" stroke="${skin[2]}" stroke-width="1.1" fill="none"/>`;
  }
  if (sleeping) front += L.umbrella ? zed(127, 98, 8) + zed(135, 76, 11) + zed(141, 50, 14.5) : zed(113, 62, 10) + zed(122, 40, 14) + zed(131, 13, 19);

  const all = behind + body + head + front;
  return mk(`<defs>${defs}${plain ? "" : `<clipPath id="${u}x"><rect x="0" y="0" width="160" height="190" rx="12"/></clipPath>`}</defs>` + (plain ? all : `<g clip-path="url(#${u}x)">${all}</g>`));
}

/* ---------- people standing in a row, to be counted: whole figures, the same heads ---------- */
const ROW = {
  man:   [{ s: "tan", h: "dkbrown", st: "sidepart", t: "green", leg: "navy" }, { s: "fair", h: "ginger", st: "crew", t: "orange", leg: "charcoal" }, { s: "dark", h: "jet", st: "curly", t: "yellow", leg: "brown" },
          { s: "light", h: "blond", st: "sidepart", t: "teal", leg: "charcoal" }, { s: "brown", h: "black", st: "crew", t: "purple", leg: "navy" }, { s: "fair", h: "brown", st: "curly", t: "lime", leg: "brown" }, { s: "tan", h: "black", st: "sidepart", t: "grey", leg: "navy" }],
  woman: [{ s: "light", h: "ltbrown", st: "long", t: "teal" }, { s: "brown", h: "jet", st: "bun", t: "yellow" }, { s: "fair", h: "blond", st: "long", t: "purple" },
          { s: "tan", h: "dkbrown", st: "pony", t: "orange" }, { s: "dark", h: "jet", st: "curlyF", t: "green" }, { s: "fair", h: "ginger", st: "wavy", t: "pink" }, { s: "light", h: "black", st: "bob", t: "lime" }]
};
const ROWKID = { boy: ["kshort", "kcrew", "kcurly", "kshort", "kcrew", "kcurly", "kshort"], girl: ["kmid", "kpig", "kbob", "kpony", "kmid", "kpig", "kbob"] };
function standing(kind, i){
  const kid = kind === "boy" || kind === "girl";
  const fem = kind === "woman" || kind === "girl", v = Object.assign({}, ROW[fem ? "woman" : "man"][i % 7], kid ? { st: ROWKID[kind][i % 7] } : {}), u = "pr" + (seq++) + "_";
  const skin = SKIN[v.s], hairC = HAIR[v.h], top = COL[v.t], c = { hair: hairC, skinName: v.s, bow: "#e8548a" }, hair = hairOf(v.st, u, c);
  const leg = COL[v.leg || "navy"], dk = v.s === "dark" || v.s === "brown";
  const defs = `<radialGradient id="${u}s" gradientUnits="userSpaceOnUse" cx="76" cy="78" r="46"><stop offset="0" stop-color="${skin[0]}"/><stop offset=".65" stop-color="${skin[1]}"/><stop offset="1" stop-color="${skin[2]}"/></radialGradient>
    <linearGradient id="${u}h" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${hairC[0]}"/><stop offset=".55" stop-color="${hairC[1]}"/><stop offset="1" stop-color="${hairC[2]}"/></linearGradient>
    <linearGradient id="${u}t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${top[1]}"/><stop offset=".35" stop-color="${top[0]}"/><stop offset="1" stop-color="${top[1]}"/></linearGradient>`;
  const eo = { iris: dk ? "#3b2a1e" : "#5a3a22", shade: skin[2] };
  const body = fem
    ? `<rect x="24" y="150" width="24" height="150" rx="12" fill="${top[1]}"/><rect x="112" y="150" width="24" height="150" rx="12" fill="${top[1]}"/>
       <ellipse cx="36" cy="308" rx="11" ry="13" fill="${skin[1]}"/><ellipse cx="124" cy="308" rx="11" ry="13" fill="${skin[1]}"/>
       <rect x="57" y="400" width="19" height="118" rx="8" fill="${skin[1]}"/><rect x="84" y="400" width="19" height="118" rx="8" fill="${skin[1]}"/>
       <path d="M50 512 h28 v12 q0 8-8 8 h-18 q-8 0-8-8 q0-8 6-12z M82 512 h28 q6 4 6 12 q0 8-8 8 h-18 q-8 0-8-8z" fill="#3a2f33"/>
       <path d="M44 270 H116 L138 420 H22 Z" fill="url(#${u}t)"/>
       <path d="M30 190 v-24 q0-30 30-36 h40 q30 6 30 36 v24 l-14 96 h-72z" fill="url(#${u}t)"/>
       <path d="M46 284 h68" stroke="${top[1]}" stroke-width="4" opacity=".7"/>`
    : `<rect x="18" y="150" width="27" height="156" rx="13" fill="${top[1]}"/><rect x="115" y="150" width="27" height="156" rx="13" fill="${top[1]}"/>
       <ellipse cx="31.5" cy="314" rx="12" ry="14" fill="${skin[1]}"/><ellipse cx="128.5" cy="314" rx="12" ry="14" fill="${skin[1]}"/>
       <path d="M42 290 H118 L121 518 H85 L80 350 L75 518 H39 Z" fill="${leg[1]}"/><path d="M48 300 L45 512 M112 300 L115 512" stroke="${leg[0]}" stroke-width="5" opacity=".6"/>
       <path d="M36 514 h42 v12 q0 9-9 9 h-32 q-9 0-9-9 q0-8 8-12z M82 514 h42 q8 4 8 12 q0 9-9 9 h-32 q-9 0-9-9z" fill="#2c2623"/>
       <path d="M22 190 v-22 q0-32 36-38 h44 q36 6 36 38 v22 l-18 114 h-80z" fill="url(#${u}t)"/>`;
  if (kid) return `<g><defs>${defs}</defs>${hair.back || ""}<g transform="translate(80 128) scale(.8 .6) translate(-80 -128)">${body}</g>
    <path d="M73 112 h14 v20 q-7 5-14 0z" fill="${skin[2]}"/>
    <ellipse cx="47.5" cy="93" rx="4.8" ry="7.5" fill="${skin[2]}"/><ellipse cx="112.5" cy="93" rx="4.8" ry="7.5" fill="${skin[2]}"/>
    <path d="M80 54 C101 54 113 68 113 89 C113 108 100 123 80 124 C60 123 47 108 47 89 C47 68 59 54 80 54 Z" fill="url(#${u}s)"/>${hair.front || ""}` +
    eye(u, 66, 93, Object.assign({ s: 1.2 }, eo)) + eye(u, 94, 93, Object.assign({ s: 1.2 }, eo)) +
    `<path d="M71.5 110.6 Q80 118.4 88.5 110.6 Q80 113.4 71.5 110.6 Z" fill="#c96a66"/>${hair.over || ""}</g>`;
  return `<g><defs>${defs}</defs>${hair.back || ""}${body}
    <path d="M70 110 h20 v20 q-10 8-20 0z" fill="${skin[2]}"/>
    <ellipse cx="48.5" cy="90" rx="4.2" ry="7.5" fill="${skin[2]}"/><ellipse cx="111.5" cy="90" rx="4.2" ry="7.5" fill="${skin[2]}"/>
    <path d="M80 48 C100 48 112 63 112 85 C112 106 101 122 80 125 C59 122 48 106 48 85 C48 63 60 48 80 48 Z" fill="url(#${u}s)"/>${hair.front || ""}
    <path d="M60 77 q8-4.5 16-1.5 q-8-1.6-16 3z M100 77 q-8-4.5 -16-1.5 q8-1.6 16 3z" fill="${hairC[2]}"/>` + eye(u, 67, 87, eo) + eye(u, 93, 87, eo) +
    `<path d="M78 88 Q76.4 97 75.8 101.5 Q77.4 103.6 79.6 103.2" stroke="${skin[2]}" stroke-width="1.4" fill="none" opacity=".6"/>
    <path d="M69.5 109.4 Q80 116.5 90.5 109.4 Q80 112.6 69.5 109.4 Z" fill="${fem ? "#cf5266" : "#b8645f"}"/>${hair.over || ""}</g>`;
}
function row(spec, n){
  n = Math.max(1, Math.min(7, n | 0));
  const kid = spec.is === "boy" || spec.is === "girl";
  const W = kid ? 112 : 128, top = 30, H = kid ? 345 : 508; // a figure fills x 16..144, y 30..538 of its own drawing (a child: y 30..375)
  const s = Math.min(170 / H, 150 / (n * W + (n - 1) * 8)), pitch = Math.min((W + 8) * s * 1.22, (156 - W * s) / Math.max(1, n - 1));
  const x0 = 80 - pitch * (n - 1) / 2, y0 = (190 - H * s) / 2 - top * s;
  let out = "";
  for (let i = 0; i < n; i++) out += `<g transform="translate(${r2(x0 + i * pitch - 80 * s)} ${r2(y0)}) scale(${r2(s * 1000) / 1000})">${standing(spec.is, i)}</g>`;
  return mk(out);
}
function person(spec, name){
  spec = spec || {};
  const looks = spec.looks || [], n = spec.count || 1;
  if (!spec.person && (n > 1 || looks.indexOf("in a row") >= 0)) return row(spec, n);
  const acted = ACT_OF[doingOf(spec)];
  if (acted && (spec.person === "paul" || spec.person === "julie" || spec.person === "marie" || spec.person === "you"))
    return action(acted, spec.person, { looks: spec.looks, name: name, still: !!spec.still });
  if (doingOf(spec) === "walking") return walker(spec, name);
  return bust(spec, name);
}

/* ---------- keys ---------- */
const METAL = { gold: { c: "#d9b23c", d: "#9c7818", l: "#fbe89a" }, silver: { c: "#b4b9c0", d: "#6e737a", l: "#f2f4f7" }, oldgold: { c: "#c79c34", d: "#7c5c14", l: "#ecd27c" },
  red: { c: "#d63a32", d: "#8f1f1a", l: "#f58a7c" }, black: { c: "#34353b", d: "#131317", l: "#74757f" }, blue: { c: "#2f5d8c", d: "#1f3f60", l: "#6a9bd0" }, green: { c: "#3f8a4c", d: "#285436", l: "#86c46c" } };
function oneKey(spec){
  const L = spec.looks || [], has = x => L.indexOf(x) >= 0, u = "pkey" + (seq++) + "_";
  const colName = ["gold", "silver", "red", "black", "blue", "green"].find(has) || "silver";
  const old = has("old"), ring = has("on a ring"), plastic = has("plastic") || colName === "red" || colName === "black";
  const M = METAL[old && colName === "gold" ? "oldgold" : colName];
  const size = has("big") ? 1.12 : has("small") ? 0.62 : old ? 1 : ring ? 0.84 : 0.94;
  const rot = old ? -38 : ring ? 62 : has("big") ? 38 : has("small") ? -24 : plastic ? -52 : -40;
  const grad = `<linearGradient id="${u}m" gradientUnits="userSpaceOnUse" x1="0" y1="-26" x2="0" y2="26"><stop offset="0" stop-color="${M.l}"/><stop offset=".45" stop-color="${M.c}"/><stop offset="1" stop-color="${M.d}"/></linearGradient>
    <linearGradient id="${u}n" gradientUnits="userSpaceOnUse" x1="0" y1="-10" x2="0" y2="10"><stop offset="0" stop-color="${M.l}"/><stop offset=".5" stop-color="${M.c}"/><stop offset="1" stop-color="${M.d}"/></linearGradient>
    <linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset=".5" stop-color="#a9adb3"/><stop offset="1" stop-color="#70747b"/></linearGradient>`;
  let k, cx;                                               // the key lies along x, its bow at the left; cx is its middle
  if (old){                                                // an old key: ring bow, collars, a long round stem, a bit with wards
    cx = 46;
    k = `<path d="M22 -4.6 H118 q5 0 5 4.6 q0 4.6 -5 4.6 H22z" fill="url(#${u}n)" stroke="${M.d}" stroke-width="1.2"/>
      <path d="M90 3 V28 H98 V19 H103 V28 H112 V15 H116 V3 Z" fill="url(#${u}m)" stroke="${M.d}" stroke-width="1.2" stroke-linejoin="round"/>
      <rect x="24" y="-8.5" width="7" height="17" rx="2.4" fill="url(#${u}n)" stroke="${M.d}" stroke-width="1.2"/><rect x="35" y="-7" width="4.5" height="14" rx="2" fill="url(#${u}n)" stroke="${M.d}" stroke-width="1.2"/>
      <path fill-rule="evenodd" d="M0 -26 a26 26 0 1 0 0.01 0z M0 -13.5 a13.5 13.5 0 1 1 -0.01 0z" fill="url(#${u}m)" stroke="${M.d}" stroke-width="1.3"/>
      <path d="M-18 -10 a21 21 0 0 1 22 -10.6" stroke="#fff" stroke-width="2.4" fill="none" opacity=".45" stroke-linecap="round"/>
      <g fill="#5c4210" opacity=".35"><ellipse cx="60" cy="2" rx="9" ry="2"/><ellipse cx="-14" cy="14" rx="6" ry="3"/><ellipse cx="103" cy="12" rx="5" ry="2.6"/><ellipse cx="84" cy="-2" rx="6" ry="1.6"/></g>`;
  } else {
    cx = 42;
    const blade = `<path d="M26 -8.5 H99 L111 -1 L104 5.5 L98 9.5 L92 3.5 L86 9.5 L80 5.5 L74 9.5 L68 2.5 L62 8.5 L56 4.5 L50 9.5 L44 4.5 L38 8.5 L26 8.5 Z" fill="url(#${u}n)" stroke="${M.d}" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M32 -2.6 H98" stroke="${M.d}" stroke-width="1.6" opacity=".55" stroke-linecap="round"/><path d="M30 -6 H96" stroke="#fff" stroke-width="1.4" opacity=".5" stroke-linecap="round"/>`;
    const bow = plastic
      ? `<path fill-rule="evenodd" d="M-18 -24 H14 Q30 -24 30 -10 V10 Q30 24 14 24 H-18 Q-30 24 -30 8 V-8 Q-30 -24 -18 -24 Z M-21 -8 h10 q4 0 4 4 v8 q0 4 -4 4 h-10 q-4 0 -4 -4 v-8 q0 -4 4 -4z" fill="url(#${u}m)" stroke="${M.d}" stroke-width="1.3"/>
         <path d="M-16 -18 H12 Q22 -18 24 -11" stroke="#fff" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>`
      : `<path fill-rule="evenodd" d="M-2 -26 Q16 -26 26 -13 L32 -8.5 V8.5 L26 13 Q16 26 -2 26 Q-28 26 -28 0 Q-28 -26 -2 -26 Z M-10 -7.5 a7.5 7.5 0 1 0 0.01 0z" fill="url(#${u}m)" stroke="${M.d}" stroke-width="1.3" stroke-linejoin="round"/>
         <path d="M-20 -12 Q-12 -21 2 -21" stroke="#fff" stroke-width="2.6" fill="none" opacity=".5" stroke-linecap="round"/>`;
    const hx = plastic ? -16 : -10;
    k = (ring ? `<circle cx="${hx - 19}" cy="-9" r="24" fill="none" stroke="#5f646b" stroke-width="5.2"/><circle cx="${hx - 19}" cy="-9" r="24" fill="none" stroke="url(#${u}g)" stroke-width="3"/>` : "") + blade + bow +
      (ring ? `<path d="M${hx - 3.4} -5.6 A24 24 0 0 0 ${hx - 7.5} -30.5" fill="none" stroke="#5f646b" stroke-width="5.2"/><path d="M${hx - 3.4} -5.6 A24 24 0 0 0 ${hx - 7.5} -30.5" fill="none" stroke="#dfe2e6" stroke-width="3"/>` : "");
  }
  const tx = ring ? 88 : 80, ty = ring ? 108 : 98;
  const ra = Math.abs(rot) * Math.PI / 180, hx = size * (70 * Math.cos(ra) + 26 * Math.sin(ra)), hy = size * (70 * Math.sin(ra) + 26 * Math.cos(ra));
  return mk(`<defs>${grad}</defs><ellipse cx="${tx + 2}" cy="${r2(Math.min(181, ty + hy + 5))}" rx="${r2(hx * 0.8)}" ry="${r2(Math.max(4, hx * 0.13))}" fill="#000" opacity=".12"/>
    <g transform="translate(${tx} ${ty}) rotate(${rot}) scale(${size}) translate(${-cx} 0)">${k}</g>`);
}
function key(spec){
  spec = spec || {};
  const n = spec.count || 1;
  return n > 1 ? group(n, () => oneKey(spec)) : oneKey(spec);
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

/* ---------- fingers: 5 on one hand, 6 and 7 on two ---------- */
function hand(n, fold){                                          // fingerCard's hand, the fingers a little apart so each can be counted; n = 5 puts the thumb out too
  const X = [60.5, 75, 89.5, 104], A = [-7, -2.5, 2.5, 7];
  const fing = X.map((x, k) => { const up = k < n, h = up ? 62 : 22, y = up ? 44 : 84;
    return `<rect x="${x - 6}" y="${y}" width="12" height="${h}" rx="6" fill="#e9b893" stroke="#c48e6a" stroke-width="1"${up ? ` transform="rotate(${A[k]} ${x} 106)"` : ""}/>`; }).join("");
  const thumb = n >= 5
    ? `<rect x="-7" y="-46" width="14" height="52" rx="7" fill="#e9b893" stroke="#c48e6a" stroke-width="1" transform="translate(58 126) rotate(-58)"/>`
    : "";
  return thumb + `<path d="M52 98 Q50 150 70 166 L104 166 Q118 150 116 100 Z" fill="#edc29f" stroke="#c48e6a" stroke-width="1"/>${fing}` +
    (n >= 5 ? "" : fold ? `<path d="M53 124 Q52 110 64 109 L88 113 Q95 115 94 121 Q93 127 86 127 L66 131 Q55 133 53 124 Z" fill="#e9b893" stroke="#c48e6a" stroke-width="1"/>`
      : `<path d="M52 112 Q38 104 36 92 Q38 84 46 90 Q52 100 58 104" fill="#e9b893" stroke="#c48e6a" stroke-width="1"/>`) +
    `<rect x="58" y="160" width="52" height="24" rx="6" fill="#36536b"/>`;
}
function fingers(n){
  n = Math.max(0, Math.min(10, n | 0));
  if (n <= 5) return mk(`<g transform="translate(${n === 5 ? 9 : 0} 0)">${hand(n)}</g>`);
  const s = n === 10 ? 0.7 : 0.76, y = r2((190 - 140 * s) / 2 - 44 * s);
  // two hands as the learner sees their own: the left one with all five up, then the right one with the rest
  return mk(`<g transform="translate(${r2(4 - 12 * s)} ${y}) scale(${s})">${hand(5)}</g><g transform="translate(${r2(n === 10 ? 156 + 12 * s : 152 + 50 * s)} ${y}) scale(${-s} ${s})">${hand(n - 5, true)}</g>`);
}


/* ---------- somebody walking: the same head and shoulders, small, on a whole body in mid-stride ---------- */
function walker(spec, name){
  const c = traits(spec), L = c.L, kid = c.kid, fem = c.fem, skin = c.skin;
  const still = Object.assign({}, spec); delete still.doing;
  const b = bust(still, name), k = 0.6;
  const outerName = L.coat ? c.coat : L.suit ? c.suit : null, col = outerName ? COL[outerName] : c.top, dress = !!L["red dress"];
  const h = hashStr(c.kind + c.topName + c.style), legs = L.suit ? col : c.named ? (c.named === "paul" ? COL.navy : COL.charcoal) : [COL.navy, COL.charcoal, COL.brown][h % 3];
  const arm = dress ? [skin[1], skin[2]] : col;
  const x0 = kid ? 36 : (fem && !c.named) ? 27 : 20, xl = 32 + k * x0, xr = 160 - xl;       // the shoulders of the small bust
  const hip = kid ? 131 : 139, foot = kid ? 161 : 181, yo = 181 - foot, lw = kid ? 13 : 16, aw = kid ? 10 : 12.5;
  const limb = (d, w, pair) => `<path d="${d}" stroke="${pair[1]}" stroke-width="${w + 2}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${pair[0]}" stroke-width="${w - 1.5}" fill="none" stroke-linecap="round" opacity=".8"/>`;
  const bare = [skin[1], skin[2]], shoe = "#2c2623";
  const under = `<ellipse cx="80" cy="${foot + 5.5}" rx="46" ry="4.6" fill="#000" opacity=".12"/>` +
    // the far leg, behind, its heel up
    `<ellipse cx="45" cy="${foot - 4}" rx="11" ry="5.6" fill="${shoe}" transform="rotate(28 45 ${foot - 4})"/>` +
    limb(`M74 ${hip} Q66 ${hip + (foot - hip) * 0.5} 50 ${foot - 9}`, dress ? 9 : lw, dress ? bare : [legs[1], legs[1]]) +
    limb(`M${xl + 5} 103 Q${xl - 4} 118 ${xl - 9} 134`, aw, arm) + `<circle cx="${xl - 10}" cy="138" r="${aw * 0.56}" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1"/>` +
    `<path d="M${xl + 1} 112 H${xr - 1} L${xr - 6} ${hip + 6} H${xl + 6} Z" fill="${col[1]}"/>` +
    `<ellipse cx="115" cy="${foot}" rx="12" ry="5.6" fill="${shoe}"/>` +
    limb(`M87 ${hip} Q100 ${hip + (foot - hip) * 0.45} 108 ${foot - 5}`, dress ? 9 : lw, dress ? bare : legs) +
    (dress ? `<path d="M${xl + 5} ${hip - 14} H${xr - 5} L${xr + 6} ${hip + 16} Q80 ${hip + 22} ${xl - 6} ${hip + 16} Z" fill="${col[1]}"/>` : "");
  const over = L.umbrella ? "" : limb(`M${xr - 5} 103 Q${xr + 6} 116 ${xr + 12} 130`, aw, arm) + `<circle cx="${xr + 13.5}" cy="134" r="${aw * 0.56}" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1"/>`;
  const g = mk(`<g transform="translate(0 ${yo})">${under}<g class="bust" transform="translate(32 2) scale(${k})"></g>${over}</g>`);
  g.querySelector("g.bust").appendChild(b);
  return g;
}

/* ---------- a dog, seen from the side: standing, running, sitting, lying down; sleeping; eating ---------- */
const DOG = { grey: { c: "#a0a6ae", d: "#6c727a", l: "#cdd2d8" }, golden: { c: "#e3ad4e", d: "#b17c24", l: "#f6d68c" }, brown: { c: "#8f5d38", d: "#5a3820", l: "#b98558" },
  black: { c: "#3c3c43", d: "#151518", l: "#63636e" }, white: { c: "#f6f3ea", d: "#8a8473", l: "#ffffff" }, spotted: { c: "#f6f3ea", d: "#8a8473", l: "#ffffff" } };
function oneDog(spec){
  const L = (spec.looks || []).map(x => String(x).toLowerCase()), has = x => L.indexOf(x) >= 0, act = doingOf(spec);
  const name = ["grey", "golden", "brown", "black", "white", "spotted"].find(has) || "brown", C = DOG[name], spotted = name === "spotted", dark = name === "black";
  const pose = act === "sleeping" ? "sleep" : act === "eating" ? "eat" : has("running") ? "run" : has("sitting") ? "sit" : has("lying down") ? "lie" : "stand";
  const puppy = has("puppy"), size = has("big") ? 1.1 : has("small") ? 0.72 : puppy ? 0.8 : 0.96, hr = puppy ? 24 : 21;
  const st = `stroke="${C.d}" stroke-width="${name === "white" || spotted ? 2.2 : 1.6}"`, ear = spotted ? "#2e2e33" : name === "white" ? "#d9d2bf" : C.d;
  const head = (hx, hy, closed, down) => `<g${down ? ` transform="rotate(${down} ${hx} ${hy})"` : ""}>
      <circle cx="${hx}" cy="${hy}" r="${hr}" fill="${C.c}" ${st}/>` + (spotted ? `<ellipse cx="${hx + 3}" cy="${hy - 6}" rx="9.5" ry="9" fill="#2e2e33"/>` : "") +
     `<ellipse cx="${hx + hr - 3}" cy="${hy + 8}" rx="13.5" ry="10" fill="${dark ? C.l : C.l}" ${st}/>
      <ellipse cx="${hx + hr + 8}" cy="${hy + 3}" rx="4.8" ry="4" fill="#1b1b1e"/>
      <path d="M${hx + hr - 4} ${hy + 14} q7 3.4 12 -2" stroke="${C.d}" stroke-width="1.6" fill="none" stroke-linecap="round"/>` +
     (closed ? `<path d="M${hx - 1} ${hy - 4} q4.5 4 9 0" stroke="${dark || spotted ? "#f2f2f2" : "#1b1b1e"}" stroke-width="2" fill="none" stroke-linecap="round"/>`
             : `<circle cx="${hx + 4}" cy="${hy - 5}" r="${dark || spotted ? 4.8 : 0}" fill="#fff"/><circle cx="${hx + 4}" cy="${hy - 5}" r="3.3" fill="#17171a"/><circle cx="${hx + 5.2}" cy="${hy - 6.2}" r="1.1" fill="#fff"/>`) +
     `<path d="M${hx - 11} ${hy - 17} Q${hx - 23} ${hy - 12} ${hx - 22} ${hy + 14} Q${hx - 13} ${hy + 22} ${hx - 6} ${hy + 8} Q${hx - 4} ${hy - 8} ${hx - 11} ${hy - 17}Z" fill="${ear}" stroke="${C.d}" stroke-width="1.2"/></g>`;
  const leg = (x, y0, y1, far) => `<rect x="${x - 6}" y="${y0}" width="12" height="${y1 - y0}" rx="6" fill="${far ? C.d : C.c}" ${st}/>`;
  const swing = (d, far) => `<path d="${d}" stroke="${C.d}" stroke-width="13.5" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${far ? C.d : C.c}" stroke-width="10.5" fill="none" stroke-linecap="round"/>`;
  const tail = d => `<path d="${d}" stroke="${C.d}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${C.c}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  const collar = (x0, y0, x1, y1) => `<path d="M${x0} ${y0} L${x1} ${y1}" stroke="${name === "brown" || name === "golden" ? "#3a78bd" : "#d63a32"}" stroke-width="6" stroke-linecap="round"/><circle cx="${x1 + 1}" cy="${y1 + 4}" r="3.2" fill="#f2cf5a" stroke="#b8922c" stroke-width=".8"/>`;
  const spots = a => spotted ? a.map(p => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="${p[2]}" ry="${p[3]}" fill="#2e2e33"/>`).join("") : "";
  let d, mid = [89, 110], extra = "";
  if (pose === "stand" || pose === "eat"){
    const eat = pose === "eat";
    d = `<ellipse cx="86" cy="164" rx="52" ry="5" fill="#000" opacity=".12"/>` + tail("M44 106 Q28 100 25 80") + leg(58, 118, 162, 1) + leg(102, 118, 162, 1) +
      `<ellipse cx="80" cy="112" rx="42" ry="22" fill="${C.c}" ${st}/>` + spots([[66, 104, 10, 7], [92, 118, 8, 6], [50, 116, 6, 5]]) + leg(46, 120, 162) + leg(114, 120, 162) +
      (eat ? `<path d="M104 100 L132 104 L136 128 L112 128 Z" fill="${C.c}"/>` + collar(110, 100, 116, 122) +
             `<path d="M122 150 h42 l-5 14 h-32z" fill="#3a78bd" stroke="#255a94" stroke-width="1.4"/><ellipse cx="143" cy="150" rx="19" ry="4.4" fill="#7a4a26"/>` + head(134, 124, false, 38)
           : `<path d="M102 104 L112 70 L138 92 L120 120 Z" fill="${C.c}"/>` + collar(107, 94, 123, 106) + head(126, 78));
    if (eat) mid = [93, 112];
  } else if (pose === "run"){
    d = `<ellipse cx="86" cy="166" rx="44" ry="4.4" fill="#000" opacity=".1"/><path d="M13 98 h13 M9 112 h15 M15 126 h11" stroke="#b9bec6" stroke-width="3" stroke-linecap="round"/>` +
      tail("M44 104 Q30 92 22 96") + swing("M60 118 Q46 132 34 148", 1) + swing("M104 116 Q120 128 128 144", 1) +
      `<ellipse cx="80" cy="110" rx="42" ry="20" fill="${C.c}" ${st} transform="rotate(-5 80 110)"/>` + swing("M54 116 Q34 122 20 136") + swing("M110 114 Q130 116 146 130") +
      `<path d="M102 100 L116 70 L138 92 L120 116 Z" fill="${C.c}"/>` + collar(108, 92, 124, 104) + head(128, 78);
  } else if (pose === "sit"){
    d = `<ellipse cx="84" cy="166" rx="46" ry="5" fill="#000" opacity=".12"/>` + tail("M46 158 Q28 160 22 146") + leg(104, 110, 163, 1) +
      `<ellipse cx="64" cy="138" rx="27" ry="25" fill="${C.c}" ${st}/><ellipse cx="84" cy="116" rx="23" ry="37" fill="${C.c}" ${st} transform="rotate(20 84 116)"/><ellipse cx="66" cy="140" rx="24" ry="21" fill="${C.c}"/>` +
      `<ellipse cx="76" cy="160" rx="17" ry="6.4" fill="${C.c}" ${st}/>` + leg(96, 112, 164) + collar(92, 86, 110, 94) + head(108, 66);
    mid = [84, 105];
  } else {                                                 // lying down, awake or asleep
    const sleep = pose === "sleep";
    d = `<ellipse cx="84" cy="165" rx="56" ry="5" fill="#000" opacity=".12"/>` + tail("M30 148 Q12 150 10 136") +
      `<ellipse cx="46" cy="138" rx="24" ry="21" fill="${C.c}" ${st}/><ellipse cx="76" cy="142" rx="46" ry="18" fill="${C.c}" ${st}/><ellipse cx="50" cy="140" rx="21" ry="17" fill="${C.c}"/>` +
      spots([[62, 134, 10, 6.5], [90, 146, 8, 5.5], [40, 132, 7, 6]]) + `<ellipse cx="54" cy="159" rx="15" ry="5.6" fill="${C.c}" ${st}/>` +
      `<rect x="98" y="144" width="50" height="11" rx="5.5" fill="${C.d}" ${st}/><rect x="102" y="150" width="50" height="11.5" rx="5.7" fill="${C.c}" ${st}/>` +
      (sleep ? head(122, 136, true, 12) : collar(100, 126, 112, 138) + head(120, 112));
    if (sleep) extra = zed(112, 74, 9) + zed(121, 53, 12.5) + zed(131, 27, 17);
    mid = [84, 130];
  }
  return mk(`<g transform="translate(80 ${pose === "lie" || pose === "sleep" ? 128 : 108}) scale(${size}) translate(${-mid[0]} ${-mid[1]})">${d}</g>${extra}`);
}
function dog(spec){
  spec = spec || {};
  const n = spec.count || 1;
  return n > 1 ? group(n, () => oneDog(spec)) : oneDog(spec);
}

/* ---------- a car, seen from the side ---------- */
function oneCar(spec){
  const L = (spec.looks || []).map(x => String(x).toLowerCase()), has = x => L.indexOf(x) >= 0, u = "pcar" + (seq++) + "_";
  const M = METAL[["red", "black", "green", "blue"].find(has) || "red"], old = has("old"), sports = has("sports"), small = has("small");
  const wheel = x => `<circle cx="${x}" cy="140" r="15.5" fill="#26272c"/><circle cx="${x}" cy="140" r="7.4" fill="#d5d8dc" stroke="#8b8f96" stroke-width="1.4"/>` + (old ? `<path d="M${x - 7} 140 h14 M${x} 133 v14" stroke="#8b8f96" stroke-width="1.4"/>` : "");
  const body = old
    ? `<path d="M22 138 V112 Q22 108 26 108 H50 V74 Q50 68 56 68 H106 Q112 68 113 74 L118 104 H142 Q150 104 150 112 V138 Z" fill="url(#${u}m)" stroke="${M.d}" stroke-width="1.6" stroke-linejoin="round"/>
       <path d="M58 76 H80 V102 H58Z M86 76 H104 L108 102 H86Z" fill="#cfe6f5" stroke="${M.d}" stroke-width="1.2"/><circle cx="150" cy="112" r="6" fill="#f6e08a" stroke="#8b8f96" stroke-width="1.4"/>
       <path d="M24 126 Q46 108 68 126 M96 126 Q118 108 140 126" stroke="${M.d}" stroke-width="5" fill="none"/><path d="M62 138 H102" stroke="${M.d}" stroke-width="4"/>`
    : `<path d="M12 128 Q12 110 30 108 L48 106 Q60 82 78 80 H104 Q118 82 128 104 L142 108 Q150 110 150 124 V134 Q150 139 146 139 H16 Q12 139 12 134 Z" fill="url(#${u}m)" stroke="${M.d}" stroke-width="1.6" stroke-linejoin="round"/>
       <path d="M55 105 Q64 88 78 86 H88 V105Z M94 86 H103 Q112 88 121 105 H94Z" fill="#cfe6f5" stroke="${M.d}" stroke-width="1.2"/>
       <path d="M91 108 V134 M30 116 H140" stroke="${M.d}" stroke-width="1.3" opacity=".55" fill="none"/><rect x="143" y="113" width="7" height="8" rx="2" fill="#f6e08a"/><rect x="12" y="114" width="5" height="8" rx="2" fill="#d63a32"/>
       <path d="M24 112 Q60 104 90 110" stroke="#fff" stroke-width="2.4" fill="none" opacity=".35" stroke-linecap="round"/>` + (sports ? `<path d="M12 106 h22 v5 h-6 v6 h-5 v-6 h-11z" fill="${M.d}"/>` : "");
  const sx = small ? 0.76 : sports ? 1 : old ? 0.94 : 0.98, sy = small ? 0.8 : sports ? 0.74 : old ? 1.06 : 0.98;
  return mk(`<defs><linearGradient id="${u}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${M.l}"/><stop offset=".4" stop-color="${M.c}"/><stop offset="1" stop-color="${M.d}"/></linearGradient></defs>
    <ellipse cx="80" cy="${r2(110 + 47 * sy)}" rx="${r2(72 * sx)}" ry="5" fill="#000" opacity=".12"/>
    <g transform="translate(80 110) scale(${sx} ${sy}) translate(-81 -110)">${body}</g>
    <g transform="translate(80 110) scale(${sx}) translate(-81 ${r2(-110 + (sy - sx) * 30 / sx)})">${wheel(old ? 46 : 46)}${wheel(old ? 118 : 118)}</g>`);
}
function car(spec){
  spec = spec || {};
  const n = spec.count || 1;
  return n > 1 ? group(n, () => oneCar(spec)) : oneCar(spec);
}


/* ---------- actions that the learner does, the teacher shows and Pierre and Sylvie are pictured doing ----------
   PICS.action(act, who, opts): act "dance" | "jump" | "smile" | "stand up" | "sit down" | "walk"; who "you" | "marie" | "paul" | "julie";
   opts.still = true gives one frozen frame. The figure is the usual head and shoulders, half size, on a jointed body; the joints
   are turned by SMIL <animateTransform> (no script timers), so the picture loops by itself wherever it is put.
   The poses were drawn from the Mulberry symbols (dance, jump, sit, stand, walk, get out of chair, smile) and from photographs
   of people jumping and walking (Stanford 40 Actions): a jump is knees tucked, arms flung up and the ground left behind; a dance is
   one arm up, the other out, one leg kicked to the side, the body swaying; a walk is a scissor stride with the arms low. */
const ACT_OF = { dancing: "dance", dance: "dance", jumping: "jump", jump: "jump", smiling: "smile", smile: "smile", standing: "stand up", stand: "stand up",
  sitting: "sit down", sit: "sit down", walking: "walk", walk: "walk" };
const WHO_NAME = { paul: "Pierre", julie: "Sylvie", marie: "Marie" };
const POSE0 = { rx: 0, ry: 0, bx: 0, by: 0, br: 0, aL: [0, 0], aR: [0, 0], lL: [0, 0], lR: [0, 0], sh: 1 };
const SEATED = { rx: 2, ry: 26, lL: [-90, 90], lR: [-90, 90], aL: [-4, -70], aR: [-8, -75] },
      RISING = { rx: 13, ry: 9, br: 14, lL: [-48, 58], lR: [-48, 58], aL: [-26, -30], aR: [-34, -28] },
      UPRIGHT = { rx: 28, ry: 0, lL: [0, 0], lR: [0, 0], aL: [3, 0], aR: [-3, 0] };
const D_A = { rx: -6, br: -11, aL: [158, -22], aR: [-108, -42], lL: [10, 0], lR: [-56, 34] }, D_M = { ry: 1, aL: [100, -70], aR: [-100, 70], lL: [12, -22], lR: [-12, 22] },
      D_B = { rx: 6, br: 11, aR: [-158, 22], aL: [108, 42], lR: [-10, 0], lL: [56, -34] };
const J_C = { ry: 5.3, lL: [28, -52], lR: [-28, 52], aL: [18, 10], aR: [-18, -10] }, J_UP = { ry: -22, lL: [42, -86], lR: [-42, 86], aL: [152, -12], aR: [-152, 12], sh: 0.5 };
const MOVES = {
  dance: { dur: 1.2, kt: [0, 0.25, 0.5, 0.75, 1], poses: [D_A, D_M, D_B, D_M, D_A], still: 0, scale: 1.1 },
  jump: { dur: 1.2, kt: [0, 0.2, 0.44, 0.58, 0.82, 1], poses: [J_C, { ry: -3, lL: [4, 0], lR: [-4, 0], aL: [100, 10], aR: [-100, -10] }, J_UP,
      Object.assign({}, J_UP, { ry: -20 }), { ry: 0, lL: [6, 0], lR: [-6, 0], aL: [70, 10], aR: [-70, -10] }, J_C], still: 2, scale: 1.04 },
  walk: { dur: 1.1, kt: [0, 0.25, 0.5, 0.75, 1], linear: true, side: true, scale: 1.1, still: 0, poses: [
      { ry: 4, lR: [-24, 2], lL: [24, 26], aL: [26, -4], aR: [-28, -18] }, { lR: [0, 0], lL: [-14, 60], aL: [10, -6], aR: [-10, -10] },
      { ry: 4, lL: [-24, 2], lR: [24, 26], aL: [-5, -12], aR: [6, -4] }, { lL: [0, 0], lR: [-14, 60], aL: [10, -6], aR: [-10, -10] },
      { ry: 4, lR: [-24, 2], lL: [24, 26], aL: [26, -4], aR: [-28, -18] }] },
  "stand up": { dur: 2.6, kt: [0, 0.14, 0.36, 0.56, 1], poses: [SEATED, SEATED, RISING, UPRIGHT, UPRIGHT], side: true, chair: true, still: 2, scale: 1.08, ox: -12 },
  "sit down": { dur: 2.6, kt: [0, 0.14, 0.36, 0.56, 1], poses: [UPRIGHT, UPRIGHT, RISING, SEATED, SEATED], side: true, chair: true, still: 2, scale: 1.08, ox: -12 }
};
function action(act, who, opts){
  opts = opts || {};
  act = ACT_OF[String(act || "").toLowerCase().split(/[ ,]/)[0]] || "smile";
  who = who === "marie" || who === "paul" || who === "julie" ? who : "you";
  const still = !!opts.still, spec = { person: who }, name = who === "you" ? "" : (opts.name || WHO_NAME[who]);
  if (opts.looks && opts.looks.length) spec.looks = opts.looks;
  if (act === "smile"){ spec._smile = still ? "still" : "anim"; return bust(spec, name); }
  const c = traits(spec), L = c.L, K = MOVES[act], u = "pa" + (seq++) + "_", skin = c.skin;
  const outerName = L.coat ? c.coat : L.suit ? c.suit : null, sleeve = outerName ? COL[outerName] : c.top;
  const legs = L.suit ? COL[c.suit] : who === "paul" ? COL.navy : who === "julie" ? COL.charcoal : who === "marie" ? ["#77614f", "#5a4738"] : ["#5a6272", "#3f4654"];
  const P = K.poses.map(p => Object.assign({}, POSE0, p)), n = P.length, si = K.still;
  const SY = 97, UA = 21, FA = 20, AW = 9.5, HY = 126, TH = 26, SH = 26, LW = 12;
  const timing = `keyTimes="${K.kt.join(";")}" dur="${K.dur}s" repeatCount="indefinite"` + (K.linear ? "" : ` calcMode="spline" keySplines="${Array(n - 1).fill("0.4 0 0.6 1").join(";")}"`);
  const G = (type, vals, inner) => `<g transform="${type}(${vals[si]})">` + (still || vals.every(v => v === vals[0]) ? "" : `<animateTransform attributeName="transform" type="${type}" values="${vals.join(";")}" ${timing}/>`) + inner + `</g>`;
  const seg = (x, y, len, w, pair) => `<path d="M${x} ${y} v${len}" stroke="${pair[1]}" stroke-width="${w + 2}" stroke-linecap="round"/><path d="M${x} ${y} v${len}" stroke="${pair[0]}" stroke-width="${w - 1.4}" stroke-linecap="round"/>`;
  const leg = (hx, key, pair, toe) => G("rotate", P.map(p => `${p[key][0]} ${hx} ${HY}`), seg(hx, HY, TH, LW, pair) +
    G("rotate", P.map(p => `${p[key][1]} ${hx} ${HY + TH}`), `<ellipse cx="${hx + toe}" cy="${HY + TH + SH - 2.6}" rx="${K.side ? 9.5 : 8}" ry="4.6" fill="#2c2623"/>` + seg(hx, HY + TH, SH - 5, LW - 1.5, pair)));
  const arm = (sx, key) => G("rotate", P.map(p => `${p[key][0]} ${sx} ${SY}`), seg(sx, SY, UA, AW, sleeve) +
    G("rotate", P.map(p => `${p[key][1]} ${sx} ${SY + UA}`), `<circle cx="${sx}" cy="${SY + UA + FA}" r="5.6" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1"/>` + seg(sx, SY + UA, FA - 4, AW - 1, sleeve)));
  const far = [legs[1], legs[1]];
  const body = (K.side ? leg(77, "lL", far, 4) + leg(84, "lR", legs, 4) : leg(72, "lL", legs, -2) + leg(88, "lR", legs, 2)) +
    `<path d="M55.5 111 H104.5 L101.5 129 Q80 136 58.5 129 Z" fill="${legs[1]}"/><rect x="52.4" y="108" width="55.2" height="8" rx="3" fill="${sleeve[1]}"/>` +
    G("translate", P.map(p => `${p.bx} ${p.by}`), G("rotate", P.map(p => `${p.br} 80 118`), (K.side ? arm(57.5, "aL") : "") + `<g class="bust" transform="translate(43.2 27) scale(.46)"></g>` + (K.side ? "" : arm(57.5, "aL")) + arm(102.5, "aR")));
  let back = "", front = "";
  const loop = (attrs, dur, extra) => still ? "" : `<animateTransform attributeName="transform" ${attrs} dur="${dur}s" repeatCount="indefinite"${extra || ""}/>`;
  if (K.chair){
    back += `<ellipse cx="74" cy="181" rx="40" ry="4" fill="#000" opacity=".1"/>
      <path d="M49 161 L44 100 M57 161 L55 100" stroke="#6e5140" stroke-width="5" stroke-linecap="round"/><path d="M41 101 Q49 96 58 100 L57.4 111 Q49 108 42 112 Z" fill="#7f604c" stroke="#5e4535" stroke-width="1.2"/>
      <path d="M43 124 Q50 121 56.6 123 M44 138 Q50 135 56.8 137" stroke="#6e5140" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M50 164 L48 180 M94 164 L96 180" stroke="#5e4535" stroke-width="5" stroke-linecap="round"/><rect x="44" y="158.5" width="56" height="8" rx="3.5" fill="#8a6a52" stroke="#5e4535" stroke-width="1.2"/>`;
    if (still){ const up = act === "stand up", ax = 132, y0 = up ? 96 : 52, y1 = up ? 52 : 96, hd = up ? 1 : -1;      // which way: an arrow, only in the frozen frame
      front += `<path d="M${ax} ${y0} V${y1 + hd * 4}" stroke="#3fae5a" stroke-width="7" stroke-linecap="round"/><path d="M${ax - 11} ${y1 + hd * 12} L${ax} ${y1} L${ax + 11} ${y1 + hd * 12}" stroke="#3fae5a" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; }
  } else {
    back += `<g transform="translate(80 181)">` + G("scale", P.map(p => `${p.sh}`), `<ellipse cx="0" cy="0" rx="30" ry="4.2" fill="#000" opacity=".13"/>`) + `</g>`;
  }
  if (act === "walk"){                                      // the ground slides back under the feet (walking on the spot); frozen: marks behind
    back += `<clipPath id="${u}g"><rect x="26" y="176" width="108" height="14"/></clipPath><g clip-path="url(#${u}g)"><g>` + loop(`type="translate" values="0 0;-26 0"`, 0.55) +
      [30, 56, 82, 108, 134, 160].map(x => `<path d="M${x} 186.5 h11" stroke="#b9bec6" stroke-width="3" stroke-linecap="round"/>`).join("") + `</g></g>`;
    if (still) front += `<path d="M22 112 h14 M16 126 h18 M22 140 h14" stroke="#b9bec6" stroke-width="3.4" stroke-linecap="round"/>`;
  }
  if (act === "jump" && still) front += `<path d="M62 160 Q80 169 98 160 M68 170 Q80 175.5 92 170" stroke="#b9bec6" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  if (act === "dance"){                                     // music in the air: two notes that bob
    const note = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="6" ry="4.4" fill="#6a55b8" transform="rotate(-20)"/><path d="M5.4 -1 V-22 q9 2 11 10" stroke="#6a55b8" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
    front += `<g>` + loop(`type="translate" values="0 0;0 -5;0 0"`, 0.6) + note(24, 62, 1) + `</g><g>` + loop(`type="translate" values="0 -5;0 0;0 -5"`, 0.6) + note(128, 50, 0.85) + `</g>`;
  }
  const S = K.scale || 1;
  /* Standing up and sitting down are shown one way only (Jon, 10 Nov 2026: "it shows both standing up and sitting down.
     That's confusing since it could be trying to teach both … It should only show the action it is currently teaching").
     The loop used to snap from the last pose back to the first, which reads as the opposite action. Now the figure fades
     out at the end of the movement and comes back already in the starting pose. */
  const fade = (K.chair && !still) ? `<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.82;0.93;1" dur="${K.dur}s" repeatCount="indefinite"/>` : "";
  const g = mk((K.chair ? "" : back) + `<g transform="translate(${80 + (K.ox || 0)} 178) scale(${S}) translate(-80 -178)">` + (K.chair ? back : "") +
    `<g>` + fade + G("translate", P.map(p => `${p.rx} ${p.ry}`), body) + `</g></g>` + front);
  g.querySelector("g.bust").appendChild(bust(spec, name));
  return g;
}

window.PICS = { person, key, group, fingers, dog, car, action };
})();
