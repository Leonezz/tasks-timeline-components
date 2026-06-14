import type { DateGroupBy } from "@/types";
import { cn } from "@/utils";
import { MotionSpan } from "../Motion";
import { Icon } from "../Icon";
import { GROUP_STRATEGIES, DATE_FORMATS } from "./ViewSectionConstants";

interface ViewSectionProps {
  showCompleted: boolean;
  toggleShowCompleted: () => void;
  useRelativeDates: boolean;
  toggleRelativeDates: () => void;
  showProgressBar: boolean;
  toggleProgressBar: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  defaultFocusMode: boolean;
  toggleDefaultFocus: () => void;
  dateFormat: string;
  setDateFormat: (f: string) => void;
  isCustomFormat: boolean;
  setIsCustomFormat: (i: boolean) => void;
  defaultCategory: string;
  setDefaultCategory: (c: string) => void;
  availableCategories: string[];
  groupingStrategy: DateGroupBy[];
  toggleGroupingStrategy: (g: DateGroupBy) => void;
}

export const ViewSection = ({
  showCompleted,
  toggleShowCompleted,
  useRelativeDates,
  toggleRelativeDates,
  showProgressBar,
  toggleProgressBar,
  soundEnabled,
  toggleSound,
  defaultFocusMode,
  toggleDefaultFocus,
  setDateFormat,
  isCustomFormat,
  setIsCustomFormat,
  dateFormat,
  defaultCategory,
  setDefaultCategory,
  availableCategories,
  groupingStrategy,
  toggleGroupingStrategy,
}: ViewSectionProps) => (
  <>
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
      View options
    </h3>

    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">
            Show completed
          </span>
          <span className="text-xs text-slate-400">Display finished items</span>
        </div>
        <button
          type="button"
          onClick={toggleShowCompleted}
          aria-label="Show completed tasks"
          aria-pressed={showCompleted}
          className={cn(
            "relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
            showCompleted ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700",
          )}
        >
          <MotionSpan
            layout
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm block"
            animate={{ x: showCompleted ? 16 : 0 }}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">
            Relative dates
          </span>
          <span className="text-xs text-slate-400">
            e.g. "In 2 days", "Yesterday"
          </span>
        </div>
        <button
          type="button"
          onClick={toggleRelativeDates}
          aria-label="Use relative dates"
          aria-pressed={useRelativeDates}
          className={cn(
            "relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
            useRelativeDates ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700",
          )}
        >
          <MotionSpan
            layout
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm block"
            animate={{ x: useRelativeDates ? 16 : 0 }}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">
            Progress bars
          </span>
          <span className="text-xs text-slate-400">
            Show visual completion in timeline
          </span>
        </div>
        <button
          type="button"
          onClick={toggleProgressBar}
          aria-label="Show progress bars"
          aria-pressed={showProgressBar}
          className={cn(
            "relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
            showProgressBar ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700",
          )}
        >
          <MotionSpan
            layout
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm block"
            animate={{ x: showProgressBar ? 16 : 0 }}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">Sound</span>
          <span className="text-xs text-slate-400">Play sounds on actions</span>
        </div>
        <button
          type="button"
          onClick={toggleSound}
          aria-label="Enable sound"
          aria-pressed={soundEnabled}
          className={cn(
            "relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
            soundEnabled ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700",
          )}
        >
          <MotionSpan
            layout
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm block"
            animate={{ x: soundEnabled ? 16 : 0 }}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">
            Default focus mode
          </span>
          <span className="text-xs text-slate-400">
            Start app in focus mode
          </span>
        </div>
        <button
          type="button"
          onClick={toggleDefaultFocus}
          aria-label="Use focus mode by default"
          aria-pressed={defaultFocusMode}
          className={cn(
            "relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
            defaultFocusMode ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700",
          )}
        >
          <MotionSpan
            layout
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm block"
            animate={{ x: defaultFocusMode ? 16 : 0 }}
          />
        </button>
      </div>

      {/* Date Format */}
      <div className="pt-2">
        <label className="text-xs font-medium text-slate-500 block mb-2">
          Date format
        </label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {DATE_FORMATS.map((fmt) => (
            <button
              type="button"
              key={fmt.value}
              onClick={() => {
                setDateFormat(fmt.value);
                setIsCustomFormat(false);
              }}
              aria-label={`Use ${fmt.label} date format`}
              aria-pressed={!isCustomFormat && dateFormat === fmt.value}
              className={cn(
                "px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left flex items-center justify-between",
                !isCustomFormat && dateFormat === fmt.value
                  ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              <span>{fmt.label}</span>
              {!isCustomFormat && dateFormat === fmt.value && (
                <Icon name="Check" size={12} className="text-blue-500" />
              )}
            </button>
          ))}
        </div>

        {/* Custom Format Option */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCustomFormat(true)}
            aria-label="Use custom date format"
            aria-pressed={isCustomFormat}
            className={cn(
              "px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left flex items-center justify-between flex-1",
              isCustomFormat
                ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
            )}
          >
            <span>Custom...</span>
            {isCustomFormat && (
              <Icon name="Check" size={12} className="text-blue-500" />
            )}
          </button>
          {isCustomFormat && (
            <input
              type="text"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-mono"
              placeholder="yyyy/MM/dd HH:mm"
            />
          )}
        </div>
        {isCustomFormat && (
          <p className="text-[10px] text-slate-400 mt-1 pl-1">
            Uses Luxon format tokens (e.g. <code>EEE, MMM d</code>)
          </p>
        )}
      </div>

      {/* Default Category */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-medium text-slate-500 block mb-2">
          Default category
        </label>
        <div className="relative">
          <input
            type="text"
            aria-label="Default category"
            list="category-suggestions"
            value={defaultCategory}
            onChange={(e) => setDefaultCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
            placeholder="General"
          />
          <datalist id="category-suggestions">
            {availableCategories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Grouping Strategy */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-medium text-slate-500 block mb-2">
          Group tasks by
        </label>
        <div className="grid grid-cols-2 gap-2">
          {GROUP_STRATEGIES.map((s) => {
            const isSelected = groupingStrategy.includes(s.id);
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => toggleGroupingStrategy(s.id)}
                aria-label={`${isSelected ? "Remove" : "Add"} ${s.label} grouping`}
                aria-pressed={isSelected}
                className={cn(
                  "px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left flex items-center justify-between group",
                  isSelected
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                )}
              >
                <span>{s.label}</span>
                {isSelected && (
                  <Icon name="Check" size={12} className="text-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </>
);
