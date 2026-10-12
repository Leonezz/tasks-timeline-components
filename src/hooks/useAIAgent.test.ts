import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type {
  AIProviderResponse,
  ChatMessage,
  IAIProvider,
} from "../providers/types";
import type { AgentEvent, Task } from "../types";
import type { Capabilities, ToolSpec } from "../capabilities";
import { createCapabilities } from "../capabilities";
import { DEFAULT_SETTINGS } from "../defaultSettings";
import {
  appendAssistantMessageToHistory,
  createAgentTurnHistory,
  useAIAgent,
} from "./useAIAgent";
import type { UseAIAgentOptions } from "./useAIAgent";
import { createAgentCapabilityContext } from "./agentCapabilityContext";

describe("agent chat history helpers", () => {
  it("starts a new provider history with the first user turn", () => {
    expect(createAgentTurnHistory(undefined, "Plan my day")).toEqual([
      { role: "user", content: "Plan my day" },
    ]);
  });

  it("continues the selected provider history with the next user turn", () => {
    const previousHistory: ChatMessage[] = [
      { role: "user", content: "Plan my day" },
      { role: "assistant", content: "Start with the overdue task." },
    ];

    expect(
      createAgentTurnHistory(previousHistory, "What should I do next?"),
    ).toEqual([
      { role: "user", content: "Plan my day" },
      { role: "assistant", content: "Start with the overdue task." },
      { role: "user", content: "What should I do next?" },
    ]);
  });

  it("appends trimmed assistant responses to provider history", () => {
    const history: ChatMessage[] = [{ role: "user", content: "Plan my day" }];

    expect(
      appendAssistantMessageToHistory(
        history,
        "  Start with the overdue task.  ",
      ),
    ).toEqual([
      { role: "user", content: "Plan my day" },
      { role: "assistant", content: "Start with the overdue task." },
    ]);
  });
});

const TASK: Task = {
  id: "task-1",
  title: "Existing",
  status: "todo",
  priority: "medium",
  tags: [],
  createdAt: "2026-01-01",
};

function makeProvider(responses: (call: number) => AIProviderResponse) {
  let call = 0;
  const chat = vi.fn<IAIProvider["chat"]>(async () => responses(call++));
  const provider: IAIProvider = {
    chat,
    test: async () => ({ success: true, message: "ok" }),
  };
  return { provider, chat };
}

const alwaysToolCalls = () => ({
  text: "",
  toolCalls: [{ id: "c", name: "get_task_stats", args: {} }],
});

interface HarnessResult {
  handleAICommand: ReturnType<typeof useAIAgent>["handleAICommand"];
  events: AgentEvent[];
  onNotify: ReturnType<typeof vi.fn>;
}

function renderAgent(
  options: Omit<UseAIAgentOptions, "providerFactory" | "onAgentEvent">,
  provider: IAIProvider,
  tasks: Task[] = [TASK],
): HarnessResult {
  const events: AgentEvent[] = [];
  const onNotify = vi.fn();
  let handleAICommand: HarnessResult["handleAICommand"] | undefined;
  const capture = (handler: HarnessResult["handleAICommand"]) => {
    handleAICommand = handler;
  };
  const Probe = ({
    onReady,
  }: {
    onReady: (handler: HarnessResult["handleAICommand"]) => void;
  }) => {
    const { handleAICommand: handler } = useAIAgent(
      tasks,
      vi.fn(),
      vi.fn(),
      vi.fn(),
      DEFAULT_SETTINGS,
      vi.fn(),
      onNotify,
      undefined,
      undefined,
      undefined,
      vi.fn().mockResolvedValue(true),
      undefined,
      undefined,
      {
        ...options,
        providerFactory: async () => provider,
        onAgentEvent: (event) => events.push(event),
      },
    );
    onReady(handler);
    return null;
  };
  renderToStaticMarkup(createElement(Probe, { onReady: capture }));
  if (!handleAICommand) throw new Error("hook did not render");
  return { handleAICommand, events, onNotify };
}

function assertWellFormed(history: ChatMessage[]) {
  history.forEach((message, index) => {
    if (message.toolCalls?.length) {
      expect(history[index + 1]?.role).toBe("tool");
    }
  });
}

describe("useAIAgent tool-round limit", () => {
  it("stops after aiMaxToolRounds when the provider never gives a final answer", async () => {
    const { provider, chat } = makeProvider(alwaysToolCalls);
    const { handleAICommand, events, onNotify } = renderAgent(
      { maxToolRounds: 3 },
      provider,
    );

    await handleAICommand("loop forever");

    // initial call + 3 follow-up rounds, then no further provider calls
    expect(chat).toHaveBeenCalledTimes(4);
    const message = "Stopped after 3 tool rounds without a final answer";
    expect(events).toContainEqual(
      expect.objectContaining({ kind: "error", message }),
    );
    expect(events.some((e) => e.kind === "session-complete")).toBe(false);
    expect(events.filter((e) => e.kind === "tool-call").length).toBe(3);
    expect(onNotify).toHaveBeenCalledWith("error", "AI Agent Error", message);
  });

  it("defaults to 16 tool rounds", async () => {
    const { provider, chat } = makeProvider(alwaysToolCalls);
    const { handleAICommand, events } = renderAgent({}, provider);

    await handleAICommand("loop forever");

    expect(chat).toHaveBeenCalledTimes(17);
    expect(events).toContainEqual(
      expect.objectContaining({
        kind: "error",
        message: "Stopped after 16 tool rounds without a final answer",
      }),
    );
  });

  it("keeps the session history well-formed after stopping", async () => {
    const { provider, chat } = makeProvider((call) =>
      call < 3 ? alwaysToolCalls() : { text: "Done." },
    );
    const { handleAICommand, events } = renderAgent(
      { maxToolRounds: 2 },
      provider,
    );

    await handleAICommand("first");
    const sessionId = events[0].sessionId;
    await handleAICommand("continue", { sessionId });

    const history = chat.mock.calls[chat.mock.calls.length - 1][4] ?? [];
    assertWellFormed(history);
    const continuation = history.findIndex(
      (m) => m.role === "user" && m.content === "continue",
    );
    expect(history[continuation - 1]).toEqual({
      role: "assistant",
      content: "[Stopped after 2 tool rounds without a final answer]",
    });
  });

  it("rejects a non-positive maxToolRounds", () => {
    const { provider } = makeProvider(alwaysToolCalls);
    expect(() => renderAgent({ maxToolRounds: 0 }, provider)).toThrow(
      /maxToolRounds/,
    );
  });
});

describe("useAIAgent extra tools", () => {
  const hostTool = (execute: ToolSpec["execute"]): ToolSpec => ({
    name: "host_lookup",
    description: "Host lookup",
    schema: { type: "object", properties: {} },
    execute,
  });

  it("offers and executes host extra tools", async () => {
    const execute = vi.fn(async () => ({
      name: "host_lookup",
      result: { found: true },
    }));
    const { provider, chat } = makeProvider((call) =>
      call === 0
        ? { toolCalls: [{ id: "1", name: "host_lookup", args: {} }] }
        : { text: "ok" },
    );
    const { handleAICommand, events } = renderAgent(
      { extraTools: [hostTool(execute)] },
      provider,
    );

    await handleAICommand("look it up");

    const offered = chat.mock.calls[0][2].map((t) => t.name);
    expect(offered).toContain("host_lookup");
    expect(offered).toContain("create_task");
    expect(execute).toHaveBeenCalledOnce();
    expect(events).toContainEqual(
      expect.objectContaining({
        kind: "tool-result",
        toolName: "host_lookup",
        result: { found: true },
      }),
    );
  });

  it("reports a failing extra tool as a tool error and keeps going", async () => {
    const { provider } = makeProvider((call) =>
      call === 0
        ? { toolCalls: [{ id: "1", name: "host_lookup", args: {} }] }
        : { text: "recovered" },
    );
    const { handleAICommand, events } = renderAgent(
      {
        extraTools: [
          hostTool(async () => {
            throw new Error("host offline");
          }),
        ],
      },
      provider,
    );

    await handleAICommand("look it up");

    expect(events).toContainEqual(
      expect.objectContaining({
        kind: "tool-result",
        result: { error: "host offline" },
      }),
    );
    expect(events.some((e) => e.kind === "session-complete")).toBe(true);
  });

  it("throws when both capabilities and extraTools are provided", () => {
    const { provider } = makeProvider(alwaysToolCalls);
    const capabilities: Capabilities = createCapabilities(
      createAgentCapabilityContext({
        getTasks: () => [],
        getSettings: () => DEFAULT_SETTINGS,
        onTaskAdded: vi.fn(),
        onTaskUpdated: vi.fn(),
        onTaskDeleted: vi.fn(),
        onNotify: vi.fn(),
      }),
    );
    expect(() =>
      renderAgent(
        {
          capabilities,
          extraTools: [hostTool(async () => ({ name: "x", result: null }))],
        },
        provider,
      ),
    ).toThrow(/cannot be combined/);
  });
});

describe("createAgentCapabilityContext", () => {
  const makeCtx = () => {
    const onTaskUpdated = vi.fn();
    const onTaskDeleted = vi.fn();
    const ctx = createAgentCapabilityContext({
      getTasks: () => [TASK],
      getSettings: () => DEFAULT_SETTINGS,
      onTaskAdded: vi.fn(),
      onTaskUpdated,
      onTaskDeleted,
      onNotify: vi.fn(),
    });
    return { ctx, onTaskUpdated, onTaskDeleted };
  };

  it("throws when updating an unknown task", async () => {
    const { ctx, onTaskUpdated } = makeCtx();
    await expect(ctx.updateTask({ ...TASK, id: "missing" })).rejects.toThrow(
      "Task not found: missing",
    );
    expect(onTaskUpdated).not.toHaveBeenCalled();
  });

  it("throws when deleting an unknown task", async () => {
    const { ctx, onTaskDeleted } = makeCtx();
    await expect(ctx.deleteTask("missing")).rejects.toThrow(
      "Task not found: missing",
    );
    expect(onTaskDeleted).not.toHaveBeenCalled();
  });

  it("passes the previous task for known ids", async () => {
    const { ctx, onTaskUpdated, onTaskDeleted } = makeCtx();
    const next = { ...TASK, title: "Renamed" };
    await ctx.updateTask(next);
    await ctx.deleteTask(TASK.id);
    expect(onTaskUpdated).toHaveBeenCalledWith(next, TASK);
    expect(onTaskDeleted).toHaveBeenCalledWith(TASK.id, TASK);
  });

  it("surfaces an unknown id as a tool error result via executeTool", async () => {
    const tasks = [TASK];
    const ctx = createAgentCapabilityContext({
      getTasks: () => tasks,
      getSettings: () => DEFAULT_SETTINGS,
      onTaskAdded: vi.fn(),
      onTaskUpdated: vi.fn(),
      // Simulate the task disappearing between lookup and mutation
      onTaskDeleted: vi.fn(),
      onNotify: vi.fn(),
      onConfirm: async () => {
        tasks.splice(0, 1);
        return true;
      },
    });
    const result = await createCapabilities(ctx).executeTool("delete_task", {
      id: TASK.id,
    });
    expect(result).toEqual({
      name: "delete_task",
      result: { error: "Task not found: task-1" },
    });
  });
});
