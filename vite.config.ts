
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg","robots.txt","apple-touch-icon.png"],
      manifest: {
        name: "Desafio do Saber – IFES & ENEM",
        short_name: "Desafio do Saber",
        description: "Jogo de perguntas e respostas com medalhas, ranking e importação.",
        theme_color: "#0ea5e9",
        background_color: "#0b1023",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg}"] }
    })
  ]
});
