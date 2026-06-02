import { ReactNode, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export interface PaginatedListProps<T> {
  label: string;
  items: T[];
  initialVisible?: number;
  pageSize?: number;
  renderItem: (item: T, index: number) => ReactNode;
  keyFor: (item: T, index: number) => string;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void | Promise<void>;
  totalCount?: number;
  emptyState?: ReactNode;
}

export default function PaginatedList<T>({
  label,
  items,
  initialVisible,
  pageSize = 12,
  renderItem,
  keyFor,
  loading = false,
  hasMore,
  onLoadMore,
  totalCount,
  emptyState,
}: PaginatedListProps<T>) {
  const isServerPaginated = typeof onLoadMore === 'function';
  const [clientVisible, setClientVisible] = useState(initialVisible ?? pageSize);
  const announceRef = useRef<HTMLDivElement>(null);
  const lastAnnouncedCount = useRef(0);

  const visibleItems = isServerPaginated ? items : items.slice(0, clientVisible);
  const remaining = isServerPaginated
    ? hasMore === false
      ? 0
      : typeof totalCount === 'number'
      ? Math.max(0, totalCount - items.length)
      : Infinity
    : items.length - clientVisible;

  const canLoadMore = isServerPaginated ? (hasMore !== false) : remaining > 0;

  useEffect(() => {
    if (!announceRef.current) return;
    if (visibleItems.length === lastAnnouncedCount.current) return;
    const delta = visibleItems.length - lastAnnouncedCount.current;
    if (delta > 0 && lastAnnouncedCount.current > 0) {
      announceRef.current.textContent = `${delta} more result${delta === 1 ? '' : 's'} loaded. ${visibleItems.length} total.`;
    }
    lastAnnouncedCount.current = visibleItems.length;
  }, [visibleItems.length]);

  const loadMore = async () => {
    if (loading || !canLoadMore) return;
    if (isServerPaginated) {
      await onLoadMore?.();
    } else {
      setClientVisible((v) => Math.min(v + pageSize, items.length));
    }
  };

  if (!loading && visibleItems.length === 0) {
    return <>{emptyState ?? <p className="text-navy-500 text-sm">No results yet.</p>}</>;
  }

  return (
    <section aria-label={label} className="space-y-4">
      <div ref={announceRef} role="status" aria-live="polite" className="sr-only" />

      <ul className="space-y-3" role="list">
        {visibleItems.map((item, i) => (
          <li key={keyFor(item, i)}>{renderItem(item, i)}</li>
        ))}
      </ul>

      <div className="flex flex-col items-center gap-2 py-4">
        <p className="text-xs text-navy-500" aria-live="polite">
          Showing {visibleItems.length}
          {typeof totalCount === 'number' ? ` of ${totalCount}` : ''} result{visibleItems.length === 1 ? '' : 's'}.
        </p>
        {canLoadMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:bg-navy-300 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Loading…
              </>
            ) : (
              <>
                Load more
                {!isServerPaginated && remaining !== Infinity && (
                  <span className="text-sm opacity-80"> ({remaining} more)</span>
                )}
              </>
            )}
          </button>
        )}
        {!canLoadMore && visibleItems.length > 0 && (
          <p className="text-xs text-navy-400">You've reached the end of the list.</p>
        )}
      </div>
    </section>
  );
}
