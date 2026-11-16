/* The preview's service worker, replaced at the switch-over: it removes its kept copy and itself, and sends any page it held to the app (../). */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => { e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith("faultless-next-")) await caches.delete(k);
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: "window" })) { try { c.navigate(new URL("../", self.registration.scope).href); } catch (e) {} }
})()); });
