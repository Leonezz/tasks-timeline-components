import type { ProviderConfig } from "../types";
import { AISDKProvider } from "./ai-sdk-provider";
import type { ProviderRuntimeOptions } from "./types";

export class OpenAIProvider extends AISDKProvider {
  constructor(config: ProviderConfig, options?: ProviderRuntimeOptions) {
    super("openai", config, options);
  }
}

export class OpenAICompatibleProvider extends AISDKProvider {
  constructor(config: ProviderConfig, options?: ProviderRuntimeOptions) {
    super("openai-compatible", config, options);
  }
}
