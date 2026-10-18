import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { Profiler, useEffect, useState } from "react";
import { expect, waitFor } from "storybook/test";
import { TasksTimelineApp } from "../../TasksTimelineApp";
import { DEFAULT_SETTINGS } from "../../defaultSettings";
import type { SettingsRepository, Task } from "../../types";
import { getTodayISO } from "../../utils/date-helpers";
import { buildVaultShapedTasks } from "../fixtures";

/**
 * The timeline with a vault-shaped dataset: ~530 tasks, 504 of them without
 * any date (the backlog), a handful of dated, overdue and in-progress tasks,
 * and three tasks for today. It scrolls inside its own pane, as it does in
 * Obsidian. The play functions guard the stat cards, the backlog's
 * collapsed state, focus mode and filter performance.
 */
const TODAY = getTodayISO();

const TASKS: Task[] = [
  ...buildVaultShapedTasks(),
  {
    id: "today-due",
    title: "Due today",
    status: "todo",
    priority: "high",
    tags: [],
    dueAt: TODAY,
  },
  {
    id: "today-doing",
    title: "Started today",
    status: "doing",
    priority: "medium",
    tags: [],
    startAt: TODAY,
  },
  {
    id: "today-created",
    title: "Captured today",
    status: "todo",
    priority: "low",
    tags: [],
    createdAt: TODAY,
  },
];

const makeSettingsRepository = (
  defaultFocusMode: boolean,
): SettingsRepository => ({
  name: "large-vault-story",
  loadSettings: async () => ({
    ...DEFAULT_SETTINGS,
    groupingStrategy: ["dueAt"],
    showCompleted: true,
    defaultFocusMode,
  }),
  saveSettings: async () => undefined,
});

const REPOSITORIES = {
  timeline: makeSettingsRepository(false),
  focus: makeSettingsRepository(true),
};

interface CommitRecord {
  actualDuration: number;
  commitTime: number;
}

const commits: CommitRecord[] = [];

const recordCommit: React.ProfilerOnRenderCallback = (
  _id,
  _phase,
  actualDuration,
  _baseDuration,
  _startTime,
  commitTime,
) => {
  commits.push({ actualDuration, commitTime });
};

const PANE_HEIGHT = 700;

interface VaultPaneProps {
  startInFocusMode?: boolean;
  /** Start with no tasks and load them later, as the Obsidian plugin does. */
  loadTasksLater?: boolean;
}

const VaultPane: React.FC<VaultPaneProps> = ({
  startInFocusMode = false,
  loadTasksLater = false,
}) => {
  const [tasks, setTasks] = useState<Task[]>(loadTasksLater ? [] : TASKS);
  useEffect(() => {
    if (!loadTasksLater) {
      return;
    }
    const timer = setTimeout(() => setTasks(TASKS), 500);
    return () => clearTimeout(timer);
  }, [loadTasksLater]);

  return (
    <div
      data-testid="vault-pane"
      style={{ height: PANE_HEIGHT, overflowY: "auto" }}
    >
      <Profiler id="timeline" onRender={recordCommit}>
        <TasksTimelineApp
          tasks={tasks}
          onTaskAdded={() => undefined}
          onTaskUpdated={() => undefined}
          onTaskDeleted={() => undefined}
          settingsRepository={
            startInFocusMode ? REPOSITORIES.focus : REPOSITORIES.timeline
          }
        />
      </Profiler>
    </div>
  );
};

const meta: Meta<typeof VaultPane> = {
  title: "Core/LargeVault",
  component: VaultPane,
  parameters: { layout: "fullscreen", a11y: { test: "off" } },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------- DOM helpers ----------

type CardLabel = "To Do" | "Unplanned" | "Due & OD" | "Doing";
const CARD_LABELS: CardLabel[] = ["To Do", "Unplanned", "Due & OD", "Doing"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const nextFrame = () =>
  new Promise<number>((resolve) => requestAnimationFrame(resolve));

/** Resolves after the browser paints the current frame. */
const nextPaint = () =>
  new Promise<number>((resolve) =>
    requestAnimationFrame(() => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => resolve(performance.now());
      channel.port2.postMessage(null);
    }),
  );

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b),
    mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const getPane = (root: HTMLElement) =>
  root.querySelector<HTMLElement>('[data-testid="vault-pane"]')!;

const getCard = (root: HTMLElement, label: CardLabel) => {
  const card = [
    ...root.querySelectorAll<HTMLButtonElement>("button[aria-pressed]"),
  ].find((button) => button.textContent?.trim().endsWith(label));
  if (!card) {
    throw new Error(`Stat card "${label}" not found`);
  }
  return card;
};

const cardNumber = (root: HTMLElement, label: CardLabel) =>
  Number.parseInt(getCard(root, label).textContent ?? "", 10);

const getFocusButton = (root: HTMLElement) =>
  root.querySelector<HTMLButtonElement>('button[title$="Focus Mode"]')!;

const isShown = (element: Element) => element.closest("[hidden]") === null;

const countOf = (element: Element) =>
  Number(element.getAttribute("data-task-count"));

/** Tasks the list shows: every visible day section plus the backlog. */
const shownTaskCount = (root: HTMLElement) =>
  [...root.querySelectorAll("[data-day-section], [data-backlog-section]")]
    .filter(isShown)
    .reduce((sum, section) => sum + countOf(section), 0);

const getBacklogTrigger = (root: HTMLElement) =>
  root.querySelector<HTMLButtonElement>(
    '[data-backlog-section] button[aria-label*="backlog,"]',
  );

const backlogRows = (root: HTMLElement) =>
  root.querySelectorAll(
    '[data-backlog-section] button[aria-label^="Change status for "]',
  ).length;

const waitForApp = async (root: HTMLElement) => {
  await waitFor(
    () => {
      expect(cardNumber(root, "Unplanned")).toBeGreaterThan(500);
      expect(getBacklogTrigger(root)).not.toBeNull();
    },
    { timeout: 10000 },
  );
  await sleep(300);
};

const clickAndSettle = async (button: HTMLElement, settled: () => void) => {
  button.click();
  await waitFor(settled, { timeout: 10000, interval: 5 });
  await nextPaint();
};

// ---------- Stories ----------

export const Default: Story = {};

/**
 * Each card's number is the number of tasks the list shows when the card is
 * selected (day sections + Today + backlog), in focus mode too.
 */
export const CardCountsMatchList: Story = {
  play: async ({ canvasElement, step }) => {
    await waitForApp(canvasElement);

    for (const focusMode of [false, true]) {
      await step(`Cards match the list (focus mode ${focusMode})`, async () => {
        if (focusMode) {
          await clickAndSettle(getFocusButton(canvasElement), () =>
            expect(getFocusButton(canvasElement).title).toBe(
              "Turn Off Focus Mode",
            ),
          );
        }
        for (const label of CARD_LABELS) {
          const expected = cardNumber(canvasElement, label);
          await clickAndSettle(getCard(canvasElement, label), () => {
            expect(getCard(canvasElement, label)).toHaveAttribute(
              "aria-pressed",
              "true",
            );
            expect(shownTaskCount(canvasElement)).toBe(expected);
          });
          // The number does not change when its own card is selected
          expect(cardNumber(canvasElement, label)).toBe(expected);
          await clickAndSettle(getCard(canvasElement, label), () =>
            expect(getCard(canvasElement, label)).toHaveAttribute(
              "aria-pressed",
              "false",
            ),
          );
        }
      });
    }

    await step("Focus mode counts only today's tasks", async () => {
      expect(cardNumber(canvasElement, "Due & OD")).toBe(1);
      expect(cardNumber(canvasElement, "Doing")).toBe(1);
      expect(cardNumber(canvasElement, "Unplanned")).toBe(1);
      expect(cardNumber(canvasElement, "To Do")).toBe(0);
    });
  },
};

/** Year headers count exactly the tasks in their day sections. */
export const YearTotalsMatchSections: Story = {
  play: async ({ canvasElement }) => {
    await waitForApp(canvasElement);
    const years = [...canvasElement.querySelectorAll("[data-year-section]")];
    expect(years.length).toBeGreaterThan(0);
    for (const year of years) {
      const daysTotal = [...year.querySelectorAll("[data-day-section]")].reduce(
        (sum, day) => sum + countOf(day),
        0,
      );
      expect(countOf(year)).toBe(daysTotal);
    }
    // Today's tasks are not counted in any year
    const todayCount = countOf(
      canvasElement.querySelector(`[data-day-section="${TODAY}"]`)!,
    );
    expect(todayCount).toBe(3);
  },
};

/** Only the user expands the backlog, and the choice survives filters and focus mode. */
export const BacklogStaysCollapsed: Story = {
  play: async ({ canvasElement, step }) => {
    await waitForApp(canvasElement);
    const expectBacklog = (expanded: boolean) => {
      const trigger = getBacklogTrigger(canvasElement);
      expect(trigger).toHaveAttribute("aria-expanded", String(expanded));
      if (!expanded) {
        expect(backlogRows(canvasElement)).toBe(0);
      }
    };
    const toggleFocusTwice = async () => {
      for (const title of ["Turn Off Focus Mode", "Turn On Focus Mode"]) {
        await clickAndSettle(getFocusButton(canvasElement), () =>
          expect(getFocusButton(canvasElement).title).toBe(title),
        );
      }
    };
    const toggleUrgentTwice = async () => {
      // Due & OD hides every undated task, so the backlog unmounts meanwhile
      await clickAndSettle(getCard(canvasElement, "Due & OD"), () =>
        expect(getBacklogTrigger(canvasElement)).toBeNull(),
      );
      await clickAndSettle(getCard(canvasElement, "Due & OD"), () =>
        expect(getBacklogTrigger(canvasElement)).not.toBeNull(),
      );
    };

    await step("Starts collapsed", async () => expectBacklog(false));

    await step("Stays collapsed through focus mode and filters", async () => {
      await toggleFocusTwice();
      expectBacklog(false);
      await toggleUrgentTwice();
      expectBacklog(false);
    });

    await step("Once the user expands it, stays expanded", async () => {
      getBacklogTrigger(canvasElement)!.click();
      await waitFor(() => expectBacklog(true));
      await toggleFocusTwice();
      expectBacklog(true);
      await toggleUrgentTwice();
      expectBacklog(true);
    });
  },
};

const placeholdersInView = (pane: HTMLElement) => {
  const view = pane.getBoundingClientRect();
  return [...pane.querySelectorAll("[data-lazy-placeholder]")].filter(
    (placeholder) => {
      const rect = placeholder.getBoundingClientRect();
      return (
        rect.height > 0 && rect.bottom > view.top && rect.top < view.bottom
      );
    },
  );
};

const daySectionsInView = (pane: HTMLElement) => {
  const view = pane.getBoundingClientRect();
  return [
    ...pane.querySelectorAll<HTMLElement>(
      "[data-timeline-body] [data-day-section]",
    ),
  ].filter((section) => {
    const rect = section.getBoundingClientRect();
    return rect.height > 0 && rect.top < view.bottom && rect.bottom > view.top;
  });
};

const isDayOpen = (section: Element) =>
  section
    .querySelector("button[aria-expanded]")
    ?.getAttribute("aria-expanded") === "true";

/**
 * Leaving focus mode shows the timeline at once: sections in view have
 * their rows (no placeholders) by the next frame, open/closed state is
 * kept, and a collapsed section reserves no space.
 */
export const FocusToggleHasNoBlankFrames: Story = {
  play: async ({ canvasElement, step }) => {
    await waitForApp(canvasElement);
    const pane = getPane(canvasElement);

    // Collapse the second day section of the timeline
    const days = [
        ...pane.querySelectorAll<HTMLElement>(
          "[data-timeline-body] [data-day-section]",
        ),
      ],
      collapsedDate = days[1].getAttribute("data-day-section")!;
    days[1].querySelector<HTMLButtonElement>("button[aria-expanded]")!.click();
    await waitFor(() => expect(isDayOpen(days[1])).toBe(false));
    await sleep(400);

    for (let round = 0; round < 3; round++) {
      await step(`Focus on, then off (round ${round + 1})`, async () => {
        await clickAndSettle(getFocusButton(canvasElement), () =>
          expect(getFocusButton(canvasElement).title).toBe(
            "Turn Off Focus Mode",
          ),
        );
        await sleep(200);

        getFocusButton(canvasElement).click();
        await waitFor(
          () =>
            expect(getFocusButton(canvasElement).title).toBe(
              "Turn On Focus Mode",
            ),
          { timeout: 2000, interval: 1 },
        );
        // Already right after the commit, before the browser paints
        expect(placeholdersInView(pane)).toEqual([]);
        // And still within two frames of it
        await nextFrame();
        await nextFrame();

        expect(placeholdersInView(pane)).toEqual([]);
        const inView = daySectionsInView(pane);
        expect(inView.length).toBeGreaterThan(0);
        for (const section of inView) {
          const date = section.getAttribute("data-day-section"),
            rows = section.querySelectorAll(
              'button[aria-label^="Change status for "]',
            ).length;
          if (date === collapsedDate) {
            expect(isDayOpen(section)).toBe(false);
            expect(rows).toBe(0);
            expect(section.querySelector("[data-lazy-placeholder]")).toBeNull();
          } else {
            expect(isDayOpen(section)).toBe(true);
            expect(rows).toBe(countOf(section));
          }
        }
        // Chevrons are already at their final angle (no replayed animation)
        for (const section of inView) {
          const chevron = section.querySelector<HTMLElement>(
            "button[aria-expanded] [style*='transform']",
          );
          const open = isDayOpen(section);
          expect(chevron?.style.transform ?? "none").toMatch(
            open ? /rotate\(90deg\)/ : /none|rotate\(0deg\)/,
          );
        }
      });
    }
  },
};

/**
 * Filtering with the expanded backlog in view stays fast. The budgets are
 * loose (dev-mode React in a shared CI browser); production builds are
 * several times faster. Before this change the same clicks took ~1.3 s.
 */
export const FilterChangeStaysFast: Story = {
  play: async ({ canvasElement }) => {
    await waitForApp(canvasElement);
    const pane = getPane(canvasElement),
      scrollBacklogIntoView = () => {
        const trigger = getBacklogTrigger(canvasElement)!;
        pane.scrollTop +=
          trigger.getBoundingClientRect().top -
          pane.getBoundingClientRect().top -
          200;
      };
    getBacklogTrigger(canvasElement)!.click();
    scrollBacklogIntoView();
    await waitFor(() => expect(backlogRows(canvasElement)).toBeGreaterThan(0));
    await sleep(500);

    const wallMs: number[] = [],
      renderMs: number[] = [];
    for (let i = 0; i < 7; i++) {
      for (const pressed of ["true", "false"] as const) {
        scrollBacklogIntoView();
        await sleep(150);
        const expected =
            pressed === "true" ? cardNumber(canvasElement, "Unplanned") : null,
          t0 = performance.now(),
          firstCommit = commits.length;
        await clickAndSettle(getCard(canvasElement, "Unplanned"), () => {
          expect(getCard(canvasElement, "Unplanned")).toHaveAttribute(
            "aria-pressed",
            pressed,
          );
          if (expected !== null) {
            expect(shownTaskCount(canvasElement)).toBe(expected);
          } else {
            expect(shownTaskCount(canvasElement)).toBeGreaterThan(520);
          }
        });
        const t1 = performance.now();
        await sleep(100);
        if (i > 0) {
          wallMs.push(t1 - t0);
          renderMs.push(
            commits
              .slice(firstCommit)
              .reduce((sum, commit) => sum + commit.actualDuration, 0),
          );
        }
      }
    }

    console.log(
      `[perf] Unplanned card with the backlog expanded and in view (dev React): click to paint median ${median(wallMs).toFixed(0)} ms, React render median ${median(renderMs).toFixed(1)} ms`,
    );
    expect(median(renderMs)).toBeLessThan(150);
    expect(median(wallMs)).toBeLessThan(400);
  },
};

/**
 * Starting in focus mode (as the plugin does: settings and tasks load after
 * the first render), the first time it is turned off is instant too.
 */
export const StartsInFocusMode: Story = {
  args: { startInFocusMode: true, loadTasksLater: true },
  play: async ({ canvasElement }) => {
    await waitFor(
      () => {
        expect(getFocusButton(canvasElement).title).toBe("Turn Off Focus Mode");
        // The tasks arrived while the timeline was hidden
        expect(
          canvasElement.querySelector(
            "[data-timeline-body] [data-day-section]",
          ),
        ).not.toBeNull();
      },
      { timeout: 10000 },
    );
    await sleep(300);
    const pane = getPane(canvasElement);

    getFocusButton(canvasElement).click();
    await waitFor(
      () =>
        expect(getFocusButton(canvasElement).title).toBe("Turn On Focus Mode"),
      { timeout: 2000, interval: 1 },
    );
    // Already right after the commit, before the browser paints
    expect(placeholdersInView(pane)).toEqual([]);
    await nextFrame();
    await nextFrame();

    expect(placeholdersInView(pane)).toEqual([]);
    const inView = daySectionsInView(pane);
    expect(inView.length).toBeGreaterThan(0);
    for (const section of inView) {
      expect(
        section.querySelectorAll('button[aria-label^="Change status for "]')
          .length,
      ).toBe(countOf(section));
    }
    expect(getBacklogTrigger(canvasElement)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  },
};
