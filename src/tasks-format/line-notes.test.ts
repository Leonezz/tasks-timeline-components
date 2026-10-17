/**
 * Task lines with text next to their fields: notes, links and ⏰ reminders
 * after the fields, free words after 🏁 / 🆔 / ⛔, and fields before the
 * title. What taskToMarkdown writes reads back as the task it was given, and
 * the text is kept.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Task } from "../types";
import type { CapabilityContext } from "../capabilities/types";
import { createCompleteTaskTool } from "../capabilities/tools/complete-task";
import { parseTasksFormatItem } from "./parser";
import { taskToMarkdown } from "./serializer";
import { TaskRegularExpressions } from "./regex";
import { getTaskStatusFromMarker } from "./symbols";

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
 * What the Obsidian plugin does after parsing: its remainderParser takes a ⏰
 * reminder out of the title, and its tagsParser moves hashtags into `tags`.
 */
const asPluginTask = (line: string): Task => {
  const task = parseLine(line);
  const reminder = task.title.match(TaskRegularExpressions.remainderRegex);
  const title = reminder
    ? task.title.replace(reminder[0], "").trim()
    : task.title;
  const tags = title.match(TaskRegularExpressions.hashTags) ?? [];
  return {
    ...task,
    title: tags.reduce((text, tag) => text.replace(tag, ""), title).trim(),
    tags: tags.map((tag) => ({ id: tag.trim(), name: tag.trim() })),
  };
};

/** What a line means, to compare a rewritten line with the task written. */
const meaning = (task: Task) => ({
  title: task.title,
  priority: task.priority,
  dueAt: task.dueAt,
  startAt: task.startAt,
  rule: task.recurringInterval,
  onCompletion: task.onCompletion,
  taskId: task.taskId,
  dependsOn: task.dependsOn,
  notes: task.extra?.lineNotes,
});

describe("an edit next to notes reads back as the edit", () => {
  it.each([
    [
      "- [ ] Water plants 🔁 every week when done see [[Garden]]",
      { priority: "high" },
      "- [ ] Water plants ⏫ 🔁 every week when done see [[Garden]]",
    ],
    [
      "- [ ] Task 📅 2026-10-16 (call the landlord first)",
      { priority: "high" },
      "- [ ] Task ⏫ 📅 2026-10-16 (call the landlord first)",
    ],
    [
      "- [ ] Call Bob 📅 2026-10-16 about the plan",
      { priority: "low" },
      "- [ ] Call Bob 🔽 📅 2026-10-16 about the plan",
    ],
    [
      "- [ ] Call Bob 📅 2026-10-16 about the plan ^blk",
      { priority: "high" },
      "- [ ] Call Bob ⏫ 📅 2026-10-16 about the plan ^blk",
    ],
    [
      "- [ ] Task 📅 2026-10-16 ⏰ 2026-10-16 09:00",
      { priority: "high" },
      "- [ ] Task 📅 2026-10-16 ⏫ ⏰ 2026-10-16 09:00",
    ],
  ] as const)("%j with %j", (line, edit, written) => {
    expect(rewrite(line, edit)).toBe(written);
    expect(parseLine(written).priority).toBe(edit.priority);
  });

  const NOTE_LINES = [
    "- [ ] Water plants 🔁 every week when done see [[Garden]]",
    "- [ ] Task 📅 2026-10-16 (call the landlord first)",
    "- [ ] Call Bob 📅 2026-10-16 about the plan",
    "- [ ] Call Bob 📅 2026-10-16 about the plan ^blk",
    "- [ ] Review draft 🔁 every week 📅 2026-10-16 see [[Draft notes]]",
    "- [ ] Call Bob 📅 2026-10-16 #work about the plan",
    "- [ ] Call Bob 🛫 2026-10-01 notes 📅 2026-10-16 more notes",
    "- [ ] Call mom 📅 2026-10-16 ⏰ 2026-10-16 09:00 about birthday",
    "- [ ] Water plants 📅 2026-10-10 🔁 every week when done—check soil",
    "- [ ] Water plants 🔁 every week—see notes",
  ];
  const EDITS: Partial<Task>[] = [
    { priority: "high" },
    { priority: "low" },
    { recurringInterval: "every 2 weeks when done", isRecurring: true },
    { onCompletion: "delete" },
    { taskId: "t9" },
    { dependsOn: ["t1", "t2"] },
    { startAt: "2026-10-02" },
    {
      priority: "high",
      recurringInterval: "every day when done",
      onCompletion: "keep",
      taskId: "t9",
      dependsOn: ["t1"],
    },
  ];

  it.each(NOTE_LINES.flatMap((line) => EDITS.map((edit) => [line, edit])))(
    "%j with %j keeps the title and notes",
    (line, edit) => {
      const task = { ...parseLine(line as string), ...(edit as Partial<Task>) };

      expect(meaning(parseLine(taskToMarkdown(task, line as string)))).toEqual(
        meaning(task),
      );
    },
  );

  /** Lines with text right after a field, and that text as it must stay. */
  const GLUED_LINES = [
    [
      "- [ ] Pay bill 🔁 every month https://billing.example.com",
      "https://billing.example.com",
    ],
    ["- [ ] Standup 🔁 every day at 9:30", "9:30"],
    ["- [ ] Water plants 🔁 every week don't forget", "don't forget"],
    ["- [ ] Call Bob 📅 2026-10-16, then lunch", "2026-10-16, then lunch"],
  ];

  it.each(
    GLUED_LINES.flatMap(([line, text]) =>
      [
        ...EDITS,
        { status: "done", completedAt: "2026-10-18" } as Partial<Task>,
      ].map((edit) => [line, edit, text]),
    ),
  )("%j with %j keeps %j whole", (line, edit, text) => {
    const task = { ...parseLine(line as string), ...(edit as Partial<Task>) };
    const written = taskToMarkdown(task, line as string);

    expect(written).toContain(text as string);
    expect(meaning(parseLine(written))).toEqual(meaning(task));
  });
});

describe("a 🔁 rule never takes in the notes after it", () => {
  it("adds a rule before a field when notes follow the last one", () => {
    const written = rewrite("- [ ] Call Bob 📅 2026-10-16 about the plan", {
      recurringInterval: "every week",
      isRecurring: true,
    });

    expect(written).toBe(
      "- [ ] Call Bob 🔁 every week 📅 2026-10-16 about the plan",
    );
    expect(parseLine(written).recurringInterval).toBe("every week");
    // A later rule change keeps the notes
    expect(rewrite(written, { recurringInterval: "every 2 weeks" })).toBe(
      "- [ ] Call Bob 🔁 every 2 weeks 📅 2026-10-16 about the plan",
    );
  });

  it("keeps a removed field's neighbour rule apart from the notes", () => {
    expect(
      rewrite(
        "- [ ] Water plants 🔁 every week 📅 2026-10-16 🛫 2026-10-01 see notes",
        { dueAt: undefined },
      ),
    ).toBe("- [ ] Water plants 🔁 every week 🛫 2026-10-01 see notes");
  });

  it.each([
    [
      "- [ ] Water plants 🔁 every week when done see [[Garden]]",
      { recurringInterval: "every 2 weeks" },
      "- [ ] Water plants see [[Garden]] 🔁 every 2 weeks",
      "every 2 weeks",
    ],
    [
      "- [ ] Water plants 🔁 every week 📅 2026-10-16 see notes",
      { dueAt: undefined },
      "- [ ] Water plants see notes 🔁 every week",
      "every week",
    ],
  ] as const)(
    "moves the rule to the end when no field can stand between it and the notes: %j with %j",
    (line, edit, written, rule) => {
      expect(rewrite(line, edit)).toBe(written);
      expect(parseLine(written).recurringInterval).toBe(rule);
    },
  );

  it("reads 🏁 followed by notes as notes, so the rule stays whole", () => {
    const line = "- [ ] Pay rent 🔁 every month 🏁 keep extra";
    const task = parseLine(line);

    expect(task).toMatchObject({
      title: "Pay rent",
      recurringInterval: "every month",
      onCompletion: undefined,
    });
    expect(rewrite(line, { onCompletion: undefined })).toBe(line);
  });
});

describe("🏁, 🆔 and ⛔ inside the title stay title text", () => {
  it.each([
    ["- [ ] ⛔ Don't touch prod 📅 2026-10-16", "⛔ Don't touch prod"],
    [
      "- [ ] Fix ⛔ blocker in parser 📅 2026-10-16",
      "Fix ⛔ blocker in parser",
    ],
    [
      "- [ ] 🏁 Finish marathon training 📅 2026-10-16",
      "🏁 Finish marathon training",
    ],
    ["- [ ] Get new 🆔 card at DMV 📅 2026-10-16", "Get new 🆔 card at DMV"],
  ])("%j", (line, title) => {
    const task = parseLine(line);

    expect(task).toMatchObject({
      title,
      dueAt: "2026-10-16",
      onCompletion: undefined,
      taskId: undefined,
      dependsOn: undefined,
    });
    expect(rewrite(line)).toBe(line);
    expect(rewrite(line, { dueAt: "2026-10-18" })).toBe(
      line.replace("2026-10-16", "2026-10-18"),
    );
  });

  it.each([
    ["- [ ] Review 🆔 rev1 ⛔ a1 🏁 keep", "Review"],
    ["- [ ] Review 🆔 rev1 ⛔ a1 🏁 keep #work ^b1", "Review #work"],
    ["- [ ] Review 🆔 rev1 ⛔ a1 🏁 keep ⏰ 2026-10-16 09:00", "Review"],
  ])("still reads them next to the other fields: %j", (line, title) => {
    expect(parseLine(line)).toMatchObject({
      title,
      taskId: "rev1",
      dependsOn: ["a1"],
      onCompletion: "keep",
    });
  });
});

describe("a line that starts with a field or ⏰ reminder", () => {
  it.each([
    ["- [ ] 📅 2026-10-16 Water plants", "Water plants"],
    [
      "- [ ] 📅 2026-10-16 🛫 2026-10-01 Water plants #home",
      "Water plants #home",
    ],
    ["- [ ] #home 📅 2026-10-16 Water plants", "#home Water plants"],
    ["- [ ] ⏰ 2026-10-16 09:00 Call mom", "Call mom"],
    [
      "- [ ] Call mom ⏰ 2026-10-16 09:00 about birthday 📅 2026-10-16",
      "Call mom about birthday",
    ],
  ])("reads the title of %j as %j", (line, title) => {
    expect(parseLine(line).title).toBe(title);
    expect(rewrite(line)).toBe(line);
    expect(taskToMarkdown(asPluginTask(line), line)).toBe(line);
  });

  it("edits the fields before the title in place", () => {
    const line = "- [ ] 📅 2026-10-16 Water plants";

    expect(parseLine(line).dueAt).toBe("2026-10-16");
    expect(rewrite(line, { dueAt: "2026-10-18", priority: "high" })).toBe(
      "- [ ] 📅 2026-10-18 Water plants ⏫",
    );
  });

  it("keeps the whitespace around a field edited in place", () => {
    expect(rewrite("- [ ] Task 📅2026-10-16⏫", { dueAt: "2026-10-17" })).toBe(
      "- [ ] Task 📅2026-10-17⏫",
    );
    expect(
      rewrite("- [ ] \t📅 2026-10-16 Water plants", { dueAt: "2026-10-17" }),
    ).toBe("- [ ] \t📅 2026-10-17 Water plants");
  });

  it("writes a new title where the old one was", () => {
    expect(
      rewrite("- [ ] 📅 2026-10-16 Water plants", {
        title: "Water the plants",
      }),
    ).toBe("- [ ] 📅 2026-10-16 Water the plants");
    expect(
      rewrite("- [ ] 📅 2026-10-16 Water plants", { title: "Water plants" }),
    ).toBe("- [ ] 📅 2026-10-16 Water plants");
  });

  it("keeps a ⏰ reminder when the title around it changes", () => {
    const line =
      "- [ ] Call mom ⏰ 2026-10-16 09:00 about birthday 📅 2026-10-16";

    expect(rewrite(line, { dueAt: "2026-10-17" })).toBe(
      "- [ ] Call mom ⏰ 2026-10-16 09:00 about birthday 📅 2026-10-17",
    );
    expect(rewrite(line, { title: "Call mom about her birthday" })).toBe(
      "- [ ] Call mom about her birthday ⏰ 2026-10-16 09:00 📅 2026-10-16",
    );
  });
});

describe("tags followed by punctuation, with the Obsidian plugin", () => {
  it.each([
    "- [ ] Email #work, then lunch 📅 2026-10-16 ^b1",
    "- [ ] Buy milk for #home. 📅 2026-10-16",
  ])("keeps %j as written when only a date changes", (line) => {
    expect(taskToMarkdown(asPluginTask(line), line)).toBe(line);
    expect(
      taskToMarkdown(
        { ...asPluginTask(line), status: "done", completedAt: "2026-10-17" },
        line,
      ),
    ).toBe(
      line
        .replace("[ ]", "[x]")
        .replace("📅 2026-10-16", "📅 2026-10-16 ✅ 2026-10-17"),
    );
  });
});

describe("a title the line can't hold", () => {
  it("throws instead of writing a title that reads back as a field", () => {
    expect(() =>
      rewrite("- [ ] Task 📅 2026-10-16", { title: "Fix bug 🔺" }),
    ).toThrow(/priority/);
  });
});

describe("the next occurrence complete_task adds", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 17, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Completes the task on `line` as the Obsidian plugin stores it. */
  const complete = async (line: string) => {
    const written: { updated?: string; added?: string } = {};
    const ctx: CapabilityContext = {
      getTasks: vi.fn().mockResolvedValue([]),
      getTask: vi.fn().mockResolvedValue(asPluginTask(line)),
      updateTask: vi.fn(async (task: Task) => {
        written.updated = taskToMarkdown(task, line);
      }),
      addTask: vi.fn(async (task: Task) => {
        written.added = taskToMarkdown(task, `- [ ] ${task.title}`);
        return task;
      }),
      deleteTask: vi.fn(),
    };
    const { result } = await createCompleteTaskTool(ctx).execute({
      id: "note.md:0:0",
    });
    expect(result).toMatchObject({
      success: true,
      createdNextOccurrence: true,
    });
    return written;
  };

  it.each([
    [
      "- [ ] Review draft 🔁 every week 📅 2026-10-16 see [[Draft notes]]",
      "- [x] Review draft 🔁 every week 📅 2026-10-16 ✅ 2026-10-17 see [[Draft notes]]",
      "- [ ] Review draft 🔁 every week 📅 2026-10-23 ➕ 2026-10-17 see [[Draft notes]]",
    ],
    [
      "- [ ] Call Bob 🔁 every week 📅 2026-10-16 about the plan",
      "- [x] Call Bob 🔁 every week 📅 2026-10-16 ✅ 2026-10-17 about the plan",
      "- [ ] Call Bob 🔁 every week 📅 2026-10-23 ➕ 2026-10-17 about the plan",
    ],
    // A "when done" rule with text glued to it advances from the completion
    [
      "- [ ] Water plants 📅 2026-10-10 🔁 every week when done—check soil",
      "- [x] Water plants 📅 2026-10-10 ✅ 2026-10-17 🔁 every week when done—check soil",
      "- [ ] Water plants 📅 2026-10-24 ➕ 2026-10-17 🔁 every week when done —check soil",
    ],
    // A word right after the rule stays whole on both lines
    [
      "- [ ] Pay bill 📅 2026-10-16 🔁 every month https://billing.example.com",
      "- [x] Pay bill 📅 2026-10-16 🔁 every month ✅ 2026-10-17 https://billing.example.com",
      "- [ ] Pay bill 📅 2026-11-16 ➕ 2026-10-17 🔁 every month https://billing.example.com",
    ],
    [
      "- [ ] ⛔ Don't touch prod 🔁 every week 📅 2026-10-16",
      "- [x] ⛔ Don't touch prod 🔁 every week 📅 2026-10-16 ✅ 2026-10-17",
      "- [ ] ⛔ Don't touch prod 📅 2026-10-23 ➕ 2026-10-17 🔁 every week",
    ],
    // A ⏰ reminder is for one occurrence, so the next one has none
    [
      "- [ ] Call Bob 🔁 every week 📅 2026-10-16 ⏰ 2026-10-16 09:00",
      "- [x] Call Bob 🔁 every week 📅 2026-10-16 ✅ 2026-10-17 ⏰ 2026-10-16 09:00",
      "- [ ] Call Bob 📅 2026-10-23 ➕ 2026-10-17 🔁 every week",
    ],
  ])("of %j keeps its text", async (line, updated, added) => {
    expect(await complete(line)).toEqual({ updated, added });
  });
});
