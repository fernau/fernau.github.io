const PRECACHE = ["./","apple-touch-icon.png","assets/index-DYHJheuy.js","assets/index-ReDknPWe.css","favicon.svg","icon-192.png","icon-512.png","manifest.webmanifest"];
const VERSION = "79358d3e8e1f13b0";
const PREFIX = "tapcode-";
const CACHE = `${PREFIX}${VERSION}`;
function serviceWorkerScope() {
	if (self instanceof ServiceWorkerGlobalScope) return self;
	throw new Error("this script runs only as a service worker");
}
async function precache() {
	const cache = await caches.open(CACHE);
	// Not the HTTP cache: a stale index.html there would pair this build's list with the last build's chunks.
	await cache.addAll(PRECACHE.map((path) => new Request(path, { cache: "reload" })));
}
async function dropOldVersions() {
	const names = await caches.keys();
	// Only this app's caches: the origin is shared with other apps at other paths.
	await Promise.all(names.filter((name) => name.startsWith(PREFIX) && name !== CACHE).map(async (name) => caches.delete(name)));
}
async function cachedOrFetched(request) {
	const cache = await caches.open(CACHE);
	const cached = await cache.match(request.mode === "navigate" ? "./" : request);
	return cached ?? fetch(request);
}
const scope = serviceWorkerScope();
scope.addEventListener("install", (event) => {
	event.waitUntil(precache());
});
scope.addEventListener("activate", (event) => {
	event.waitUntil(dropOldVersions().then(async () => scope.clients.claim()));
});
scope.addEventListener("fetch", (event) => {
	event.respondWith(cachedOrFetched(event.request));
});
scope.addEventListener("message", (event) => {
	if (event.data === "skip-waiting") void scope.skipWaiting();
});
