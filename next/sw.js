/* next/sw.js: keeps the app on the phone so that it starts and runs with no connection.
   Every file is fetched from the site first, so a new release is used as soon as it is there (the lessons and the page always come
   together); the copy kept here is used only when the site cannot be reached. A file is written to the copy only when it has changed
   (its ETag or date), so the large files (the listener, the voices) are not written again on every start.
   Not kept here: version.json (asked fresh, to offer an update) and the listener's own model files (listener.js keeps those itself). */
const CACHE = "faultless-next-v1";
const CORE = ["./", "index.html", "shell.js", "shell.css", "people.js", "things.js", "words.js", "manifest.webmanifest",
  "fonts/atkinson-next-latin.woff2", "fonts/atkinson-next-latin-ext.woff2", "fonts/fraunces-soft-latin.woff2",
  "../listener/listener.js", "../listener/ort/ort.wasm.min.js", "../listener/vosk/vosk.js",
  "../audio/teacher/index.json", "../audio/learner/index.json", "../audio/narrator/index.json",
  "brand/splash.css", "brand/splash.js", "brand/favicon.svg", "brand/icon.svg", "brand/icon-192.png", "brand/icon-512.png", "brand/icon-maskable-512.png",
  "brand/icon-monochrome-512.png", "brand/apple-touch-icon.png"];
const skip = u => u.origin !== location.origin || /\/version\.json$/.test(u.pathname) || /\/listener\/model\//.test(u.pathname);
const same = (a, b) => !!a && !!b && ((a.headers.get("etag") && a.headers.get("etag") === b.headers.get("etag")) ||
  (a.headers.get("last-modified") && a.headers.get("last-modified") === b.headers.get("last-modified") && a.headers.get("content-length") === b.headers.get("content-length")));

self.addEventListener("install", e => { e.waitUntil((async () => { const c = await caches.open(CACHE);
  // the page's own scripts and styles (the lessons it serves among them), read from the page itself
  const page = await fetch("index.html", { cache: "no-cache" }).then(r => r.ok ? r.text() : "").catch(() => "");
  const own = [...page.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"#:]+)"/g)].map(m => m[1]).filter(p => !/\/listener\/model\//.test(p));
  await Promise.all([...new Set(CORE.concat(own))].map(p => fetch(p, { cache: "no-cache" }).then(r => r.ok ? c.put(p, r) : null).catch(() => null)));
  self.skipWaiting(); })()); });
self.addEventListener("activate", e => { e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith("faultless-next-") && k !== CACHE) await caches.delete(k);
  await self.clients.claim(); })());
  fillVoices();      // not waited for: the voices are kept one by one in the background
});
async function fillVoices(){ try{ const c = await caches.open(CACHE);
  for (const who of ["teacher", "learner", "narrator"]){ const r = await fetch("../audio/" + who + "/index.json").catch(() => null); if (!r || !r.ok) continue; const ix = await r.json();
    for (const k of Object.keys(ix)){ const p = "../audio/" + who + "/" + k + ".mp3"; if (await c.match(p)) continue; const a = await fetch(p).catch(() => null); if (a && a.ok && a.status === 200) await c.put(p, a); } } }catch(e){} }

self.addEventListener("fetch", e => { const req = e.request; if (req.method !== "GET") return; const u = new URL(req.url); if (skip(u)) return;
  if (req.headers.get("range")) return;      // a part of a file (a media element's request): left to the network and the browser
  e.respondWith((async () => { const c = await caches.open(CACHE), key = req.mode === "navigate" ? new URL("index.html", self.registration.scope).href : req;
    const kept = await c.match(key, { ignoreSearch: true });
    try {
      const net = fetch(req); const r = await (req.mode === "navigate" && kept ? Promise.race([net, new Promise((_, no) => setTimeout(() => no(new Error("slow")), 6000))]) : net);
      if (r && r.ok && r.status === 200 && r.type === "basic" && !same(r, kept)) e.waitUntil(c.put(key, r.clone()).catch(() => {}));
      return r;
    } catch (err) { if (kept) return kept; throw err; }
  })()); });
self.addEventListener("message", e => { if (e.data === "skipWaiting") self.skipWaiting(); });
