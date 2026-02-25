import type {
  ArgMatcher,
  ExpectedTool,
  Recording,
  RecordingTurn,
  CaseResult,
} from "./types";

/**
 * Type guards for ArgMatcher variants
 */
function isContainsMatcher(matcher: unknown): matcher is { contains: string } {
  return (
    typeof matcher === "object" &&
    matcher !== null &&
    "contains" in matcher &&
    typeof (matcher as { contains: unknown }).contains === "string"
  );
}

function isTypeMatcher(
  matcher: unknown,
): matcher is { type: "date" | "string" | "number" | "boolean" | "array" } {
  if (typeof matcher !== "object" || matcher === null || !("type" in matcher)) {
    return false;
  }
  const t = (matcher as { type: unknown }).type;
  return (
    t === "date" ||
    t === "string" ||
    t === "number" ||
    t === "boolean" ||
    t === "array"
  );
}

function isEqualsMatcher(matcher: unknown): matcher is { equals: unknown } {
  return typeof matcher === "object" && matcher !== null && "equals" in matcher;
}

function isOneOfMatcher(matcher: unknown): matcher is { oneOf: unknown[] } {
  return (
    typeof matcher === "object" &&
    matcher !== null &&
    "oneOf" in matcher &&
    Array.isArray((matcher as { oneOf: unknown }).oneOf)
  );
}

function isArgMatcher(value: unknown): value is ArgMatcher {
  return (
    isContainsMatcher(value) ||
    isTypeMatcher(value) ||
    isEqualsMatcher(value) ||
    isOneOfMatcher(value)
  );
}

/**
 * Match an actual value against an expected matcher or plain value.
 *
 * Returns { pass: boolean; message?: string } describing the result.
 */
export function matchValue(
  actual: unknown,
  matcher: ArgMatcher | unknown,
): { pass: boolean; message?: string } {
  // Plain value matchers: string, number, boolean, null
  if (
    matcher === null ||
    typeof matcher === "string" ||
    typeof matcher === "number" ||
    typeof matcher === "boolean"
  ) {
    const pass = actual === matcher;
    return pass
      ? { pass: true }
      : {
          pass: false,
          message: `Expected ${JSON.stringify(matcher)}, got ${JSON.stringify(actual)}`,
        };
  }

  // Not an object -- pass through for unrecognized primitive types (e.g. undefined)
  if (typeof matcher !== "object" || matcher === null) {
    return { pass: true };
  }

  // Contains matcher
  if (isContainsMatcher(matcher)) {
    const actualStr = String(actual).toLowerCase();
    const pass = actualStr.includes(matcher.contains.toLowerCase());
    return pass
      ? { pass: true }
      : {
          pass: false,
          message: `Expected "${actual}" to contain "${matcher.contains}"`,
        };
  }

  // Type matcher
  if (isTypeMatcher(matcher)) {
    if (matcher.type === "date") {
      const pass =
        typeof actual === "string" && /^\d{4}-\d{2}-\d{2}/.test(actual);
      return pass
        ? { pass: true }
        : {
            pass: false,
            message: `Expected a date string (YYYY-MM-DD...), got ${JSON.stringify(actual)}`,
          };
    }
    if (matcher.type === "array") {
      const pass = Array.isArray(actual);
      return pass
        ? { pass: true }
        : {
            pass: false,
            message: `Expected an array, got ${JSON.stringify(actual)}`,
          };
    }
    // eslint-disable-next-line valid-typeof
    const pass = typeof actual === matcher.type;
    return pass
      ? { pass: true }
      : {
          pass: false,
          message: `Expected type "${matcher.type}", got type "${typeof actual}"`,
        };
  }

  // Equals matcher (deep equality via JSON.stringify)
  if (isEqualsMatcher(matcher)) {
    const pass = JSON.stringify(actual) === JSON.stringify(matcher.equals);
    return pass
      ? { pass: true }
      : {
          pass: false,
          message: `Expected ${JSON.stringify(matcher.equals)}, got ${JSON.stringify(actual)}`,
        };
  }

  // OneOf matcher
  if (isOneOfMatcher(matcher)) {
    const pass = matcher.oneOf.includes(actual);
    return pass
      ? { pass: true }
      : {
          pass: false,
          message: `Expected one of ${JSON.stringify(matcher.oneOf)}, got ${JSON.stringify(actual)}`,
        };
  }

  // Unrecognized matcher shape -- pass through
  return { pass: true };
}

/**
 * Extract all tool calls from recording turns.
 * Only assistant turns with toolCalls are considered.
 */
function extractToolCalls(
  turns: RecordingTurn[],
): Array<{ name: string; args: Record<string, unknown> }> {
  return turns
    .filter(
      (
        turn,
      ): turn is RecordingTurn & {
        toolCalls: NonNullable<RecordingTurn["toolCalls"]>;
      } =>
        turn.role === "assistant" &&
        Array.isArray(turn.toolCalls) &&
        turn.toolCalls.length > 0,
    )
    .flatMap((turn) => turn.toolCalls);
}

/**
 * Evaluate a recording against expected tool calls.
 *
 * Checks that actual tool calls match expected tools in order,
 * verifying both tool names and argument matchers.
 */
export function evaluateCase(
  recording: Recording,
  expectedTools: ExpectedTool[],
): CaseResult {
  const actualToolCalls = extractToolCalls(recording.turns);
  const errors: string[] = [];

  // Check tool call count
  if (actualToolCalls.length < expectedTools.length) {
    errors.push(
      `Expected at least ${expectedTools.length} tool call(s), got ${actualToolCalls.length}`,
    );
  }

  // Validate each expected tool in order
  for (let i = 0; i < expectedTools.length; i++) {
    const expected = expectedTools[i];

    if (i >= actualToolCalls.length) {
      errors.push(`Missing tool call #${i + 1}: expected "${expected.name}"`);
      continue;
    }

    const actual = actualToolCalls[i];

    // Check tool name
    if (actual.name !== expected.name) {
      errors.push(
        `Tool call #${i + 1}: expected name "${expected.name}", got "${actual.name}"`,
      );
      continue;
    }

    // Check args if specified
    if (expected.args) {
      for (const [argName, matcher] of Object.entries(expected.args)) {
        const actualValue = actual.args[argName];
        const result = matchValue(actualValue, matcher);
        if (!result.pass) {
          errors.push(
            `Tool call #${i + 1} "${expected.name}" arg "${argName}": ${result.message}`,
          );
        }
      }
    }
  }

  return {
    caseId: recording.caseId,
    description: recording.input,
    provider: recording.provider,
    model: recording.model,
    pass: errors.length === 0,
    errors,
    actualToolCalls,
    expectedTools,
    tokenUsage: recording.totalTokenUsage,
    latencyMs: recording.totalLatencyMs,
  };
}
