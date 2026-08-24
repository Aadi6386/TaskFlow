/* =========================================================
   TASKFLOW
   Service Worker — v2.0.0
========================================================= */

const CACHE_NAME =
    "taskflow-v2.0.0";


const APP_SHELL = [

    "./",

    "./index.html",

    "./manifest.json",

    "./assets/css/style.css",

    "./assets/js/state.js",

    "./assets/js/storage.js",

    "./assets/js/utils.js",

    "./assets/js/app.js",

    "./assets/images/favicon.ico",

    "./assets/images/icon.svg"

];


self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(cache =>
                    cache.addAll(
                        APP_SHELL
                    )
                )

        );

        self.skipWaiting();

    }
);


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(cacheNames => {

                    return Promise.all(

                        cacheNames
                            .filter(
                                cacheName =>
                                    cacheName !==
                                    CACHE_NAME
                            )
                            .map(
                                cacheName =>
                                    caches.delete(
                                        cacheName
                                    )
                            )

                    );

                })

        );

        self.clients.claim();

    }
);


self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !==
            "GET"
        ) {

            return;
        }


        event.respondWith(

            caches
                .match(
                    event.request
                )
                .then(cachedResponse => {

                    if (cachedResponse) {

                        return cachedResponse;

                    }


                    return fetch(
                        event.request
                    )
                        .then(response => {

                            if (
                                !response ||
                                response.status !== 200 ||
                                response.type ===
                                "opaque"
                            ) {

                                return response;

                            }


                            const responseClone =
                                response.clone();


                            caches
                                .open(
                                    CACHE_NAME
                                )
                                .then(cache => {

                                    cache.put(
                                        event.request,
                                        responseClone
                                    );

                                });


                            return response;

                        })
                        .catch(() => {

                            if (event.request.mode === "navigate") {
                                return caches.match("./index.html");
                            }

                            return Response.error();

                        });

                })

        );

    }
);
