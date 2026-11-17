/// <reference lib="webworker" />
import { Queue } from "workbox-background-sync";
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkOnly } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const bgQueue = new Queue("transacoes-queue", {
  maxRetentionTime: 24 * 60,
  async onSync({ queue }) {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        const clients = await self.clients.matchAll({ type: "window" });
        for (const client of clients) {
          client.postMessage({ type: "TRANSACOES_SINCRONIZADAS" });
        }
      } catch (error) {
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  },
});

registerRoute(
  ({ url, request }) => url.pathname === "/api/transacoes" && request.method === "POST",
  new NetworkOnly({
    plugins: [
      {
        fetchDidFail: async ({ request }) => {
          await bgQueue.pushRequest({ request });
        },
      },
    ],
  }),
  "POST",
);
