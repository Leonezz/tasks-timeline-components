import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CapabilityContext } from "../../types";
import { createNotifyUserTool } from "../../tools/notify-user";

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

describe("notify_user tool", () => {
  let ctx: CapabilityContext;
  let mockShowToast: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockShowToast = vi.fn();
    ctx = makeContext({
      showToast: mockShowToast as CapabilityContext["showToast"],
    });
  });

  it("has correct name and schema", () => {
    const tool = createNotifyUserTool(ctx);

    expect(tool.name).toBe("notify_user");
    expect(tool.schema.type).toBe("object");
    expect(tool.schema.required).toEqual(["variant", "title"]);
    expect(tool.schema.properties).toHaveProperty("variant");
    expect(tool.schema.properties).toHaveProperty("title");
    expect(tool.schema.properties).toHaveProperty("description");
    expect(tool.schema.properties).toHaveProperty("body");
    expect(tool.schema.properties).toHaveProperty("timeout");
  });

  it("shows toast with provided fields and returns success", async () => {
    const tool = createNotifyUserTool(ctx);
    const result = await tool.execute({
      variant: "success",
      title: "Task created",
      description: "Your task was added.",
    });

    expect(result.name).toBe("notify_user");
    expect(result.result).toEqual({ success: true });
    expect(mockShowToast).toHaveBeenCalledWith({
      variant: "success",
      title: "Task created",
      description: "Your task was added.",
      body: undefined,
      timeout: null,
    });
  });

  it("uses null timeout when explicitly set to null or 0", async () => {
    const tool = createNotifyUserTool(ctx);
    await tool.execute({
      variant: "info",
      title: "Persistent",
      timeout: null,
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ timeout: null }),
    );

    await tool.execute({
      variant: "info",
      title: "Also persistent",
      timeout: 0,
    });

    expect(mockShowToast).toHaveBeenLastCalledWith(
      expect.objectContaining({ timeout: null }),
    );
  });

  it("keeps explicit positive timeouts", async () => {
    const tool = createNotifyUserTool(ctx);
    await tool.execute({
      variant: "info",
      title: "Timed",
      timeout: 3000,
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ timeout: 3000 }),
    );
  });

  it("returns success even when showToast is not provided", async () => {
    const ctxNoToast = makeContext();
    const tool = createNotifyUserTool(ctxNoToast);
    const result = await tool.execute({
      variant: "info",
      title: "Hello",
    });

    expect(result.result).toEqual({ success: true });
  });
});
