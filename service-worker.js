const CACHE_NAME = 'daily-collection-v2';

const APP_FILES = [
  './',
  './index.html',
  './manifest.json'
];


// Install
self.addEventListener('install', event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())

  );

});


// Activate
self.addEventListener('activate', event => {

  event.waitUntil(

    caches.keys()
      .then(cacheNames => {

        return Promise.all(

          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))

        );

      })
      .then(() => self.clients.claim())

  );

});


// Fetch
self.addEventListener('fetch', event => {

  // Do not cache Google Apps Script/API requests
  if (
    event.request.url.includes('script.google.com')
  ) {

    return;

  }


  event.respondWith(

    fetch(event.request)
      .then(response => {

        // Save the latest successful response
        const responseClone =
          response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(
              event.request,
              responseClone
            );
          });

        return response;

      })
      .catch(() => {

        // If offline, use cached version
        return caches.match(event.request);

      })

  );

});
