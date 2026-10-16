import { describe, expect, it } from "vitest";
import { readTaskBody, renderTaskBody, titleOf } from "./layout";
import { parseTasksFormatItem } from "./parser";
import { taskToMarkdown } from "./serializer";
import type { Task } from "../types";
import { toTasksRecurrenceText } from "../utils/recurrence-text";

const FRAGMENTS = [
  "Water plants",
  "#garden",
  "#a/b-c",
  "🔺",
  "⏫",
  "🔼",
  "🔽\uFE0F",
  "📅 2026-10-16",
  "📆2026-10-16",
  "🗓\uFE0F 2026-10-16",
  "📅 2026-13-45",
  "⏳ 2026-10-16",
  "🛫 2026-10-01",
  "➕ 2026-09-30",
  "✅ 2026-10-17",
  "❌ 2026-10-17",
  "🔁 every week",
  "🔁 every 2 weeks on Monday, Friday when done",
  "🔁 FREQ=DAILY",
  "🔁 every month until 2026-12-31",
  "🔁",
  "🏁 delete",
  "🆔 abc_1",
  "⛔ a1, b-2",
  "⏰ 2026-10-16 09:00",
  "⏰",
  "(note)",
  "[[Garden]]",
  "see",
  "[link](https://example.com/#x)",
  "🎉",
  "^notablock",
  "",
];

const SEPARATORS = [" ", "  ", "\t", ""];
const REPAIRED_RULES = ["🔁 FREQ=DAILY", "🔁 every month until 2026-12-31"];

/** A deterministic generator, so a failing line can be reproduced. */
function* generatedBodies(count: number): Generator<string> {
  let seed = 42;
  const next = (n: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % n;
  };
  for (let i = 0; i < count; i++) {
    const length = 1 + next(8);
    const words = Array.from(
      { length },
      () => FRAGMENTS[next(FRAGMENTS.length)],
    );
    const body = words.reduce(
      (text, word) => text + SEPARATORS[next(SEPARATORS.length)] + word,
      "",
    );
    yield next(3) === 0 ? `${body} ^blk${i}` : body;
  }
}

const parse = (body: string): Task =>
  parseTasksFormatItem({
    id: "t",
    title: body,
    status: "todo",
    priority: "medium",
    tags: [],
  });

describe("readTaskBody", () => {
  it("keeps every character of the text it reads", () => {
    const changed = [...generatedBodies(3000)].filter(
      (body) => renderTaskBody(readTaskBody(body)) !== body,
    );

    expect(changed).toEqual([]);
  });

  it("writes every generated line back unchanged", () => {
    const changed = [...generatedBodies(3000)]
      // Rules earlier versions wrote are repaired on write (see recurrence-roundtrip)
      .filter((body) => !REPAIRED_RULES.some((rule) => body.includes(rule)))
      .map((body) => `- [ ] ${body.trimStart()}`)
      .filter((line) => taskToMarkdown(parse(line.slice(6)), line) !== line);

    expect(changed).toEqual([]);
  });

  it("reads an edited generated line back as the edited task", () => {
    const meaning = (task: Task) => [
      task.title,
      task.priority,
      task.dueAt,
      task.startAt,
      task.completedAt,
      task.cancelledAt,
      task.recurringInterval,
      task.onCompletion,
      task.taskId,
      task.dependsOn?.join(","),
    ];
    const misread = [...generatedBodies(3000)]
      .map((body) => `- [ ] ${body.trimStart()}`)
      .flatMap((line) => {
        const edited: Task = {
          ...parse(line.slice(6)),
          dueAt: "2027-01-02",
          priority: "low",
          taskId: "edited",
        };
        const written = taskToMarkdown(edited, line);
        const reread = parse(written.slice(6));
        return JSON.stringify(meaning(reread)) ===
          JSON.stringify(
            meaning({
              ...edited,
              // Rules earlier versions wrote are repaired on write
              recurringInterval:
                edited.recurringInterval &&
                toTasksRecurrenceText(edited.recurringInterval),
            }),
          )
          ? []
          : [{ line, written }];
      });

    expect(misread).toEqual([]);
  });

  it("splits the description, fields, tags, notes and block id", () => {
    const layout = readTaskBody(
      "Water plants 🔁 every week when done see [[Garden]] #home 📅 2026-10-16 ^blk1",
    );

    expect(layout.description).toBe("Water plants");
    expect(
      layout.parts.map((part) =>
        part.kind === "field" ? part.field.key : `${part.kind}:${part.text}`,
      ),
    ).toEqual(["recurrence", "text:see [[Garden]]", "tag:#home", "due"]);
    expect(layout.blockLink).toBe(" ^blk1");
    expect(titleOf(layout)).toBe("Water plants #home");
  });

  it.each([
    ["Fix 🔺 bug", "Fix 🔺 bug"],
    ["Fix 🔺 bug 📅 2026-10-16", "Fix 🔺 bug"],
    ["Fix bug 🔺", "Fix bug"],
    ["Fix bug 🔺 #urgent", "Fix bug #urgent"],
    ["Fix bug 🔺 #urgent 📅 2026-10-16", "Fix bug #urgent"],
    ["Fix bug 🔺 #urgent later", "Fix bug 🔺 #urgent later"],
  ])("reads a priority emoji only next to the fields: %j", (body, title) => {
    expect(titleOf(readTaskBody(body))).toBe(title);
  });

  it("does not read an invalid date as a field", () => {
    const task = parse("Plan 📅 2026-13-45");

    expect(task.title).toBe("Plan 📅 2026-13-45");
    expect(task.dueAt).toBeUndefined();
  });

  it("reads the first of a field written twice, and keeps the other", () => {
    const line = "- [ ] Plan 📅 2026-10-16 📅 2026-10-20";
    const task = parse("Plan 📅 2026-10-16 📅 2026-10-20");

    expect(task.dueAt).toBe("2026-10-16");
    expect(taskToMarkdown({ ...task, dueAt: "2026-10-18" }, line)).toBe(
      "- [ ] Plan 📅 2026-10-18 📅 2026-10-20",
    );
    expect(taskToMarkdown({ ...task, dueAt: undefined }, line)).toBe(
      "- [ ] Plan",
    );
  });
});

describe("the end of a 🔁 rule", () => {
  it.each([
    ["every week", "every week"],
    ["every week when done see", "every week when done"],
    [
      "every 2 weeks on Monday, Friday when done notes",
      "every 2 weeks on Monday, Friday when done",
    ],
    ["every week When Done see", "every week When Done"],
    // Without "when done", the rule is every word Obsidian Tasks reads
    ["every day except Sunday", "every day except Sunday"],
    ["every year on December 25", "every year on December 25"],
  ])("reads the rule of %j as %j", (text, rule) => {
    expect(parse(`Task 🔁 ${text}`).recurringInterval).toBe(rule);
  });
});
