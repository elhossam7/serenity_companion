import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
  },
  plugins: [tsconfigPaths(), react(), mode === 'development' ? tagger() : undefined].filter(Boolean),
  server: {
  // Use a fixed port if available; fallback automatically if in use
  port: 4028,
  host: "0.0.0.0",
  strictPort: false,
  // If you need to expose the dev server behind a reverse proxy, add allowed hosts here.
  // allowedHosts: ['your-domain.com']
  }
  ,
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)']
  }
}));