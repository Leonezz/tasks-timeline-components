import React, { useMemo } from "react";
import type { Task } from "../types";
import type { DateValidationState } from "../utils";
import { useLazyRender } from "../hooks/useLazyRender";
import { useSettingsContext } from "../contexts/SettingsContext";
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

interface TaskChunkProps extends TaskChunkListProps {
  chunkIndex: number;
}

const TaskChunk: React.FC<TaskChunkProps> = ({
  tasks,
  lazy,
  getDateValidation,
  chunkIndex,
}) => {
  // Leaving focus mode unhides the timeline: check before that frame paints
  const { isFocusMode } = useSettingsContext(),
    { containerRef, contentRef, isNearViewport, placeholderHeight } =
      useLazyRender(tasks.length, {
        enabled: lazy,
        revalidateOn: isFocusMode,
      });

  return (
    <div ref={containerRef} data-task-chunk={chunkIndex}>
      {isNearViewport ? (
        <div ref={contentRef}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              dateValidation={getDateValidation?.(task)}
            />
          ))}
        </div>
      ) : (
        <div
          data-lazy-placeholder=""
          aria-hidden="true"
          style={{ height: placeholderHeight }}
          className="bg-slate-50/30 rounded"
        />
      )}
    </div>
  );
};

/**
 * Renders task rows in chunks that each mount only near the viewport, so a
 * long section (the backlog can hold hundreds of tasks) never mounts every
 * row at once. Chunks are keyed by position: after a filter change a chunk
 * keeps its on-screen state instead of flashing a placeholder.
 */
export const TaskChunkList: React.FC<TaskChunkListProps> = ({
  tasks,
  lazy,
  getDateValidation,
}) => {
  const chunks = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(tasks.length / TASK_CHUNK_SIZE) },
        (_, i) => tasks.slice(i * TASK_CHUNK_SIZE, (i + 1) * TASK_CHUNK_SIZE),
      ),
    [tasks],
  );

  return (
    <>
      {chunks.map((chunk, index) => (
        <TaskChunk
          // Position keys keep each chunk's lazy state across filter changes
          key={index}
          chunkIndex={index}
          tasks={chunk}
          lazy={lazy}
          getDateValidation={getDateValidation}
        />
      ))}
    </>
  );
};
