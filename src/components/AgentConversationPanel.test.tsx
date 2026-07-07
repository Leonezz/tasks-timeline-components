import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import type { AgentSession } from "../types";
import { AgentConversationPanel } from "./AgentConversationPanel";

const baseSession: AgentSession = {
  id: "session-1",
  prompt: "Review today's tasks",
  provider: "openai",
  model: "gpt-4o",
  status: "running",
  startedAt: "2026-06-14T00:00:00.000Z",
  updatedAt: "2026-06-14T00:00:04.000Z",
  entries: [
    {
      id: "entry-user",
      kind: "user",
      title: "You",
      body: "Review today's tasks",
      timestamp: "2026-06-14T00:00:00.000Z",
    },
    {
      id: "entry-status",
      kind: "status",
      title: "Status",
      body: "Reading vault tasks",
      timestamp: "2026-06-14T00:00:01.000Z",
    },
    {
      id: "entry-tool-call",
      kind: "tool-call",
      title: "Using query_tasks",
      timestamp: "2026-06-14T00:00:02.000Z",
      toolName: "query_tasks",
      payload: { status: "due" },
    },
    {
      id: "entry-tool-result",
      kind: "tool-result",
      title: "query_tasks result",
      timestamp: "2026-06-14T00:00:03.000Z",
      toolName: "query_tasks",
      payload: { count: 2 },
    },
    {
      id: "entry-assistant",
      kind: "assistant",
      title: "Agent",
      body: "Two tasks are due today.",
      timestamp: "2026-06-14T00:00:04.000Z",
    },
  ],
};

function renderPanel(
  overrides: Partial<ComponentProps<typeof AgentConversationPanel>> = {},
): string {
  return renderToStaticMarkup(
    <AgentConversationPanel
      isOpen
      sessions={[baseSession]}
      activeSessionId={baseSession.id}
      onSelectSession={vi.fn()}
      onStartNewSession={vi.fn()}
      onSendMessage={vi.fn()}
      onClose={vi.fn()}
      onDeleteSession={vi.fn()}
      {...overrides}
    />,
  );
}

describe("AgentConversationPanel", () => {
  it("renders accessible session tabs, composer label, agent processing, and copy actions", () => {
    const html = renderPanel();

    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-label="Agent conversation sessions"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('aria-label="Agent conversation message"');
    expect(html).toContain("Agent processing");
    expect(html).toContain("Working");
    expect(html).toContain("Running: Tool result: query_tasks");
    expect(html).toContain('data-testid="agent-process-block"');
    expect(html).toContain('data-testid="agent-process-inspector"');
    expect(html).toContain("Run Query Tasks");
    expect(html).toContain("Query Tasks returned");
    expect(html).toContain("Tool output");
    expect(html).toContain("Result");
    expect(html).toContain("Answer");
    expect(html).toContain("Copy reply");
    expect(html).toContain("Copy tool output");
  });

  it("renders an exit path when drafting a new conversation with existing sessions", () => {
    const html = renderPanel({ activeSessionId: null });

    expect(html).toContain('aria-label="New agent conversation draft"');
    expect(html).toContain("Draft ready");
    expect(html).toContain("Exit draft");
  });
});
