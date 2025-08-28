import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0", // expose to network
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "4805b6cf3d09.ngrok-free.app", // 👈 add your ngrok domain
    ],
  },
  plugins: [react()],
  base: "./",
});
