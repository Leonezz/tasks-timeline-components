import { describe, it, expect, vi } from "vitest";
import { createCapabilities } from "../registry";
import type { CapabilityContext } from "../types";

function makeContext(): CapabilityContext {
  return {
    getTasks: vi.fn().mockResolvedValue([]),
    getTask: vi.fn().mockResolvedValue(null),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    notify: vi.fn(),
  };
}

describe("createCapabilities", () => {
  it("returns a Capabilities object with tools, resources, prompts", () => {
    const caps = createCapabilities(makeContext());
    expect(caps.tools).toBeInstanceOf(Array);
    expect(caps.resources).toBeInstanceOf(Array);
    expect(caps.prompts).toBeInstanceOf(Array);
  });

  it("has 9 tools", () => {
    const caps = createCapabilities(makeContext());
    expect(caps.tools).toHaveLength(9);
    const names = caps.tools.map((t) => t.name);
    expect(names).toContain("create_task");
    expect(names).toContain("query_tasks");
    expect(names).toContain("update_task");
    expect(names).toContain("delete_task");
    expect(names).toContain("complete_task");
    expect(names).toContain("cancel_task");
    expect(names).toContain("batch_update_tasks");
    expect(names).toContain("get_task_stats");
    expect(names).toContain("get_today_plan");
  });

  it("has 6 resources", () => {
    const caps = createCapabilities(makeContext());
    expect(caps.resources).toHaveLength(6);
  });

  it("has 3 prompts", () => {
    const caps = createCapabilities(makeContext());
    expect(caps.prompts).toHaveLength(3);
  });

  it("getTool() returns a tool by name", () => {
    const caps = createCapabilities(makeContext());
    expect(caps.getTool("create_task")).toBeDefined();
    expect(caps.getTool("nonexistent")).toBeUndefined();
  });

  it("executeTool() dispatches to the correct tool", async () => {
    const ctx = makeContext();
    const caps = createCapabilities(ctx);
    const result = await caps.executeTool("create_task", { title: "Test" });
    expect(ctx.addTask).toHaveBeenCalledOnce();
    expect(result.name).toBe("create_task");
  });

  it("executeTool() returns error for unknown tool", async () => {
    const caps = createCapabilities(makeContext());
    const result = await caps.executeTool("nonexistent", {});
    expect(result.result).toMatchObject({
      error: expect.stringContaining("Unknown tool"),
    });
  });

  it("getSystemPrompt() returns a string", () => {
    const caps = createCapabilities(makeContext());
    const prompt = caps.getSystemPrompt();
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });
});
