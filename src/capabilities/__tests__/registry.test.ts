import { describe, it, expect, vi } from "vitest";
import { createCapabilities } from "../registry";
import type {
  CapabilityContext,
  PromptSpec,
  ResourceSpec,
  ToolSpec,
} from "../types";

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

  it("has 16 tools", () => {
    const caps = createCapabilities(makeContext());
    expect(caps.tools).toHaveLength(16);
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
    expect(names).toContain("notify_user");
    expect(names).toContain("ask_user");
    expect(names).toContain("get_view_settings");
    expect(names).toContain("update_view_settings");
    expect(names).toContain("set_task_filters");
    expect(names).toContain("set_task_sort");
    expect(names).toContain("reset_view_settings");
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

function makeTool(name: string, execute?: ToolSpec["execute"]): ToolSpec {
  return {
    name,
    description: `Host tool ${name}`,
    schema: { type: "object", properties: {} },
    execute:
      execute ??
      (async () => ({ name, result: { success: true, from: name } })),
  };
}

function makeResource(name: string): ResourceSpec {
  return {
    name,
    uri: `host://${name}`,
    description: `Host resource ${name}`,
    mimeType: "application/json",
    read: async () => ({ contents: [{ uri: `host://${name}`, text: "{}" }] }),
  };
}

function makePrompt(name: string): PromptSpec {
  return {
    name,
    description: `Host prompt ${name}`,
    render: () => [{ role: "user", content: name }],
  };
}

describe("createCapabilities extras", () => {
  it("appends extra tools, resources and prompts after the built-ins", async () => {
    const caps = createCapabilities(makeContext(), {
      extraTools: [makeTool("zotero_search")],
      extraResources: [makeResource("zotero_items")],
      extraPrompts: [makePrompt("zotero_digest")],
    });

    expect(caps.tools).toHaveLength(17);
    expect(caps.tools[16].name).toBe("zotero_search");
    expect(caps.tools[0].name).toBe("create_task");
    expect(caps.resources).toHaveLength(7);
    expect(caps.resources[6].name).toBe("zotero_items");
    expect(caps.prompts).toHaveLength(4);
    expect(caps.prompts[3].name).toBe("zotero_digest");

    expect(caps.getTool("zotero_search")?.name).toBe("zotero_search");
    expect(caps.getResource("zotero_items")?.name).toBe("zotero_items");
    expect(caps.getPrompt("zotero_digest")?.name).toBe("zotero_digest");

    const result = await caps.executeTool("zotero_search", {});
    expect(result).toEqual({
      name: "zotero_search",
      result: { success: true, from: "zotero_search" },
    });
  });

  it("works with no options (built-ins only)", () => {
    expect(createCapabilities(makeContext(), {}).tools).toHaveLength(16);
  });

  it("throws when an extra tool collides with a built-in tool", () => {
    expect(() =>
      createCapabilities(makeContext(), {
        extraTools: [makeTool("delete_task")],
      }),
    ).toThrow(/duplicate tool name "delete_task"/);
  });

  it("throws when two extra tools share a name", () => {
    expect(() =>
      createCapabilities(makeContext(), {
        extraTools: [makeTool("host_tool"), makeTool("host_tool")],
      }),
    ).toThrow(/duplicate tool name "host_tool"/);
  });

  it("throws when an extra resource or prompt collides", () => {
    const builtInResource = createCapabilities(makeContext()).resources[0].name;
    expect(() =>
      createCapabilities(makeContext(), {
        extraResources: [makeResource(builtInResource)],
      }),
    ).toThrow(new RegExp(`duplicate resource name "${builtInResource}"`));
    expect(() =>
      createCapabilities(makeContext(), {
        extraPrompts: [makePrompt("plan_my_day")],
      }),
    ).toThrow(/duplicate prompt name "plan_my_day"/);
  });

  it("executeTool() turns a thrown error into a tool error result", async () => {
    const caps = createCapabilities(makeContext(), {
      extraTools: [
        makeTool("explodes", async () => {
          throw new Error("boom");
        }),
      ],
    });

    await expect(caps.executeTool("explodes", {})).resolves.toEqual({
      name: "explodes",
      result: { error: "boom" },
    });
  });

  it("executeTool() turns a built-in tool's context failure into a tool error result", async () => {
    const ctx: CapabilityContext = {
      ...makeContext(),
      getTask: vi.fn().mockResolvedValue({
        id: "t1",
        title: "Task",
        status: "todo",
        priority: "medium",
        tags: [],
        createdAt: "2026-01-01",
      }),
      updateTask: vi.fn().mockRejectedValue(new Error("Task not found: t1")),
    };
    const caps = createCapabilities(ctx);

    const result = await caps.executeTool("update_task", {
      id: "t1",
      title: "Renamed",
    });

    expect(result).toEqual({
      name: "update_task",
      result: { error: "Task not found: t1" },
    });
  });
});
