import { describe, expect, it } from "vitest";
import {
  EMPTY_CHUNK_STATE,
  chunkNearness,
  nextChunkState,
  placeholderHeightFor,
  splitIntoChunks,
} from "./lazy-chunks";

describe("splitIntoChunks", () => {
  it("cuts a list into slices of the given size", () => {
    expect(splitIntoChunks([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(splitIntoChunks([], 25)).toEqual([]);
  });

  it("rejects a size that is not a positive integer", () => {
    expect(() => splitIntoChunks([1], 0)).toThrow(/chunk size/);
    expect(() => splitIntoChunks([1], 2.5)).toThrow(/chunk size/);
  });
});

describe("chunkNearness", () => {
  const bounds = { top: 0, bottom: 700 },
    margins = { top: 500, bottom: 500 };

  it("marks chunks whose extent overlaps the view plus its margins", () => {
    // Chunk extents: [-2000, -600], [-600, 100], [100, 1300], [1300, 2500]
    expect(
      chunkNearness([-2000, -600, 100, 1300, 2500], bounds, margins),
    ).toEqual([false, true, true, false]);
  });

  it("keeps a chunk taller than the view near while it spans it", () => {
    expect(chunkNearness([-3000, 4000], bounds, margins)).toEqual([true]);
  });

  it("keeps a near chunk until it is `slack` px further out", () => {
    // Starts 50 px below the margin: far, unless it was already near
    const tops = [1250, 1300];
    expect(chunkNearness(tops, bounds, margins)).toEqual([false]);
    expect(chunkNearness(tops, bounds, margins, [false], 100)).toEqual([false]);
    expect(chunkNearness(tops, bounds, margins, [true], 100)).toEqual([true]);
    expect(chunkNearness([1350, 1400], bounds, margins, [true], 100)).toEqual([
      false,
    ]);
  });

  it("needs one more top than there are chunks", () => {
    expect(() => chunkNearness([0], bounds, margins)).toThrow(/marker/);
  });
});

describe("nextChunkState", () => {
  it("returns the same state when nothing changes", () => {
    const state = nextChunkState(EMPTY_CHUNK_STATE, [true], [0, 100], [2]);
    expect(nextChunkState(state, [true], [0, 100], [2])).toBe(state);
    // Chunks without an entry count as far
    expect(nextChunkState(EMPTY_CHUNK_STATE, [false], [0, 100], [2])).toBe(
      EMPTY_CHUNK_STATE,
    );
  });

  it("records the height of a chunk that leaves the view", () => {
    const near = nextChunkState(
        EMPTY_CHUNK_STATE,
        [true, true],
        [0, 1300, 1400],
        [25, 2],
      ),
      far = nextChunkState(near, [false, true], [0, 1300, 1400], [25, 2]);
    expect(far.near).toEqual([false, true]);
    expect(placeholderHeightFor(far, 0, 25)).toBe(1300);
  });
});

describe("placeholderHeightFor", () => {
  it("estimates rows that were never measured, or whose count changed", () => {
    const far = nextChunkState(
      nextChunkState(EMPTY_CHUNK_STATE, [true], [0, 600], [10]),
      [false],
      [0, 600],
      [10],
    );
    expect(placeholderHeightFor(far, 0, 10)).toBe(600);
    expect(placeholderHeightFor(far, 0, 9)).toBe(9 * 52);
    expect(placeholderHeightFor(EMPTY_CHUNK_STATE, 3, 4)).toBe(4 * 52);
  });
});
