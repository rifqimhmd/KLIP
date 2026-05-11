import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // `VITE_API_URL` is the frontend-facing base (usually `/api` to use Vite proxy).
  // `VITE_BACKEND_URL` is the backend origin for proxying (e.g. `http://localhost:8000`).
  const backendOrigin = (env.VITE_BACKEND_URL || "http://localhost:8000").replace(
    /\/$/,
    ""
  );

  return {
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
            `<title>Patnal Integrity Hubâ€“ Konsultasi Aman, Respons Tepat</title>`
          );
        },
      },
    ],
    server: {
      headers: {
        "Permissions-Policy": "compute-pressure=()",
      },
      proxy: {
        // API routes (Laravel `routes/api.php` -> `/api/*`)
        "/api": {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
        // Storage files (banner images, logos, etc)
        "/storage": {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
