import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { formatRecurrence, formatSmartDate } from "./date";
import { readRecurrenceRule } from "./recurrence";

describe("formatSmartDate", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T12:00:00Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("urgency-based relative dates (bug fix for issue #14)", () => {
    it("shows 'in 2 days' for Feb 3 (within 5-day threshold)", () => {
      const result = formatSmartDate("2026-02-03", true, "yyyy-MM-dd");
      expect(result).toBe("in 2 days");
    });

    it("shows 'in 5 days' for Feb 6 (at 5-day threshold)", () => {
      const result = formatSmartDate("2026-02-06", true, "yyyy-MM-dd");
      expect(result).toBe("in 5 days");
    });

    it("shows 'in 4 days' for Feb 5 (within 5-day threshold)", () => {
      const result = formatSmartDate("2026-02-05", true, "yyyy-MM-dd");
      expect(result).toBe("in 4 days");
    });

    it("lets Luxon choose unit for dates beyond 5 days (e.g., weeks/months)", () => {
      const result = formatSmartDate("2026-03-03", true, "yyyy-MM-dd"); // 30 days
      // Beyond 5 days, Luxon chooses appropriate unit (months for ~30 days)
      expect(result).toBe("in 1 month");
    });

    it("lets Luxon choose unit for dates ~2 weeks away", () => {
      const result = formatSmartDate("2026-02-15", true, "yyyy-MM-dd"); // 14 days
      // Luxon returns "in 14 days" for this range (not "in 2 weeks")
      expect(result).toBe("in 14 days");
    });
  });

  describe("existing behavior (should still work)", () => {
    it("returns 'Today' for today's date", () => {
      const result = formatSmartDate("2026-02-01", true, "yyyy-MM-dd");
      expect(result).toBe("Today");
    });

    it("returns 'Tomorrow' for tomorrow", () => {
      const result = formatSmartDate("2026-02-02", true, "yyyy-MM-dd");
      expect(result).toBe("Tomorrow");
    });

    it("returns 'Yesterday' for yesterday", () => {
      const result = formatSmartDate("2026-01-31", true, "yyyy-MM-dd");
      expect(result).toBe("Yesterday");
    });

    it("returns absolute date when useRelative is false", () => {
      const result = formatSmartDate("2026-02-15", false, "yyyy-MM-dd");
      expect(result).toBe("2026-02-15");
    });

    it("handles dates far in the future (Luxon chooses months)", () => {
      const result = formatSmartDate("2026-04-01", true, "yyyy-MM-dd"); // ~59 days
      // Beyond 5 days, Luxon chooses appropriate unit (months for far future)
      expect(result).toBe("in 2 months");
    });

    it("handles dates in the past", () => {
      const result = formatSmartDate("2026-01-20", true, "yyyy-MM-dd"); // ~12 days ago
      expect(result).toContain("ago");
    });
  });
});

// The Recurring badge's tooltip and aria-label
describe("formatRecurrence", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("gives the end date the editor and complete_task read", () => {
    vi.stubEnv("TZ", "America/Los_Angeles");
    expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(480);

    // A legacy UTC end: the last occurrence is on December 30 local time
    const rule = "FREQ=WEEKLY;UNTIL=20261231T050000Z";
    expect(readRecurrenceRule(rule).state.end).toBe("2026-12-30");
    // rrule's own text says December 31
    expect(formatRecurrence(rule)).toBe("every week until December 30, 2026");
  });

  it("reads end dates rrule can't parse", () => {
    expect(formatRecurrence("FREQ=WEEKLY;UNTIL=2026-12-31")).toBe(
      "every week until December 31, 2026",
    );
    expect(formatRecurrence("every week until 2026-12-31")).toBe(
      "every week until December 31, 2026",
    );
  });

  it("keeps 'when done'", () => {
    expect(formatRecurrence("every week when done")).toBe(
      "every week when done",
    );
  });

  it("shows a rule it can't read as written", () => {
    expect(formatRecurrence("every fortnight")).toBe("every fortnight");
    expect(formatRecurrence("FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1")).toBe(
      "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1",
    );
    expect(formatRecurrence("")).toBe("");
  });
});
