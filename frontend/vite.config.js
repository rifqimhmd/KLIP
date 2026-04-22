import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    react(),
    {
      name: "html-transform",
      transformIndexHtml(html) {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>Patnal Integrity Hub– Konsultasi Aman, Respons Tepat</title>`
        );
      },
    },
  ],
  server: {
    headers: {
      'Permissions-Policy': 'compute-pressure=()',
    },
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/storage": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
