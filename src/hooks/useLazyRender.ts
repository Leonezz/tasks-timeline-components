import { useEffect, useRef, useState, useCallback } from "react";

interface UseLazyRenderOptions {
  /** CSS rootMargin for IntersectionObserver (default: "500px 0px") */
  rootMargin?: string;
  /** Whether lazy rendering is enabled (default: true) */
  enabled?: boolean;
}

interface UseLazyRenderResult {
  /** Attach to the outer container that the observer watches */
  containerRef: React.RefCallback<HTMLDivElement>;
  /** Attach to the inner content wrapper to measure its height */
  contentRef: React.RefCallback<HTMLDivElement>;
  /** Whether the section is near the viewport and should render content */
  isNearViewport: boolean;
  /** Height for the placeholder when content is not rendered */
  placeholderHeight: number;
}

const ESTIMATED_ITEM_HEIGHT = 52;

/**
 * Hook that uses IntersectionObserver to lazily render content
 * only when it's near the viewport. Returns a placeholder height
 * to prevent scroll jumps when content unmounts.
 */
export function useLazyRender(
  itemCount: number,
  options: UseLazyRenderOptions = {},
): UseLazyRenderResult {
  const { rootMargin = "500px 0px", enabled = true } = options,
    [isNearViewport, setIsNearViewport] = useState(!enabled),
    [measuredHeight, setMeasuredHeight] = useState<number | null>(null),
    containerElRef = useRef<HTMLDivElement | null>(null),
    contentElRef = useRef<HTMLDivElement | null>(null),
    observerRef = useRef<IntersectionObserver | null>(null);

  // Estimated height based on item count
  const estimatedHeight = itemCount * ESTIMATED_ITEM_HEIGHT;

  // Cache content height before it unmounts
  const cacheHeight = useCallback(() => {
    if (contentElRef.current) {
      setMeasuredHeight(contentElRef.current.offsetHeight);
    }
  }, []);

  // Set up IntersectionObserver
  useEffect(() => {
    if (!enabled) return;

    const el = containerElRef.current;
    if (!el) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isNear = entry.isIntersecting;
        if (!isNear) {
          cacheHeight();
        }
        setIsNearViewport(isNear);
      },
      { rootMargin },
    );

    observerRef.current.observe(el);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enabled, rootMargin, cacheHeight]);

  // Ref callbacks for stable element tracking
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    containerElRef.current = node;
  }, []);

  const contentRef = useCallback((node: HTMLDivElement | null) => {
    contentElRef.current = node;
  }, []);

  return {
    containerRef,
    contentRef,
    isNearViewport,
    placeholderHeight: measuredHeight ?? estimatedHeight,
  };
}
