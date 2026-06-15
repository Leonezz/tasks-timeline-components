import type { Priority, Task } from "@/types";
import { Icon } from "./Icon";
import { MotionDiv } from "./Motion";
import { cn } from "@/utils";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

export interface PriorityPopoverProps {
  task: Task;
  onUpdate: (task: Task) => void;
  badgeClass: string;
}

export const PriorityPopover = ({
  task,
  badgeClass,
  onUpdate,
}: PriorityPopoverProps) => {
  const p = task.priority;
  let colorClass =
    "border-transparent bg-slate-50/80 text-slate-500 hover:border-slate-200 hover:bg-white";
  if (p === "high") {
    colorClass = "border-rose-100 bg-rose-50/90 text-rose-700";
  }
  if (p === "medium") {
    colorClass = "border-amber-100 bg-amber-50/90 text-amber-700";
  }

  const getPriorityColor = (priority: Priority) => {
    if (priority === "high") return "text-rose-500";
    if (priority === "medium") return "text-amber-500";
    return "text-slate-400";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            badgeClass,
            colorClass,
            "outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
          )}
          title={`Change priority (current: ${p})`}
          aria-label={`Change priority for ${task.title}. Current priority: ${p}`}
        >
          <Icon name="Flag" size={10} strokeWidth={p === "high" ? 3 : 2} />
          <span className="capitalize">{p}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="z-9999 w-56 rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 outline-none backdrop-blur"
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.98, y: -4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98, y: -4 }}
          transition={{ duration: 0.12 }}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-2.5 pb-2 pt-1.5">
            <span className="text-xs font-semibold text-slate-700">
              Priority
            </span>
            <span className="text-[10px] font-medium capitalize text-slate-400">
              Current: {p}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 pt-1">
            {(["high", "medium", "low"] as Priority[]).map((opt) => (
              <PopoverClose key={opt} asChild>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...task, priority: opt })}
                  aria-pressed={task.priority === opt}
                  aria-label={`Set ${task.title} priority to ${opt}`}
                  className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                >
                  <div
                    className={cn(
                      "grid min-h-8 w-full grid-cols-[1rem_1fr_1rem] items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors",
                      task.priority === opt
                        ? opt === "high"
                          ? "bg-rose-50/90 text-rose-700"
                          : opt === "medium"
                            ? "bg-amber-50/90 text-amber-700"
                            : "bg-slate-100/80 text-slate-700"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
                    )}
                  >
                    <Icon
                      name="Flag"
                      size={13}
                      className={getPriorityColor(opt)}
                      strokeWidth={opt === "high" ? 2.5 : 2}
                    />
                    <span className="capitalize">{opt}</span>
                    {task.priority === opt && (
                      <Icon
                        name="Check"
                        size={13}
                        className="justify-self-end"
                      />
                    )}
                  </div>
                </button>
              </PopoverClose>
            ))}
          </div>
        </MotionDiv>
      </PopoverContent>
    </Popover>
  );
};
