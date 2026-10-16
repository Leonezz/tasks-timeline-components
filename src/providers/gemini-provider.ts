import type { ProviderConfig } from "../types";
import { AISDKProvider } from "./ai-sdk-provider";
import type { ProviderRuntimeOptions } from "./types";

export class GeminiProvider extends AISDKProvider {
  constructor(config: ProviderConfig, options?: ProviderRuntimeOptions) {
    super("gemini", config, options);
  }
}
