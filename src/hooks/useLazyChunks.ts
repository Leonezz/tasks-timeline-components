import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { findScrollRoot, parseVerticalMargins } from "./useLazyRender";
import {
  EMPTY_CHUNK_STATE,
  chunkNearness,
  nextChunkState,
  placeholderHeightFor,
} from "./lazy-chunks";

interface UseLazyChunksOptions {
  /** Whether lazy rendering is enabled (default: true) */
  enabled?: boolean;
  /** Margin around the scroll container, in px or % (default: "500px 0px") */
  rootMargin?: string;
}

interface UseLazyChunksResult {
  /** Whether chunk `index` should mount its rows */
  isNear: (index: number) => boolean;
  /**
   * Ref for chunk `index`'s start marker; `chunkCount` is the end marker.
   * A far chunk's marker is its placeholder.
   */
  markerRef: (index: number) => React.RefCallback<HTMLDivElement>;
  /** Height for chunk `index`'s placeholder */
  placeholderHeight: (index: number) => number;
}

/** How much further out a mounted chunk may go before it unmounts (px). */
const KEEP_NEAR_SLACK = 100;

const chunkSizesOf = (itemCount: number, chunkSize: number) =>
  Array.from({ length: Math.ceil(itemCount / chunkSize) }, (_, i) =>
    Math.min(chunkSize, itemCount - i * chunkSize),
  );

/**
 * Lazily mounts the rows of a long list in chunks, without wrapping them:
 * each chunk is marked by one element before its rows, so the rows stay
 * siblings of one parent and keep their state when they move between chunks.
 * Chunk i spans from its marker to the next one; it mounts while that span
 * is near the visible part of the scroll container.
 *
 * - Checks run before paint after every commit, so rows already near the
 *   viewport never show a placeholder frame.
 * - An observer on the markers catches scrolling and layout changes; any
 *   marker crossing the margin re-checks every chunk.
 * - Hidden lists (display: none) keep their state.
 */
export function useLazyChunks(
  itemCount: number,
  chunkSize: number,
  options: UseLazyChunksOptions = {},
): UseLazyChunksResult {
  const { enabled = true, rootMargin = "500px 0px" } = options,
    chunkCount = Math.ceil(itemCount / chunkSize),
    [state, setState] = useState(EMPTY_CHUNK_STATE),
    markers = useRef<(HTMLDivElement | null)[]>([]),
    // undefined until found; null when the page itself scrolls
    scrollRoot = useRef<Element | null | undefined>(undefined);

  const revalidate = useCallback(() => {
    const elements = markers.current.slice(0, chunkCount + 1);
    if (!enabled || chunkCount === 0 || elements.some((el) => !el)) {
      return;
    }
    const rects = elements.map((el) => el!.getBoundingClientRect());
    if (rects[0].width === 0 && rects[0].height === 0) {
      return; // hidden: keep the current state
    }
    if (scrollRoot.current === undefined) {
      scrollRoot.current = findScrollRoot(elements[0]!);
    }
    const root = scrollRoot.current,
      bounds = root
        ? root.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight },
      margins = parseVerticalMargins(rootMargin, bounds.bottom - bounds.top),
      tops = rects.map((rect) => rect.top),
      sizes = chunkSizesOf(itemCount, chunkSize);
    setState((prev) =>
      nextChunkState(
        prev,
        chunkNearness(tops, bounds, margins, prev.near, KEEP_NEAR_SLACK),
        tops,
        sizes,
      ),
    );
  }, [enabled, chunkCount, itemCount, chunkSize, rootMargin]);

  // Before paint, after every commit: first mount, rows added or removed,
  // and a hidden ancestor shown again (e.g. the timeline leaving focus mode
  // renders every section)
  useLayoutEffect(() => {
    revalidate();
  });

  // Scrolling and layout changes move markers across the margin
  useLayoutEffect(() => {
    const elements = markers.current.slice(0, chunkCount + 1);
    if (!enabled || chunkCount === 0 || elements.some((el) => !el)) {
      return;
    }
    scrollRoot.current = findScrollRoot(elements[0]!);
    const observer = new IntersectionObserver(() => revalidate(), {
      root: scrollRoot.current,
      rootMargin,
    });
    elements.forEach((el) => observer.observe(el!));
    return () => observer.disconnect();
  }, [enabled, chunkCount, rootMargin, revalidate]);

  const markerRefs = useMemo(
    () =>
      Array.from(
        { length: chunkCount + 1 },
        (_, i) => (node: HTMLDivElement | null) => {
          markers.current[i] = node;
        },
      ),
    [chunkCount],
  );

  return {
    isNear: (index) => !enabled || (state.near[index] ?? false),
    markerRef: (index) => markerRefs[index],
    placeholderHeight: (index) =>
      placeholderHeightFor(
        state,
        index,
        Math.min(chunkSize, itemCount - index * chunkSize),
      ),
  };
}
