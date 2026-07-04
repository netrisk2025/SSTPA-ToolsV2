// SSTPA Tools Frontend entry point.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/sstpa-default.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
