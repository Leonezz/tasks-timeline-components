import type { Task } from "@/types";
import { Icon } from "./Icon";
import { useAppContext } from "./AppContext";
import { MotionDiv } from "./Motion";
import { cn } from "@/utils";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "./ui/popover";

export interface CategoryPopoverProps {
  task: Task;
  onUpdate: (task: Task) => void;
  availableCategories: string[];
  badgeClass: string;
}

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
  const { portalContainer } = useAppContext();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            badgeClass,
            "text-slate-600 bg-slate-100 border-slate-200"
          )}
          title="Change Category"
        >
          <Icon name="Folder" size={10} />
          <span>{task.category || "No Category"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="z-9999 outline-none w-48 p-2"
        container={portalContainer}
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <input
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onUpdate({ ...task, category: val });
              }
            }}
            className="w-full text-xs border border-slate-200 rounded px-2 py-1 mb-2 focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="Category name..."
          />
          <div className="flex flex-col gap-0.5">
            {suggestions.map((s) => (
              <PopoverClose key={s} asChild>
                <button
                  onClick={() => onUpdate({ ...task, category: s })}
                  className="text-left px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded flex items-center gap-2 justify-start!"
                >
                  <Icon name="Folder" size={10} className="opacity-50" />
                  {s}
                </button>
              </PopoverClose>
            ))}
            <PopoverClose asChild>
              <button
                onClick={() => onUpdate({ ...task, category: val })}
                className="text-center px-2 py-1.5 text-xs text-blue-600! hover:bg-blue-50 rounded font-medium mt-1"
              >
                Set to "{val}"
              </button>
            </PopoverClose>
          </div>
        </MotionDiv>
      </PopoverContent>
    </Popover>
  );
};
