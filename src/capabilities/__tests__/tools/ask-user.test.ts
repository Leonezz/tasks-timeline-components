import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CapabilityContext } from "../../types";
import { createAskUserTool } from "../../tools/ask-user";

function makeContext(
  overrides?: Partial<CapabilityContext>,
): CapabilityContext {
  return {
    getTasks: vi.fn().mockResolvedValue([]),
    getTask: vi.fn().mockResolvedValue(null),
    addTask: vi.fn().mockResolvedValue(undefined),
    updateTask: vi.fn().mockResolvedValue(undefined),
    deleteTask: vi.fn().mockResolvedValue(undefined),
    notify: vi.fn(),
    ...overrides,
  };
}

describe("ask_user tool", () => {
  let mockConfirm: ReturnType<typeof vi.fn>;
  let mockSelect: ReturnType<typeof vi.fn>;
  let mockPrompt: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockConfirm = vi.fn();
    mockSelect = vi.fn();
    mockPrompt = vi.fn();
  });

  it("has correct name and schema", () => {
    const ctx = makeContext();
    const tool = createAskUserTool(ctx);

    expect(tool.name).toBe("ask_user");
    expect(tool.schema.type).toBe("object");
    expect(tool.schema.required).toEqual(["question"]);
    expect(tool.schema.properties).toHaveProperty("question");
    expect(tool.schema.properties).toHaveProperty("options");
    expect(tool.schema.properties).toHaveProperty("confirm");
  });

  // --- Confirm mode ---

  it("uses confirm mode when confirm=true, returns yes", async () => {
    mockConfirm.mockResolvedValue(true);
    const ctx = makeContext({
      confirm: mockConfirm as CapabilityContext["confirm"],
    });

    const tool = createAskUserTool(ctx);
    const result = await tool.execute({
      question: "Delete this task?",
      confirm: true,
    });

    expect(mockConfirm).toHaveBeenCalledWith("Delete this task?", undefined);
    expect(result.result).toEqual({
      question: "Delete this task?",
      answer: "yes",
    });
  });

  it("uses confirm mode when confirm=true, returns no", async () => {
    mockConfirm.mockResolvedValue(false);
    const ctx = makeContext({
      confirm: mockConfirm as CapabilityContext["confirm"],
    });

    const tool = createAskUserTool(ctx);
    const result = await tool.execute({
      question: "Delete this task?",
      confirm: true,
    });

    expect(result.result).toEqual({
      question: "Delete this task?",
      answer: "no",
    });
  });

  it("uses confirm mode when confirm=true, returns dismissed when cancelled", async () => {
    mockConfirm.mockResolvedValue(null);
    const ctx = makeContext({
      confirm: mockConfirm as CapabilityContext["confirm"],
    });

    const tool = createAskUserTool(ctx);
    const result = await tool.execute({
      question: "Delete this task?",
      confirm: true,
    });

    expect(result.result).toEqual({
      question: "Delete this task?",
      answer: null,
      dismissed: true,
    });
  });

  // --- Select mode ---

  it("uses select mode when options provided, returns selected value", async () => {
    mockSelect.mockResolvedValue("postgres");
    const ctx = makeContext({
      select: mockSelect as CapabilityContext["select"],
    });

    const tool = createAskUserTool(ctx);
    const result = await tool.execute({
      question: "Which database?",
      options: [
        { label: "PostgreSQL", value: "postgres" },
        { label: "MySQL", value: "mysql" },
      ],
    });

    expect(mockSelect).toHaveBeenCalledWith("Which database?", [
      { label: "PostgreSQL", value: "postgres" },
      { label: "MySQL", value: "mysql" },
    ]);
    expect(result.result).toEqual({
      question: "Which database?",
      answer: "postgres",
    });
  });

  it("uses select mode, returns null when cancelled", async () => {
    mockSelect.mockResolvedValue(null);
    const ctx = makeContext({
      select: mockSelect as CapabilityContext["select"],
    });

    const tool = createAskUserTool(ctx);
    const result = await tool.execute({
      question: "Which database?",
      options: [{ label: "PostgreSQL", value: "postgres" }],
    });

    expect(result.result).toEqual({
      question: "Which database?",
      answer: null,
      dismissed: true,
    });
  });

  // --- Free text mode ---

  it("uses prompt mode when no options and no confirm", async () => {
    mockPrompt.mockResolvedValue("My Project");
    const ctx = makeContext({
      prompt: mockPrompt as CapabilityContext["prompt"],
    });

    const tool = createAskUserTool(ctx);
    const result = await tool.execute({
      question: "What should we name this category?",
    });

    expect(mockPrompt).toHaveBeenCalledWith(
      "What should we name this category?",
    );
    expect(result.result).toEqual({
      question: "What should we name this category?",
      answer: "My Project",
    });
  });

  it("uses prompt mode, returns null when cancelled", async () => {
    mockPrompt.mockResolvedValue(null);
    const ctx = makeContext({
      prompt: mockPrompt as CapabilityContext["prompt"],
    });

    const tool = createAskUserTool(ctx);
    const result = await tool.execute({
      question: "What name?",
    });

    expect(result.result).toEqual({
      question: "What name?",
      answer: null,
      dismissed: true,
    });
  });

  // --- Fallback when callbacks not provided ---

  it("returns error when confirm mode requested but confirm not available", async () => {
    const ctx = makeContext();
    const tool = createAskUserTool(ctx);
    const result = await tool.execute({
      question: "Proceed?",
      confirm: true,
    });

    expect(result.result).toEqual({
      question: "Proceed?",
      answer: null,
      error: "User interaction not available",
    });
  });

  it("returns error when select mode requested but select not available", async () => {
    const ctx = makeContext();
    const tool = createAskUserTool(ctx);
    const result = await tool.execute({
      question: "Pick one",
      options: [{ label: "A", value: "a" }],
    });

    expect(result.result).toEqual({
      question: "Pick one",
      answer: null,
      error: "User interaction not available",
    });
  });

  it("returns error when prompt mode requested but prompt not available", async () => {
    const ctx = makeContext();
    const tool = createAskUserTool(ctx);
    const result = await tool.execute({
      question: "What name?",
    });

    expect(result.result).toEqual({
      question: "What name?",
      answer: null,
      error: "User interaction not available",
    });
  });
});
