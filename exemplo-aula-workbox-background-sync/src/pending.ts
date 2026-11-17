import type { Transacao } from "./transacao.model";

interface QueueEntry {
  id?: number;
  queueName: string;
  timestamp: number;
  requestData: {
    url: string;
    method: string;
    body?: string;
  };
}

export interface PendingTransacao extends Transacao {
  _pendingId: number;
  _timestamp: number;
}

export async function getPendingTransacoes(): Promise<PendingTransacao[]> {
  return new Promise((resolve) => {
    const req = indexedDB.open("workbox-background-sync");

    req.onerror = () => resolve([]);

    req.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("requests")) {
        db.close();
        resolve([]);
        return;
      }

      const tx = db.transaction("requests", "readonly");
      const store = tx.objectStore("requests");
      const getAll = store.getAll();

      getAll.onsuccess = () => {
        const entries: QueueEntry[] = getAll.result;
        const pending = entries
          .filter((e) => e.queueName === "transacoes-queue" && e.requestData.body)
          .map((e) => {
            try {
              const t = JSON.parse(e.requestData.body!) as Transacao;
              return { ...t, _pendingId: e.id!, _timestamp: e.timestamp };
            } catch {
              return null;
            }
          })
          .filter(Boolean) as PendingTransacao[];
        db.close();
        resolve(pending);
      };

      getAll.onerror = () => {
        db.close();
        resolve([]);
      };
    };
  });
}
