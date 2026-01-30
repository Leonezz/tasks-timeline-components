import React, { useState } from "react";
import * as Lucide from "lucide-react";
import { Icon } from "./Icon";
import type {
  FilterState,
  Priority,
  SortField,
  SortState,
  TaskStatus,
} from "../types";
import { cn, parseTaskString } from "../utils";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { MotionButton, MotionDiv } from "./Motion";
import { useTasksContext } from "../contexts/TasksContext";
import { useSettingsContext } from "../contexts/SettingsContext";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface InputBarProps {}

export const InputBar: React.FC<InputBarProps> = () => {
  const { onAddTask, onAICommand, availableTags, availableCategories } =
      useTasksContext(),
    {
      settings,
      filters,
      onFilterChange,
      sort,
      onSortChange,
      isAiMode,
      toggleAiMode,
      onVoiceError,
      onOpenSettings,
    } = useSettingsContext(),
    [value, setValue] = useState(""),
    [isLoading, setIsLoading] = useState(false),
    // Use shared voice hook
    { isListening, start } = useVoiceInput(
      settings.enableVoiceInput,
      (text) => setValue((prev) => (prev ? `${prev} ${text}` : text)),
      onVoiceError,
    ),
    effectiveAiActive = settings.aiConfig.enabled && isAiMode,
    handleSubmit = async () => {
      if (!value.trim() || isLoading) {
        return;
      }
      setIsLoading(true);
      try {
        if (effectiveAiActive) {
          await onAICommand(value);
        } else {
          const taskPart = parseTaskString(value);
          onAddTask(taskPart);
        }
        setValue("");
      } catch (e) {
        console.error("Failed to parse task", e);
      } finally {
        setIsLoading(false);
      }
    },
    handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    },
    toggleFilter = (key: keyof FilterState, value: string) => {
      const currentList = filters[key];
      if (Array.isArray(currentList)) {
        // Safe cast because we only call this with values appropriate for the key (Tags, Cats, etc.)
        const list = currentList as string[],
          newList = list.includes(value)
            ? list.filter((item) => item !== value)
            : [...list, value];
        // Dynamic key assignment requires partial cast or specific handling, partial cast is cleanest here for brevity
        onFilterChange({ ...filters, [key]: newList });
      }
    },
    clearFilterKey = (key: keyof FilterState) => {
      onFilterChange({ ...filters, [key]: [] });
    },
    isActive = (key: keyof FilterState) => {
      const val = filters[key];
      if (Array.isArray(val)) {
        return val.length > 0;
      }
      if (typeof val === "string") {
        return val.length > 0;
      }
      return false;
    },
    getStatusIcon = (status: TaskStatus): keyof typeof Lucide => {
      switch (status) {
        case "todo":
          return "Circle";
        case "doing":
          return "PlayCircle";
        case "done":
          return "CheckCircle2";
        case "scheduled":
          return "Clock";
        case "due":
          return "AlertCircle";
        case "overdue":
          return "AlertTriangle";
        case "cancelled":
          return "XCircle";
        case "unplanned":
          return "Zap";
        default:
          return "Circle";
      }
    },
    getStatusColor = (status: TaskStatus) => {
      switch (status) {
        case "done":
          return "text-emerald-500";
        case "doing":
          return "text-sky-500";
        case "scheduled":
          return "text-blue-500";
        case "due":
          return "text-amber-500";
        case "overdue":
          return "text-rose-500";
        case "cancelled":
          return "text-slate-400";
        case "unplanned":
          return "text-purple-500";
        default:
          return "text-slate-400";
      }
    },
    getPriorityColor = (p: Priority) => {
      switch (p) {
        case "high":
          return "text-rose-500";
        case "medium":
          return "text-amber-500";
        case "low":
          return "text-blue-400";
      }
    };

  return (
    <div className="pt-3 pb-1">
      <div className="max-w-3xl mx-auto px-2 min-[400px]:px-4 sm:px-6">
        <div className="relative group z-10">
          <div className="absolute inset-y-0 left-2 min-[400px]:left-3 flex items-center pointer-events-none z-10">
            {isLoading ? (
              <MotionDiv
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="text-blue-500"
              >
                <Icon name="Loader2" size={16} />
              </MotionDiv>
            ) : effectiveAiActive ? (
              <MotionDiv
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-purple-500"
              >
                <Icon name="Sparkles" size={16} />
              </MotionDiv>
            ) : (
              <div className="text-slate-400">
                <Icon name="PlusCircle" size={16} />
              </div>
            )}
          </div>

          <input
            type="text"
            className={cn(
              "w-full bg-white pl-8 min-[400px]:pl-10 pr-20 min-[400px]:pr-24 py-2 min-[400px]:py-2.5 rounded-xl border shadow-sm text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 font-medium",
              effectiveAiActive
                ? "border-purple-200 focus:border-purple-400 focus:ring-purple-400/20"
                : "border-slate-200 focus:border-slate-400 focus:ring-slate-400/20",
            )}
            placeholder={
              isListening
                ? "Listening..."
                : effectiveAiActive
                  ? "Describe tasks using natural language..."
                  : window.innerWidth < 530
                    ? "Quick add task..."
                    : "Quick add (e.g., 'Meeting due:tomorrow p:high')"
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isListening}
          />

          <div className="absolute inset-y-0 right-2 min-[400px]:right-3 flex items-center gap-0.5 min-[400px]:gap-1">
            {/* Voice Input Button */}
            {settings.enableVoiceInput && (
              <button
                onClick={start}
                className={cn(
                  "p-1 min-[400px]:p-1.5 rounded-md transition-all duration-200 relative",
                  isListening
                    ? "text-rose-500 bg-rose-50 animate-pulse"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
                )}
                disabled={isListening}
                title="Voice Input"
              >
                <Icon name={isListening ? "Mic" : "Mic"} size={16} />
              </button>
            )}

            {settings.aiConfig.enabled && (
              <button
                onClick={toggleAiMode}
                className={cn(
                  "p-1 min-[400px]:p-1.5 rounded-md transition-all duration-200",
                  effectiveAiActive
                    ? "text-purple-600 bg-purple-50 hover:bg-purple-100 ring-1 ring-purple-200"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
                )}
                title={
                  effectiveAiActive
                    ? "Switch to Manual Mode"
                    : "Switch to AI Mode"
                }
              >
                <Icon
                  name={effectiveAiActive ? "Sparkles" : "TerminalSquare"}
                  size={16}
                />
              </button>
            )}
            {onOpenSettings && settings.settingButtonOnInputBar !== false && (
              <>
                <div className="w-px h-4 bg-slate-200 mx-0.5 min-[400px]:mx-1" />
                <button
                  onClick={onOpenSettings}
                  className="text-slate-400 hover:text-blue-600 p-1 min-[400px]:p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                  title="Settings & Docs"
                >
                  <Icon name="Settings" size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter Chips & Sort (Existing Code) */}
        <div className="relative">
          {/* Left fade gradient */}
          <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />

          <div className="flex items-center gap-1.5 min-[400px]:gap-2 mt-2 overflow-x-auto no-scrollbar pb-2 pl-0.5 min-[400px]:pl-1 pr-2 min-[400px]:pr-4">
            {settings.tagsFilterOnInputBar !== false && (
              <FilterPopover
                label="Tags"
                isActive={isActive("tags")}
                count={filters.tags.length}
                onClear={() => clearFilterKey("tags")}
              >
                <div className="space-y-0.5">
                  {availableTags.length === 0 && (
                    <div className="text-xs text-slate-400 p-2 italic text-center">
                      No tags available
                    </div>
                  )}
                  {availableTags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-300 font-mono rounded-lg cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={filters.tags.includes(tag)}
                        onChange={() => toggleFilter("tags", tag)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Icon
                        name="Tag"
                        size={12}
                        className="text-blue-500 opacity-70 group-hover:opacity-100"
                      />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900">
                        {tag}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterPopover>
            )}

            {settings.categoriesFilterOnInputBar !== false && (
              <FilterPopover
                label="Categories"
                isActive={isActive("categories")}
                count={filters.categories.length}
                onClear={() => clearFilterKey("categories")}
              >
                <div className="space-y-0.5">
                  {availableCategories.length === 0 && (
                    <div className="text-xs text-slate-400 p-2 italic text-center">
                      No categories available
                    </div>
                  )}
                  {availableCategories.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-300 font-mono rounded-lg cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(cat)}
                        onChange={() => toggleFilter("categories", cat)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Icon
                        name="Folder"
                        size={12}
                        className="text-amber-500 opacity-70 group-hover:opacity-100"
                      />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900">
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterPopover>
            )}
            {settings.priorityFilterOnInputBar !== false && (
              <FilterPopover
                label="Priority"
                isActive={isActive("priorities")}
                count={filters.priorities.length}
                onClear={() => clearFilterKey("priorities")}
              >
                <div className="space-y-0.5">
                  {(["low", "medium", "high"] as Priority[]).map((p) => (
                    <label
                      key={p}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-300 font-mono rounded-lg cursor-pointer capitalize transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={filters.priorities.includes(p)}
                        onChange={() => toggleFilter("priorities", p)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Icon
                        name="Flag"
                        size={12}
                        className={cn("opacity-80", getPriorityColor(p))}
                        fill="currentColor"
                      />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900">
                        {p}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterPopover>
            )}
            {settings.statusFilterOnInputBar !== false && (
              <FilterPopover
                label="Status"
                isActive={isActive("statuses")}
                count={filters.statuses.length}
                onClear={() => clearFilterKey("statuses")}
              >
                <div className="space-y-0.5">
                  {(
                    [
                      "todo",
                      "doing",
                      "scheduled",
                      "done",
                      "due",
                      "overdue",
                      "cancelled",
                      "unplanned",
                    ] as TaskStatus[]
                  ).map((s) => (
                    <label
                      key={s}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-300 font-mono rounded-lg cursor-pointer capitalize transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(s)}
                        onChange={() => toggleFilter("statuses", s)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Icon
                        name={getStatusIcon(s)}
                        size={13}
                        className={cn("opacity-80", getStatusColor(s))}
                      />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900">
                        {s}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterPopover>
            )}

            {(settings.tagsFilterOnInputBar !== false ||
              settings.categoriesFilterOnInputBar !== false ||
              settings.priorityFilterOnInputBar !== false ||
              settings.statusFilterOnInputBar !== false) &&
              settings.sortOnInputBar !== false && (
                <div className="w-px h-4 bg-slate-300 mx-1 shrink-0 hidden min-[550px]:block" />
              )}
            {settings.sortOnInputBar !== false && (
              <div className="hidden min-[550px]:block">
                <SortPopover sort={sort} onSortChange={onSortChange} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface FilterPopoverProps {
  label: string;
  isActive: boolean;
  count: number;
  children: React.ReactNode;
  onClear: () => void;
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
  label,
  isActive,
  count,
  children,
  onClear,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <MotionButton
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-1 min-[400px]:gap-1.5 px-2 min-[400px]:px-3 py-1 min-[400px]:py-1.5 text-xs font-medium rounded-full border transition-all shrink-0 outline-none select-none",
            isActive
              ? "bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-200"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800",
          )}
        >
          {label}
          {isActive && (
            <span className="flex items-center justify-center bg-white text-slate-900 text-[9px] font-bold h-4 min-w-4 px-0.5 rounded-full">
              {count}
            </span>
          )}
          <Icon
            name="ChevronDown"
            size={12}
            className={cn(
              "transition-transform duration-200",
              isActive ? "text-slate-300" : "opacity-40",
            )}
          />
        </MotionButton>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        collisionPadding={16}
        className="outline-none w-auto p-0"
        style={{ zIndex: 99999 }}
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="w-56 bg-slate-50 border border-slate-200 shadow-lg rounded-lg overflow-hidden p-1"
        >
          <div className="flex justify-between items-center px-3 py-2 border-b border-slate-200 mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {label}
            </span>
            {isActive && (
              <button
                onClick={onClear}
                className="text-[10px] font-medium text-rose-500 hover:text-rose-600 px-1.5 py-0.5 rounded hover:bg-rose-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {children}
          </div>
        </MotionDiv>
      </PopoverContent>
    </Popover>
  );
};

interface SortPopoverProps {
  sort: SortState;
  onSortChange: (s: SortState) => void;
}

const SortPopover: React.FC<SortPopoverProps> = ({ sort, onSortChange }) => {
  const fields: {
    label: string;
    value: SortField;
    icon: keyof typeof Lucide;
  }[] = [
    { label: "Due Date", value: "dueAt", icon: "Calendar" },
    { label: "Created Date", value: "createdAt", icon: "Clock" },
    { label: "Priority", value: "priority", icon: "Flag" },
    { label: "Title", value: "title", icon: "Type" },
  ];

  const handleFieldSelect = (field: SortField) => {
    if (sort.field === field) {
      onSortChange({
        ...sort,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ ...sort, field, direction: "asc" });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 min-[400px]:gap-1.5 px-2 min-[400px]:px-3 py-1 min-[400px]:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-all shrink-0 outline-none ml-auto active:scale-95">
          <Icon name="ArrowUpDown" size={12} />
          <span>Sort</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="outline-none w-auto p-0"
        style={{ zIndex: 99999 }}
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="w-48 bg-slate-50 border border-slate-200 shadow-lg rounded-lg overflow-hidden p-1"
        >
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200 mb-1">
            Sort By
          </div>
          <div className="flex flex-col gap-0.5">
            {fields.map((f) => {
              const isSelected = sort.field === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => handleFieldSelect(f.value)}
                >
                  <div
                    className={cn(
                      "flex items-center justify-start! text-sm rounded-lg outline-none hover:bg-slate-300 font-mono w-full p-2",
                      isSelected
                        ? "text-slate-900"
                        : "text-slate-600 hover:text-slate-900",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        name={f.icon}
                        size={14}
                        className={isSelected ? "text-blue-500" : "opacity-70"}
                      />
                      <span>{f.label}</span>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-1 text-blue-500">
                        <Icon
                          name={
                            sort.direction === "asc" ? "ArrowUp" : "ArrowDown"
                          }
                          size={18}
                        />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </MotionDiv>
      </PopoverContent>
    </Popover>
  );
};
