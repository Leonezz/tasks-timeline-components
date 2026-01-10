import type { Task } from "@/types";
import { Icon } from "./Icon";
import { useAppContext } from "./AppContext";
import { MotionDiv } from "./Motion";
import { cn } from "@/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
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
  const { portalContainer } = useAppContext();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            badgeClass,
            "text-blue-600 bg-blue-50/80 border-blue-100/50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-colors"
          )}
          title="Click to remove"
        >
          <Icon name="Tag" size={10} />
          <span>{tag.name}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={4}
        className="z-9999 outline-none w-auto p-0"
        container={portalContainer}
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
