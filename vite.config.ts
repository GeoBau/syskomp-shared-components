import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/sb50-standalone.tsx'),
      name: 'SB50',
      fileName: 'sb50-cad-button',
      formats: ['iife'] // Self-executing bundle for direct inclusion in HTML
    },
    rollupOptions: {
      output: {
        // Bundle everything including React
        inlineDynamicImports: true,
      }
    }
  }
});
