import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  SettingsProvider,
  TasksProvider,
  type SettingsContextType,
  type TasksContextType,
} from "../contexts";
import { settingsBuilder } from "../stories/fixtures";
import type { VoiceProvider } from "../types";
import {
  BROWSER_SPEECH_UNAVAILABLE_MESSAGE,
  type VoiceRuntime,
} from "../utils/voice-providers";
import { InputBar } from "./InputBar";

const decodeHtml = (html: string) =>
  html
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

const renderInputBar = (
  activeProvider: VoiceProvider,
  voiceRuntime?: VoiceRuntime,
) => {
  const settings = settingsBuilder.withVoiceInput();
  const tasksContext: TasksContextType = {
      tasks: [],
      availableCategories: [],
      availableTags: [],
      onUpdateTask: () => undefined,
      onDeleteTask: () => undefined,
      onAddTask: () => undefined,
      onAICommand: async () => undefined,
    },
    settingsContext: SettingsContextType = {
      settings: {
        ...settings,
        voiceConfig: { ...settings.voiceConfig, activeProvider },
      },
      updateSettings: () => undefined,
      isFocusMode: false,
      toggleFocusMode: () => undefined,
      isAiMode: false,
      toggleAiMode: () => undefined,
      filters: settings.filters,
      onFilterChange: () => undefined,
      sort: settings.sort,
      onSortChange: () => undefined,
      onVoiceError: () => undefined,
      voiceRuntime,
    };

  return decodeHtml(
    renderToStaticMarkup(
      <TasksProvider value={tasksContext}>
        <SettingsProvider value={settingsContext}>
          <InputBar />
        </SettingsProvider>
      </TasksProvider>,
    ),
  );
};

const voiceButton = (html: string) =>
  html.match(/<button(?=[^>]*aria-label="Start voice input")[^>]*>/)?.[0];

describe("InputBar voice button", () => {
  it("tells the user to pick another provider when the host disables browser speech", () => {
    const button = voiceButton(
      renderInputBar("browser", { browserSpeechSupported: false }),
    );

    expect(button).toBeDefined();
    expect(button).toContain(`title="${BROWSER_SPEECH_UNAVAILABLE_MESSAGE}"`);
  });

  it("keeps the default hint when the host does not set the flag", () => {
    const button = voiceButton(renderInputBar("browser"));

    expect(button).toContain('title="Start voice input"');
    expect(button).not.toContain(BROWSER_SPEECH_UNAVAILABLE_MESSAGE);
  });

  it("keeps the default hint for cloud providers when browser speech is disabled", () => {
    const button = voiceButton(
      renderInputBar("openai", { browserSpeechSupported: false }),
    );

    expect(button).toContain('title="Start voice input"');
  });
});
