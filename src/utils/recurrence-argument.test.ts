import { describe, expect, it } from "vitest";
import { readRecurrenceArgument } from "./recurrence-argument";

describe("readRecurrenceArgument with rules the library can't compute", () => {
  it.each([
    ["FREQ=HOURLY;INTERVAL=5;BYHOUR=3", "BYHOUR, BYMINUTE or BYSECOND"],
    ["FREQ=HOURLY;BYMINUTE=0,30;COUNT=10", "BYMINUTE or BYSECOND within"],
  ])("rejects %j before it is stored", (value, reason) => {
    expect(readRecurrenceArgument(value, "2026-01-01")).toEqual({
      ok: false,
      error: expect.stringContaining(`isn't supported: ${reason}`),
    });
  });
});

describe("readRecurrenceArgument for hosts that store Obsidian Tasks text", () => {
  const readAsText = (value: string) =>
    readRecurrenceArgument(value, "2026-01-01", "text");

  it("stores RRULE syntax as the text the host writes", () => {
    expect(readAsText("FREQ=WEEKLY;BYDAY=MO;UNTIL=20261231")).toEqual({
      ok: true,
      rule: "every week on Monday until December 31, 2026",
      understoodAs: "every week on Monday until December 31, 2026",
    });
  });

  it.each([
    "DTSTART:20261016T000000Z\nRRULE:FREQ=WEEKLY",
    "FREQ=WEEKLY;DTSTART=20261016T000000Z",
    "DTSTART;VALUE=DATE:20261016\nRRULE:FREQ=DAILY",
  ])("rejects %j, whose start date a line can't hold", (value) => {
    expect(readAsText(value)).toEqual({
      ok: false,
      error: expect.stringContaining(
        "remove DTSTART; set the task's startAt instead",
      ),
    });
  });

  it("rejects RRULE syntax with no Obsidian Tasks text form", () => {
    expect(readAsText("FREQ=MONTHLY;BYDAY=MO;BYSETPOS=2")).toEqual({
      ok: false,
      error: expect.stringContaining(
        "this host stores tasks as Obsidian Tasks text",
      ),
    });
  });

  it("keeps such rules as RRULE syntax for other hosts", () => {
    expect(
      readRecurrenceArgument(
        "DTSTART:20261016T000000Z\nRRULE:FREQ=WEEKLY",
        "2026-01-01",
      ),
    ).toEqual({
      ok: true,
      rule: "DTSTART:20261016T000000Z\nRRULE:FREQ=WEEKLY",
    });
    expect(
      readRecurrenceArgument("FREQ=WEEKLY;BYDAY=MO", "2026-01-01", "auto"),
    ).toEqual({
      ok: true,
      rule: "FREQ=WEEKLY;BYDAY=MO",
      understoodAs: "every week on Monday",
    });
  });

  it("reads text as for other hosts", () => {
    expect(readAsText("every week on Mon when done")).toEqual({
      ok: true,
      rule: "every week on Monday when done",
      understoodAs: "every week on Monday when done",
    });
  });
});

/** The earliest end date the tool accepts in these tests. */
const NOT_BEFORE = "2026-01-01";

const read = (value: string) => readRecurrenceArgument(value, NOT_BEFORE);

describe("readRecurrenceArgument with natural wordings", () => {
  it.each([
    ["every month on the first Monday", "every month on the 1st Monday"],
    ["every month on the second Tuesday", "every month on the 2nd Tuesday"],
    ["every month on the third Friday", "every month on the 3rd Friday"],
    ["every month on the last Friday", "every month on the last Friday"],
    ["every month on the first", "every month on the 1st"],
    ["every month on the first day", "every month on the 1st"],
    ["every month on the last day", "every month on the last"],
    ["every 2 months on the last day", "every 2 months on the last"],
    ["every December on the last day", "every December on the last"],
    ["every year on the last day in December", "every December on the last"],
    ["every week on Mon", "every week on Monday"],
    ["every week on Mon, Fri", "every week on Monday, Friday"],
    ["every week on Tue, Thu", "every week on Tuesday, Thursday"],
    ["every week on Tues, Thurs", "every week on Tuesday, Thursday"],
    ["every week on Wed", "every week on Wednesday"],
    ["every week on Weds", "every week on Wednesday"],
    ["every week on Mondays", "every week on Monday"],
    ["every week on Sat, Sun", "every week on Saturday, Sunday"],
    ["every year in Dec", "every December"],
    ["every year in Jan, Sept", "every January and September"],
    ["every weekday", "every weekday"],
    ["every weekdays", "every weekday"],
    ["every week on weekdays", "every weekday"],
    ["every 2 weeks on weekdays", "every 2 weeks on weekdays"],
    ["every 1 week", "every week"],
    ["every 1 day", "every day"],
    [
      "every week on Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
      "every day",
    ],
  ])("accepts %j as %j", (value, understoodAs) => {
    expect(read(value)).toEqual({ ok: true, rule: understoodAs, understoodAs });
  });

  it.each([
    ["Every Week On Monday", "every week on Monday"],
    ["EVERY MONTH ON THE LAST", "every month on the last"],
    ["every  week   on  Monday", "every week on Monday"],
    [
      "every week until december 31, 2026",
      "every week until December 31, 2026",
    ],
    [
      "every week until DECEMBER 31, 2026",
      "every week until December 31, 2026",
    ],
    ["every week until December 31,2026", "every week until December 31, 2026"],
    [
      "every week until  December  31 ,  2026",
      "every week until December 31, 2026",
    ],
    ["every week until Dec 31, 2026", "every week until December 31, 2026"],
    // rrule reads "Sept" and a date without its comma too
    ["every week until Sept 30, 2027", "every week until September 30, 2027"],
    ["every week until sept 30 2027", "every week until September 30, 2027"],
    ["every week until December 31 2026", "every week until December 31, 2026"],
    ["every week until Dec 31 2026", "every week until December 31, 2026"],
    ["every week when  done", "every week when done"],
    ["every week When Done", "every week when done"],
    [
      "every week until december 31, 2026  when   done",
      "every week until December 31, 2026 when done",
    ],
  ])("accepts %j regardless of case and spacing as %j", (value, rule) => {
    expect(read(value)).toMatchObject({ ok: true, rule });
  });

  it.each([
    ["every 2 days on weekdays", "weekdays"],
    ["every day on the last day", "last day"],
    // rrule reads these as a day of every month, not of each year or week
    ["every year on the last day", "last day"],
    ["every year on the first day", "first day"],
    ["every 2 years on the first day", "first day"],
    ["every week on the first day", "first day"],
    ["every week on the last day", "last day"],
    ["every day on Monday", "monday"],
    ["every weekday on Saturday", "saturday"],
    ["every month on the fourth", "fourth"],
    // rrule stops reading after a plural or "Thurs"
    ["every week on Mondays, Fridays", "fridays"],
    ["every week on Thurs, Fri", "fri"],
    // rrule reads "su..." as Sunday
    ["every week in summer", "summer"],
    ["every month on the 1st and the 15th", "15th"],
    ["every week on Monday or Friday", "or"],
    ["every day at 9", "9"],
  ])("rejects %j, whose %j the parser skips", (value, skipped) => {
    expect(read(value)).toEqual({
      ok: false,
      error: expect.stringContaining(`would skip "${skipped}"`),
    });
  });

  it.each([
    ["every week until February 30, 2027", "February 30, 2027"],
    ["every week until february 29, 2027", "february 29, 2027"],
    ["every week until 2027-02-30", "2027-02-30"],
    ["every week until 2/30/2027", "2/30/2027"],
    ["every week until 2027/13/01", "2027/13/01"],
  ])("rejects %j, whose end date %j doesn't exist", (value, date) => {
    expect(read(value)).toEqual({
      ok: false,
      error: expect.stringContaining(`"${date}" is not a date`),
    });
  });

  it.each([
    "every week until Dec 31",
    "every week until December 31",
    "every week until 2026",
    "every week until Sometime 31, 2026",
  ])("rejects %j, whose end date has no full date", (value) => {
    expect(read(value)).toEqual({
      ok: false,
      error: expect.stringContaining("needs a month, day and year"),
    });
  });

  it.each([
    ["every week til December 31, 2026", "every week until December 31, 2026"],
    ["every week till December 31, 2026", "every week until December 31, 2026"],
  ])("accepts %j, as rrule reads it, as %j", (value, rule) => {
    expect(read(value)).toMatchObject({ ok: true, rule });
  });

  it("rejects an end date the parser stops before", () => {
    // rrule stops reading after "Mondays"
    expect(read("every week on Mondays until December 31, 2026")).toEqual({
      ok: false,
      error: expect.stringContaining(
        'would skip "until December 31, 2026" and read it as "every week on Monday"',
      ),
    });
  });

  it("rejects 'when done' with any spacing anywhere but the end", () => {
    expect(read("every week when  done until December 31, 2026")).toEqual({
      ok: false,
      error: expect.stringContaining('"when done" can only come at the end'),
    });
  });
});
