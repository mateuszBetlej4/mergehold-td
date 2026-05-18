import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./app/App.css";

createRoot(document.querySelector<HTMLDivElement>("#app")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

