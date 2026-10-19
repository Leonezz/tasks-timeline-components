import type { Meta, StoryObj } from "@storybook/react-vite";
import { version as reactVersion } from "react";
import { expect } from "storybook/test";
import { buildVaultShapedTasks } from "../fixtures/vault-shaped";
import { PluginHost } from "../fixtures/PluginHost";
import {
  backlog,
  card,
  focus,
  randomActions,
  runScenario,
  scrollBottom,
  scrollMiddle,
  type Action,
  type Limits,
  type ScenarioResult,
  type ScenarioRun,
} from "../fixtures/plugin-host-actions";

/**
 * The timeline mounted the way the Obsidian plugin mounts it (its own React
 * root under StrictMode, in an open shadow root on the scrolling pane, the
 * plugin's settings and Markdown title renderer), driven through the
 * sequences that crashed the lazily chunked lists with "Maximum update depth
 * exceeded" in real Obsidian (PR #79), across pane sizes, plus seeded random
 * scrolls, focus toggles, stat cards and backlog toggles.
 *
 * A play function fails if the task list's error boundary shows, if React
 * reports or logs an error, if the app commits more than
 * `LIMITS.commitsPerFrame` times in one animation frame, or if a lazy chunk
 * switches between rows and placeholder more than `LIMITS.flipsPerFrame`
 * times in one frame.
 *
 * These stories run twice: in the `storybook` Vitest project (React 19) and
 * in `storybook-react18` (React 18.3.1, which the plugin bundles; the crash
 * only showed there).
 */

/** The maintainer's vault: 497 undated tasks, 8 created-only, a few dated. */
const USER_VAULT = buildVaultShapedTasks({ bulkCount: 497 });
/** 505 created-only tasks over 6 months: ~170 day sections, no backlog. */
const SPREAD_VAULT = buildVaultShapedTasks({ undatedHaveCreatedAt: true });

const LIMITS: Limits = {
  // A click renders an urgent and a deferred pass, and a lazy list one
  // more after measuring; the crash committed 50+ times in one frame
  commitsPerFrame: 12,
  // A chunk may mount and unmount again in one frame when its real rows
  // are taller than estimated (narrow panes), and once more when the day
  // sections above it mount in the same frame: they mount with estimated
  // rows (shorter, so it moves into range) and then their real rows (so it
  // moves out again). An oscillation flips it dozens of times
  flipsPerFrame: 3,
};

const WIDTHS = [1396, 420];
const RANDOM_STEPS = 14;
const RANDOM_HEIGHTS = [700, 822, 900, 922, 1000, 1080];

/** Sequences that crashed in Obsidian. */
const SCRIPTED: { name: string; spread?: boolean; actions: Action[] }[] = [
  { name: "bottom, focus on/off", actions: [scrollBottom, focus, focus] },
  { name: "expand backlog", actions: [backlog] },
  {
    name: "focus matrix, expand backlog",
    actions: [
      scrollBottom,
      focus,
      focus,
      scrollMiddle,
      focus,
      focus,
      scrollBottom,
      backlog,
    ],
  },
  {
    name: "spread vault, Unplanned on/off, bottom, focus on/off",
    spread: true,
    actions: [card("Unplanned"), card("Unplanned"), scrollBottom, focus, focus],
  },
];

const logResult = (result: ScenarioResult, started: number) =>
  console.info(
    `[plugin-host stress, React ${reactVersion}] ${result.label} (${Math.round(
      performance.now() - started,
    )} ms): max ${result.maxCommitsPerFrame} commits/frame, ${
      result.maxFlipsPerFrame
    } flips/frame${result.failures.length ? `, FAILED: ${result.failures[0]}` : ""}`,
  );

const runAll = async (stage: HTMLElement, runs: ScenarioRun[]) => {
  const results: ScenarioResult[] = [];
  for (const run of runs) {
    const started = performance.now(),
      result = await runScenario(stage, run, LIMITS);
    logResult(result, started);
    results.push(result);
  }
  expect(results.flatMap((result) => result.failures)).toEqual([]);
};

/** Every crashing sequence at one pane height, wide and narrow. */
const scriptedAt = (height: number): ScenarioRun[] =>
  WIDTHS.flatMap((width) =>
    SCRIPTED.map((scripted) => ({
      label: `${width}x${height} ${scripted.name}`,
      tasks: scripted.spread ? SPREAD_VAULT : USER_VAULT,
      width,
      height,
      actions: scripted.actions,
    })),
  );

/** Seeded random actions at every pane height, at one width. */
const randomAt = (seed: number, width: number): ScenarioRun[] =>
  RANDOM_HEIGHTS.map((height) => ({
    label: `${width}x${height} random (seed ${seed})`,
    tasks: USER_VAULT,
    width,
    height,
    actions: randomActions(seed * 10007 + height + width, RANDOM_STEPS),
    settleMs: 60,
  }));

const meta: Meta<typeof PluginHost> = {
  title: "Core/PluginHostStress",
  component: PluginHost,
  args: { tasks: USER_VAULT, width: 1396, height: 822 },
  parameters: { layout: "fullscreen", a11y: { test: "off" } },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** The plugin-hosted timeline at 1396x822, for manual checks. */
export const Default: Story = {};

const stressStory = (runs: ScenarioRun[]): Story => ({
  render: () => <div data-testid="stress-stage" />,
  play: async ({ canvasElement }) => {
    const stage = canvasElement.querySelector<HTMLElement>(
      '[data-testid="stress-stage"]',
    );
    if (!stage) {
      throw new Error("PluginHostStress: stress stage missing");
    }
    await runAll(stage, runs);
  },
});

export const ScriptedAt700: Story = stressStory(scriptedAt(700));
export const ScriptedAt822: Story = stressStory(scriptedAt(822));
export const ScriptedAt900: Story = stressStory(scriptedAt(900));
export const ScriptedAt922: Story = stressStory(scriptedAt(922));
export const ScriptedAt1000: Story = stressStory(scriptedAt(1000));
export const ScriptedAt1080: Story = stressStory(scriptedAt(1080));
export const RandomSeed1Wide: Story = stressStory(randomAt(1, 1396));
export const RandomSeed1Narrow: Story = stressStory(randomAt(1, 420));
export const RandomSeed2Wide: Story = stressStory(randomAt(2, 1396));
export const RandomSeed2Narrow: Story = stressStory(randomAt(2, 420));
