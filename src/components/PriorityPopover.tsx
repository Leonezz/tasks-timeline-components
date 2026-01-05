import type { Priority, Task } from "@/types";
import * as Popover from "@radix-ui/react-popover";
import { Icon } from "./Icon";
import { useAppContext } from "./AppContext";
import { MotionDiv } from "./Motion";
import { cn } from "@/utils";

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
  let colorClass = "text-slate-600 bg-slate-100 border-slate-200";
  if (p === "high") colorClass = "text-rose-700 bg-rose-100 border-rose-200";
  if (p === "medium")
    colorClass = "text-amber-700 bg-amber-100 border-amber-200";

  const { portalContainer } = useAppContext();

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className={cn(badgeClass, colorClass)} title="Change Priority">
          <Icon name="Flag" size={10} strokeWidth={p === "high" ? 3 : 2} />
          <span className="capitalize">{p}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal container={portalContainer}>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={4}
          className="z-9999 outline-none"
        >
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-1 rounded-lg border flex flex-col gap-1 w-24 shadow-2xl overflow-hidden ring-1 ring-slate-900/5 backdrop-blur-xl border-slate-200/60"
          >
            {(["high", "medium", "low"] as Priority[]).map((opt) => (
              <Popover.Close key={opt} asChild>
                <button
                  onClick={() => onUpdate({ ...task, priority: opt })}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 text-xs rounded-md text-left transition-colors justify-start!",
                    task.priority === opt
                      ? "bg-slate-100 font-bold"
                      : "hover:bg-slate-50 text-slate-600"
                  )}
                >
                  <Icon
                    name="Flag"
                    size={10}
                    className={
                      opt === "high"
                        ? "text-rose-500"
                        : opt === "medium"
                        ? "text-amber-500"
                        : "text-slate-400"
                    }
                  />
                  <span className="capitalize">{opt}</span>
                </button>
              </Popover.Close>
            ))}
          </MotionDiv>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
