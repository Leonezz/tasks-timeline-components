import React, { useCallback } from "react";
import type { Task } from "../types";
import type { DateValidationState } from "../utils";
import { rowChunks } from "../hooks/lazy-chunks";
import { LazyChunkList } from "./LazyChunkList";
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

/** A chunk of rows: keyed by its row count, estimated per row. */
const describeRowChunk = (chunk: readonly Task[]) =>
  rowChunks(chunk.length, chunk.length)[0];

/**
 * Renders task rows in chunks of 25 that each mount only near the viewport,
 * so a long section (the backlog can hold hundreds of tasks) never mounts
 * every row at once. Rows are siblings keyed by task id, so a row that
 * moves to another chunk keeps its state (see LazyChunkList).
 */
export const TaskChunkList: React.FC<TaskChunkListProps> = ({
  tasks,
  lazy,
  getDateValidation,
}) => {
  const renderRow = useCallback(
    (task: Task) => (
      <TaskItem
        key={`task:${task.id}`}
        task={task}
        dateValidation={getDateValidation?.(task)}
      />
    ),
    [getDateValidation],
  );
  return (
    <LazyChunkList
      items={tasks}
      chunkSize={TASK_CHUNK_SIZE}
      lazy={lazy}
      renderItem={renderRow}
      describeChunk={describeRowChunk}
      kind="task"
    />
  );
};
