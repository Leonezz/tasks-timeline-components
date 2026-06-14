import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppSettings } from "../../../types";
import type { CapabilityContext } from "../../types";
import {
  createGetViewSettingsTool,
  createResetViewSettingsTool,
  createSetTaskFiltersTool,
  createSetTaskSortTool,
  createUpdateViewSettingsTool,
} from "../../tools/settings";

function makeSettings(overrides?: Partial<AppSettings>): AppSettings {
  return {
    theme: "light",
    dateFormat: "MMM d",
    showCompleted: true,
    showProgressBar: true,
    soundEnabled: false,
    fontSize: "base",
    useRelativeDates: true,
    groupingStrategy: ["dueAt"],
    defaultFocusMode: false,
    totalTokenUsage: 0,
    tokenUsageByModel: {},
    defaultCategory: "General",
    aiConfig: {
      enabled: true,
      defaultMode: false,
      activeProvider: "openai-compatible",
      providers: {
        gemini: {
          apiKey: "gemini-secret",
          model: "gemini-2.0-flash",
          baseUrl: "",
        },
        openai: {
          apiKey: "openai-secret",
          model: "gpt-4o",
          baseUrl: "",
          useResponsesApi: true,
        },
        anthropic: {
          apiKey: "anthropic-secret",
          model: "claude-sonnet-4-20250514",
          baseUrl: "",
        },
        "openai-compatible": {
          apiKey: "compatible-secret",
          model: "deepseek-v4-pro",
          baseUrl: "https://example.com/v1",
          useResponsesApi: false,
        },
      },
      systemPrompt: "Be concise.",
    },
    voiceConfig: {
      enabled: true,
      activeProvider: "browser",
      language: "",
      providers: {
        browser: {},
        openai: {
          apiKey: "voice-secret",
          baseUrl: "https://api.openai.com/v1/audio/transcriptions",
          model: "whisper-1",
        },
        gemini: {
          apiKey: "voice-gemini-secret",
          model: "gemini-1.5-flash",
        },
      },
    },
    filters: {
      tags: { include: [], exclude: [] },
      categories: { include: [], exclude: [] },
      priorities: { include: [], exclude: [] },
      statuses: { include: [], exclude: [] },
      enableScript: false,
      script: "",
    },
    sort: {
      field: "createdAt",
      direction: "asc",
      script: "",
    },
    ...overrides,
  };
}

function makeContext(
  settings: AppSettings,
  overrides?: Partial<CapabilityContext>,
): CapabilityContext {
  return {
    getTasks: vi.fn().mockResolvedValue([]),
    getTask: vi.fn().mockResolvedValue(null),
    addTask: vi.fn().mockResolvedValue(undefined),
    updateTask: vi.fn().mockResolvedValue(undefined),
    deleteTask: vi.fn().mockResolvedValue(undefined),
    getSettings: vi.fn().mockReturnValue(settings),
    updateSettings: vi.fn().mockResolvedValue(undefined),
    confirm: vi.fn().mockResolvedValue(true),
    showToast: vi.fn(),
    notify: vi.fn(),
    ...overrides,
  };
}

describe("settings tools", () => {
  let settings: AppSettings;
  let ctx: CapabilityContext;

  beforeEach(() => {
    settings = makeSettings();
    ctx = makeContext(settings);
  });

  it("reads manageable settings without exposing provider configuration", async () => {
    const tool = createGetViewSettingsTool(ctx);

    const result = await tool.execute({});
    const payload = result.result as { settings: Record<string, unknown> };

    expect(result.name).toBe("get_view_settings");
    expect(result.result).toMatchObject({
      success: true,
      settings: {
        theme: "light",
        filters: settings.filters,
        sort: settings.sort,
      },
    });
    expect(payload.settings).not.toHaveProperty("aiConfig");
    expect(payload.settings).not.toHaveProperty("voiceConfig");
    expect(payload.settings).not.toHaveProperty("totalTokenUsage");
    expect(JSON.stringify(result.result)).not.toContain("secret");
  });

  it("updates persistent sort settings after confirmation", async () => {
    const tool = createSetTaskSortTool(ctx);

    const result = await tool.execute({ field: "dueAt", direction: "desc" });

    expect(result.result).toMatchObject({ success: true });
    expect(ctx.confirm).toHaveBeenCalledWith(
      "Update task sort?",
      "Change: sort",
    );
    expect(ctx.updateSettings).toHaveBeenCalledOnce();
    expect(vi.mocked(ctx.updateSettings!).mock.calls[0][0].sort).toEqual({
      field: "dueAt",
      direction: "desc",
      script: "",
    });
  });

  it("updates persistent filters while preserving unspecified filter groups", async () => {
    const tool = createSetTaskFiltersTool(ctx);

    const result = await tool.execute({
      filters: {
        tags: { include: ["work"] },
        statuses: { exclude: ["done", "cancelled"] },
      },
    });

    expect(result.result).toMatchObject({ success: true });
    expect(ctx.updateSettings).toHaveBeenCalledOnce();
    const nextSettings = vi.mocked(ctx.updateSettings!).mock.calls[0][0];
    expect(nextSettings.filters.tags).toEqual({
      include: ["work"],
      exclude: [],
    });
    expect(nextSettings.filters.statuses).toEqual({
      include: [],
      exclude: ["done", "cancelled"],
    });
    expect(nextSettings.filters.categories).toEqual({
      include: [],
      exclude: [],
    });
  });

  it("updates display preferences and nested filter/sort patches", async () => {
    const tool = createUpdateViewSettingsTool(ctx);

    await tool.execute({
      dateFormat: "yyyy-MM-dd",
      showCompleted: false,
      groupingStrategy: ["dueAt", "startAt"],
      filters: {
        priorities: { include: ["high"] },
      },
      sort: {
        field: "priority",
      },
    });

    expect(ctx.updateSettings).toHaveBeenCalledOnce();
    const nextSettings = vi.mocked(ctx.updateSettings!).mock.calls[0][0];
    expect(nextSettings.dateFormat).toBe("yyyy-MM-dd");
    expect(nextSettings.showCompleted).toBe(false);
    expect(nextSettings.groupingStrategy).toEqual(["dueAt", "startAt"]);
    expect(nextSettings.filters.priorities).toEqual({
      include: ["high"],
      exclude: [],
    });
    expect(nextSettings.sort).toEqual({
      field: "priority",
      direction: "asc",
      script: "",
    });
  });

  it("resets filters and sort when requested", async () => {
    settings = makeSettings({
      filters: {
        tags: { include: ["work"], exclude: ["personal"] },
        categories: { include: ["Projects"], exclude: [] },
        priorities: { include: ["high"], exclude: [] },
        statuses: { include: ["todo"], exclude: ["done"] },
        enableScript: true,
        script: "task.priority === 'high'",
      },
      sort: {
        field: "custom",
        direction: "desc",
        script: "task.title",
      },
    });
    ctx = makeContext(settings);
    const tool = createResetViewSettingsTool(ctx);

    const result = await tool.execute({ scope: "filters_and_sort" });

    expect(result.result).toMatchObject({ success: true });
    const nextSettings = vi.mocked(ctx.updateSettings!).mock.calls[0][0];
    expect(nextSettings.filters).toEqual({
      tags: { include: [], exclude: [] },
      categories: { include: [], exclude: [] },
      priorities: { include: [], exclude: [] },
      statuses: { include: [], exclude: [] },
      enableScript: false,
      script: "",
    });
    expect(nextSettings.sort).toEqual({
      field: "createdAt",
      direction: "asc",
      script: "",
    });
  });

  it("does not update settings when the user cancels confirmation", async () => {
    ctx = makeContext(settings, {
      confirm: vi.fn().mockResolvedValue(null),
    });
    const tool = createSetTaskSortTool(ctx);

    const result = await tool.execute({ field: "title" });

    expect(result.result).toEqual({
      success: false,
      message: "Cancelled by user.",
    });
    expect(ctx.updateSettings).not.toHaveBeenCalled();
  });

  it("reports a host capability error when settings cannot be updated", async () => {
    ctx = makeContext(settings, { updateSettings: undefined });
    const tool = createSetTaskSortTool(ctx);

    const result = await tool.execute({ field: "title" });

    expect(result.result).toEqual({
      success: false,
      message: "This host does not allow the agent to update settings.",
    });
  });

  it("rejects invalid setting values", async () => {
    const tool = createSetTaskSortTool(ctx);

    const result = await tool.execute({ field: "unknown" });

    expect(result.result).toMatchObject({
      ok: false,
      error: expect.stringContaining("sort.field"),
    });
    expect(ctx.updateSettings).not.toHaveBeenCalled();
  });
});
