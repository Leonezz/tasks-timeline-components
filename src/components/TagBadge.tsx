import type { Task } from "@/types";
import { Icon } from "./Icon";
import { MotionDiv } from "./Motion";
import { cn } from "@/utils";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

export interface TagBadgeProps {
  tag: { id: string; name: string };
  badgeClass: string;
  task: Task;
  onUpdate: (task: Task) => void;
}

export const TagBadge = ({
  tag,
  badgeClass,
  task,
  onUpdate,
}: TagBadgeProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            badgeClass,
            "group/tag border-blue-100/60 bg-blue-50/60 text-blue-700 hover:border-rose-100 hover:bg-rose-50/80 hover:text-rose-700",
          )}
          title="Remove tag"
        >
          <Icon name="Tag" size={10} className="shrink-0 opacity-80" />
          <span className="truncate">{tag.name}</span>
          <Icon
            name="X"
            size={10}
            className="hidden shrink-0 opacity-60 group-hover/tag:block group-focus-visible/tag:block"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={4}
        className="z-9999 w-48 rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 outline-none backdrop-blur"
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.98, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 4 }}
          transition={{ duration: 0.12 }}
        >
          <div className="border-b border-slate-100 px-2.5 pb-2 pt-1.5 text-xs font-semibold text-slate-700">
            Tag
          </div>
          <PopoverClose asChild>
            <button
              onClick={() =>
                onUpdate({
                  ...task,
                  tags: task.tags.filter((t) => t.id !== tag.id),
                })
              }
              className="mt-1 grid min-h-8 w-full grid-cols-[1rem_1fr_1rem] items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-rose-50/80 hover:text-rose-700 focus-visible:ring-2 focus-visible:ring-blue-500/30"
            >
              <Icon name="Tag" size={13} />
              <span className="truncate">{tag.name}</span>
              <Icon
                name="Trash"
                size={13}
                className="justify-self-end opacity-70"
              />
            </button>
          </PopoverClose>
        </MotionDiv>
      </PopoverContent>
    </Popover>
  );
};
