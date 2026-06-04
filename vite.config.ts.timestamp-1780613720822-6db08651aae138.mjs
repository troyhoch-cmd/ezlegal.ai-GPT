// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  test: {
    include: ["tests/**/*.spec.ts", "!tests/e2e/**", "!tests/a11y.spec.ts", "!tests/launch.smoke.spec.ts", "!tests/ai-legal-safety.spec.ts"],
    exclude: ["tests/e2e/**"]
  },
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    minify: "esbuild",
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return void 0;
          if (id.includes("react-router")) return "react-router";
          if (id.includes("react-dom") || /node_modules\/react\//.test(id)) return "react-vendor";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("pdfjs-dist")) return "pdfjs";
          if (id.includes("jspdf")) return "jspdf";
          if (id.includes("html2canvas")) return "html2canvas";
          if (id.includes("tesseract.js")) return "ocr-tools";
          if (id.includes("qrcode")) return "qr";
          return "vendor";
        }
      }
    }
  },
  server: {
    open: false,
    fs: {
      strict: true
    },
    watch: {
      ignored: ["**/.git/**", "**/node_modules/**", "**/dist/**"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgdGVzdDoge1xuICAgIGluY2x1ZGU6IFsndGVzdHMvKiovKi5zcGVjLnRzJywgJyF0ZXN0cy9lMmUvKionLCAnIXRlc3RzL2ExMXkuc3BlYy50cycsICchdGVzdHMvbGF1bmNoLnNtb2tlLnNwZWMudHMnLCAnIXRlc3RzL2FpLWxlZ2FsLXNhZmV0eS5zcGVjLnRzJ10sXG4gICAgZXhjbHVkZTogWyd0ZXN0cy9lMmUvKionXSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlczIwMjAnLFxuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNzAwLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcbiAgICAgICAgICBpZiAoIWlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlYWN0LXJvdXRlcicpKSByZXR1cm4gJ3JlYWN0LXJvdXRlcic7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyZWFjdC1kb20nKSB8fCAvbm9kZV9tb2R1bGVzXFwvcmVhY3RcXC8vLnRlc3QoaWQpKSByZXR1cm4gJ3JlYWN0LXZlbmRvcic7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAc3VwYWJhc2UnKSkgcmV0dXJuICdzdXBhYmFzZSc7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdsdWNpZGUtcmVhY3QnKSkgcmV0dXJuICdpY29ucyc7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdwZGZqcy1kaXN0JykpIHJldHVybiAncGRmanMnO1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnanNwZGYnKSkgcmV0dXJuICdqc3BkZic7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdodG1sMmNhbnZhcycpKSByZXR1cm4gJ2h0bWwyY2FudmFzJztcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3Rlc3NlcmFjdC5qcycpKSByZXR1cm4gJ29jci10b29scyc7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdxcmNvZGUnKSkgcmV0dXJuICdxcic7XG4gICAgICAgICAgcmV0dXJuICd2ZW5kb3InO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBvcGVuOiBmYWxzZSxcbiAgICBmczoge1xuICAgICAgc3RyaWN0OiB0cnVlLFxuICAgIH0sXG4gICAgd2F0Y2g6IHtcbiAgICAgIGlnbm9yZWQ6IFsnKiovLmdpdC8qKicsICcqKi9ub2RlX21vZHVsZXMvKionLCAnKiovZGlzdC8qKiddLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixNQUFNO0FBQUEsSUFDSixTQUFTLENBQUMsc0JBQXNCLGlCQUFpQix1QkFBdUIsK0JBQStCLGdDQUFnQztBQUFBLElBQ3ZJLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLGNBQWM7QUFBQSxJQUNkLFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLHVCQUF1QjtBQUFBLElBQ3ZCLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGFBQWEsSUFBSTtBQUNmLGNBQUksQ0FBQyxHQUFHLFNBQVMsY0FBYyxFQUFHLFFBQU87QUFDekMsY0FBSSxHQUFHLFNBQVMsY0FBYyxFQUFHLFFBQU87QUFDeEMsY0FBSSxHQUFHLFNBQVMsV0FBVyxLQUFLLHdCQUF3QixLQUFLLEVBQUUsRUFBRyxRQUFPO0FBQ3pFLGNBQUksR0FBRyxTQUFTLFdBQVcsRUFBRyxRQUFPO0FBQ3JDLGNBQUksR0FBRyxTQUFTLGNBQWMsRUFBRyxRQUFPO0FBQ3hDLGNBQUksR0FBRyxTQUFTLFlBQVksRUFBRyxRQUFPO0FBQ3RDLGNBQUksR0FBRyxTQUFTLE9BQU8sRUFBRyxRQUFPO0FBQ2pDLGNBQUksR0FBRyxTQUFTLGFBQWEsRUFBRyxRQUFPO0FBQ3ZDLGNBQUksR0FBRyxTQUFTLGNBQWMsRUFBRyxRQUFPO0FBQ3hDLGNBQUksR0FBRyxTQUFTLFFBQVEsRUFBRyxRQUFPO0FBQ2xDLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sSUFBSTtBQUFBLE1BQ0YsUUFBUTtBQUFBLElBQ1Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFNBQVMsQ0FBQyxjQUFjLHNCQUFzQixZQUFZO0FBQUEsSUFDNUQ7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
