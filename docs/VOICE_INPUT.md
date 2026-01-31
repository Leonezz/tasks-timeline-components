# Voice Input System

The voice input feature supports multiple AI providers for speech-to-text transcription, allowing users to create tasks using voice commands.

## Supported Providers

### 1. Browser (Web Speech API)
- **Free** and built into modern browsers
- **Pros**: No API key required, fast setup
- **Cons**:
  - Requires internet connection (Chrome/Edge send audio to Google servers)
  - Limited browser support (Chrome, Edge, Safari - not Firefox)
  - Network errors common (issue #18)
  - Privacy concerns (audio sent to third parties)

### 2. OpenAI Whisper
- **Paid** service requiring OpenAI API key
- **Pros**:
  - Highly accurate transcription
  - Works in all browsers
  - Multi-language support
  - Industry-leading quality
- **Cons**:
  - Requires API key
  - Costs per minute of audio
  - Requires internet connection

### 3. Google Gemini
- **Paid** service requiring Gemini API key
- **Pros**:
  - Accurate transcription
  - Works in all browsers
  - Multi-language support
  - Integrates with Gemini multimodal capabilities
- **Cons**:
  - Requires API key
  - Costs per request
  - Requires internet connection

## Configuration

### Type Definitions

```typescript
export type VoiceProvider = "browser" | "openai" | "gemini";

export interface VoiceConfig {
  enabled: boolean;
  activeProvider: VoiceProvider;
  language: string; // Empty string means use system language
  providers: {
    browser: Record<string, never>; // No config needed
    openai: {
      apiKey: string;
      baseUrl: string;
      model: string; // e.g., "whisper-1"
    };
    gemini: {
      apiKey: string;
      model: string; // e.g., "gemini-1.5-flash"
    };
  };
}
```

### Default Configuration

```typescript
voiceConfig: {
  enabled: true,
  activeProvider: "browser",
  language: "", // System default
  providers: {
    browser: {},
    openai: {
      apiKey: "",
      baseUrl: "https://api.openai.com/v1/audio/transcriptions",
      model: "whisper-1",
    },
    gemini: {
      apiKey: "",
      model: "gemini-1.5-flash",
    },
  },
}
```

## Usage

### In Settings UI

Users can configure voice input in the Advanced Settings page:

1. **Enable/Disable**: Toggle voice input on/off
2. **Select Provider**: Choose between Browser, OpenAI, or Gemini
3. **Configure Provider**:
   - OpenAI: Enter API key, customize model and base URL
   - Gemini: Enter API key, customize model
   - Browser: No configuration needed
4. **Set Language**: Specify language code (e.g., "en-US", "zh-CN") or leave empty for system default

### Programmatic Usage

```typescript
import { useVoiceInput } from '@tasks-timeline/components/hooks';

const { isListening, start, stop } = useVoiceInput(
  voiceConfig,
  (transcript) => {
    console.log('Transcribed:', transcript);
  },
  (errorMessage) => {
    console.error('Voice error:', errorMessage);
  }
);

// Start listening
start();

// Stop listening (for cloud providers that support manual stop)
stop();
```

## Architecture

### Provider Interface

All voice providers implement the `IVoiceProvider` interface:

```typescript
interface IVoiceProvider {
  start(
    language: string,
    onResult: (result: VoiceInputResult) => void,
    onError: (error: VoiceInputError) => void,
  ): () => void; // Returns cleanup function

  isAvailable(): boolean;
  getName(): string;
}
```

### Provider Classes

- `BrowserVoiceProvider` - Web Speech API implementation
- `OpenAIWhisperProvider` - OpenAI Whisper API implementation
- `GeminiSpeechProvider` - Google Gemini speech-to-text implementation

### Flow

1. User clicks microphone button
2. `useVoiceInput` hook creates appropriate provider based on `activeProvider`
3. Provider checks if it's available in current environment
4. Provider starts listening/recording:
   - **Browser**: Uses `SpeechRecognition` API directly
   - **OpenAI/Gemini**: Records audio via `MediaRecorder`, then sends to API
5. On completion:
   - **Browser**: Returns transcript immediately from browser API
   - **OpenAI/Gemini**: Sends audio blob to API, receives transcript
6. Hook calls `onResult` callback with transcript
7. Cleanup function stops recording/recognition

## Error Handling

Common errors and their meanings:

- `not-supported`: Browser doesn't support the provider
- `permission-denied`: User denied microphone access
- `network`: Network error (Browser provider only)
- `missing-api-key`: API key not configured (OpenAI/Gemini)
- `api-error`: API request failed (OpenAI/Gemini)
- `initialization-failed`: Failed to initialize voice input

## Migration from Old System

The voice input system was migrated from individual settings to a structured `VoiceConfig` object:

**Before:**
```typescript
{
  enableVoiceInput: boolean;
  voiceProvider: "browser" | "gemini-whisper";
  voiceLanguage: string;
}
```

**After:**
```typescript
{
  voiceConfig: VoiceConfig; // See type definition above
}
```

This provides:
- Better organization of provider-specific configuration
- Support for multiple cloud providers
- Consistent pattern with AI configuration
- Easier to extend with new providers

## Adding New Providers

To add a new voice provider:

1. **Update Types** (`src/types.ts`):
   ```typescript
   export type VoiceProvider = "browser" | "openai" | "gemini" | "your-provider";

   export interface VoiceConfig {
     // ...
     providers: {
       // ...
       "your-provider": {
         apiKey: string;
         // ... other config
       };
     };
   }
   ```

2. **Implement Provider** (`src/utils/voice-providers.ts`):
   ```typescript
   export class YourVoiceProvider implements IVoiceProvider {
     // Implement interface methods
   }
   ```

3. **Update Hook** (`src/hooks/useVoiceInput.ts`):
   ```typescript
   case "your-provider":
     provider = new YourVoiceProvider(voiceConfig.providers["your-provider"]);
     break;
   ```

4. **Update Settings UI** (`src/components/settings/SettingsPageAdvanced.tsx`):
   - Add provider to button list
   - Add configuration UI section

## Related Files

- `src/types.ts` - Type definitions
- `src/utils/voice-providers.ts` - Provider implementations
- `src/hooks/useVoiceInput.ts` - React hook
- `src/components/settings/SettingsPageAdvanced.tsx` - Settings UI
- `src/components/InputBar.tsx` - Voice input button
- `src/components/DaySection.tsx` - Quick add voice input
