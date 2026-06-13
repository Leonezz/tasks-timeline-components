import type { ProviderConfig } from "../types";
import { AISDKProvider } from "./ai-sdk-provider";

export class OpenAIProvider extends AISDKProvider {
  constructor(config: ProviderConfig) {
    super("openai", config);
  }
}

export class OpenAICompatibleProvider extends AISDKProvider {
  constructor(config: ProviderConfig) {
    super("openai-compatible", config);
  }
}
