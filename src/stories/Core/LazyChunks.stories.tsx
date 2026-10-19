import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useMemo } from "react";
import { expect, waitFor } from "storybook/test";
import { rowChunks } from "../../hooks/lazy-chunks";
import { useLazyChunks } from "../../hooks/useLazyChunks";
import { ESTIMATED_ITEM_HEIGHT } from "../../hooks/useLazyRender";

/**
 * useLazyChunks on its own: two lazily chunked lists, one above the other,
 * in a scroll container, with rows much taller than the placeholder
 * estimate, so the upper list mounting moves the lower one by thousands of
 * pixels (as day sections above one in view mount on a narrow pane).
 */

const ROW_HEIGHT = 120,
  CHUNK_SIZE = 25,
  UPPER_ROWS = 25,
  LOWER_ROWS = 5,
  VIEW_HEIGHT = 400,
  /** useLazyChunks' default rootMargin */
  MARGIN = 500,
  SPACER = 5000;

const TallList: React.FC<{ name: string; rows: number }> = ({ name, rows }) => {
  const chunkCount = Math.ceil(rows / CHUNK_SIZE),
    chunks = useMemo(() => rowChunks(rows, CHUNK_SIZE), [rows]),
    { isNear, markerRef, placeholderHeight } = useLazyChunks(chunks);
  return (
    <div data-list={name}>
      {Array.from({ length: chunkCount }, (_, index) => (
        <React.Fragment key={index}>
          <div
            ref={markerRef(index)}
            data-chunk={index}
            data-far={isNear(index) ? undefined : ""}
            style={{
              display: "flow-root",
              height: isNear(index) ? undefined : placeholderHeight(index),
            }}
          />
          {isNear(index) &&
            Array.from(
              { length: Math.min(CHUNK_SIZE, rows - index * CHUNK_SIZE) },
              (_, row) => (
                <div
                  key={row}
                  style={{
                    height: ROW_HEIGHT,
                    boxSizing: "border-box",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {name} row {index * CHUNK_SIZE + row}
                </div>
              ),
            )}
        </React.Fragment>
      ))}
      <div ref={markerRef(chunkCount)} style={{ display: "flow-root" }} />
    </div>
  );
};

const TwoTallLists: React.FC = () => (
  <div
    data-testid="lazy-pane"
    // No scroll anchoring: the test sets the scroll position itself
    style={{
      height: VIEW_HEIGHT,
      width: 320,
      overflowY: "auto",
      overflowAnchor: "none",
    }}
  >
    <div style={{ height: SPACER }} />
    <TallList name="upper" rows={UPPER_ROWS} />
    <TallList name="lower" rows={LOWER_ROWS} />
    <div style={{ height: SPACER }} />
  </div>
);

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const frames = async (count: number) => {
  for (let i = 0; i < count; i++) {
    await nextFrame();
  }
};

const meta: Meta<typeof TwoTallLists> = {
  title: "Core/LazyChunks",
  component: TwoTallLists,
  parameters: { layout: "padded", a11y: { test: "off" } },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A chunk back inside the margin mounts, even when its observer never saw
 * it leave.
 *
 * A scroll brings both lists into the margin and both mount. The upper
 * list's real rows are much taller than its placeholder, so the lower
 * list's re-check right after that commit finds its marker far below the
 * margin and unmounts it again. Before the observers look again, the scroll
 * brings that marker back inside the margin (as fast wheel or PageDown
 * scrolling does in the next frame). The lower list's markers are where its
 * observer last saw them, so it reports nothing: the lower list stayed a
 * placeholder, in view, until something else re-rendered it.
 */
export const RemountsAChunkTheObserverMissed: Story = {
  play: async ({ canvasElement }) => {
    const pane = canvasElement.querySelector<HTMLElement>(
        '[data-testid="lazy-pane"]',
      )!,
      marker = (list: string) =>
        pane.querySelector<HTMLElement>(`[data-list="${list}"] [data-chunk]`)!,
      // Position in the scrolled content, whatever the scroll offset
      offsetOf = (element: HTMLElement) =>
        element.getBoundingClientRect().top -
        pane.getBoundingClientRect().top +
        pane.scrollTop;

    await frames(3);
    expect(marker("upper")).toHaveAttribute("data-far");
    expect(marker("lower")).toHaveAttribute("data-far");
    const upperTop = offsetOf(marker("upper")),
      upperEstimate = UPPER_ROWS * ESTIMATED_ITEM_HEIGHT,
      lowerEstimate = LOWER_ROWS * ESTIMATED_ITEM_HEIGHT,
      // The upper placeholder overlaps the margin, so does the lower one,
      // and the lower list's end marker is below it
      scrollTop = upperTop + MARGIN + 100;
    expect(upperTop + upperEstimate + lowerEstimate).toBeGreaterThan(
      scrollTop + VIEW_HEIGHT + MARGIN,
    );

    let lowerFarAfterMount: boolean | null = null;
    const mutations = new MutationObserver(() => {
      if (marker("upper").hasAttribute("data-far")) {
        return;
      }
      // Right after the commits that mounted the upper list, before the
      // next frame
      mutations.disconnect();
      lowerFarAfterMount = marker("lower").hasAttribute("data-far");
      // The lower marker 225 px below the view: its placeholder overlaps
      // the margin, its end marker is below it, as its observer last saw
      pane.scrollTop = offsetOf(marker("lower")) - VIEW_HEIGHT - 225;
    });
    mutations.observe(pane, {
      subtree: true,
      childList: true,
      attributes: true,
    });

    pane.scrollTop = scrollTop;
    await waitFor(() => expect(lowerFarAfterMount).not.toBeNull(), {
      timeout: 2000,
    });
    // The scenario happened: mounting the upper list pushed the lower out
    expect(lowerFarAfterMount).toBe(true);

    // Its placeholder overlaps the margin, so it mounts within a few frames
    await frames(10);
    expect(marker("upper")).not.toHaveAttribute("data-far");
    expect(marker("lower")).not.toHaveAttribute("data-far");
  },
};
