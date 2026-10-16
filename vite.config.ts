import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/**/*.spec.ts', '!tests/e2e/**', '!tests/a11y.spec.ts', '!tests/launch.smoke.spec.ts', '!tests/ai-legal-safety.spec.ts'],
    exclude: ['tests/e2e/**'],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 700,
    // Let Rollup group dependencies from the actual import graph. Grouping all
    // remaining packages into "vendor" created a vendor <-> OCR cycle whose
    // CommonJS initialization crashed before React could render the homepage.
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
