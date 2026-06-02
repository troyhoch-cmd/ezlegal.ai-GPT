# Performance Quick Start Guide

Quick reference for implementing performance optimizations in new code.

## 1. Lazy Load Heavy Libraries

### When to Use
Use dynamic imports for libraries >50KB that aren't needed on initial page load.

### Example: PDF Generation

**❌ Don't do this:**
```typescript
import jsPDF from 'jspdf';

function generatePDF() {
  const pdf = new jsPDF();
  // ...
}
```

**✅ Do this instead:**
```typescript
import { getJsPDF } from '../lib/dynamic-imports';

async function generatePDF() {
  const jsPDF = await getJsPDF();
  const pdf = new jsPDF();
  // ...
}
```

### Available Dynamic Imports
```typescript
import {
  getJsPDF,        // For PDF generation
  getHtml2Canvas,  // For screenshots
  getTesseract,    // For OCR
  getQRCode        // For QR codes
} from '../lib/dynamic-imports';
```

## 2. Lazy Load Components

### When to Use
Use for modals, drawers, or heavy components not visible on initial render.

### Example: Modal Component

**❌ Don't do this:**
```typescript
import HeavyModal from './HeavyModal';

function MyPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <HeavyModal />}
    </>
  );
}
```

**✅ Do this instead:**
```typescript
import { lazyWithPreload } from '../lib/lazy-utils';

const HeavyModal = lazyWithPreload(() => import('./HeavyModal'));

function MyPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => HeavyModal.preload()}
      >
        Open
      </button>
      {open && (
        <Suspense fallback={<Loader />}>
          <HeavyModal />
        </Suspense>
      )}
    </>
  );
}
```

## 3. Optimize Images

### When to Use
Always use OptimizedImage for content images.

### Example: Hero Image

**❌ Don't do this:**
```tsx
<img
  src="/hero.jpg"
  alt="Hero image"
  className="w-full h-64 object-cover"
/>
```

**✅ Do this instead:**
```tsx
import OptimizedImage from '../components/OptimizedImage';

<OptimizedImage
  src="/hero.jpg"
  webpSrc="/hero.webp"
  alt="Hero image"
  priority={true}
  lazy={false}
  className="w-full h-64 object-cover"
  sizes="100vw"
  srcSet="/hero-small.jpg 640w, /hero-medium.jpg 1024w, /hero-large.jpg 1920w"
/>
```

### Below-the-Fold Images
```tsx
<OptimizedImage
  src="/image.jpg"
  webpSrc="/image.webp"
  alt="Content image"
  lazy={true}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

## 4. Add Loading States

### When to Use
Always show loading states for async operations.

### Example: Async Button

**❌ Don't do this:**
```tsx
<button onClick={handleSubmit}>
  Submit
</button>
```

**✅ Do this instead:**
```tsx
import AccessibleButton from '../components/AccessibleButton';

<AccessibleButton
  onClick={handleSubmit}
  loading={isLoading}
  ariaLabel="Submit form"
>
  Submit
</AccessibleButton>
```

## 5. Chunk Large Pages

### When to Use
If a page bundle is >100KB, split it into smaller chunks.

### Example: Split Dashboard Sections

**❌ Don't do this:**
```typescript
// All in Dashboard.tsx (200KB)
import StatsSection from './StatsSection';
import ChartsSection from './ChartsSection';
import TableSection from './TableSection';

function Dashboard() {
  return (
    <>
      <StatsSection />
      <ChartsSection />
      <TableSection />
    </>
  );
}
```

**✅ Do this instead:**
```typescript
// Dashboard.tsx (50KB + lazy loaded sections)
import { lazy, Suspense } from 'react';

const StatsSection = lazy(() => import('./StatsSection'));
const ChartsSection = lazy(() => import('./ChartsSection'));
const TableSection = lazy(() => import('./TableSection'));

function Dashboard() {
  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <ChartsSection />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <TableSection />
      </Suspense>
    </>
  );
}
```

## 6. Implement Skeleton Screens

### When to Use
Use for async content that takes >100ms to load.

### Example: Loading State

**❌ Don't do this:**
```tsx
{loading ? <div>Loading...</div> : <Content />}
```

**✅ Do this instead:**
```tsx
{loading ? (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
) : (
  <Content />
)}
```

## 7. Optimize Re-renders

### When to Use
Use memo for expensive pure components.

### Example: Expensive List Item

**❌ Don't do this:**
```tsx
function ListItem({ item, onUpdate }) {
  // Expensive computation
  const processedData = expensiveProcess(item);

  return <div>{processedData}</div>;
}
```

**✅ Do this instead:**
```tsx
import { memo, useMemo } from 'react';

const ListItem = memo(function ListItem({ item, onUpdate }) {
  const processedData = useMemo(
    () => expensiveProcess(item),
    [item]
  );

  return <div>{processedData}</div>;
});
```

## 8. Debounce User Input

### When to Use
Use for search inputs, autocomplete, etc.

### Example: Search Input

**❌ Don't do this:**
```tsx
<input
  onChange={(e) => performSearch(e.target.value)}
  placeholder="Search..."
/>
```

**✅ Do this instead:**
```tsx
import { useState, useEffect } from 'react';

const [query, setQuery] = useState('');
const [debouncedQuery, setDebouncedQuery] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(query);
  }, 300);

  return () => clearTimeout(timer);
}, [query]);

useEffect(() => {
  if (debouncedQuery) {
    performSearch(debouncedQuery);
  }
}, [debouncedQuery]);

<input
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder="Search..."
/>
```

## 9. Virtualize Long Lists

### When to Use
Use for lists with >50 items.

### Example: Long List
For future implementation, consider using:
- `react-window` for fixed-size lists
- `react-virtual` for variable-size lists

## 10. Monitor Performance

### In Development
```typescript
// Add to useEffect
useEffect(() => {
  const start = performance.now();

  // Your code here

  const end = performance.now();
  console.log(`Execution time: ${end - start}ms`);
}, []);
```

### In Production
Use browser performance APIs:
```typescript
// Mark important events
performance.mark('feature-start');
// ... do work
performance.mark('feature-end');
performance.measure('feature', 'feature-start', 'feature-end');
```

## Quick Checklist

When adding new features:

- [ ] Heavy libraries (>50KB) dynamically imported?
- [ ] Images using OptimizedImage with lazy loading?
- [ ] Components >20KB lazy loaded?
- [ ] Loading states implemented?
- [ ] List items memoized if >10 items?
- [ ] User input debounced if triggering API calls?
- [ ] Build size checked after changes?
- [ ] Lighthouse audit run?

## Performance Targets

Aim for:
- Initial bundle: <1MB
- Route chunks: <100KB each
- Images: WebP with fallback
- TTI: <3s on 3G
- FCP: <1.8s

## Resources

- Full guide: [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md)
- Improvements: [PERFORMANCE_IMPROVEMENTS.md](./PERFORMANCE_IMPROVEMENTS.md)
- Mobile/A11y: [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md)
