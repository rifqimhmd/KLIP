import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

/** Runs before Vite's default proxy error handler so we return a clear 502 instead of an empty 500. */
function attachBackendUnreachableHelp(proxy, backendOrigin) {
  proxy.on("error", (err, _req, res) => {
    if (
      res &&
      typeof res.writeHead === "function" &&
      !res.headersSent &&
      !res.writableEnded
    ) {
      const msg =
        `Vite dev proxy: cannot reach Laravel at ${backendOrigin}.\r\n\r\n` +
        `Start the API (from repo root):\r\n` +
        `  cd backend\r\n` +
        `  php artisan serve\r\n\r\n` +
        `Or set VITE_BACKEND_URL in .env at the repo root (e.g. http://127.0.0.1:8000 or your Laragon URL), then restart Vite.\r\n\r\n` +
        `Underlying error: ${err.code ?? ""} ${err.message}`;
      res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(msg);
    }
  });
}

export default defineConfig(({ mode }) => {
  const frontendDir = fileURLToPath(new URL(".", import.meta.url));
  const repoRoot = fileURLToPath(new URL("..", import.meta.url));
  // Merge repo root + `frontend/` env files; `frontend/` wins on duplicate keys.
  const env = {
    ...loadEnv(mode, repoRoot, ""),
    ...loadEnv(mode, frontendDir, ""),
  };

  // `VITE_BACKEND_URL` = Laravel origin for the dev proxy (must match `php artisan serve` or Laragon).
  // Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) vs IPv4 bind mismatches on Windows.
  const backendOrigin = (env.VITE_BACKEND_URL || "http://127.0.0.1:8000").replace(
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
          configure(proxy) {
            attachBackendUnreachableHelp(proxy, backendOrigin);
          },
        },
        // Storage files (banner images, logos, etc)
        "/storage": {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
          configure(proxy) {
            attachBackendUnreachableHelp(proxy, backendOrigin);
          },
        },
      },
    },
  };
});
