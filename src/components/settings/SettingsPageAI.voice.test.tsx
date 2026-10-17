import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { settingsBuilder } from "../../stories/fixtures";
import type { VoiceProvider } from "../../types";
import type { VoiceRuntime } from "../../utils/voice-providers";
import { SettingsPageAI } from "./SettingsPageAI";

const BROWSER_NOTE =
  "Browser speech recognition isn't available here. Choose OpenAI or Gemini as the voice provider.";

const decodeHtml = (html: string) =>
  html
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

const renderVoiceSettings = (
  activeProvider: VoiceProvider,
  voiceRuntime?: VoiceRuntime,
) => {
  const settings = settingsBuilder.withVoiceInput();
  return decodeHtml(
    renderToStaticMarkup(
      <SettingsPageAI
        settings={{
          ...settings,
          voiceConfig: { ...settings.voiceConfig, activeProvider },
        }}
        onUpdateSettings={() => undefined}
        voiceRuntime={voiceRuntime}
      />,
    ),
  );
};

const providerButton = (html: string, label: string) =>
  html.match(
    new RegExp(
      `<button(?=[^>]*aria-label="Use ${label} voice provider")[^>]*>`,
    ),
  )?.[0];

describe("SettingsPageAI voice provider when the host disables browser speech", () => {
  const runtime: VoiceRuntime = { browserSpeechSupported: false };

  it("disables the Browser provider and explains why", () => {
    const html = renderVoiceSettings("browser", runtime);
    const browserButton = providerButton(html, "Browser");

    expect(browserButton).toContain('disabled=""');
    expect(browserButton).toContain(`title="${BROWSER_NOTE}"`);
    expect(html).toContain(BROWSER_NOTE);
    expect(html).not.toContain("Uses Web Speech API");
  });

  it("keeps OpenAI and Gemini selectable", () => {
    const html = renderVoiceSettings("browser", runtime);

    expect(providerButton(html, "OpenAI")).not.toContain("disabled");
    expect(providerButton(html, "Gemini")).not.toContain("disabled");
  });

  it("still explains the disabled Browser provider while another one is active", () => {
    const html = renderVoiceSettings("openai", runtime);

    expect(providerButton(html, "Browser")).toContain('disabled=""');
    expect(html).toContain(BROWSER_NOTE);
    expect(html).toContain("OpenAI Whisper (requires API key");
  });
});

describe("SettingsPageAI voice provider when the host does not set the flag", () => {
  it("keeps the Browser provider selectable", () => {
    const html = renderVoiceSettings("browser");

    expect(providerButton(html, "Browser")).not.toContain("disabled");
    expect(html).toContain("Uses Web Speech API");
    expect(html).not.toContain(BROWSER_NOTE);
  });
});
