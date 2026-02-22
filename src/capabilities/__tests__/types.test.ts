import { describe, it, expect, vi } from "vitest";
import type {
  CapabilityContext,
  ToolSpec,
  ResourceSpec,
  PromptSpec,
  PromptMessage,
  ResourceContent,
  Capabilities,
} from "../types";

describe("Capability types", () => {
  it("CapabilityContext satisfies the interface", () => {
    const ctx: CapabilityContext = {
      getTasks: vi.fn().mockResolvedValue([]),
      getTask: vi.fn().mockResolvedValue(null),
      addTask: vi.fn().mockResolvedValue(undefined),
      updateTask: vi.fn().mockResolvedValue(undefined),
      deleteTask: vi.fn().mockResolvedValue(undefined),
    };
    expect(ctx.getTasks).toBeDefined();
    expect(ctx.getTask).toBeDefined();
    expect(ctx.addTask).toBeDefined();
    expect(ctx.updateTask).toBeDefined();
    expect(ctx.deleteTask).toBeDefined();
  });

  it("CapabilityContext supports optional members", () => {
    const ctx: CapabilityContext = {
      getTasks: vi.fn().mockResolvedValue([]),
      getTask: vi.fn().mockResolvedValue(null),
      addTask: vi.fn().mockResolvedValue(undefined),
      updateTask: vi.fn().mockResolvedValue(undefined),
      deleteTask: vi.fn().mockResolvedValue(undefined),
      getSettings: vi.fn().mockReturnValue(null),
      notify: vi.fn(),
    };
    expect(ctx.getSettings).toBeDefined();
    expect(ctx.notify).toBeDefined();
  });

  it("ToolSpec has required fields", () => {
    const tool: ToolSpec = {
      name: "test_tool",
      description: "A test tool",
      schema: { type: "object", properties: {} },
      execute: vi.fn().mockResolvedValue({ name: "test_tool", result: {} }),
    };
    expect(tool.name).toBe("test_tool");
    expect(tool.execute).toBeDefined();
  });

  it("ResourceSpec has required fields", () => {
    const resource: ResourceSpec = {
      name: "test",
      uri: "test://all",
      description: "Test resource",
      mimeType: "application/json",
      read: vi.fn().mockResolvedValue({ contents: [] }),
    };
    expect(resource.uri).toBe("test://all");
  });

  it("ResourceContent has correct structure", () => {
    const content: ResourceContent = {
      contents: [
        {
          uri: "test://all",
          text: '{"data": []}',
          mimeType: "application/json",
        },
      ],
    };
    expect(content.contents).toHaveLength(1);
    expect(content.contents[0].uri).toBe("test://all");
  });

  it("PromptSpec has required fields", () => {
    const prompt: PromptSpec = {
      name: "test_prompt",
      description: "A test prompt",
      render: () => [{ role: "user", content: "test" }],
    };
    const messages = prompt.render();
    expect(messages).toHaveLength(1);
    // Handle both sync and async
    if (messages instanceof Promise) {
      messages.then((m) => expect(m).toHaveLength(1));
    }
  });

  it("PromptMessage has correct role types", () => {
    const userMsg: PromptMessage = { role: "user", content: "hello" };
    const assistantMsg: PromptMessage = {
      role: "assistant",
      content: "hi there",
    };
    expect(userMsg.role).toBe("user");
    expect(assistantMsg.role).toBe("assistant");
  });

  it("Capabilities interface has all required members", () => {
    const capabilities: Capabilities = {
      tools: [],
      resources: [],
      prompts: [],
      getTool: vi.fn().mockReturnValue(undefined),
      getResource: vi.fn().mockReturnValue(undefined),
      getPrompt: vi.fn().mockReturnValue(undefined),
      getSystemPrompt: vi.fn().mockReturnValue("system prompt"),
      executeTool: vi.fn().mockResolvedValue({ name: "test", result: "ok" }),
    };
    expect(capabilities.tools).toEqual([]);
    expect(capabilities.resources).toEqual([]);
    expect(capabilities.prompts).toEqual([]);
    expect(capabilities.getTool).toBeDefined();
    expect(capabilities.getResource).toBeDefined();
    expect(capabilities.getPrompt).toBeDefined();
    expect(capabilities.getSystemPrompt).toBeDefined();
    expect(capabilities.executeTool).toBeDefined();
  });
});
