import type { Meta, StoryObj } from "@storybook/react-vite";
import { version as reactVersion } from "react";
import { expect } from "storybook/test";
import { buildMixedVault } from "../fixtures/mixed-vault";
import { PluginHost } from "../fixtures/PluginHost";
import { mountPluginApp, type MountedPluginApp } from "../fixtures/plugin-host";
import {
  backlog,
  card,
  describeAction,
  focus,
  perform,
  scrollBottom,
  scrollMiddle,
  settle,
  waitForTasks,
  type Action,
} from "../fixtures/plugin-host-actions";

/**
 * A 2000-task vault (about 520 day sections, 700 undated tasks) in the
 * plugin host. Rendering the whole timeline used to mount every day section
 * (17,000+ elements): loading the tasks, leaving a stat card or focus mode
 * took frames of over 200 ms, most of it styling sections nobody could see.
 * Day sections far from the view must stay placeholders, and the view must
 * never show one once the list settles.
 *
 * Runs in both Vitest projects (React 19, and React 18.3.1 as the plugin
 * bundles it).
 */

const BIG_VAULT = buildMixedVault({ count: 2000 });

/**
 * The view plus its 500 px margins spans 2000 px at this height: a few
 * chunks of day sections, never hundreds of sections.
 */
const MAX_MOUNTED_DAY_SECTIONS = 60;

const STEPS: Action[] = [
  backlog,
  card("Doing"),
  card("Doing"),
  card("Due & OD"),
  card("Due & OD"),
  focus,
  focus,
  scrollMiddle,
  focus,
  focus,
  scrollBottom,
  card("Unplanned"),
  card("Unplanned"),
];

const mountedDaySections = (app: MountedPluginApp) =>
  app.shadowRoot.querySelectorAll("[data-day-section]").length;

/** Placeholders the user can see, below the app's sticky header. */
const placeholdersInView = (app: MountedPluginApp) => {
  const pane = app.host.getBoundingClientRect(),
    header = app.shadowRoot.querySelector(".sticky.top-0"),
    top = Math.max(pane.top, header?.getBoundingClientRect().bottom ?? 0);
  return [...app.shadowRoot.querySelectorAll("[data-lazy-placeholder]")]
    .map((placeholder) => placeholder.getBoundingClientRect())
    .filter(
      (rect) =>
        rect.height > 0 &&
        Math.min(rect.bottom, pane.bottom) - Math.max(rect.top, top) > 0,
    );
};

/** Longest gap between animation frames while `run` runs, in ms. */
const longestFrame = async (run: () => Promise<void>) => {
  let last = performance.now(),
    longest = 0,
    frame = 0;
  const tick = (now: number) => {
    longest = Math.max(longest, now - last);
    last = now;
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  try {
    await run();
  } finally {
    cancelAnimationFrame(frame);
  }
  return Math.round(longest);
};

const scaleStory = (width: number, height: number): Story => ({
  render: () => <div data-testid="scale-stage" />,
  play: async ({ canvasElement }) => {
    const stage = canvasElement.querySelector<HTMLElement>(
      '[data-testid="scale-stage"]',
    )!;
    const app = mountPluginApp(stage, { tasks: BIG_VAULT, width, height });
    const report: string[] = [],
      failures: string[] = [];
    const check = (where: string) => {
      const sections = mountedDaySections(app),
        blank = placeholdersInView(app);
      report.push(`${where}: ${sections} day sections`);
      if (sections > MAX_MOUNTED_DAY_SECTIONS) {
        failures.push(
          `${where}: ${sections} day sections mounted (limit ${MAX_MOUNTED_DAY_SECTIONS})`,
        );
      }
      if (blank.length > 0) {
        failures.push(
          `${where}: ${blank.length} placeholder(s) in view, first at ${Math.round(
            blank[0].top - app.host.getBoundingClientRect().top,
          )} px`,
        );
      }
      failures.push(...app.monitor.errors.map((error) => `${where}: ${error}`));
    };
    try {
      const loadFrame = await longestFrame(() => waitForTasks(app));
      report.push(`load: longest frame ${loadFrame} ms`);
      check("load");
      for (const [i, action] of STEPS.entries()) {
        const where = `step ${i + 1} (${describeAction(action)})`,
          frame = await longestFrame(async () => {
            perform(app, action);
            await settle(500);
          });
        report.push(`${where}: longest frame ${frame} ms`);
        check(where);
      }
    } finally {
      console.info(
        `[timeline scale, React ${reactVersion}, ${width}x${height}]\n${report.join("\n")}`,
      );
      app.unmount();
    }
    expect(failures).toEqual([]);
  },
});

const meta: Meta<typeof PluginHost> = {
  title: "Core/TimelineScale",
  component: PluginHost,
  args: { tasks: BIG_VAULT, width: 1396, height: 1000 },
  parameters: { layout: "fullscreen", a11y: { test: "off" } },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** The 2000-task vault at 1396x1000, for manual checks. */
export const Default: Story = {};

export const Wide: Story = scaleStory(1396, 1000);
export const Narrow: Story = scaleStory(420, 1150);

const dayInView = (app: MountedPluginApp) => {
  const pane = app.host.getBoundingClientRect();
  return [
    ...app.shadowRoot.querySelectorAll<HTMLElement>(
      "[data-timeline-body] [data-day-section]",
    ),
  ].find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top > pane.top + 200 && rect.bottom < pane.bottom;
  });
};

const daySection = (app: MountedPluginApp, date: string) =>
  app.shadowRoot.querySelector<HTMLElement>(
    `[data-timeline-body] [data-day-section="${date}"]`,
  );

const isOpen = (section: HTMLElement) =>
  section
    .querySelector("button[aria-expanded]")
    ?.getAttribute("aria-expanded") === "true";

/**
 * A day section the user collapsed stays collapsed after scrolling far
 * enough that its chunk unmounts, and back.
 */
export const CollapsedDayStaysCollapsed: Story = {
  render: () => <div data-testid="scale-stage" />,
  play: async ({ canvasElement }) => {
    const stage = canvasElement.querySelector<HTMLElement>(
      '[data-testid="scale-stage"]',
    )!;
    const app = mountPluginApp(stage, {
      tasks: BIG_VAULT,
      width: 1396,
      height: 1000,
    });
    try {
      await waitForTasks(app);
      perform(app, scrollMiddle);
      await settle(300);
      const section = dayInView(app)!,
        date = section.getAttribute("data-day-section")!;
      expect(isOpen(section)).toBe(true);
      section
        .querySelector<HTMLButtonElement>("button[aria-expanded]")!
        .click();
      await settle(500);
      expect(isOpen(daySection(app, date)!)).toBe(false);
      const scrolledTo = app.host.scrollTop,
        offset =
          daySection(app, date)!.getBoundingClientRect().top -
          app.host.getBoundingClientRect().top;

      perform(app, scrollBottom);
      await settle(300);
      expect(daySection(app, date)).toBeNull(); // its chunk unmounted

      app.host.scrollTop = scrolledTo;
      await settle(300);
      const back = daySection(app, date);
      expect(back).not.toBeNull();
      expect(isOpen(back!)).toBe(false);
      // Back where it was: its chunk's placeholder had its measured height
      expect(
        Math.abs(
          back!.getBoundingClientRect().top -
            app.host.getBoundingClientRect().top -
            offset,
        ),
      ).toBeLessThan(2);
      expect(placeholdersInView(app)).toEqual([]);
      expect(app.monitor.errors).toEqual([]);
    } finally {
      app.unmount();
    }
  },
};
