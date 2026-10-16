import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RRule } from "rrule";
import { DateTime } from "luxon";
import type { Task } from "../types";
import { nextOccurrence } from "./next-occurrence";
import { isReadableRecurrenceRule } from "./recurrence-rule";
import {
  DEFAULT_RECURRENCE_FORM_STATE,
  resolveRecurrenceOnSave,
  type RecurrenceFormState,
} from "./recurrence";

/** Zones either side of UTC, with their January offset from Date. */
const TIME_ZONES = [
  ["America/Los_Angeles", 480],
  ["Asia/Shanghai", -480],
  ["UTC", 0],
] as const;

const task = (overrides: Partial<Task>): Task => ({
  id: "task-1",
  title: "Pay rent",
  status: "todo",
  priority: "medium",
  tags: [],
  ...overrides,
});

const nextDue = (dueAt: string, rule: string, today = "2026-01-01") =>
  nextOccurrence(task({ dueAt, recurringInterval: rule }), today)?.dueAt;

/** A rule as the task editor saves it in RRULE format. */
const ruleFromEditor = (state: Partial<RecurrenceFormState>): string => {
  const saved = resolveRecurrenceOnSave(
    {},
    {
      isRecurring: true,
      controlsTouched: true,
      format: "rrule",
      state: { ...DEFAULT_RECURRENCE_FORM_STATE, ...state },
    },
  ).recurringInterval;
  if (!saved) throw new Error("editor saved no rule");
  return saved;
};

describe("nextOccurrence: month and year ends (Obsidian Tasks text rules)", () => {
  it.each([
    ["2026-01-31", "every month", "2026-02-28"],
    ["2026-10-31", "every month", "2026-11-30"],
    ["2026-12-31", "every 2 months", "2027-02-28"],
    ["2028-02-29", "every year", "2029-02-28"],
    ["2026-01-15", "every month", "2026-02-15"],
  ])("due %s, %s -> %s", (dueAt, rule, expected) => {
    expect(nextDue(dueAt, rule)).toBe(expected);
  });

  it("clamps 'when done' rules completed at a month end", () => {
    expect(nextDue("2026-01-10", "every month when done", "2026-01-31")).toBe(
      "2026-02-28",
    );
  });

  it("keeps RFC 5545 behaviour for RRULE syntax", () => {
    // RFC 5545 skips months without the 31st
    expect(nextDue("2026-01-31", "FREQ=MONTHLY")).toBe("2026-03-31");
  });

  it("uses the rule's day selectors when it has them", () => {
    expect(nextDue("2026-01-31", "every month on the 1st")).toBe("2026-02-01");
  });
});

describe("nextOccurrence: unreadable rules", () => {
  it.each([
    "INTERVAL=2",
    "BYDAY=MO",
    "DTSTART:20260105",
    "FREQ=WEEKLY;INTERVAL=0",
    "FREQ=WEEKLY;INTERVAL=-1",
  ])("throws for %j instead of guessing", (rule) => {
    // Guard: if validation ever lets this through, stop before rrule loops
    expect(isReadableRecurrenceRule(rule)).toBe(false);
    expect(() => nextDue("2026-10-16", rule)).toThrow(
      `Cannot read the recurrence rule "${rule}"`,
    );
  });

  it("explains the manual fix for a start date left by v0.8.0", () => {
    expect(() => nextDue("2026-10-16", "DTSTART:20261016T000000Z")).toThrow(
      /written by v0\.8\.0 on two lines/,
    );
  });

  it("accepts the dashed UNTIL form", () => {
    expect(nextDue("2026-10-16", "FREQ=WEEKLY;UNTIL=2026-12-31")).toBe(
      "2026-10-23",
    );
    expect(
      nextDue("2026-12-31", "FREQ=WEEKLY;UNTIL=2026-12-31"),
    ).toBeUndefined();
  });
});

describe.each(TIME_ZONES)("nextOccurrence in %s", (zone, januaryOffset) => {
  beforeEach(() => {
    vi.stubEnv("TZ", zone);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("runs in the zone", () => {
    expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(januaryOffset);
  });

  it("moves a weekly rule with a start date a full week", () => {
    const rule = ruleFromEditor({ freq: RRule.WEEKLY, start: "2026-10-16" });

    expect(nextDue("2026-10-16", rule)).toBe("2026-10-23");
  });

  it("moves a Friday rule from a Friday to the next Friday", () => {
    const rule = ruleFromEditor({
      freq: RRule.WEEKLY,
      byWeekDay: [RRule.FR],
      start: "2026-10-16",
    });

    expect(nextDue("2026-10-16", rule)).toBe("2026-10-23");
  });

  it("ends on the end date chosen in the editor", () => {
    const rule = ruleFromEditor({ freq: RRule.DAILY, end: "2026-12-31" });

    expect(nextDue("2026-12-30", rule)).toBe("2026-12-31");
    expect(
      nextOccurrence(
        task({ dueAt: "2026-12-31", recurringInterval: rule }),
        "2026-12-31",
      ),
    ).toBeNull();
  });

  it.each([
    "FREQ=DAILY;BYHOUR=9",
    "DTSTART:20261016T090000Z\nRRULE:FREQ=DAILY",
    "every hour",
  ])("never returns the same day for %j", (rule) => {
    expect(nextDue("2026-10-16", rule)).toBe("2026-10-17");
  });
});

describe.each(["Europe/Berlin", "America/New_York", "Asia/Shanghai"])(
  "nextOccurrence for a UTC rule across a change of clocks, in %s (#46)",
  (zone) => {
    beforeEach(() => {
      vi.stubEnv("TZ", zone);
    });
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("keeps the last date, at UNTIL", () => {
      const rule =
        "DTSTART:20261016T080000Z\nRRULE:FREQ=DAILY;UNTIL=20261105T080000Z";

      expect(nextDue("2026-11-04", rule)).toBe("2026-11-05");
      expect(
        nextOccurrence(
          task({ dueAt: "2026-11-05", recurringInterval: rule }),
          "2026-11-05",
        ),
      ).toBeNull();
    });
  },
);

describe("nextOccurrence: rules with no later date", () => {
  it.each([
    ["2026-02-10", "FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=30"],
    // Day 30 comes from the start date, and February never has it
    ["2026-01-30", "FREQ=YEARLY;BYMONTH=2"],
  ])("due %s, %j throws instead of ending the series", (dueAt, rule) => {
    expect(() => nextDue(dueAt, rule)).toThrow(`has no date after ${dueAt}`);
  });

  it("ends the series when the rule has an end date", () => {
    expect(
      nextOccurrence(
        task({
          dueAt: "2026-02-10",
          recurringInterval:
            "FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=30;UNTIL=20300101",
        }),
        "2026-02-10",
      ),
    ).toBeNull();
  });

  it("treats sub-daily rules as daily and answers quickly from an early start", () => {
    const started = performance.now();

    expect(
      nextDue("2026-10-16", "DTSTART:20000101T000000Z\nRRULE:FREQ=MINUTELY"),
    ).toBe("2026-10-17");
    expect(performance.now() - started).toBeLessThan(2000);
  });
});

describe.each(["Asia/Shanghai", "Pacific/Auckland", "America/Los_Angeles"])(
  "nextOccurrence for rules saved by the earlier editor in %s",
  (zone) => {
    beforeEach(() => {
      vi.stubEnv("TZ", zone);
    });
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("moves a weekly rule from its Friday start to the next Friday", () => {
      const legacy = new RRule({
        freq: RRule.WEEKLY,
        interval: 1,
        dtstart: DateTime.fromISO("2026-10-16").toJSDate(),
      }).toString();

      expect(nextDue("2026-10-16", legacy)).toBe("2026-10-23");
    });

    it("stops at an end date saved in local time", () => {
      const legacy = new RRule({
        freq: RRule.DAILY,
        interval: 1,
        until: DateTime.fromISO("2026-10-19").endOf("day").toJSDate(),
      }).toString();

      expect(nextDue("2026-10-18", legacy)).toBe("2026-10-19");
      expect(
        nextOccurrence(
          task({ dueAt: "2026-10-19", recurringInterval: legacy }),
          "2026-10-19",
        ),
      ).toBeNull();
    });
  },
);

describe.each(["UTC", "America/Los_Angeles"])(
  "nextOccurrence for a TZID rule east of %s",
  (zone) => {
    beforeEach(() => {
      vi.stubEnv("TZ", zone);
    });
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("keeps the rule's weekday", () => {
      expect(
        nextDue(
          "2026-10-16",
          "DTSTART;TZID=Asia/Tokyo:20261016T080000\nRRULE:FREQ=WEEKLY",
        ),
      ).toBe("2026-10-23");
    });
  },
);

describe("nextOccurrence: dates far ahead", () => {
  it.each([
    // Not a multiple of 4: the next February 29th is 12 years later
    [
      "2028-02-29",
      "FREQ=YEARLY;INTERVAL=3;BYMONTH=2;BYMONTHDAY=29",
      "2040-02-29",
    ],
    // Christmas on a Sunday: 2022, then 2033
    [
      "2022-12-25",
      "FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25;BYDAY=SU",
      "2033-12-25",
    ],
    // An end date beyond the next date doesn't end the series early
    [
      "2028-02-29",
      "FREQ=YEARLY;INTERVAL=3;BYMONTH=2;BYMONTHDAY=29;UNTIL=20450101",
      "2040-02-29",
    ],
  ])("due %s, %j -> %s", (dueAt, rule, expected) => {
    expect(nextDue(dueAt, rule)).toBe(expected);
  });
});

describe("nextOccurrence: rules that never match, quickly", () => {
  it.each([
    "FREQ=DAILY;BYMONTH=2;BYMONTHDAY=30",
    "FREQ=DAILY;INTERVAL=2;BYMONTH=2;BYMONTHDAY=30",
    "FREQ=WEEKLY;BYMONTH=2;BYMONTHDAY=30",
  ])("%j throws in under a second", (rule) => {
    const started = performance.now();

    expect(() => nextDue("2026-01-10", rule)).toThrow("has no date after");
    expect(performance.now() - started).toBeLessThan(1000);
  });

  it("ends a never-matching rule with an end date in under a second", () => {
    const started = performance.now();

    expect(
      nextOccurrence(
        task({
          dueAt: "2026-01-10",
          recurringInterval:
            "FREQ=DAILY;BYMONTH=2;BYMONTHDAY=30;UNTIL=20991231",
        }),
        "2026-01-10",
      ),
    ).toBeNull();
    expect(performance.now() - started).toBeLessThan(1000);
  });
});

describe("nextOccurrence: hourly rules", () => {
  it.each([
    ["FREQ=HOURLY;INTERVAL=48", "2026-10-18"],
    ["every 48 hours", "2026-10-18"],
    ["every hour", "2026-10-17"],
    ["FREQ=HOURLY;INTERVAL=36", "2026-10-17"],
  ])("%j moves due 2026-10-16 to %s", (rule, expected) => {
    expect(nextDue("2026-10-16", rule)).toBe(expected);
  });
});
