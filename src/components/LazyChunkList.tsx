import React, { useMemo } from "react";
import { splitIntoChunks, type ChunkInfo } from "../hooks/lazy-chunks";
import { useLazyChunks } from "../hooks/useLazyChunks";

interface LazyChunkListProps<T> {
  items: readonly T[];
  /** Items per chunk. */
  chunkSize: number;
  /** When false, every item renders at once. */
  lazy: boolean;
  /** One item's element, with a key unique in the list. */
  renderItem: (item: T) => React.ReactElement;
  /** Key and estimated height of a chunk (see ChunkInfo). */
  describeChunk: (chunk: readonly T[]) => ChunkInfo;
  /** Names the markers' data attributes: data-{kind}-chunk, data-{kind}-chunk-end. */
  kind: string;
  /** Extra data attributes for a far chunk's placeholder. */
  placeholderData?: (
    chunk: readonly T[],
  ) => Record<`data-${string}`, string | number>;
}

/**
 * Renders items in chunks that each mount only near the viewport, so a long
 * list never mounts every item at once (see useLazyChunks).
 *
 * Items are never wrapped per chunk: every item is a sibling keyed by
 * `renderItem`, with one marker element before each chunk (its placeholder
 * while the chunk is far). An item that moves to another chunk, because an
 * item above it was added or removed, keeps its state: an inline edit, an
 * open popover, focus.
 */
export const LazyChunkList = <T,>({
  items,
  chunkSize,
  lazy,
  renderItem,
  describeChunk,
  kind,
  placeholderData,
}: LazyChunkListProps<T>): React.ReactElement => {
  const chunks = useMemo(
      () => splitIntoChunks(items, chunkSize),
      [items, chunkSize],
    ),
    { isNear, markerRef, placeholderHeight } = useLazyChunks(
      chunks.map(describeChunk),
      {
        enabled: lazy,
      },
    );

  if (!lazy) {
    return <>{items.map(renderItem)}</>;
  }

  const renderMarker = (index: number) => {
    const near = isNear(index);
    return (
      <div
        key={`chunk:${index}`}
        ref={markerRef(index)}
        {...(near ? undefined : placeholderData?.(chunks[index]))}
        {...{ [`data-${kind}-chunk`]: index }}
        data-lazy-placeholder={near ? undefined : ""}
        aria-hidden="true"
        style={near ? undefined : { height: placeholderHeight(index) }}
        // flow-root: an empty marker's margins never collapse through it,
        // so its position does not depend on what follows it
        className={near ? "flow-root" : "flow-root bg-slate-50/30 rounded"}
      />
    );
  };

  return (
    <>
      {[
        ...chunks.flatMap((chunk, index) =>
          isNear(index)
            ? [renderMarker(index), ...chunk.map(renderItem)]
            : [renderMarker(index)],
        ),
        <div
          key="chunk:end"
          ref={markerRef(chunks.length)}
          {...{ [`data-${kind}-chunk-end`]: "" }}
          aria-hidden="true"
          className="flow-root"
        />,
      ]}
    </>
  );
};
