import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    middleware: [
      (req, res, next) => {
        // If the request is for a static file that exists, serve it
        const filePath = path.join(__dirname, 'dist', req.url);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          return next();
        }
        // Otherwise, serve index.html for client-side routing
        req.url = '/index.html';
        next();
      },
    ],
    historyApiFallback: {
      disableDotRule: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@db': path.resolve(__dirname, './src/db'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', 'framer-motion', 'lucide-react'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['./src/**/*.{test,spec}.js'],
    exclude: ['./e2e/**/*', './node_modules/**/*'],
  },
});
