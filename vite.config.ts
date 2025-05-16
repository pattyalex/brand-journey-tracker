
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5000'),
    strictPort: false,
    hmr: {
      clientPort: 443,
      host: process.env.REPL_SLUG ? `${process.env.REPL_OWNER}.replit.dev` : undefined,
      protocol: 'wss'
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['date-fns'] // Exclude date-fns from dependency optimization
  },
  // Add file system watcher options to reduce the number of watched files
  fs: {
    strict: false,
    // Exclude node_modules and large directories from being watched
    allow: ['.'],
    ignore: ['**/node_modules/.cache/**', '**/dist/**', '**/.git/**']
  }
})
