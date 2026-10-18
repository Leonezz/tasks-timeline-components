import { ESTIMATED_ITEM_HEIGHT } from "./useLazyRender";

/** Pure helpers behind useLazyChunks: chunking, geometry and state. */

interface MeasuredHeight {
  itemCount: number;
  height: number;
}

export interface ChunkState {
  /** Per chunk: rows mounted. A chunk without an entry is far. */
  near: readonly boolean[];
  /** Per chunk: its height when it last left the view. */
  measured: readonly (MeasuredHeight | undefined)[];
}

export const EMPTY_CHUNK_STATE: ChunkState = { near: [], measured: [] };

export const splitIntoChunks = <T>(
  items: readonly T[],
  size: number,
): T[][] => {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error(
      `splitIntoChunks: chunk size ${size} must be an integer above 0`,
    );
  }
  return Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, (i + 1) * size),
  );
};

export interface Span {
  top: number;
  bottom: number;
}

/**
 * Which chunks overlap the view plus its margins. `tops` holds each chunk's
 * start marker and, last, the end marker, so chunk i spans
 * [tops[i], tops[i + 1]]: a chunk taller than the view stays near while it
 * covers it. A chunk that `wasNear` stays near until it is `slack` px further
 * out, so a chunk at the edge cannot flip on every render as mounting its
 * rows moves it by a pixel or two.
 */
export const chunkNearness = (
  tops: readonly number[],
  bounds: Span,
  margins: Span,
  wasNear: readonly boolean[] = [],
  slack = 0,
): boolean[] => {
  if (tops.length < 2) {
    throw new Error(
      "chunkNearness: needs a start marker per chunk and an end marker",
    );
  }
  return tops.slice(0, -1).map((top, i) => {
    const extra = wasNear[i] ? slack : 0;
    return (
      top <= bounds.bottom + margins.bottom + extra &&
      tops[i + 1] >= bounds.top - margins.top - extra
    );
  });
};

/**
 * The state after a geometry check, or `prev` itself when no chunk changed.
 * A chunk that leaves the view records its height (its rows are still
 * mounted), so its placeholder keeps the scroll position.
 */
export const nextChunkState = (
  prev: ChunkState,
  near: readonly boolean[],
  tops: readonly number[],
  chunkSizes: readonly number[],
): ChunkState => {
  const wasNear = (i: number) => prev.near[i] ?? false;
  if (near.every((isNear, i) => isNear === wasNear(i))) {
    return prev;
  }
  return {
    near,
    measured: near.map((isNear, i) => {
      const height = tops[i + 1] - tops[i];
      return wasNear(i) && !isNear && height > 0
        ? { itemCount: chunkSizes[i], height }
        : prev.measured[i];
    }),
  };
};

/** The measured height for the same row count, else an estimate. */
export const placeholderHeightFor = (
  state: ChunkState,
  index: number,
  itemCount: number,
): number => {
  const measured = state.measured[index];
  return measured?.itemCount === itemCount
    ? measured.height
    : itemCount * ESTIMATED_ITEM_HEIGHT;
};

/** How much further out a mounted chunk may go before it unmounts (px). */
export const KEEP_NEAR_SLACK = 100;

/** One measurement of a chunked list, in viewport coordinates. */
export interface ChunkGeometry {
  /** Each chunk's start marker, then the end marker. */
  tops: readonly number[];
  /** The visible part of the scroll container. */
  bounds: Span;
  /** The margins around it (px). */
  margins: Span;
  /** Rows per chunk. */
  chunkSizes: readonly number[];
}

/**
 * One check of a chunked list: the state for this measurement, or `prev`
 * itself when no chunk changes. A pure function of its arguments, so the
 * caller must pass the measurement it just took and set the result as a
 * value: a state updater closing over a measurement can be replayed by React
 * against another state, long after the measurement went stale.
 */
export const checkChunks = (
  prev: ChunkState,
  { tops, bounds, margins, chunkSizes }: ChunkGeometry,
): ChunkState =>
  nextChunkState(
    prev,
    chunkNearness(tops, bounds, margins, prev.near, KEEP_NEAR_SLACK),
    tops,
    chunkSizes,
  );
