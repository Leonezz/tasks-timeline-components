import type { Task } from "@/types";
import { Icon } from "./Icon";
import { MotionDiv } from "./Motion";
import { cn } from "@/utils";
import { useState } from "react";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

export interface CategoryPopoverProps {
  task: Task;
  onUpdate: (task: Task) => void;
  availableCategories: string[];
  badgeClass: string;
}

const leadingTruncationStyle = {
  direction: "rtl",
  textAlign: "left",
} as const;

export const CategoryPopover = ({
  task,
  onUpdate,
  availableCategories,
  badgeClass,
}: CategoryPopoverProps) => {
  const [val, setVal] = useState(task.category || "");
  // Filter available categories for suggestions
  const suggestions =
    availableCategories
      .filter((c) => c.toLowerCase().includes(val.toLowerCase()) && c !== val)
      .slice(0, 5) || [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            badgeClass,
            "border-transparent bg-slate-50/80 text-slate-600 hover:border-slate-200 hover:bg-white",
          )}
          title={`Change category (current: ${task.category || "none"})`}
          aria-label={`Change category for ${task.title}. Current category: ${
            task.category || "none"
          }`}
        >
          <Icon name="Folder" size={10} className="shrink-0" />
          <span className="min-w-0 truncate" style={leadingTruncationStyle}>
            {task.category || "No Category"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="z-9999 w-64 rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 outline-none backdrop-blur"
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.98, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -4 }}
          transition={{ duration: 0.12 }}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-2.5 pb-2 pt-1.5">
            <span className="text-xs font-semibold text-slate-700">
              Category
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              Search or create
            </span>
          </div>
          <div className="p-1.5">
            <input
              autoFocus
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onUpdate({ ...task, category: val });
                }
              }}
              className="mb-1.5 h-8 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-500/15"
              placeholder="Category name..."
              aria-label={`Category for ${task.title}`}
            />
            <div className="flex flex-col gap-0.5">
              {suggestions.map((s) => (
                <PopoverClose key={s} asChild>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...task, category: s })}
                    className={cn(
                      "grid min-h-8 w-full grid-cols-[1rem_1fr_1rem] items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
                      task.category === s && "bg-blue-50/80 text-blue-700",
                    )}
                    aria-label={`Set ${task.title} category to ${s}`}
                  >
                    <Icon name="Folder" size={13} className="opacity-70" />
                    <span className="truncate">{s}</span>
                    {task.category === s && (
                      <Icon
                        name="Check"
                        size={13}
                        className="justify-self-end"
                      />
                    )}
                  </button>
                </PopoverClose>
              ))}
              <PopoverClose asChild>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...task, category: val })}
                  className="mt-1 flex min-h-8 w-full min-w-0 items-center justify-center rounded-lg bg-blue-50/70 px-2.5 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100/70 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  aria-label={`Set ${task.title} category to ${val || "blank"}`}
                  title={`Set to "${val}"`}
                >
                  <span className="truncate" style={leadingTruncationStyle}>
                    Set to "{val}"
                  </span>
                </button>
              </PopoverClose>
            </div>
          </div>
        </MotionDiv>
      </PopoverContent>
    </Popover>
  );
};
