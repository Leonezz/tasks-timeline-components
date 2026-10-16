import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RRule, rrulestr } from "rrule";
import { DateTime } from "luxon";
import {
  isReadableRecurrenceRule,
  parseRecurrenceRule,
  recurrenceRuleError,
} from "./recurrence-rule";

/** Zones either side of UTC, with their January offset from Date. */
const TIME_ZONES = [
  ["America/Los_Angeles", 480],
  ["Asia/Shanghai", -480],
  ["UTC", 0],
] as const;

describe("parseRecurrenceRule", () => {
  it("reads RRULE syntax and Obsidian Tasks text", () => {
    expect(parseRecurrenceRule("FREQ=WEEKLY;BYDAY=MO")).toMatchObject({
      source: "rrule",
      options: { freq: RRule.WEEKLY, interval: 1 },
    });
    expect(parseRecurrenceRule("every 2 weeks")).toMatchObject({
      source: "text",
      options: { freq: RRule.WEEKLY, interval: 2 },
      whenDone: false,
    });
    expect(parseRecurrenceRule("every week when done")).toMatchObject({
      source: "text",
      whenDone: true,
    });
  });

  it.each([
    ["INTERVAL=2", "no FREQ: rrule would assume yearly"],
    ["BYDAY=MO", "no FREQ"],
    ["DTSTART:20260105", "no FREQ"],
    ["FREQ=WEEKLY;INTERVAL=0", "interval 0 never moves"],
    ["FREQ=WEEKLY;INTERVAL=-1", "negative interval loops forever"],
    ["FREQ=WEEKLY;INTERVAL=1.5", "fractional interval"],
    ["every fortnight", "unknown text"],
    ["when done", "text with no rule"],
    ["", "empty"],
  ])("rejects %j (%s)", (rule) => {
    expect(parseRecurrenceRule(rule)).toBeNull();
    expect(isReadableRecurrenceRule(rule)).toBe(false);
    expect(recurrenceRuleError(rule)).toContain(
      `Cannot read the recurrence rule "${rule}"`,
    );
  });

  it.each([
    "FREQ=WEEKLY;UNTIL=2026-12-31",
    "RRULE:FREQ=WEEKLY;UNTIL=2026-12-31",
    "FREQ=WEEKLY;UNTIL=2026-12-31T00:00:00Z",
    "FREQ=WEEKLY;UNTIL=20261231",
  ])("accepts the end date in %j", (rule) => {
    expect(parseRecurrenceRule(rule)?.end).toBe("2026-12-31");
  });

  it("accepts a dashed start date", () => {
    expect(
      parseRecurrenceRule("DTSTART:2026-01-05\nRRULE:FREQ=WEEKLY")?.start,
    ).toBe("2026-01-05");
  });

  it("drops time-of-day parts, which can't move a day-based task", () => {
    expect(parseRecurrenceRule("FREQ=DAILY;BYHOUR=9")?.options).toEqual({
      freq: RRule.DAILY,
      interval: 1,
    });
  });

  describe.each(TIME_ZONES)("in %s", (zone, januaryOffset) => {
    beforeEach(() => {
      vi.stubEnv("TZ", zone);
    });
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("reads start and end as the calendar days written in the rule", () => {
      expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(januaryOffset);

      const rule = parseRecurrenceRule(
        "DTSTART:20260105T000000Z\nRRULE:FREQ=WEEKLY;UNTIL=20261231T235959Z",
      );

      expect(rule?.start).toBe("2026-01-05");
      expect(rule?.end).toBe("2026-12-31");
    });

    it("reads the end date of a text rule as the date written", () => {
      expect(
        parseRecurrenceRule("every week until December 31, 2026")?.end,
      ).toBe("2026-12-31");
    });
  });
});

/** A rule as the editor wrote it before 0.9: local midnight and end of day. */
const legacyEditorRule = (start: string, end: string): string =>
  new RRule({
    freq: RRule.WEEKLY,
    interval: 1,
    dtstart: DateTime.fromISO(start).toJSDate(),
    until: DateTime.fromISO(end).endOf("day").toJSDate(),
  }).toString();

describe.each(["Asia/Shanghai", "Pacific/Auckland", "America/Los_Angeles"])(
  "rules saved by the earlier editor, read in %s",
  (zone) => {
    beforeEach(() => {
      vi.stubEnv("TZ", zone);
    });
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("keep the start and end days they were saved with", () => {
      const rule = legacyEditorRule("2026-10-16", "2026-10-19");
      // Proves the rule really uses this zone's local times
      expect(rule).not.toContain("T000000Z");

      expect(parseRecurrenceRule(rule)).toMatchObject({
        start: "2026-10-16",
        end: "2026-10-19",
      });
    });
  },
);

describe.each(["UTC", "America/Los_Angeles"])("TZID rules in %s", (zone) => {
  beforeEach(() => {
    vi.stubEnv("TZ", zone);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("use the days in the rule's own zone and drop the zone", () => {
    const rule = parseRecurrenceRule(
      "DTSTART;TZID=Asia/Tokyo:20261016T080000\nRRULE:FREQ=DAILY;UNTIL=20261020T145959Z",
    );

    expect(rule).toMatchObject({ start: "2026-10-16", end: "2026-10-20" });
    expect(rule?.options).not.toHaveProperty("tzid");
  });
});

describe("start date forms", () => {
  it("reads DTSTART;VALUE=DATE", () => {
    expect(
      parseRecurrenceRule("DTSTART;VALUE=DATE:20261016\nRRULE:FREQ=WEEKLY")
        ?.start,
    ).toBe("2026-10-16");
  });

  it.each([
    "FREQ=WEEKLY;UNTIL=20270229",
    "FREQ=WEEKLY;UNTIL=2027-02-29",
    "DTSTART:20261301\nRRULE:FREQ=WEEKLY",
    "FREQ=WEEKLY;UNTIL=20261231T250000Z",
  ])("rejects the impossible date in %j", (rule) => {
    expect(parseRecurrenceRule(rule)).toBeNull();
  });
});

describe.each(["America/Los_Angeles", "Asia/Shanghai", "Pacific/Auckland"])(
  "floating times in %s",
  (zone) => {
    beforeEach(() => {
      vi.stubEnv("TZ", zone);
    });
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("reads a start without Z or TZID as the date written", () => {
      expect(
        parseRecurrenceRule("DTSTART:20261016T230000\nRRULE:FREQ=WEEKLY")
          ?.start,
      ).toBe("2026-10-16");
      expect(
        parseRecurrenceRule("DTSTART:20261016T010000\nRRULE:FREQ=WEEKLY")
          ?.start,
      ).toBe("2026-10-16");
    });
  },
);

describe("TZID end dates", () => {
  it("reads a date-only end as the date written", () => {
    expect(
      parseRecurrenceRule(
        "DTSTART;TZID=Asia/Tokyo:20261016T080000\nRRULE:FREQ=DAILY;UNTIL=20261020",
      )?.end,
    ).toBe("2026-10-20");
  });

  it("ends a day earlier when the end comes before that day's start time", () => {
    // 22:00Z on the 19th is 07:00 on the 20th in Tokyo, before 08:00
    expect(
      parseRecurrenceRule(
        "DTSTART;TZID=Asia/Tokyo:20261016T080000\nRRULE:FREQ=DAILY;UNTIL=20261019T220000Z",
      )?.end,
    ).toBe("2026-10-19");
  });

  it.each([
    "DTSTART;TZID=Mars/Olympus:20261016T080000\nRRULE:FREQ=DAILY;UNTIL=20261020T000000Z",
    'DTSTART;TZID="America/New_York":20261016T080000\nRRULE:FREQ=DAILY;UNTIL=20261020T000000Z',
  ])(
    "treats an unusable zone as unreadable instead of throwing: %j",
    (rule) => {
      expect(() => parseRecurrenceRule(rule)).not.toThrow();
      expect(parseRecurrenceRule(rule)).toBeNull();
    },
  );
});

describe.each([
  "UTC",
  "America/Los_Angeles",
  "Asia/Shanghai",
  "Pacific/Auckland",
])("end dates with a time, read in %s (#46)", (zone) => {
  beforeEach(() => {
    vi.stubEnv("TZ", zone);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    // The 20th's date would be at 10:00, after the 8:00 end
    [
      "DTSTART:20261016T100000\nRRULE:FREQ=DAILY;UNTIL=20261020T080000",
      "2026-10-19",
    ],
    [
      "DTSTART:20261016T100000\nRRULE:FREQ=DAILY;UNTIL=20261020T100000",
      "2026-10-20",
    ],
    [
      "DTSTART:20261016T100000Z\nRRULE:FREQ=DAILY;UNTIL=20261020T080000Z",
      "2026-10-19",
    ],
    [
      "DTSTART:20261016T100000Z\nRRULE:FREQ=DAILY;UNTIL=20261020T120000Z",
      "2026-10-20",
    ],
    // Dates at 7:00 (BYHOUR) come before the 8:00 end
    [
      "DTSTART:20261016T100000\nRRULE:FREQ=DAILY;BYHOUR=7;UNTIL=20261020T080000",
      "2026-10-20",
    ],
    // Without a start, dates are at midnight
    ["FREQ=DAILY;UNTIL=20261020T080000", "2026-10-20"],
    // A time zone's end is compared in that zone (07:00 in Tokyo)
    [
      "DTSTART;TZID=Asia/Tokyo:20261016T080000\nRRULE:FREQ=DAILY;UNTIL=20261019T220000Z",
      "2026-10-19",
    ],
  ])("%j ends on %s", (rule, end) => {
    expect(parseRecurrenceRule(rule)?.end).toBe(end);
  });

  it("keeps the start and end times for computing with them", () => {
    expect(
      parseRecurrenceRule(
        "DTSTART:20261016T100000\nRRULE:FREQ=HOURLY;BYMINUTE=0,30;UNTIL=20261020T080000",
      ),
    ).toMatchObject({
      start: "2026-10-16",
      startDateTime: "2026-10-16T10:00:00",
      end: "2026-10-20",
      endDateTime: "2026-10-20T08:00:00",
      timesOfDay: { byminute: [0, 30] },
    });
  });
});

/** The day of rrule's last date for a rule, in the machine's zone. */
const lastLocalDay = (rule: string): string | null => {
  const dates = rrulestr(rule).all();
  const last = dates[dates.length - 1];
  return last ? DateTime.fromJSDate(last).toISODate() : null;
};

describe.each([
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Shanghai",
  "Pacific/Auckland",
  "UTC",
])("UTC end dates checked against rrule, read in %s (#46)", (zone) => {
  beforeEach(() => {
    vi.stubEnv("TZ", zone);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    // UNTIL is the last date, after the clocks change (late October in
    // Europe and early November in America)
    "DTSTART:20261016T080000Z\nRRULE:FREQ=DAILY;UNTIL=20261105T080000Z",
    "DTSTART:20261016T223000Z\nRRULE:FREQ=DAILY;UNTIL=20261105T223000Z",
    "DTSTART:20261016T223000Z\nRRULE:FREQ=DAILY;UNTIL=20261105T220000Z",
    // ... and after they change in March
    "DTSTART:20260301T120000Z\nRRULE:FREQ=DAILY;UNTIL=20260402T120000Z",
    "DTSTART:20260301T120000Z\nRRULE:FREQ=DAILY;UNTIL=20260402T113000Z",
    // BYHOUR is a UTC hour
    "DTSTART:20261016T100000Z\nRRULE:FREQ=DAILY;BYHOUR=9;UNTIL=20261020T083000Z",
    "DTSTART:20261016T100000Z\nRRULE:FREQ=DAILY;BYHOUR=9;UNTIL=20261020T093000Z",
    "DTSTART:20261016T100000Z\nRRULE:FREQ=DAILY;BYHOUR=9,23;UNTIL=20261020T220000Z",
    "DTSTART:20261016T100000Z\nRRULE:FREQ=DAILY;BYHOUR=9,23;UNTIL=20261020T233000Z",
  ])("%j ends on the day of rrule's last date", (rule) => {
    expect(parseRecurrenceRule(rule)?.end).toBe(lastLocalDay(rule));
  });
});

describe("times of day", () => {
  it.each([
    "FREQ=DAILY;BYHOUR=24",
    "FREQ=DAILY;BYMINUTE=60",
    "FREQ=DAILY;BYSECOND=61",
  ])("rejects %j, which rrule would roll over", (rule) => {
    expect(parseRecurrenceRule(rule)).toBeNull();
  });
});

describe("other start and end forms", () => {
  it("reads DTSTART= inside the rule", () => {
    expect(
      parseRecurrenceRule("FREQ=WEEKLY;DTSTART=20261016T000000Z")?.start,
    ).toBe("2026-10-16");
  });

  it("rejects hour 24, which would roll over to the next day", () => {
    expect(
      parseRecurrenceRule("FREQ=WEEKLY;UNTIL=20261231T240000Z"),
    ).toBeNull();
  });
});
