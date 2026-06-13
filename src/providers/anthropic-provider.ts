import type { ProviderConfig } from "../types";
import { AISDKProvider } from "./ai-sdk-provider";

export class AnthropicProvider extends AISDKProvider {
  constructor(config: ProviderConfig) {
    super("anthropic", config);
  }
}
