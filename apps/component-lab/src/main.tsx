import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@personal-ui/ui";
import "@personal-ui/ui/styles.css";
import "./lab.css";
import { App } from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found.");

createRoot(container).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="personal-ui-lab-theme">
      <App />
    </ThemeProvider>
  </StrictMode>,
);
