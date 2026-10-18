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

  it("defaults to a persistent notification when timeout is omitted", async () => {
    const tool = createNotifyUserTool(ctx);
    await tool.execute({ variant: "info", title: "Stays" });

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ timeout: null }),
    );
  });

  it("does not also send a plain notification when it shows a toast", async () => {
    const tool = createNotifyUserTool(ctx);
    await tool.execute({ variant: "info", title: "Once" });

    expect(ctx.notify).not.toHaveBeenCalled();
  });

  it("degrades explicitly to notify when showToast is not provided", async () => {
    const ctxNoToast = makeContext();
    const tool = createNotifyUserTool(ctxNoToast);
    const result = await tool.execute({
      variant: "warning",
      title: "Heads up",
      description: "Two tasks overlap",
      body: "Details that cannot be shown",
    });

    expect(ctxNoToast.notify).toHaveBeenCalledWith(
      "warning",
      "Heads up: Two tasks overlap",
    );
    expect(result.result).toEqual({
      success: true,
      degraded: true,
      warning: expect.stringContaining("body and timeout were dropped"),
    });
  });

  it.each([
    ["missing", { title: "Heads up" }],
    ["unknown", { variant: "danger", title: "Heads up" }],
    ["not a string", { variant: 3, title: "Heads up" }],
  ])("rejects a %s variant without showing anything", async (_case, args) => {
    const tool = createNotifyUserTool(ctx);
    const result = await tool.execute(args);

    expect(result.result).toEqual({
      success: false,
      error: expect.stringContaining(
        'variant must be one of "success", "error", "info", "warning"',
      ),
    });
    expect(mockShowToast).not.toHaveBeenCalled();
    expect(ctx.notify).not.toHaveBeenCalled();
  });

  it.each([
    ["missing", { variant: "info" }],
    ["empty", { variant: "info", title: "   " }],
    ["not a string", { variant: "info", title: 42 }],
  ])("rejects a %s title without showing anything", async (_case, args) => {
    const tool = createNotifyUserTool(ctx);
    const result = await tool.execute(args);

    expect(result.result).toEqual({
      success: false,
      error: expect.stringContaining("title must be a non-empty string"),
    });
    expect(mockShowToast).not.toHaveBeenCalled();
    expect(ctx.notify).not.toHaveBeenCalled();
  });

  it("returns an error when the host cannot notify at all", async () => {
    const ctxSilent = makeContext({ notify: undefined });
    const tool = createNotifyUserTool(ctxSilent);
    const result = await tool.execute({ variant: "info", title: "Hello" });

    expect(result.result).toEqual({
      success: false,
      error: expect.stringContaining("cannot show notifications"),
    });
  });
});
