import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false,
    open: true,
    host: "0.0.0.0", // Allow access from network
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
