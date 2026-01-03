import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Icon } from "./Icon";
import type {
  AppSettings,
  ThemeOption,
  FilterState,
  SortState,
  SortField,
  FontSize,
  AIProvider,
  DateGroupBy,
  VoiceProvider,
} from "../types";
import { cn } from "../utils";
import { MotionDiv, MotionSpan } from "./Motion";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;

  filters: FilterState;
  onFilterChange: (f: FilterState) => void;
  sort: SortState;
  onSortChange: (s: SortState) => void;
  availableTags: string[];
  availableCategories: string[];
}

const THEMES: { id: ThemeOption; name: string; colors: string }[] = [
  { id: "light", name: "Light", colors: "bg-white border-slate-200" },
  { id: "dark", name: "Dark", colors: "bg-slate-900 border-slate-700" },
  { id: "midnight", name: "Midnight", colors: "bg-[#0B1120] border-slate-800" },
  { id: "coffee", name: "Coffee", colors: "bg-[#f5f2eb] border-[#e8e4db]" },
];

const FONT_SIZES: { id: FontSize; label: string; class: string }[] = [
  { id: "sm", label: "Small", class: "text-sm" },
  { id: "base", label: "Medium", class: "text-base" },
  { id: "lg", label: "Large", class: "text-lg" },
  { id: "xl", label: "Extra Large", class: "text-xl" },
];

const GROUP_STRATEGIES: { id: DateGroupBy; label: string }[] = [
  { id: "dueDate", label: "Due Date" },
  { id: "createdAt", label: "Created Date" },
  { id: "startAt", label: "Start Date" },
  { id: "completedAt", label: "Completed Date" },
];

const DATE_FORMATS = [
  { value: "MMM d", label: "Oct 24" },
  { value: "EEE, MMM d", label: "Mon, Oct 24" },
  { value: "yyyy-MM-dd", label: "2023-10-24" },
  { value: "dd/MM/yyyy", label: "24/10/2023" },
];

type Tab = "general" | "advanced" | "docs";

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  filters,
  onFilterChange,
  sort,
  onSortChange,
  availableTags,
  availableCategories,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [isCustomFormat, setIsCustomFormat] = useState(
    !DATE_FORMATS.some((f) => f.value === settings.dateFormat)
  );

  // -- App Settings Handlers --
  const toggleShowCompleted = () =>
    onUpdateSettings({ ...settings, showCompleted: !settings.showCompleted });
  const toggleRelativeDates = () =>
    onUpdateSettings({
      ...settings,
      useRelativeDates: !settings.useRelativeDates,
    });
  const toggleProgressBar = () =>
    onUpdateSettings({
      ...settings,
      showProgressBar: !settings.showProgressBar,
    });
  const toggleDefaultFocus = () =>
    onUpdateSettings({
      ...settings,
      defaultFocusMode: !settings.defaultFocusMode,
    });

  // Voice Input Handlers
  const toggleVoiceInput = () =>
    onUpdateSettings({
      ...settings,
      enableVoiceInput: !settings.enableVoiceInput,
    });
  const setVoiceProvider = (p: VoiceProvider) =>
    onUpdateSettings({ ...settings, voiceProvider: p });

  const setFontSize = (size: FontSize) =>
    onUpdateSettings({ ...settings, fontSize: size });
  const setTheme = (theme: ThemeOption) =>
    onUpdateSettings({ ...settings, theme });
  const setDateFormat = (fmt: string) =>
    onUpdateSettings({ ...settings, dateFormat: fmt });
  const setDefaultCategory = (cat: string) =>
    onUpdateSettings({ ...settings, defaultCategory: cat });

  const toggleGroupingStrategy = (s: DateGroupBy) => {
    const current = settings.groupingStrategy;
    const exists = current.includes(s);

    let newList: DateGroupBy[];
    if (exists) {
      if (current.length === 1) return;
      newList = current.filter((item) => item !== s);
    } else {
      newList = [...current, s];
    }
    onUpdateSettings({ ...settings, groupingStrategy: newList });
  };

  // -- AI Settings Handlers --
  const toggleAIEnabled = () =>
    onUpdateSettings({
      ...settings,
      aiConfig: { ...settings.aiConfig, enabled: !settings.aiConfig.enabled },
    });
  const toggleAIDefault = () =>
    onUpdateSettings({
      ...settings,
      aiConfig: {
        ...settings.aiConfig,
        defaultMode: !settings.aiConfig.defaultMode,
      },
    });
  const setAIProvider = (p: AIProvider) =>
    onUpdateSettings({
      ...settings,
      aiConfig: { ...settings.aiConfig, activeProvider: p },
    });

  const updateProviderConfig = (
    provider: AIProvider,
    field: "apiKey" | "baseUrl" | "model",
    value: string
  ) => {
    onUpdateSettings({
      ...settings,
      aiConfig: {
        ...settings.aiConfig,
        providers: {
          ...settings.aiConfig.providers,
          [provider]: {
            ...settings.aiConfig.providers[provider],
            [field]: value,
          },
        },
      },
    });
  };

  const activeProviderConfig =
    settings.aiConfig.providers[settings.aiConfig.activeProvider];

  const renderGeneral = () => (
    <div className="p-6 space-y-8">
      {/* Theme Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Appearance
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all outline-none",
                settings.theme === t.id
                  ? "border-blue-500 bg-blue-50/30 ring-2 ring-blue-200 dark:ring-blue-900"
                  : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              <div
                className={cn(
                  "w-full aspect-square rounded-lg shadow-sm border border-slate-200/20",
                  t.colors
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium truncate w-full text-center",
                  settings.theme === t.id ? "text-blue-600" : "text-slate-500"
                )}
              >
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Typography
        </h3>
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-500">
            Item Font Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {FONT_SIZES.map((f) => (
              <button
                key={f.id}
                onClick={() => setFontSize(f.id)}
                className={cn(
                  "py-2 px-1 rounded-lg border text-center transition-all",
                  settings.fontSize === f.id
                    ? "border-blue-500 bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-100 shadow-sm"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                <span className={cn("block leading-none mb-1", f.class)}>
                  Ag
                </span>
                <span className="text-[10px] opacity-70">{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* View Options */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          View Options
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">
                Show Completed
              </span>
              <span className="text-xs text-slate-400">
                Display finished items
              </span>
            </div>
            <button
              onClick={toggleShowCompleted}
              className={cn(
                "relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
                settings.showCompleted
                  ? "bg-blue-500"
                  : "bg-slate-200 dark:bg-slate-700"
              )}
            >
              <MotionSpan
                layout
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm block"
                animate={{ x: settings.showCompleted ? 16 : 0 }}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">
                Relative Dates
              </span>
              <span className="text-xs text-slate-400">
                e.g. "In 2 days", "Yesterday"
              </span>
            </div>
            <button
              onClick={toggleRelativeDates}
              className={cn(
                "relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
                settings.useRelativeDates
                  ? "bg-blue-500"
                  : "bg-slate-200 dark:bg-slate-700"
              )}
            >
              <MotionSpan
                layout
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm block"
                animate={{ x: settings.useRelativeDates ? 16 : 0 }}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">
                Progress Bars
              </span>
              <span className="text-xs text-slate-400">
                Show visual completion in timeline
              </span>
            </div>
            <button
              onClick={toggleProgressBar}
              className={cn(
                "relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
                settings.showProgressBar
                  ? "bg-blue-500"
                  : "bg-slate-200 dark:bg-slate-700"
              )}
            >
              <MotionSpan
                layout
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm block"
                animate={{ x: settings.showProgressBar ? 16 : 0 }}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">
                Default Focus Mode
              </span>
              <span className="text-xs text-slate-400">
                Start app in Focus Mode
              </span>
            </div>
            <button
              onClick={toggleDefaultFocus}
              className={cn(
                "relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
                settings.defaultFocusMode
                  ? "bg-blue-500"
                  : "bg-slate-200 dark:bg-slate-700"
              )}
            >
              <MotionSpan
                layout
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm block"
                animate={{ x: settings.defaultFocusMode ? 16 : 0 }}
              />
            </button>
          </div>

          {/* Date Format */}
          <div className="pt-2">
            <label className="text-xs font-medium text-slate-500 block mb-2">
              Date Format
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {DATE_FORMATS.map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => {
                    setDateFormat(fmt.value);
                    setIsCustomFormat(false);
                  }}
                  className={cn(
                    "px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left flex items-center justify-between",
                    !isCustomFormat && settings.dateFormat === fmt.value
                      ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span>{fmt.label}</span>
                  {!isCustomFormat && settings.dateFormat === fmt.value && (
                    <Icon name="Check" size={12} className="text-blue-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Custom Format Option */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCustomFormat(true)}
                className={cn(
                  "px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left flex items-center justify-between flex-1",
                  isCustomFormat
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
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
                  value={settings.dateFormat}
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
              Default Category
            </label>
            <div className="relative">
              <input
                type="text"
                list="category-suggestions"
                value={settings.defaultCategory}
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
              Group Tasks By (Multi-select)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GROUP_STRATEGIES.map((s) => {
                const isSelected = settings.groupingStrategy.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleGroupingStrategy(s.id)}
                    className={cn(
                      "px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left flex items-center justify-between group",
                      isSelected
                        ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
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
      </section>
    </div>
  );

  const renderAdvanced = () => (
    <div className="p-6 space-y-8 bg-slate-50/30 dark:bg-slate-900/20">
      {/* AI INTELLIGENCE */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Sparkles" size={12} className="text-blue-500" />
            AI Agent
          </div>
          {settings.totalTokenUsage > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-500 font-mono">
              <Icon name="Cpu" size={10} />
              <span>{settings.totalTokenUsage.toLocaleString()} tokens</span>
            </div>
          )}
        </h3>
        {/* ... AI Config Content ... */}
        <div className="space-y-6">
          {/* Enable AI */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">
                Enable AI Agent
              </span>
              <span className="text-xs text-slate-400">
                Allow AI to manage your tasks
              </span>
            </div>
            <button
              onClick={toggleAIEnabled}
              className={cn(
                "relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
                settings.aiConfig.enabled
                  ? "bg-blue-500"
                  : "bg-slate-200 dark:bg-slate-700"
              )}
            >
              <MotionSpan
                layout
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm block"
                animate={{ x: settings.aiConfig.enabled ? 16 : 0 }}
              />
            </button>
          </div>

          <AnimatePresence>
            {settings.aiConfig.enabled && (
              <MotionDiv
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-5 overflow-hidden"
              >
                {/* Default Mode */}
                <div className="flex items-center justify-between pl-2 border-l-2 border-slate-200 dark:border-slate-700 ml-1">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">
                      Default to AI
                    </span>
                    <span className="text-xs text-slate-400">
                      Use AI for all inputs by default
                    </span>
                  </div>
                  <button
                    onClick={toggleAIDefault}
                    className={cn(
                      "relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
                      settings.aiConfig.defaultMode
                        ? "bg-blue-500"
                        : "bg-slate-200 dark:bg-slate-700"
                    )}
                  >
                    <MotionSpan
                      layout
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm block"
                      animate={{ x: settings.aiConfig.defaultMode ? 16 : 0 }}
                    />
                  </button>
                </div>

                {/* AI Provider Selector */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
                    {(["gemini", "openai", "anthropic"] as AIProvider[]).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setAIProvider(p)}
                          className={cn(
                            "flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all",
                            settings.aiConfig.activeProvider === p
                              ? "bg-white dark:bg-slate-600 text-blue-600 shadow-sm"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                          )}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  {/* Provider Config Fields */}
                  <div className="space-y-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    {/* API Key Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={activeProviderConfig.apiKey}
                        onChange={(e) =>
                          updateProviderConfig(
                            settings.aiConfig.activeProvider,
                            "apiKey",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-blue-500 font-mono tracking-wide"
                        placeholder={
                          settings.aiConfig.activeProvider === "gemini"
                            ? "(Auto-configured via Env)"
                            : "sk-..."
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">
                          Model
                        </label>
                        <input
                          type="text"
                          value={activeProviderConfig.model}
                          onChange={(e) =>
                            updateProviderConfig(
                              settings.aiConfig.activeProvider,
                              "model",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">
                          Base URL
                        </label>
                        <input
                          type="text"
                          value={activeProviderConfig.baseUrl}
                          onChange={(e) =>
                            updateProviderConfig(
                              settings.aiConfig.activeProvider,
                              "baseUrl",
                              e.target.value
                            )
                          }
                          placeholder="Default"
                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Advanced Control Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Icon name="Filter" size={12} className="text-blue-500" />
          Advanced Control
        </h3>

        <div className="space-y-6">
          {/* Voice Input Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">
                  Voice Input
                </span>
                <span className="text-xs text-slate-400">
                  Enable microphone input
                </span>
              </div>
              <button
                onClick={toggleVoiceInput}
                className={cn(
                  "relative w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
                  settings.enableVoiceInput
                    ? "bg-emerald-500"
                    : "bg-slate-200 dark:bg-slate-700"
                )}
              >
                <MotionSpan
                  layout
                  className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm block"
                  animate={{ x: settings.enableVoiceInput ? 16 : 0 }}
                />
              </button>
            </div>

            {/* Voice Provider Config */}
            {settings.enableVoiceInput && (
              <div className="pt-2">
                <label className="text-xs font-medium text-slate-500 block mb-2">
                  Voice Provider
                </label>
                <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                  {(["browser", "gemini-whisper"] as VoiceProvider[]).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setVoiceProvider(p)}
                        className={cn(
                          "flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all",
                          settings.voiceProvider === p
                            ? "bg-white dark:bg-slate-600 text-blue-600 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                        )}
                      >
                        {p === "gemini-whisper" ? "Gemini" : "Browser"}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tags Filter */}
          <div className="space-y-3 border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
            <span className="text-sm font-medium text-slate-700 block">
              Tags Filter
            </span>
            <div className="flex flex-wrap gap-2">
              {availableTags.length === 0 && (
                <span className="text-xs text-slate-400 italic">
                  No tags found.
                </span>
              )}
              {availableTags.map((tag) => {
                const isActive = filters.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = isActive
                        ? filters.tags.filter((t) => t !== tag)
                        : [...filters.tags, tag];
                      onFilterChange({ ...filters, tags: newTags });
                    }}
                    className={cn(
                      "px-2 py-1 text-xs rounded-md border transition-all",
                      isActive
                        ? "bg-blue-100 border-blue-200 text-blue-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtering Logic */}
          <div className="space-y-3 border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 block">
                Script Filter
              </span>
              <button
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    enableScript: !filters.enableScript,
                  })
                }
                className={cn(
                  "relative w-7 h-4 rounded-full transition-colors focus:outline-none",
                  filters.enableScript
                    ? "bg-purple-500"
                    : "bg-slate-200 dark:bg-slate-700"
                )}
              >
                <MotionSpan
                  layout
                  className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm block"
                  animate={{ x: filters.enableScript ? 12 : 0 }}
                />
              </button>
            </div>

            <AnimatePresence>
              {filters.enableScript && (
                <MotionDiv
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={filters.script}
                    onChange={(e) =>
                      onFilterChange({ ...filters, script: e.target.value })
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

          {/* Sorting Logic */}
          <div className="space-y-3 border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
            <span className="text-sm font-medium text-slate-700 block">
              Default Sorting
            </span>
            <div className="flex gap-2">
              <select
                value={sort.field}
                onChange={(e) =>
                  onSortChange({ ...sort, field: e.target.value as SortField })
                }
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="dueDate">Due Date</option>
                <option value="createdAt">Created Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
                <option value="custom">Custom Script</option>
              </select>
              <button
                onClick={() =>
                  onSortChange({
                    ...sort,
                    direction: sort.direction === "asc" ? "desc" : "asc",
                  })
                }
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {sort.direction === "asc" ? "ASC" : "DESC"}
              </button>
            </div>

            <AnimatePresence>
              {sort.field === "custom" && (
                <MotionDiv
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={sort.script}
                    onChange={(e) =>
                      onSortChange({ ...sort, script: e.target.value })
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
        </div>
      </section>
    </div>
  );

  const renderDocumentation = () => (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/10">
      {/* Section: Task Lifecycle (Existing) */}
      <section>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Icon name="Activity" size={14} className="text-blue-500" />
          Task Lifecycle & Auto-Status
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
          The view automatically manages task statuses based on dates to keep
          your workflow organized. You rarely need to manually set status unless
          completing a task.
        </p>
        {/* ... Existing Lifecycle Cards ... */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="AlertCircle" size={14} className="text-rose-500" />
              <span className="font-bold text-slate-700 text-xs uppercase">
                Due / Overdue
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tasks due Today, Tomorrow, or in the past are automatically
              flagged as Urgent.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Clock" size={14} className="text-blue-500" />
              <span className="font-bold text-slate-700 text-xs uppercase">
                Scheduled (Doing)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tasks with a future Start Date are marked as Scheduled until that
              date arrives.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Zap" size={14} className="text-purple-500" />
              <span className="font-bold text-slate-700 text-xs uppercase">
                Unplanned
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tasks without dates that need immediate attention. You must
              manually set this.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Archive" size={14} className="text-slate-500" />
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

      <div className="h-px bg-slate-200 dark:bg-slate-700 w-full" />

      {/* Section: Scripting Guide (NEW) */}
      <section>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Icon name="Code2" size={14} className="text-emerald-500" />
          Scripting Guide
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
          Unlock advanced control by writing short JavaScript snippets to filter
          and sort your tasks precisely.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Icon name="Filter" size={12} className="text-slate-400" />
              Filter Script
            </h4>
            <div className="bg-[#1e1e1e] rounded-lg p-3 border border-slate-700 font-mono text-[10px] text-slate-300 shadow-inner">
              <p className="text-slate-500 mb-1">
                // Ex: Show only high priority tasks due today
              </p>
              <p>
                <span className="text-purple-400">const</span> today ={" "}
                <span className="text-blue-400">new</span>{" "}
                Date().toISOString().split('T')[0];
              </p>
              <p>
                <span className="text-purple-400">return</span> task.priority
                === 'high' && task.dueDate === today;
              </p>
            </div>
            <p className="text-xs text-slate-500">
              <b>Variable:</b> <code>task</code> (The Task object).
              <br />
              <b>Return:</b> <code>true</code> to keep, <code>false</code> to
              hide.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Icon name="ArrowUpDown" size={12} className="text-slate-400" />
              Sort Script
            </h4>
            <div className="bg-[#1e1e1e] rounded-lg p-3 border border-slate-700 font-mono text-[10px] text-slate-300 shadow-inner">
              <p className="text-slate-500 mb-1">
                // Ex: Sort by title length, then alphabetically
              </p>
              <p>
                <span className="text-purple-400">if</span> (a.title.length !==
                b.title.length) <span className="text-purple-400">return</span>{" "}
                a.title.length - b.title.length;
              </p>
              <p>
                <span className="text-purple-400">return</span>{" "}
                a.title.localeCompare(b.title);
              </p>
            </div>
            <p className="text-xs text-slate-500">
              <b>Variables:</b> <code>a</code>, <code>b</code> (Two Task objects
              to compare).
              <br />
              <b>Return:</b> Negative number if a &lt; b, Positive if a &gt; b,
              0 if equal.
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-slate-200 dark:bg-slate-700 w-full" />

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
                Click the microphone icon to speak. Supports natural language
                like "Buy milk tomorrow priority high".
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Icon name="TerminalSquare" size={16} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">AI Mode</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle AI mode to use Gemini. It can Create, Update, Query, and
                Delete tasks.
                <br />
                <em className="opacity-80">
                  Example: "Move all overdue tasks to next friday" or "Summarize
                  my high priority work".
                </em>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-slate-200 dark:bg-slate-700 w-full" />

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
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          />

          <MotionDiv
            initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-1/2 left-1/2 w-full max-w-2xl bg-paper rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] text-slate-900"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-paper/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-200">
                    <Icon name="Settings" size={18} />
                  </div>
                  <h2 className="font-bold text-slate-800 text-lg">Settings</h2>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button
                    onClick={() => setActiveTab("general")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      activeTab === "general"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setActiveTab("advanced")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      activeTab === "advanced"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Advanced
                  </button>
                  <button
                    onClick={() => setActiveTab("docs")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      activeTab === "docs"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Docs
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors outline-none"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-0 overflow-y-auto flex-1 min-h-100">
              {activeTab === "general" && renderGeneral()}
              {activeTab === "advanced" && renderAdvanced()}
              {activeTab === "docs" && renderDocumentation()}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center border-t border-slate-100 dark:border-slate-800 shrink-0">
              <p className="text-[10px] text-slate-400">
                Timeline Tasks View • v0.1.3
              </p>
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
};
