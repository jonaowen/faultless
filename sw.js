/* next/sw.js: keeps the app on the phone so that it starts and runs with no connection.
   (speed, stage 2, 16 Nov) Two copies are kept, each by its own rule:
   - A RELEASE (the caches "faultless-app-rel-…"): the page, its scripts and styles (the lessons among them), the shell, the pictures, the
     fonts and the three indexes of the voices, kept and given AS A WHOLE. A release is used only when every one of its files is kept; a
     page of one release is never given with a lesson of another (until .71 each file was asked of the site for 4 s and the kept copy given
     when it was late: after a time-out a new page could run with an old lesson). At each start the page is asked of the site (6 s at most
     when a release is kept): the very page kept is given at once (the rest of its release is looked at again behind it, for the next
     start); a new page is given when its whole release has come within those 6 s, and otherwise the release kept is given whole and the
     new one is used at the next start. A page keeps the release it was given (every file it asks for comes from that release).
   - THE VOICES (the cache "faultless-app-v1"): every clip kept under the signature of its entry in the voices' index ("?s=…", made from
     the entry: its words, its length, the time of each sound). A kept clip is given at once when its signature is the one asked for; one
     kept under another signature (a clip recorded again, or a copy of .70/.71 that had none) is looked at again with one short
     conditional request ("not changed": the same bytes are kept under the new signature). This replaces .70's "older than a day" rule.
     The listener's files (vosk.js and its model) are kept here too, as before.
   Not kept: version.json (asked fresh, to offer an update). (The in-app listening model is gone, 16 Nov: what it kept on the phone, 46 MB
   under "faultless-listener-…", is deleted when this worker takes over.) */
/* (switch-over) The same file serves the preview in next/ and the app at the site's root: in next/ the course, the voices and the listener are
   one folder up (UP "../") and its copy is "faultless-next-…"; at the root they are beside it and its copy is "faultless-app-…". At the root the
   old app (/old/) and the redirect left in next/ are not this app's: they are never kept or answered from here. */
const UP = /\/next\/sw\.js$/.test(location.pathname) ? "../" : "";
const KIND = UP ? "faultless-next-" : "faultless-app-", CACHE = KIND + "v1", REL = KIND + "rel-", META = KIND + "meta";
const SCOPE = self.registration.scope, SCOPE_PATH = new URL(SCOPE).pathname, abs = p => new URL(p, SCOPE).href;
// a release's files besides the page's own scripts and styles (read from the page itself)
const CORE = ["index.html", "shell.js", "shell.css", "people.js", "things.js", "words.js", "manifest.webmanifest",
  "fonts/atkinson-next-latin.woff2", "fonts/atkinson-next-latin-ext.woff2", "fonts/fraunces-soft-latin.woff2",
  UP+"listener/listener.js", UP+"audio/teacher/index.json", UP+"audio/learner/index.json",      // (no narrator, .72: its explanations are cards)
  "brand/splash.css", "brand/splash.js", "brand/favicon.svg", "brand/icon.svg", "brand/icon-192.png", "brand/icon-512.png", "brand/icon-maskable-512.png",
  "brand/icon-monochrome-512.png", "brand/apple-touch-icon.png"];
const LISTENER_FILES = [UP+"listener/vosk/vosk.js"];
const skip = u => u.origin !== location.origin || /\/version\.json$/.test(u.pathname) || /\/listener\/model\//.test(u.pathname) ||
  (!UP && (u.pathname.startsWith(SCOPE_PATH + "old/") || u.pathname.startsWith(SCOPE_PATH + "next/")));
const same = (a, b) => !!a && !!b && ((a.headers.get("etag") && a.headers.get("etag") === b.headers.get("etag")) ||
  (a.headers.get("last-modified") && a.headers.get("last-modified") === b.headers.get("last-modified") && a.headers.get("content-length") === b.headers.get("content-length")));
const late = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error("slow")), ms))]);
const wait = ms => new Promise(r => setTimeout(r, ms));
/* the signature of a voice's index entry (the page makes the same: clipSig in index.html) */
const sig = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); };
const clipSig = entry => sig(JSON.stringify(entry));

/* ---- releases ---- */
const own = page => [...page.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"#:]+)"/g)].map(m => m[1]).filter(p => !/\/listener\/model\//.test(p));
const vtag = r => r.headers.get("etag") || (r.headers.get("last-modified") ? r.headers.get("last-modified") + "/" + (r.headers.get("content-length") || "") : "t" + Date.now());
const complete = async name => !!name && (await caches.has(name)) && !!(await (await caches.open(name)).match(abs("__complete")));
const metaGet = async k => { try{ const r = await (await caches.open(META)).match(abs("__meta/" + k)); return r ? await r.text() : null; }catch(e){ return null; } };
const metaPut = (k, v) => caches.open(META).then(c => v == null ? c.delete(abs("__meta/" + k)) : c.put(abs("__meta/" + k), new Response(v))).catch(() => {});
const BIND = new Map();      // a page (its client id) -> the release it was given
// the newest complete release (of this page, when P is given); the one last given to a page
async function newest(P){ const all = (await caches.keys()).filter(k => k.startsWith(REL + (P ? P + "-" : ""))).reverse(); for (const k of all) if (await complete(k)) return k; return null; }
const newestFor = P => newest(P);
async function served(){ const n = await metaGet("served"); return (await complete(n)) ? n : newest(); }
/* a release made from a fresh answer for the page: every file asked of the site (a conditional request: "not changed" costs one short answer);
   written only when something in it has changed (its name is made from the page and from every file's ETag); a file the site does not have
   (404) is left out; any other failure: no release */
const building = {};
/* (a page opened again in the same tab, as "Update" does, may take a script from the browser's own memory of the page before, without
   asking this worker, while the copy says it is good for 10 minutes: what a release gives is marked to be asked for again each time) */
const asked = async r => { const h = new Headers(r.headers); h.set("cache-control", "no-cache"); return new Response(await r.blob(), { status: r.status, statusText: r.statusText, headers: h }); };
function build(page, text, P){ const copy = page.clone();
  const files = [...new Set(CORE.concat(own(text)))].filter(p => p !== "index.html");
  return Promise.all(files.map(p => fetch(abs(p), { cache: "no-cache" }).then(r => { if (r.status === 404) return null; if (!r.ok) throw new Error(p + " " + r.status); return [p, r]; })))
    .then(async got => { got = got.filter(Boolean); const name = REL + P + "-" + sig(got.map(([p, r]) => p + "=" + vtag(r)).join("|"));
      if (await complete(name)) return name;
      if (!building[name]) building[name] = (async () => { const c = await caches.open(name);
        await c.put(abs("index.html"), await asked(copy)); for (const [p, r] of got) await c.put(abs(p), await asked(r));
        await c.put(abs("__complete"), new Response(String(Date.now()))); await tidy(name); return name; })().finally(() => { delete building[name]; });
      return building[name]; }); }
/* releases no longer needed: all but the newest two, the one last given and those of pages still open */
async function tidy(keep){ try{ const all = (await caches.keys()).filter(k => k.startsWith(REL)), live = new Set([keep, await metaGet("served")]);
    const ids = new Set((await self.clients.matchAll({ type: "window" })).map(c => c.id)); const meta = await caches.open(META);
    for (const r of await meta.keys()){ const m = /\/__meta\/client\/(.+)$/.exec(r.url); if (!m) continue; const id = decodeURIComponent(m[1]);
      if (ids.has(id)) live.add(await (await meta.match(r)).text()); else await meta.delete(r); }
    const done = []; for (const k of all) if (await complete(k)) done.push(k);
    done.slice(-2).forEach(k => live.add(k));
    for (const k of all) if (!live.has(k) && (done.includes(k) || !Object.keys(building).includes(k))) await caches.delete(k); }catch(e){} }
function bind(id, name){ if (!id || !name) return; BIND.set(id, name); metaPut("client/" + encodeURIComponent(id), name); }
async function releaseOf(id){ if (id && BIND.has(id)) return BIND.get(id); let n = id ? await metaGet("client/" + encodeURIComponent(id)) : null;
  if (!n || !(await caches.has(n))){ n = await served(); if (id && n) bind(id, n); } else BIND.set(id, n); return n; }
async function navigate(e){ const t0 = Date.now(); let kept = await newest(), name = null, fresh = null;
  const net = fetch(abs("index.html"), { cache: "no-cache" });
  try{ const page = await (kept ? late(net, 6000) : net);
    if (page.ok && page.status === 200){ fresh = page; const text = await page.clone().text(), P = sig(text), have = await newestFor(P), job = build(page, text, P);
      e.waitUntil(job.catch(() => {}));
      if (have) name = have;                                                    // the page kept is the site's: at once (its release is looked at again behind it)
      else if (kept) name = await late(job, Math.max(500, 6000 - (Date.now() - t0))).catch(() => kept); }      // a new release: whole within the 6 s, or the one kept
                                                                                // (nothing kept: the site's page at once, its release made behind it)
    else name = kept;                                                           // the site answered with an error: the release kept
  }catch(err){ name = kept; }                                                   // no answer, or none within 6 s
  if (!name){ if (fresh) return fresh; return net; }                            // nothing kept: the site's own answer, as it is
  bind(e.resultingClientId, name); await metaPut("served", name);
  return (await (await caches.open(name)).match(abs("index.html"))) || net; }

/* ---- the voices ---- */
let hushUntil = 0;      // (speed 2) the page is about to say a line, or saying one: nothing is fetched in the background until it is said
/* a voice: kept under its path (no search: one exact lookup, never a scan of the whole copy), with the signature it was kept for in the
   header "x-ff-sig"; the page reads the same copy itself (clipGet in index.html) */
async function clip(c, u){ const s = u.searchParams.get("s"), key = u.origin + u.pathname;
  const kept = await c.match(key); if (kept && (!s || kept.headers.get("x-ff-sig") === s)) return kept;
  // kept under another signature (a clip recorded again; or .70/.71's copy, which had none): one conditional request
  const h = kept && (kept.headers.get("etag") ? { "If-None-Match": kept.headers.get("etag") } : kept.headers.get("last-modified") ? { "If-Modified-Since": kept.headers.get("last-modified") } : null);
  let r; try{ r = await fetch(u.href, h ? { headers: h } : {}); }catch(err){ if (kept) return kept; throw err; }
  if (r.status === 304 && kept) return store(c, key, s, kept);
  if (r.ok && r.status === 200 && r.type === "basic") return store(c, key, s, r);
  if (r.status === 404 && s) metaPut("none/" + u.pathname + "?s=" + s, "1");      // named in the index, not on the site: not asked for again in the background
  return kept || r; }
async function store(c, key, s, r){ const h = new Headers(r.headers); if (s) h.set("x-ff-sig", s); else h.delete("x-ff-sig");
  const again = new Response(await r.blob(), { status: 200, statusText: "OK", headers: h }); try{ await c.put(key, again.clone()); }catch(e){} return again; }
let filling = false;
async function fillVoices(){ if (filling) return; filling = true; try{ const c = await caches.open(CACHE), rel = await served(), R = rel && await caches.open(rel);
  for (const who of ["teacher", "learner"]){ const p = abs(UP + "audio/" + who + "/index.json");
    const r = (R && await R.match(p, { ignoreVary: true })) || await fetch(p).catch(() => null); if (!r || !r.ok) continue; const ix = await r.json();
    const todo = Object.keys(ix).map(k => new URL(abs(UP + "audio/" + who + "/" + k + ".mp3") + "?s=" + clipSig(ix[k]))); let i = 0;
    await Promise.all([0, 1, 2].map(async () => { while (i < todo.length){ const u = todo[i++], k = await c.match(u.origin + u.pathname); if ((k && k.headers.get("x-ff-sig") === u.searchParams.get("s")) || await metaGet("none/" + u.pathname + u.search)) continue;
      while (Date.now() < hushUntil) await wait(100); await clip(c, u).catch(() => null); } })); } }catch(e){} filling = false; }

self.addEventListener("install", e => { e.waitUntil((async () => {
  try{ const page = await fetch(abs("index.html"), { cache: "no-cache" }); if (page.ok){ const text = await page.clone().text(), name = await build(page, text, sig(text)); await metaPut("served", name); } }catch(err){}
  try{ const c = await caches.open(CACHE); await Promise.all(LISTENER_FILES.map(async p => { const r = await fetch(abs(p), { cache: "no-cache" }); if (r.ok && !same(r, await c.match(abs(p)))) await c.put(abs(p), r); })); }catch(err){}
  self.skipWaiting(); })()); });
self.addEventListener("activate", e => { e.waitUntil((async () => {
  for (const k of await caches.keys()) if ((k.startsWith(KIND) && k !== CACHE && k !== META && !k.startsWith(REL)) || k.startsWith("faultless-listener-")) await caches.delete(k);
  // the code, lessons and page that .70 and .71 kept beside the voices: a release holds them now (left where they are if no release could be made)
  try{ if (await served()){ const c = await caches.open(CACHE); for (const r of await c.keys()){ const p = new URL(r.url).pathname; if ((!/\/audio\/[^/]+\/[^/]+\.mp3$/.test(p) && !/\/listener\//.test(p)) || /\/audio\/narrator\//.test(p)) await c.delete(r); } } }catch(err){}      // (and the narrator's clips: gone, .72)
  await self.clients.claim(); })());
  // (speed) the voices are not filled the moment this worker takes control: the page says when ("voices", below), at every start
});
self.addEventListener("fetch", e => { const req = e.request; if (req.method !== "GET") return; const u = new URL(req.url); if (skip(u)) return;
  if (req.headers.get("range")) return;      // a part of a file (a media element's request): left to the network and the browser
  if (req.mode === "navigate") return e.respondWith(navigate(e).catch(() => fetch(req)));
  e.respondWith((async () => {
    // a file of the page's release: from that release, whole (never a file of another release)
    const c = await caches.open(CACHE);
    if (/\/audio\/[^/]+\/[^/]+\.mp3$/.test(u.pathname)) return clip(c, u);      // a voice: never a file of a release
    const rel = await releaseOf(e.clientId);
    if (rel){ const R = await caches.open(rel), hit = (await R.match(u.origin + u.pathname, { ignoreVary: true })) || (u.search && await R.match(req, { ignoreSearch: true, ignoreVary: true })); if (hit) return hit; }
    // anything else (the listener's files): the site first, 4 s at most when a copy is kept; an error answer gives way to the kept copy.
    // Only the listener's files are written here (a file of no release is not kept: the page that asked for it has none yet)
    const kept = await c.match(req, { ignoreSearch: true });
    const keep = r => { if (r && r.ok && r.status === 200 && r.type === "basic" && /\/listener\//.test(u.pathname) && !same(r, kept)) return c.put(req, r.clone()).catch(() => {}); };
    try{ const net = fetch(req); const r = await (kept ? late(net, 4000) : net);
      if (kept && !(r && (r.ok || r.type === "opaque"))) return kept;
      e.waitUntil(keep(r)); return r;
    }catch(err){ if (kept) return kept; throw err; }
  })()); });
self.addEventListener("message", e => { const d = e.data;
  if (d === "skipWaiting") self.skipWaiting();
  if (d === "voices") e.waitUntil(fillVoices());
  if (d && typeof d === "object" && "hush" in d) hushUntil = d.hush ? Date.now() + 30000 : 0; });
