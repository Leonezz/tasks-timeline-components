import type { Task } from "../../types";
import { mountPluginApp, type MountedPluginApp } from "./plugin-host";

/**
 * Drives the plugin-hosted app (see plugin-host.tsx) through user actions
 * and reports every runaway render or React error, per step.
 */

export type CardLabel = "To Do" | "Unplanned" | "Due & OD" | "Doing";
export const CARD_LABELS: CardLabel[] = [
  "To Do",
  "Unplanned",
  "Due & OD",
  "Doing",
];

export type Action =
  | { kind: "scrollTo"; fraction: number }
  | { kind: "scrollBy"; px: number }
  | { kind: "focus" }
  | { kind: "backlog" }
  | { kind: "card"; label: CardLabel };

export const scrollTop: Action = { kind: "scrollTo", fraction: 0 };
export const scrollMiddle: Action = { kind: "scrollTo", fraction: 0.5 };
export const scrollBottom: Action = { kind: "scrollTo", fraction: 1 };
export const focus: Action = { kind: "focus" };
export const backlog: Action = { kind: "backlog" };
export const card = (label: CardLabel): Action => ({ kind: "card", label });

export const describeAction = (action: Action) => {
  switch (action.kind) {
    case "scrollTo":
      return `scroll to ${Math.round(action.fraction * 100)}%`;
    case "scrollBy":
      return `scroll by ${action.px}px`;
    case "focus":
      return "toggle focus";
    case "backlog":
      return "toggle backlog";
    case "card":
      return `card ${action.label}`;
  }
};

const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** `count` random actions from a fixed seed: scrolls, focus, cards, backlog. */
export const randomActions = (seed: number, count: number): Action[] => {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, (): Action => {
    const roll = rand();
    if (roll < 0.25) {
      return { kind: "scrollTo", fraction: Math.round(rand() * 100) / 100 };
    }
    if (roll < 0.45) {
      return { kind: "scrollBy", px: Math.round((rand() - 0.5) * 3000) };
    }
    if (roll < 0.6) {
      return focus;
    }
    if (roll < 0.8) {
      return backlog;
    }
    return card(CARD_LABELS[Math.floor(rand() * CARD_LABELS.length)]);
  });
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nextFrame = () => new Promise((r) => requestAnimationFrame(r));

/** Two frames, so observer callbacks and their renders have run. */
export const settle = async (ms: number) => {
  await nextFrame();
  await nextFrame();
  await sleep(ms);
  await nextFrame();
};

const query = <T extends Element>(app: MountedPluginApp, selector: string) =>
  app.shadowRoot.querySelector<T>(selector);

const findCard = (app: MountedPluginApp, label: CardLabel) =>
  [
    ...app.shadowRoot.querySelectorAll<HTMLButtonElement>(
      "button[aria-pressed]",
    ),
  ].find((button) => button.textContent?.trim().endsWith(label)) ?? null;

const crashed = (app: MountedPluginApp) =>
  app.shadowRoot.textContent?.includes("Something went wrong") ?? false;

export const perform = (app: MountedPluginApp, action: Action) => {
  const { host } = app;
  switch (action.kind) {
    case "scrollTo":
      host.scrollTop =
        (host.scrollHeight - host.clientHeight) * action.fraction;
      return;
    case "scrollBy":
      host.scrollTop += action.px;
      return;
    case "focus":
      query<HTMLButtonElement>(app, 'button[title$="Focus Mode"]')?.click();
      return;
    case "backlog":
      // Absent while a card hides every undated task, or in focus mode
      query<HTMLButtonElement>(
        app,
        '[data-backlog-section] button[aria-label*="backlog,"]',
      )?.click();
      return;
    case "card":
      findCard(app, action.label)?.click();
      return;
  }
};

export interface Limits {
  /** Most commits of the app allowed in one animation frame. */
  commitsPerFrame: number;
  /** Most placeholder flips of one lazy chunk allowed in one frame. */
  flipsPerFrame: number;
}

export interface ScenarioRun {
  label: string;
  tasks: Task[];
  width: number;
  height: number;
  actions: Action[];
  /** Wait after each action (ms), beyond two frames. */
  settleMs?: number;
}

export interface ScenarioResult {
  label: string;
  /** Empty when every step stayed within the limits. */
  failures: string[];
  maxCommitsPerFrame: number;
  maxFlipsPerFrame: number;
}

export const waitForTasks = async (app: MountedPluginApp) => {
  const deadline = performance.now() + 10000;
  while (performance.now() < deadline) {
    const unplanned = findCard(app, "Unplanned");
    if (unplanned && Number.parseInt(unplanned.textContent ?? "", 10) > 0) {
      await settle(200);
      return;
    }
    await sleep(25);
  }
  throw new Error("plugin host: the app never showed its tasks");
};

const checkStep = (
  app: MountedPluginApp,
  limits: Limits,
  where: string,
): string[] => {
  const { monitor } = app,
    failures = monitor.errors.map((error) => `${where}: ${error}`);
  if (crashed(app)) {
    failures.push(`${where}: the task list error boundary is showing`);
  }
  if (monitor.maxCommitsPerFrame > limits.commitsPerFrame) {
    failures.push(
      `${where}: ${monitor.maxCommitsPerFrame} commits in one frame (limit ${limits.commitsPerFrame})`,
    );
  }
  if (monitor.maxFlipsPerFrame > limits.flipsPerFrame) {
    failures.push(
      `${where}: a lazy chunk flipped ${monitor.maxFlipsPerFrame} times in one frame (limit ${limits.flipsPerFrame})`,
    );
  }
  return failures;
};

/** Mounts a fresh app, performs the actions, and unmounts it. */
export const runScenario = async (
  stage: HTMLElement,
  run: ScenarioRun,
  limits: Limits,
): Promise<ScenarioResult> => {
  const app = mountPluginApp(stage, run);
  try {
    await waitForTasks(app);
    const failures = checkStep(app, limits, `${run.label} @ mount`);
    for (const [i, action] of run.actions.entries()) {
      if (failures.length > 0) {
        break; // the first failure is the one worth reading
      }
      perform(app, action);
      await settle(run.settleMs ?? 120);
      failures.push(
        ...checkStep(
          app,
          limits,
          `${run.label} @ step ${i + 1} (${describeAction(action)})`,
        ),
      );
    }
    return {
      label: run.label,
      failures,
      maxCommitsPerFrame: app.monitor.maxCommitsPerFrame,
      maxFlipsPerFrame: app.monitor.maxFlipsPerFrame,
    };
  } finally {
    app.unmount();
  }
};
