import { useId, useState } from "react";
import type {
  AIProvider,
  AppSettings,
  ProviderConfig,
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

const AI_PROVIDER_ORDER: AIProvider[] = [
  "gemini",
  "openai",
  "anthropic",
  "openai-compatible",
];

const VOICE_PROVIDER_LABELS: Record<VoiceProvider, string> = {
  browser: "Browser",
  openai: "OpenAI",
  gemini: "Gemini",
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
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-sonnet-4-20250514",
  },
  "openai-compatible": {
    apiKey: "Your API key",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
  },
};

const getProviderLabel = (provider: string): string =>
  AI_PROVIDER_LABELS[provider as AIProvider] ??
  provider.charAt(0).toUpperCase() + provider.slice(1);

const getProviderValidationMessage = (
  provider: AIProvider,
  config: ProviderConfig,
): string => {
  const label = AI_PROVIDER_LABELS[provider];

  if (!config.apiKey.trim()) {
    return `${label} API key is required.`;
  }

  if (provider === "openai-compatible" && !config.baseUrl.trim()) {
    return "Custom provider base URL is required.";
  }

  if (provider === "openai-compatible" && !config.model.trim()) {
    return "Custom provider model is required.";
  }

  return "";
};

interface SwitchButtonProps {
  ariaLabel: string;
  enabled: boolean;
  onClick: () => void;
  enabledClassName?: string;
  size?: "md" | "sm";
}

const SwitchButton = ({
  ariaLabel,
  enabled,
  onClick,
  enabledClassName = "bg-blue-500",
  size = "md",
}: SwitchButtonProps) => {
  const sizeClasses = size === "md" ? "h-6 w-10" : "h-5 w-9",
    knobClasses =
      size === "md" ? "top-1 left-1 h-4 w-4" : "top-1 left-1 h-3 w-3";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={enabled}
      onClick={onClick}
      className={cn(
        "relative rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
        sizeClasses,
        enabled ? enabledClassName : "bg-slate-200 dark:bg-slate-700",
      )}
    >
      <MotionSpan
        layout
        className={cn(
          "absolute block rounded-full bg-white shadow-sm",
          knobClasses,
        )}
        animate={{ x: enabled ? 16 : 0 }}
      />
    </button>
  );
};

interface SettingsPageAIProps {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
}
export const SettingsPageAI = ({
  settings,
  onUpdateSettings,
}: SettingsPageAIProps) => {
  const inputIdPrefix = useId(),
    tokenUsageByModel = settings.tokenUsageByModel ?? {},
    totalTokenUsage = settings.totalTokenUsage ?? 0;

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
    updateProviderResponsesApi = (provider: AIProvider, value: boolean) => {
      onUpdateSettings({
        ...settings,
        aiConfig: {
          ...settings.aiConfig,
          providers: {
            ...settings.aiConfig.providers,
            [provider]: {
              ...settings.aiConfig.providers[provider],
              useResponsesApi: value,
            },
          },
        },
      });
    },
    activeProvider = settings.aiConfig.activeProvider,
    activeProviderConfig = settings.aiConfig.providers[activeProvider],
    placeholders = AI_PROVIDER_PLACEHOLDERS[activeProvider],
    validationMessage = getProviderValidationMessage(
      activeProvider,
      activeProviderConfig,
    ),
    supportsResponsesApiToggle =
      activeProvider === "openai" || activeProvider === "openai-compatible",
    responsesApiEnabled =
      activeProviderConfig.useResponsesApi ?? activeProvider === "openai",
    apiKeyInputId = `${inputIdPrefix}-${activeProvider}-api-key`,
    modelInputId = `${inputIdPrefix}-${activeProvider}-model`,
    baseUrlInputId = `${inputIdPrefix}-${activeProvider}-base-url`,
    systemPromptInputId = `${inputIdPrefix}-system-prompt`,
    voiceOpenAiApiKeyInputId = `${inputIdPrefix}-voice-openai-api-key`,
    voiceOpenAiModelInputId = `${inputIdPrefix}-voice-openai-model`,
    voiceOpenAiBaseUrlInputId = `${inputIdPrefix}-voice-openai-base-url`,
    voiceGeminiApiKeyInputId = `${inputIdPrefix}-voice-gemini-api-key`,
    voiceGeminiModelInputId = `${inputIdPrefix}-voice-gemini-model`,
    voiceLanguageInputId = `${inputIdPrefix}-voice-language`;

  const [testResult, setTestResult] = useState<TestResult | null>(null),
    [isTesting, setIsTesting] = useState(false),
    handleTestConnection = async () => {
      if (validationMessage) {
        setTestResult({ success: false, message: validationMessage });
        return;
      }

      setIsTesting(true);
      setTestResult(null);
      const result = await testProvider(activeProvider, activeProviderConfig);
      setTestResult(result);
      setIsTesting(false);
    };

  const resetProviderField = (field: "baseUrl" | "model") => {
    const fallbackValue =
      activeProvider === "openai-compatible" ? placeholders[field] : "";
    updateProviderConfig(activeProvider, field, fallbackValue);
    setTestResult(null);
  };

  return (
    <div className="p-6 space-y-8 bg-slate-50/30 dark:bg-slate-900/20">
      {/* AI INTELLIGENCE */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Sparkles" size={12} className="text-blue-500" />
            AI agent
          </div>
          {totalTokenUsage > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-500 font-mono">
              <Icon name="Cpu" size={10} />
              <span>{totalTokenUsage.toLocaleString()} tokens</span>
            </div>
          )}
        </h3>

        {/* Token Usage Stats Table */}
        {Object.keys(tokenUsageByModel).length > 0 && (
          <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <th className="text-left px-3 py-1.5 font-semibold">
                    Provider
                  </th>
                  <th className="text-left px-3 py-1.5 font-semibold">Model</th>
                  <th className="text-right px-3 py-1.5 font-semibold">
                    Input
                  </th>
                  <th className="text-right px-3 py-1.5 font-semibold">
                    Output
                  </th>
                  <th className="text-right px-3 py-1.5 font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(tokenUsageByModel).map(([key, record]) => {
                  const separatorIndex = key.indexOf(":");
                  const provider =
                    separatorIndex > -1 ? key.slice(0, separatorIndex) : key;
                  const model =
                    separatorIndex > -1 ? key.slice(separatorIndex + 1) : "";
                  const providerLabel = getProviderLabel(provider);
                  return (
                    <tr
                      key={key}
                      className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                    >
                      <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400">
                        {providerLabel}
                      </td>
                      <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400 font-mono">
                        {model}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        {record.inputTokens.toLocaleString()}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        {record.outputTokens.toLocaleString()}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono text-slate-700 dark:text-slate-300 font-semibold">
                        {record.totalTokens.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                {/* Grand Total Row */}
                <tr className="border-t-2 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800">
                  <td
                    colSpan={2}
                    className="px-3 py-1.5 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Total
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-slate-700 dark:text-slate-300 font-semibold">
                    {Object.values(tokenUsageByModel)
                      .reduce((sum, r) => sum + r.inputTokens, 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-slate-700 dark:text-slate-300 font-semibold">
                    {Object.values(tokenUsageByModel)
                      .reduce((sum, r) => sum + r.outputTokens, 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-slate-700 dark:text-slate-300 font-semibold">
                    {Object.values(tokenUsageByModel)
                      .reduce((sum, r) => sum + r.totalTokens, 0)
                      .toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-end px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    totalTokenUsage: 0,
                    tokenUsageByModel: {},
                  })
                }
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Icon name="RotateCcw" size={10} />
                Reset stats
              </button>
            </div>
          </div>
        )}

        {/* ... AI Config Content ... */}
        <div className="space-y-6">
          {/* Enable AI */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">
                Enable AI agent
              </span>
              <span className="text-xs text-slate-400">
                Allow AI to manage your tasks
              </span>
            </div>
            <SwitchButton
              ariaLabel="Enable AI agent"
              enabled={settings.aiConfig.enabled}
              onClick={toggleAIEnabled}
            />
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
                  <SwitchButton
                    ariaLabel="Use AI by default"
                    enabled={settings.aiConfig.defaultMode}
                    onClick={toggleAIDefault}
                  />
                </div>

                {/* AI Provider Selector */}
                <div className="space-y-3">
                  <div
                    className="flex items-center gap-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg"
                    role="group"
                    aria-label="AI provider"
                  >
                    {AI_PROVIDER_ORDER.map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setAIProvider(p)}
                        aria-label={`Use ${AI_PROVIDER_LABELS[p]} provider`}
                        aria-pressed={activeProvider === p}
                        className={cn(
                          "flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all",
                          activeProvider === p
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
                      <label
                        htmlFor={apiKeyInputId}
                        className="text-[10px] font-semibold text-slate-500 uppercase"
                      >
                        API key
                      </label>
                      <input
                        id={apiKeyInputId}
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
                      <p className="text-[10px] text-slate-400">
                        Required for test connection and AI requests.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor={modelInputId}
                            className="text-[10px] font-semibold text-slate-500 uppercase"
                          >
                            Model
                          </label>
                          <button
                            type="button"
                            onClick={() => resetProviderField("model")}
                            className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            Use default
                          </button>
                        </div>
                        <input
                          id={modelInputId}
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
                        <p className="text-[10px] text-slate-400">
                          {activeProvider === "openai-compatible"
                            ? "Required for custom providers."
                            : `Blank uses ${placeholders.model}.`}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor={baseUrlInputId}
                            className="text-[10px] font-semibold text-slate-500 uppercase"
                          >
                            Base URL
                          </label>
                          <button
                            type="button"
                            onClick={() => resetProviderField("baseUrl")}
                            className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            Use default
                          </button>
                        </div>
                        <input
                          id={baseUrlInputId}
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
                        <p className="text-[10px] text-slate-400">
                          {activeProvider === "openai-compatible"
                            ? "Required for custom providers."
                            : "Blank uses the provider default."}
                        </p>
                      </div>
                    </div>

                    {supportsResponsesApiToggle && (
                      <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-2">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Responses API
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {activeProvider === "openai-compatible"
                              ? "Enable only if this provider supports /responses."
                              : "Turn off to use Chat Completions."}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            updateProviderResponsesApi(
                              activeProvider,
                              !responsesApiEnabled,
                            );
                            setTestResult(null);
                          }}
                          aria-label="Toggle Responses API"
                          aria-pressed={responsesApiEnabled}
                          className={cn(
                            "relative h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
                            responsesApiEnabled
                              ? "bg-blue-500"
                              : "bg-slate-200 dark:bg-slate-700",
                          )}
                        >
                          <MotionSpan
                            layout
                            className="absolute left-1 top-1 block h-3 w-3 rounded-full bg-white shadow-sm"
                            animate={{ x: responsesApiEnabled ? 16 : 0 }}
                          />
                        </button>
                      </div>
                    )}

                    {/* Test Connection Button */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className={cn(
                          "px-3 py-1.5 text-[10px] font-bold uppercase rounded-md border transition-all",
                          isTesting
                            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-wait"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300",
                        )}
                      >
                        {isTesting ? "Testing..." : "Test connection"}
                      </button>
                      {testResult && (
                        <div
                          role={testResult.success ? "status" : "alert"}
                          className={cn(
                            "min-w-0 flex flex-1 items-start gap-1 text-[10px]",
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
                            className="mt-0.5 shrink-0"
                          />
                          <span className="min-w-0 whitespace-pre-wrap break-words">
                            {testResult.message}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Custom System Prompt */}
                <div className="space-y-2">
                  <label
                    htmlFor={systemPromptInputId}
                    className="text-[10px] font-semibold text-slate-500 uppercase"
                  >
                    Custom system prompt
                  </label>
                  <textarea
                    id={systemPromptInputId}
                    value={settings.aiConfig.systemPrompt}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        aiConfig: {
                          ...settings.aiConfig,
                          systemPrompt: e.target.value,
                        },
                      })
                    }
                    className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono text-xs rounded-lg border border-slate-200 dark:border-slate-700 outline-none resize-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all leading-relaxed"
                    placeholder="Add custom instructions for the AI agent..."
                    spellCheck={false}
                  />
                  <p className="text-[10px] text-slate-400">
                    Additional instructions appended to the AI system prompt.
                  </p>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Voice Input Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Icon name="Mic" size={12} className="text-blue-500" />
          Voice input
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">
                Voice input
              </span>
              <span className="text-xs text-slate-400">
                Enable microphone input
              </span>
            </div>
            <SwitchButton
              ariaLabel="Enable voice input"
              enabled={settings.voiceConfig.enabled}
              onClick={toggleVoiceInput}
              enabledClassName="bg-emerald-500"
              size="sm"
            />
          </div>

          {/* Voice Provider Config */}
          {settings.voiceConfig.enabled && (
            <div className="pt-2 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
                  Voice provider
                </label>
                <div
                  className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg gap-1"
                  role="group"
                  aria-label="Voice provider"
                >
                  {(["browser", "openai", "gemini"] as VoiceProvider[]).map(
                    (p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setVoiceProvider(p)}
                        aria-label={`Use ${VOICE_PROVIDER_LABELS[p]} voice provider`}
                        aria-pressed={settings.voiceConfig.activeProvider === p}
                        className={cn(
                          "flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all",
                          settings.voiceConfig.activeProvider === p
                            ? "bg-white dark:bg-slate-600 text-blue-600 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700",
                        )}
                      >
                        {VOICE_PROVIDER_LABELS[p]}
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
                    <label
                      htmlFor={voiceOpenAiApiKeyInputId}
                      className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5"
                    >
                      OpenAI API key
                    </label>
                    <input
                      id={voiceOpenAiApiKeyInputId}
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
                    <label
                      htmlFor={voiceOpenAiModelInputId}
                      className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5"
                    >
                      Model
                    </label>
                    <input
                      id={voiceOpenAiModelInputId}
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
                    <label
                      htmlFor={voiceOpenAiBaseUrlInputId}
                      className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5"
                    >
                      Base URL (optional)
                    </label>
                    <input
                      id={voiceOpenAiBaseUrlInputId}
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
                    <label
                      htmlFor={voiceGeminiApiKeyInputId}
                      className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5"
                    >
                      Gemini API key
                    </label>
                    <input
                      id={voiceGeminiApiKeyInputId}
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
                    <label
                      htmlFor={voiceGeminiModelInputId}
                      className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5"
                    >
                      Model
                    </label>
                    <input
                      id={voiceGeminiModelInputId}
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
                <label
                  htmlFor={voiceLanguageInputId}
                  className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2"
                >
                  Voice language
                </label>
                <input
                  id={voiceLanguageInputId}
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
      </section>
    </div>
  );
};
