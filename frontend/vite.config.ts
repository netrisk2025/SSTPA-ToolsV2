import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendProxyTarget =
  process.env.SSTPA_DEV_PROXY_TARGET ??
  process.env.SSTPA_BACKEND_URL ??
  "https://localhost";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Browser development: proxy API calls to the local Caddy edge so the
    // dev origin (http://localhost:5173) avoids CORS/self-signed-cert
    // friction. Run with `npm run dev` and open with ?backend= empty; the
    // client falls back to same-origin /api through this proxy when the
    // page is served by Vite (see src/api/client.ts).
    proxy: {
      "/api": {
        target: backendProxyTarget,
        changeOrigin: true,
        secure: false, // Caddy internal CA
      },
    },
  },
});
