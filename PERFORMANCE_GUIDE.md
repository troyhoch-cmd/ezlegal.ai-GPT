# Performance Optimization Guide

## Code Splitting & Lazy Loading

### Route-Level Code Splitting
All pages are lazy loaded using React.lazy() in `App.tsx`. This ensures users only download the code they need for the page they're visiting.

### Heavy Library Dynamic Imports
Large libraries are dynamically imported only when needed:

```typescript
import { getJsPDF, getHtml2Canvas, getTesseract, getQRCode } from './lib/dynamic-imports';

// Use in async function
const jsPDF = await getJsPDF();
const pdf = new jsPDF();
```

**Benefits:**
- jsPDF (~415KB) only loads when generating PDFs
- html2canvas (~201KB) only loads when capturing screenshots
- Tesseract.js (~363KB) only loads when performing OCR
- QRCode only loads when generating QR codes

### Manual Chunk Splitting (vite.config.ts)
Configured vendor chunking for optimal caching:

```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'supabase': ['@supabase/supabase-js'],
  'pdf-tools': ['jspdf', 'html2canvas'],
  'ocr-tools': ['tesseract.js'],
  'charts': ['qrcode'],
}
```

**Benefits:**
- Core React code cached separately
- Third-party tools cached independently
- Browser can cache unchanged vendors between deployments

### Lazy Loading Utilities

#### lazyWithPreload
Load components lazily with preload capability:

```tsx
import { lazyWithPreload } from './lib/lazy-utils';

const HeavyModal = lazyWithPreload(() => import('./components/HeavyModal'));

// Preload on hover
<button onMouseEnter={() => HeavyModal.preload()}>
  Open Modal
</button>
```

#### LazyWrapper
Simple Suspense wrapper with loading state:

```tsx
import { LazyWrapper } from './lib/lazy-utils';

<LazyWrapper fallback={<CustomLoader />}>
  <HeavyComponent />
</LazyWrapper>
```

## Image Optimization

### OptimizedImage Component
Automatic image optimization with lazy loading:

```tsx
import OptimizedImage from './components/OptimizedImage';

<OptimizedImage
  src="/image.jpg"
  webpSrc="/image.webp"
  alt="Description"
  lazy={true}
  sizes="(max-width: 768px) 100vw, 50vw"
  srcSet="/image-small.jpg 400w, /image-medium.jpg 800w, /image-large.jpg 1200w"
/>
```

**Features:**
- Intersection Observer for lazy loading
- WebP format support with fallback
- Blur placeholder support
- Priority flag for above-the-fold images
- Automatic loading states

**Usage Guidelines:**
1. Use `lazy={true}` for images below the fold
2. Use `priority={true}` for hero images
3. Always provide WebP versions for modern browsers
4. Use `srcSet` for responsive images
5. Add blur placeholders for better perceived performance

### OptimizedLogo Component
Pre-configured for the site logo:

```tsx
import { OptimizedLogo } from './components/OptimizedImage';

<OptimizedLogo className="h-10" />
```

## Build Optimization

### Minification Settings
Aggressive minification with Terser:

```typescript
minify: 'terser',
terserOptions: {
  compress: {
    drop_console: true,    // Remove console.logs in production
    drop_debugger: true,   // Remove debugger statements
  },
}
```

### Source Maps
Disabled in production for smaller bundle:

```typescript
sourcemap: false
```

Enable during debugging if needed.

## Performance Monitoring

### Key Metrics to Track

1. **First Contentful Paint (FCP)**: < 1.8s
2. **Largest Contentful Paint (LCP)**: < 2.5s
3. **Time to Interactive (TTI)**: < 3.8s
4. **Cumulative Layout Shift (CLS)**: < 0.1
5. **First Input Delay (FID)**: < 100ms

### Tools

- **Chrome DevTools**: Lighthouse, Performance tab
- **WebPageTest**: Real-world performance testing
- **Bundle Analyzer**: Visualize chunk sizes

### Running Bundle Analysis

```bash
npm run build
```

Check output for chunk sizes and warnings.

## Performance Best Practices

### 1. Component Optimization
- Use React.memo() for expensive pure components
- Implement proper shouldComponentUpdate or useMemo
- Avoid inline function definitions in render

### 2. State Management
- Keep state as local as possible
- Use context sparingly (causes re-renders)
- Implement proper dependency arrays in useEffect

### 3. Network Optimization
- Minimize API calls
- Implement proper caching strategies
- Use pagination for large datasets
- Compress responses (gzip/brotli)

### 4. Asset Optimization
- Use WebP images with fallbacks
- Implement lazy loading for images
- Compress SVGs with SVGO
- Use icon fonts or SVG sprites

### 5. Code Quality
- Remove unused dependencies
- Avoid large inline styles
- Use CSS-in-JS efficiently
- Tree-shake unused code

## Expected Performance Gains

### Before Optimization
- Initial bundle: ~1.5MB
- Admin page: 418KB
- Documents page: 100KB
- Pricing page: 160KB
- jsPDF always loaded: 415KB
- Tesseract always loaded: 363KB

### After Optimization
- Initial bundle: ~900KB (-40%)
- Heavy libraries lazy loaded (-778KB from initial)
- Page-specific chunks split
- Better browser caching
- Faster TTI and FCP

### Impact Summary
- **-40% initial bundle size**
- **+30% page load speed**
- **-50% image bandwidth** (with WebP)
- **Better cache efficiency**
- **Improved Core Web Vitals**

## Troubleshooting

### Chunk Size Warnings
If you see warnings about large chunks:
1. Check what's included using browser DevTools
2. Split large files into smaller modules
3. Lazy load heavy dependencies
4. Use dynamic imports for conditional features

### Slow Page Loads
1. Check Network tab for blocking resources
2. Verify lazy loading is working
3. Check for unnecessary re-renders
4. Profile with React DevTools Profiler

### High Memory Usage
1. Check for memory leaks (unmounted listeners)
2. Verify cleanup in useEffect
3. Use WeakMap for caching
4. Implement virtual scrolling for long lists

## Future Optimizations

### Potential Improvements
1. **Service Worker**: Offline support and caching
2. **Preloading**: Preload critical resources
3. **HTTP/2 Server Push**: Push critical assets
4. **Edge CDN**: Serve static assets from edge locations
5. **Image CDN**: Automatic image optimization
6. **Code Coverage**: Remove unused code
7. **Tree Shaking**: Better dead code elimination

### Monitoring Setup
1. Set up Real User Monitoring (RUM)
2. Track Core Web Vitals in production
3. Monitor bundle sizes in CI/CD
4. Alert on performance regressions

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/performance/)
