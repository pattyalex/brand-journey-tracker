
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      // Enable WebSocket connection on Replit
      clientPort: 443,
      host: process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : "localhost"
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
}));

// This is a placeholder for the componentTagger function
// You may need to implement this or remove it if it doesn't exist in your original code
function componentTagger() {
  return {
    name: 'component-tagger',
    // Plugin implementation would go here
  };
}
