const CACHE_NAME = 'daily-collection-v2';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './service-worker.js'
];

self.addEventListener('install', event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))

  );

  self.skipWaiting();

});


self.addEventListener('activate', event => {

  event.waitUntil(

    caches.keys().then(keys =>

      Promise.all(

        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))

      )

    )

  );

  self.clients.claim();

});


self.addEventListener('fetch', event => {

  /*
   * Only handle GET requests.
   */

  if (event.request.method !== 'GET') {

    return;

  }


  /*
   * App files:
   * cache first.
   */

  const url =
    new URL(event.request.url);


  if (
    url.origin === location.origin
  ) {

    event.respondWith(

      caches.match(event.request)
        .then(cachedResponse => {

          if (cachedResponse) {

            return cachedResponse;

          }


          return fetch(event.request)
            .then(response => {

              /*
               * Save successful response
               * into cache.
               */

              if (
                response &&
                response.status === 200
              ) {

                const copy =
                  response.clone();


                caches.open(CACHE_NAME)
                  .then(cache => {

                    cache.put(
                      event.request,
                      copy
                    );

                  });

              }


              return response;

            });

        })

    );

    return;

  }


  /*
   * External requests:
   * network only.
   *
   * This includes the Google Apps
   * Script API.
   */

  event.respondWith(

    fetch(event.request)

  );

});
