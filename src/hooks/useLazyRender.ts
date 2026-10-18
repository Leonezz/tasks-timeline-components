import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface UseLazyRenderOptions {
  /**
   * CSS rootMargin for the IntersectionObserver, applied around the nearest
   * scroll container (default: "500px 0px"). Values must use px or %.
   */
  rootMargin?: string;
  /** Whether lazy rendering is enabled (default: true) */
  enabled?: boolean;
  /**
   * Re-checks the position before paint whenever this value changes, e.g.
   * when an ancestor stops being hidden (an observer would only report it a
   * frame later, after a placeholder was painted).
   */
  revalidateOn?: unknown;
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
const SCROLLABLE_OVERFLOW = /^(auto|scroll|overlay)$/;

/**
 * The nearest ancestor that scrolls, crossing shadow roots; null when the
 * page itself scrolls. Hosts such as Obsidian scroll the timeline inside
 * their own element, where an observer rooted at the viewport cannot apply
 * its margin (the scroller clips the targets first).
 */
export const findScrollRoot = (element: Element): Element | null => {
  let node: Node | null = element.parentNode;
  while (node) {
    if (node instanceof ShadowRoot) {
      node = node.host;
      continue;
    }
    if (node === document.body || node === document.documentElement) {
      return null;
    }
    if (
      node instanceof Element &&
      SCROLLABLE_OVERFLOW.test(getComputedStyle(node).overflowY)
    ) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
};

const toPx = (value: string, rootHeight: number, rootMargin: string) => {
  const match = /^(-?\d*\.?\d+)(px|%)$/.exec(value);
  if (!match) {
    throw new Error(
      `useLazyRender: rootMargin "${rootMargin}" must use px or % values`,
    );
  }
  const amount = Number(match[1]);
  return match[2] === "px" ? amount : (amount / 100) * rootHeight;
};

/** Top and bottom margins in px, per the CSS margin shorthand. */
export const parseVerticalMargins = (
  rootMargin: string,
  rootHeight: number,
): { top: number; bottom: number } => {
  const parts = rootMargin.trim().split(/\s+/);
  if (parts.length === 0 || parts.length > 4 || parts[0] === "") {
    throw new Error(
      `useLazyRender: rootMargin "${rootMargin}" needs 1 to 4 values`,
    );
  }
  const top = parts[0],
    bottom = parts[2] ?? top;
  return {
    top: toPx(top, rootHeight, rootMargin),
    bottom: toPx(bottom, rootHeight, rootMargin),
  };
};

const isWithinMargin = (
  element: Element,
  root: Element | null,
  rootMargin: string,
): boolean => {
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return false; // hidden (display: none)
  }
  const bounds = root
      ? root.getBoundingClientRect()
      : { top: 0, bottom: window.innerHeight },
    margins = parseVerticalMargins(rootMargin, bounds.bottom - bounds.top);
  return (
    rect.bottom >= bounds.top - margins.top &&
    rect.top <= bounds.bottom + margins.bottom
  );
};

interface MeasuredHeight {
  itemCount: number;
  height: number;
}

/**
 * Lazily renders content only while it is near the visible part of its
 * scroll container. Returns a placeholder height to prevent scroll jumps
 * while content is not rendered.
 *
 * - The first decision is made before paint, so content that is already
 *   near the viewport never shows a placeholder frame.
 * - Hidden content (display: none, e.g. the timeline in focus mode) keeps
 *   its current state instead of unmounting and caching a 0 height.
 * - A measured height is reused only for the same item count.
 */
export function useLazyRender(
  itemCount: number,
  options: UseLazyRenderOptions = {},
): UseLazyRenderResult {
  const { rootMargin = "500px 0px", enabled = true, revalidateOn } = options,
    [isNearViewport, setIsNearViewport] = useState(!enabled),
    [measured, setMeasured] = useState<MeasuredHeight | null>(null),
    containerElRef = useRef<HTMLDivElement | null>(null),
    contentElRef = useRef<HTMLDivElement | null>(null),
    itemCountRef = useRef(itemCount);

  useLayoutEffect(() => {
    itemCountRef.current = itemCount;
  }, [itemCount]);

  // Cache content height before it unmounts
  const cacheHeight = useCallback(() => {
    const height = contentElRef.current?.offsetHeight ?? 0;
    if (height > 0) {
      setMeasured({ itemCount: itemCountRef.current, height });
    }
  }, []);

  useEffect(() => {
    const element = containerElRef.current;
    if (!enabled || !element) {
      return;
    }
    const root = findScrollRoot(element),
      observer = new IntersectionObserver(
        ([entry]) => {
          const { width, height } = entry.boundingClientRect;
          if (width === 0 && height === 0) {
            return; // hidden: keep the current state
          }
          // An ancestor clipping the target (a section animating open) is not
          // distance from the viewport: only geometry decides unmounting.
          const isNear =
            entry.isIntersecting || isWithinMargin(element, root, rootMargin);
          if (!isNear) {
            cacheHeight();
          }
          setIsNearViewport(isNear);
        },
        { root, rootMargin },
      );
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, rootMargin, cacheHeight]);

  // Ref callbacks for stable element tracking. The container's also decides
  // the first state: refs attach during commit, so content that is already
  // near the viewport renders before the browser paints a placeholder. A new
  // `revalidateOn` value re-attaches it, which checks again.
  const containerRef = useCallback(
      (node: HTMLDivElement | null) => {
        containerElRef.current = node;
        if (
          node &&
          enabled &&
          isWithinMargin(node, findScrollRoot(node), rootMargin)
        ) {
          setIsNearViewport(true);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps -- revalidateOn only re-runs the check
      [enabled, rootMargin, revalidateOn],
    ),
    contentRef = useCallback((node: HTMLDivElement | null) => {
      contentElRef.current = node;
    }, []);

  return {
    containerRef,
    contentRef,
    isNearViewport,
    placeholderHeight:
      measured?.itemCount === itemCount
        ? measured.height
        : itemCount * ESTIMATED_ITEM_HEIGHT,
  };
}
