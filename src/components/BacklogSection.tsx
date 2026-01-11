import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Task } from "../types";
import { TaskItem } from "./TaskItem";
import { Icon } from "./Icon";
import { useSettingsContext } from "../contexts/SettingsContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

interface BacklogSectionProps {
  tasks: Task[];
}

export const BacklogSection: React.FC<BacklogSectionProps> = ({ tasks }) => {
  const { settings } = useSettingsContext(),
   [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mt-8 pt-4 border-t border-slate-100">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 mb-4 pl-2 w-full group outline-none">
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-400"
            >
              <Icon name="ChevronRight" size={14} />
            </motion.div>

            <Icon name="Archive" size={14} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">
              Backlog / Undated
            </h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">
              {tasks.length}
            </span>
          </button>
        </CollapsibleTrigger>

        <AnimatePresence initial={false}>
          {isOpen && (
            <CollapsibleContent forceMount asChild>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-0.5">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      missingStrategies={settings.groupingStrategy}
                    />
                  ))}
                </div>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </Collapsible>
    </div>
  );
};
