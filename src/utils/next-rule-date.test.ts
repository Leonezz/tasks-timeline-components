import { describe, expect, it } from "vitest";
import { RRule } from "rrule";
import { nextRuleDay } from "./next-rule-date";
import {
  floatingCalendarDay,
  floatingDay,
  floatingEndOfDay,
  parseRecurrenceRule,
} from "./recurrence-rule";

const parse = (rule: string) => {
  const parsed = parseRecurrenceRule(rule);
  if (!parsed) throw new Error(`unreadable test rule ${rule}`);
  return parsed;
};

/** rrule's own answer: the first date after the end of `from`. */
const groundTruth = (rule: string, from: string): string | null => {
  const parsed = parse(rule);
  const next = new RRule({
    ...parsed.options,
    dtstart: floatingDay(parsed.start ?? from),
    until: parsed.end ? floatingEndOfDay(parsed.end) : null,
  }).after(floatingEndOfDay(from));
  return next ? floatingCalendarDay(next) : null;
};

describe("nextRuleDay matches rrule", () => {
  it.each([
    // A day of the month picks the days; any weekday
    ["FREQ=WEEKLY;BYMONTHDAY=15", "2026-01-10"],
    // Without day filters, a weekly rule keeps its start's weekday
    ["FREQ=WEEKLY;BYMONTH=6", "2026-01-10"],
    ["FREQ=WEEKLY;BYYEARDAY=100", "2026-01-10"],
    ["FREQ=WEEKLY;BYEASTER=0", "2026-01-10"],
    ["FREQ=DAILY;BYEASTER=0", "2026-01-10"],
    // Ordinal weekdays are plain ones in daily rules
    ["FREQ=DAILY;BYDAY=+1MO;BYMONTH=6", "2026-01-10"],
    [
      "DTSTART:20260101T000000Z\nRRULE:FREQ=WEEKLY;BYMONTHDAY=15;COUNT=2",
      "2026-01-15",
    ],
    [
      "DTSTART:20260101T000000Z\nRRULE:FREQ=WEEKLY;BYMONTHDAY=15;COUNT=2",
      "2026-02-15",
    ],
    [
      "DTSTART:20260105T000000Z\nRRULE:FREQ=WEEKLY;INTERVAL=2;BYMONTH=6;COUNT=3",
      "2026-06-01",
    ],
    ["FREQ=HOURLY;INTERVAL=48;BYDAY=MO", "2026-10-12"],
    ["FREQ=DAILY;BYSETPOS=1;BYDAY=MO", "2026-10-12"],
  ])("%j from %s", (rule, from) => {
    expect(nextRuleDay(parse(rule), from, rule)).toBe(groundTruth(rule, from));
  });
});

describe("nextRuleDay with BYSETPOS on daily rules", () => {
  it("rules out a position past the only date of a day, quickly", () => {
    const rule = "FREQ=DAILY;BYSETPOS=2;BYMONTH=2;BYMONTHDAY=28";
    const started = performance.now();

    expect(() => nextRuleDay(parse(rule), "2026-01-10", rule)).toThrow(
      "has no date after",
    );
    expect(performance.now() - started).toBeLessThan(1000);
  });

  it("rules out an ordinal weekday with date filters that never match, quickly", () => {
    const rule = "FREQ=DAILY;BYDAY=+1MO;BYMONTH=2;BYMONTHDAY=30";
    const started = performance.now();

    expect(() => nextRuleDay(parse(rule), "2026-01-10", rule)).toThrow(
      "has no date after",
    );
    expect(performance.now() - started).toBeLessThan(1000);
  });
});
