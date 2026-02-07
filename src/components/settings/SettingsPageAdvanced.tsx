import { useState } from "react";
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
import { testProvider } from "@/providers";
import type { TestResult } from "@/providers/types";
import { MotionDiv, MotionSpan } from "../Motion";
import { AnimatePresence } from "framer-motion";

const AI_PROVIDER_LABELS: Record<AIProvider, string> = {
  gemini: "Gemini",
  openai: "OpenAI",
  anthropic: "Anthropic",
  "openai-compatible": "Custom",
};

const AI_PROVIDER_PLACEHOLDERS: Record<
  AIProvider,
  { apiKey: string; baseUrl: string; model: string }
> = {
  gemini: {
    apiKey: "AIza...",
    baseUrl: "(Default)",
    model: "gemini-2.0-flash",
  },
  openai: {
    apiKey: "sk-...",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o",
  },
  anthropic: {
    apiKey: "sk-ant-...",
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-20250514",
  },
  "openai-compatible": {
    apiKey: "Your API key",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
  },
};

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
        voiceConfig: {
          ...settings.voiceConfig,
          enabled: !settings.voiceConfig.enabled,
        },
      }),
    setVoiceProvider = (p: VoiceProvider) =>
      onUpdateSettings({
        ...settings,
        voiceConfig: { ...settings.voiceConfig, activeProvider: p },
      }),
    updateVoiceProviderConfig = (
      provider: "openai" | "gemini",
      field: "apiKey" | "baseUrl" | "model",
      value: string,
    ) => {
      onUpdateSettings({
        ...settings,
        voiceConfig: {
          ...settings.voiceConfig,
          providers: {
            ...settings.voiceConfig.providers,
            [provider]: {
              ...settings.voiceConfig.providers[provider],
              [field]: value,
            },
          },
        },
      });
    },
    // -- AI Settings Handlers --
    toggleAIEnabled = () =>
      onUpdateSettings({
        ...settings,
        aiConfig: { ...settings.aiConfig, enabled: !settings.aiConfig.enabled },
      }),
    toggleAIDefault = () =>
      onUpdateSettings({
        ...settings,
        aiConfig: {
          ...settings.aiConfig,
          defaultMode: !settings.aiConfig.defaultMode,
        },
      }),
    setAIProvider = (p: AIProvider) =>
      onUpdateSettings({
        ...settings,
        aiConfig: { ...settings.aiConfig, activeProvider: p },
      }),
    setFilters = (f: FilterState) =>
      onUpdateSettings({
        ...settings,
        filters: f,
      }),
    setSort = (s: SortState) =>
      onUpdateSettings({
        ...settings,
        sort: s,
      }),
    updateProviderConfig = (
      provider: AIProvider,
      field: "apiKey" | "baseUrl" | "model",
      value: string,
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
    },
    activeProviderConfig =
      settings.aiConfig.providers[settings.aiConfig.activeProvider],
    placeholders = AI_PROVIDER_PLACEHOLDERS[settings.aiConfig.activeProvider];

  const [testResult, setTestResult] = useState<TestResult | null>(null),
    [isTesting, setIsTesting] = useState(false),
    handleTestConnection = async () => {
      setIsTesting(true);
      setTestResult(null);
      const result = await testProvider(
        settings.aiConfig.activeProvider,
        activeProviderConfig,
      );
      setTestResult(result);
      setIsTesting(false);
    };

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
                  : "bg-slate-200 dark:bg-slate-700",
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
                        : "bg-slate-200 dark:bg-slate-700",
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
                    {(
                      [
                        "gemini",
                        "openai",
                        "anthropic",
                        "openai-compatible",
                      ] as AIProvider[]
                    ).map((p) => (
                      <button
                        key={p}
                        onClick={() => setAIProvider(p)}
                        className={cn(
                          "flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all",
                          settings.aiConfig.activeProvider === p
                            ? "bg-white dark:bg-slate-600 text-blue-600 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700",
                        )}
                      >
                        {AI_PROVIDER_LABELS[p]}
                      </button>
                    ))}
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
                        onChange={(e) => {
                          updateProviderConfig(
                            settings.aiConfig.activeProvider,
                            "apiKey",
                            e.target.value,
                          );
                          setTestResult(null);
                        }}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-blue-500 font-mono tracking-wide"
                        placeholder={placeholders.apiKey}
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
                          onChange={(e) => {
                            updateProviderConfig(
                              settings.aiConfig.activeProvider,
                              "model",
                              e.target.value,
                            );
                            setTestResult(null);
                          }}
                          placeholder={placeholders.model}
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
                          onChange={(e) => {
                            updateProviderConfig(
                              settings.aiConfig.activeProvider,
                              "baseUrl",
                              e.target.value,
                            );
                            setTestResult(null);
                          }}
                          placeholder={placeholders.baseUrl}
                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Test Connection Button */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className={cn(
                          "px-3 py-1.5 text-[10px] font-bold uppercase rounded-md border transition-all",
                          isTesting
                            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-wait"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300",
                        )}
                      >
                        {isTesting ? "Testing..." : "Test Connection"}
                      </button>
                      {testResult && (
                        <span
                          className={cn(
                            "text-[10px] flex items-center gap-1",
                            testResult.success
                              ? "text-emerald-600"
                              : "text-red-500",
                          )}
                        >
                          <Icon
                            name={
                              testResult.success ? "CheckCircle2" : "XCircle"
                            }
                            size={12}
                          />
                          {testResult.message.length > 60
                            ? testResult.message.slice(0, 60) + "..."
                            : testResult.message}
                        </span>
                      )}
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
                  settings.voiceConfig.enabled
                    ? "bg-emerald-500"
                    : "bg-slate-200 dark:bg-slate-700",
                )}
              >
                <MotionSpan
                  layout
                  className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm block"
                  animate={{ x: settings.voiceConfig.enabled ? 16 : 0 }}
                />
              </button>
            </div>

            {/* Voice Provider Config */}
            {settings.voiceConfig.enabled && (
              <div className="pt-2 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
                    Voice Provider
                  </label>
                  <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg gap-1">
                    {(["browser", "openai", "gemini"] as VoiceProvider[]).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setVoiceProvider(p)}
                          className={cn(
                            "flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all",
                            settings.voiceConfig.activeProvider === p
                              ? "bg-white dark:bg-slate-600 text-blue-600 shadow-sm"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-700",
                          )}
                        >
                          {p === "openai"
                            ? "OpenAI"
                            : p === "gemini"
                              ? "Gemini"
                              : "Browser"}
                        </button>
                      ),
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {settings.voiceConfig.activeProvider === "browser" &&
                      "Uses Web Speech API (free, requires internet in Chrome/Edge)"}
                    {settings.voiceConfig.activeProvider === "openai" &&
                      "OpenAI Whisper (requires API key, highly accurate)"}
                    {settings.voiceConfig.activeProvider === "gemini" &&
                      "Google Gemini (requires API key, supports audio transcription)"}
                  </p>
                </div>

                {/* OpenAI Provider Config */}
                {settings.voiceConfig.activeProvider === "openai" && (
                  <div className="space-y-3 pl-3 border-l-2 border-blue-200 dark:border-blue-800">
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                        OpenAI API Key
                      </label>
                      <input
                        type="password"
                        value={settings.voiceConfig.providers.openai.apiKey}
                        onChange={(e) =>
                          updateVoiceProviderConfig(
                            "openai",
                            "apiKey",
                            e.target.value,
                          )
                        }
                        placeholder="sk-..."
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                        Model
                      </label>
                      <input
                        type="text"
                        value={settings.voiceConfig.providers.openai.model}
                        onChange={(e) =>
                          updateVoiceProviderConfig(
                            "openai",
                            "model",
                            e.target.value,
                          )
                        }
                        placeholder="whisper-1"
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                        Base URL (optional)
                      </label>
                      <input
                        type="text"
                        value={settings.voiceConfig.providers.openai.baseUrl}
                        onChange={(e) =>
                          updateVoiceProviderConfig(
                            "openai",
                            "baseUrl",
                            e.target.value,
                          )
                        }
                        placeholder="https://api.openai.com/v1/audio/transcriptions"
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}

                {/* Gemini Provider Config */}
                {settings.voiceConfig.activeProvider === "gemini" && (
                  <div className="space-y-3 pl-3 border-l-2 border-purple-200 dark:border-purple-800">
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                        Gemini API Key
                      </label>
                      <input
                        type="password"
                        value={settings.voiceConfig.providers.gemini.apiKey}
                        onChange={(e) =>
                          updateVoiceProviderConfig(
                            "gemini",
                            "apiKey",
                            e.target.value,
                          )
                        }
                        placeholder="AIza..."
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                        Model
                      </label>
                      <input
                        type="text"
                        value={settings.voiceConfig.providers.gemini.model}
                        onChange={(e) =>
                          updateVoiceProviderConfig(
                            "gemini",
                            "model",
                            e.target.value,
                          )
                        }
                        placeholder="gemini-1.5-flash"
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
                    Voice Language
                  </label>
                  <input
                    type="text"
                    value={settings.voiceConfig.language}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        voiceConfig: {
                          ...settings.voiceConfig,
                          language: e.target.value,
                        },
                      })
                    }
                    placeholder="System default"
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Leave empty for system language. Examples: en-US, zh-CN,
                    ja-JP, es-ES
                  </p>
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
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
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
