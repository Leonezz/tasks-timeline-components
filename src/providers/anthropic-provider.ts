import type { ProviderConfig } from "../types";
import { AISDKProvider } from "./ai-sdk-provider";
import type { ProviderRuntimeOptions } from "./types";

export class AnthropicProvider extends AISDKProvider {
  constructor(config: ProviderConfig, options?: ProviderRuntimeOptions) {
    super("anthropic", config, options);
  }
}
