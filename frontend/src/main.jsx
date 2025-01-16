import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./context/user.context";
import "remixicon/fonts/remixicon.css";
import hljs from "highlight.js";
window.hljs = hljs; // Make hljs available globally if needed

createRoot(document.getElementById("root")).render(
  <UserProvider>
    <App />
  </UserProvider>
);
