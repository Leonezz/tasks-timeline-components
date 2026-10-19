import { describe, expect, it } from "vitest";
import {
  EMPTY_CHUNK_STATE,
  type ChunkGeometry,
  type ChunkState,
  checkChunks,
  chunkNearness,
  nextChunkState,
  placeholderHeightFor,
  rowChunks,
  splitIntoChunks,
} from "./lazy-chunks";

/** One chunk of `count` rows. */
const rows = (count: number) => rowChunks(count, count)[0];

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

describe("rowChunks", () => {
  it("keys chunks by row count and estimates 52 px per row", () => {
    expect(rowChunks(60, 25)).toEqual([
      { key: "25", estimatedHeight: 1300 },
      { key: "25", estimatedHeight: 1300 },
      { key: "10", estimatedHeight: 520 },
    ]);
    expect(rowChunks(0, 25)).toEqual([]);
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
    const state = nextChunkState(EMPTY_CHUNK_STATE, [true], [0, 100], ["2"]);
    expect(nextChunkState(state, [true], [0, 100], ["2"])).toBe(state);
    // Chunks without an entry count as far
    expect(nextChunkState(EMPTY_CHUNK_STATE, [false], [0, 100], ["2"])).toBe(
      EMPTY_CHUNK_STATE,
    );
  });

  it("records the height of a chunk that leaves the view", () => {
    const near = nextChunkState(
        EMPTY_CHUNK_STATE,
        [true, true],
        [0, 1300, 1400],
        ["25", "2"],
      ),
      far = nextChunkState(near, [false, true], [0, 1300, 1400], ["25", "2"]);
    expect(far.near).toEqual([false, true]);
    expect(placeholderHeightFor(far, 0, rows(25))).toBe(1300);
  });
});

describe("placeholderHeightFor", () => {
  it("estimates chunks that were never measured, or whose key changed", () => {
    const far = nextChunkState(
      nextChunkState(EMPTY_CHUNK_STATE, [true], [0, 600], ["10"]),
      [false],
      [0, 600],
      ["10"],
    );
    expect(placeholderHeightFor(far, 0, rows(10))).toBe(600);
    expect(placeholderHeightFor(far, 0, rows(9))).toBe(9 * 52);
    expect(placeholderHeightFor(EMPTY_CHUNK_STATE, 3, rows(4))).toBe(4 * 52);
    expect(
      placeholderHeightFor(far, 0, { key: "other", estimatedHeight: 77 }),
    ).toBe(77);
  });
});

describe("checkChunks", () => {
  const MARGINS = { top: 500, bottom: 500 },
    SPACING = 2; // space-y-0.5 between the list's children

  const mulberry32 = (seed: number) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  interface SimulatedList {
    rowHeights: number[][]; // per chunk
    header: number;
    footer: number;
    viewport: number;
    /** Keep the first marker in view still when heights change (Chrome). */
    anchored: boolean;
  }

  const chunkHeights = (list: SimulatedList, state: ChunkState) =>
    list.rowHeights.map((rows, i) =>
      state.near[i]
        ? SPACING + rows.reduce((sum, height) => sum + height + SPACING, 0)
        : placeholderHeightFor(
            state,
            i,
            rowChunks(rows.length, rows.length)[0],
          ) + SPACING,
    );

  /** Marker tops in viewport coordinates, and the clamped scroll offset. */
  const layout = (list: SimulatedList, state: ChunkState, scroll: number) => {
    const heights = chunkHeights(list, state),
      total = list.header + heights.reduce((a, b) => a + b, 0) + list.footer,
      clamped = Math.min(
        Math.max(scroll, 0),
        Math.max(total - list.viewport, 0),
      ),
      tops = [list.header - clamped];
    heights.forEach((height, i) => tops.push(tops[i] + height));
    return { tops, scroll: clamped };
  };

  const geometryOf = (list: SimulatedList, tops: number[]): ChunkGeometry => ({
    tops,
    bounds: { top: 0, bottom: list.viewport },
    margins: MARGINS,
    chunkKeys: list.rowHeights.map((chunk) => String(chunk.length)),
  });

  /**
   * Checks, lays out and checks again until a check changes nothing, as the
   * hook does after each commit. Returns the number of checks that changed
   * the state, or Infinity when it never settles.
   */
  const settle = (list: SimulatedList, scrollFraction: number) => {
    let state: ChunkState = EMPTY_CHUNK_STATE,
      { tops, scroll } = layout(list, state, Number.POSITIVE_INFINITY);
    ({ tops, scroll } = layout(list, state, scroll * scrollFraction));
    const limit = 4 * list.rowHeights.length + 4;
    for (let changes = 0; changes <= limit; changes++) {
      const next = checkChunks(state, geometryOf(list, tops));
      if (next === state) {
        return changes;
      }
      // Scroll anchoring keeps the first marker at or below the view top
      // where it was; without it, the scroll offset stays (clamped)
      const anchor = tops.findIndex((top) => top >= 0),
        moved = layout(list, next, scroll);
      if (list.anchored && anchor >= 0) {
        ({ tops, scroll } = layout(
          list,
          next,
          scroll + moved.tops[anchor] - tops[anchor],
        ));
      } else {
        ({ tops, scroll } = moved);
      }
      state = next;
    }
    return Number.POSITIVE_INFINITY;
  };

  it("settles for any list, row height, pane size and scroll position", () => {
    const rand = mulberry32(79);
    for (let run = 0; run < 400; run++) {
      const itemCount = 1 + Math.floor(rand() * 520),
        rowHeight = () => 30 + Math.floor(rand() * 100),
        uniform = rand() < 0.5 ? rowHeight() : 0,
        rows = Array.from({ length: itemCount }, () => uniform || rowHeight()),
        list: SimulatedList = {
          rowHeights: splitIntoChunks(rows, 25),
          header: Math.floor(rand() * 3000),
          footer: Math.floor(rand() * 400),
          viewport: 500 + Math.floor(rand() * 700),
          anchored: rand() < 0.5,
        },
        fraction = [0, 0.5, 1, rand()][Math.floor(rand() * 4)];
      // Each chunk mounts at most once and unmounts at most once
      expect(
        settle(list, fraction),
        `run ${run}: ${JSON.stringify({ itemCount, uniform, fraction, ...list, rowHeights: undefined })}`,
      ).toBeLessThanOrEqual(2 * list.rowHeights.length + 2);
    }
  });

  it("gives the same answer when it checks the same measurement again", () => {
    const geometry: ChunkGeometry = {
        tops: [-2400, -1100, 200, 1500, 2800],
        bounds: { top: 0, bottom: 800 },
        margins: MARGINS,
        chunkKeys: ["25", "25", "25", "25"],
      },
      once = checkChunks(EMPTY_CHUNK_STATE, geometry);
    expect(once.near).toEqual([false, true, true, false]);
    expect(checkChunks(once, geometry)).toBe(once);
  });

  it("keeps a mounted chunk near within the slack", () => {
    const geometry = (top: number): ChunkGeometry => ({
        tops: [top, top + 1300],
        bounds: { top: 0, bottom: 700 },
        margins: MARGINS,
        chunkKeys: ["25"],
      }),
      near = checkChunks(EMPTY_CHUNK_STATE, geometry(1150));
    expect(near.near).toEqual([true]);
    // 50 px past the margin: stays near; 150 px past it: leaves
    expect(checkChunks(near, geometry(1250))).toBe(near);
    expect(checkChunks(near, geometry(1350)).near).toEqual([false]);
  });
});
