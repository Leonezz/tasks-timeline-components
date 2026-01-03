import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./Icon";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
            className="fixed top-1/2 left-1/2 w-full max-w-2xl bg-paper rounded-xl shadow-2xl z-50 border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh] flex flex-col text-slate-900"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-paper/50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-300">
                  <Icon name="BookOpen" size={18} />
                </div>
                <h2 className="font-bold text-slate-800 text-lg">
                  Documentation
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Section: Task Lifecycle */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Icon name="Activity" size={14} className="text-blue-500" />
                  Task Lifecycle & Auto-Status
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  The view automatically manages task statuses based on dates to
                  keep your workflow organized. You rarely need to manually set
                  status unless completing a task.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        name="AlertCircle"
                        size={14}
                        className="text-rose-500"
                      />
                      <span className="font-bold text-slate-700 text-xs uppercase">
                        Due / Overdue
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Tasks due Today, Tomorrow, or in the past are
                      automatically flagged as Urgent.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="Clock" size={14} className="text-blue-500" />
                      <span className="font-bold text-slate-700 text-xs uppercase">
                        Scheduled (Doing)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Tasks with a future Start Date are marked as Scheduled
                      until that date arrives.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="Zap" size={14} className="text-purple-500" />
                      <span className="font-bold text-slate-700 text-xs uppercase">
                        Unplanned
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Tasks without dates that need immediate attention. You
                      must manually set this.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        name="Archive"
                        size={14}
                        className="text-slate-500"
                      />
                      <span className="font-bold text-slate-700 text-xs uppercase">
                        Backlog
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Items with no Due Date or Start Date appear in the Backlog
                      section.
                    </p>
                  </div>
                </div>
              </section>

              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

              {/* Section: AI & Voice */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Icon name="Sparkles" size={14} className="text-purple-500" />
                  AI & Voice Intelligence
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                      <Icon name="Mic" size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        Voice Commands
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Click the microphone icon to speak. Supports natural
                        language like "Buy milk tomorrow priority high".
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                      <Icon name="TerminalSquare" size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        AI Mode
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Toggle AI mode to use Gemini. It can Create, Update,
                        Query, and Delete tasks.
                        <br />
                        <em className="opacity-80">
                          Example: "Move all overdue tasks to next friday" or
                          "Summarize my high priority work".
                        </em>
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

              {/* Section: Controls */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Icon name="Command" size={14} className="text-slate-500" />
                  Quick Controls
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">
                      Enter
                    </code>
                    <span>Save task / Submit command</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">
                      Double Click Delete
                    </code>
                    <span>Click trash icon once to arm, twice to delete.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">
                      Focus Mode
                    </code>
                    <span>Hides everything except Today's active tasks.</span>
                  </li>
                </ul>
              </section>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center border-t border-slate-100 dark:border-slate-800 shrink-0">
              <p className="text-[10px] text-slate-400">
                Tasks Timeline • v0.1.2
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
