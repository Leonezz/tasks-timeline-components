import { useState, useRef, useEffect } from "react";
import type { FilterRule } from "@/types";
import { Icon } from "../Icon";

interface FilterChipInputProps<T extends string = string> {
  rule: FilterRule<T>;
  onChange: (rule: FilterRule<T>) => void;
  suggestions: T[];
  placeholder: string;
}

export const FilterChipInput = <T extends string = string>({
  rule,
  onChange,
  suggestions,
  placeholder,
}: FilterChipInputProps<T>) => {
  const [inputValue, setInputValue] = useState(""),
    [showSuggestions, setShowSuggestions] = useState(false),
    inputRef = useRef<HTMLInputElement>(null),
    containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      // Use composedPath() to traverse Shadow DOM boundaries
      const path = e.composedPath();
      if (!path.includes(containerRef.current)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = [...rule.include, ...rule.exclude],
    filteredSuggestions = suggestions.filter(
      (s) =>
        !allSelected.includes(s) &&
        s.toLowerCase().includes(inputValue.toLowerCase()),
    ),
    addChip = (value: T, mode: "include" | "exclude" = "include") => {
      if (allSelected.includes(value)) return;
      const updated =
        mode === "include"
          ? { ...rule, include: [...rule.include, value] }
          : { ...rule, exclude: [...rule.exclude, value] };
      onChange(updated);
      setInputValue("");
      setShowSuggestions(false);
    },
    removeChip = (value: T) => {
      onChange({
        include: rule.include.filter((v) => v !== value),
        exclude: rule.exclude.filter((v) => v !== value),
      });
    },
    toggleChip = (value: T) => {
      const isInclude = rule.include.includes(value);
      if (isInclude) {
        onChange({
          include: rule.include.filter((v) => v !== value),
          exclude: [...rule.exclude, value],
        });
      } else {
        onChange({
          include: [...rule.include, value],
          exclude: rule.exclude.filter((v) => v !== value),
        });
      }
    },
    handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && inputValue.trim()) {
        e.preventDefault();
        const match = filteredSuggestions.find(
          (s) => s.toLowerCase() === inputValue.toLowerCase(),
        );
        addChip((match || inputValue.trim()) as T);
      }
      if (e.key === "Backspace" && !inputValue && allSelected.length > 0) {
        const lastItem = allSelected[allSelected.length - 1];
        removeChip(lastItem);
      }
    };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-1.5 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg min-h-[38px] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
        {/* Include chips */}
        {rule.include.map((value) => (
          <button
            key={`inc-${value}`}
            type="button"
            className="group flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
            onClick={() => toggleChip(value)}
            title="Click to switch to exclude"
          >
            <Icon name="Plus" size={10} className="text-emerald-500 shrink-0" />
            <span className="truncate max-w-[120px]">{value}</span>
            <span
              role="button"
              className="ml-0.5 text-emerald-400 hover:text-red-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                removeChip(value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  removeChip(value);
                }
              }}
              tabIndex={0}
            >
              <Icon name="X" size={10} />
            </span>
          </button>
        ))}

        {/* Exclude chips */}
        {rule.exclude.map((value) => (
          <button
            key={`exc-${value}`}
            type="button"
            className="group flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 transition-all hover:bg-red-100 dark:hover:bg-red-900/50"
            onClick={() => toggleChip(value)}
            title="Click to switch to include"
          >
            <Icon name="Minus" size={10} className="text-red-500 shrink-0" />
            <span className="truncate max-w-[120px]">{value}</span>
            <span
              role="button"
              className="ml-0.5 text-red-400 hover:text-red-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                removeChip(value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  removeChip(value);
                }
              }}
              tabIndex={0}
            >
              <Icon name="X" size={10} />
            </span>
          </button>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[100px] bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400"
          placeholder={allSelected.length === 0 ? placeholder : ""}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="w-full px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addChip(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Hint */}
      {allSelected.length > 0 && (
        <p className="text-[10px] text-slate-400 mt-1 pl-1">
          <span className="text-emerald-500">Green</span> = include,{" "}
          <span className="text-red-500">Red</span> = exclude. Click chip to
          toggle.
        </p>
      )}
    </div>
  );
};
