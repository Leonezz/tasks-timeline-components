import { useCallback, useState } from "react";
import type {
  AgentEntry,
  AgentEvent,
  AgentSession,
  AgentSessionStatus,
} from "../types";

function createEntry(
  event: AgentEvent,
  kind: AgentEntry["kind"],
  title: string,
  body?: string,
  payload?: unknown,
  toolName?: string,
): AgentEntry {
  const eventKey =
    "toolCallId" in event && event.toolCallId ? event.toolCallId : event.kind;

  return {
    id: `${event.sessionId}-${eventKey}-${event.timestamp}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    kind,
    title,
    body,
    timestamp: event.timestamp,
    payload,
    toolName,
  };
}

function updateSessionStatus(
  session: AgentSession,
  status: AgentSessionStatus,
  timestamp: string,
): AgentSession {
  return {
    ...session,
    status,
    updatedAt: timestamp,
  };
}

export function reduceAgentSessions(
  sessions: AgentSession[],
  event: AgentEvent,
): AgentSession[] {
  if (event.kind === "session-start") {
    const session: AgentSession = {
      id: event.sessionId,
      prompt: event.prompt,
      provider: event.provider,
      model: event.model,
      status: "running",
      startedAt: event.timestamp,
      updatedAt: event.timestamp,
      entries: [
        createEntry(event, "user", "You", event.prompt),
        createEntry(
          event,
          "status",
          "Agent started",
          `${event.provider} · ${event.model || "default model"}`,
        ),
      ],
    };

    return [...sessions.filter((item) => item.id !== event.sessionId), session];
  }

  return sessions.map((session) => {
    if (session.id !== event.sessionId) {
      return session;
    }

    switch (event.kind) {
      case "status":
        return {
          ...session,
          updatedAt: event.timestamp,
          entries: [
            ...session.entries,
            createEntry(event, "status", "Status", event.message),
          ],
        };
      case "assistant-message":
        return {
          ...session,
          updatedAt: event.timestamp,
          entries: [
            ...session.entries,
            createEntry(event, "assistant", "Agent", event.text),
          ],
        };
      case "user-message":
        return {
          ...updateSessionStatus(session, "running", event.timestamp),
          entries: [
            ...session.entries,
            createEntry(event, "user", "You", event.text),
          ],
        };
      case "tool-call":
        return {
          ...session,
          updatedAt: event.timestamp,
          entries: [
            ...session.entries,
            createEntry(
              event,
              "tool-call",
              `Using ${event.toolName}`,
              undefined,
              event.args,
              event.toolName,
            ),
          ],
        };
      case "tool-result":
        return {
          ...session,
          updatedAt: event.timestamp,
          entries: [
            ...session.entries,
            createEntry(
              event,
              "tool-result",
              `${event.toolName} result`,
              undefined,
              event.result,
              event.toolName,
            ),
          ],
        };
      case "error":
        return {
          ...updateSessionStatus(session, "error", event.timestamp),
          entries: [
            ...session.entries,
            createEntry(event, "error", "Error", event.message),
          ],
        };
      case "session-complete":
        return updateSessionStatus(session, "complete", event.timestamp);
    }
  });
}

export function removeAgentSessionById(
  sessions: AgentSession[],
  sessionId: string,
): AgentSession[] {
  return sessions.filter((session) => session.id !== sessionId);
}

export function useAgentSessions(onAgentEvent?: (event: AgentEvent) => void) {
  const [sessions, setSessions] = useState<AgentSession[]>([]);

  const emitAgentEvent = useCallback(
    (event: AgentEvent) => {
      onAgentEvent?.(event);
      setSessions((current) => reduceAgentSessions(current, event));
    },
    [onAgentEvent],
  );

  const clearAgentSessions = useCallback(() => {
    setSessions([]);
  }, []);

  const removeAgentSession = useCallback((sessionId: string) => {
    setSessions((current) => removeAgentSessionById(current, sessionId));
  }, []);

  return {
    agentSessions: sessions,
    emitAgentEvent,
    clearAgentSessions,
    removeAgentSession,
  };
}
