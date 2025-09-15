import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Masquer les warnings React en production
if (import.meta.env.PROD) {
  console.warn = () => {};
  console.error = (msg) => {
    // Garder les vraies erreurs mais masquer les warnings React
    if (!msg.includes('Warning:') && !msg.includes('Encountered two children')) {
      console.error(msg);
    }
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
