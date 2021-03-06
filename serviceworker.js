CACHE = "network-or-cache";

self.addEventListener("install", function(evt) {
    evt.waitUntil(precache());
});

self.addEventListener("fetch", function(evt) {
    evt.respondWith(fromNetwork(evt.request, 400).catch(function () {
	return fromCache(evt.request);
    }));
});

function precache() {
    return caches.open(CACHE).then(function (cache) {
	return cache.addAll(["bus.png", "temp.json"]);
    });
}

function fromNetwork(request, timeout) {
    return new Promise(function (fulfill, reject) {
	var timeoutId = setTimeout(reject, timeout);

	fetch(request).then(function (response) {
	    clearTimeout(timeoutId);
	    fulfill(response);
	},
			    reject);
    });
}
