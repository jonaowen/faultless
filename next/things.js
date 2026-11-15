/* things.js: the pictures that are not people (the overhaul's things workstream). Plain JavaScript, no dependencies.
   Loads AFTER people.js. Defines window.THINGS:

     THINGS.one(spec)     ONE thing as an SVG <g> in the 160 x 190 picture box, or null when this file has no drawing of that kind (or of
                          those looks) yet: the caller then keeps its present drawing. spec is the course's entity: {is, looks, count ...};
                          count is NOT read here (the caller lays several out, as it does now).
     THINGS.kinds         the kinds drawn here so far
     THINGS.can(spec)     true when THINGS.one(spec) would draw

   Every picture: no card, no frame, transparent ground (the card face #FFFDF8 is assumed behind it); the subject fitted to x 12-148,
   y 14-176; light from the upper left (37 degrees off the vertical); flat tones: a lit tone, ONE shade tone on the side away from the
   light, a thin lighter rim on the lit edge of the large forms; no outlines; a soft shadow on the ground; no written word anywhere.
   Until people.js and index.html call THINGS.one themselves (see install below), this file wraps PICS.thing and PICS.car so that the
   pictures a lesson asks for by name are the new ones; things drawn inside other pictures (on a table, in a box, in a hand) stay as they
   were until the hook is in. */
(function(){
"use strict";
const NS = "http://www.w3.org/2000/svg", RAD = Math.PI / 180;
let seq = 0;
const uid = () => "th" + (seq++);
const r1 = n => Math.round(n * 10) / 10;
const mk = html => { const g = document.createElementNS(NS, "g"); g.innerHTML = html; return g; };

/* ---------- colour: a material is a pair [lit, shade]; the other tones are derived as the figures derive theirs ---------- */
const h2 = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const hx = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { const A = h2(a), B = h2(b); return hx(A.map((v, i) => v + (B[i] - v) * t)); };
const INK = "#1d2233", FACE = "#FFFDF8";
const P = (l, s) => ({ l, s, r: mix(l, "#ffffff", 0.42), m: mix(l, s, 0.42), fl: mix(l, s, 0.62), fs: mix(s, INK, 0.2) });
const far = (p, t) => P(mix(p.l, FACE, t), mix(p.s, FACE, t));        // a thing further off: paler (the air), never darker
const C = {
  red: P("#DB4D3A", "#AB3529"), blue: P("#4489C8", "#2D659C"), green: P("#2F9160", "#1F6C46"), yellow: P("#F3BC3F", "#C8911F"),
  black: P("#4C5366", "#2C3142"), white: P("#FBF8F0", "#D9D3C4"), orange: P("#EE8B3A", "#C2651F"), purple: P("#8E6BBF", "#684A95"),
  pink: P("#EE8FA8", "#C7647F"), brown: P("#A9764A", "#7E5433"), grey: P("#AEB5C0", "#838B99"), silver: P("#C9CFD8", "#9AA2B0"),
  cream: P("#F8EBD0", "#DAC39C"), stone: P("#D6D1C6", "#A9A397"), brick: P("#CD7453", "#A05139"), wood: P("#DDAA6C", "#B58349"),
  tile: P("#DE6A45", "#AE472D"), slate: P("#6E7A92", "#4C576E"), glass: P("#CBE6F0", "#98C1D6"), leaf: P("#77B97F", "#4F9462"),
  grass: P("#B5D99A", "#94C27B"), paper: P("#FCF6E6", "#DDD1B8"), steel: P("#B9C0CB", "#8C94A3"), dark: P("#3A4254", "#272D3C"),
  gold: P("#F3BC3F", "#C8911F"), paving: P("#EAE2D0", "#D2C7B0") };
const colour = (k, def) => C[k.cn] || C[def] || def;

/* ---------- two-dimensional kit ---------- */
const fill = (d, c, x) => `<path d="${d}" fill="${c}"${x ? " " + x : ""}/>`;
const rect = (x, y, w, h, c, r, x2) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}"${r ? ` rx="${r}"` : ""} fill="${c}"${x2 ? " " + x2 : ""}/>`;
const circ = (cx, cy, r, c, x) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${c}"${x ? " " + x : ""}/>`;
const line = (d, c, w, x) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${x ? " " + x : ""}/>`;
const poly = pts => "M" + pts.map(p => r1(p[0]) + " " + r1(p[1])).join("L") + "Z";
const rrd = (x, y, w, h, r) => `M${r1(x + r)} ${r1(y)}H${r1(x + w - r)}Q${r1(x + w)} ${r1(y)} ${r1(x + w)} ${r1(y + r)}V${r1(y + h - r)}Q${r1(x + w)} ${r1(y + h)} ${r1(x + w - r)} ${r1(y + h)}H${r1(x + r)}Q${r1(x)} ${r1(y + h)} ${r1(x)} ${r1(y + h - r)}V${r1(y + r)}Q${r1(x)} ${r1(y)} ${r1(x + r)} ${r1(y)}Z`;
const cd = (cx, cy, r) => `M${r1(cx - r)} ${r1(cy)}a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0Z`;
function rpoly(pts, r){                                    // a polygon with its corners rounded
  const n = pts.length; let d = "";
  for (let i = 0; i < n; i++){
    const a = pts[(i + n - 1) % n], b = pts[i], c = pts[(i + 1) % n];
    const la = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, lc = Math.hypot(c[0] - b[0], c[1] - b[1]) || 1, k = Math.min(r, la / 2, lc / 2);
    const p = [b[0] + (a[0] - b[0]) * k / la, b[1] + (a[1] - b[1]) * k / la], q = [b[0] + (c[0] - b[0]) * k / lc, b[1] + (c[1] - b[1]) * k / lc];
    d += (i ? "L" : "M") + r1(p[0]) + " " + r1(p[1]) + "Q" + r1(b[0]) + " " + r1(b[1]) + " " + r1(q[0]) + " " + r1(q[1]);
  }
  return d + "Z";
}
/* a form in the figures' finish: the whole outline in the shade tone; the same outline moved toward the light leaves the ONE shade shape
   on the lower right; a thin rim of the lighter tone stays on the lit edge. k: how wide the shade is; rim: how wide the rim (0: none) */
function solid(d, p, o){
  o = o || {};
  const k = o.k == null ? 5 : o.k, rim = o.rim == null ? 1.2 : o.rim, a = uid(), b = uid(), sx = r1(-0.6 * k), sy = r1(-0.8 * k);
  return `<clipPath id="${a}"><path d="${d}"/></clipPath><clipPath id="${b}"><path d="${d}" transform="translate(${sx} ${sy})"/></clipPath>` +
    `<path d="${d}" fill="${p.s}"/><g clip-path="url(#${a})"><path d="${d}" transform="translate(${sx} ${sy})" fill="${rim ? p.r : p.l}"/>` +
    (rim ? `<g clip-path="url(#${b})"><path d="${d}" transform="translate(${r1(rim * 0.6)} ${r1(rim * 0.8)})" fill="${p.l}"/></g>` : "") + `</g>`;
}
const clipped = (d, inner) => { const a = uid(); return `<clipPath id="${a}"><path d="${d}"/></clipPath><g clip-path="url(#${a})">${inner}</g>`; };
function ground(cx, cy, rx, ry, op){                       // the soft shadow a thing stands on
  const a = uid(), o = op || 0.26;
  return `<radialGradient id="${a}"><stop offset="0" stop-color="${INK}" stop-opacity="${o}"/><stop offset=".55" stop-color="${INK}" stop-opacity="${r1(o * 6) / 10}"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></radialGradient>` +
    `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="url(#${a})"/>`;
}

/* ---------- one camera for things with sides (houses, trains, books): points in space, projected; a face takes its tone from where it
   faces. x to the right, y up, z toward the viewer; yaw turns the thing about the upright, pitch looks down on it. ---------- */
function scene(yaw, pitch, D){
  const cy = Math.cos(yaw * RAD), sy = Math.sin(yaw * RAD), cp = Math.cos(pitch * RAD), sp = Math.sin(pitch * RAD), dist = D || 900;
  const items = [], bb = [1e9, 1e9, -1e9, -1e9], LV = [-0.5, 0.74, 0.45];
  const view = p => { const xr = p[0] * cy + p[2] * sy, zr = -p[0] * sy + p[2] * cy; return [xr, p[1] * cp - zr * sp, zr * cp + p[1] * sp]; };
  const pr = p => { const v = view(p), s = dist / (dist - v[2]); return [v[0] * s, -v[1] * s, v[2]]; };
  const grow = q => { bb[0] = Math.min(bb[0], q[0]); bb[1] = Math.min(bb[1], q[1]); bb[2] = Math.max(bb[2], q[0]); bb[3] = Math.max(bb[3], q[1]); };
  const dot = pts => { const a = view(pts[0]), b = view(pts[1]), c = view(pts[2]), u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    let n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]; const l = Math.hypot(n[0], n[1], n[2]) || 1; if (n[2] < 0) n = n.map(v => -v);
    return (n[0] * LV[0] + n[1] * LV[1] + n[2] * LV[2]) / l; };
  const S = {
    pr,
    /* a flat face. mat: a material (the tone is chosen by the light) or a plain colour. o.t forces the tone; o.layer orders (higher is
       nearer; within a layer the further face is drawn first); o.r rounds the corners; o.nb: not counted in the picture's extent */
    face(pts, mat, o){ o = o || {};
      const q = pts.map(pr); if (!o.nb) q.forEach(grow);
      const d = dot(pts), t = o.t || (d > 0.5 ? "l" : d > 0.16 ? "m" : "s"), c = typeof mat === "string" ? mat : mat[t];
      items.push({ k: (o.layer || 0) * 1e5 + q.reduce((s, p) => s + p[2], 0) / q.length + (o.z || 0),
        s: `<path d="${rpoly(q, o.r == null ? 0.8 : o.r)}" fill="${c}"${o.op ? ` opacity="${o.op}"` : ""}/>` });
      return S; },
    line(pts, c, w, o){ o = o || {}; const q = pts.map(pr); if (!o.nb) q.forEach(grow);
      items.push({ k: (o.layer || 0) * 1e5 + q.reduce((s, p) => s + p[2], 0) / q.length + (o.z || 0),
        s: `<path d="M${q.map(p => r1(p[0]) + " " + r1(p[1])).join("L")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o.op ? ` opacity="${o.op}"` : ""}/>` });
      return S; },
    /* a disc: centre c, radius r, lying in the plane across the axis "x", "y" or "z" */
    disc(c, r, axis, mat, o){ const pts = []; for (let i = 0; i < 20; i++){ const a = i * Math.PI / 10, u = Math.cos(a) * r, v = Math.sin(a) * r;
        pts.push(axis === "x" ? [c[0], c[1] + u, c[2] + v] : axis === "y" ? [c[0] + u, c[1], c[2] + v] : [c[0] + u, c[1] + v, c[2]]); }
      return S.face(pts, mat, Object.assign({ r: 0 }, o)); },
    /* a box by its two corners; only the faces named in o.show ("f" front z+, "b" back, "r" right x+, "l" left, "t" top, "u" under) */
    box(a, b, mat, o){ o = o || {}; const [x0, y0, z0] = a, [x1, y1, z1] = b, sh = o.show || "frt";
      if (sh.indexOf("f") >= 0) S.face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], mat, o);
      if (sh.indexOf("b") >= 0) S.face([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], mat, o);
      if (sh.indexOf("r") >= 0) S.face([[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], mat, o);
      if (sh.indexOf("l") >= 0) S.face([[x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1]], mat, o);
      if (sh.indexOf("t") >= 0) S.face([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], mat, o);
      return S; },
    /* the picture: everything fitted to the box (the subject fills its card, standing on the ground line) */
    out(o){ o = o || {};
      const x0 = o.x0 == null ? 13 : o.x0, x1 = o.x1 == null ? 147 : o.x1, y0 = o.y0 == null ? 16 : o.y0, y1 = o.y1 == null ? 172 : o.y1;
      const w = bb[2] - bb[0], h = bb[3] - bb[1], f = Math.min((x1 - x0) / w, (y1 - y0) / h), by = o.mid ? (y0 + y1) / 2 + h * f / 2 : y1;
      items.sort((a, b) => a.k - b.k);
      return `<g transform="translate(${r1((x0 + x1) / 2 - (bb[0] + w / 2) * f)} ${r1(by - bb[3] * f)}) scale(${Math.round(f * 1000) / 1000})">${items.map(i => i.s).join("")}</g>`; }
  };
  return S;
}
/* the shadow on the ground under a footprint (x0..x1, z0..z1): two soft steps, falling to the right, away from the light */
function cast(S, x0, x1, z0, z1, o){
  o = o || {}; const g = o.g == null ? 6 : o.g, c = o.c || INK, op = o.op || 0.1;
  const ring = (m, dx) => { const pts = []; const cx = (x0 + x1) / 2 + dx, cz = (z0 + z1) / 2, rx = (x1 - x0) / 2 + m, rz = (z1 - z0) / 2 + m;
    for (let i = 0; i < 24; i++){ const a = i * Math.PI / 12, ca = Math.cos(a), sa = Math.sin(a), e = 0.5;      // a rounded box (a squircle)
      pts.push([cx + rx * Math.sign(ca) * Math.pow(Math.abs(ca), e), 0.05, cz + rz * Math.sign(sa) * Math.pow(Math.abs(sa), e)]); }
    return pts; };
  S.face(ring(g, g * 0.9), c, { layer: -5, op, r: 0, nb: true }); S.face(ring(g * 0.3, g * 0.5), c, { layer: -5, z: 1, op, r: 0, nb: true });
}

/* ================================================================ a house (une maison) ================================================================
   ONE building standing alone on its own grass: a pitched roof, a chimney, one door, a few large windows with shutters. Seen from its
   corner (the door's wall in the light, the long wall in the shade). Against a town (many small buildings, a spire), a restaurant (a street
   front under an awning, tables) and a door (the door alone, as large as the card).
   looks: "red roof" (cream walls, red tiles: the usual one) | "brick, tall" (a narrow house of three floors) | "stone" | "wooden" */
function house(k){
  const V = k.has("brick", "tall") ? "brick" : k.has("stone") ? "stone" : k.has("wooden", "wood") ? "wood" : "red";
  const G = { red:   { w: 66, L: 86, h: 46, rise: 36, wall: C.cream, roof: C.red, shut: P("#5F97BD", "#44749B"), door: P("#5F97BD", "#44749B"), floors: 1 },
              brick: { w: 50, L: 56, h: 98, rise: 28, wall: C.brick, roof: C.slate, shut: null, door: P("#3F6DA8", "#2C4F80"), floors: 3 },
              stone: { w: 70, L: 94, h: 44, rise: 32, wall: C.stone, roof: C.slate, shut: P("#7DAA7B", "#5A875C"), door: C.brown, floors: 1, arch: 1 },
              wood:  { w: 66, L: 84, h: 44, rise: 42, wall: C.wood, roof: P("#5B7F86", "#3F5E66"), shut: null, door: P("#FBF8F0", "#D9D3C4"), floors: 1, trim: 1 } }[V];
  if (k.cn && V === "red" && !k.has("roof")) G.wall = colour(k);          // a colour alone: the walls (as now)
  else if (k.cn && k.has("roof")) G.roof = colour(k);
  const { w, L, h, rise } = G, W = G.wall, R = G.roof, hw = w / 2, hl = L / 2, S = scene(-40, 9, 620);
  const e = 5, o = 5, yE = h - e * rise / hw, yP = x => h + rise * (1 - Math.abs(x) / hw);
  const WIN = "#FFFFFF", glassL = C.glass.l, glassS = mix(C.glass.s, C.slate.l, 0.25);
  // the grass, and the house's shadow on it
  { const pts = []; for (let i = 0; i < 28; i++){ const a = i * Math.PI / 14; pts.push([Math.cos(a) * (hw + 17) + 3, 0, Math.sin(a) * (hl + 15)]); } S.face(pts, C.grass.l, { layer: -9, r: 0, t: "l" }); }
  cast(S, -hw, hw, -hl, hl, { c: "#3F7A4A", op: 0.2, g: 7 });
  // walls
  S.face([[-hw, 0, hl], [hw, 0, hl], [hw, h, hl], [0, h + rise, hl], [-hw, h, hl]], W, { t: "l", r: 0.6 });
  S.face([[hw, 0, hl], [hw, 0, -hl], [hw, h, -hl], [hw, h, hl]], W, { t: "s", r: 0.6 });
  const F = (x0, y0, x1, y1, m, oo) => S.face([[x0, y0, hl + 0.3], [x1, y0, hl + 0.3], [x1, y1, hl + 0.3], [x0, y1, hl + 0.3]], m, Object.assign({ layer: 2 }, oo));       // on the front wall
  const Sd = (z0, y0, z1, y1, m, oo) => S.face([[hw + 0.3, y0, z0], [hw + 0.3, y0, z1], [hw + 0.3, y1, z1], [hw + 0.3, y1, z0]], m, Object.assign({ layer: 2 }, oo));       // on the side wall
  // the walls' own look
  if (V === "brick"){ for (let r = 0; r < 12; r++) for (let c = 0; c < 3; c++) if ((r * 7 + c * 5) % 4 !== 1){ const x = -hw + 5 + c * 15 + (r % 2) * 6, y = 5 + r * 7.6; if (x + 8 < hw - 2) F(x, y, x + 8, y + 2.6, mix(W.l, W.r, (r + c) % 2 ? 0.5 : 0), { r: 0.5, t: "l", layer: 1 }); }
    for (let r = 0; r < 12; r++) for (let c = 0; c < 3; c++) if ((r * 5 + c * 3) % 4 === 1){ const z = hl - 8 - c * 17 - (r % 2) * 6, y = 5 + r * 7.6; if (z - 9 > -hl + 2) Sd(z, y, z - 9, y + 2.6, W.fs, { r: 0.5, t: "s", layer: 1 }); } }
  if (V === "stone"){ [[-26, 6, 12, 7], [10, 4, 13, 6], [-30, 30, 9, 6], [20, 22, 11, 6], [-8, 36, 10, 5], [-18, 18, 9, 5], [22, 38, 9, 5]].forEach(([x, y, a, b], i) => F(x, y, x + a, y + b, i % 2 ? W.r : mix(W.l, W.s, 0.45), { r: 2, t: "l", layer: 1 }));
    [[30, 6, 14, 7], [-10, 4, 13, 6], [10, 30, 12, 6], [-34, 30, 11, 6], [-28, 14, 10, 5]].forEach(([z, y, a, b]) => Sd(z, y, z - a, y + b, W.fs, { r: 2, t: "s", layer: 1 })); }
  if (V === "wood"){ for (let y = 6; y < h + rise - 6; y += 6.5){ const x = y > h ? hw * (1 - (y - h) / rise) - 1.5 : hw; S.line([[-x, y, hl + 0.3], [x, y, hl + 0.3]], W.s, 0.9, { layer: 1, op: 0.75 }); if (y < h) S.line([[hw + 0.3, y, hl], [hw + 0.3, y, -hl]], W.fs, 0.9, { layer: 1, op: 0.8 }); } }
  // the eaves' shadow on the side wall
  Sd(hl, h - 7, -hl, h, W.fs, { r: 0, t: "s", layer: 1 });
  // door and windows of the front wall (in the light)
  const dw = V === "brick" ? 13 : 15, dh = V === "brick" ? 27 : 30, dx = V === "brick" ? -10 : V === "red" || V === "stone" ? -12 : 0;
  const door = () => { F(dx - dw / 2 - 2, 0, dx + dw / 2 + 2, dh + 2, G.trim ? WIN : W.r, { r: G.arch ? 6 : 1 }); F(dx - dw / 2, 0, dx + dw / 2, dh, G.door, { t: "l", r: G.arch ? 5 : 0.8, z: 0.2 });
    F(dx - dw / 2 + 2.5, dh * 0.5, dx + dw / 2 - 2.5, dh - 3, G.door, { t: "s", r: 1, z: 0.4 }); S.disc([dx + dw / 2 - 3, dh * 0.42, hl + 0.6], 1.3, "z", C.gold.l, { layer: 2, z: 0.6, t: "l" });
    S.box([dx - dw / 2 - 4, 0, hl], [dx + dw / 2 + 4, 2.4, hl + 7], C.stone, { layer: 2, z: 0.8 }); };
  const win = (put, a, y, ww, wh, lit) => { const gl = lit ? glassL : glassS, fr = lit ? WIN : mix(WIN, W.s, 0.25), s = G.shut;
    if (s){ put(a - ww / 2 - ww * 0.48, y - 0.5, a - ww / 2 - 0.6, y + wh + 0.5, s, { t: lit ? "l" : "s", r: 0.6 }); put(a + ww / 2 + 0.6, y - 0.5, a + ww / 2 + ww * 0.48, y + wh + 0.5, s, { t: lit ? "m" : "fs", r: 0.6 }); }
    put(a - ww / 2 - 1.6, y - 1.6, a + ww / 2 + 1.6, y + wh + 1.6, fr, { r: 1, z: 0.2 }); put(a - ww / 2, y, a + ww / 2, y + wh, gl, { r: 0.6, z: 0.4 });
    put(a - 0.7, y, a + 0.7, y + wh, fr, { r: 0, z: 0.5 }); put(a - ww / 2, y + wh * 0.52, a + ww / 2, y + wh * 0.52 + 1.2, fr, { r: 0, z: 0.5 }); };
  const Fz = (a, y0, b, y1, m, oo) => F(Math.min(a, b), y0, Math.max(a, b), y1, m, oo), Sz = (a, y0, b, y1, m, oo) => Sd(-Math.min(a, b), y0, -Math.max(a, b), y1, m, oo);
  door();
  if (V === "brick"){ win(Fz, 13, 8, 10, 15, 1); [36, 66].forEach(y => { win(Fz, -11, y, 10, 16, 1); win(Fz, 12, y, 10, 16, 1); }); [8, 36, 66].forEach(y => { win(Sz, -12, y, 11, 16, 0); win(Sz, 13, y, 11, 16, 0); }); }
  else { if (V === "wood"){ win(Fz, -21, 13, 11, 16, 1); win(Fz, 21, 13, 11, 16, 1); F(dx - dw / 2 - 6, dh + 3, dx + dw / 2 + 6, dh + 6.5, WIN, { r: 1, z: 1 }); } else win(Fz, 15, 13, 12, 17, 1);
    S.disc([0, h + rise * 0.42, hl + 0.4], 5.4, "z", V === "wood" ? WIN : W.r, { layer: 2, t: "l" }); S.disc([0, h + rise * 0.42, hl + 0.6], 3.8, "z", glassL, { layer: 2, z: 0.3, t: "l" });
    win(Sz, -22, 13, 13, 17, 0); win(Sz, 20, 13, 13, 17, 0); }
  // the chimney (behind the roof's near slope; it comes out of the roof)
  { const cx0 = 6, cx1 = 18, cz1 = -hl + 30, cz0 = -hl + 18, top = h + rise + 9, M = V === "red" ? C.brick : V === "wood" ? C.brick : W;
    S.face([[cx0, yP(cx0), cz1], [cx1, yP(cx1), cz1], [cx1, top, cz1], [cx0, top, cz1]], M, { layer: 4, t: "l" });
    S.face([[cx1, yP(cx1), cz1], [cx1, yP(cx1), cz0], [cx1, top, cz0], [cx1, top, cz1]], M, { layer: 4, t: "s" });
    S.box([cx0 - 1.5, top, cz0 - 1.5], [cx1 + 1.5, top + 3, cz1 + 1.5], { l: M.r, m: M.l, s: M.fs }, { layer: 4, z: 1 }); }
  // the roof: the slope we see, its edge along the front (the verge) and along the eaves
  const rz1 = hl + o, rz0 = -hl - o, rf = mix(R.l, R.s, 0.18);
  S.face([[0, h + rise, rz1], [0, h + rise, rz0], [hw + e, yE, rz0], [hw + e, yE, rz1]], rf, { layer: 3, r: 0.6 });
  S.face([[hw + e, yE, rz1], [hw + e, yE, rz0], [hw + e, yE - 3, rz0], [hw + e, yE - 3, rz1]], R.fs, { layer: 3, z: 1, r: 0.4 });
  S.face([[-hw - e, yE, rz1], [0, h + rise, rz1], [hw + e, yE, rz1], [hw + e, yE - 3.6, rz1], [0, h + rise - 5.2, rz1], [-hw - e, yE - 3.6, rz1]], G.trim ? WIN : R.s, { layer: 3, z: 2, r: 0.5, t: "l" });
  S.line([[-hw - e + 1, yE + 0.4, rz1], [0, h + rise + 0.2, rz1], [0, h + rise + 0.2, rz0]], G.trim ? "#FFFFFF" : R.r, 1.3, { layer: 3, z: 3 });      // the light on the lit edge
  for (let i = 1; i < 5; i++){ const t = i / 5, x = (hw + e) * t, y = h + rise + (yE - h - rise) * t; S.line([[x, y, rz1 - 2], [x, y, rz0 + 2]], R.s, 0.8, { layer: 3, z: 0.5, op: 0.55 }); }     // courses of tiles or slates
  return S.out(V === "brick" ? { y0: 18, y1: 174 } : { mid: true, y0: 38, y1: 178 });
}

/* ================================================================ a train (un train) ================================================================
   Coming toward us along its rails from the upper left: the long nose of a fast train, a dark windscreen, a row of windows, a
   carriage behind, a pantograph, rails and sleepers. Against a bus and a car: rails, no road wheels, several carriages, the nose.
   looks: a colour (blue, red ...) | "old" (a square-fronted railcar, green and cream) ; "steam" is not drawn here yet */
function train(k){
  if (k.has("steam")) return null;
  const old = k.has("old"), B = old ? C.green : colour(k, "blue"), S = scene(-68, 18, 270), W = 32, hz = W / 2, yb = 7, ys = 34, yr = 40, zr = hz - 6;
  const CR = P("#FBF3E0", "#D9CDB4"), GL = "#2B3850", GL2 = "#55708F", RF = C.steel;
  const car = (x0, x1, front, lead) => {
    S.face([[x0, yb, hz], [x1, yb, hz], [x1, ys, hz], [x0, ys, hz]], B, { t: "l", r: 0.5 });                                    // the side
    S.face([[x0, ys, hz], [x1, ys, hz], [x1, yr, zr], [x0, yr, zr]], { l: B.r }, { t: "l", r: 0.3 });                              // the curve into the roof: the light's rim
    S.face([[x0, yr, zr], [x1, yr, zr], [x1, yr, -zr], [x0, yr, -zr]], RF, { t: "l", r: 0.5 });                                    // the roof
    if (front) S.face([[x1, yb, hz], [x1, yb, -hz], [x1, ys, -hz], [x1, yr, -zr], [x1, yr, zr], [x1, ys, hz]], old ? B : C.dark, { t: "s", r: 0.5 });     // its end
    const sd = (a, y0, b, y1, m, oo) => S.face([[a, y0, hz + 0.3], [b, y0, hz + 0.3], [b, y1, hz + 0.3], [a, y1, hz + 0.3]], m, Object.assign({ layer: 1, r: 0.5 }, oo));
    sd(x0, 13, x1, 16.5, CR.l, { r: 0 });                                                                                          // the pale line along it
    if (old) sd(x0, 20, x1, ys, CR.l, { r: 0, z: -0.2 });                                                                          // an old railcar: cream above the waist
    const n = Math.max(2, Math.round((x1 - x0 - (lead ? 26 : 22)) / 12)), wx0 = x0 + (lead ? 8 : 12), ww = (x1 - (lead ? 20 : 12) - wx0) / n;
    for (let i = 0; i < n; i++){ sd(wx0 + i * ww + 1.3, 21.5, wx0 + (i + 1) * ww - 1.3, 31, GL, { r: 1.2, z: 0.3 }); sd(wx0 + i * ww + 1.3, 27.5, wx0 + (i + 1) * ww - 1.3, 31, GL2, { r: 1, z: 0.4, op: 0.55 }); }
    const dxx = lead ? x1 - 16 : x0 + 3; sd(dxx, yb + 1.5, dxx + 7, 32.5, B.s, { r: 0.8, z: 0.3 }); sd(dxx + 1.6, 22, dxx + 5.4, 30.5, GL, { r: 0.8, z: 0.5 });       // a door
    S.face([[x0 + 4, 1.5, hz - 2], [x1 - 4, 1.5, hz - 2], [x1 - 4, yb, hz - 2], [x0 + 4, yb, hz - 2]], C.dark, { t: "s", r: 0.4, z: -1 });                     // under the floor
    [x0 + 11, x0 + 21, x1 - 21, x1 - 11].forEach(x => { S.disc([x, 4.6, hz - 1], 4.4, "z", C.dark.l, { layer: 1, t: "l", z: 0.2 }); S.disc([x, 4.6, hz - 0.8], 2, "z", C.steel.l, { layer: 1, t: "l", z: 0.4 }); });
  };
  // the track: ballast, sleepers, two rails
  const X0 = -76, X1 = old ? 82 : 116;
  S.face([[X0, 0, 21], [X1, 0, 21], [X1, 0, -21], [X0, 0, -21]], C.paving, { layer: -9, t: "l", r: 5 });
  for (let x = X0 + 6; x < X1 - 4; x += 13) S.face([[x, 0.2, 16], [x + 5, 0.2, 16], [x + 5, 0.2, -16], [x, 0.2, -16]], "#A98C69", { layer: -8, r: 0.6 });
  [10, -10].forEach(z => { S.face([[X0 + 2, 0.5, z + 1.1], [X1 - 2, 0.5, z + 1.1], [X1 - 2, 0.5, z - 1.1], [X0 + 2, 0.5, z - 1.1]], "#7F8796", { layer: -7, r: 0 }); S.line([[X0 + 2, 0.6, z + 0.6], [X1 - 2, 0.6, z + 0.6]], "#D5DAE2", 0.6, { layer: -7, z: 1 }); });
  cast(S, -66, old ? 58 : 90, -hz, hz, { g: 5, op: 0.12 });
  // the carriages, the far one first
  car(-66, -4, true, false);
  if (old){ car(0, 58, true, true);
    const fr = (z0, y0, z1, y1, m, oo) => S.face([[58.3, y0, z0], [58.3, y0, z1], [58.3, y1, z1], [58.3, y1, z0]], m, Object.assign({ layer: 2, r: 0.8 }, oo));
    fr(hz, 20, -hz, ys, CR.s, { r: 0, t: "s" }); fr(hz - 3, 22, 1.5, 32, GL); fr(-1.5, 22, -hz + 3, 32, GL); fr(hz - 3, 28, 1.5, 32, GL2, { op: 0.5, z: 0.2 });
    S.disc([58.6, 13, 8], 2.6, "x", "#FFF1B8", { layer: 2, z: 0.4, t: "l" }); S.disc([58.6, 13, -8], 2.6, "x", "#FFF1B8", { layer: 2, z: 0.4, t: "l" });
    fr(hz - 2, 2, -hz + 2, yb, C.dark.s, { t: "s" }); }
  else { car(0, 58, false, true);
    const c = 58, sideTop = [[c, ys, hz], [c + 10, 33, 14.5], [c + 26, 22, 12.5], [c + 38, 13, 9]];
    S.face([[c, yb, hz], [c + 38, yb, 9], sideTop[3], sideTop[2], sideTop[1], sideTop[0]], B, { t: "l", r: 1.2, layer: 1 });                                 // the nose's side
    S.face([[c, ys, hz], [c + 10, 33, 14.5], [c + 10, 38, zr], [c, yr, zr]], { l: B.r }, { t: "l", r: 0.3, layer: 1 });
    S.face([[c, yr, zr], [c + 10, 38, zr], [c + 10, 38, -zr], [c, yr, -zr]], RF, { t: "l", r: 0.5, layer: 1 });
    S.face([[c + 10, 33, 14.5], [c + 26, 22, 12.5], [c + 26, 23, 11], [c + 10, 38, zr]], { l: B.r }, { t: "l", r: 0.3, layer: 1 });                              // the pillar: the rim again
    S.face([[c + 10, 38, zr], [c + 26, 23, 11], [c + 26, 23, -11], [c + 10, 38, -zr]], GL, { layer: 1, r: 1.5 });                                               // the windscreen
    S.face([[c + 12, 36.4, zr - 1], [c + 17, 31.6, zr], [c + 17, 31.6, -2], [c + 12, 36.4, -2.4]], GL2, { layer: 1, z: 1, r: 1, op: 0.55 });                    // the sky in it
    S.face([[c + 26, 23, 11], [c + 38, 13, 8], [c + 38, 13, -8], [c + 26, 23, -11]], B, { t: "m", layer: 1, r: 1 });                                            // the bonnet
    S.face([[c + 26, 22, 12.5], [c + 38, 13, 9], [c + 38, 13, 8], [c + 26, 23, 11]], { l: B.r }, { t: "l", r: 0.3, layer: 1 });
    S.face([[c + 38, 13, 9], [c + 38, 13, -9], [c + 38, yb, -9], [c + 38, yb, 9]], B, { t: "s", layer: 1, r: 1 });                                              // the front
    S.disc([c + 38.3, 10.4, 5.4], 1.9, "x", "#FFF1B8", { layer: 2, t: "l" }); S.disc([c + 38.3, 10.4, -5.4], 1.9, "x", "#FFF1B8", { layer: 2, t: "l" });
    S.face([[c + 2, 1.5, hz - 2], [c + 37, 1.5, 8], [c + 37, yb, 8], [c + 2, yb, hz - 2]], C.dark, { t: "s", r: 0.4, layer: 1, z: -1 });
    S.face([[c + 37, 1.5, 8], [c + 37, 1.5, -8], [c + 37, yb, -8], [c + 37, yb, 8]], C.dark, { t: "fs", r: 0.4, layer: 1, z: -1 });
    S.face([[c - 40, 14, hz + 0.3], [c + 30, 14, 11.4], [c + 37.6, 13.4, 9.3], [c + 37.6, 16, 9.3], [c + 24, 17.5, 12.6], [c - 40, 16.5, hz + 0.3]], CR.l, { layer: 2, r: 0.3, t: "l" });       // the pale line runs on to the nose
    S.line([[16, yr, 0], [28, yr + 8, 0], [20, yr + 15, 0]], "#414B5E", 1.5, { layer: 3 }); S.line([[20, yr + 15, -8], [20, yr + 15, 8]], "#414B5E", 1.8, { layer: 3, z: 1 });       // the pantograph
  }
  return S.out({ y1: 172, y0: 18, mid: true });
}

/* ================================================================ a book (un livre) ================================================================
   A block of pages between two boards: the pages' edge always shows (that is what tells a book from a photo, a card, a phone).
   looks: "closed" (lying, the usual one) | "open" | "thin" (standing) | "thick" (lying, twice as thick) | "old" ; a colour: the cover */
function book(k){
  const B = colour(k, k.has("old") ? "brown" : "red"), PG = C.paper, RB = B === C.red || B === C.orange || B === C.brown ? C.gold : C.red;
  if (k.has("open")){                                       // lying open, seen from above its lower edge
    const pgL = "M80 66C64 53 36 52 15 60L15 132C36 124 64 125 80 138Z", pgR = "M80 66C96 53 124 52 145 60L145 132C124 124 96 125 80 138Z";
    const cov = "M80 78C62 66 34 65 9 73L9 146C34 138 62 139 80 152C98 139 126 138 151 146L151 73C126 65 98 66 80 78Z";
    const lines = side => [0, 1, 2, 3, 4, 5].map(i => { const y = 76 + i * 9, a = side < 0 ? 24 : 136, b = side < 0 ? (i === 5 ? 50 : 70) : (i === 5 ? 112 : 90), c = (a + b) / 2;
      return line(`M${a} ${y}Q${c} ${y - 4.5} ${b} ${y + 2.5}`, mix(PG.s, "#8a8f9c", 0.35), 2.4, 'opacity=".8"'); }).join("");
    return ground(82, 150, 76, 10) + solid(cov, B, { k: 4, rim: 1 }) +
      fill("M80 72C64 59 36 58 13 66L13 137C36 129 64 130 80 143C96 130 124 129 147 137L147 66C124 58 96 59 80 72Z", PG.s) +       // the thickness of the pages
      fill(pgL, PG.l) + fill(pgR, mix(PG.l, PG.s, 0.28)) + fill("M80 66C86 61 93 58 100 56L100 126C93 128 86 132 80 138Z", PG.s, 'opacity=".55"') +     // the right-hand page turns from the light at the fold
      line("M15 60C36 52 64 53 80 66", "#FFFFFF", 1.2) + lines(-1) + lines(1) +
      fill("M77.5 66L82.5 66L82.5 150L80 146L77.5 152Z", RB.l) + fill("M80 66L82.5 66L82.5 150L80 146Z", RB.s);                    // the ribbon in the fold
  }
  if (k.has("thin")){                                       // standing up, its front board to us, the pages' edge at the right
    const S = scene(-32, 10, 700), w = 31, h = 92, t = 5;
    cast(S, -w, w, -t, t, { g: 5, op: 0.12 });
    S.box([-w, 0, -t], [w, h, t], B, { show: "f", t: "l", r: 1.5 });
    S.face([[w, 0, t], [w, 0, t - 1.4], [w, h, t - 1.4], [w, h, t]], B, { t: "s", r: 0.3 }); S.face([[w, 0, -t + 1.4], [w, 0, -t], [w, h, -t], [w, h, -t + 1.4]], B, { t: "s", r: 0.3 });
    S.face([[w - 0.8, 1.5, t - 1.4], [w - 0.8, 1.5, -t + 1.4], [w - 0.8, h - 1.5, -t + 1.4], [w - 0.8, h - 1.5, t - 1.4]], PG, { t: "s", r: 0 });
    S.face([[-w, h, t], [w, h, t], [w, h, -t], [-w, h, -t]], PG, { t: "l", r: 0.4, z: -1 }); S.line([[-w, h, t - 0.4], [w, h, t - 0.4]], B.r, 1.3, { layer: 1 });
    S.line([[-w + 0.6, 1, t + 0.2], [-w + 0.6, h - 1, t + 0.2]], B.r, 1.2, { layer: 1 });                                         // the light on the lit edge
    S.face([[-w + 5, 0, t + 0.2], [-w + 8, 0, t + 0.2], [-w + 8, h, t + 0.2], [-w + 5, h, t + 0.2]], B, { t: "s", layer: 1, r: 0, op: 0.7 });     // the hinge of the board
    S.face([[-w + 17, h * 0.6, t + 0.3], [w - 9, h * 0.6, t + 0.3], [w - 9, h * 0.82, t + 0.3], [-w + 17, h * 0.82, t + 0.3]], PG, { t: "l", layer: 1, r: 2.5 });     // a plain label (no word on it)
    S.face([[-w + 17, h * 0.2, t + 0.3], [w - 9, h * 0.2, t + 0.3], [w - 9, h * 0.23, t + 0.3], [-w + 17, h * 0.23, t + 0.3]], B, { t: "s", layer: 1, r: 0.6, op: 0.8 });
    return S.out({ y1: 172, y0: 18 });
  }
  const T = k.has("thick") ? 38 : 15, S = scene(33, 36, 760), w = 36, d = 48, c = 2.2;       // lying closed: the spine to the left in the light, the pages to the front
  cast(S, -w, w, -d, d, { g: 7, op: 0.11 });
  S.box([-w, 0, -d], [w, c, d], B, { show: "fl", r: 0.6 });
  S.face([[-w + 1.5, c, d - 2], [w - 2.5, c, d - 2], [w - 2.5, T - c, d - 2], [-w + 1.5, T - c, d - 2]], PG, { t: "s", r: 0 });                                 // the pages, from the front
  for (let i = 1; i < (T > 20 ? 7 : 3); i++){ const y = c + (T - 2 * c) * i / (T > 20 ? 7 : 3); S.line([[-w + 3, y, d - 1.9], [w - 4, y, d - 1.9]], PG.fs, 0.5, { op: 0.5, layer: 0, z: 0.3 }); }
  S.face([[-w, 0, d], [-w, 0, -d], [-w, T, -d], [-w, T, d]], B, { t: "m", r: 1.6 });                                                                           // the spine
  [0.16, 0.84].forEach(f => S.face([[-w - 0.2, 1.5, d - 2 * d * f - 2.2], [-w - 0.2, 1.5, d - 2 * d * f + 2.2], [-w - 0.2, T - 1.5, d - 2 * d * f + 2.2], [-w - 0.2, T - 1.5, d - 2 * d * f - 2.2]], RB, { t: "l", r: 0.4, layer: 1 }));     // two bands on it
  S.face([[-w, T - c, d], [w, T - c, d], [w, T, d], [-w, T, d]], B, { t: "s", r: 0.5, z: 0.5 });                                                               // the edge of the top board
  S.face([[-w, T, d], [w, T, d], [w, T, -d], [-w, T, -d]], B, { t: "l", r: 1.6, layer: 1 });                                                                   // the top board
  S.line([[-w + 0.5, T, d - 1], [-w + 0.5, T, -d + 1], [w - 1, T, -d + 0.5]], B.r, 1.2, { layer: 2 });                                                         // the light on its lit edges
  S.face([[-w + 6, T + 0.1, d], [-w + 9, T + 0.1, d], [-w + 9, T + 0.1, -d], [-w + 6, T + 0.1, -d]], B, { t: "s", layer: 2, r: 0, op: 0.55 });                 // the hinge
  S.face([[-w + 20, T + 0.1, -d + 16], [w - 10, T + 0.1, -d + 16], [w - 10, T + 0.1, -d + 38], [-w + 20, T + 0.1, -d + 38]], PG, { t: "l", layer: 2, r: 2.5 });      // a plain label
  S.face([[-w + 20, T + 0.1, d - 20], [w - 10, T + 0.1, d - 20], [w - 10, T + 0.1, d - 17], [-w + 20, T + 0.1, d - 17]], B, { t: "s", layer: 2, r: 0.6, op: 0.7 });
  S.face([[w - 16, T - c, d - 1.5], [w - 11, T - c, d - 1.5], [w - 11, -1, d + 4], [w - 13.5, 1.5, d + 3], [w - 16, -2, d + 5]], RB, { t: "l", layer: 3, r: 0.3 });     // the ribbon out of the pages
  return S.out({ mid: true, y0: 30, y1: 160 });
}

/* ================================================================ a car (une voiture) ================================================================
   From the side, facing right: two wheels on the road, a body with a glass cabin, lights. Against a bus (long, a row of many windows, tall)
   and a train (rails, carriages, no road wheels).
   looks: a colour (red: the usual one) | "old" (a 1930s saloon: upright cabin, separate wings, a round lamp, spoked wheels) |
          "small" (a short round town car, drawn smaller) | "sports" (low and long, a spoiler) */
function car(k){
  const old = k.has("old"), sports = k.has("sports"), small = k.has("small") && !old && !sports;
  const B = colour(k, old ? "black" : sports ? "green" : small ? "blue" : "red"), G = C.glass, TY = "#2E3442", lamp = "#FFF1B8", tail = B === C.red ? "#8F2B22" : "#C9422F";
  const wheel = (cx, cy, r, spoke) => circ(cx, cy, r, TY) + line(`M${r1(cx - r * 0.74)} ${r1(cy - r * 0.6)}A${r} ${r} 0 0 1 ${r1(cx + r * 0.3)} ${r1(cy - r * 0.95)}`, "#5A6274", 1.4) +
    (spoke ? circ(cx, cy, r * 0.72, "#EFE7D4") + [0, 45, 90, 135].map(a => line(`M${r1(cx - Math.cos(a * RAD) * r * 0.66)} ${r1(cy - Math.sin(a * RAD) * r * 0.66)}L${r1(cx + Math.cos(a * RAD) * r * 0.66)} ${r1(cy + Math.sin(a * RAD) * r * 0.66)}`, "#8B8472", 1.2)).join("") + circ(cx, cy, r * 0.24, TY)
      : solid(cd(cx, cy, r * 0.6), P("#E3E7EE", "#A9B1BF"), { k: 3, rim: 0 }) + circ(cx, cy, r * 0.2, "#7C8494"));
  const glint = d => clipped(d, fill("M0 0L11 0L-1 30L-12 30Z", "#FFFFFF", 'opacity=".5" transform="translate(52 90)"') + fill("M0 0L4 0L-8 30L-12 30Z", "#FFFFFF", 'opacity=".5" transform="translate(90 90)"'));      // kept inside the car's own extent: the caller measures the picture
  let s, w1, w2, r, wy, up;
  if (old){ w1 = 38; w2 = 118; r = 13; wy = 147; up = -30;
    const shell = "M22 140L22 110Q22 96 31 89Q36 84 46 84L82 84Q90 84 92 92L96 105L124 107Q134 108 134 116L134 140Z", g1 = "M31 93L53 93L53 108L28 108Q28 98 31 93Z", g2 = "M58 93L82 93Q85 93 86 97L89 108L58 108Z";
    s = ground(80, 162, 72, 7) + solid(shell, B, { k: 6 }) + fill(g1, G.l) + fill(g2, G.l) + glint(g1 + g2) +
      rect(133, 109, 5, 30, C.silver.l, 2) + line("M135.5 112V136", C.silver.s, 1) + circ(138.5, 110, 5.4, C.silver.s) + circ(139.2, 110, 4, lamp) +
      line("M55.5 110V138M92 110V138", B.fs, 1, 'opacity=".7"') + rect(60, 114, 6, 2, B.r, 1) + line("M100 110H130M100 115H130M100 120H130", B.fs, 1, 'opacity=".55"') +
      line("M100 147Q100 127 118 127Q136 127 138 144L146 146", B.l, 6) + line("M21 147Q21 127 38 127Q55 127 56 143L100 143", B.l, 6) +      // the wings and the running board
      line("M101 143Q102 126 118 125Q130 125 135 135", B.r, 1.3) + line("M22 143Q23 126 38 125Q48 125 53 133", B.r, 1.3) +
      wheel(w1, wy, r, 1) + wheel(w2, wy, r, 1) + rect(143, 138, 6, 4, C.silver.l, 2); }
  else if (sports){ w1 = 36; w2 = 121; r = 13; wy = 147; up = -28;
    const shell = "M9 147L9 138Q9 130 15 127L42 122Q54 108 71 107L84 107Q94 108 103 120L131 124Q147 127 148 137L148 143Q147 147 142 147Z", g1 = "M52 122Q60 112 71 111L83 111Q90 112 97 122Z";
    s = ground(79, 161, 76, 6.5) + fill("M9 121L24 119L25 124L21 124L22 128L17 128L16 125L9 126Z", B.s) +                          // the spoiler
      solid(shell, B, { k: 5 }) + fill(g1, G.l) + rect(73, 110, 2.6, 13, B.l) + glint(g1) +
      fill("M139 127Q146 129 147.5 134L140 133Z", lamp) + fill("M9 131L14 129L14 136L9 137Z", tail) + line("M100 124L101 142M60 124L58 142", B.fs, 1, 'opacity=".7"') +
      line("M16 139H142", "#FBF3E0", 2.2, 'opacity=".9"') + fill("M104 130L116 130L113 135L104 135Z", B.fs, 'opacity=".8"') + rect(78, 127, 6, 2, B.fs, 1) +
      circ(w1, wy, r + 2.4, B.fs) + circ(w2, wy, r + 2.4, B.fs) + wheel(w1, wy, r) + wheel(w2, wy, r); }
  else if (small){ w1 = 52; w2 = 108; r = 11.5; wy = 147; up = -28;
    const shell = "M29 147L28 133Q28 121 35 113Q44 96 60 94L84 94Q98 95 106 108L111 116Q126 118 130 124Q133 128 133 136L132 143Q131 147 127 147Z", g1 = "M43 114Q49 100 60 99L71 99L71 114Z", g2 = "M75 99L84 99Q94 100 100 110L102 114L75 114Z";
    s = ground(80, 161, 58, 6) + solid(shell, B, { k: 6 }) + fill(g1, G.l) + fill(g2, G.l) + glint(g1 + g2) +
      circ(127.5, 126, 3.8, lamp) + fill("M28 126L32 123L32 131L28 132Z", tail) + line("M73 116V142M103 118L104 142", B.fs, 1, 'opacity=".7"') + rect(78, 120, 6, 2, B.fs, 1) +
      rect(127, 140, 7, 4, C.silver.l, 2) + rect(26, 140, 7, 4, C.silver.l, 2) +
      circ(w1, wy, r + 2.2, B.fs) + circ(w2, wy, r + 2.2, B.fs) + wheel(w1, wy, r) + wheel(w2, wy, r); }
  else { w1 = 41; w2 = 117; r = 13; wy = 147; up = -28;
    const shell = "M14 147L12 137Q11 126 16 120L22 108Q28 96 44 95L80 94Q90 94 96 100L110 113Q130 115 142 121Q149 125 149 133L148 143Q147 147 142 147Z", g1 = "M30 113Q33 101 45 100L62 100L62 113Z", g2 = "M66 100L82 100Q88 100 92 104L102 113L66 113Z";
    s = ground(80, 161, 74, 7) + solid(shell, B, { k: 6 }) + fill(g1, G.l) + fill(g2, G.l) + glint(g1 + g2) +
      fill("M140 122.5Q147 125 148 131L140 130Z", lamp) + fill("M12.5 124L17 121L18 129L12.5 131Z", tail) +
      line("M64 115V142M103 116L105 142", B.fs, 1, 'opacity=".7"') + rect(69, 119, 7, 2.2, B.fs, 1) + rect(88, 119, 7, 2.2, B.fs, 1) + fill("M99 108L105 108Q106 113 102 113L99 113Z", B.s) +
      rect(141, 139, 9, 4.5, C.silver.l, 2) + rect(10, 139, 9, 4.5, C.silver.l, 2) +
      circ(w1, wy, r + 2.4, B.fs) + circ(w2, wy, r + 2.4, B.fs) + wheel(w1, wy, r) + wheel(w2, wy, r); }
  return `<g transform="translate(0 ${up})">${s}</g>`;
}

/* ================================================================ a town (une ville) ================================================================
   Seen from outside, as a whole: MANY buildings of different heights packed together, their windows small (so they are far off), roofs of
   tile and slate, a church spire over them, trees at the foot. Against a house (one building, a door, big windows), a street (seen from
   inside, down its length) and a restaurant (one front, close).
   looks: "with a church" | "with tall buildings" (towers of glass behind the old roofs, no church) | "by a river" | "at night" */
function town(k){
  const night = k.has("night"), tall = k.has("tall"), river = k.has("river"), nt = p => night ? P(mix(p.l, "#2A3566", 0.72), mix(p.s, "#1E2750", 0.78)) : p;
  const WALL = [C.cream, P("#F1D3B4", "#D0AC88"), P("#E9E2D2", "#C7BEA9"), P("#F4DDA6", "#D3B878"), P("#E7C9C0", "#C4A096")], winD = night ? "#FFD966" : "#5D6E8C", base = river ? 152 : 158;
  let s = "";
  const bld = (x0, x1, top, W0, kind, R0, back) => {
    let W = nt(W0), R = nt(R0); if (back && !night){ W = far(W, 0.38); R = far(R, 0.34); }
    const w = x1 - x0, m = (x0 + x1) / 2, rh = kind === "front" ? w * 0.5 : kind === "mansard" ? 9 : kind === "flat" ? 2.5 : 8, wc = back && !night ? mix(winD, FACE, 0.35) : winD;
    let o = rect(x0, top, w, base - top + 2, W.l) + rect(x1 - w * 0.3, top, w * 0.3, base - top + 2, W.s);
    const cols = w > 26 ? 4 : w > 19 ? 3 : 2, cw = w / (cols + 0.6), rows = Math.max(1, Math.floor((base - top - 5) / 10.5));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (!night || (r * 3 + c * 5 + Math.round(x0)) % 5 !== 0) o += rect(x0 + cw * (c + 0.55), top + 5 + r * 10.5, cw * 0.5, 5.6, wc, 0.8);
      else o += rect(x0 + cw * (c + 0.55), top + 5 + r * 10.5, cw * 0.5, 5.6, mix(W.s, INK, 0.3), 0.8);
    if (kind === "front") o += fill(poly([[x0 - 1.5, top + 0.5], [m, top - rh], [x1 + 1.5, top + 0.5]]), R.l) + fill(poly([[m, top - rh], [x1 + 1.5, top + 0.5], [m + w * 0.12, top + 0.5]]), R.s) + line(`M${r1(x0 - 1)} ${r1(top)}L${r1(m)} ${r1(top - rh)}`, R.r, 1);
    else if (kind === "flat") o += rect(x0 - 1, top - rh, w + 2, rh + 0.5, W.r, 0.8) + rect(x1 - w * 0.3, top - rh, w * 0.3 + 1, rh + 0.5, W.l);
    else { const inset = kind === "mansard" ? 2.2 : 4.5; o += fill(poly([[x0 - 1.5, top + 0.5], [x0 + inset, top - rh], [x1 - inset, top - rh], [x1 + 1.5, top + 0.5]]), R.l) + fill(poly([[x1 - inset - w * 0.24, top - rh], [x1 - inset, top - rh], [x1 + 1.5, top + 0.5], [x1 - w * 0.3, top + 0.5]]), R.s) + line(`M${r1(x0 - 1)} ${r1(top)}L${r1(x0 + inset)} ${r1(top - rh)}H${r1(x1 - inset - w * 0.24)}`, R.r, 1);
      if (kind === "mansard") for (let c = 0; c < 2; c++) o += rect(x0 + w * (0.22 + c * 0.36), top - rh + 2.4, w * 0.16, 4.6, W.l, 0.6) + rect(x0 + w * (0.25 + c * 0.36), top - rh + 3.4, w * 0.1, 3.6, wc, 0.4);
      else if (!back) o += rect(x0 + w * 0.62, top - rh - 4, 3.6, 6, nt(C.brick).l) ; }
    return o;
  };
  const tree = (cx, cy, r) => solid(cd(cx, cy, r), nt(C.leaf), { k: r * 0.5, rim: night ? 0 : 1 });
  if (night){ s += `<ellipse cx="80" cy="90" rx="68" ry="80" fill="#27325F"/>` +
      [[30, 52], [52, 30], [112, 32], [132, 62], [96, 22], [22, 84], [138, 92]].map(([x, y], i) => circ(x, y, i % 2 ? 1.1 : 1.5, "#FFF6CF")).join("") +
      circ(118, 52, 9, "#FFF1B8") + circ(114.5, 49.5, 8, "#27325F"); }                                                              // a moon
  // the far row
  if (tall){ const GLS = nt(P("#B9D3E3", "#8DAFC6")), tw = (x0, x1, top) => { const w = x1 - x0; let o = rect(x0, top, w, base - top, GLS.l, 1) + rect(x1 - w * 0.32, top, w * 0.32, base - top, GLS.s) + rect(x0, top, 1.2, base - top, GLS.r);
        for (let y = top + 5; y < base - 40; y += 6.5) o += rect(x0 + 2.5, y, w - 5, 3, night ? ((Math.round(y) + Math.round(x0)) % 3 ? "#FFD966" : mix(GLS.s, INK, 0.3)) : "#FFFFFF", 0.6, night ? "" : 'opacity=".55"'); return o; };
    s += tw(40, 60, 40) + tw(96, 116, 52) + tw(63, 89, 18) + rect(74, 12, 1.6, 7, nt(C.slate).s) + bld(14, 40, 96, WALL[2], "flat", C.slate, 1) + bld(116, 146, 90, WALL[0], "mansard", C.slate, 1); }
  else { s += bld(16, 40, 94, WALL[2], "gable", C.tile, 1) + bld(38, 62, 78, WALL[0], "mansard", C.slate, 1) + bld(106, 130, 82, WALL[3], "mansard", C.slate, 1) + bld(128, 147, 100, WALL[1], "gable", C.tile, 1);
    // the church: a nave, a tower, a spire
    const ST = nt(P("#EFE6D2", "#CFC3A8")), SL = nt(C.slate);
    s += rect(84, 98, 26, base - 98, ST.l) + rect(102, 98, 8, base - 98, ST.s) + fill(poly([[82.5, 98.5], [86, 84], [107, 84], [111.5, 98.5]]), SL.l) + fill(poly([[101, 84], [107, 84], [111.5, 98.5], [103, 98.5]]), SL.s) +
      [90, 97].map(x => fill(`M${x} 118V109Q${x + 1.8} 105 ${x + 3.6} 109V118Z`, winD)).join("") +
      rect(66, 58, 18, base - 58, ST.l) + rect(78.5, 58, 5.5, base - 58, ST.s) + rect(66, 58, 1.2, base - 58, ST.r) +
      fill("M71.8 76V66Q75 61.5 78.2 66V76Z", night ? "#FFD966" : mix(winD, INK, 0.2)) + circ(75, 88, 3.4, "#FFFFFF") + circ(75, 88, 2.2, night ? "#FFD966" : ST.s) +
      fill(poly([[64, 58.5], [75, 20], [86, 58.5]]), SL.l) + fill(poly([[75, 20], [86, 58.5], [77.5, 58.5]]), SL.s) + line("M64.6 58L75 20.6", SL.r, 1) +
      line("M75 20V12M72 15H78", night ? "#C9CEE6" : "#414B5E", 1.5); }
  // the near row
  s += bld(12, 34, 122, WALL[1], "gable", C.tile) + bld(33, 55, 108, WALL[4], "mansard", C.slate) + bld(54, 76, 126, WALL[0], "front", C.tile) + bld(75, 99, 114, WALL[3], "gable", C.tile) +
    bld(98, 120, 128, WALL[2], "front", C.slate) + bld(119, 148, 112, WALL[0], "gable", C.tile);
  // the foot of the town: trees and the ground (or the river)
  if (river){ const WA = nt(P("#7FC0E4", "#58A0CB")); s += fill("M6 150Q80 144 154 150L154 166Q80 176 6 168Z", nt(C.grass).l) +
      [[22, 148, 7], [60, 150, 6], [104, 150, 6.5], [140, 148, 7]].map(a => tree(a[0], a[1], a[2])).join("") +
      fill("M4 158Q80 152 156 158L156 172Q80 180 4 173Z", WA.l) + fill("M4 166Q80 161 156 166L156 172Q80 180 4 173Z", WA.s) + line("M22 162H44M70 160H96M112 164H134M48 169H66", "#FFFFFF", 1.4, 'opacity=".75"'); }
  else s += ground(80, 168, 78, 9, 0.2) + fill("M8 160Q80 150 152 160Q150 172 80 174Q10 172 8 160Z", nt(C.grass).l) + fill("M40 171Q80 166 152 160Q150 172 80 174Z", nt(C.grass).s, 'opacity=".7"') +
      [[20, 156, 8], [44, 159, 6], [66, 158, 7], [92, 160, 6], [114, 158, 7.5], [138, 156, 8]].map(a => tree(a[0], a[1], a[2])).join("");
  return s;
}

/* ================================================================ a restaurant (un restaurant) ================================================================
   ONE front on a street, close: a striped awning with a scalloped edge, a big window with a half curtain, a glazed door, tables laid with
   white cloths and chairs on the pavement, a sign with a fork and a knife (a picture, never a word). Against a town (many buildings, far)
   and a house (a roof, a garden). looks: a colour + "awning" (blue, green, red, yellow) */
function restaurant(k){
  const A = colour(k, "red"), W = C.cream, F = P("#46536F", "#303A54"), CL = P("#FFFFFF", "#DDD6C6"), WD = "#B98A55", CRM = "#FBF3E0", G = P("#D3EAEE", "#A7CBD6");
  let s = ground(80, 172, 78, 7, 0.18);
  s += fill(rrd(5, 150, 150, 26, 8), C.paving.l) + fill("M5 164H155V168Q155 176 147 176H13Q5 176 5 168Z", C.paving.s);                                        // the pavement
  s += rect(18, 16, 124, 136, W.l) + rect(130, 22, 12, 130, W.s) + rect(14, 12, 132, 9, W.r, 2) + rect(18, 21, 124, 3, W.s);                                    // the wall, its cornice
  [[40], [120]].forEach(([x]) => { s += rect(x - 13, 30, 26, 27, "#FFFFFF", 1.5) + rect(x - 10.5, 32.5, 21, 22, C.glass.l, 1) + rect(x - 0.8, 32.5, 1.6, 22, "#FFFFFF") + rect(x - 10.5, 46, 21, 8.5, C.glass.s, 0, 'opacity=".5"') +
      rect(x - 20, 29.5, 7, 28, P("#8FA9A6", "#6F8B88").l, 1) + rect(x + 13, 29.5, 7, 28, P("#8FA9A6", "#6F8B88").s, 1) + line(`M${x - 13} 57H${x + 13}`, "#414B5E", 1.6); });       // two windows with shutters, upstairs
  s += circ(80, 43, 13, F.s) + circ(80, 43, 11.4, F.l) + line("M75.5 36V50.5M73 36V40Q75.5 43 78 40V36", CRM, 1.5) + fill("M83.4 36Q87.6 37.5 87 45L83.4 45Z", CRM) + line("M83.9 44V50.5", CRM, 1.6);       // the sign: a fork and a knife
  s += rect(20, 66, 120, 86, F.l, 2) + rect(20, 96, 120, 9, F.fs, 0, 'opacity=".55"');                                                                        // the painted front, the awning's shadow on it
  s += rect(27, 101, 72, 37, G.l, 2) + rect(27, 101, 72, 7, G.s, 0, 'opacity=".8"') + clipped(rrd(27, 101, 72, 37, 2), fill("M52 96L64 96L46 142L34 142Z", "#FFFFFF", 'opacity=".5"') + fill("M69 96L73 96L55 142L51 142Z", "#FFFFFF", 'opacity=".5"')) +
    rect(27, 123, 72, 15, CRM) + line("M27 123H99", "#C9A24A", 1.4) + [39, 51, 63, 75, 87].map(x => line(`M${x} 125V137`, "#E6DBC2", 1)).join("") + rect(27, 142, 72, 7, F.s, 1.5);       // the window and its half curtain
  s += rect(107, 101, 28, 51, F.s, 2) + rect(110.5, 104.5, 21, 27, G.l, 1.5) + rect(110.5, 104.5, 21, 5, G.s, 0, 'opacity=".8"') + rect(110.5, 135.5, 21, 13, F.l, 1.5) + circ(113.6, 133.6, 1.6, "#E3B94F");     // the door
  // the awning: stripes, and its scalloped edge
  { const n = 9, xt = i => 23 + 114 * i / n, xb = i => 11 + 138 * i / n; let a = "", v = "";
    for (let i = 0; i < n; i++){ const c = i % 2 ? CRM : A.l, c2 = i % 2 ? "#E2D7BE" : A.s, m = (xb(i) + xb(i + 1)) / 2;
      a += fill(poly([[xt(i), 62], [xt(i + 1) + 0.3, 62], [xb(i + 1) + 0.3, 88.5], [xb(i), 88.5]]), c);
      v += fill(`M${r1(xb(i))} 88H${r1(xb(i + 1) + 0.3)}V94Q${r1(m)} 101 ${r1(xb(i))} 94Z`, c2); }
    s += v + a + line("M23 62H137", A.r, 1.6) + line("M11.4 88.3H148.6", A.fs, 0.8, 'opacity=".5"'); }
  // on the pavement: bushes in boxes, two tables laid, three chairs
  [[14, 0], [146, 1]].forEach(([x, sh]) => { s += solid(cd(x, 134, 9.5), C.leaf, { k: 4.5, rim: 1 }) + rect(x - 8, 141, 16, 12, sh ? F.s : F.l, 2) + rect(x - 9, 140, 18, 3.4, F.l, 1.5); });
  const chair = (x, dir) => line(`M${x} 172V142Q${x} 137 ${x + dir * 3} 137`, WD, 2.6) + line(`M${x} 157H${x + dir * 10}V172`, WD, 2.6) + line(`M${x} 149H${x + dir * 2}`, WD, 2);
  const table = cx => fill(`M${cx - 16} 151L${cx - 18} 166Q${cx - 12} 169 ${cx - 6} 166Q${cx} 169 ${cx + 6} 166Q${cx + 12} 169 ${cx + 18} 166L${cx + 16} 151Z`, CL.l) +
    fill(`M${cx + 5} 151L${cx + 6} 166Q${cx + 12} 169 ${cx + 18} 166L${cx + 16} 151Z`, CL.s) + `<ellipse cx="${cx}" cy="151" rx="16" ry="4.4" fill="#FFFFFF"/>` + `<ellipse cx="${cx - 5}" cy="151" rx="5" ry="1.5" fill="${CL.s}"/>` +
    line(`M${cx + 5} 150V142`, "#5E9A63", 1.4) + circ(cx + 5, 141, 2.6, A === C.red ? C.yellow.l : C.red.l) + rect(cx - 1.2, 166, 2.4, 7, "#414B5E");
  s += chair(24, 1) + chair(74, -1) + chair(78, 1) + table(49) + table(104);
  return s;
}

/* ---------- the looks, read as people.js reads them ---------- */
function lookOf(spec){
  const S = " " + (spec.looks || []).join(" ").toLowerCase().replace(/[^a-z'\- ]+/g, " ").replace(/\s+/g, " ").trim() + " ";
  const cn = S.trim().split(" ").find(x => C[x] && !/^(cream|stone|brick|wood|tile|slate|glass|leaf|grass|paper|steel|dark|gold|paving)$/.test(x));
  return { S, cn, has: (...w) => w.some(x => S.indexOf(" " + x + " ") >= 0) };
}
const DRAW = { house, train, book, car, town, restaurant };
const PLACED = /^(in an open box|on a table|under a table)$/;
function one(spec){
  spec = spec || {};
  const is = String(spec.is || "").toLowerCase().trim(), f = DRAW[is];
  if (!f) return null;
  const looks = (spec.looks || []).map(x => String(x).toLowerCase());
  if (looks.some(x => PLACED.test(x) || x === "big" || (x === "small" && is !== "car"))) return null;      // placed or sized by the caller's own code, for now
  try { const s = f(lookOf(spec), spec); return s == null ? null : mk(s); } catch (e) { return null; }
}
const can = spec => !!one(spec);

/* Until people.js calls THINGS.one itself (it then sets PICS._thingsHook), the pictures asked for by name are taken over here. */
function install(){
  const Pc = window.PICS; if (!Pc || Pc._things) return; Pc._things = 1;
  const t0 = Pc.thing, c0 = Pc.car;
  const whole = (spec, orig, self) => { if (!Pc._thingsHook && spec){ const n = spec.count || 1, g = one(spec); if (g) return n > 1 && Pc.group ? Pc.group(n, () => one(spec)) : g; } return orig.apply(self, [spec]); };
  if (t0) Pc.thing = function(spec){ return whole(spec, t0, this); };
  if (c0) Pc.car = function(spec){ return whole(spec ? Object.assign({}, spec, { is: "car" }) : spec, c0, this); };
}
window.THINGS = { one, can, kinds: Object.keys(DRAW), install };
install();
})();
