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
    /* a ball (smoke): a round shape that faces us, its shade on the lower right */
    puff(c, r, lit, shade, o){ o = o || {}; const q = pr(c), R = r * dist / (dist - q[2]); grow([q[0] - R, q[1] - R]); grow([q[0] + R, q[1] + R]);
      items.push({ k: (o.layer || 0) * 1e5 + q[2], s: `<circle cx="${r1(q[0])}" cy="${r1(q[1])}" r="${r1(R)}" fill="${shade}"/><circle cx="${r1(q[0] - R * 0.11)}" cy="${r1(q[1] - R * 0.14)}" r="${r1(R * 0.82)}" fill="${lit}"/>` });
      return S; },
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
  const G = { red:   { w: 64, L: 70, h: 54, rise: 40, wall: C.cream, roof: C.red, shut: P("#5F97BD", "#44749B"), door: P("#5F97BD", "#44749B"), floors: 1 },
              brick: { w: 50, L: 56, h: 98, rise: 28, wall: C.brick, roof: C.slate, shut: null, door: P("#3F6DA8", "#2C4F80"), floors: 3 },
              stone: { w: 68, L: 74, h: 50, rise: 36, wall: C.stone, roof: C.slate, shut: P("#7DAA7B", "#5A875C"), door: C.brown, floors: 1, arch: 1 },
              wood:  { w: 64, L: 70, h: 52, rise: 44, wall: C.wood, roof: P("#5B7F86", "#3F5E66"), shut: null, door: P("#FBF8F0", "#D9D3C4"), floors: 1, trim: 1 } }[V];
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
  if (V === "stone"){ [[-28, 6, 12, 7], [10, 4, 13, 6], [-31, 34, 9, 6], [22, 6, 9, 6], [-6, 42, 10, 5], [-30, 20, 8, 5], [24, 42, 8, 5]].forEach(([x, y, a, b], i) => F(x, y, x + a, y + b, i % 2 ? W.r : mix(W.l, W.s, 0.45), { r: 2, t: "l", layer: 1 }));
    [[30, 6, 13, 6], [-6, 4, 12, 6], [8, 40, 10, 5], [-26, 6, 9, 6], [-25, 40, 8, 5]].forEach(([z, y, a, b]) => Sd(z, y, z - a, y + b, W.fs, { r: 2, t: "s", layer: 1 })); }
  if (V === "wood"){ for (let y = 6; y < h + rise - 6; y += 6.5){ const x = y > h ? hw * (1 - (y - h) / rise) - 1.5 : hw; S.line([[-x, y, hl + 0.3], [x, y, hl + 0.3]], W.s, 0.9, { layer: 1, op: 0.75 }); if (y < h) S.line([[hw + 0.3, y, hl], [hw + 0.3, y, -hl]], W.fs, 0.9, { layer: 1, op: 0.8 }); } }
  // the eaves' shadow on the side wall
  Sd(hl, h - 7, -hl, h, W.fs, { r: 0, t: "s", layer: 1 });
  // door and windows of the front wall (in the light)
  const dw = V === "brick" ? 13 : 16, dh = V === "brick" ? 27 : 34, wy = h * 0.3, wh = h * 0.38, dx = V === "brick" ? -10 : V === "red" || V === "stone" ? -12 : 0;
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
  else { if (V === "wood"){ win(Fz, -21, wy, 11, wh, 1); win(Fz, 21, wy, 11, wh, 1); F(dx - dw / 2 - 6, dh + 3, dx + dw / 2 + 6, dh + 6.5, WIN, { r: 1, z: 1 }); } else win(Fz, 15, wy, 12, wh, 1);
    S.disc([0, h + rise * 0.42, hl + 0.4], 5.4, "z", V === "wood" ? WIN : W.r, { layer: 2, t: "l" }); S.disc([0, h + rise * 0.42, hl + 0.6], 3.8, "z", glassL, { layer: 2, z: 0.3, t: "l" });
    win(Sz, -16, wy, 12, wh, 0); win(Sz, 16, wy, 12, wh, 0); }
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
  return S.out(V === "brick" ? { y0: 18, y1: 174 } : { mid: true, y0: 20, y1: 178 });
}

/* ================================================================ a train (un train) ================================================================
   Coming toward us along its rails from the upper left: the long nose of a fast train, a dark windscreen, a row of windows, a
   carriage behind, a pantograph, rails and sleepers. Against a bus and a car: rails, no road wheels, several carriages, the nose.
   looks: a colour (blue, red ...) | "old" (a square-fronted railcar, green and cream) | "steam" (a black engine, red wheels, smoke, a tender)
   The train is drawn short and full (a power car and one carriage), so that at the size of a card it is a bold shape and not a thin line. */
function train(k, spec){
  if (k.has("steam")) return steam();
  const v = (spec && spec._v) || {}, Lp = v.lp || (k.has("old") ? 44 : 38), Lc = v.lc || 42;
  const old = k.has("old"), B = old ? C.green : colour(k, "blue"), S = scene(v.yaw || -64, v.pitch || 18, v.D || 210), W = 32, hz = W / 2, yb = 7, ys = 34, yr = 40, zr = hz - 6;
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
  const X0 = -Lc - 8, X1 = Lp + (old ? 10 : 46);
  S.face([[X0, 0, 21], [X1, 0, 21], [X1, 0, -21], [X0, 0, -21]], C.paving, { layer: -9, t: "l", r: 5 });
  for (let x = X0 + 6; x < X1 - 4; x += 13) S.face([[x, 0.2, 16], [x + 5, 0.2, 16], [x + 5, 0.2, -16], [x, 0.2, -16]], "#A98C69", { layer: -8, r: 0.6 });
  [10, -10].forEach(z => { S.face([[X0 + 2, 0.5, z + 1.1], [X1 - 2, 0.5, z + 1.1], [X1 - 2, 0.5, z - 1.1], [X0 + 2, 0.5, z - 1.1]], "#7F8796", { layer: -7, r: 0 }); S.line([[X0 + 2, 0.6, z + 0.6], [X1 - 2, 0.6, z + 0.6]], "#D5DAE2", 0.6, { layer: -7, z: 1 }); });
  cast(S, -Lc - 4, Lp + (old ? 0 : 32), -hz, hz, { g: 5, op: 0.12 });
  // the carriages, the far one first
  car(-Lc - 4, -4, true, false);
  if (old){ car(0, Lp, true, true);
    const fr = (z0, y0, z1, y1, m, oo) => S.face([[Lp + 0.3, y0, z0], [Lp + 0.3, y0, z1], [Lp + 0.3, y1, z1], [Lp + 0.3, y1, z0]], m, Object.assign({ layer: 2, r: 0.8 }, oo));
    fr(hz, 20, -hz, ys, CR.s, { r: 0, t: "s" }); fr(hz - 3, 22, 1.5, 32, GL); fr(-1.5, 22, -hz + 3, 32, GL); fr(hz - 3, 28, 1.5, 32, GL2, { op: 0.5, z: 0.2 });
    S.disc([Lp + 0.6, 13, 8], 2.6, "x", "#FFF1B8", { layer: 2, z: 0.4, t: "l" }); S.disc([Lp + 0.6, 13, -8], 2.6, "x", "#FFF1B8", { layer: 2, z: 0.4, t: "l" });
    fr(hz - 2, 2, -hz + 2, yb, C.dark.s, { t: "s" }); }
  else { car(0, Lp, false, true);
    const c = Lp, sideTop = [[c, ys, hz], [c + 10, 33, 14.5], [c + 26, 22, 12.5], [c + 38, 13, 9]];
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
  return S.out({ y1: 176, y0: 14, x0: 9, x1: 151, mid: true });
}

function steam(){
  const S = scene(-64, 18, 210), hz = 16, B = C.black, RD = C.red, yb = 7, TY = "#262B36", X0 = -62, X1 = 86;
  S.face([[X0, 0, 21], [X1, 0, 21], [X1, 0, -21], [X0, 0, -21]], C.paving, { layer: -9, t: "l", r: 5 });
  for (let x = X0 + 6; x < X1 - 4; x += 13) S.face([[x, 0.2, 16], [x + 5, 0.2, 16], [x + 5, 0.2, -16], [x, 0.2, -16]], "#A98C69", { layer: -8, r: 0.6 });
  [10, -10].forEach(z => { S.face([[X0 + 2, 0.5, z + 1.1], [X1 - 2, 0.5, z + 1.1], [X1 - 2, 0.5, z - 1.1], [X0 + 2, 0.5, z - 1.1]], "#7F8796", { layer: -7, r: 0 }); S.line([[X0 + 2, 0.6, z + 0.6], [X1 - 2, 0.6, z + 0.6]], "#D5DAE2", 0.6, { layer: -7, z: 1 }); });
  cast(S, -52, 68, -hz, hz, { g: 5, op: 0.12 });
  const wheel = (x, r, col) => { S.disc([x, r, hz + 0.6], r, "z", TY, { layer: 2, t: "l" }); S.disc([x, r, hz + 0.8], r * 0.76, "z", col, { layer: 2, z: 0.2, t: "l" }); S.disc([x, r, hz + 1], r * 0.24, "z", C.steel.l, { layer: 2, z: 0.4, t: "l" }); };
  // the tender, with its coal
  S.box([-52, yb, -14], [-6, 27, 14], B, { show: "frt", r: 1 }); S.face([[-48, 27, 10], [-10, 27, 10], [-15, 33, 3], [-43, 33, 3]], "#1F232C", { layer: 1, r: 2 }); S.face([[-43, 33, 3], [-15, 33, 3], [-15, 33, -7], [-43, 33, -7]], "#2A2F3A", { layer: 1, r: 2 });
  S.face([[-50, 20, 14.3], [-8, 20, 14.3], [-8, 22.4, 14.3], [-50, 22.4, 14.3]], RD.l, { layer: 1, r: 0 }); S.face([[-50, 2.5, 13], [-8, 2.5, 13], [-8, yb, 13], [-50, yb, 13]], C.dark, { t: "s", z: -1 });
  [-42, -29, -16].forEach(x => wheel(x, 4.6, C.dark.l));
  // the cab and its roof
  S.box([0, yb, -15], [20, 41, 15], B, { show: "frt", r: 1 }); S.box([-3, 41, -17], [23, 43.6, 17], { l: B.r, m: B.l, s: B.fs }, { show: "frt", layer: 1, r: 1 });
  S.face([[5, 25, 15.3], [15, 25, 15.3], [15, 36, 15.3], [5, 36, 15.3]], "#FFE9A6", { layer: 1, r: 1.5 });
  // the boiler: a round barrel, its front a door
  for (let i = 0; i < 12; i++){ const a = i * Math.PI / 6, b = (i + 1) * Math.PI / 6; S.face([[20, 25 + 12 * Math.cos(a), 12 * Math.sin(a)], [64, 25 + 12 * Math.cos(a), 12 * Math.sin(a)], [64, 25 + 12 * Math.cos(b), 12 * Math.sin(b)], [20, 25 + 12 * Math.cos(b), 12 * Math.sin(b)]], B, { r: 0 }); }
  S.disc([64.2, 25, 0], 12, "x", B.fs, { layer: 1, t: "l" }); S.disc([64.4, 25, 0], 9.2, "x", B.s, { layer: 1, z: 0.2, t: "l" }); S.disc([64.6, 25, 0], 2.2, "x", C.steel.l, { layer: 1, z: 0.4, t: "l" }); S.disc([64.8, 40, 0], 2.6, "x", "#FFF1B8", { layer: 2, t: "l" });
  [30, 44].forEach(x => S.face([[x, 25 + 12.2, -3], [x + 1.6, 25 + 12.2, -3], [x + 1.6, 25 + 10.7, 6.2], [x + 1.6, 25 + 6.2, 10.7], [x + 1.6, 25, 12.3], [x, 25, 12.3], [x, 25 + 6.2, 10.7], [x, 25 + 10.7, 6.2]], C.gold.l, { layer: 1, r: 0, op: 0.9 }));      // two bands of brass
  S.box([20, 11.5, -16], [69, 13.2, 16], RD, { show: "frt", layer: 1 });                                                        // the running board
  S.box([51.5, 36, -3.4], [58.5, 49, 3.4], B, { layer: 1, r: 1 }); S.box([50.5, 49, -4.4], [59.5, 51.6, 4.4], { l: B.r, m: B.l, s: B.fs }, { layer: 1, z: 1, r: 1 });      // the chimney
  S.box([32, 36, -3.6], [41, 41.5, 3.6], C.gold, { layer: 1, r: 2.5 });                                                         // the dome
  S.face([[0, 2.5, 13], [66, 2.5, 13], [66, yb + 4.5, 13], [0, yb + 4.5, 13]], C.dark, { t: "s", z: -1 });
  wheel(28, 8.4, RD.l); wheel(46, 8.4, RD.l); wheel(61, 4.8, RD.l);
  S.line([[28, 8.4, hz + 1.4], [46, 8.4, hz + 1.4], [59, 10.5, hz + 1.4]], C.steel.l, 1.8, { layer: 3 });                       // the rod
  S.box([55, 7, 13], [65, 13, hz + 1.2], B, { layer: 2, z: -2, r: 1 });                                                         // the cylinder
  S.box([67, 5, -15], [70, 11.5, 15], RD, { show: "frt", layer: 1, r: 0.8 }); [9, -9].forEach(z => S.disc([70.3, 8.4, z], 2.3, "x", C.steel.l, { layer: 2, t: "l" }));      // the buffer beam
  S.puff([55, 60, 0], 6.5, "#DDE0E7", "#C3C8D3", { layer: 4 }); S.puff([48, 73, 0], 9.5, "#DDE0E7", "#C3C8D3", { layer: 4 }); S.puff([37, 86, 0], 7.5, "#E4E6EC", "#CDD1DA", { layer: 4 });      // smoke
  return S.out({ y1: 176, y0: 12, x0: 9, x1: 151, mid: true });
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
    return S.out({ y1: 166, y0: 30, x0: 44, x1: 116 });      // not the whole card: three of them are laid out together (index.html) and must not touch
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
  return `<g transform="translate(80 ${121 + up}) scale(${small ? 1.02 : 1.07}) translate(-80 -121)">${s}</g>`;
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
  if (night){ s += fill(rrd(11, 13, 138, 164, 15), "#27325F") + fill("M11 28Q11 13 26 13H134Q149 13 149 28V60Q80 44 11 66Z", "#2F3B70") +
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
      fill("M4 158Q80 152 156 158L156 172Q80 180 4 173Z", WA.l) + fill("M4 166Q80 161 156 166L156 172Q80 180 4 173Z", WA.s) + line("M14 163H30M132 165H148M20 171H40M120 172H142", "#FFFFFF", 1.4, 'opacity=".75"') +
      fill("M34 156Q80 143 126 156L126 174H116Q116 160 104 160Q92 160 92 174H86Q86 159 74 159Q62 159 62 174H56Q56 160 46 160Q38 161 38 174H34Z", nt(C.stone).l) +      // a bridge of three arches: a river, not a lake
      fill("M34 156Q80 143 126 156L126 160Q80 147 34 160Z", nt(C.stone).r) + fill("M104 160Q116 160 116 174H112Q112 163 104 160ZM74 159Q86 159 86 174H82Q82 162 74 159ZM46 160Q56 160 56 174H52.5Q52.5 163 46 160Z", nt(C.stone).s); }
  else if (night) s += clipped(rrd(11, 13, 138, 164, 15), fill("M0 158Q80 150 160 158V190H0Z", nt(C.grass).l) + [[20, 156, 8], [44, 159, 6], [66, 158, 7], [92, 160, 6], [114, 158, 7.5], [138, 156, 8]].map(a => tree(a[0], a[1], a[2])).join(""));
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

/* ================================================================ a bus (un bus) ================================================================
   From the side like the car, facing right, but ONE long tall box: a row of many large windows, two glazed doors, two (or three) road
   wheels, a wide windscreen. Against a train (rails, a nose, carriages, seen along its length) and a car (short, a cabin over a bonnet).
   looks: a colour (red: the usual town bus) | "long" (a bus in two halves with a bellows, three axles) | "school" (yellow, a bonnet in
          front, dark lines along it) | "green" alone (an old round bus, cream above) ; "plain" with a colour: the town bus in that colour */
const tyre = (cx, cy, r, hub) => circ(cx, cy, r, "#2E3442") + line(`M${r1(cx - r * 0.74)} ${r1(cy - r * 0.6)}A${r} ${r} 0 0 1 ${r1(cx + r * 0.3)} ${r1(cy - r * 0.95)}`, "#5A6274", 1.4) +
  solid(cd(cx, cy, r * 0.58), hub || P("#E3E7EE", "#A9B1BF"), { k: 3, rim: 0 }) + circ(cx, cy, r * 0.2, "#7C8494");
function bus(k){
  const school = k.has("school"), long = k.has("long"), oldB = k.cn === "green" && !k.has("plain") && !long && !school;
  const B = school ? C.yellow : colour(k, "red"), G = C.glass, CR = "#FBF3E0", lamp = "#FFF1B8", DK = C.dark;
  const win = (x, y, w, h, r) => rect(x, y, w, h, G.l, r == null ? 2.5 : r) + clipped(rrd(x, y, w, h, r == null ? 2.5 : r), fill(`M${x + w * 0.5} ${y}H${x + w * 0.8}L${x + w * 0.45} ${y + h}H${x + w * 0.15}Z`, "#FFFFFF", 'opacity=".45"'));
  let s;
  if (oldB){                                               // an old round bus: cream above the waist, a round lamp
    const body = "M14 140V98Q14 70 44 70H112Q146 70 146 104V140Z", top = "M14 110V98Q14 70 44 70H112Q146 70 146 104V110Z";
    s = ground(80, 156, 74, 7) + solid(body, B, { k: 6 }) + clipped(body, fill(top, CR) + fill("M14 106H146V110H14Z", "#E2D7BE")) + line("M16 96Q16 72 44 72", "#FFFFFF", 1.4) +
      [22, 49, 76, 103].map(x => win(x, 80, 22, 22, 6)).join("") + fill("M129 80Q141 84 142 102H129Z", G.l) +
      line("M14 122H146", CR, 2.4) + circ(139, 124, 5.2, C.silver.s) + circ(139.6, 124, 3.8, lamp) + rect(140, 136, 10, 4.5, C.silver.l, 2) + rect(10, 136, 10, 4.5, C.silver.l, 2) + rect(15, 116, 3, 7, "#C9422F", 1.2) +
      circ(42, 142, 15.2, B.fs) + circ(114, 142, 15.2, B.fs) + tyre(42, 142, 12.6, P("#F3EBD8", "#CFC5AE")) + tyre(114, 142, 12.6, P("#F3EBD8", "#CFC5AE")); }
  else if (school){                                        // a yellow school bus: a bonnet in front, dark lines along it
    const body = "M12 140V86Q12 76 22 76H112Q120 76 121 84L124 108H140Q148 108 148 118V140Z";
    s = ground(80, 156, 74, 7) + solid(body, B, { k: 6 }) + [18, 38, 58, 78].map(x => win(x, 84, 16, 20)).join("") + fill("M100 84H114L117 106H100Z", G.l) +
      line("M12 112H122M12 120H146", DK.l, 2.2) + line("M97 82V138", B.fs, 1.2, 'opacity=".8"') + rect(141, 124, 6.5, 5, lamp, 1.5) + rect(12, 124, 3.4, 8, "#C9422F", 1.2) + rect(139, 134, 11, 5, DK.l, 2) + rect(9, 134, 9, 5, DK.l, 2) +
      circ(24, 80, 2.2, "#C9422F") + circ(108, 80, 2.2, "#F08A2E") +
      circ(40, 142, 15.2, B.fs) + circ(128, 142, 14.2, B.fs) + tyre(40, 142, 12.6) + tyre(128, 142, 11.6); }
  else if (long){                                          // a long bus: two halves, a bellows between them, three axles
    const a = "M11 138V98Q11 88 21 88H72V138Z", b = "M82 138V88H136Q146 88 148 100L149 126V138Z";
    s = ground(80, 152, 76, 6.5) + rect(70, 91, 14, 45, DK.l, 2) + [72.5, 76, 79.5].map(x => line(`M${x} 93V134`, DK.s, 1.4)).join("") +
      solid(a, B, { k: 5 }) + solid(b, B, { k: 5 }) + [16, 30, 44].map(x => win(x, 95, 11.5, 15)).join("") + [88, 102].map(x => win(x, 95, 11.5, 15)).join("") + fill("M131 95H138Q143 96 144 104V112H131Z", G.l) +
      rect(58, 94, 10, 40, B.s, 1.5) + rect(59.6, 96, 6.8, 22, G.l, 1) + rect(116, 94, 12, 40, B.s, 1.5) + rect(117.6, 96, 8.8, 22, G.l, 1) + line("M122 96V132", B.s, 1) +
      line("M11 119H56M70 119H114M130 119H148", CR, 2.4) + rect(143, 124, 5, 4.4, lamp, 1.4) + rect(11, 122, 3, 7, "#C9422F", 1.2) +
      [28, 100, 134].map(x => circ(x, 139, 12.4, B.fs) + tyre(x, 139, 10.2)).join(""); }
  else {                                                   // the town bus
    const body = "M12 140V86Q12 74 24 74H134Q145 74 147 88L149 122V140Z";
    s = ground(80, 156, 74, 7) + solid(body, B, { k: 6 }) + [18, 37, 75, 94].map(x => win(x, 83, 16, 22)).join("") + fill("M131 83H139Q143 84 144 92L145 108H131Z", G.l) +
      rect(56, 82, 16, 52, B.s, 2) + rect(58, 84.5, 5.4, 30, G.l, 1) + rect(64.6, 84.5, 5.4, 30, G.l, 1) + rect(113, 82, 15, 52, B.s, 2) + rect(115, 84.5, 11, 30, G.l, 1) + line("M120.5 84.5V132", B.s, 1) +
      line("M12 118H54M74 118H111M130 118H148", CR, 2.6) + rect(131, 76.5, 13, 4.2, "#F6C453", 1.2) + rect(143.5, 124, 5, 5, lamp, 1.5) + rect(12, 122, 3.2, 8, "#C9422F", 1.2) + rect(141, 134, 10, 5, C.silver.l, 2) + rect(9, 134, 9, 5, C.silver.l, 2) +
      circ(38, 142, 15.2, B.fs) + circ(108, 142, 15.2, B.fs) + tyre(38, 142, 12.6) + tyre(108, 142, 12.6); }
  return `<g transform="translate(80 ${long ? 86 : 90}) scale(1.04) translate(-80 -112)">${s}</g>`;
}

/* ================================================================ a phone (un téléphone) ================================================================
   A slab with a dark screen of small coloured squares, standing a little turned. Against a book (pages), a photo (a print with a white
   border and a scene) and a picture card. looks: a colour: the case (black, red, blue, silver ...) */
function phone(k){
  const B = k.cn === "silver" ? C.silver : colour(k, "black"), body = rrd(45, 20, 70, 150, 13), scr = rrd(50.5, 27, 59, 136, 8);
  const ICON = ["#F3BC3F", "#4489C8", "#DB4D3A", "#5AA86D", "#EE8FA8", "#8E6BBF", "#EE8B3A", "#FBF8F0", "#4FB3B0", "#DB4D3A", "#F3BC3F", "#4489C8"];
  let ic = ""; for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) ic += rect(57 + c * 16.4, 42 + r * 19, 12.6, 12.6, ICON[r * 3 + c], 3.6);
  return ground(84, 172, 46, 6) + `<g transform="rotate(-7 80 95)">` + solid(body, B, { k: 5, rim: 1.4 }) + fill(scr, "#243049") + clipped(scr, fill("M50 27H76L50 80Z", "#FFFFFF", 'opacity=".08"')) +
    rect(71, 30.5, 18, 4.4, "#101726", 2.2) + ic + rect(54.5, 124, 51, 20, "#34425F", 6) + [0, 1, 2].map(c => rect(59 + c * 15.4, 127.5, 12.6, 12.6, ["#5AA86D", "#FBF8F0", "#4489C8"][c], 3.6)).join("") + rect(68, 153.5, 24, 2.6, "#8D97AB", 1.3) + `</g>`;
}

/* ================================================================ a heart (un cœur) ================================================================
   The plain sign of a heart, full and round. looks: a colour (red, pink, purple, orange ...) */
function heart(k){
  const B = colour(k, "red"), d = "M80 166C44 136 15 108 15 71C15 45 34 28 55 28C67 28 76 34 80 45C84 34 93 28 105 28C126 28 145 45 145 71C145 108 116 136 80 166Z";
  return ground(84, 173, 40, 5, 0.2) + solid(d, B, { k: 9, rim: 1.6 }) + fill("M34 62C34 48 44 39 56 39C61 39 62 44 57 45C48 47 42 54 41 63C40 68 34 68 34 62Z", "#FFFFFF", 'opacity=".5"');
}

/* ================================================================ coffee (un café) ================================================================
   A cup ON ITS SAUCER with dark coffee in it and steam over it (the drink, not the place). Against a glass of water (clear, no handle,
   no saucer). looks: "in a white cup" (the usual one; a colour + "cup") | "in a small black cup" | "with milk" (a wide cup of pale
   coffee and a little jug) | "in a glass" (a glass of dark coffee on a saucer, a spoon) | "in a red mug" */
function coffee(k){
  const glass = k.has("glass"), milk = k.has("milk"), small = k.has("small"), mug = k.has("mug");
  const B = glass ? C.glass : k.cn && C[k.cn] ? C[k.cn] : C.white, CO = milk ? P("#C99B6E", "#A97C52") : P("#6B4630", "#4A2E1E"), SA = glass || milk || mug ? C.white : B;
  const steam = (x, y, h) => [0, 9, 18].map((dx, i) => line(`M${x + dx} ${y}q-6 ${-h * 0.25} 0 ${-h * 0.5}t0 ${-h * 0.5}`, "#A9B0C0", 2.6, `opacity="${i === 1 ? 0.75 : 0.5}"`)).join("");
  const saucer = (cx, cy, rx) => ground(cx + 2, cy + 6, rx * 1.05, rx * 0.2) + `<ellipse cx="${cx}" cy="${cy + 3}" rx="${rx}" ry="${r1(rx * 0.23)}" fill="${SA.s}"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${r1(rx * 0.23)}" fill="${SA.l}"/><ellipse cx="${cx + 2}" cy="${cy + 1}" rx="${r1(rx * 0.62)}" ry="${r1(rx * 0.13)}" fill="${SA.s}" opacity=".7"/>`;
  let s;
  if (glass){
    const g = "M52 62H108L102 140Q101 146 95 146H65Q59 146 58 140Z";
    s = saucer(80, 148, 56) + line("M96 152L132 142", C.silver.l, 3.2) + `<ellipse cx="135" cy="141" rx="7" ry="3.6" fill="${C.silver.l}" transform="rotate(-16 135 141)"/>` +
      fill(g, "#E4F1F6") + clipped(g, rect(40, 80, 80, 80, CO.l) + rect(84, 80, 40, 80, CO.s) + `<ellipse cx="80" cy="80" rx="27" ry="5" fill="${mix(CO.l, "#C99B6E", 0.5)}"/>`) +
      line("M57 70L62 138", "#FFFFFF", 3, 'opacity=".7"') + `<ellipse cx="80" cy="62" rx="28" ry="5.4" fill="none" stroke="${B.s}" stroke-width="2.2"/>` + line("M52 62L58 140Q59 146 65 146H95Q101 146 102 140L108 62", B.s, 2.2) + steam(71, 52, 30);
  } else {
    const w = milk ? 44 : mug ? 34 : 40, top = mug ? 70 : 84, bot = 142, cx = milk ? 62 : 78, k2 = small ? 0.72 : 1;
    const cup = mug ? `M${cx - w} ${top}H${cx + w}V${bot - 8}Q${cx + w} ${bot} ${cx + w - 8} ${bot}H${cx - w + 8}Q${cx - w} ${bot} ${cx - w} ${bot - 8}Z`
      : `M${cx - w} ${top}H${cx + w}Q${cx + w} ${bot - 6} ${cx + w * 0.42} ${bot}H${cx - w * 0.42}Q${cx - w} ${bot - 6} ${cx - w} ${top}Z`;
    const hy = top + (mug ? 16 : 10), handle = `M${cx + w - 3} ${hy}Q${cx + w + 24} ${hy - 4} ${cx + w + 22} ${hy + 16}Q${cx + w + 20} ${hy + 32} ${cx + w - (mug ? 3 : 12)} ${hy + (mug ? 36 : 30)}`;
    s = (mug ? ground(cx + 4, bot + 2, w * 1.5, 7) : saucer(cx, bot + 2, w * 1.42)) + line(handle, B.s, 9) + line(handle, B.l, 5.4) + solid(cup, B, { k: 7, rim: 1.4 }) +
      `<ellipse cx="${cx}" cy="${top}" rx="${w}" ry="${r1(w * 0.2)}" fill="${B.r}"/><ellipse cx="${cx}" cy="${top + 0.6}" rx="${w - 4}" ry="${r1(w * 0.2 - 2)}" fill="${CO.s}"/><ellipse cx="${cx}" cy="${top + 1.8}" rx="${w - 5.5}" ry="${r1(w * 0.2 - 3.2)}" fill="${CO.l}"/>` +
      (milk ? line(`M${cx - 14} ${top + 2}q8 -4 16 0t14 -1`, "#FBF3E0", 2.2, 'opacity=".9"') : `<ellipse cx="${cx - w * 0.3}" cy="${top + 0.6}" rx="${r1(w * 0.3)}" ry="2" fill="${mix(CO.l, "#C99B6E", 0.55)}" opacity=".8"/>`) + steam(cx - 9, top - 10, 30);
    if (milk) s += ground(132, 158, 20, 5) + line("M143 128Q155 128 153 139Q151 148 141 148", C.white.s, 4) + solid("M118 120H146L142 154Q142 158 138 158H126Q122 158 122 154Z", C.white, { k: 5 }) + `<ellipse cx="132" cy="120" rx="14" ry="3.4" fill="#FFFFFF"/><ellipse cx="132" cy="120.6" rx="11" ry="2.2" fill="#F3EBD8"/>` + fill("M115 117L121 119L120 125Z", C.white.l);
    if (small) s = `<g transform="translate(80 150) scale(${k2}) translate(-80 -150)">${s}</g>`;
  }
  return `<g transform="translate(0 4)">${s}</g>`;
}

/* ================================================================ a door (une porte) ================================================================
   The door ALONE, as large as the card: its frame of stone, its step, a knob. Against a house (a whole building, with a roof) and a
   window. looks: a colour (red: a panelled front door under a fanlight) | "wooden" (planks and a brace) | "with a window" (glazed above)
   | "old" (green: an arched door of planks on iron hinges) | "white" | "big" with black (a double door: not drawn here yet) */
function door(k){
  if (k.has("big")) return null;
  const old = k.has("old"), wooden = k.has("wooden") && !old, glazed = k.has("window"), B = wooden ? C.wood : colour(k, old ? "green" : "red"), ST = C.stone, BR = C.gold, IR = "#2E3442";
  let s = ground(82, 174, 62, 6, 0.2);
  if (old){
    const fr = "M32 170V70Q32 16 80 16Q128 16 128 70V170Z", lf = "M43 170V72Q43 28 80 28Q117 28 117 72V170Z";
    s += solid(fr, ST, { k: 5 }) + [[34, 96], [34, 128], [118, 84], [118, 142], [56, 22], [96, 20]].map(([x, y], i) => rect(x, y, i > 3 ? 12 : 8, i > 3 ? 5 : 12, i % 2 ? ST.r : ST.s, 2, 'opacity=".7"')).join("") +
      solid(lf, B, { k: 6 }) + clipped(lf, [55, 67.5, 80, 92.5, 105].map(x => line(`M${x} 26V170`, B.fs, 1.2, 'opacity=".6"')).join("")) +
      [70, 136].map(y => fill(`M43 ${y - 3.5}H96L101 ${y}L96 ${y + 3.5}H43Z`, IR) + circ(50, y, 1.3, "#8D97AB") + circ(64, y, 1.3, "#8D97AB") + circ(78, y, 1.3, "#8D97AB")).join("") +
      `<circle cx="104" cy="104" r="6" fill="none" stroke="${IR}" stroke-width="2.6"/>` + circ(104, 98, 2.2, IR);
  } else {
    const fan = !wooden && !glazed, top = fan ? 50 : 24;
    s += solid(fan ? "M32 170V58Q32 14 80 14Q128 14 128 58V170Z" : rrd(32, 14, 96, 156, 4), wooden ? C.stone : P("#FBF8F0", "#D9D3C4"), { k: 5 });
    if (fan) s += fill("M43 50Q43 25 80 25Q117 25 117 50Z", C.glass.l) + line("M80 26V50M56 32L68 50M104 32L92 50", "#FBF8F0", 2.4) + fill("M43 50Q43 25 80 25L80 28Q49 29 46 50Z", C.glass.s, 'opacity=".6"');
    const lf = rrd(43, top, 74, 170 - top, 2);
    s += solid(lf, B, { k: 6 });
    if (wooden) s += clipped(lf, [55.3, 67.6, 80, 92.3, 104.6].map(x => line(`M${x} ${top}V170`, B.fs, 1.2, 'opacity=".6"')).join("")) + fill(`M43 ${top + 16}H117V${top + 27}H43Z`, B.r, 'opacity=".55"') + fill("M43 136H117V147H43Z", B.r, 'opacity=".55"') +
        fill(`M49 136L105 ${top + 27}H117L61 136Z`, B.r, 'opacity=".55"') + `<circle cx="108" cy="104" r="5.5" fill="none" stroke="${IR}" stroke-width="2.6"/>` + circ(108, 98.5, 2.2, IR);
    else { const pan = (x, y, w, h) => rect(x, y, w, h, B.s, 2) + rect(x + 1.6, y + 1.8, w - 1.6, h - 1.8, B.m, 1.5);
      if (glazed) s += rect(51, top + 9, 58, 60, "#FBF8F0", 2.5) + rect(54, top + 12, 52, 54, C.glass.l, 1.5) + clipped(rrd(54, top + 12, 52, 54, 1.5), fill(`M78 ${top + 10}H94L72 ${top + 70}H56Z`, "#FFFFFF", 'opacity=".5"')) + rect(78.6, top + 12, 2.8, 54, "#FBF8F0") + rect(54, top + 37.6, 52, 2.8, "#FBF8F0") + pan(51, 112, 58, 48);
      else s += pan(51, top + 9, 25, 44) + pan(84, top + 9, 25, 44) + pan(51, top + 62, 25, 50) + pan(84, top + 62, 25, 50);
      s += rect(70, glazed ? 102 : top + 55, 20, 4.6, BR.l, 1.6) + circ(109.5, glazed ? 106 : top + 58, 3.4, BR.s) + circ(109, glazed ? 105.4 : top + 57.4, 2.6, BR.l); }
  }
  return s + fill(rrd(22, 168, 116, 9, 3), ST.l) + fill("M22 173H138V174Q138 177 135 177H25Q22 177 22 174Z", ST.s);
}

/* ================================================================ a photo (une photo) ================================================================
   A PRINT: a white border round a picture of people out of doors, a shine across it, a strip of tape; it lies turned on the card.
   Against a book (pages), a phone (a dark screen), a picture card (the learner's figure on a plain card) and a window.
   looks: "family" (three people) | "holiday" (two people, a tower, the sun) | "old" (brown, two people, corner mounts) |
          a colour (a portrait of one person on that colour: "blue") */
function photo(k){
  const old = k.has("old"), fam = k.has("family"), hol = k.has("holiday"), SK = ["#E8B58E", "#C98F62", "#F0C7A4"], x0 = 30, y0 = 34, w = 100, h = 96;
  const sep = c => old ? mix(mix(c, "#8A6A45", 0.55), "#E9D9BA", 0.25) : c;
  const head = (cx, cy, r, skin, hair, top) => fill(`M${cx - r * 1.9} ${y0 + h}Q${cx - r * 1.9} ${cy + r * 1.25} ${cx} ${cy + r * 1.15}Q${cx + r * 1.9} ${cy + r * 1.25} ${cx + r * 1.9} ${y0 + h}Z`, sep(top)) + circ(cx, cy, r, sep(skin)) +
    fill(`M${cx - r * 1.04} ${cy - r * 0.1}Q${cx - r * 1.1} ${cy - r * 1.25} ${cx} ${cy - r * 1.2}Q${cx + r * 1.1} ${cy - r * 1.25} ${cx + r * 1.04} ${cy - r * 0.1}Q${cx + r * 0.5} ${cy - r * 0.7} ${cx - r * 0.3} ${cy - r * 0.62}Q${cx - r * 0.8} ${cy - r * 0.55} ${cx - r * 1.04} ${cy - r * 0.1}Z`, sep(hair)) +
    line(`M${cx - r * 0.36} ${cy + r * 0.4}Q${cx} ${cy + r * 0.66} ${cx + r * 0.36} ${cy + r * 0.4}`, sep("#8A4B3A"), 1.3) + circ(cx - r * 0.36, cy + r * 0.02, r * 0.1, sep("#2B2420")) + circ(cx + r * 0.36, cy + r * 0.02, r * 0.1, sep("#2B2420"));
  const pic = rrd(x0, y0, w, h, 2);
  let in_ = "";
  if (k.cn && !old && !fam && !hol) in_ = rect(x0, y0, w, h, colour(k).l) + rect(x0, y0 + h * 0.62, w, h, colour(k).s, 0, 'opacity=".35"') + head(80, 78, 21, SK[0], "#5A3B28", C.red.l);
  else { in_ = rect(x0, y0, w, h, sep("#BFE0F2")) + fill(`M${x0} ${y0 + 66}Q${x0 + 50} ${y0 + 52} ${x0 + w} ${y0 + 64}V${y0 + h}H${x0}Z`, sep("#9FCF8C"));
    if (hol) in_ += circ(x0 + 20, y0 + 20, 9, sep("#F7C948")) + fill(`M${x0 + 80} ${y0 + 12}L${x0 + 84.5} ${y0 + 40}Q${x0 + 88} ${y0 + 62} ${x0 + 96} ${y0 + 78}H${x0 + 89}Q${x0 + 80} ${y0 + 60} ${x0 + 71} ${y0 + 78}H${x0 + 64}Q${x0 + 72} ${y0 + 62} ${x0 + 75.5} ${y0 + 40}Z`, sep("#6E7A92")) + head(52, 96, 13, SK[0], "#2B2420", C.red.l) + head(82, 102, 12, SK[1], "#B9763E", C.blue.l);
    else if (fam) in_ += circ(x0 + 78, y0 + 30, 22, sep("#8FCB8A")) + circ(x0 + 20, y0 + 36, 16, sep("#A9D79E")) + head(54, 88, 13, SK[0], "#5A3B28", C.blue.l) + head(104, 86, 13, SK[1], "#2B2420", C.red.l) + head(80, 106, 10.5, SK[2], "#C68A3E", C.yellow.l);
    else in_ += head(62, 84, 15, SK[0], "#3D2B1F", "#5F5448") + head(100, 90, 14, SK[2], "#6B4A2E", "#8A7A66"); }
  const paper = old ? P("#F1E4C6", "#D3C3A0") : P("#FFFFFF", "#E3DED2");
  let s = fill(rrd(22, 26, 116, old ? 112 : 126, 3), paper.s, 'transform="translate(2.4 3)"') + fill(rrd(22, 26, 116, old ? 112 : 126, 3), paper.l) + clipped(pic, in_ + fill(`M${x0 + 40} ${y0}H${x0 + 66}L${x0 + 26} ${y0 + h}H${x0}Z`, "#FFFFFF", 'opacity=".28"'));
  if (old) s += [[22, 26, 0], [138, 26, 90], [138, 138, 180], [22, 138, 270]].map(([x, y, a]) => fill("M-3 -3H16L-3 16Z", "#3A4254", `transform="translate(${x} ${y}) rotate(${a})"`)).join("");
  else s += fill("M62 18H98L99 31H61Z", "#F3DE9A", 'opacity=".92"') + fill("M62 18H98L98.3 22H61.8Z", "#FFF4C4", 'opacity=".9"');
  return ground(84, 170, 60, 6, 0.2) + `<g transform="rotate(${old ? 5 : -6} 80 95) translate(0 ${old ? 12 : 6})">${s}</g>`;
}

/* ================================================================ a street (une rue) ================================================================
   Seen from INSIDE, down its length: two rows of fronts running away to one point, the roadway between them with its line, pavements,
   a lamp. Against a town (seen whole from outside: a skyline, a spire) and a restaurant (one front, close).
   looks: "with cars" | "with trees" | "with shops" (awnings along both sides) | "with houses" | "at night" (a dark sky, lit windows) */
function street(k){
  const night = k.has("night"), shops = k.has("shops"), cars = k.has("cars"), trees = k.has("trees"), V = [80, 92], panel = rrd(11, 13, 138, 164, 15);
  const nt = p => night ? P(mix(p.l, "#2A3566", 0.7), mix(p.s, "#1E2750", 0.76)) : p, winC = night ? "#FFD966" : "#6C7E9C", L = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const AW = [C.red, C.blue, C.yellow, C.green, C.orange, C.blue];
  /* one side: three fronts between x = xa (near, at the card's edge) and xb (far); y at the near edge: top ty[i], bottom 170 */
  const side = (sgn, W3, tops) => { let o = ""; const X = t => 80 + sgn * (68 - 54 * t), cuts = [0, 0.42, 0.74, 1];
    for (let i = 2; i >= 0; i--){ const W = nt(W3[i]), t0 = cuts[i], t1 = cuts[i + 1], xa = X(t0), xb = X(t1), nearTop = [80 + sgn * 68, tops[i]], nearBot = [80 + sgn * 68, 170];
      const top = t => L(nearTop, V, t * 54 / 68), bot = t => L(nearBot, V, t * 54 / 68), q = (t, f) => { const a = top(t), b = bot(t); return [X(t), a[1] + (b[1] - a[1]) * f]; };
      o += fill(poly([q(t0, 0), q(t1, 0), q(t1, 1), q(t0, 1)]), sgn < 0 ? W.s : W.l) + line(`M${r1(q(t0, 0)[0])} ${r1(q(t0, 0)[1])}L${r1(q(t1, 0)[0])} ${r1(q(t1, 0)[1])}`, sgn < 0 ? W.l : W.r, 1.2);
      const n = i === 0 ? 3 : 2; for (let c = 0; c < n; c++) for (let r = 0; r < 2; r++){ const a = t0 + (t1 - t0) * (c + 0.2) / n, b = t0 + (t1 - t0) * (c + 0.72) / n, f0 = 0.1 + r * 0.26, f1 = f0 + 0.17;
          if (night && (c + r + i) % 3 === 0) o += fill(poly([q(a, f0), q(b, f0), q(b, f1), q(a, f1)]), mix(W.s, INK, 0.3)); else o += fill(poly([q(a, f0), q(b, f0), q(b, f1), q(a, f1)]), winC); }
      const a = t0 + (t1 - t0) * 0.1, b = t0 + (t1 - t0) * 0.9;                                                 // the ground floor: a shop window under an awning, or a door
      if (shops){ const A = nt(AW[i + (sgn > 0 ? 3 : 0)]); o += fill(poly([q(a, 0.72), q(b, 0.72), q(b, 0.94), q(a, 0.94)]), night ? "#FFD966" : nt(C.glass).l) + fill(poly([q(a, 0.57), q(b, 0.57), [q(b, 0.7)[0] - sgn * 7 * (1 - t1 * 0.75), q(b, 0.7)[1]], [q(a, 0.7)[0] - sgn * 7 * (1 - t0 * 0.75), q(a, 0.7)[1]]]), sgn < 0 ? A.m : A.l) + fill(poly([[q(a, 0.7)[0] - sgn * 7 * (1 - t0 * 0.75), q(a, 0.7)[1]], [q(b, 0.7)[0] - sgn * 7 * (1 - t1 * 0.75), q(b, 0.7)[1]], [q(b, 0.74)[0] - sgn * 7 * (1 - t1 * 0.75), q(b, 0.74)[1]], [q(a, 0.74)[0] - sgn * 7 * (1 - t0 * 0.75), q(a, 0.74)[1]]]), A.fs); }
      else { const m = (a + b) / 2, d = (t1 - t0) * 0.1; o += fill(poly([q(m - d, 0.7), q(m + d, 0.7), q(m + d, 1), q(m - d, 1)]), nt(sgn < 0 ? C.brown : C.blue).s); }
    } return o; };
  let s = night ? fill(panel, "#27325F") + fill("M11 28Q11 13 26 13H134Q149 13 149 28V50Q80 36 11 54Z", "#2F3B70") + [[52, 30], [70, 22], [96, 40], [112, 24], [64, 52]].map(([x, y], i) => circ(x, y, i % 2 ? 1.1 : 1.5, "#FFF6CF")).join("") + circ(92, 28, 7.5, "#FFF1B8") + circ(89, 26, 6.8, "#27325F") : "";
  let in_ = fill(poly([[12, 178], [148, 178], [148, 170], [94, V[1] + 16], [66, V[1] + 16], [12, 170]]), nt(C.paving).l) +                                            // the pavements
    fill(poly([[32, 178], [128, 178], [86, V[1] + 16], [74, V[1] + 16]]), nt(P("#A3AAB8", "#858D9C")).l) +                                                           // the roadway
    [[0.04, 0.2], [0.34, 0.47], [0.6, 0.69], [0.8, 0.86]].map(([a, b]) => { const y = t => 178 + (V[1] + 16 - 178) * t, hw = t => 2.2 * (1 - t) + 0.4; return fill(poly([[80 - hw(a), y(a)], [80 + hw(a), y(a)], [80 + hw(b), y(b)], [80 - hw(b), y(b)]]), night ? "#C9CEE6" : "#FFFFFF"); }).join("") +
    rect(69, V[1] - 6, 22, 23, nt(far(C.cream, 0.3)).l, 1) + fill(poly([[67.5, V[1] - 5.5], [80, V[1] - 16], [92.5, V[1] - 5.5]]), nt(far(C.tile, 0.25)).l) + rect(77, V[1] + 4, 6, 12, nt(far(C.slate, 0.2)).l, 1) +      // the far end of the street
    side(-1, [P("#F1D3B4", "#CFA884"), C.cream, P("#E9E2D2", "#C2B9A3")], [20, 38, 28]) + side(1, [P("#F4DDA6", "#D3B878"), P("#E7C9C0", "#C4A096"), C.cream], [30, 18, 36]);
  if (trees) in_ += [[0.1, 1], [0.45, 1], [0.7, 1], [0.1, -1], [0.45, -1], [0.7, -1]].map(([t, sg]) => { const x = 80 + sg * (46 - 37 * t), y = 174 + (V[1] + 16 - 174) * t, r = 13 * (1 - t * 0.8); return rect(x - r * 0.1, y - r * 1.5, r * 0.2, r * 1.5, nt(C.brown).s) + solid(cd(x, y - r * 2, r), nt(C.leaf), { k: r * 0.45, rim: night ? 0 : 1 }); }).reverse().join("");
  if (cars){ const rear = (x, y, w, B) => { const h = w * 0.78; return ground(x, y + 1, w * 0.7, w * 0.12, 0.3) + solid(rrd(x - w / 2, y - h, w, h * 0.92, w * 0.16), B, { k: w * 0.12, rim: 0.8 }) + fill(rrd(x - w * 0.36, y - h * 0.9, w * 0.72, h * 0.34, w * 0.07), nt(C.glass).l) + rect(x - w * 0.46, y - h * 0.44, w * 0.2, h * 0.12, "#F2C24B", 1) + rect(x + w * 0.26, y - h * 0.44, w * 0.2, h * 0.12, "#F2C24B", 1) + rect(x - w * 0.42, y - h * 0.1, w * 0.18, h * 0.14, "#2E3442", 1) + rect(x + w * 0.24, y - h * 0.1, w * 0.18, h * 0.14, "#2E3442", 1); };
    in_ += rear(88, 124, 10, nt(C.blue)) + rear(63, 166, 28, nt(C.red)); }
  const lx = 126; in_ += line(`M${lx} 176V92Q${lx} 84 ${lx - 9} 84`, night ? "#141A2E" : "#414B5E", 2.6) + circ(lx - 11, 86.5, 4.2, night ? "#FFE9A6" : "#FBF8F0") + (night ? circ(lx - 11, 86.5, 11, "#FFE9A6", 'opacity=".25"') : "");
  return s + clipped(panel, in_);
}

/* ================================================================ T3: the things of Lessons 11 to 20 ================================================================
   Animals, food, clothes, furniture, places. The same finish as above. Organic forms are drawn with two tools: blob(points), a smooth
   closed curve through the points (Catmull-Rom), and tube(points, widths), a limb or a tail: a smooth tapered band through the points
   with round ends. Animals face right and stand on y = 172 (their far legs in the darker pair, as the figures' far limbs). */
function crSample(pts, closed, n){                         // points along a Catmull-Rom curve through pts
  const out = [], m = pts.length, N = n || 8, at = i => closed ? pts[(i + m) % m] : pts[Math.max(0, Math.min(m - 1, i))];
  for (let i = 0; i < (closed ? m : m - 1); i++){ const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let j = 0; j < N; j++){ const t = j / N, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(c => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3))); } }
  if (!closed) out.push(pts[m - 1]);
  return out;
}
const pth = (q, z) => "M" + q.map(p => r1(p[0]) + " " + r1(p[1])).join("L") + (z ? "Z" : "");
const blob = pts => pth(crSample(pts, true, 8), true);
function tube(pts, ws){                                    // a tapered band through pts; ws: the width at each point
  const q = crSample(pts, false, 6), n = q.length, wAt = i => { const f = i / (n - 1) * (ws.length - 1), a = Math.floor(f), b = Math.min(ws.length - 1, a + 1); return ws[a] + (ws[b] - ws[a]) * (f - a); };
  const L = [], R = [];
  for (let i = 0; i < n; i++){ const a = q[Math.max(0, i - 1)], b = q[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = wAt(i) / 2;
    L.push([q[i][0] - dy / l * w, q[i][1] + dx / l * w]); R.push([q[i][0] + dy / l * w, q[i][1] - dx / l * w]); }
  const cap = (c, from, w, dir) => { const o = []; const a0 = Math.atan2(from[1] - c[1], from[0] - c[0]); for (let j = 1; j < 6; j++){ const a = a0 + dir * Math.PI * j / 6; o.push([c[0] + Math.cos(a) * w, c[1] + Math.sin(a) * w]); } return o; };
  const e0 = cap(q[n - 1], L[n - 1], wAt(n - 1) / 2, -1), e1 = cap(q[0], R[0], wAt(0) / 2, -1);
  return pth(L.concat(e0, R.reverse(), e1), true);
}
const eye = (x, y, r, c) => circ(x, y, r, c || "#262B36") + circ(x - r * 0.32, y - r * 0.36, r * 0.36, "#FFFFFF");
const rot = (a, x, y, inner) => `<g transform="rotate(${a} ${x} ${y})">${inner}</g>`;
const shift = (dx, dy, s, inner, cx, cy) => `<g transform="translate(${r1(dx)} ${r1(dy)})${s && s !== 1 ? ` translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})` : ""}">${inner}</g>`;
const COAT = { brown: P("#A8693F", "#7C4A2A"), golden: P("#E6AD5C", "#BD8236"), black: P("#454A5A", "#2A2E3A"), grey: P("#A9B0BC", "#7E8696"), white: P("#F4EEE2", "#CABEA8"),
  ginger: P("#EE9845", "#C46F28"), cream: P("#F2DFBA", "#CFB487"), chestnut: P("#B4572C", "#86391C"), tabby: P("#B9A68C", "#8D7A62") };
const coatOf = (k, def) => { const n = k.has("golden") ? "golden" : k.has("ginger", "orange") ? "ginger" : k.has("chestnut") ? "chestnut" : k.cn === "yellow" ? "golden" : k.cn === "silver" ? "grey" : k.cn; return COAT[n] || COAT[def]; };

/* ================================================================ a dog (un chien) ================================================================
   A friendly dog from the side, facing right: a long body, four legs, a tail up, a muzzle, a hanging ear. Against a cat (a round face to
   us, pointed ears, whiskers) and a horse (long legs, a long head, a mane). looks: a colour (brown: the usual one; golden, black, grey,
   white) | "spotted" (white with black spots) | "puppy" | "sitting" | "lying down" | "running" | doing / looks "sleeping" | "eating" */
function dog(k, spec){
  const doing = String(spec && spec.doing || "").toLowerCase(), sleep = k.has("sleeping") || /sleep/.test(doing), eat = k.has("eating") || /eat/.test(doing);
  const pose = sleep || k.has("lying") ? "lie" : k.has("sitting") ? "sit" : k.has("running") ? "run" : eat ? "eat" : "stand", pup = k.has("puppy");
  const spotted = k.has("spotted"), B = spotted ? COAT.white : coatOf(k, "brown"), FL = { l: B.fl, s: B.fs, r: B.fl }, E = spotted ? COAT.black : P(mix(B.l, B.s, 0.6), mix(B.s, INK, 0.28));
  const MZ = mix(B.l, "#FFFFFF", spotted || B === COAT.white ? 0 : 0.22), NOSE = "#2A2E3A";
  const far = (pts, ws) => fill(tube(pts, ws), FL.s) + fill(cd(pts[pts.length - 1][0] + 2, pts[pts.length - 1][1] + 1, ws[ws.length - 1] * 0.62), FL.s);
  const near = (pts, ws) => solid(tube(pts, ws), B, { k: 3, rim: 0 }) + solid(cd(pts[pts.length - 1][0] + 2.5, pts[pts.length - 1][1] + 1, ws[ws.length - 1] * 0.64), B, { k: 2, rim: 0 });
  const spots = (d, sp) => spotted ? clipped(d, sp.map(([x, y, r]) => circ(x, y, r, COAT.black.l)).join("")) : "";
  /* the head about the back of the skull, the muzzle to the right; sc its size; shut: the eyes closed */
  const head = (hx, hy, a, sc, shut, earUp) => {
    const sk = blob([[-15, -6], [-8, -16], [6, -17], [14, -10], [27, -7], [32, 0], [28, 8], [14, 11], [-2, 13], [-14, 7]]);
    let h = solid(sk, B, { k: 4, rim: 1.2 }) + (spotted ? clipped(sk, circ(-6, -8, 7, COAT.black.l)) : "") +
      fill(blob([[13, 1], [27, 0], [31.5, 4], [26, 10], [13, 10]]), MZ) +                                                          // the paler muzzle
      fill(blob([[25, -6.5], [32, -5.5], [33.5, -1], [29, 0.6], [24.5, -2.5]]), NOSE) + circ(28.6, -4.6, 1.1, "#FFFFFF", 'opacity=".55"') + line("M28 4.5Q23 8.5 17 7", mix(B.s, INK, 0.45), 1.3) +
      (shut ? line("M3 -6Q7 -3 11 -6", "#262B36", 1.8) : eye(7, -6.5, 3.4) + line("M3 -12Q7 -14 11 -12.5", mix(B.s, INK, 0.3), 1.4, 'opacity=".7"')) +
      (earUp ? solid(blob([[-9, -12], [-3, -16], [2, -12], [-1, -2], [-6, 2], [-11, -2]]), E, { k: 2.5, rim: 0.8 })
             : solid(blob([[-9, -15], [-1, -15], [1, -5], [-2, 10], [-8, 16], [-14, 12], [-13, -4]]), E, { k: 3, rim: 0.8 }));           // the ear: hanging, or flying back when running
    return `<g transform="translate(${hx} ${hy}) rotate(${a}) scale(${sc})">${h}</g>`; };
  const tail = pts => solid(tube(pts, [9, 6.5, 3.4]), B, { k: 2.5, rim: 0.8 });
  const neck = (pts, ws) => solid(tube(pts, ws), B, { k: 4, rim: 1.2 });
  const chest = d => fill(d, MZ, 'opacity=".75"');
  let s;
  if (pose === "stand" || pose === "eat"){
    /* the body box, the legs' length and the head's size: a puppy has a big head, a short round body, short legs */
    const x0 = pup ? 52 : 36, x1 = pup ? 112 : 116, yT = pup ? 116 : 102, yB = pup ? 150 : 140, lt = yB - 12, hs = pup ? 1.72 : 1.42, lw = pup ? 15 : 15.5;
    const body = blob([[x1 - 4, yT + 2], [x1 + 4, (yT + yB) / 2], [x1 - 4, yB - 2], [(x0 + x1) / 2, yB + 1], [x0 + 8, yB - 2], [x0 - 2, (yT + yB) / 2 + 2], [x0 + 6, yT + 2], [(x0 + x1) / 2, yT - 2]]);
    s = ground(80, 172, 58, 6) + tail([[x0 + 6, yT + 8], [x0 - 6, yT - 4], [x0 - 10, yT - 22]]) +
      far([[x1 - 10, lt], [x1 - 7, 150], [x1 - 6, 167]], [lw - 2, lw * 0.72, lw * 0.7]) + far([[x0 + 14, lt], [x0 + 8, 150], [x0 + 12, 167]], [lw, lw * 0.72, lw * 0.7]) +
      near([[x1 - 20, lt], [x1 - 19, 150], [x1 - 18, 167]], [lw, lw * 0.76, lw * 0.72]) + near([[x0 + 24, lt - 4], [x0 + 28, 148], [x0 + 22, 167]], [lw + 6, lw * 0.76, lw * 0.72]) +
      "<!--N-->" + solid(body, B, { k: 6, rim: 1.4 }) + spots(body, [[x0 + 30, yT + 14, 9], [x0 + 52, yT + 24, 6], [x0 + 12, yT + 20, 6], [x1 - 14, yT + 8, 5]]) +
      chest(blob([[x1 - 18, yT + 18], [x1, yT + 16], [x1 + 2, yB - 6], [x1 - 14, yB]]));
    if (eat) s = s.replace("<!--N-->", neck([[x1 - 8, yT + 10], [x1 + 6, yT + 24], [x1 + 10, yT + 36]], [30, 25, 22])) + head(x1 + 2, yT + 38, 52, hs * 0.9) +
      solid("M112 154H156L151 167Q150 170 146 170H122Q118 170 117 167Z", C.red, { k: 3 }) + `<ellipse cx="134" cy="154" rx="22" ry="4" fill="${C.red.r}"/><ellipse cx="134" cy="154.6" rx="18.5" ry="2.6" fill="${C.red.fs}"/>`;
    else s = s.replace("<!--N-->", neck([[x1 - 10, yT + 14], [x1, yT - 8], [x1 + 2, yT - 22]], [32, 27, 24])) + head(x1 - 2, yT - 26, -4, hs);
  } else if (pose === "sit"){
    const body = blob([[104, 92], [116, 110], [114, 136], [100, 160], [76, 168], [54, 164], [50, 144], [70, 116], [88, 96]]);
    s = ground(84, 172, 52, 6) + tail([[56, 164], [38, 170], [22, 164]]) + far([[106, 124], [110, 150], [110, 167]], [12, 10.5, 10]) +
      near([[98, 124], [99, 150], [100, 167]], [15, 11.5, 11]) + solid(body, B, { k: 6, rim: 1.4 }) + spots(body, [[84, 120, 8], [70, 146, 7], [100, 140, 5]]) +
      chest(blob([[100, 104], [114, 112], [112, 140], [100, 146]])) + near([[98, 134], [99, 150], [100, 167]], [15, 11.5, 11]) +
      solid(blob([[54, 138], [78, 132], [88, 150], [84, 168], [54, 170], [46, 158]]), B, { k: 4, rim: 1 }) + fill(blob([[60, 164], [84, 162], [86, 170], [60, 171]]), B.s) +      // the haunch and the hind foot
      neck([[100, 104], [106, 86], [108, 72]], [32, 27, 24]) + head(104, 62, -4, 1.42);
  } else if (pose === "lie"){
    const body = blob([[100, 126], [114, 136], [112, 156], [90, 164], [60, 164], [36, 158], [32, 140], [48, 128], [76, 124]]);
    s = ground(80, 170, 66, 6) + tail([[38, 156], [22, 164], [8, 164]]) + solid(body, B, { k: 6, rim: 1.4 }) + spots(body, [[60, 140, 9], [86, 146, 6], [44, 152, 5]]) +
      solid(blob([[40, 140], [64, 136], [72, 152], [64, 166], [40, 166], [32, 154]]), B, { k: 4, rim: 1 }) + near([[98, 156], [120, 162], [140, 164]], [14, 11, 10]) + near([[60, 162], [78, 166]], [11, 10]) +
      (sleep ? head(104, 146, 2, 1.32, true) : neck([[100, 136], [110, 122], [114, 110]], [30, 25, 22]) + head(112, 102, -4, 1.36));
  } else {                                                  // running: stretched out, off the ground, the ears flying back
    const body = blob([[108, 92], [120, 102], [116, 120], [96, 126], [70, 124], [48, 120], [34, 108], [38, 96], [54, 90], [80, 88]]);
    s = ground(80, 172, 50, 5, 0.18) + tail([[40, 100], [24, 90], [8, 86]]) + far([[106, 112], [122, 128], [140, 136]], [12, 10, 9.5]) + far([[48, 110], [34, 126], [16, 132]], [14, 10, 9.5]) +
      near([[100, 112], [112, 134], [132, 148]], [15, 11, 10.5]) + near([[56, 106], [44, 132], [24, 146]], [21, 11, 10.5]) +
      solid(body, B, { k: 6, rim: 1.4 }) + spots(body, [[68, 102, 9], [90, 112, 6], [48, 106, 6]]) + chest(blob([[106, 106], [118, 104], [114, 120], [102, 122]])) +
      neck([[108, 100], [118, 86], [122, 76]], [30, 25, 22]) + head(116, 70, 6, 1.36, false, true);
  }
  const fitT = { stand: pup ? [-14, 0.9] : [-9, 0.93], eat: [-6, 0.94], sit: [-6, 0.96], lie: [-8, 0.93], run: [-2, 0.9] }[pose];
  return `<g transform="translate(80 172) scale(${fitT[1]}) translate(${-80 + fitT[0]} -172)">${s}</g>`;
}

/* ================================================================ a cat (un chat) ================================================================
   Its face turned to us (a broad round head, pointed ears, slit pupils, whiskers): the one sign a dog never has. looks: a colour (ginger:
   the usual one; black, white, grey, brown, cream) | "striped" (a tabby) | "spotted" (white with black and ginger patches) | "sitting" |
   "lying down" | "kitten" */
function cat(k){
  const pose = k.has("lying") ? "lie" : k.has("sitting", "kitten") ? "sit" : "stand", kit = k.has("kitten");
  const striped = k.has("striped", "tabby"), spotted = k.has("spotted"), B = spotted ? COAT.white : coatOf(k, striped ? "tabby" : "ginger"), FL = { l: B.fl, s: B.fs };
  const dark = B === COAT.black, ST = mix(B.s, INK, dark ? 0.1 : 0.32), PINK = "#E89AA6", EYE = dark ? "#E8C547" : "#7DBA5A", WH = dark ? "#C9CEDA" : mix(B.s, "#FFFFFF", 0.5);
  const marks = (d, list) => striped ? clipped(d, list.map(([x0, y0, x1, y1]) => line(`M${x0} ${y0}Q${(x0 + x1) / 2 + 3} ${(y0 + y1) / 2} ${x1} ${y1}`, ST, 4)).join(""))
    : spotted ? clipped(d, list.map(([x0, y0, x1, y1], i) => circ((x0 + x1) / 2, (y0 + y1) / 2, 7 + (i % 2) * 3, i % 2 ? COAT.ginger.l : COAT.black.l)).join("")) : "";
  /* the face, turned to us: a broad round head, two pointed ears (pink inside), almond eyes with slit pupils, a small pink nose, whiskers */
  const face = (cx, cy, sc) => {
    const hd = blob([[-22, 2], [-20, -12], [-10, -19], [10, -19], [20, -12], [22, 2], [16, 14], [0, 18], [-16, 14]]);
    const ear = sgn => solid(poly([[sgn * 6, -16], [sgn * 21, -36], [sgn * 21, -8]]), B, { k: 3, rim: 1 }) + fill(poly([[sgn * 9.5, -15], [sgn * 18.5, -29], [sgn * 18.5, -11]]), PINK, 'opacity=".85"');
    const ey = sgn => `<ellipse cx="${sgn * 8.5}" cy="-3" rx="5.2" ry="4.6" fill="${EYE}"/><ellipse cx="${sgn * 8.5}" cy="-3" rx="1.6" ry="4.2" fill="#22262F"/>` + circ(sgn * 8.5 - 1.8, -5, 1.2, "#FFFFFF");
    let h = ear(-1) + ear(1) + solid(hd, B, { k: 4, rim: 1.2 }) + (striped ? clipped(hd, line("M-6 -19L-4 -11M0 -20V-12M6 -19L4 -11", ST, 3)) : spotted ? clipped(hd, circ(-14, -12, 8, COAT.ginger.l)) : "") +
      fill(blob([[-9, 5], [0, 2], [9, 5], [8, 12], [0, 15], [-8, 12]]), mix(B.l, "#FFFFFF", dark ? 0.1 : 0.4), 'opacity=".8"') + ey(-1) + ey(1) +
      fill("M-3 4.4H3L0 8Z", PINK) + line("M0 8V10.5M0 10.5Q-3 13 -5.5 11M0 10.5Q3 13 5.5 11", mix(B.s, INK, 0.5), 1.1) +
      line("M-8 8L-27 4M-8 10.5L-27 11.5M8 8L27 4M8 10.5L27 11.5", WH, 0.9, 'opacity=".9"');
    return `<g transform="translate(${cx} ${cy}) scale(${sc})">${h}</g>`; };
  const leg = (pts, ws, f) => f ? fill(tube(pts, ws), FL.s) : solid(tube(pts, ws), B, { k: 2.5, rim: 0 });
  const tail = pts => solid(tube(pts, [9, 7.5, 6.5, 6]), B, { k: 2.5, rim: 0.8 }) + (striped ? clipped(tube(pts, [9, 7.5, 6.5, 6]), crSample(pts, false, 4).filter((p, i) => i % 3 === 1).map(p => circ(p[0], p[1], 3.2, ST)).join("")) : "");
  let s;
  if (pose === "stand"){                                    // walking along, the tail up, the head turned to us
    const body = blob([[112, 112], [120, 124], [112, 138], [80, 141], [52, 139], [38, 128], [42, 112], [62, 106], [90, 107]]);
    s = ground(80, 172, 54, 5.5) + tail([[44, 116], [30, 104], [26, 80], [34, 62]]) + leg([[106, 130], [110, 152], [112, 168]], [10, 8, 8], 1) + leg([[52, 130], [46, 152], [50, 168]], [12, 8, 8], 1) +
      leg([[98, 130], [98, 152], [97, 168]], [11, 8.5, 8.5]) + leg([[62, 126], [66, 150], [60, 168]], [17, 9, 8.5]) + solid(body, B, { k: 5, rim: 1.3 }) +
      marks(body, [[60, 106, 54, 136], [74, 105, 70, 138], [88, 106, 86, 138]]) + face(116, 96, 1.12);
  } else if (pose === "sit"){                               // sitting up, three-quarters to us, the tail round the front paws
    const body = blob([[96, 98], [110, 118], [116, 148], [104, 167], [80, 171], [56, 167], [44, 148], [52, 118], [66, 99]]);
    s = ground(80, 172, 46, 5.5) + solid(body, B, { k: 6, rim: 1.4 }) + marks(body, [[56, 112, 70, 118], [54, 128, 70, 134], [56, 144, 70, 150], [98, 120, 108, 126]]) +
      fill(blob([[72, 104], [88, 104], [94, 124], [82, 140], [70, 124]]), mix(B.l, "#FFFFFF", dark ? 0.08 : 0.35), 'opacity=".7"') +
      leg([[73, 140], [72, 156], [71, 168]], [11, 10, 10]) + leg([[88, 140], [89, 156], [90, 168]], [11, 10, 10]) +
      tail([[100, 166], [118, 168], [128, 160], [124, 150]]) + face(80, 84, 1.25);
  } else {                                                  // lying down like a loaf, the paws tucked, the face to us
    const body = blob([[118, 132], [126, 148], [118, 164], [80, 167], [42, 164], [32, 150], [40, 134], [70, 128], [100, 128]]);
    s = ground(80, 170, 60, 6) + tail([[40, 160], [24, 166], [14, 160], [14, 150]]) + solid(body, B, { k: 6, rim: 1.4 }) + marks(body, [[56, 128, 52, 162], [72, 127, 70, 164], [90, 128, 90, 164]]) +
      fill(blob([[86, 160], [100, 158], [104, 166], [86, 167]]), B.l) + face(104, 128, 1.15);
  }
  return kit ? `<g transform="translate(80 172) scale(0.7) translate(-80 -172)">${s.replace(/scale\(1\.25\)/, "scale(1.45)")}</g>` : s;
}

/* ================================================================ a horse (un cheval) ================================================================
   From the side, facing right: long legs with hooves, a long neck and a long head with a mane and pricked ears, a hanging tail. Against a
   dog (short legs, a round head and a muzzle) and a cow (later: horns, a udder, patches). looks: a colour (brown: a bay with a black mane
   and a white blaze; chestnut, black, white, grey) */
function horse(k){
  const n = k.has("white") ? "white" : k.has("grey") ? "grey" : k.has("black") ? "black" : k.has("chestnut") ? "chestnut" : "bay";
  const B = { bay: P("#A9653A", "#7A4426"), chestnut: P("#C0703A", "#8F4E24"), black: P("#454A5A", "#2A2E3A"), white: P("#F4EEE2", "#CABEA8"), grey: P("#C3C7CF", "#959BA8") }[n];
  const M = { bay: P("#3A3132", "#231D1F"), chestnut: P("#D88A4C", "#A9622E"), black: P("#2E323E", "#1B1E27"), white: P("#E4DCCB", "#BCAF98"), grey: P("#7E8594", "#5B6271") }[n];
  const FL = { l: B.fl, s: B.fs }, HOOF = "#3A3436", LOW = n === "bay" ? M : B;
  const leg = (pts, ws, far) => far ? fill(tube(pts, ws), FL.s) + (n === "bay" ? fill(tube(pts.slice(-2), ws.slice(-2)), mix(M.s, INK, 0.2)) : "")
    : solid(tube(pts, ws), B, { k: 2.5, rim: 0 }) + (n === "bay" ? solid(tube([[pts[pts.length - 2][0], pts[pts.length - 2][1] + 4], pts[pts.length - 1]], ws.slice(-2)), M, { k: 2, rim: 0 }) : "");
  const hoof = (x, far) => fill(rpoly([[x - 6, 163], [x + 5, 163], [x + 7.5, 171], [x - 6.5, 171]], 1.5), far ? mix(HOOF, INK, 0.3) : HOOF);
  const body = blob([[110, 92], [122, 104], [118, 124], [96, 130], [66, 129], [44, 126], [32, 110], [38, 94], [60, 88], [88, 90]]);
  const neck = blob([[96, 98], [104, 74], [116, 52], [128, 44], [138, 50], [134, 64], [124, 84], [120, 104], [108, 112]]);
  const head = blob([[122, 43], [134, 36], [144, 44], [156, 62], [160, 73], [155, 80], [143, 79], [130, 63], [120, 54]]);
  return `<g transform="translate(80 172) scale(0.95) translate(-88 -172)">` + ground(80, 172, 64, 6) +
    solid(tube([[36, 100], [26, 116], [24, 140], [30, 156]], [11, 13, 10, 6]), M, { k: 3, rim: 1 }) +                                              // the tail
    leg([[108, 120], [111, 146], [112, 164]], [12, 8.5, 8.5], 1) + leg([[44, 116], [40, 140], [46, 164]], [16, 8.5, 8.5], 1) + hoof(113, 1) + hoof(47, 1) +
    leg([[98, 120], [99, 146], [100, 164]], [14, 9, 9]) + leg([[56, 112], [62, 128], [54, 144], [58, 164]], [24, 12, 9, 9]) + hoof(101) + hoof(59) +
    solid(neck, B, { k: 5, rim: 1.3 }) + solid(body, B, { k: 6, rim: 1.4 }) + solid(head, B, { k: 4, rim: 1.2 }) +
    fill(blob([[146, 70], [155, 66], [160, 74], [155, 80], [145, 78]]), mix(B.s, INK, n === "black" ? 0 : 0.22), 'opacity=".55"') +                      // the muzzle
    (n === "bay" || n === "chestnut" ? fill(blob([[134, 42], [138, 44], [150, 64], [149, 69], [142, 58]]), "#FBF6EC", 'opacity=".9"') : "") +          // a white blaze
    circ(155, 71, 1.5, mix(B.s, INK, 0.5)) + eye(133, 51, 2.8) +
    solid(poly([[124, 44], [127, 30], [132, 42]]), B, { k: 2, rim: 0.8 }) + fill(poly([[126, 44], [128, 34], [131, 43]]), B.s) +                      // the ears
    solid(blob([[126, 40], [134, 38], [130, 50], [122, 62], [114, 78], [104, 96], [96, 98], [100, 82], [110, 62], [118, 48]]), M, { k: 3, rim: 1 }) +   // the mane
    solid(blob([[132, 38], [140, 42], [138, 48], [132, 46]]), M, { k: 1.5, rim: 0 }) + `</g>`;                                                  // the forelock
}

/* ================================================================ a fish (un poisson) ================================================================
   A live fish from the side, facing right: an oval body, a forked tail, fins, a round eye, a gill, scales, two bubbles. Against food
   (no plate, no lemon) and a bird (no wings, no legs). looks: a colour (orange: the usual one, a goldfish) | "striped" (white bands) |
   "long" (a long slim fish, a trout's spots) */
function fish(k){
  const long = k.has("long"), striped = k.has("striped"), B = k.cn && C[k.cn] ? C[k.cn] : long ? P("#8FA88E", "#647F68") : C.orange, F = P(mix(B.l, "#FFFFFF", 0.25), B.s);
  const body = long ? blob([[24, 98], [50, 82], [96, 78], [128, 86], [144, 98], [128, 110], [96, 116], [50, 114]]) : blob([[42, 98], [60, 70], [96, 62], [128, 76], [142, 98], [128, 118], [96, 130], [60, 124]]);
  const tail = long ? poly([[30, 98], [10, 80], [16, 98], [10, 116]]) : rpoly([[48, 98], [16, 66], [26, 98], [16, 130]], 4);
  const dorsal = long ? blob([[78, 81], [92, 70], [104, 72], [108, 80]]) : blob([[70, 70], [86, 46], [104, 48], [116, 70]]), anal = long ? blob([[70, 114], [80, 124], [92, 115]]) : blob([[72, 122], [80, 138], [96, 128]]);
  const ex = long ? 128 : 120, ey = long ? 94 : 88;
  return ground(82, 166, 50, 4.5, 0.12) + solid(tail, F, { k: 4, rim: 1 }) + clipped(tail, line(long ? "" : "M44 98L22 74M44 98L22 98M44 98L22 122", B.s, 1.2, 'opacity=".5"')) +
    solid(dorsal, F, { k: 3, rim: 1 }) + solid(anal, F, { k: 3, rim: 0 }) + solid(body, B, { k: 7, rim: 1.6 }) +
    clipped(body, (striped ? [76, 104].map(x => fill(`M${x - 6} 50Q${x + 4} 98 ${x - 6} 140H${x + 6}Q${x + 16} 98 ${x + 6} 50Z`, "#FBF8F0") + line(`M${x - 6} 50Q${x + 4} 98 ${x - 6} 140M${x + 6} 50Q${x + 16} 98 ${x + 6} 140`, "#2A2E3A", 1.6)).join("") : "") +
      (long ? [[60, 92], [72, 100], [84, 90], [96, 98], [108, 92], [66, 104], [90, 106]].map(([x, y]) => circ(x, y, 1.8, B.fs)).join("")
        : [[78, 84], [92, 80], [86, 98], [100, 96], [80, 112], [94, 114], [108, 108]].map(([x, y]) => line(`M${x} ${y - 5}Q${x + 6} ${y} ${x} ${y + 5}`, B.s, 1.4, 'opacity=".55"')).join("")) +
      fill(long ? "M24 104Q80 116 144 100L144 120H24Z" : "M40 108Q90 134 144 104L144 140H40Z", mix(B.l, "#FFFFFF", 0.35), 'opacity=".55"')) +
    line(long ? "M116 84Q110 96 116 108" : "M108 72Q100 92 110 112", B.s, 2.2, 'opacity=".75"') + solid(blob(long ? [[100, 100], [112, 98], [106, 108]] : [[96, 100], [112, 96], [104, 112]]), F, { k: 2, rim: 0 }) +
    circ(ex, ey, long ? 5 : 7.5, "#FFFFFF") + eye(ex + 1, ey, long ? 3.2 : 4.6) + line(long ? "M140 100Q136 102 132 101" : "M136 104Q131 107 126 105", B.fs, 1.6) +
    [[150, 66, 3.6], [143, 50, 2.6], [152, 38, 2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#8CC3DE" stroke-width="1.6"/>` + circ(x - r * 0.35, y - r * 0.35, r * 0.28, "#FFFFFF")).join("");
}

/* ================================================================ a shoe (une chaussure) ================================================================
   One shoe from the side, the toe to the right, a little turned so that the opening shows: its sole, its heel, its laces. Against a boot
   (later: up the leg), a sock (later). looks: a colour (brown leather: the usual one, a lace-up with a toe cap) | "trainer" / "sports"
   (white, coloured stripes, a thick white sole) | "high-heeled" (a woman's court shoe, red) | "child's" (small, a strap) */
function shoe(k){
  const tr = k.has("trainer", "sports", "running"), hh = k.has("high-heeled", "heel", "high", "woman's"), ch = k.has("child's", "child");
  if (hh){                                                  // a court shoe: the pointed toe on the ground at the right, the arch rising to a thin heel at the left
    const B = k.cn && C[k.cn] ? C[k.cn] : C.red, DK = mix(B.s, INK, 0.45);
    const up = "M22 86Q22 78 30 78Q40 80 46 92Q60 116 92 134Q112 142 136 142Q150 144 150 152Q150 158 140 158H96Q70 154 52 134Q40 118 36 110Q30 104 28 112L26 118Z";
    return ground(88, 164, 62, 6) + fill("M28 112L36 108L40 166H34Z", DK) + fill("M32 162H42V168H32Z", INK) + solid(up, B, { k: 5, rim: 1.4 }) +
      fill("M30 82Q38 84 44 96Q58 118 86 132Q60 126 44 106Q36 94 30 92Z", mix(B.s, INK, 0.3)) + fill("M96 158H140Q150 158 150 152L148 160H98Z", DK) +
      line("M24 84Q24 80 30 80", B.r, 1.4);
  }
  const B = tr ? C.white : k.cn && C[k.cn] ? C[k.cn] : P("#A0603A", "#723F24"), S2 = tr ? (k.cn && C[k.cn] ? C[k.cn] : C.blue) : null, SOLE = tr ? C.white : P("#4A3B36", "#2F2522");
  const up = tr ? "M18 146Q12 118 20 100Q30 90 44 96Q56 102 66 96Q76 90 86 96Q110 108 132 116Q150 124 150 140L148 148H18Z"
                : "M18 148Q14 120 18 102Q26 96 38 100Q52 104 64 94Q74 90 84 96Q108 110 128 118Q146 124 148 138L146 148H18Z";
  let s = ground(82, 162, 70, 6);
  s += solid(up, B, { k: 6, rim: 1.5 }) + fill(tr ? "M22 100Q34 94 46 100Q56 104 62 100Q52 112 36 110Q24 108 22 100Z" : "M22 102Q32 98 42 103Q54 106 62 99Q54 112 38 112Q26 110 22 102Z", mix(B.s, INK, tr ? 0.2 : 0.45));     // the opening
  if (tr) s += clipped(up, fill("M56 148L80 106H90L66 148ZM72 148L96 110H106L82 148Z", S2.l) + fill("M10 118Q20 114 28 126L24 150H10Z", S2.l) + fill("M118 112Q146 122 152 136V150H126Q128 128 118 112Z", "#FFFFFF", 'opacity=".5"')) +
    line("M66 98L80 106M72 95L86 102M78 93L92 99", S2.s, 2.2) + solid("M10 142H150Q156 146 154 152Q152 160 142 160H18Q8 160 8 150Z", C.white, { k: 3, rim: 1 }) + line("M12 152H150", C.grey.l, 1.8);
  else s += clipped(up, fill("M104 108Q128 118 148 132V150H122Q122 126 104 108Z", B.s, 'opacity=".5"')) + line("M104 109Q120 120 122 148", mix(B.s, INK, 0.3), 1.3, 'opacity=".7"') +      // the toe cap
    fill("M62 98Q74 92 86 98L94 110Q80 112 68 108Z", mix(B.l, B.s, 0.35)) + line("M66 99L84 106M70 96L88 103M66 104L80 97M72 106L90 100", "#F2E6CF", 1.8) +           // the lacing
    fill("M14 146H148Q154 148 152 154Q150 158 142 158H44V164H16Z", SOLE.l) + line("M18 147.5H146", mix(SOLE.l, "#FFFFFF", 0.25), 1.2) + fill("M16 158H44V164H16Z", SOLE.s);   // the sole and the heel
  return ch ? `<g transform="translate(80 162) scale(0.7) translate(-80 -162)">${s}</g>` : s;
}

/* ================================================================ bread (un pain) ================================================================
   A crusty loaf, short and fat, cut across with slashes that show the paler crumb; flour on the top. NOT a baguette (that is its own
   word): it is a loaf. looks: (a bâtard: the usual one) | "round" (a boule, cut in a cross) | "with seeds" | "brown" (a tin loaf, square
   ended) | "sliced" (a loaf with slices fallen from it) | "in a basket" (round rolls in a bread basket) */
function bread(k){
  const CR = P("#D99A4E", "#A9692C"), DK = P("#9B5E2C", "#6E3F1C"), CRUMB = "#F6E3B8", FLOUR = "#FBF4E4";
  const slash = (x0, y0, x1, y1) => fill(`M${x0} ${y0}Q${(x0 + x1) / 2} ${(y0 + y1) / 2 - 7} ${x1} ${y1}Q${(x0 + x1) / 2 + 2} ${(y0 + y1) / 2 + 2} ${x0} ${y0}Z`, CRUMB) + line(`M${x0} ${y0}Q${(x0 + x1) / 2} ${(y0 + y1) / 2 - 7} ${x1} ${y1}`, CR.r, 1.4);
  if (k.has("basket")){
    const roll = (x, y, r) => solid(blob([[x - r, y], [x - r * 0.7, y - r * 0.75], [x, y - r * 0.95], [x + r * 0.75, y - r * 0.7], [x + r, y], [x + r * 0.7, y + r * 0.6], [x - r * 0.7, y + r * 0.6]]), CR, { k: 4, rim: 1.2 }) + line(`M${x - r * 0.4} ${y - r * 0.5}Q${x} ${y - r * 0.75} ${x + r * 0.45} ${y - r * 0.45}`, CRUMB, 2.4);
    const BK = P("#C9965C", "#9C6B37");
    return ground(82, 162, 66, 7) + `<ellipse cx="80" cy="112" rx="64" ry="14" fill="${BK.fs}"/>` + roll(52, 104, 22) + roll(106, 102, 22) + roll(80, 92, 24) +
      solid("M14 112Q80 128 146 112L132 156Q80 168 28 156Z", BK, { k: 6, rim: 1.4 }) + [126, 138, 150].map(y => line(`M${20 + (y - 120) * 0.4} ${y - 2}Q80 ${y + 12} ${140 - (y - 120) * 0.4} ${y - 2}`, BK.s, 1.6, 'opacity=".7"')).join("") +
      line("M15 112Q80 128 145 112", BK.r, 2);
  }
  if (k.has("brown", "tin")){                               // a tin loaf: square sides, a domed top, its cut end to us (the crumb)
    const T = P("#B9773D", "#874F22"), top = "M24 92Q26 66 52 68Q66 58 80 66H128Q150 66 148 92Z";
    return ground(88, 160, 64, 7) + solid("M44 154V96Q46 72 66 70H128Q148 70 148 92V154Z", T, { k: 7, rim: 1.4 }) + fill("M128 70Q148 70 148 92V154H136V92Q136 76 128 70Z", T.s, 'opacity=".6"') +
      solid("M14 156V96Q14 70 40 68Q52 62 64 70Q76 74 76 96V156Z", T, { k: 4, rim: 1.4 }) + fill("M20 152V98Q20 76 40 74Q50 70 60 76Q70 80 70 98V152Z", CRUMB) +
      [[30, 96], [44, 110], [56, 92], [36, 128], [58, 124], [48, 140]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="1.6" fill="#E3C98F"/>`).join("") + line("M86 70Q110 62 132 70", T.r, 1.6, 'opacity=".6"');
  }
  const round = k.has("round"), seeds = k.has("seeds"), sliced = k.has("sliced");
  const loaf = round ? blob([[22, 140], [28, 96], [80, 74], [132, 96], [138, 140], [80, 150]]) : blob([[12, 132], [24, 100], [60, 84], [110, 86], [144, 104], [150, 130], [120, 146], [50, 148]]);
  let s = ground(82, 154, 70, 8) + solid(loaf, CR, { k: 8, rim: 1.8 }) + clipped(loaf, fill(round ? "M20 130Q80 150 140 130V160H20Z" : "M8 126Q80 148 152 124V160H8Z", DK.l, 'opacity=".55"') +
    fill(round ? "M40 92Q70 74 108 82Q80 82 52 100Z" : "M30 100Q60 82 104 84Q70 86 40 106Z", FLOUR, 'opacity=".75"'));
  s += round ? slash(48, 100, 112, 100) + slash(80, 80, 80, 132).replace(/Q80 99/, "Q73 106") : slash(28, 112, 58, 94) + slash(56, 112, 90, 92) + slash(88, 114, 124, 96);
  if (seeds) s += clipped(loaf, [...Array(34)].map((_, i) => { const x = 20 + (i * 37) % 124, y = 90 + (i * 23) % 40; return `<ellipse cx="${x}" cy="${y}" rx="2.2" ry="1.2" fill="${i % 3 ? "#F1E2BD" : "#4E3C30"}" transform="rotate(${(i * 53) % 180} ${x} ${y})"/>`; }).join(""));
  if (sliced){                                              // the loaf cut, its crumb to us, and two slices fallen in front
    const end = blob([[118, 140], [116, 106], [128, 92], [140, 100], [144, 132], [134, 146]]);
    s = `<g transform="translate(-10 -6) scale(0.92)">${s}${solid(end, CR, { k: 3, rim: 1 })}${fill(blob([[121, 138], [120, 108], [129, 97], [138, 104], [140, 130], [132, 142]]), CRUMB)}</g>` +
      [[72, 0], [104, 8]].map(([x, a]) => rot(a, x, 160, solid(blob([[x - 22, 168], [x - 22, 150], [x - 10, 142], [x + 10, 142], [x + 22, 150], [x + 22, 168]]), CR, { k: 2, rim: 0.6 }) + fill(blob([[x - 18, 165], [x - 18, 151], [x - 8, 146], [x + 8, 146], [x + 18, 151], [x + 18, 165]]), CRUMB))).join("");
  }
  return s;
}

/* ================================================================ soup (une soupe) ================================================================
   A wide bowl of soup seen from a little above, steam over it, a spoon in it, on a plate. Against coffee (a cup with a handle on a saucer,
   dark) and a plate of food. looks: a colour (orange: the usual one, tomato or carrot; green, red, yellow, brown) | "with bread" */
function soup(k){
  const SO = k.cn && C[k.cn] ? P(mix(C[k.cn].l, "#FFFFFF", 0.1), C[k.cn].s) : P("#EE8B3A", "#C8662A"), BW = k.has("white bowl") ? C.white : P("#F4EEE2", "#CBBFA9"), RIM = C.blue;
  const steam = [60, 80, 100].map((x, i) => line(`M${x} ${74 - i % 2 * 6}q-7 -9 0 -18t0 -18`, "#A9B0C0", 2.8, `opacity="${i === 1 ? 0.75 : 0.5}"`)).join("");
  return ground(82, 160, 72, 8) + `<ellipse cx="80" cy="146" rx="70" ry="15" fill="${C.white.s}"/><ellipse cx="80" cy="143" rx="70" ry="15" fill="${C.white.l}"/>` +
    solid("M16 104Q18 150 80 154Q142 150 144 104Z", BW, { k: 7, rim: 1.4 }) + line("M20 120Q80 140 140 120", RIM.l, 3.2) +
    `<ellipse cx="80" cy="104" rx="64" ry="17" fill="${BW.r}"/><ellipse cx="80" cy="105" rx="58" ry="13.5" fill="${SO.s}"/><ellipse cx="78" cy="106.5" rx="54" ry="11.5" fill="${SO.l}"/>` +
    fill("M44 100Q60 96 72 101", "none") + line("M46 102Q58 98 70 102", "#FFFFFF", 2.4, 'opacity=".55"') + circ(96, 104, 3, "#5FA35A") + circ(102, 108, 2.2, "#5FA35A") + circ(62, 110, 2, "#FBF4E4") +
    line("M112 106L150 70", C.silver.s, 6) + line("M112 106L150 70", C.silver.l, 3.4) + `<ellipse cx="108" cy="109" rx="10" ry="5" fill="${C.silver.l}" transform="rotate(-20 108 109)"/>` + steam +
    (k.has("bread") ? solid(blob([[118, 150], [126, 132], [146, 128], [154, 140], [146, 156]]), P("#D99A4E", "#A9692C"), { k: 3, rim: 1 }) : "");
}

/* ================================================================ a bottle (une bouteille) ================================================================
   A glass bottle standing: a round shoulder, a long neck, a cap or a cork, a blank label; light through the glass. Against a glass (un
   verre: open, short, no neck). looks: a colour (the glass: green, the usual one; blue, brown, clear) | "of water" (clear blue, a blue cap) |
   "of wine" (dark green, a cork, a red label band) | "of milk" (white, short, a foil cap) | "plastic" (a ridged water bottle) */
function bottle(k){
  const milk = k.has("milk"), water = k.has("water"), wine = k.has("wine"), plastic = k.has("plastic");
  const G = milk ? C.white : water || plastic ? P("#C4E2EF", "#8FBCD3") : k.cn && C[k.cn] && k.cn !== "white" ? C[k.cn] : P("#4F9A63", "#2F6E44");
  const body = milk ? "M54 168V96Q54 78 64 70V52H96V70Q106 78 106 96V168Q106 172 100 172H60Q54 172 54 168Z"
    : "M50 166V92Q50 74 66 66Q72 60 72 44V24H88V44Q88 60 94 66Q110 74 110 92V166Q110 172 102 172H58Q50 172 50 166Z";
  const cap = milk ? rrd(62, 46, 36, 10, 3) : rrd(70, 16, 20, 12, 2.5), capC = milk ? C.silver : water || plastic ? C.blue : wine ? P("#C9A27A", "#9D7651") : C.gold;
  let s = ground(82, 172, 38, 5) + solid(body, G, { k: 6, rim: 1.6 }) + (milk ? "" : clipped(body, fill("M50 140H110V172H50Z", mix(G.s, INK, 0.12), 'opacity=".35"')));
  if (water || plastic) s += clipped(body, rect(40, 104, 80, 70, "#9ACDE6", 0, 'opacity=".55"') + (plastic ? [118, 134, 150].map(y => line(`M50 ${y}Q80 ${y + 5} 110 ${y}`, "#7FB2CC", 2)).join("") : ""));
  s += clipped(body, line(milk ? "M62 84V160" : "M60 84V160", "#FFFFFF", 4, 'opacity=".55"') + line(milk ? "" : "M77 30V58", "#FFFFFF", 2.4, 'opacity=".5"'));
  if (!plastic) s += rrd(0, 0, 0, 0, 0).slice(0, 0) + fill(rrd(52, milk ? 108 : 104, 56, milk ? 30 : 36, 2), milk ? C.blue.l : "#FBF4E4") + (wine ? rect(52, 112, 56, 6, C.red.l) : rect(60, milk ? 116 : 114, 40, 3.4, mix("#FBF4E4", INK, 0.2), 1.5) + rect(64, milk ? 124 : 122, 32, 3, mix("#FBF4E4", INK, 0.12), 1.5));
  return s + solid(cap, capC, { k: 2, rim: 0.8 });
}

/* ================================================================ a table (une table) ================================================================
   The table alone, seen a little from above (the same table as the ground of sur / sous). Against a chair (a back, a seat) and a desk
   (later). looks: "wooden" (the usual one; a colour paints it) | "round" (a round café table on one foot) | "garden" (round, painted
   green, a parasol) | "long", "dining" (a long table laid with plates) | "small, low" (a low coffee table) | "glass" (a glass top on steel) */
function table(k){
  const W = k.has("garden") ? (k.cn && C[k.cn] ? C[k.cn] : C.green) : groundCol(k, "wood");
  if (k.has("garden", "round")){
    const garden = k.has("garden");
    let s = ground(82, 170, 52, 7, 0.2) + leg(80, 104, 80, 150, 7, W) + fill(blob([[52, 166], [80, 150], [108, 166], [80, 160]]), W.s) + leg(80, 148, 56, 168, 5.5, W) + leg(80, 148, 104, 168, 5.5, W) +
      `<ellipse cx="80" cy="100" rx="64" ry="19" fill="${W.s}"/><ellipse cx="80" cy="95" rx="64" ry="19" fill="${W.l}"/>` + fill("M16 95A64 19 0 0 0 144 95V100A64 19 0 0 1 16 100Z", W.m) +
      line("M18 92Q26 80 70 77", W.r, 1.6) + `<ellipse cx="96" cy="97" rx="34" ry="9" fill="${W.s}" opacity=".18"/>`;
    if (garden){ const U = C.red;
      s = line("M80 96V26", C.steel.s, 4.4) + line("M80 96V26", C.steel.l, 1.8) + s.replace(`<ellipse cx="80" cy="100"`, `${line("M80 96V40", C.steel.s, 4)}<ellipse cx="80" cy="100"`) +
        line("M80 92V30", C.steel.l, 3.6) + solid("M12 54Q22 14 80 10Q138 14 148 54Q131 46 114 54Q97 46 80 54Q63 46 46 54Q29 46 12 54Z", C.white, { k: 4, rim: 1 }) +
        clipped("M12 54Q22 14 80 10Q138 14 148 54Q131 46 114 54Q97 46 80 54Q63 46 46 54Q29 46 12 54Z", fill("M80 8Q30 14 12 56H46Q50 24 80 8ZM80 8Q106 24 114 56H148Q140 30 80 8Z", U.l) + fill("M80 8Q106 24 114 56H148Q140 30 80 8Z", U.s, 'opacity=".5"')) + circ(80, 10, 3, C.steel.s); }
    return s;
  }
  if (k.has("long", "dining")){
    const T = "M2 110L30 84H130L158 110Z";
    return ground(80, 172, 74, 7, 0.2) + leg(36, 92, 36, 148, 6.5, W, 1) + leg(124, 92, 124, 148, 6.5, W, 1) + leg(10, 116, 10, 168, 7, W) + leg(150, 116, 150, 168, 7, W) +
      fill("M2 110H158V117Q158 119 156 119H4Q2 119 2 117Z", W.m) + fill("M130 110H158V117Q158 119 156 119H130Z", W.s) + fill(T, W.l) + line("M3.5 109L30.5 85H129", W.r, 1.4) +
      [[40, 96], [80, 96], [120, 96]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="15" ry="5.6" fill="${C.white.s}"/><ellipse cx="${x}" cy="${y - 1}" rx="15" ry="5.6" fill="#FFFFFF"/><ellipse cx="${x}" cy="${y - 1}" rx="9" ry="3.2" fill="${C.white.l}"/>` +
        line(`M${x - 20} ${y - 3}L${x - 21} ${y + 3}M${x + 20} ${y - 3}L${x + 21} ${y + 3}`, C.silver.s, 1.6)).join("");
  }
  if (k.has("glass")){
    const G = C.glass;
    return ground(82, 170, 66, 7, 0.18) + leg(46, 76, 46, 146, 4, C.steel, 1) + leg(114, 76, 114, 146, 4, C.steel, 1) + leg(22, 104, 22, 166, 4.5, C.steel) + leg(138, 104, 138, 166, 4.5, C.steel) +
      fill("M14 100H146V104H14Z", G.s) + fill(rpoly([[14, 100], [40, 74], [120, 74], [146, 100]], 2), G.l, 'opacity=".8"') + line("M34 96L52 80M46 96L62 82M94 96L110 82", "#FFFFFF", 3, 'opacity=".8"') + line("M15 99L41 75H119", "#FFFFFF", 1.4);
  }
  if (k.has("low")){
    return ground(82, 166, 66, 6, 0.2) + leg(42, 112, 42, 150, 7, W, 1) + leg(118, 112, 118, 150, 7, W, 1) + leg(22, 128, 22, 162, 8, W) + leg(138, 128, 138, 162, 8, W) +
      fill("M12 122H148V132Q148 134 146 134H14Q12 134 12 132Z", W.m) + fill("M118 122H148V132Q148 134 146 134H118Z", W.s) + fill(rpoly([[12, 122], [36, 104], [124, 104], [148, 122]], 2), W.l) + line("M13.5 121L36.5 105H123", W.r, 1.4) +
      line("M30 148H130", W.s, 4) + `<g transform="translate(66 104)">${solid(rrd(0, -8, 26, 8, 1.5), C.blue, { k: 2, rim: 0 })}${solid(rrd(2, -15, 22, 7, 1.5), C.red, { k: 2, rim: 0 })}</g>`;
  }
  return groundTable(k);
}

/* ================================================================ a box (une boîte) ================================================================
   A box seen from its corner, a little from above (the same box as the ground of dans / sur). Against a bag (soft, handles) and a house.
   looks: "cardboard" (closed, taped: the usual one; a colour paints it) | "open" | "gift" (wrapped, a ribbon and a bow) | "wooden" (a crate
   of planks) | "metal" (a round biscuit tin) | "plastic" (a clear storage box with a lid) */
function box(k){
  const corner = (B, x0, y0, w, h, d) => {                  // the front face (in the light), the side (shade), the top
    const dx = d * 0.9, dy = -d * 0.7;
    return { front: [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], side: [[x0 + w, y0], [x0 + w + dx, y0 + dy], [x0 + w + dx, y0 + h + dy], [x0 + w, y0 + h]], top: [[x0, y0], [x0 + dx, y0 + dy], [x0 + w + dx, y0 + dy], [x0 + w, y0]] }; };
  if (k.has("gift")){
    const B = k.cn && C[k.cn] ? C[k.cn] : C.blue, R = k.cn === "yellow" || k.cn === "gold" ? C.red : C.gold, c = corner(B, 26, 92, 84, 66, 34);
    return ground(86, 160, 64, 7, 0.22) + fill(poly(c.side), B.s) + fill(poly(c.front), B.l) + fill(rpoly(c.top, 1), B.r) +
      fill(poly([[62, 92], [76, 92], [76, 158], [62, 158]]), R.l) + fill(poly([[110, 116], [125, 104], [125, 112], [110, 124]]), R.s) + fill(poly([[110, 116], [141, 92], [141, 100], [110, 124]]).replace(/.*/, ""), R.s) +
      fill(poly([[124, 68], [131, 68], [116, 122], [110, 128]]).replace(/.*/, ""), R.s) +
      fill(poly([[62, 92], [76, 92], [106, 68.2], [92, 68.2]]), R.r) + fill(poly([[43, 78], [123, 78], [118, 82], [38, 82]]), R.r) +
      fill(poly([[110, 115], [140.6, 91.2], [140.6, 98], [110, 122]]), R.s) +
      solid(blob([[84, 80], [66, 56], [52, 58], [54, 72], [70, 80]]), R, { k: 2, rim: 0.8 }) + solid(blob([[84, 80], [104, 54], [120, 58], [116, 72], [98, 80]]), R, { k: 2, rim: 0.8 }) +
      fill(poly([[84, 80], [72, 98], [80, 96], [84, 86], [88, 96], [96, 98]]), R.s) + solid(cd(84, 79, 6), R, { k: 2, rim: 0 });
  }
  if (k.has("metal", "tin")){
    const B = k.cn && C[k.cn] ? C[k.cn] : C.red, T = C.gold;
    return ground(84, 162, 62, 8, 0.22) + solid("M18 104V146Q18 160 80 160Q142 160 142 146V104Z", B, { k: 7, rim: 1.4 }) + line("M18 132Q80 146 142 132", T.l, 3) + line("M18 116Q80 130 142 116", T.l, 3) +
      clipped("M18 104V146Q18 160 80 160Q142 160 142 146V104Z", [40, 64, 88, 112].map((x, i) => circ(x + 6, 124 + (i % 2) * 2, 4, "#FBF4E4", 'opacity=".8"')).join("")) +
      `<ellipse cx="80" cy="102" rx="66" ry="20" fill="${T.s}"/><ellipse cx="80" cy="96" rx="66" ry="20" fill="${T.l}"/><ellipse cx="80" cy="96" rx="52" ry="14" fill="${T.s}" opacity=".35"/>` +
      fill("M14 96A66 20 0 0 0 146 96V102A66 20 0 0 1 14 102Z", T.m) + line("M18 92Q30 78 72 76", T.r, 1.6);
  }
  if (k.has("wooden", "crate") && !k.has("open")){
    const W = C.wood, c = corner(W, 24, 96, 88, 62, 34), DK = mix(W.s, INK, 0.45);
    return ground(86, 160, 64, 7, 0.22) + fill(poly(c.side), W.s) + fill(poly(c.front), W.l) +
      [0, 1, 2].map(i => line(`M24 ${117 + i * 20.5}H112`, DK, 1.6, 'opacity=".55"') + line(`M112 ${117 + i * 20.5}L142.6 ${93 + i * 20.5}`, DK, 1.4, 'opacity=".5"')).join("") +
      fill(poly([[24, 96], [54.6, 72.2], [142.6, 72.2], [112, 96]]), DK) + fill(poly([[29, 96], [54.6, 76], [138, 76], [112, 96]]).replace(/.*/, ""), DK) +
      fill(poly([[24, 96], [112, 96], [112, 101], [24, 101]]), W.r) + fill(poly([[112, 96], [142.6, 72.2], [142.6, 77], [112, 101]]), W.m) +
      line("M30 104L106 152M106 104L30 152", W.s, 3.2, 'opacity=".5"') + rect(24, 96, 6, 62, W.r) + rect(106, 96, 6, 62, W.m);
  }
  if (k.has("plastic")){
    const B = k.cn && C[k.cn] ? C[k.cn] : C.blue, G = P("#D7ECF4", "#A9CDE0"), c = corner(G, 24, 100, 90, 58, 34);
    return ground(86, 160, 64, 7, 0.2) + fill(poly(c.side), G.s, 'opacity=".9"') + fill(poly(c.front), G.l, 'opacity=".9"') + `<g transform="translate(40 112)">${solid(rrd(0, 0, 28, 30, 3), C.red, { k: 2, rim: 0 })}${solid(rrd(32, 12, 26, 18, 3), C.yellow, { k: 2, rim: 0 })}</g>` +
      fill(poly(c.front), G.l, 'opacity=".35"') + line("M32 108V150M44 108V150", "#FFFFFF", 3, 'opacity=".6"') +
      fill(poly([[20, 100], [52, 74], [148, 74], [118, 100]]), B.l) + fill(poly([[20, 100], [118, 100], [118, 108], [20, 108]]), B.m) + fill(poly([[118, 100], [148, 74], [148, 82], [118, 108]]), B.s);
  }
  return groundBox(k);
}

/* ================================================================ a newspaper (un journal) ================================================================
   A newspaper: big thin pages folded, a black masthead band, a photograph, columns of grey lines (no word anywhere). Against a book (a
   block of pages, a cover), a letter (one handwritten sheet and an envelope) and a magazine (later). looks: "folded" (the usual one:
   folded in half, lying a little turned) | "front page" (flat, the whole page) | "open" (spread, two pages) ; a colour: the paper (pink) */
function newspaper(k){
  const PG = k.cn && C[k.cn] ? P(mix(C[k.cn].l, "#FFFFFF", 0.62), mix(C[k.cn].s, "#FFFFFF", 0.45)) : P("#F7F4EC", "#D8D2C4"), INKL = "#5C6577", GR = mix(PG.s, INKL, 0.35);
  const cols = (x, y, w, n, h, gap) => { let o = ""; for (let c = 0; c < n; c++) for (let r = 0; r < h; r++) o += rect(x + c * (w + gap), y + r * 5.4, r === h - 1 ? w * 0.6 : w, 2.2, GR, 1); return o; };
  const page = (x, y, w, h, photo) => fill(rrd(x, y, w, h, 1.5), PG.l) + rect(x + 6, y + 6, w - 12, 9, "#2A2E3A", 1) + rect(x + 6, y + 18, w - 12, 1.2, INKL) +
    rect(x + 6, y + 22, w * 0.62, 5, INKL, 1.2) + rect(x + 6, y + 30, w * 0.48, 5, INKL, 1.2) +
    (photo ? fill(rrd(x + 6, y + 39, w * 0.55, h * 0.3, 1), "#9DB6CC") + fill(`M${x + 6} ${y + 39 + h * 0.3}L${x + 6 + w * 0.2} ${y + 39 + h * 0.14}L${x + 6 + w * 0.34} ${y + 39 + h * 0.24}L${x + 6 + w * 0.55} ${y + 39 + h * 0.1}V${y + 39 + h * 0.3}Z`, "#6E8FA8") + circ(x + 6 + w * 0.42, y + 39 + h * 0.08, 3, "#F3E3A0") : "") +
    cols(x + 6 + (photo ? w * 0.6 : 0), y + 40, photo ? w * 0.4 - 12 : (w - 20) / 3, photo ? 1 : 3, Math.floor((h * 0.3) / 5.4), 4) + cols(x + 6, y + 44 + h * 0.32, (w - 20) / 3, 3, Math.floor((h - 52 - h * 0.32) / 5.4), 4);
  if (k.has("open")){
    return ground(82, 166, 72, 7) + rot(-4, 80, 100, solid(rrd(6, 34, 148, 128, 2), PG, { k: 3, rim: 0 }) + page(8, 36, 70, 124, 1) + page(82, 36, 70, 124, 0) + fill("M78 36H82V160H78Z", PG.s, 'opacity=".7"') + fill("M82 36H96V160H82Z", PG.s, 'opacity=".25"'));
  }
  if (k.has("front page", "front")){
    return ground(82, 172, 52, 6) + rot(-5, 80, 96, solid(rrd(26, 16, 110, 152, 2), PG, { k: 4, rim: 1 }) + page(26, 16, 110, 152, 1).replace(/^<path[^>]*>/, ""));
  }
  /* folded: the top half of the front page lying on the bottom half, seen from a little above, turned; the fold at the bottom */
  return ground(82, 160, 70, 8) + rot(-8, 80, 110, fill(rrd(16, 60, 132, 96, 2), PG.s) + fill(rrd(14, 56, 132, 96, 2), PG.l) + page(14, 56, 132, 150, 1).replace(/^<path[^>]*>/, "").replace(/<rect x="[\d.]+" y="(1[5-9]\d|2\d\d)[^>]*\/>/g, "") +
    clipped(rrd(14, 56, 132, 96, 2), "") + fill("M14 148H146V152Q146 154 144 154H16Q14 154 14 152Z", PG.s) + line("M16 150H144", "#FFFFFF", 1.2, 'opacity=".7"'));
}

/* ================================================================ a radio (une radio) ================================================================
   A radio set: a rounded box with a big round speaker grille, a tuning dial with its needle, two knobs, a handle, an aerial. Against a
   phone (a slab with a screen), a computer (a screen and keys) and a television (later: a big screen). looks: a colour (red: the usual
   one; blue, green, yellow, black ...) | "old" (a wooden radio with an arched top and a cloth grille) */
function radio(k){
  if (k.has("old")){
    const W = C.brown, CL = P("#E9D3A6", "#C8AE7E"), body = "M26 168V92Q26 34 80 30Q134 34 134 92V168Z";
    return ground(82, 172, 58, 6) + solid(body, W, { k: 7, rim: 1.6 }) + solid("M38 128V94Q38 46 80 44Q122 46 122 94V128Z", CL, { k: 3, rim: 0 }) +
      clipped("M38 128V94Q38 46 80 44Q122 46 122 94V128Z", [52, 66, 80, 94, 108].map(x => rect(x - 3, 40, 6, 92, W.l)).join("")) +
      fill(rrd(40, 136, 80, 12, 3), "#F6E9C4") + line("M46 142H114", W.s, 1, 'opacity=".5"') + rect(76, 137, 2, 10, C.red.l) +
      [52, 108].map(x => circ(x, 158, 6.5, W.fs) + circ(x - 1, 157, 5, mix(W.s, INK, 0.2))).join("") + line("M28 92Q30 40 80 32", W.r, 1.8);
  }
  const B = k.cn && C[k.cn] ? C[k.cn] : C.red, body = rrd(14, 70, 132, 92, 16), FR = C.steel;
  return ground(82, 170, 66, 6) + line("M120 72L148 18", C.steel.s, 3) + circ(148, 18, 3, C.steel.s) +
    line("M48 72Q48 52 80 52Q112 52 112 72", mix(B.s, INK, 0.25), 7) + solid(body, B, { k: 7, rim: 1.6 }) +
    solid(cd(56, 118, 30), FR, { k: 4, rim: 0 }) + circ(56, 118, 25, mix(FR.s, INK, 0.25)) + [...Array(25)].map((_, i) => { const a = (i % 5) - 2, b = Math.floor(i / 5) - 2; return Math.hypot(a, b) <= 2.3 ? circ(56 + a * 9, 118 + b * 9, 2.6, FR.l) : ""; }).join("") +
    fill(rrd(96, 84, 40, 22, 4), "#F6E9C4") + line("M100 96H132", B.s, 1, 'opacity=".5"') + [102, 108, 114, 120, 126].map(x => line(`M${x} 90V93`, B.s, 1)).join("") + rect(113, 86, 2, 18, C.red.s) +
    [104, 128].map(x => solid(cd(x, 132, 9), FR, { k: 2, rim: 0 }) + circ(x, 132, 5, FR.s) + line(`M${x} 125V130`, "#FFFFFF", 1.6)).join("");
}

/* ================================================================ a computer (un ordinateur) ================================================================
   A laptop open toward us, a little turned: a screen with windows on it and a keyboard of keys (the keys are the sign: a phone and a
   television have none). looks: (silver: the usual one; a colour: the case) | "desktop" (a monitor on a foot, a keyboard, a mouse) |
   "old" (a beige box with a deep screen) */
function computer(k){
  const B = k.cn && C[k.cn] ? C[k.cn] : C.silver, SCR = "#2A3550";
  const desk = (x, y, w, h) => fill(rrd(x, y, w, h, 2), "#4489C8") + fill(rrd(x + w * 0.08, y + h * 0.12, w * 0.5, h * 0.48, 2), "#FBF8F0") + rect(x + w * 0.08, y + h * 0.12, w * 0.5, h * 0.09, "#DB4D3A", 1) +
    fill(rrd(x + w * 0.42, y + h * 0.36, w * 0.48, h * 0.42, 2), "#FBF8F0") + rect(x + w * 0.42, y + h * 0.36, w * 0.48, h * 0.09, "#2F9160", 1) + rect(x, y + h - h * 0.1, w, h * 0.1, "#1F2638");
  const keys = (x0, y0, w, rows, kw, kh, sk) => { let o = ""; for (let r = 0; r < rows; r++){ const n = Math.floor(w / kw); for (let c = 0; c < n; c++) o += rect(x0 + c * kw + r * sk, y0 + r * (kh + 1.6), kw - 1.6, kh, "#3E4554", 1); } return o; };
  if (k.has("old")){
    const BG = P("#E8E0C8", "#BDB295");
    return ground(82, 172, 66, 6) + solid(rrd(16, 30, 128, 96, 8), BG, { k: 6, rim: 1.4 }) + fill(rrd(28, 40, 104, 74, 10), "#2C3A2E") + fill(rrd(32, 44, 96, 66, 8), "#3A5640") +
      [0, 1, 2, 3].map(i => rect(40, 54 + i * 10, 40 + (i * 17) % 36, 3.4, "#9CE3A6", 1)).join("") + rect(40, 94, 8, 4, "#9CE3A6") +
      solid(rrd(10, 140, 140, 26, 4), BG, { k: 3, rim: 1 }) + keys(16, 145, 126, 3, 9, 4.4, 1.5).replace(/#3E4554/g, "#D8CFB4");
  }
  if (k.has("desktop")){
    return ground(82, 172, 70, 6) + solid(rrd(20, 18, 120, 84, 6), C.black, { k: 5, rim: 1.2 }) + desk(26, 24, 108, 72) + solid("M70 102H90L94 122H66Z", B, { k: 3, rim: 0 }) + solid(rrd(52, 120, 56, 6, 3), B, { k: 2, rim: 0 }) +
      solid("M10 150L20 136H120L128 150Z", B, { k: 3, rim: 1 }) + keys(24, 139, 94, 2, 8, 3.6, -2) + solid(blob([[136, 142], [146, 140], [150, 148], [142, 152], [134, 148]]), B, { k: 2, rim: 0 });
  }
  return ground(82, 166, 72, 7) +
    solid("M8 152L28 118H132L152 152Q152 158 146 158H14Q8 158 8 152Z", B, { k: 4, rim: 1.4 }) + fill("M30 122H130L146 150H14Z", mix(B.s, B.l, 0.3)) +
    [0, 1, 2, 3].map(r => { const y = 125 + r * 6, a = 30 - r * 4.3, b = 130 + r * 4.3, n = 12; let o = ""; for (let c = 0; c < n; c++){ const x0 = a + (b - a) * c / n, x1 = a + (b - a) * (c + 0.82) / n; o += fill(poly([[x0, y], [x1, y], [x1 - 0.7, y + 4.4], [x0 - 0.7, y + 4.4]]), "#3E4554"); } return o; }).join("") +
    fill(poly([[64, 150], [96, 150], [95, 155], [65, 155]]).replace(/.*/, ""), "none") + fill(rrd(66, 149, 28, 6, 1.5), mix(B.s, B.l, 0.15)) +
    solid("M26 118L30 30Q30 24 36 24H124Q130 24 130 30L134 118Z", B, { k: 4, rim: 1.2 }) + fill("M34 112L37 32H123L126 112Z", SCR) + desk(40, 36, 80, 72);
}

/* ================================================================ a leaf (une feuille) ================================================================
   One leaf from a tree, lying a little turned: its stalk, a middle vein and side veins. looks: a colour (green: the usual one) | "autumn"
   (orange and red) | "maple" (five points) | "oak" (round lobes) */
function leaf(k){
  const B = k.has("autumn") ? C.orange : k.cn && C[k.cn] ? C[k.cn] : P("#5DAE62", "#3B8547"), V = mix(B.l, "#FFFFFF", 0.42);
  let d, veins, stalk = "M80 172Q78 160 80 150";
  if (k.has("maple")){
    d = poly([[80, 150], [62, 154], [66, 140], [36, 132], [44, 124], [18, 104], [36, 100], [28, 76], [52, 84], [56, 66], [70, 74], [80, 30], [90, 74], [104, 66], [108, 84], [132, 76], [124, 100], [142, 104], [116, 124], [124, 132], [94, 140], [98, 154]]);
    veins = "M80 150V40M80 130L36 104M80 130L124 104M80 116L44 82M80 116L116 82";
  } else if (k.has("oak")){
    d = blob([[80, 152], [64, 146], [58, 132], [44, 128], [48, 114], [36, 104], [46, 92], [38, 78], [52, 70], [50, 54], [64, 50], [70, 34], [80, 26], [90, 34], [96, 50], [110, 54], [108, 70], [122, 78], [114, 92], [124, 104], [112, 114], [116, 128], [102, 132], [96, 146]]);
    veins = "M80 150V34M80 132L52 120M80 132L108 120M80 112L44 100M80 112L116 100M80 92L46 76M80 92L114 76M80 70L56 58M80 70L104 58";
  } else {
    d = blob([[80, 152], [56, 136], [40, 104], [44, 70], [62, 40], [80, 22], [98, 40], [116, 70], [120, 104], [104, 136]]);
    veins = "M80 150Q78 90 80 30M80 130L56 112M80 130L104 112M80 108L50 88M80 108L110 88M80 86L54 64M80 86L106 64M80 64L64 46M80 64L96 46";
  }
  const ex = k.has("autumn") ? clipped(d, circ(110, 60, 40, C.red.l, 'opacity=".55"') + circ(56, 130, 22, C.yellow.l, 'opacity=".5"')) : "";
  return ground(84, 172, 30, 4, 0.18) + rot(-14, 80, 100, line(stalk, B.s, 4) + solid(d, B, { k: 7, rim: 1.6 }) + ex + line(veins, V, 2, 'opacity=".85"'));
}

/* ================================================================ the grounds of sur / sous / dans ================================================================
   THINGS.ground(kind, k): the table, chair, box or bag that a thing is put on, under or in (people.js placePic). The SAME places as the
   present drawings, so that placePic's own numbers still put the thing on the top, under it, in it: only the finish changes.
   k: people.js's look object (k.cn a colour name, k.has(...)); k.under: what stands under the table / chair (drawn behind the front legs);
   k.inside: what is in the open box / bag (drawn behind the front). Returns null for a variant not drawn here (the caller draws its own). */
const groundCol = (k, def) => { const n = k && k.cn === "wooden" ? "wood" : k && k.cn; return C[n] || C[def]; };
const leg = (x0, y0, x1, y1, w, p, farL) => { const q = farL ? { l: p.fl, s: p.fs, r: p.fl } : p, a = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2, dx = Math.cos(a) * w / 2, dy = Math.sin(a) * w / 2;
  const d = poly([[x0 - dx, y0 - dy], [x0 + dx, y0 + dy], [x1 + dx * 0.8, y1 + dy * 0.8], [x1 - dx * 0.8, y1 - dy * 0.8]]);
  return fill(d, q.s) + fill(poly([[x0 - dx, y0 - dy], [x0 - dx * 0.1, y0 - dy * 0.1], [x1 - dx * 0.1, y1 - dy * 0.1], [x1 - dx * 0.8, y1 - dy * 0.8]]), q.l); };
function groundTable(k){
  if (k.has && k.has("garden", "round", "low", "long", "dining", "glass")) return null;
  const W = groundCol(k, "wood");
  return ground(82, 168, 66, 7, 0.2) + leg(49, 78, 49, 146, 7, W, 1) + leg(111, 78, 111, 146, 7, W, 1) + (k.under || "") +
    leg(25, 104, 25, 166, 7.5, W) + leg(135, 104, 135, 166, 7.5, W) +
    fill("M18 98H142V104Q142 106.5 139.5 106.5H20.5Q18 106.5 18 104Z", W.m) + fill("M112 98H142V104Q142 106.5 139.5 106.5H112Z", W.s) +      // the edge of the top, its right end turned from the light
    fill(rpoly([[18, 98], [44, 72], [116, 72], [142, 98]], 2), W.l) + fill(poly([[96, 72], [116, 72], [142, 98], [118, 98]]), W.m, 'opacity=".55"') +
    line("M19.5 97L44.5 73.2H115", W.r, 1.4) + line("M40 92H104M54 82H112", W.s, 0.9, 'opacity=".35"');                                      // the light on the lit edge; the grain
}
function groundChair(k){
  if (k.has && k.has("office", "folding", "plastic", "garden", "kitchen")) return null;
  const W = groundCol(k, "wood");
  return ground(80, 178, 50, 6, 0.2) + leg(64, 104, 64, 150, 6, W, 1) + leg(122, 108, 122, 158, 6, W, 1) + leg(64, 104, 60, 36, 6.5, W) + leg(122, 108, 118, 42, 6.5, W, 1) +
    leg(74, 46, 76, 100, 3.6, W, 1) + leg(90, 47, 92, 102, 3.6, W, 1) + leg(105, 48, 107, 104, 3.6, W, 1) +
    fill("M56 34Q90 28 122 40V51Q90 39 56 45Z", W.l) + fill("M104 34.5Q114 36.5 122 40V51Q114 47 104 44.5Z", W.m) + line("M57 34Q90 28.5 121 39.6", W.r, 1.2) +       // the top rail
    (k.under || "") + leg(40, 128, 40, 176, 6.5, W) + leg(98, 134, 98, 182, 6.5, W) + leg(40, 158, 98, 164, 3.6, W) +
    fill("M40 124L98 130L122 108V115L98 137L40 131Z", W.s) + fill("M40 124L98 130V137L40 131Z", W.m) + fill(rpoly([[40, 124], [64, 102], [122, 108], [98, 130]], 1.5), W.l) + line("M41 123.4L64.4 102.6L121 108.2", W.r, 1.3);
}
function groundBox(k){
  if (k.has && k.has("gift", "plastic", "metal") || (k.has && k.has("wooden") && !k.has("open"))) return null;
  const B = groundCol(k, "kraft") || P("#D9AE74", "#B58A52");
  if (k.has && k.has("open")){
    const IN = mix(B.s, INK, 0.35);
    return ground(86, 168, 70, 8, 0.22) +
      fill(poly([[54, 70], [150, 70], [154, 40], [58, 40]]), B.m) + fill(poly([[54, 70], [150, 70], [151, 62], [55, 62]]), B.s, 'opacity=".5"') + line("M58.6 40.6H153.4", B.r, 1.2) +      // the back flap, standing
      fill(poly([[20, 96], [54, 70], [150, 70], [116, 96]]), IN) + fill(poly([[54, 70], [150, 70], [140, 78], [48, 78]]), mix(IN, INK, 0.25)) +                                  // the inside
      fill(poly([[20, 96], [54, 70], [32, 58], [2, 82]]), B.r) + line("M2.6 81.4L31.6 58.6", "#FFFFFF", 1, 'opacity=".6"') +                                                         // the left flap, laid open to the light
      (k.inside || "") +
      fill(poly([[116, 96], [150, 70], [150, 136], [116, 162]]), B.s) + fill(poly([[116, 96], [150, 70], [158, 92], [128, 116]]), B.fs) +                                          // the right side and its flap
      fill(poly([[20, 96], [116, 96], [116, 162], [20, 162]]), B.l) + fill(poly([[20, 96], [116, 96], [122, 118], [14, 118]]), B.m) + line("M15 117.4H121.4", B.s, 1, 'opacity=".6"') +      // the front, its flap folded down
      line("M20.6 119V161.4", B.r, 1.3);
  }
  return ground(88, 160, 62, 7, 0.22) + fill(poly([[110, 88], [140, 66], [140, 134], [110, 156]]), B.s) + fill(poly([[26, 88], [110, 88], [110, 156], [26, 156]]), B.l) +
    fill(rpoly([[26, 88], [56, 66], [140, 66], [110, 88]], 1), B.r) + fill(poly([[61, 88], [91, 66], [104, 66], [74, 88]]), "#F1E2B4") + fill(poly([[61, 88], [74, 88], [74, 112], [61, 112]]), "#E6D29E") +      // the top, and the tape
    line("M26.6 89V155.4", B.r, 1.3) + line("M32 146H52M32 140H44", B.s, 1.6, 'opacity=".5"');
}
function groundBag(k){
  const B = groundCol(k, "blue");
  return ground(82, 176, 52, 6, 0.2) + line("M56 96Q56 46 80 46Q104 46 104 96", B.fs, 7) + `<ellipse cx="80" cy="98" rx="52" ry="15" fill="${mix(B.s, INK, 0.3)}"/>` + (k.inside || "") +
    solid("M28 98Q80 126 132 98L124 166Q80 178 36 166Z", B, { k: 7, rim: 1.4 }) + line("M28.6 98.4Q80 125.6 131.4 98.4", B.r, 1.4) +
    line("M58 112Q60 146 80 146Q100 146 102 112", B.s, 7.4) + line("M58 112Q60 146 80 146Q100 146 102 112", B.l, 4.4);
}
const GROUND = { table: groundTable, chair: groundChair, box: groundBox, bag: groundBag };
function groundOf(kind, k){ const f = GROUND[String(kind || "").toLowerCase()]; if (!f) return null; try { return f(k || {}); } catch (e) { return null; } }

/* ---------- the looks, read as people.js reads them ---------- */
function lookOf(spec){
  const S = " " + (spec.looks || []).join(" ").toLowerCase().replace(/[^a-z'\- ]+/g, " ").replace(/\s+/g, " ").trim() + " ";
  const cn = S.trim().split(" ").find(x => C[x] && !/^(cream|stone|brick|wood|tile|slate|glass|leaf|grass|paper|steel|dark|gold|paving)$/.test(x));
  return { S, cn, has: (...w) => w.some(x => S.indexOf(" " + x + " ") >= 0) };
}
const DRAW = { house, train, book, car, town, restaurant, bus, phone, heart, coffee, door, photo, street, dog, cat, horse, fish, shoe, bread, soup, bottle, table, box, newspaper, radio, computer, leaf };
const PLACED = /^(in an open box|on a table|under a table)$/;
const FOOT = { car: 140, book: 152, train: 160, bus: 146, heart: 170, coffee: 160, photo: 168 };      // where each stands in its card (the line a small one shares with a big one)
function one(spec){
  spec = spec || {};
  const is = String(spec.is || "").toLowerCase().trim(), f = DRAW[is];
  if (!f) return null;
  const looks = (spec.looks || []).map(x => String(x).toLowerCase()), placed = looks.find(x => PLACED.test(x));
  try {
    if (placed){
      /* on / under a table, in a box: the caller places the thing (index.html and people.js strip the look and ask again for the thing
         alone). The one case it did not: a CAR on or under a table was drawn as a car alone, with no table (the car is sent to PICS.car
         before the table is looked at): here the car is placed on the present table like every other thing. */
      if (is !== "car" || placed === "in an open box" || !window.PICS || !PICS.place) return null;
      const rest = looks.filter(x => x !== placed);
      return PICS.place({ thing: { is: "car", looks: rest }, rel: placed === "on a table" ? "on" : "under", ground: { is: "table", looks: ["wooden"] } }, x => one(Object.assign({}, x, { is: "car" })));
    }
    /* "big" / "small" on any kind: the SAME picture at two sizes, standing on the same line (small = 0.55 of big; places 0.72).
       Not for the looks in which small names a picture of its own (the small car, coffee in a small cup) or that are not drawn here. */
    const OWN = { table: /\blow\b/, box: /\b(metal|open|tin)\b/, tree: /\b(young|green)\b/, cat: /\bkitten\b/, dog: /\bpuppy\b/ }, own = OWN[is] && OWN[is].test(looks.join(" "));      // looks in which big / small name a picture of their own (as people.js keeps them)
    const big = looks.indexOf("big") >= 0 && !own, sm = looks.indexOf("small") >= 0 && is !== "car" && is !== "coffee" && !own;
    if (big && is === "door") return null;
    if (big || sm){
      const base = f(lookOf({ looks: looks.filter(x => x !== "big" && x !== "small") }), spec); if (base == null) return null;
      const y = FOOT[is] || 174, kx = /^(town|street|restaurant)$/.test(is) ? 0.72 : is === "train" ? 0.7 : 0.55;
      return mk(sm ? `<g transform="translate(80 ${y}) scale(${kx}) translate(-80 ${-y})">${base}</g>` : base);
    }
    const s = f(lookOf(spec), spec); return s == null ? null : mk(s);
  } catch (e) { return null; }
}
const can = spec => !!one(spec);

/* Until people.js calls THINGS.one itself (it then sets PICS._thingsHook), the pictures asked for by name are taken over here. */
function install(){
  const Pc = window.PICS; if (!Pc || Pc._things) return; Pc._things = 1;
  const t0 = Pc.thing, c0 = Pc.car;
  const whole = (spec, orig, self) => { if (!Pc._thingsHook && spec){ const n = spec.count || 1, g = one(spec); if (g) return n > 1 && Pc.group ? Pc.group(n, () => one(spec)) : g; } return orig.apply(self, [spec]); };
  if (t0) Pc.thing = function(spec){ return whole(spec, t0, this); };
  if (c0) Pc.car = function(spec){ return whole(spec ? Object.assign({}, spec, { is: "car" }) : spec, c0, this); };
  /* PICS.dog and PICS.key (index.html sends a dog and a key to them by name) do not ask THINGS.one in people.js: taken over here until
     people.js sets PICS._thingsDogKey (the hook proposed in THINGS_INVENTORY.md section 8) */
  const own = (name, orig) => { if (orig) Pc[name] = function(spec){ if (!Pc._thingsDogKey && spec){ const s2 = Object.assign({}, spec, { is: name }), n = spec.count || 1, g = one(s2);
    if (g) return n > 1 && Pc.group ? Pc.group(n, () => one(s2)) : g; } return orig.apply(this, [spec]); }; };
  own("dog", Pc.dog); own("key", Pc.key);
}
window.THINGS = { one, can, ground: groundOf, kinds: Object.keys(DRAW), install };
install();
})();
