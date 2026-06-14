import { describe, expect, it } from "vitest";
import type { AgentEvent, AgentSession } from "../types";
import { reduceAgentSessions } from "./useAgentSessions";

function applyEvents(events: AgentEvent[]): AgentSession[] {
  return events.reduce<AgentSession[]>(
    (sessions, event) => reduceAgentSessions(sessions, event),
    [],
  );
}

describe("reduceAgentSessions", () => {
  it("records an inspectable agent session lifecycle", () => {
    const sessions = applyEvents([
      {
        kind: "session-start",
        sessionId: "session-1",
        timestamp: "2026-06-14T00:00:00.000Z",
        prompt: "Create a task for tomorrow",
        provider: "openai",
        model: "gpt-4o",
      },
      {
        kind: "status",
        sessionId: "session-1",
        timestamp: "2026-06-14T00:00:01.000Z",
        message: "Thinking",
      },
      {
        kind: "tool-call",
        sessionId: "session-1",
        timestamp: "2026-06-14T00:00:02.000Z",
        toolCallId: "tool-1",
        toolName: "create_task",
        args: { title: "Follow up" },
      },
      {
        kind: "tool-result",
        sessionId: "session-1",
        timestamp: "2026-06-14T00:00:03.000Z",
        toolCallId: "tool-1",
        toolName: "create_task",
        result: { id: "task-1" },
      },
      {
        kind: "assistant-message",
        sessionId: "session-1",
        timestamp: "2026-06-14T00:00:04.000Z",
        text: "Created the task.",
      },
      {
        kind: "session-complete",
        sessionId: "session-1",
        timestamp: "2026-06-14T00:00:05.000Z",
      },
    ]);

    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({
      id: "session-1",
      prompt: "Create a task for tomorrow",
      provider: "openai",
      model: "gpt-4o",
      status: "complete",
      updatedAt: "2026-06-14T00:00:05.000Z",
    });
    expect(sessions[0].entries.map((entry) => entry.kind)).toEqual([
      "user",
      "status",
      "status",
      "tool-call",
      "tool-result",
      "assistant",
    ]);
    expect(sessions[0].entries.at(-1)).toMatchObject({
      title: "Agent",
      body: "Created the task.",
    });
  });

  it("marks a session as failed when an error event is received", () => {
    const sessions = applyEvents([
      {
        kind: "session-start",
        sessionId: "session-1",
        timestamp: "2026-06-14T00:00:00.000Z",
        prompt: "Plan my day",
        provider: "gemini",
        model: "gemini-2.0-flash",
      },
      {
        kind: "error",
        sessionId: "session-1",
        timestamp: "2026-06-14T00:00:01.000Z",
        message: "Provider unavailable",
      },
    ]);

    expect(sessions[0]).toMatchObject({
      status: "error",
      updatedAt: "2026-06-14T00:00:01.000Z",
    });
    expect(sessions[0].entries.at(-1)).toMatchObject({
      kind: "error",
      body: "Provider unavailable",
    });
  });

  it("appends follow-up user messages and reopens a completed session", () => {
    const sessions = applyEvents([
      {
        kind: "session-start",
        sessionId: "session-1",
        timestamp: "2026-06-14T00:00:00.000Z",
        prompt: "Plan my day",
        provider: "openai",
        model: "gpt-4o",
      },
      {
        kind: "assistant-message",
        sessionId: "session-1",
        timestamp: "2026-06-14T00:00:01.000Z",
        text: "Start with the overdue task.",
      },
      {
        kind: "session-complete",
        sessionId: "session-1",
        timestamp: "2026-06-14T00:00:02.000Z",
      },
      {
        kind: "user-message",
        sessionId: "session-1",
        timestamp: "2026-06-14T00:00:03.000Z",
        text: "What should I do after that?",
      },
    ]);

    expect(sessions[0]).toMatchObject({
      id: "session-1",
      status: "running",
      updatedAt: "2026-06-14T00:00:03.000Z",
    });
    expect(sessions[0].entries.map((entry) => entry.kind)).toEqual([
      "user",
      "status",
      "assistant",
      "user",
    ]);
    expect(sessions[0].entries.at(-1)).toMatchObject({
      title: "You",
      body: "What should I do after that?",
    });
  });
});
