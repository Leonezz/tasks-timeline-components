import type {
  AIProvider,
  AppSettings,
  FilterState,
  SortField,
  SortState,
  VoiceProvider,
} from "@/types";
import { Icon } from "../Icon";
import { cn } from "@/utils";
import { MotionDiv, MotionSpan } from "../Motion";
import { AnimatePresence } from "framer-motion";

interface SettingsPageAdvancedProps {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  availableTags: string[];
}
export const SettingsPageAdvanced = ({
  settings,
  onUpdateSettings,
  availableTags,
}: SettingsPageAdvancedProps) => {
  // Voice Input Handlers
  const toggleVoiceInput = () =>
    onUpdateSettings({
      ...settings,
      enableVoiceInput: !settings.enableVoiceInput,
    });
  const setVoiceProvider = (p: VoiceProvider) =>
    onUpdateSettings({ ...settings, voiceProvider: p });

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
  const setFilters = (f: FilterState) =>
    onUpdateSettings({
      ...settings,
      filters: f,
    });
  const setSort = (s: SortState) =>
    onUpdateSettings({
      ...settings,
      sort: s,
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

  return (
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
                const isActive = settings.filters.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = isActive
                        ? settings.filters.tags.filter((t) => t !== tag)
                        : [...settings.filters.tags, tag];
                      setFilters({ ...settings.filters, tags: newTags });
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
                  setFilters({
                    ...settings.filters,
                    enableScript: !settings.filters.enableScript,
                  })
                }
                className={cn(
                  "relative w-7 h-4 rounded-full transition-colors focus:outline-none",
                  settings.filters.enableScript
                    ? "bg-purple-500"
                    : "bg-slate-200 dark:bg-slate-700"
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

          {/* Sorting Logic */}
          <div className="space-y-3 border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
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
                    direction:
                      settings.sort.direction === "asc" ? "desc" : "asc",
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
        </div>
      </section>
    </div>
  );
};
