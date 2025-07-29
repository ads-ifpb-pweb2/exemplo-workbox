import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      workbox: {
        globDirectory: "dist",
        globPatterns: ["**/*.{js,css,html,png,jpg,svg,json}"],
        swDest: "dist/sw.js",
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.url.startsWith("http://localhost:3000"),
            handler: "CacheFirst",
            options: {
              cacheName: "backend-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 1 dia
              },
            },
          },
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "CacheFirst",
            options: {
              cacheName: "pages-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24, // 1 dia
              },
            },
          },
        ],
      },
    }),
    react(),
  ],
});

