import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, AppSettings } from "../types";
import { TaskItem } from "./TaskItem";
import { Icon } from "./Icon";

interface BacklogSectionProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  settings: AppSettings;
}

export const BacklogSection: React.FC<BacklogSectionProps> = ({
  tasks,
  onUpdateTask,
  onEditTask,
  onDeleteTask,
  settings,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mt-8 pt-4 border-t border-slate-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 mb-4 pl-2 w-full group outline-none"
      >
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

      <AnimatePresence initial={false}>
        {isOpen && (
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
                  onUpdate={onUpdateTask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  settings={settings}
                  missingStrategies={settings.groupingStrategy}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
