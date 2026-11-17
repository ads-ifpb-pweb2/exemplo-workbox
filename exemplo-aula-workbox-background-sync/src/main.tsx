import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

registerSW({
  onRegistered(r) {
    console.log("[SW] Service Worker registrado:", r);
  },
  onRegisterError(error) {
    console.error("[SW] Falha ao registrar:", error);
  },
  onOfflineReady() {
    console.log("[SW] App pronto para uso offline.");
  },
  onNeedRefresh() {
    console.log("[SW] Nova versão disponível.");
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
