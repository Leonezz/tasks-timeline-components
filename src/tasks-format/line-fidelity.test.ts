/**
 * Round trips of real Obsidian Tasks lines through parseTasksFormatItem and
 * taskToMarkdown: an unchanged task is written back byte for byte, and an
 * edit changes only the part of the line it touches.
 */
import { describe, expect, it } from "vitest";
import type { Task } from "../types";
import { parseTasksFormatItem } from "./parser";
import { taskToMarkdown } from "./serializer";
import { TaskRegularExpressions } from "./regex";
import { getTaskStatusFromMarker } from "./symbols";
import { withStatusDates } from "../utils/task";

/** The task a host reads from a line: the text after the checkbox, and its status. */
const parseLine = (line: string): Task => {
  const match = line.match(TaskRegularExpressions.taskRegex);
  if (!match) {
    throw new Error(`not a task line: ${line}`);
  }
  return parseTasksFormatItem({
    id: "note.md:0:0",
    title: match[4],
    status: getTaskStatusFromMarker(match[3]),
    priority: "medium",
    tags: [],
    category: "note.md",
  });
};

const rewrite = (line: string, edit: Partial<Task> = {}): string =>
  taskToMarkdown({ ...parseLine(line), ...edit }, line);

/**
 * What the Obsidian plugin does after parsing: hashtags move from the title
 * into `tags` (its tagsParser).
 */
const asPluginTask = (line: string): Task => {
  const task = parseLine(line);
  const tags = task.title.match(TaskRegularExpressions.hashTags) ?? [];
  return {
    ...task,
    title: tags
      .reduce((title, tag) => title.replace(tag, ""), task.title)
      .trim(),
    tags: tags.map((tag) => ({ id: tag.trim(), name: tag.trim() })),
  };
};

/** What a line means, to compare a rewritten line with the original. */
const meaning = (task: Task) => ({
  title: task.title,
  priority: task.priority,
  dueAt: task.dueAt,
  startAt: task.startAt,
  createdAt: task.createdAt,
  completedAt: task.completedAt,
  cancelledAt: task.cancelledAt,
  scheduledAt: task.extra?.scheduledAt,
  rule: task.recurringInterval,
  onCompletion: task.onCompletion,
  taskId: task.taskId,
  dependsOn: task.dependsOn,
});

describe("block ids (#42)", () => {
  it.each([
    ["- [ ] Water plants 📅 2026-10-16 ^blk1", "Water plants"],
    ["- [ ] Water plants 🔁 every week ^blk1", "Water plants"],
    ["- [ ] Water plants ^blk1", "Water plants"],
    ["- [ ] Water plants #garden ^blk1", "Water plants #garden"],
  ])("keeps the block id of %j out of the title", (line, title) => {
    expect(parseLine(line).title).toBe(title);
  });

  it.each([
    "- [ ] Water plants 📅 2026-10-16 ^blk1",
    "- [ ] Water plants 🔁 every week ^blk1",
  ])("writes %j back unchanged", (line) => {
    expect(rewrite(line)).toBe(line);
  });

  it("writes the block id once, at the end, when the task changes", () => {
    expect(
      rewrite("- [ ] Water plants 📅 2026-10-16 ^blk1", {
        status: "done",
        completedAt: "2026-10-17",
        priority: "high",
      }),
    ).toBe("- [x] Water plants 📅 2026-10-16 ⏫ ✅ 2026-10-17 ^blk1");
  });

  it("keeps the block id when the title changes", () => {
    expect(
      rewrite("- [ ] Water plants 🔁 every week ^blk1", {
        title: "Water the plants",
      }),
    ).toBe("- [ ] Water the plants 🔁 every week ^blk1");
  });

  it("only reads a block id at the end of the line", () => {
    const task = parseLine("- [ ] See ^notes for details 📅 2026-10-16");

    expect(task.title).toBe("See ^notes for details");
    expect(task.dueAt).toBe("2026-10-16");
  });
});

describe("Obsidian Tasks fields and notes after 🔁 (#43)", () => {
  it.each([
    [
      "- [ ] Water plants 🔁 every week 🏁 delete 📅 2026-10-16",
      { title: "Water plants", rule: "every week", onCompletion: "delete" },
    ],
    [
      "- [ ] Water plants 🔁 every day ⏰ 2026-10-16 09:00",
      { title: "Water plants", rule: "every day" },
    ],
    [
      "- [ ] Water plants 🔁 every week when done see [[Garden]]",
      { title: "Water plants", rule: "every week when done" },
    ],
  ])("reads %j", (line, expected) => {
    const task = parseLine(line);

    expect({ title: task.title, rule: task.recurringInterval }).toEqual({
      title: expected.title,
      rule: expected.rule,
    });
    if ("onCompletion" in expected) {
      expect(task.onCompletion).toBe(expected.onCompletion);
    }
  });

  it("reads ❌, 🆔 and ⛔ as fields", () => {
    const task = parseLine(
      "- [-] Review draft 🆔 rev1 ⛔ draft1, outline2 ❌ 2026-10-15",
    );

    expect(task).toMatchObject({
      title: "Review draft",
      taskId: "rev1",
      dependsOn: ["draft1", "outline2"],
      cancelledAt: "2026-10-15",
    });
  });

  it.each([
    "- [ ] Water plants 🔁 every week 🏁 delete 📅 2026-10-16",
    "- [ ] Water plants 🔁 every day ⏰ 2026-10-16 09:00",
    "- [ ] Water plants 🔁 every week when done see [[Garden]]",
  ])("writes %j back unchanged", (line) => {
    expect(rewrite(line)).toBe(line);
  });

  it("changes a field in place and leaves the notes after it", () => {
    expect(
      rewrite(
        "- [ ] Water plants 🔁 every day ⏰ 2026-10-16 09:00 📅 2026-10-16 ^blk1",
        { dueAt: "2026-10-17" },
      ),
    ).toBe(
      "- [ ] Water plants 🔁 every day ⏰ 2026-10-16 09:00 📅 2026-10-17 ^blk1",
    );
  });

  it("adds a new field after the last field, before trailing notes", () => {
    expect(
      rewrite("- [ ] Water plants 🔁 every week when done see [[Garden]]", {
        dueAt: "2026-10-17",
      }),
    ).toBe(
      "- [ ] Water plants 🔁 every week when done 📅 2026-10-17 see [[Garden]]",
    );
  });

  it("changes the rule in place", () => {
    expect(
      rewrite("- [ ] Water plants 🔁 every week 🏁 delete 📅 2026-10-16", {
        recurringInterval: "every 2 weeks",
      }),
    ).toBe("- [ ] Water plants 🔁 every 2 weeks 🏁 delete 📅 2026-10-16");
  });

  it("removes a field with the space before it", () => {
    expect(
      rewrite("- [ ] Water plants 🔁 every week 🏁 delete 📅 2026-10-16", {
        recurringInterval: undefined,
        isRecurring: false,
      }),
    ).toBe("- [ ] Water plants 🏁 delete 📅 2026-10-16");
  });

  it("writes edited 🏁, ❌, 🆔 and ⛔ in place", () => {
    expect(
      rewrite(
        "- [ ] Review draft 🆔 rev1 ⛔ draft1, outline2 🏁 keep 📅 2026-10-16",
        {
          taskId: "rev2",
          dependsOn: ["draft1"],
          onCompletion: "delete",
        },
      ),
    ).toBe("- [ ] Review draft 🆔 rev2 ⛔ draft1 🏁 delete 📅 2026-10-16");
  });

  it("removes 🏁, 🆔 and ⛔ the task no longer has", () => {
    expect(
      rewrite("- [ ] Review draft 🆔 rev1 ⛔ draft1 🏁 keep 📅 2026-10-16 ^b", {
        taskId: undefined,
        dependsOn: [],
        onCompletion: undefined,
      }),
    ).toBe("- [ ] Review draft 📅 2026-10-16 ^b");
  });

  it("writes a cancelled date when a task is cancelled", () => {
    expect(
      rewrite("- [ ] Old idea 📅 2026-10-16", {
        status: "cancelled",
        cancelledAt: "2026-10-17T09:30:00.000+08:00",
      }),
    ).toBe("- [-] Old idea 📅 2026-10-16 ❌ 2026-10-17");
  });

  it.each([
    ["- [-] Old idea 📅 2026-10-16 ❌ 2026-10-17", "todo"],
    ["- [x] Old idea 📅 2026-10-16 ✅ 2026-10-17", "todo"],
    ["- [x] Old idea 📅 2026-10-16 ✅ 2026-10-17", "doing"],
  ] as const)("removes the stale date when %j is set to %s", (line, status) => {
    const task = parseLine(line);

    expect(
      taskToMarkdown(withStatusDates(task, { ...task, status }), line),
    ).toBe(`- [${status === "todo" ? " " : "/"}] Old idea 📅 2026-10-16`);
  });

  it("swaps ✅ for ❌ when a done task is cancelled", () => {
    const line = "- [x] Old idea 📅 2026-10-16 ✅ 2026-10-17";
    const task = parseLine(line);

    expect(
      taskToMarkdown(
        withStatusDates(task, {
          ...task,
          status: "cancelled",
          cancelledAt: "2026-10-18",
        }),
        line,
      ),
    ).toBe("- [-] Old idea 📅 2026-10-16 ❌ 2026-10-18");
  });
});

describe("a 🔁 rule the rule characters stop inside a word", () => {
  it.each([
    [
      "- [ ] Pay bill 🔁 every month https://billing.example.com",
      "every month",
      "https://billing.example.com",
    ],
    ["- [ ] Standup 🔁 every day at 9:30", "every day at", "9:30"],
    [
      "- [ ] Water plants 🔁 every week don't forget",
      "every week",
      "don't forget",
    ],
    ["- [ ] Call 🔁 every week Müller", "every week", "Müller"],
  ])("reads %j with the rule %j and the word whole", (line, rule, notes) => {
    const task = parseLine(line);

    expect(task.recurringInterval).toBe(rule);
    expect(task.extra?.lineNotes).toBe(notes);
    expect(rewrite(line)).toBe(line);
  });

  it.each([
    ["- [ ] Water plants 🔁 every week.", "every week", "."],
    ["- [ ] Water plants 🔁 every week[[Garden]]", "every week", "[[Garden]]"],
    ["- [ ] 浇水 🔁 every week记得", "every week", "记得"],
  ])(
    "keeps the rule of %j whole when the text after it starts a word",
    (line, rule, notes) => {
      const task = parseLine(line);

      expect(task.recurringInterval).toBe(rule);
      expect(task.extra?.lineNotes).toBe(notes);
    },
  );

  it("does not read a 🔁 followed by only part of a word as a rule", () => {
    const task = parseLine("- [ ] See 🔁 https://example.com 📅 2026-10-16");

    expect(task.recurringInterval).toBeUndefined();
    expect(task.title).toBe("See 🔁 https://example.com");
  });

  it.each([
    [
      "- [ ] Pay bill 🔁 every month https://billing.example.com",
      "- [x] Pay bill 🔁 every month ✅ 2026-10-18 https://billing.example.com",
    ],
    [
      "- [ ] Standup 🔁 every day at 9:30",
      "- [x] Standup 🔁 every day at ✅ 2026-10-18 9:30",
    ],
    [
      "- [ ] Water plants 🔁 every week don't forget",
      "- [x] Water plants 🔁 every week ✅ 2026-10-18 don't forget",
    ],
    [
      "- [ ] Water plants 🔁 every week.",
      "- [x] Water plants ✅ 2026-10-18 🔁 every week.",
    ],
  ])(
    "completes %j without splitting a word, and reopens it as it was",
    (line, completed) => {
      const done = rewrite(line, {
        status: "done",
        completedAt: "2026-10-18",
      });

      expect(done).toBe(completed);
      expect(rewrite(done, { status: "todo", completedAt: undefined })).toBe(
        line,
      );
    },
  );

  it("changes the rule in place and keeps the word after it", () => {
    expect(
      rewrite("- [ ] Pay bill 🔁 every month https://billing.example.com", {
        recurringInterval: "every 2 months",
      }),
    ).toBe("- [ ] Pay bill 🔁 every 2 months https://billing.example.com");
    expect(
      rewrite("- [ ] Water plants 🔁 every week don't forget", {
        recurringInterval: "every 2 weeks",
      }),
    ).toBe("- [ ] Water plants 🔁 every 2 weeks don't forget");
  });
});

/** Real Obsidian Tasks lines, written back as they are when nothing changed. */
const REAL_LINES = [
  "- [ ] Plain task",
  "- [ ] Water plants 📅 2026-10-16 ^blk1",
  "- [ ] Water plants 🔁 every week ^blk1",
  "- [ ] Water plants 🔁 every week 🏁 delete 📅 2026-10-16",
  "- [ ] Water plants 🔁 every day ⏰ 2026-10-16 09:00",
  "- [ ] Water plants 🔁 every week when done see [[Garden]]",
  "- [x] Pay rent 🔁 every month on the 1st 📅 2026-10-01 ✅ 2026-10-01",
  "- [-] Old idea ❌ 2026-09-30",
  "- [ ] Draft report 🆔 abc123 ⏫ 📅 2026-10-20",
  "- [ ] Review report ⛔ abc123,def456 🔽",
  "- [ ] Review report ⛔ abc123, def456 📅 2026-10-21",
  "- [ ] Task 🔁 every week on Monday when done 🏁 delete 🆔 t1 ⛔ t0 📅 2026-10-16 ^b-1",
  "- [ ] Task 🏁 keep 🔁 every week 📅 2026-10-16",
  "- [ ] Task 🔺 🛫 2026-10-01 ⏳ 2026-10-05 📅 2026-10-10 ➕ 2026-09-30",
  "- [ ] Task ➕ 2026-09-30 📅 2026-10-10 ⏳ 2026-10-05 🛫 2026-10-01 🔼",
  "- [ ] Task ⏬ 📅 2026-10-10",
  "- [ ] Task with tags #work #urgent 📅 2026-10-16",
  "- [ ] #garden Water plants 📅 2026-10-16 #home",
  "- [ ] Water plants 📅 2026-10-16 #garden #home ^plants",
  "- [ ] Fix 🔺 bug in parser 📅 2026-10-16",
  "- [ ] Task with emoji 🎉 in the title 📅 2026-10-16",
  "- [ ] Call [[Bob]] about [the plan](https://example.com) 📅 2026-10-16",
  "- [ ] Task 📅 2026-10-16 (call the landlord first)",
  "- [ ] Task ⏰ 2026-10-16 09:00 📅 2026-10-16",
  "- [ ] Task with [due:: 2026-10-16] dataview field",
  "- [ ] 📅 2026-10-16",
  "- [ ] Task 📅2026-10-16",
  "- [ ] Task 📆 2026-10-16",
  "- [ ] Task 🗓\uFE0F 2026-10-16",
  "- [ ] Task ⌛ 2026-10-16",
  "- [ ] Task 📅\uFE0F 2026-10-16 🔁\uFE0F every day",
  "- [ ] Task  with  double  spaces  📅 2026-10-16",
  "- [ ] Task 📅 2026-10-16   ",
  "- [ ] Task 📅 2026-10-16 ✅ 2026-10-16 #done-tag ^id-with-dash",
  "- [/] In progress 🛫 2026-10-01",
  "- [x] Done task ✅ 2026-10-01",
  "  - [ ] Indented subtask 📅 2026-10-16",
  "\t- [ ] Tab-indented subtask 🔁 every day",
  "> - [ ] Task in a callout 📅 2026-10-16 ^callout1",
  "> > - [ ] Task in a nested callout 🔁 every 2 weeks on Monday, Friday 📅 2026-10-16",
  "1. [ ] Numbered task ⏫ 📅 2026-10-16",
  "* [ ] Star task 📅 2026-10-16",
  "-  [ ]  Extra spaces around the checkbox 📅 2026-10-16",
  "- [ ] Pay rent 🔁 every month until December 31, 2026 📅 2026-10-01",
  "- [ ] Pay rent 🔁 every week 🔺",
  "- [ ] Pay bill 🔁 every month https://billing.example.com",
  "- [ ] Standup 🔁 every day at 9:30",
  "- [ ] Water plants 🔁 every week don't forget",
  "- [ ] Call Bob 📅 2026-10-16, then lunch",
];

describe("an unchanged line round-trips byte for byte", () => {
  it.each(REAL_LINES)("%j", (line) => {
    expect(rewrite(line)).toBe(line);
  });

  it.each(REAL_LINES)(
    "%j, with the tags the Obsidian plugin moves out",
    (line) => {
      expect(taskToMarkdown(asPluginTask(line), line)).toBe(line);
    },
  );

  it.each(REAL_LINES)("%j means the same when read again", (line) => {
    const task = parseLine(line);
    const edited = rewrite(line, { dueAt: "2027-01-02" });

    expect(meaning(parseLine(edited))).toEqual(
      meaning({ ...task, dueAt: "2027-01-02" }),
    );
  });
});

describe("edits touch only their part of the line", () => {
  it("keeps tags where they are when the plugin changes a date", () => {
    const line = "- [ ] #garden Water plants 📅 2026-10-16 #home ^blk1";

    expect(
      taskToMarkdown({ ...asPluginTask(line), dueAt: "2026-10-17" }, line),
    ).toBe("- [ ] #garden Water plants 📅 2026-10-17 #home ^blk1");
  });

  it("removes a trailing tag the plugin dropped", () => {
    const line = "- [ ] Water plants 📅 2026-10-16 #home ^blk1";
    const task = asPluginTask(line);

    expect(taskToMarkdown({ ...task, tags: [] }, line)).toBe(
      "- [ ] Water plants 📅 2026-10-16 ^blk1",
    );
  });

  it("adds a tag the plugin added to the title part", () => {
    const line = "- [ ] Water plants 📅 2026-10-16 #home";
    const task = asPluginTask(line);

    expect(
      taskToMarkdown(
        { ...task, tags: [...task.tags, { id: "#urgent", name: "#urgent" }] },
        line,
      ),
    ).toBe("- [ ] Water plants #urgent 📅 2026-10-16 #home");
  });

  it("keeps trailing tags out of a new title", () => {
    expect(
      rewrite("- [ ] Pay rent 🔁 every week #home 📅 2026-10-01", {
        title: "Pay the rent #home",
      }),
    ).toBe("- [ ] Pay the rent 🔁 every week #home 📅 2026-10-01");
  });

  it("keeps the symbol a date was written with", () => {
    expect(
      rewrite("- [ ] Task 🗓\uFE0F 2026-10-16 ^b", { dueAt: "2026-10-18" }),
    ).toBe("- [ ] Task 🗓\uFE0F 2026-10-18 ^b");
  });

  it("keeps 🔼 for a task that is still medium, and replaces it otherwise", () => {
    const line = "- [ ] Task 🔼 📅 2026-10-16";

    expect(rewrite(line, { priority: "medium" })).toBe(line);
    expect(rewrite(line, { priority: "low" })).toBe(
      "- [ ] Task 🔽 📅 2026-10-16",
    );
  });

  it("removes the priority of a task set to medium", () => {
    expect(rewrite("- [ ] Task ⏫ 📅 2026-10-16", { priority: "medium" })).toBe(
      "- [ ] Task 📅 2026-10-16",
    );
  });

  it("keeps 🔺 for a task that is still high", () => {
    const line = "- [ ] Task 🔺 📅 2026-10-16";

    expect(rewrite(line, { priority: "high" })).toBe(line);
  });

  it("keeps the indentation and callout prefix when the status changes", () => {
    expect(
      rewrite("> - [ ] Task in a callout 📅 2026-10-16 ^callout1", {
        status: "done",
      }),
    ).toBe("> - [x] Task in a callout 📅 2026-10-16 ^callout1");
  });

  it("keeps the line's own spacing when the title changes", () => {
    expect(
      rewrite("- [ ] Task 📅 2026-10-16   ", { title: "Renamed task" }),
    ).toBe("- [ ] Renamed task 📅 2026-10-16   ");
  });

  it("gives a title to a line that had none", () => {
    expect(rewrite("- [ ] 📅 2026-10-16", { title: "Named" })).toBe(
      "- [ ] Named 📅 2026-10-16",
    );
  });
});
