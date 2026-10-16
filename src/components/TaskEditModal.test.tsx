import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "../types";
import { TaskEditModal, type RecurrenceFormat } from "./TaskEditModal";

vi.mock("./ui/dialog", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./ui/dialog")>()),
  // Portals render nothing on the server; render the dialog in place
  DialogPortal: ({ children }: { children?: React.ReactNode }) => children,
}));

const renderModal = (task: Task, recurrenceFormat?: RecurrenceFormat) =>
  renderToStaticMarkup(
    <TaskEditModal
      isOpen
      task={task}
      onSave={() => undefined}
      onClose={() => undefined}
      availableCategories={[]}
      recurrenceFormat={recurrenceFormat}
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
      recurringInterval: "FREQ=WEEKLY;COUNT=5;WKST=SU",
    });

    expect(html).toContain("FREQ=WEEKLY;COUNT=5;WKST=SU");
    expect(html).toContain(
      "These settings can&#x27;t show: repetition count (COUNT), week start other than Monday.",
    );
    expect(html).toContain(
      "The rule is kept as written unless you change them, which replaces it.",
    );
  });

  it("marks the Last day button for a rule on the month's last day", () => {
    const html = renderModal({
      ...baseTask,
      recurringInterval: "every month on the last",
    });

    expect(html).toMatch(/aria-pressed="true"[^>]*>Last day</);
  });

  describe("preview", () => {
    const yearlyEveryOther = {
      ...baseTask,
      recurringInterval: "FREQ=YEARLY;INTERVAL=2;BYMONTH=6,12;BYMONTHDAY=1,15",
    };

    it("shows the text saving writes when rules are saved as text", () => {
      expect(renderModal(yearlyEveryOther, "text")).toContain(
        "every 2 years on the 1st and 15th in June and December",
      );
    });

    it("describes the rule in rrule's words when rules are saved as RRULE", () => {
      expect(renderModal(yearlyEveryOther, "auto")).toContain(
        "every 2 years June and December on the 1st and 15th",
      );
    });
  });
});
