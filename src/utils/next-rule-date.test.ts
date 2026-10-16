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

/**
 * rrule's answer for the whole rule, times of day and all: the first date
 * after the end of `from`, as a floating calendar day. Rules without DTSTART
 * start at `from`'s midnight, as the library starts them.
 */
const wholeRuleTruth = (rule: string, from: string): string | null => {
  const options = RRule.parseString(rule);
  const next = new RRule({
    ...options,
    dtstart: options.dtstart ?? floatingDay(from),
  }).after(floatingEndOfDay(from));
  return next ? floatingCalendarDay(next) : null;
};

const MONTHLY_MONDAYS_9_AND_5 =
  "DTSTART:20261001T000000\nRRULE:FREQ=MONTHLY;BYDAY=MO;BYHOUR=9,17";

describe("nextRuleDay matches rrule for rules with times of day (#46)", () => {
  it.each([
    // BYSETPOS picks among each month's Mondays at 9:00 and 17:00
    [`${MONTHLY_MONDAYS_9_AND_5};BYSETPOS=3`, "2026-10-01", "2026-10-12"],
    [`${MONTHLY_MONDAYS_9_AND_5};BYSETPOS=3`, "2026-10-12", "2026-11-09"],
    [`${MONTHLY_MONDAYS_9_AND_5};BYSETPOS=-3`, "2026-10-01", "2026-10-19"],
    [`${MONTHLY_MONDAYS_9_AND_5};BYSETPOS=-1`, "2026-10-01", "2026-10-26"],
    [
      "DTSTART:20261001T000000\nRRULE:FREQ=MONTHLY;BYDAY=MO,FR;BYMINUTE=0,30;BYSETPOS=3",
      "2026-10-01",
      "2026-10-05",
    ],
    // A day has two times, so position 2 picks one every day
    [
      "DTSTART:20261016T000000\nRRULE:FREQ=DAILY;BYHOUR=9,17;BYSETPOS=2",
      "2026-10-16",
      "2026-10-17",
    ],
    // COUNT counts each time of day
    [
      "DTSTART:20261016T000000\nRRULE:FREQ=DAILY;BYHOUR=9,17;COUNT=4",
      "2026-10-16",
      "2026-10-17",
    ],
    [
      "DTSTART:20261016T000000\nRRULE:FREQ=DAILY;BYHOUR=9,17;COUNT=4",
      "2026-10-17",
      null,
    ],
    // 9:00 on the start day comes before the 10:00 start
    [
      "DTSTART:20261016T100000\nRRULE:FREQ=DAILY;BYHOUR=9,17;COUNT=2",
      "2026-10-16",
      "2026-10-17",
    ],
    [
      "DTSTART:20261016T100000\nRRULE:FREQ=DAILY;BYHOUR=9,17;COUNT=2",
      "2026-10-17",
      null,
    ],
    // The month's last pick (17:00) is after the 12:00 end
    [
      `${MONTHLY_MONDAYS_9_AND_5};BYSETPOS=-1;UNTIL=20261026T120000`,
      "2026-10-01",
      null,
    ],
    // An end at 8:00 comes before that day's 10:00 date
    [
      "DTSTART:20261016T100000\nRRULE:FREQ=DAILY;UNTIL=20261020T080000",
      "2026-10-18",
      "2026-10-19",
    ],
    [
      "DTSTART:20261016T100000\nRRULE:FREQ=DAILY;UNTIL=20261020T080000",
      "2026-10-19",
      null,
    ],
    [
      "DTSTART:20261016T100000\nRRULE:FREQ=DAILY;BYHOUR=7;UNTIL=20261020T080000",
      "2026-10-19",
      "2026-10-20",
    ],
  ])("%j from %s", (rule, from, expected) => {
    expect(wholeRuleTruth(rule, from)).toBe(expected);
    expect(nextRuleDay(parse(rule), from, rule)).toBe(expected);
  });
});

describe("nextRuleDay matches rrule for hourly, minutely and secondly rules (#46)", () => {
  // 2026-10-12 is a Monday
  const EVERY_36_HOURS_ON_MONDAY =
    "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;INTERVAL=36;BYDAY=MO";

  it.each([
    // Steps of a day and a half reach Monday every other week or so
    [EVERY_36_HOURS_ON_MONDAY, "2026-10-12", "2026-10-19"],
    [EVERY_36_HOURS_ON_MONDAY, "2026-10-19", "2026-11-02"],
    [
      `${EVERY_36_HOURS_ON_MONDAY};UNTIL=20261102T000000`,
      "2026-10-19",
      "2026-11-02",
    ],
    [`${EVERY_36_HOURS_ON_MONDAY};UNTIL=20261101T000000`, "2026-10-19", null],
    [`${EVERY_36_HOURS_ON_MONDAY};COUNT=2`, "2026-10-12", "2026-10-19"],
    [`${EVERY_36_HOURS_ON_MONDAY};COUNT=2`, "2026-10-19", null],
    // COUNT counts hours: 24 on the first Monday, 6 on the next
    [
      "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;BYDAY=MO;COUNT=30",
      "2026-10-12",
      "2026-10-19",
    ],
    [
      "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;BYDAY=MO;COUNT=30",
      "2026-10-19",
      null,
    ],
    [
      "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;BYDAY=MO;COUNT=20",
      "2026-10-12",
      null,
    ],
    // From 22:00, only two hours of the start Monday count
    [
      "DTSTART:20261012T220000\nRRULE:FREQ=HOURLY;BYDAY=MO,TU;COUNT=3",
      "2026-10-12",
      "2026-10-13",
    ],
    [
      "DTSTART:20261012T000000\nRRULE:FREQ=MINUTELY;INTERVAL=7;BYDAY=MO;COUNT=300",
      "2026-10-12",
      "2026-10-19",
    ],
    // Steps longer than a day start from the start's time of day
    [
      "DTSTART:20261016T200000\nRRULE:FREQ=HOURLY;INTERVAL=30",
      "2026-10-16",
      "2026-10-18",
    ],
    // The step after the 19th lands at 12:00 on the 20th, after the end
    [
      "DTSTART:20261016T000000\nRRULE:FREQ=HOURLY;INTERVAL=36;UNTIL=20261020T080000",
      "2026-10-19",
      null,
    ],
    // BYHOUR keeps the steps that land on those hours
    [
      "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;INTERVAL=4;BYHOUR=8,9",
      "2026-10-12",
      "2026-10-13",
    ],
    [
      "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;BYHOUR=9;BYDAY=FR",
      "2026-10-12",
      "2026-10-16",
    ],
    [
      "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;BYHOUR=9;COUNT=3",
      "2026-10-13",
      "2026-10-14",
    ],
    [
      "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;BYHOUR=9;COUNT=3",
      "2026-10-14",
      null,
    ],
    // Steps of whole days keep the start's hour
    [
      "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;INTERVAL=48;BYHOUR=0",
      "2026-10-12",
      "2026-10-14",
    ],
    // 3600 seconds a day at 9:00: the 12th and 13th hold 7200
    [
      "DTSTART:20261012T000000\nRRULE:FREQ=SECONDLY;BYHOUR=9;COUNT=7300",
      "2026-10-13",
      "2026-10-14",
    ],
    [
      "DTSTART:20261012T000000\nRRULE:FREQ=SECONDLY;BYHOUR=9;COUNT=7300",
      "2026-10-14",
      null,
    ],
    // One date per hour, so position 1 picks it
    [
      "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;INTERVAL=36;BYDAY=MO;BYSETPOS=1",
      "2026-10-19",
      "2026-11-02",
    ],
    // Minutes within each hour don't change its day
    [
      "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;INTERVAL=36;BYMINUTE=0,30;BYDAY=MO",
      "2026-10-19",
      "2026-11-02",
    ],
  ])("%j from %s", (rule, from, expected) => {
    expect(wholeRuleTruth(rule, from)).toBe(expected);
    expect(nextRuleDay(parse(rule), from, rule)).toBe(expected);
  });

  it.each([
    // Even hours never reach 3:00; rrule itself would never return
    "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;INTERVAL=2;BYHOUR=3",
    "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;INTERVAL=48;BYHOUR=5",
    // Every 56 hours repeats on Monday, Wednesday and Friday only
    "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;INTERVAL=56;BYDAY=TU",
    "DTSTART:20261012T000000\nRRULE:FREQ=HOURLY;BYDAY=MO;BYSETPOS=2",
  ])("rules out %j, which never has a date, quickly", (rule) => {
    const started = performance.now();

    expect(() => nextRuleDay(parse(rule), "2026-10-12", rule)).toThrow(
      "has no date",
    );
    expect(performance.now() - started).toBeLessThan(1000);
  });

  it.each([
    [
      "FREQ=HOURLY;INTERVAL=5;BYHOUR=3",
      "BYHOUR, BYMINUTE or BYSECOND on an hourly, minutely or secondly rule",
    ],
    [
      "FREQ=HOURLY;BYMINUTE=0,30;COUNT=10",
      "BYMINUTE or BYSECOND within each hour or minute",
    ],
  ])("refuses %j as unsupported", (rule, reason) => {
    expect(() => nextRuleDay(parse(rule), "2026-10-12", rule)).toThrow(
      `isn't supported: ${reason}`,
    );
  });
});

/** Hourly and minutely rules with day filters, each reaching every day filter. */
const SUB_DAILY_SWEEP = [
  "HOURLY;INTERVAL=1",
  "HOURLY;INTERVAL=7",
  "HOURLY;INTERVAL=30",
  "HOURLY;INTERVAL=36",
  "MINUTELY;INTERVAL=1500",
]
  .flatMap((step) =>
    ["BYDAY=MO", "BYMONTHDAY=1,15", "BYMONTH=11;BYDAY=FR"].map(
      (days) => `FREQ=${step};${days}`,
    ),
  )
  .flatMap((rule) => [rule, `${rule};COUNT=40`])
  .flatMap((rule) => [
    `DTSTART:20261012T000000\nRRULE:${rule}`,
    `DTSTART:20261012T133000\nRRULE:${rule}`,
  ])
  .flatMap((rule) =>
    ["2026-10-12", "2026-11-03"].map((from) => [rule, from] as const),
  );

/** Daily and longer rules whose positions or count depend on times of day. */
const TIMES_OF_DAY_SWEEP = ["MONTHLY;BYDAY=MO", "WEEKLY;BYDAY=MO,TH", "DAILY"]
  .flatMap((period) =>
    ["BYHOUR=9,17", "BYMINUTE=0,30"].map((times) => `FREQ=${period};${times}`),
  )
  .flatMap((rule) =>
    [
      "BYSETPOS=1",
      "BYSETPOS=2",
      "BYSETPOS=-1",
      "BYSETPOS=-2",
      "COUNT=5",
      "BYSETPOS=2;COUNT=5",
    ].map((pick) => `${rule};${pick}`),
  )
  .flatMap((rule) => [
    `DTSTART:20261001T000000\nRRULE:${rule}`,
    `DTSTART:20261001T100000\nRRULE:${rule}`,
  ])
  .flatMap((rule) =>
    ["2026-10-01", "2026-10-16"].map((from) => [rule, from] as const),
  );

describe("nextRuleDay matches rrule across rules with times of day", () => {
  it.each(TIMES_OF_DAY_SWEEP)("%j from %s", (rule, from) => {
    expect(nextRuleDay(parse(rule), from, rule)).toBe(
      wholeRuleTruth(rule, from),
    );
  });
});

describe("nextRuleDay matches rrule across hourly and minutely rules", () => {
  it.each(SUB_DAILY_SWEEP)("%j from %s", (rule, from) => {
    expect(nextRuleDay(parse(rule), from, rule)).toBe(
      wholeRuleTruth(rule, from),
    );
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
