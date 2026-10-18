import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { findScrollRoot, parseVerticalMargins } from "./useLazyRender";
import {
  EMPTY_CHUNK_STATE,
  checkChunks,
  placeholderHeightFor,
  type ChunkInfo,
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

/**
 * Lazily mounts the items of a long list in chunks, without wrapping them:
 * each chunk is marked by one element before its rows, so the rows stay
 * siblings of one parent and keep their state when they move between chunks.
 * Chunk i spans from its marker to the next one; it mounts while that span
 * is near the visible part of the scroll container.
 *
 * - Checks run before paint after every commit, so rows already near the
 *   viewport never show a placeholder frame.
 * - An observer on the markers catches scrolling and layout changes; any
 *   marker crossing the margin re-checks every chunk. It starts over after
 *   every change of state, so a marker that a check moved across the margin
 *   is reported again (see the observer effect).
 * - Hidden lists (display: none) keep their state.
 *
 * `chunks` describes each chunk (see rowChunks for rows of one height).
 */
export function useLazyChunks(
  chunks: readonly ChunkInfo[],
  options: UseLazyChunksOptions = {},
): UseLazyChunksResult {
  const { enabled = true, rootMargin = "500px 0px" } = options,
    chunkCount = chunks.length,
    [state, setState] = useState(EMPTY_CHUNK_STATE),
    // The state each check starts from: the committed state, or the one
    // this hook last asked for (see revalidate)
    latest = useRef(state),
    // The chunks as of the last commit, for checks from the observer
    committedChunks = useRef(chunks),
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
      tops = rects.map((rect) => rect.top);
    // The next state is computed here, from this measurement, and set as a
    // value. A state updater would close over this measurement, and React
    // replays queued updaters when an update of another priority (a check
    // from the observer callback) is pending: replayed against an older
    // state, old measurements produced a new state on every commit, which
    // rendered and checked again until React threw "Maximum update depth
    // exceeded" (seen with React 18). A value replays as itself.
    const prev = latest.current,
      next = checkChunks(prev, {
        tops,
        bounds,
        margins,
        chunkKeys: committedChunks.current.map((chunk) => chunk.key),
      });
    if (next !== prev) {
      latest.current = next;
      setState(next);
    }
  }, [enabled, chunkCount, rootMargin]);

  // Before paint, after every commit: first mount, rows added or removed,
  // and a hidden ancestor shown again (e.g. the timeline leaving focus mode
  // renders every section)
  useLayoutEffect(() => {
    latest.current = state;
    committedChunks.current = chunks;
    revalidate();
  });

  // Scrolling and layout changes move markers across the margin. The
  // observer reports a marker only when it crosses the margin between two
  // of its looks, so it starts over (and reports every marker once) after
  // each change of state: a check after a commit can move a chunk on what
  // it measured, e.g. unmount one that rows mounting above pushed out of
  // the margin, and if the scroll brings the marker back before the
  // observer looks again, it never sees it leave or return, and the chunk
  // stayed a placeholder in view.
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
  }, [enabled, chunkCount, rootMargin, revalidate, state]);

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
      placeholderHeightFor(state, index, chunks[index]),
  };
}
