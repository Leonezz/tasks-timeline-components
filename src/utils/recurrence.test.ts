import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RRule } from "rrule";
import {
  DEFAULT_RECURRENCE_FORM_STATE,
  describeRecurrence,
  readRecurrenceRule,
  recurrenceSaveFormat,
  resolveRecurrenceOnSave,
  type RecurrenceFormState,
} from "./recurrence";

const weekly: RecurrenceFormState = {
  ...DEFAULT_RECURRENCE_FORM_STATE,
  freq: RRule.WEEKLY,
};

describe("readRecurrenceRule", () => {
  it("reads RRULE syntax", () => {
    const read = readRecurrenceRule(
      "RRULE:FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=1",
    );

    expect(read.source).toBe("rrule");
    expect(read.state).toMatchObject({
      freq: RRule.MONTHLY,
      interval: 2,
      byMonthDay: [1],
    });
  });

  it("reads Obsidian Tasks text rules", () => {
    const read = readRecurrenceRule("every week on Monday, Wednesday");

    expect(read.source).toBe("text");
    expect(read.state.freq).toBe(RRule.WEEKLY);
    expect(read.state.interval).toBe(1);
    expect(read.state.byWeekDay.map((d) => d.weekday)).toEqual([0, 2]);
  });

  it("does not fill in days the rule does not name", () => {
    // rrule's computed options add today's weekday to "every week"
    expect(readRecurrenceRule("every week").state.byWeekDay).toEqual([]);
    expect(readRecurrenceRule("RRULE:FREQ=YEARLY").state.byMonthDay).toEqual(
      [],
    );
  });

  it("reads start and end dates", () => {
    const read = readRecurrenceRule(
      "DTSTART:20260105T000000Z\nRRULE:FREQ=WEEKLY;UNTIL=20261231T235959Z",
    );

    expect(read.state.start).toBe("2026-01-05");
    expect(read.state.end).toBe("2026-12-31");
  });

  it("reports rules it cannot read instead of guessing", () => {
    expect(readRecurrenceRule("every fortnight")).toEqual({
      source: "unparsed",
      state: DEFAULT_RECURRENCE_FORM_STATE,
      whenDone: false,
      unsupportedParts: [],
    });
    // rrule's text parser returns an empty rule here rather than throwing
    expect(readRecurrenceRule("when done").source).toBe("unparsed");
  });

  it("returns defaults when there is no rule", () => {
    expect(readRecurrenceRule(undefined)).toEqual({
      source: "none",
      state: DEFAULT_RECURRENCE_FORM_STATE,
      whenDone: false,
      unsupportedParts: [],
    });
  });
});

describe("resolveRecurrenceOnSave", () => {
  it("keeps an untouched text rule verbatim", () => {
    const original = { recurringInterval: "every week when done" };

    expect(
      resolveRecurrenceOnSave(original, {
        isRecurring: true,
        controlsTouched: false,
        format: "rrule",
        state: readRecurrenceRule(original.recurringInterval).state,
      }),
    ).toEqual({
      isRecurring: undefined,
      recurringInterval: "every week when done",
    });
  });

  it("keeps an untouched RRULE verbatim", () => {
    const original = {
      isRecurring: true,
      recurringInterval: "RRULE:FREQ=WEEKLY;INTERVAL=1",
    };

    expect(
      resolveRecurrenceOnSave(original, {
        isRecurring: true,
        controlsTouched: false,
        format: "rrule",
        state: readRecurrenceRule(original.recurringInterval).state,
      }),
    ).toEqual(original);
  });

  it("keeps an untouched rule it cannot read", () => {
    const original = { recurringInterval: "every fortnight" };

    expect(
      resolveRecurrenceOnSave(original, {
        isRecurring: true,
        controlsTouched: false,
        format: "rrule",
        state: DEFAULT_RECURRENCE_FORM_STATE,
      }),
    ).toEqual({ isRecurring: undefined, recurringInterval: "every fortnight" });
  });

  it("keeps the rule when recurrence is switched off and on again", () => {
    const original = { recurringInterval: "every week when done" };

    expect(
      resolveRecurrenceOnSave(original, {
        isRecurring: true,
        controlsTouched: false,
        format: "rrule",
        state: weekly,
      }).recurringInterval,
    ).toBe("every week when done");
  });

  it("clears the rule when recurrence is switched off", () => {
    expect(
      resolveRecurrenceOnSave(
        { recurringInterval: "every week" },
        {
          isRecurring: false,
          controlsTouched: false,
          format: "rrule",
          state: weekly,
        },
      ),
    ).toEqual({ isRecurring: false, recurringInterval: undefined });
  });

  it("leaves a non-recurring task unchanged", () => {
    expect(
      resolveRecurrenceOnSave(
        {},
        {
          isRecurring: false,
          controlsTouched: false,
          format: "rrule",
          state: weekly,
        },
      ),
    ).toEqual({ isRecurring: undefined, recurringInterval: undefined });
  });

  it("writes a new rule when the controls were edited", () => {
    const result = resolveRecurrenceOnSave(
      { recurringInterval: "every week" },
      {
        isRecurring: true,
        controlsTouched: true,
        format: "rrule",
        state: { ...weekly, interval: 2, byWeekDay: [RRule.MO] },
      },
    );

    expect(result).toEqual({
      isRecurring: true,
      recurringInterval: "RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO",
    });
  });

  it("writes a rule from the controls when recurrence is switched on", () => {
    expect(
      resolveRecurrenceOnSave(
        {},
        {
          isRecurring: true,
          controlsTouched: false,
          format: "rrule",
          state: weekly,
        },
      ),
    ).toEqual({
      isRecurring: true,
      recurringInterval: "RRULE:FREQ=WEEKLY;INTERVAL=1",
    });
  });
});

describe("describeRecurrence", () => {
  it("describes the form state in words", () => {
    expect(describeRecurrence({ ...weekly, byWeekDay: [RRule.MO] })).toBe(
      "every week on Monday",
    );
  });
});

describe("resolveRecurrenceOnSave in text format", () => {
  const edited = (state: Partial<RecurrenceFormState>, whenDone = false) =>
    resolveRecurrenceOnSave(
      { recurringInterval: "every week" },
      {
        isRecurring: true,
        controlsTouched: true,
        format: "text",
        whenDone,
        state: { ...weekly, ...state },
      },
    ).recurringInterval;

  it("writes Obsidian Tasks text", () => {
    expect(edited({ interval: 2, byWeekDay: [RRule.MO] })).toBe(
      "every 2 weeks on Monday",
    );
  });

  it("keeps 'when done'", () => {
    expect(edited({ interval: 2 }, true)).toBe("every 2 weeks when done");
  });

  it("refuses a start date, which text rules can't hold", () => {
    expect(() => edited({ start: "2026-10-16" })).toThrow(
      "can't store a start date",
    );
  });

  it("writes an end date as text", () => {
    expect(edited({ end: "2026-12-31" })).toBe(
      "every week until December 31, 2026",
    );
  });
});

describe.each([
  ["America/Los_Angeles", 480],
  ["Asia/Shanghai", -480],
  ["UTC", 0],
] as const)("start and end dates in %s", (zone, januaryOffset) => {
  beforeEach(() => {
    vi.stubEnv("TZ", zone);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads back the dates the editor saved", () => {
    expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(januaryOffset);
    const saved = resolveRecurrenceOnSave(
      {},
      {
        isRecurring: true,
        controlsTouched: true,
        format: "rrule",
        state: { ...weekly, start: "2026-10-16", end: "2026-12-31" },
      },
    ).recurringInterval;

    expect(saved).toBe(
      "DTSTART:20261016T000000Z\nRRULE:FREQ=WEEKLY;INTERVAL=1;UNTIL=20261231T235959Z",
    );
    expect(readRecurrenceRule(saved).state).toMatchObject({
      start: "2026-10-16",
      end: "2026-12-31",
    });
  });

  it("describes the end date as written", () => {
    expect(describeRecurrence({ ...weekly, end: "2026-12-31" })).toBe(
      "every week until December 31, 2026",
    );
  });
});

describe("editing Obsidian Tasks rules in the editor", () => {
  const editText = (stored: string, change: Partial<RecurrenceFormState>) => {
    const read = readRecurrenceRule(stored);
    return resolveRecurrenceOnSave(
      { recurringInterval: stored },
      {
        isRecurring: true,
        controlsTouched: true,
        format: "text",
        whenDone: read.whenDone,
        state: { ...read.state, ...change },
      },
    ).recurringInterval;
  };

  it("adds a weekday to a rule whatever order the days are in", () => {
    const read = readRecurrenceRule("every week on Monday, Friday");

    expect(
      editText("every week on Monday, Friday", {
        byWeekDay: [...read.state.byWeekDay, RRule.WE],
      }),
    ).toBe("every week on Monday, Wednesday, Friday");
  });

  it("saves months and days picked out of order", () => {
    expect(
      editText("every year", { byMonth: [12, 6], byMonthDay: [15, 1] }),
    ).toBe("every June and December on the 1st and 15th");
  });

  it("keeps the end date of an 'until' rule", () => {
    expect(editText("every week until January 1, 2027", { interval: 2 })).toBe(
      "every 2 weeks until January 1, 2027",
    );
  });
});

describe("recurrenceSaveFormat", () => {
  it.each([
    ["text", "none", {}, "text"],
    ["auto", "text", {}, "text"],
    // Plain checkboxes and lines without Tasks dates are still parser output
    ["auto", "none", { extra: { isTasksTask: "false" } }, "text"],
    ["auto", "rrule", { extra: { isTasksTask: "true" } }, "text"],
    ["auto", "rrule", {}, "rrule"],
    ["auto", "none", {}, "rrule"],
  ] as const)(
    "declared %s, stored %s, task %j -> %s",
    (declared, source, task, expected) => {
      expect(recurrenceSaveFormat(declared, source, task)).toBe(expected);
    },
  );
});

describe("readRecurrenceRule: parts the editor can't show", () => {
  it("shows a daily rule on weekdays as a weekly rule the buttons show", () => {
    const read = readRecurrenceRule("FREQ=DAILY;BYDAY=MO,WE");

    expect(read.state.freq).toBe(RRule.WEEKLY);
    expect(read.state.byWeekDay.map((day) => day.weekday)).toEqual([0, 2]);
    expect(read.unsupportedParts).toEqual([]);
  });

  it.each([
    ["FREQ=MONTHLY;BYDAY=+2MO", "ordinal weekdays (like the 2nd Monday)"],
    ["FREQ=MONTHLY;BYDAY=-1FR", "ordinal weekdays (like the 2nd Monday)"],
    ["FREQ=WEEKLY;COUNT=5", "a number of repetitions (COUNT)"],
    ["FREQ=WEEKLY;BYMONTH=6", "months"],
    [
      "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1",
      "a position within the period (BYSETPOS)",
    ],
    ["FREQ=WEEKLY;INTERVAL=2;WKST=SU", "a week start other than Monday"],
    ["FREQ=HOURLY;INTERVAL=48", "an hourly or shorter frequency"],
    ["FREQ=YEARLY;BYYEARDAY=100", "days of the year"],
  ])("%j has %s", (rule, part) => {
    expect(readRecurrenceRule(rule).unsupportedParts).toContain(part);
  });

  it("keeps such a rule verbatim while the controls are untouched", () => {
    const rule = "FREQ=MONTHLY;BYDAY=+2MO";
    const read = readRecurrenceRule(rule);

    expect(
      resolveRecurrenceOnSave(
        { recurringInterval: rule },
        {
          isRecurring: true,
          controlsTouched: false,
          format: "rrule",
          state: read.state,
        },
      ).recurringInterval,
    ).toBe(rule);
  });
});

describe("the last day of the month", () => {
  it("is shown on the day buttons", () => {
    const read = readRecurrenceRule("every month on the last");

    expect(read.state.byMonthDay).toEqual([-1]);
    expect(read.unsupportedParts).toEqual([]);
  });

  it("is saved with other days as text", () => {
    expect(
      resolveRecurrenceOnSave(
        { recurringInterval: "every month on the last" },
        {
          isRecurring: true,
          controlsTouched: true,
          format: "text",
          state: {
            ...DEFAULT_RECURRENCE_FORM_STATE,
            freq: RRule.MONTHLY,
            byMonthDay: [-1, 15],
          },
        },
      ).recurringInterval,
    ).toBe("every month on the 15th and last");
  });

  it("flags other days counted from the month's end", () => {
    expect(
      readRecurrenceRule("FREQ=MONTHLY;BYMONTHDAY=-2").unsupportedParts,
    ).toContain("days counted from the month's end");
  });
});

describe("days counted from the month's end", () => {
  it("are dropped when the settings change, as the editor warns", () => {
    const stored = "FREQ=MONTHLY;BYMONTHDAY=-2,15";
    const read = readRecurrenceRule(stored);
    expect(read.state.byMonthDay).toEqual([-2, 15]);

    expect(
      resolveRecurrenceOnSave(
        { recurringInterval: stored },
        {
          isRecurring: true,
          controlsTouched: true,
          format: "rrule",
          state: { ...read.state, interval: 2 },
        },
      ).recurringInterval,
    ).toBe("RRULE:FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=15");
  });
});
