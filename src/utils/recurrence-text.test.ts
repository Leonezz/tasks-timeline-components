import { afterEach, describe, expect, it } from "vitest";
import { Settings } from "luxon";
import { RRule } from "rrule";
import { formatRuleEndDate, parseRecurrenceRule } from "./recurrence-rule";
import { recurrenceRuleToText, toTasksRecurrenceText } from "./recurrence-text";

describe("toTasksRecurrenceText", () => {
  it("keeps text rules unchanged", () => {
    expect(toTasksRecurrenceText("every week when done")).toBe(
      "every week when done",
    );
    expect(toTasksRecurrenceText("every fortnight")).toBe("every fortnight");
  });

  it.each([
    ["FREQ=WEEKLY;BYDAY=MO", "every week on Monday"],
    ["RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO", "every 2 weeks on Monday"],
    ["FREQ=MONTHLY;BYMONTHDAY=1", "every month on the 1st"],
    ["FREQ=DAILY", "every day"],
  ])("writes %j as %j", (rule, text) => {
    expect(toTasksRecurrenceText(rule)).toBe(text);
  });

  it.each([
    ["FREQ=WEEKLY;BYDAY=FR,MO", "every week on Monday, Friday"],
    ["FREQ=MONTHLY;BYMONTHDAY=15,1", "every month on the 1st and 15th"],
    [
      "FREQ=YEARLY;BYMONTH=12,6;BYMONTHDAY=1",
      "every June and December on the 1st",
    ],
  ])("writes days in any order: %j", (rule, text) => {
    expect(toTasksRecurrenceText(rule)).toBe(text);
  });

  it("writes weekdays of a daily rule as a weekly rule", () => {
    expect(toTasksRecurrenceText("FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR")).toBe(
      "every weekday",
    );
  });

  it("writes an end date as text that reads back to the same day", () => {
    const text = toTasksRecurrenceText("FREQ=WEEKLY;BYDAY=MO;UNTIL=20261231");

    expect(text).toBe("every week on Monday until December 31, 2026");
    expect(parseRecurrenceRule(text)?.end).toBe("2026-12-31");
  });

  it("refuses rules with a start date instead of writing two lines", () => {
    expect(() =>
      toTasksRecurrenceText("DTSTART:20260105T000000Z\nRRULE:FREQ=WEEKLY"),
    ).toThrow("can't store a start date");
  });

  it("leaves out a time of day that doesn't change the days", () => {
    expect(toTasksRecurrenceText("FREQ=DAILY;BYHOUR=9")).toBe("every day");
  });

  it.each([
    // COUNT counts each time of day
    "FREQ=DAILY;BYHOUR=9,17;COUNT=4",
    // BYSETPOS picks among the times of day
    "FREQ=MONTHLY;BYDAY=MO;BYHOUR=9,17;BYSETPOS=3",
    // BYHOUR picks which steps count
    "FREQ=HOURLY;INTERVAL=2;BYHOUR=3",
  ])("refuses %j, whose times of day change its days", (rule) => {
    expect(() => toTasksRecurrenceText(rule)).toThrow(
      "its times of day (BYHOUR, BYMINUTE, BYSECOND) change which days it has",
    );
  });

  it("refuses unreadable RRULE syntax", () => {
    expect(() => toTasksRecurrenceText("FREQ=WEEKLY;INTERVAL=0")).toThrow(
      'Cannot read the recurrence rule "FREQ=WEEKLY;INTERVAL=0"',
    );
  });
});

describe("recurrenceRuleToText", () => {
  it("keeps 'when done' after the end date", () => {
    expect(
      recurrenceRuleToText({
        source: "text",
        options: { freq: RRule.WEEKLY, interval: 1 },
        end: "2027-01-01",
        whenDone: true,
      }),
    ).toBe("every week until January 1, 2027 when done");
  });
});

describe("toTasksRecurrenceText: day sets rrule shortens", () => {
  it.each([
    ["FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU", "every day"],
    ["FREQ=DAILY;BYDAY=SU,MO,TU,WE,TH,FR,SA", "every day"],
    ["FREQ=WEEKLY;BYDAY=MO,MO,TU,WE,TH,FR", "every weekday"],
  ])("writes %j as %j", (rule, text) => {
    expect(toTasksRecurrenceText(rule)).toBe(text);
  });

  it("lists all seven days of a rule that skips weeks", () => {
    const text = toTasksRecurrenceText(
      "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TU,WE,TH,FR,SA,SU",
    );

    expect(text).toBe(
      "every 2 weeks on Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
    );
    expect(parseRecurrenceRule(text)?.options).toMatchObject({
      freq: RRule.WEEKLY,
      interval: 2,
    });
  });
});

describe("toTasksRecurrenceText: parts text can't hold", () => {
  it.each(["FREQ=WEEKLY;INTERVAL=2;WKST=SU", "FREQ=YEARLY;BYEASTER=0"])(
    "refuses %j instead of dropping a part",
    (rule) => {
      expect(() => toTasksRecurrenceText(rule)).toThrow();
    },
  );

  it("keeps COUNT, which text can hold", () => {
    const text = toTasksRecurrenceText("FREQ=WEEKLY;COUNT=3");

    expect(text).toBe("every week for 3 times");
    expect(parseRecurrenceRule(text)?.options.count).toBe(3);
  });
});

describe("formatRuleEndDate", () => {
  const defaultLocale = Settings.defaultLocale;
  afterEach(() => {
    Settings.defaultLocale = defaultLocale;
  });

  it("writes English month names whatever the default locale", () => {
    Settings.defaultLocale = "de-DE";

    expect(formatRuleEndDate("2026-12-31")).toBe("December 31, 2026");
  });
});

describe("toTasksRecurrenceText: yearly rules that skip years", () => {
  it.each([
    [
      "FREQ=YEARLY;INTERVAL=2;BYMONTH=12,6",
      "every 2 years in June and December",
    ],
    [
      "FREQ=YEARLY;INTERVAL=2;BYMONTH=6;BYMONTHDAY=15,1",
      "every 2 years on the 1st and 15th in June",
    ],
    [
      "FREQ=YEARLY;INTERVAL=3;BYMONTH=2;BYMONTHDAY=29",
      "every 3 years on the 29th in February",
    ],
  ])("writes %j as %j, which reads back the same", (rule, text) => {
    const written = toTasksRecurrenceText(rule);

    expect(written).toBe(text);
    expect(parseRecurrenceRule(written)?.options).toMatchObject({
      freq: RRule.YEARLY,
      interval: parseRecurrenceRule(rule)?.options.interval,
    });
  });
});
