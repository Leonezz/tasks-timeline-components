import React, { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { DayGroup, YearGroup } from "../types";
import { DaySection } from "./DaySection";
import { estimateDaySectionHeight } from "./day-section-height";
import { LazyChunkList } from "./LazyChunkList";
import { cn } from "../utils";
import { countActiveDays } from "../utils/timeline";
import { Icon } from "./Icon";
import { useTimelineSectionContext } from "../contexts/TimelineSectionContext";
import { Collapsible, CollapsibleTrigger } from "./ui/collapsible";

interface YearSectionProps {
  group: YearGroup;
}

/** Day sections per lazily rendered chunk. */
export const DAY_CHUNK_SIZE = 8;

const NO_DAYS: ReadonlySet<string> = new Set();

interface TimelineDayProps {
  group: DayGroup;
  open: boolean;
  onDayOpenChange: (date: string, open: boolean) => void;
}

/**
 * A day section of the timeline. Memoized: the day list re-renders whenever
 * one of its chunks mounts or unmounts, and a section that did not change
 * must not render (and re-check its own lazy rows) again.
 */
const TimelineDay = memo<TimelineDayProps>(
  ({ group, open, onDayOpenChange }) => (
    <DaySection
      group={group}
      open={open}
      onOpenChange={(next) => onDayOpenChange(group.date, next)}
    />
  ),
);
TimelineDay.displayName = "TimelineDay";

/** A far chunk of days says how many tasks it holds, as a day section does. */
const dayPlaceholderData = (chunk: readonly DayGroup[]) => ({
  "data-task-count": chunk.reduce((sum, day) => sum + day.tasks.length, 0),
});

/**
 * A year's day sections, in chunks of DAY_CHUNK_SIZE that each mount only
 * near the viewport: a year can hold hundreds of day sections, and mounting
 * them all (about 30 elements each, before any row) made rendering the
 * timeline take frames of 200 ms and more.
 *
 * Which sections the user collapsed is kept here, so a section keeps it
 * when its chunk unmounts and mounts again.
 */
const DayChunkList: React.FC<{ dayGroups: DayGroup[] }> = ({ dayGroups }) => {
  const [collapsed, setCollapsed] = useState(NO_DAYS);
  const setDayOpen = useCallback(
    (date: string, open: boolean) =>
      setCollapsed((prev) => {
        if (prev.has(date) === !open) {
          return prev;
        }
        const next = new Set(prev);
        if (open) {
          next.delete(date);
        } else {
          next.add(date);
        }
        return next;
      }),
    [],
  );
  const describeChunk = (chunk: readonly DayGroup[]) => ({
      key: chunk
        .map(
          (day) =>
            `${day.date}:${day.tasks.length}:${collapsed.has(day.date) ? "c" : "o"}`,
        )
        .join(" "),
      estimatedHeight: chunk.reduce(
        (sum, day) =>
          sum + estimateDaySectionHeight(day, !collapsed.has(day.date)),
        0,
      ),
    }),
    renderDay = (day: DayGroup) => (
      <TimelineDay
        key={day.date}
        group={day}
        open={!collapsed.has(day.date)}
        onDayOpenChange={setDayOpen}
      />
    );
  return (
    <LazyChunkList
      items={dayGroups}
      chunkSize={DAY_CHUNK_SIZE}
      lazy
      renderItem={renderDay}
      describeChunk={describeChunk}
      kind="day"
      placeholderData={dayPlaceholderData}
    />
  );
};

export const YearSection: React.FC<YearSectionProps> = ({ group }) => {
  const { settings } = useTimelineSectionContext(),
    [isOpen, setIsOpen] = useState(true),
    progressPercent =
      Math.round((group.completedTasks / group.totalTasks) * 100) || 0,
    activeDays = countActiveDays(group.dayGroups);

  return (
    <div
      className="mb-4"
      data-year-section={group.year}
      data-task-count={group.totalTasks}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Year Header & Progress - Clickable */}
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full text-left mb-1.5 group outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-1"
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${group.year}, ${
              group.totalTasks
            } task${group.totalTasks === 1 ? "" : "s"}, ${progressPercent}% complete`}
            title={`${group.year} - ${group.completedTasks} of ${group.totalTasks} complete`}
          >
            <div className="flex items-end justify-between mb-1">
              <div className="flex items-baseline gap-4">
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={false}
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400"
                  >
                    <Icon name="ChevronRight" size={20} />
                  </motion.div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tighter group-hover:text-blue-600 transition-colors">
                    {group.year}
                  </h2>
                </div>
                <div className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                  <span className="text-rose-500 font-bold">
                    {group.totalTasks - group.completedTasks}
                  </span>{" "}
                  unfinished tasks in{" "}
                  <span className="text-rose-500 font-bold">{activeDays}</span>{" "}
                  active day{activeDays === 1 ? "" : "s"}.
                </div>
              </div>

              {/* Progress Numbers Moved Here */}
              <div
                className="flex items-center gap-2 pb-1"
                aria-label={`${group.completedTasks} of ${group.totalTasks} tasks complete`}
              >
                <span className="text-[10px] text-slate-400 font-mono">
                  {group.completedTasks} / {group.totalTasks}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            {settings.showProgressBar && (
              <div
                className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"
                role="progressbar"
                aria-label={`${group.year} completion`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent}
              >
                <motion.div
                  className={cn(
                    "absolute top-0 left-0 h-full rounded-full",
                    progressPercent === 100 ? "bg-emerald-400" : "bg-slate-800",
                  )}
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            )}
          </button>
        </CollapsibleTrigger>

        {/* Days */}
        <motion.div
          initial={false}
          animate={
            isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
          }
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <DayChunkList dayGroups={group.dayGroups} />
        </motion.div>
      </Collapsible>
    </div>
  );
};
