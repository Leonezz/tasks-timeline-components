import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { Profiler, useEffect, useState } from "react";
import { expect, waitFor } from "storybook/test";
import { TasksTimelineApp } from "../../TasksTimelineApp";
import { BacklogSection } from "../../components/BacklogSection";
import { DaySection } from "../../components/DaySection";
import { YearSection } from "../../components/YearSection";
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

/** Changes a task in the host's state, as a vault edit or a sync would. */
const UPDATE_TASK_EVENT = "large-vault:update-task";

const updateHostTask = (patch: Partial<Task> & { id: string }) =>
  window.dispatchEvent(new CustomEvent(UPDATE_TASK_EVENT, { detail: patch }));

const VaultPane: React.FC<VaultPaneProps> = ({
  startInFocusMode = false,
  loadTasksLater = false,
}) => {
  const [tasks, setTasks] = useState<Task[]>(loadTasksLater ? [] : TASKS),
    applyPatch = (patch: Partial<Task> & { id: string }) =>
      setTasks((prev) =>
        prev.map((task) =>
          task.id === patch.id ? { ...task, ...patch } : task,
        ),
      );
  useEffect(() => {
    if (!loadTasksLater) {
      return;
    }
    const timer = setTimeout(() => setTasks(TASKS), 500);
    return () => clearTimeout(timer);
  }, [loadTasksLater]);
  useEffect(() => {
    const onUpdate = (event: Event) =>
      applyPatch((event as CustomEvent<Partial<Task> & { id: string }>).detail);
    window.addEventListener(UPDATE_TASK_EVENT, onUpdate);
    return () => window.removeEventListener(UPDATE_TASK_EVENT, onUpdate);
  }, []);

  return (
    <div
      data-testid="vault-pane"
      style={{ height: PANE_HEIGHT, overflowY: "auto" }}
    >
      <Profiler id="timeline" onRender={recordCommit}>
        <TasksTimelineApp
          tasks={tasks}
          onTaskAdded={() => undefined}
          onTaskUpdated={(task) => applyPatch(task)}
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

/**
 * Day sections, and placeholders of day sections far from the view (their
 * chunk is not mounted; the placeholder carries their task count).
 */
const DAY_SECTIONS = "[data-day-section], [data-day-chunk][data-task-count]";

/** Tasks the list shows: every visible day section plus the backlog. */
const shownTaskCount = (root: HTMLElement) =>
  [...root.querySelectorAll(`${DAY_SECTIONS}, [data-backlog-section]`)]
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
      const daysTotal = [...year.querySelectorAll(DAY_SECTIONS)].reduce(
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

const getDaySection = (pane: HTMLElement, date: string) =>
  pane.querySelector<HTMLElement>(
    `[data-timeline-body] [data-day-section="${date}"]`,
  )!;

/**
 * A day section near the top of the timeline; scrolls to the top first when
 * it is far away and so not mounted.
 */
const findTopDaySection = async (pane: HTMLElement, date: string) => {
  if (!getDaySection(pane, date)) {
    pane.scrollTop = 0;
    await waitFor(() => expect(getDaySection(pane, date)).not.toBeNull());
  }
  return getDaySection(pane, date);
};

/** Scrolls the pane so the element's top sits `offset` px below the pane's. */
const scrollPaneTo = (pane: HTMLElement, element: Element, offset: number) => {
  pane.scrollTop +=
    element.getBoundingClientRect().top -
    pane.getBoundingClientRect().top -
    offset;
};

const toggleFocus = async (root: HTMLElement, title: string) => {
  getFocusButton(root).click();
  await waitFor(() => expect(getFocusButton(root).title).toBe(title), {
    timeout: 2000,
    interval: 1,
  });
};

/**
 * Leaving focus mode shows the timeline at once: sections in view have
 * their rows (no placeholders) by the next frame, open/closed state is
 * kept, and a collapsed section reserves no space.
 */
export const FocusToggleHasNoBlankFrames: Story = {
  play: async ({ canvasElement, step }) => {
    await waitForApp(canvasElement);
    const pane = getPane(canvasElement);

    // Collapse a timeline section the user can see: scroll to the second one
    const second = pane.querySelectorAll<HTMLElement>(
        "[data-timeline-body] [data-day-section]",
      )[1],
      collapsedDate = second.getAttribute("data-day-section")!;
    scrollPaneTo(pane, second, 100);
    await waitFor(() =>
      expect(daySectionsInView(pane)).toContain(
        getDaySection(pane, collapsedDate),
      ),
    );
    second.querySelector<HTMLButtonElement>("button[aria-expanded]")!.click();
    await waitFor(() => expect(isDayOpen(second)).toBe(false));
    await sleep(400);

    const expandBacklogAndScrollToEnd = async () => {
      const trigger = getBacklogTrigger(canvasElement)!;
      if (trigger.getAttribute("aria-expanded") !== "true") {
        trigger.click();
        await waitFor(() =>
          expect(trigger).toHaveAttribute("aria-expanded", "true"),
        );
        await sleep(400);
      }
      pane.scrollTop = pane.scrollHeight;
      await waitFor(() => {
        expect(backlogRows(canvasElement)).toBeGreaterThan(0);
        // Day sections (or their rows) far from the view are placeholders
        expect(
          pane.querySelectorAll("[data-timeline-body] [data-lazy-placeholder]")
            .length,
        ).toBeGreaterThan(0);
      });
    };

    const expectCollapsed = () => {
      const section = getDaySection(pane, collapsedDate);
      if (!section) {
        return; // far from the view: its chunk is not mounted (round 2)
      }
      expect(isDayOpen(section)).toBe(false);
      expect(
        section.querySelectorAll('button[aria-label^="Change status for "]')
          .length,
      ).toBe(0);
      expect(section.querySelector("[data-lazy-placeholder]")).toBeNull();
    };

    for (let round = 0; round < 3; round++) {
      await step(`Focus on, then off (round ${round + 1})`, async () => {
        // Look at the collapsed section, or in round 2 at the end of the
        // expanded backlog, where the day sections are far and unmounted,
        // then hide the timeline
        if (round === 1) {
          await expandBacklogAndScrollToEnd();
        } else {
          scrollPaneTo(pane, await findTopDaySection(pane, collapsedDate), 100);
        }
        await sleep(100);
        await clickAndSettle(getFocusButton(canvasElement), () =>
          expect(getFocusButton(canvasElement).title).toBe(
            "Turn Off Focus Mode",
          ),
        );
        await sleep(200);

        await toggleFocus(canvasElement, "Turn On Focus Mode");
        // Already right after the commit, before the browser paints
        expect(placeholdersInView(pane)).toEqual([]);
        expectCollapsed();
        // And still within two frames of it
        await nextFrame();
        await nextFrame();

        expect(placeholdersInView(pane)).toEqual([]);
        expectCollapsed();
        // Bring it back into view: still collapsed, and the rest unchanged
        scrollPaneTo(pane, await findTopDaySection(pane, collapsedDate), 100);
        await nextFrame();
        await nextFrame();
        expect(placeholdersInView(pane)).toEqual([]);
        const inView = daySectionsInView(pane);
        expect(inView).toContain(getDaySection(pane, collapsedDate));
        for (const section of inView) {
          const date = section.getAttribute("data-day-section"),
            rows = section.querySelectorAll(
              'button[aria-label^="Change status for "]',
            ).length;
          if (date === collapsedDate) {
            expectCollapsed();
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

// ---------- Render tracking (React internals, test-only) ----------

interface FiberNode {
  type: unknown;
  child: FiberNode | null;
  sibling: FiberNode | null;
  memoizedState: unknown;
  memoizedProps: Record<string, unknown> | null;
}

const findFiberRoot = (element: HTMLElement): { current: FiberNode } => {
  const candidates = [
    ...(function* ancestors() {
      for (
        let node: Element | null = element;
        node;
        node = node.parentElement
      ) {
        yield node;
      }
    })(),
    ...element.querySelectorAll("*"),
  ];
  for (const node of candidates) {
    const key = Object.keys(node).find((k) =>
      k.startsWith("__reactContainer$"),
    );
    if (key) {
      return (
        node as unknown as Record<string, { stateNode: { current: FiberNode } }>
      )[key].stateNode;
    }
  }
  throw new Error("No React root found around the story canvas");
};

const collectFibers = (
  root: { current: FiberNode },
  matches: (fiber: FiberNode) => boolean,
): FiberNode[] => {
  const found: FiberNode[] = [],
    stack: FiberNode[] = [root.current];
  while (stack.length) {
    const fiber = stack.pop()!;
    if (matches(fiber)) {
      found.push(fiber);
    }
    if (fiber.sibling) {
      stack.push(fiber.sibling);
    }
    if (fiber.child) {
      stack.push(fiber.child);
    }
  }
  return found;
};

const TIMELINE_TYPES: unknown[] = [YearSection, DaySection, BacklogSection];

/** Year, day (not Today) and backlog sections of the timeline. */
const isTimelineSection = (fiber: FiberNode) =>
  TIMELINE_TYPES.includes(fiber.type) && fiber.memoizedProps?.lazy !== false;

const describeFiber = (fiber: FiberNode) => {
  const props = fiber.memoizedProps ?? {},
    group = props.group as { date?: string; year?: number } | undefined;
  return group?.date ?? String(group?.year ?? "backlog");
};

/**
 * A function component's first hook object is replaced each time it renders,
 * so a section whose hook object is unchanged did not render.
 */
const trackRenders = (canvasElement: HTMLElement) => {
  const root = findFiberRoot(canvasElement),
    before = new Set(
      collectFibers(root, isTimelineSection).map((f) => f.memoizedState),
    );
  return {
    sectionCount: before.size,
    renderedSince: () =>
      collectFibers(root, isTimelineSection)
        .filter((fiber) => !before.has(fiber.memoizedState))
        .map(describeFiber),
  };
};

const FUTURE_TASK = TASKS.find((task) => task.title === "Future due item")!;

/**
 * In focus mode the hidden timeline does no work: stat cards, filters and
 * task updates render only what focus mode shows. Leaving focus mode shows
 * the changes made meanwhile.
 */
export const FocusModeLeavesHiddenTimelineAlone: Story = {
  play: async ({ canvasElement, step }) => {
    await waitForApp(canvasElement);
    await clickAndSettle(getFocusButton(canvasElement), () =>
      expect(getFocusButton(canvasElement).title).toBe("Turn Off Focus Mode"),
    );
    await sleep(300);
    const tracker = trackRenders(canvasElement);
    // Only the sections near the view are mounted
    expect(tracker.sectionCount).toBeGreaterThan(3);

    await step("Stat cards", async () => {
      for (const pressed of ["true", "false"]) {
        await clickAndSettle(getCard(canvasElement, "Unplanned"), () =>
          expect(getCard(canvasElement, "Unplanned")).toHaveAttribute(
            "aria-pressed",
            pressed,
          ),
        );
      }
      await sleep(200);
      expect(tracker.renderedSince()).toEqual([]);
    });

    await step("Task updates", async () => {
      updateHostTask({ id: "today-due", status: "done" });
      await waitFor(() =>
        expect(cardNumber(canvasElement, "Due & OD")).toBe(0),
      );
      updateHostTask({ id: FUTURE_TASK.id, title: "Renamed while hidden" });
      await sleep(300);
      expect(tracker.renderedSince()).toEqual([]);
    });

    await step("Leaving focus mode shows the changes", async () => {
      await toggleFocus(canvasElement, "Turn On Focus Mode");
      await waitFor(() =>
        expect(
          canvasElement.querySelector(
            `[data-timeline-body] button[aria-label="Edit task title: Renamed while hidden"]`,
          ),
        ).not.toBeNull(),
      );
    });
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
        expect(cardNumber(canvasElement, "Unplanned")).toBe(1);
        expect(
          canvasElement.querySelector('[role="note"]')?.textContent,
        ).toMatch(/^504 backlog tasks hidden/);
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
