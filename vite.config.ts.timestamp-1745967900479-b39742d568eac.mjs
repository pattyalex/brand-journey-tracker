// vite.config.ts
import { defineConfig } from "file:///home/runner/workspace/node_modules/vite/dist/node/index.js";
import react from "file:///home/runner/workspace/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/home/runner/workspace";
var vite_config_default = defineConfig(({ mode }) => ({
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
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
function componentTagger() {
  return {
    name: "dummy-component-tagger"
    // This is a dummy function to prevent build errors
    // while we install the actual package
  };
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ydW5uZXIvd29ya3NwYWNlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9ydW5uZXIvd29ya3NwYWNlL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3J1bm5lci93b3Jrc3BhY2Uvdml0ZS5jb25maWcudHNcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKVxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogJzAuMC4wLjAnLFxuICAgIHBvcnQ6IDgwODAsXG4gICAgaG1yOiB7XG4gICAgICAvLyBFbmFibGUgV2ViU29ja2V0IGNvbm5lY3Rpb24gb24gUmVwbGl0XG4gICAgICBjbGllbnRQb3J0OiA0NDMsXG4gICAgICBob3N0OiBwcm9jZXNzLmVudi5SRVBMX1NMVUcgPyBgJHtwcm9jZXNzLmVudi5SRVBMX1NMVUd9LiR7cHJvY2Vzcy5lbnYuUkVQTF9PV05FUn0ucmVwbC5jb2AgOiAnbG9jYWxob3N0J1xuICAgIH1cbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKVxuICAgIH1cbiAgfVxufSkpXG5cbmZ1bmN0aW9uIGNvbXBvbmVudFRhZ2dlcigpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnZHVtbXktY29tcG9uZW50LXRhZ2dlcicsXG4gICAgLy8gVGhpcyBpcyBhIGR1bW15IGZ1bmN0aW9uIHRvIHByZXZlbnQgYnVpbGQgZXJyb3JzXG4gICAgLy8gd2hpbGUgd2UgaW5zdGFsbCB0aGUgYWN0dWFsIHBhY2thZ2VcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQSxFQUM1QyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQTtBQUFBLE1BRUgsWUFBWTtBQUFBLE1BQ1osTUFBTSxRQUFRLElBQUksWUFBWSxHQUFHLFFBQVEsSUFBSSxTQUFTLElBQUksUUFBUSxJQUFJLFVBQVUsYUFBYTtBQUFBLElBQy9GO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7QUFFRixTQUFTLGtCQUFrQjtBQUN6QixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUE7QUFBQTtBQUFBLEVBR1I7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
