import React, { useMemo } from "react";
import type { Task } from "../types";
import type { DateValidationState } from "../utils";
import { splitIntoChunks } from "../hooks/lazy-chunks";
import { useLazyChunks } from "../hooks/useLazyChunks";
import { TaskItem } from "./TaskItem";

/** Rows per lazily rendered chunk. */
export const TASK_CHUNK_SIZE = 25;

interface TaskChunkListProps {
  tasks: Task[];
  /** When false, every row renders at once (e.g. the Today section). */
  lazy: boolean;
  /** Should return shared objects, so memoized rows keep equal props. */
  getDateValidation?: (task: Task) => DateValidationState | undefined;
}

/**
 * Renders task rows in chunks of 25 that each mount only near the viewport,
 * so a long section (the backlog can hold hundreds of tasks) never mounts
 * every row at once.
 *
 * Rows are never wrapped per chunk: every row is a sibling keyed by its task
 * id, with one marker element before each chunk (its placeholder while the
 * chunk is far). A row that moves to another chunk, because a task above it
 * was added or removed, keeps its state: an inline edit, an open popover,
 * focus.
 */
export const TaskChunkList: React.FC<TaskChunkListProps> = ({
  tasks,
  lazy,
  getDateValidation,
}) => {
  const chunks = useMemo(
      () => splitIntoChunks(tasks, TASK_CHUNK_SIZE),
      [tasks],
    ),
    { isNear, markerRef, placeholderHeight } = useLazyChunks(
      tasks.length,
      TASK_CHUNK_SIZE,
      { enabled: lazy },
    ),
    renderRow = (task: Task) => (
      <TaskItem
        key={`task:${task.id}`}
        task={task}
        dateValidation={getDateValidation?.(task)}
      />
    );

  if (!lazy) {
    return <>{tasks.map(renderRow)}</>;
  }

  const renderMarker = (index: number) => {
    const near = isNear(index);
    return (
      <div
        key={`chunk:${index}`}
        ref={markerRef(index)}
        data-task-chunk={index}
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
            ? [renderMarker(index), ...chunk.map(renderRow)]
            : [renderMarker(index)],
        ),
        <div
          key="chunk:end"
          ref={markerRef(chunks.length)}
          data-task-chunk-end=""
          aria-hidden="true"
          className="flow-root"
        />,
      ]}
    </>
  );
};
