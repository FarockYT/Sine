import React from "react";
import ReactDOM from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import App from "./App";
import DownloadSite from "./DownloadSite";
import "./styles.css";

const params = new URLSearchParams(window.location.search);
const forceApp = params.get("app") === "1" || window.location.hash === "#app";
const showDownloadSite = !Capacitor.isNativePlatform() && !forceApp;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {showDownloadSite ? <DownloadSite /> : <App />}
  </React.StrictMode>
);
