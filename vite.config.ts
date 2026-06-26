import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["app-icon.svg", "assets/ai-companion.png"],
      manifest: {
        name: "Sine Inverse",
        short_name: "Sine",
        description: "AI focus blocks, app shield, alarms, limits, and PC-phone sync.",
        theme_color: "#f7f3ea",
        background_color: "#f7f3ea",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "/app-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webp,ico}"]
      }
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
