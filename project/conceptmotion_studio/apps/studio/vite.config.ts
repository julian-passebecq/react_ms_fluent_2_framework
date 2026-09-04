import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  base: './',
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('monaco-editor')) return 'monaco';
          if (id.includes('@fluentui')) return 'fluent';
          return undefined;
        }
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true
  },
  preview: {
    host: '127.0.0.1',
    port: 4174,
    strictPort: true
  }
});
