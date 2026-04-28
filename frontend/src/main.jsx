import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ToastProvider } from "./components/Toast";

console.log('React app starting...');
ReactDOM.createRoot(document.getElementById("root")).render(
  <ToastProvider>
    <App />
  </ToastProvider>
);
console.log('React app rendered.');
