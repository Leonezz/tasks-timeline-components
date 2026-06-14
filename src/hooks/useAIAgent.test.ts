import { describe, expect, it } from "vitest";
import type { ChatMessage } from "../providers/types";
import {
  appendAssistantMessageToHistory,
  createAgentTurnHistory,
} from "./useAIAgent";

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
    const history: ChatMessage[] = [
      { role: "user", content: "Plan my day" },
    ];

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
