export const globDirectory = "dist/";
export const globPatterns = ["**/*.{js,css,html,ico,png,svg,json}"];
export const swDest = "dist/sw.js";
export const navigateFallback = "/index.html";
export const runtimeCaching = [
  {
    urlPattern: ({ request }) => request.mode === "navigate",
    handler: "NetworkFirst",
    options: {
      cacheName: "pages-cache",
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      },
      cacheableResponse: {
        statuses: [200],
      },
    },
  },
  {
    urlPattern: ({ request }) => request.url.startsWith("http://localhost:3000"),
    handler: "NetworkFirst",
    options: {
      cacheName: "backend-cache",
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      },
      cacheableResponse: {
        statuses: [200],
      },
    },
  },
];
