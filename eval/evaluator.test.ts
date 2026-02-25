import { describe, it, expect } from "vitest";
import { matchValue, evaluateCase } from "./evaluator";
import type { Recording, ExpectedTool } from "./types";

// ---------------------------------------------------------------------------
// matchValue tests
// ---------------------------------------------------------------------------

describe("matchValue", () => {
  describe("plain value exact match", () => {
    it("passes for matching strings", () => {
      expect(matchValue("hello", "hello")).toEqual({ pass: true });
    });

    it("fails for non-matching strings", () => {
      const result = matchValue("hello", "world");
      expect(result.pass).toBe(false);
      expect(result.message).toBeDefined();
    });

    it("passes for matching numbers", () => {
      expect(matchValue(42, 42)).toEqual({ pass: true });
    });

    it("passes for matching booleans", () => {
      expect(matchValue(true, true)).toEqual({ pass: true });
    });

    it("passes for matching null", () => {
      expect(matchValue(null, null)).toEqual({ pass: true });
    });

    it("fails when actual is different type", () => {
      const result = matchValue(42, "42");
      expect(result.pass).toBe(false);
    });
  });

  describe("contains matcher", () => {
    it("passes when actual contains the substring", () => {
      const result = matchValue("Buy groceries", { contains: "groceries" });
      expect(result.pass).toBe(true);
    });

    it("fails when actual does not contain the substring", () => {
      const result = matchValue("Fix bug", { contains: "grocery" });
      expect(result.pass).toBe(false);
      expect(result.message).toContain("contain");
    });

    it("is case insensitive", () => {
      const result = matchValue("buy groceries", { contains: "GROCERIES" });
      expect(result.pass).toBe(true);
    });
  });

  describe("type: date matcher", () => {
    it("passes for a valid YYYY-MM-DD date", () => {
      const result = matchValue("2026-02-25", { type: "date" as const });
      expect(result.pass).toBe(true);
    });

    it("passes for a full ISO datetime starting with date", () => {
      const result = matchValue("2026-02-25T10:30:00Z", {
        type: "date" as const,
      });
      expect(result.pass).toBe(true);
    });

    it("fails for a non-date string", () => {
      const result = matchValue("not-a-date", { type: "date" as const });
      expect(result.pass).toBe(false);
      expect(result.message).toContain("date");
    });

    it("fails for a number", () => {
      const result = matchValue(12345, { type: "date" as const });
      expect(result.pass).toBe(false);
    });
  });

  describe("type: string matcher", () => {
    it("passes for a string value", () => {
      const result = matchValue("hello", { type: "string" as const });
      expect(result.pass).toBe(true);
    });

    it("fails for a number value", () => {
      const result = matchValue(42, { type: "string" as const });
      expect(result.pass).toBe(false);
      expect(result.message).toContain("string");
    });
  });

  describe("type: number matcher", () => {
    it("passes for a number value", () => {
      const result = matchValue(42, { type: "number" as const });
      expect(result.pass).toBe(true);
    });

    it("fails for a string value", () => {
      const result = matchValue("hello", { type: "number" as const });
      expect(result.pass).toBe(false);
      expect(result.message).toContain("number");
    });
  });

  describe("type: boolean matcher", () => {
    it("passes for a boolean value", () => {
      const result = matchValue(true, { type: "boolean" as const });
      expect(result.pass).toBe(true);
    });

    it("fails for a string value", () => {
      const result = matchValue("true", { type: "boolean" as const });
      expect(result.pass).toBe(false);
    });
  });

  describe("equals matcher", () => {
    it("passes for deep-equal values", () => {
      const result = matchValue("high", { equals: "high" });
      expect(result.pass).toBe(true);
    });

    it("fails for non-equal values", () => {
      const result = matchValue("low", { equals: "high" });
      expect(result.pass).toBe(false);
      expect(result.message).toContain("high");
    });

    it("works with object values via JSON.stringify", () => {
      const result = matchValue({ a: 1, b: 2 }, { equals: { a: 1, b: 2 } });
      expect(result.pass).toBe(true);
    });
  });

  describe("oneOf matcher", () => {
    it("passes when actual is in the list", () => {
      const result = matchValue("todo", { oneOf: ["todo", "doing"] });
      expect(result.pass).toBe(true);
    });

    it("fails when actual is not in the list", () => {
      const result = matchValue("done", { oneOf: ["todo", "doing"] });
      expect(result.pass).toBe(false);
      expect(result.message).toContain("one of");
    });
  });

  describe("unrecognized matcher shape", () => {
    it("passes through for unknown object shapes", () => {
      const result = matchValue("anything", { customField: "whatever" });
      expect(result.pass).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles undefined actual with plain matcher", () => {
      const result = matchValue(undefined, "hello");
      expect(result.pass).toBe(false);
    });

    it("handles undefined actual with contains matcher", () => {
      const result = matchValue(undefined, { contains: "test" });
      // String(undefined) === "undefined", which doesn't contain "test"
      expect(result.pass).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// evaluateCase tests
// ---------------------------------------------------------------------------

describe("evaluateCase", () => {
  const baseRecording: Omit<Recording, "turns"> = {
    caseId: "test-1",
    input: "Create a task to buy groceries",
    provider: "gemini",
    model: "gemini-2.0-flash",
    timestamp: "2026-02-25T10:00:00Z",
    finalTasks: [],
    totalTokenUsage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
    totalLatencyMs: 500,
  };

  function makeRecording(
    turns: Recording["turns"],
    overrides?: Partial<Recording>,
  ): Recording {
    return { ...baseRecording, turns, ...overrides };
  }

  it("passes when one expected tool matches one actual tool call", () => {
    const recording = makeRecording([
      {
        role: "assistant",
        toolCalls: [
          {
            name: "create_task",
            args: { title: "Buy groceries", priority: "medium" },
          },
        ],
      },
    ]);

    const expected: ExpectedTool[] = [
      {
        name: "create_task",
        args: {
          title: { contains: "groceries" },
          priority: "medium",
        },
      },
    ];

    const result = evaluateCase(recording, expected);
    expect(result.pass).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.caseId).toBe("test-1");
    expect(result.tokenUsage.totalTokens).toBe(150);
    expect(result.latencyMs).toBe(500);
  });

  it("fails when there are fewer actual tool calls than expected", () => {
    const recording = makeRecording([
      { role: "assistant", text: "I'll help you with that." },
    ]);

    const expected: ExpectedTool[] = [
      { name: "create_task", args: { title: { contains: "grocery" } } },
    ];

    const result = evaluateCase(recording, expected);
    expect(result.pass).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.includes("Missing tool call"))).toBe(
      true,
    );
  });

  it("fails when tool name does not match", () => {
    const recording = makeRecording([
      {
        role: "assistant",
        toolCalls: [{ name: "update_task", args: { title: "Buy groceries" } }],
      },
    ]);

    const expected: ExpectedTool[] = [{ name: "create_task" }];

    const result = evaluateCase(recording, expected);
    expect(result.pass).toBe(false);
    expect(result.errors.some((e) => e.includes("expected name"))).toBe(true);
  });

  it("fails when tool name matches but arg does not", () => {
    const recording = makeRecording([
      {
        role: "assistant",
        toolCalls: [
          {
            name: "create_task",
            args: { title: "Fix the bug", priority: "low" },
          },
        ],
      },
    ]);

    const expected: ExpectedTool[] = [
      {
        name: "create_task",
        args: {
          title: { contains: "grocery" },
        },
      },
    ];

    const result = evaluateCase(recording, expected);
    expect(result.pass).toBe(false);
    expect(result.errors.some((e) => e.includes("title"))).toBe(true);
  });

  it("passes when multiple expected tools all match in order", () => {
    const recording = makeRecording([
      {
        role: "assistant",
        toolCalls: [{ name: "create_task", args: { title: "Buy groceries" } }],
      },
      {
        role: "tool",
        toolResults: [{ name: "create_task", result: { id: "1" } }],
      },
      {
        role: "assistant",
        toolCalls: [
          { name: "create_task", args: { title: "Clean the house" } },
        ],
      },
    ]);

    const expected: ExpectedTool[] = [
      { name: "create_task", args: { title: { contains: "groceries" } } },
      { name: "create_task", args: { title: { contains: "house" } } },
    ];

    const result = evaluateCase(recording, expected);
    expect(result.pass).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("passes when there are extra tool calls beyond expected", () => {
    const recording = makeRecording([
      {
        role: "assistant",
        toolCalls: [
          { name: "create_task", args: { title: "Buy groceries" } },
          { name: "get_task_stats", args: {} },
        ],
      },
    ]);

    const expected: ExpectedTool[] = [
      { name: "create_task", args: { title: { contains: "groceries" } } },
    ];

    const result = evaluateCase(recording, expected);
    expect(result.pass).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.actualToolCalls).toHaveLength(2);
  });

  it("handles expected tools with no args", () => {
    const recording = makeRecording([
      {
        role: "assistant",
        toolCalls: [{ name: "get_task_stats", args: {} }],
      },
    ]);

    const expected: ExpectedTool[] = [{ name: "get_task_stats" }];

    const result = evaluateCase(recording, expected);
    expect(result.pass).toBe(true);
  });

  it("ignores tool turns (only considers assistant turns)", () => {
    const recording = makeRecording([
      {
        role: "tool",
        toolResults: [{ name: "create_task", result: { id: "1" } }],
      },
      {
        role: "assistant",
        toolCalls: [{ name: "get_task_stats", args: {} }],
      },
    ]);

    const expected: ExpectedTool[] = [{ name: "get_task_stats" }];

    const result = evaluateCase(recording, expected);
    expect(result.pass).toBe(true);
    expect(result.actualToolCalls).toHaveLength(1);
  });

  it("reports missing arg values correctly", () => {
    const recording = makeRecording([
      {
        role: "assistant",
        toolCalls: [{ name: "create_task", args: { title: "Buy milk" } }],
      },
    ]);

    const expected: ExpectedTool[] = [
      {
        name: "create_task",
        args: {
          title: { contains: "milk" },
          dueAt: { type: "date" as const },
        },
      },
    ];

    const result = evaluateCase(recording, expected);
    expect(result.pass).toBe(false);
    expect(result.errors.some((e) => e.includes("dueAt"))).toBe(true);
  });

  it("populates result metadata from recording", () => {
    const recording = makeRecording(
      [
        {
          role: "assistant",
          toolCalls: [{ name: "create_task", args: { title: "Test" } }],
        },
      ],
      {
        caseId: "meta-test",
        provider: "openai",
        model: "gpt-4o",
        totalTokenUsage: {
          inputTokens: 200,
          outputTokens: 100,
          totalTokens: 300,
        },
        totalLatencyMs: 1200,
      },
    );

    const expected: ExpectedTool[] = [{ name: "create_task" }];

    const result = evaluateCase(recording, expected);
    expect(result.caseId).toBe("meta-test");
    expect(result.provider).toBe("openai");
    expect(result.model).toBe("gpt-4o");
    expect(result.tokenUsage.inputTokens).toBe(200);
    expect(result.tokenUsage.outputTokens).toBe(100);
    expect(result.tokenUsage.totalTokens).toBe(300);
    expect(result.latencyMs).toBe(1200);
  });
});
