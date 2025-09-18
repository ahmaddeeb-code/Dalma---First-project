import { createRoot, type Root } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Root container #root not found");

declare global {
  interface Window {
    __DALMA_APP_ROOT__?: Root;
  }
}

const existing = window.__DALMA_APP_ROOT__;
if (existing) {
  existing.render(<App />);
} else {
  const root = createRoot(container);
  window.__DALMA_APP_ROOT__ = root;
  root.render(<App />);
}
