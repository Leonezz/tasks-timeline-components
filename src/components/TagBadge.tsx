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
          className={cn(
            badgeClass,
            "text-blue-600 bg-blue-50/80 border-blue-100/50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-colors",
          )}
          title="Click to remove"
        >
          <Icon name="Tag" size={10} className="shrink-0" />
          <span className="truncate">{tag.name}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={4}
        className="z-9999 outline-none w-auto p-0"
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-1"
        >
          <PopoverClose asChild>
            <button
              onClick={() =>
                onUpdate({
                  ...task,
                  tags: task.tags.filter((t) => t.id !== tag.id),
                })
              }
              className="flex items-center gap-1.5 text-xs text-rose-600! px-2 py-1 rounded hover:bg-rose-50"
            >
              <Icon name="Trash" size={12} />
              Remove Tag
            </button>
          </PopoverClose>
        </MotionDiv>
      </PopoverContent>
    </Popover>
  );
};
