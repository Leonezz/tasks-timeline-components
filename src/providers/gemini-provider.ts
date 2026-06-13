import type { ProviderConfig } from "../types";
import { AISDKProvider } from "./ai-sdk-provider";

export class GeminiProvider extends AISDKProvider {
  constructor(config: ProviderConfig) {
    super("gemini", config);
  }
}
