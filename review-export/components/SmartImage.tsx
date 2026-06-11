import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';

export interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading'> {
  src: string;
  alt: string;
  width: number;
  height: number;
  widths?: number[];
  sizes?: string;
  priority?: boolean;
  caption?: string;
  geoLocation?: string;
}

function buildSrcSet(src: string, widths: number[]): string {
  const extMatch = src.match(/\.(jpe?g|png|webp|avif)$/i);
  if (!extMatch) return '';
  const base = src.slice(0, -extMatch[0].length);
  const ext = extMatch[0];
  return widths.map((w) => `${base}-${w}w${ext} ${w}w`).join(', ');
}

function buildWebPSrcSet(src: string, widths: number[]): string {
  const extMatch = src.match(/\.(jpe?g|png|webp)$/i);
  if (!extMatch) return '';
  const base = src.slice(0, -extMatch[0].length);
  return widths.map((w) => `${base}-${w}w.webp ${w}w`).join(', ');
}

export default function SmartImage({
  src,
  alt,
  width,
  height,
  widths = [320, 640, 960, 1280, 1920],
  sizes = '(min-width: 1024px) 960px, 100vw',
  priority = false,
  caption,
  geoLocation,
  className = '',
  ...rest
}: SmartImageProps) {
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  if (!alt || !alt.trim()) {
    if (import.meta.env.DEV) {
      throw new Error(`SmartImage: alt is required. src=${src}`);
    }
  }

  useEffect(() => {
    if (priority || !imgRef.current) return;
    const el = imgRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setIsInView(true);
            obs.disconnect();
          }
        }
      },
      { rootMargin: '200px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [priority]);

  const aspectRatio = `${width} / ${height}`;
  const rasterSrcSet = isInView ? buildSrcSet(src, widths) : undefined;
  const webpSrcSet = isInView ? buildWebPSrcSet(src, widths) : undefined;

  const img = (
    <img
      ref={imgRef}
      src={isInView ? src : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      srcSet={rasterSrcSet || undefined}
      sizes={sizes}
      className={className}
      style={{ aspectRatio }}
      {...rest}
    />
  );

  const picture = (
    <picture>
      {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
      {img}
    </picture>
  );

  if (!caption && !geoLocation) return picture;

  return (
    <figure itemScope itemType="https://schema.org/ImageObject" className="inline-block">
      <meta itemProp="contentUrl" content={src} />
      <meta itemProp="width" content={String(width)} />
      <meta itemProp="height" content={String(height)} />
      {geoLocation && <meta itemProp="contentLocation" content={geoLocation} />}
      {picture}
      {caption && (
        <figcaption itemProp="caption" className="mt-2 text-sm text-navy-600">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
