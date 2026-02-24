import type { EvalProviderConfig } from "./types";

export const EVAL_PROVIDERS: EvalProviderConfig[] = [
  {
    provider: "gemini",
    model: "gemini-2.0-flash",
    apiKeyEnv: "EVAL_GEMINI_API_KEY",
    default: true,
  },
  {
    provider: "openai",
    model: "gpt-4o",
    apiKeyEnv: "EVAL_OPENAI_API_KEY",
  },
  {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    apiKeyEnv: "EVAL_ANTHROPIC_API_KEY",
  },
  {
    provider: "openai-compatible",
    model: "deepseek-chat",
    apiKeyEnv: "EVAL_DEEPSEEK_API_KEY",
    baseUrl: "https://api.deepseek.com/v1",
  },
];

export function getActiveProviders(options: {
  all?: boolean;
  provider?: string;
}): EvalProviderConfig[] {
  let configs = EVAL_PROVIDERS;

  if (options.provider) {
    configs = configs.filter((c) => c.provider === options.provider);
  } else if (!options.all) {
    configs = configs.filter((c) => c.default);
  }

  // Only return providers with API keys available
  return configs.filter((c) => {
    const key = process.env[c.apiKeyEnv];
    if (!key) {
      console.warn(
        `Skipping ${c.provider}:${c.model} -- ${c.apiKeyEnv} not set`,
      );
      return false;
    }
    return true;
  });
}
