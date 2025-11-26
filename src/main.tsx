import { createRoot } from "react-dom/client";
// @ts-ignore: side-effect import of CSS without type declaration
import "../styles/globals.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
