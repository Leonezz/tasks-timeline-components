import type {
  AppSettings,
  FilterState,
  Priority,
  SortField,
  SortState,
  TaskStatus,
} from "@/types";
import { Icon } from "../Icon";
import { cn } from "@/utils";
import { MotionDiv, MotionSpan } from "../Motion";
import { AnimatePresence } from "framer-motion";
import { FilterChipInput } from "./FilterChipInput";

const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high"];
const STATUS_OPTIONS: TaskStatus[] = [
  "todo",
  "doing",
  "done",
  "cancelled",
  "due",
  "overdue",
  "scheduled",
  "unplanned",
];

interface SettingsPageFiltersProps {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  availableTags: string[];
  availableCategories: string[];
}

export const SettingsPageFilters = ({
  settings,
  onUpdateSettings,
  availableTags,
  availableCategories,
}: SettingsPageFiltersProps) => {
  const setFilters = (f: FilterState) =>
      onUpdateSettings({ ...settings, filters: f }),
    setSort = (s: SortState) => onUpdateSettings({ ...settings, sort: s });

  return (
    <div className="p-6 space-y-8 bg-slate-50/30 dark:bg-slate-900/20">
      {/* Filters Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Icon name="Filter" size={12} className="text-blue-500" />
          Filters
        </h3>

        <div className="space-y-5">
          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 block">
              Tags
            </label>
            <FilterChipInput
              rule={settings.filters.tags}
              onChange={(tags) => setFilters({ ...settings.filters, tags })}
              suggestions={availableTags}
              placeholder="Type to filter by tag..."
            />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 block">
              Categories
            </label>
            <FilterChipInput
              rule={settings.filters.categories}
              onChange={(categories) =>
                setFilters({ ...settings.filters, categories })
              }
              suggestions={availableCategories}
              placeholder="Type to filter by category..."
            />
          </div>

          {/* Priorities */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 block">
              Priorities
            </label>
            <FilterChipInput
              rule={settings.filters.priorities}
              onChange={(priorities) =>
                setFilters({ ...settings.filters, priorities })
              }
              suggestions={PRIORITY_OPTIONS}
              placeholder="Type to filter by priority..."
            />
          </div>

          {/* Statuses */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 block">
              Statuses
            </label>
            <FilterChipInput
              rule={settings.filters.statuses}
              onChange={(statuses) =>
                setFilters({ ...settings.filters, statuses })
              }
              suggestions={STATUS_OPTIONS}
              placeholder="Type to filter by status..."
            />
          </div>

          {/* Script Filter - moved from Advanced */}
          <div className="space-y-3 border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 block">
                Script Filter
              </span>
              <button
                onClick={() =>
                  setFilters({
                    ...settings.filters,
                    enableScript: !settings.filters.enableScript,
                  })
                }
                className={cn(
                  "relative w-7 h-4 rounded-full transition-colors focus:outline-none",
                  settings.filters.enableScript
                    ? "bg-purple-500"
                    : "bg-slate-200 dark:bg-slate-700",
                )}
              >
                <MotionSpan
                  layout
                  className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm block"
                  animate={{ x: settings.filters.enableScript ? 12 : 0 }}
                />
              </button>
            </div>

            <AnimatePresence>
              {settings.filters.enableScript && (
                <MotionDiv
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={settings.filters.script}
                    onChange={(e) =>
                      setFilters({
                        ...settings.filters,
                        script: e.target.value,
                      })
                    }
                    className="w-full h-28 p-3 bg-[#1e1e1e] text-purple-300 font-mono text-xs rounded-lg border border-slate-700 outline-none resize-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-inner leading-relaxed"
                    placeholder="return task.priority === 'high';"
                    spellCheck={false}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Var: <code>task</code>. Use JS logic to return true/false.
                  </p>
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Sorting Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Icon name="ArrowUpDown" size={12} className="text-blue-500" />
          Sorting
        </h3>

        <div className="space-y-3">
          <span className="text-sm font-medium text-slate-700 block">
            Default Sorting
          </span>
          <div className="flex gap-2">
            <select
              value={settings.sort.field}
              onChange={(e) =>
                setSort({
                  ...settings.sort,
                  field: e.target.value as SortField,
                })
              }
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="dueAt">Due Date</option>
              <option value="createdAt">Created Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
              <option value="custom">Custom Script</option>
            </select>
            <button
              onClick={() =>
                setSort({
                  ...settings.sort,
                  direction: settings.sort.direction === "asc" ? "desc" : "asc",
                })
              }
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {settings.sort.direction === "asc" ? "ASC" : "DESC"}
            </button>
          </div>

          <AnimatePresence>
            {settings.sort.field === "custom" && (
              <MotionDiv
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <textarea
                  value={settings.sort.script}
                  onChange={(e) =>
                    setSort({ ...settings.sort, script: e.target.value })
                  }
                  className="w-full h-28 p-3 bg-[#1e1e1e] text-emerald-400 font-mono text-xs rounded-lg border border-slate-700 outline-none resize-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner leading-relaxed"
                  placeholder="return a.title.localeCompare(b.title);"
                  spellCheck={false}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Vars: <code>a</code>, <code>b</code>. Return -1, 0, 1.
                </p>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};
