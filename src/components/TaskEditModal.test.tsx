import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Task } from "../types";
import { TaskEditModal } from "./TaskEditModal";

const renderModal = (task: Task) =>
  renderToStaticMarkup(
    <TaskEditModal
      isOpen
      task={task}
      onSave={() => undefined}
      onClose={() => undefined}
      availableCategories={[]}
    />,
  );

const baseTask: Task = {
  id: "task-1",
  title: "Water the plants",
  status: "todo",
  priority: "medium",
  tags: [],
};

describe("TaskEditModal recurrence", () => {
  it("shows a parsed Obsidian Tasks rule as recurring and displays it verbatim", () => {
    // Parsed `🔁 every week when done` lines set the rule but not isRecurring
    const html = renderModal({
      ...baseTask,
      recurringInterval: "every week when done",
    });

    expect(html).toContain('aria-checked="true"');
    expect(html).toContain("every week when done");
  });

  it("explains that an unreadable rule is kept", () => {
    const html = renderModal({
      ...baseTask,
      recurringInterval: "every fortnight",
    });

    expect(html).toContain("every fortnight");
    expect(html).toContain("it is kept unless you change them");
  });

  it("shows a task without a rule as not recurring", () => {
    expect(renderModal(baseTask)).toContain('aria-checked="false"');
  });

  it("says which parts of a rule its settings can't show", () => {
    const html = renderModal({
      ...baseTask,
      recurringInterval: "FREQ=MONTHLY;BYDAY=+2MO",
    });

    expect(html).toContain("FREQ=MONTHLY;BYDAY=+2MO");
    expect(html).toContain(
      "can&#x27;t show its ordinal weekdays (like the 2nd Monday)",
    );
  });

  it("marks the Last day button for a rule on the month's last day", () => {
    const html = renderModal({
      ...baseTask,
      recurringInterval: "every month on the last",
    });

    expect(html).toMatch(/aria-pressed="true"[^>]*>Last day</);
  });
});
