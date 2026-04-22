import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  build: {
    // Target modern browsers for smaller output
    target: "es2020",
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Increase source map threshold but keep warning for awareness
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor chunks for parallel download
        manualChunks: {
          // Heavy charting library (~200KB) — lazy-loaded with dashboard
          "vendor-recharts": ["recharts"],
          // Animation engine (~100KB) — needed for transitions
          "vendor-motion": ["framer-motion"],
          // Spreadsheet parser (~100KB) — only needed on file upload
          "vendor-xlsx": ["xlsx"],
          // CSV parser — only needed on file upload
          "vendor-papa": ["papaparse"],
          // React core — cached aggressively by browsers
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // UI primitives — loaded once, cached long-term
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-popover",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-toast",
          ],
          // State & data fetching
          "vendor-state": ["zustand", "@tanstack/react-query"],
        },
      },
    },
  },
}));
