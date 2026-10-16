import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TasksTimelineApp } from "./TasksTimelineApp";
import type { TasksTimelineAppProps } from "./TasksTimelineApp";
import type { AIProviderFactory } from "./providers/types";
import type { SettingsRepository } from "./types";

const settingsRepository: SettingsRepository = {
  name: "test-memory",
  loadSettings: async () => null,
  saveSettings: async () => undefined,
};

function renderApp(props: Partial<TasksTimelineAppProps>) {
  return renderToStaticMarkup(
    createElement(TasksTimelineApp, {
      tasks: [],
      onTaskAdded: vi.fn(),
      onTaskUpdated: vi.fn(),
      onTaskDeleted: vi.fn(),
      settingsRepository,
      ...props,
    }),
  );
}

// Throwing at render proves each prop reaches useAIAgent; the hook tests cover
// what the agent then does with it.
describe("TasksTimelineApp AI props", () => {
  it("renders with a host fetch", () => {
    const aiFetch = vi.fn<typeof fetch>();

    expect(() => renderApp({ aiFetch })).not.toThrow();
    expect(aiFetch).not.toHaveBeenCalled();
  });

  it("passes aiFetch to the agent, which rejects it alongside aiProviderFactory", () => {
    const aiProviderFactory = vi.fn<AIProviderFactory>();

    expect(() =>
      renderApp({ aiFetch: vi.fn<typeof fetch>(), aiProviderFactory }),
    ).toThrow(/aiFetch.*cannot be combined.*aiProviderFactory/);
  });

  it("rejects an aiFetch that is not a function", () => {
    expect(() =>
      renderApp({ aiFetch: null as unknown as typeof fetch }),
    ).toThrow(/aiFetch\) must be a function/);
  });
});
