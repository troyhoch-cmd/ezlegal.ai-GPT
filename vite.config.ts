import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-router')) return 'react-router';
          if (id.includes('react-dom') || /node_modules\/react\//.test(id)) return 'react-vendor';
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('pdfjs-dist')) return 'pdfjs';
          if (id.includes('jspdf')) return 'jspdf';
          if (id.includes('html2canvas')) return 'html2canvas';
          if (id.includes('tesseract.js')) return 'ocr-tools';
          if (id.includes('qrcode')) return 'qr';
          return 'vendor';
        },
      },
    },
  },
  server: {
    open: false,
    fs: {
      strict: true,
    },
    watch: {
      ignored: ['**/.git/**', '**/node_modules/**', '**/dist/**'],
    },
  },
});
