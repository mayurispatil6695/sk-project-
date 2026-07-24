import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// http://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
   VitePWA({
  registerType: "autoUpdate",

  includeAssets: ["favicon.ico", "apple-touch-icon.png"],

  manifest: {
    name: "SK Project",
    short_name: "SK",
    description: "Facility Management System",
    theme_color: "#1e293b",
    background_color: "#0f172a",
    display: "standalone",
    start_url: "/",
    icons: [],
  },

  workbox: {
    // Increase the precache limit from 2 MB to 10 MB
    maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,

    navigateFallback: "index.html",
    navigateFallbackDenylist: [/^\/api\//],

    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],

    runtimeCaching: [
      {
        urlPattern: /^https:\/\/sk-backend-btbj\.onrender\.com\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60,
          },
        },
      },
    ],
  },
})
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));