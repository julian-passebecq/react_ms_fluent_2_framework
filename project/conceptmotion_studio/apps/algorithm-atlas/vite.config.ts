import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({ root: fileURLToPath(new URL('.', import.meta.url)), plugins: [react()], base: './', resolve: { dedupe: ['react', 'react-dom'] }, build: { outDir: '../../dist-algorithm-atlas', emptyOutDir: true, manifest: true, sourcemap: true, target: 'es2022', rollupOptions: { output: { manualChunks: id => id.includes('@fluentui') ? 'fluent' : undefined } } }, server: { host: '127.0.0.1', port: 4178, strictPort: true } });
