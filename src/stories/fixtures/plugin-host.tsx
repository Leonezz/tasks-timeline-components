import React, { Profiler, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Task } from "../../types";
import { PluginApp } from "./PluginApp";

/**
 * Mounts TasksTimelineApp the way the Obsidian plugin does: in its own React
 * root under StrictMode, inside an open shadow root whose host is the
 * scrolling pane (see PluginApp for the settings, title renderer and task
 * loading).
 *
 * A RenderMonitor watches the mounted app for runaway rendering: commits
 * per animation frame (Profiler), lazy-chunk placeholder flips per marker
 * per frame (the visible output of useLazyChunks' state), and every error
 * React reports or logs.
 */

const isReactProblem = (text: string) =>
  /Maximum update depth|The above error occurred|Too many re-renders|error boundary|Uncaught/i.test(
    text,
  );

const describe = (value: unknown) =>
  value instanceof Error ? `${value.name}: ${value.message}` : String(value);

export class RenderMonitor {
  readonly errors: string[] = [];
  maxCommitsPerFrame = 0;
  maxFlipsPerFrame = 0;
  private commitsThisFrame = 0;
  private flipsThisFrame = new Map<Node, number>();
  private frame = 0;
  private observer: MutationObserver | null = null;
  private restoreConsole: (() => void) | null = null;

  onCommit: React.ProfilerOnRenderCallback = () => {
    this.commitsThisFrame++;
    this.maxCommitsPerFrame = Math.max(
      this.maxCommitsPerFrame,
      this.commitsThisFrame,
    );
  };

  onReactError = (error: unknown) => {
    this.errors.push(describe(error));
  };

  start(shadowRoot: ShadowRoot) {
    const tick = () => {
      this.commitsThisFrame = 0;
      this.flipsThisFrame = new Map();
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);

    this.observer = new MutationObserver((records) => {
      for (const record of records) {
        const flips = (this.flipsThisFrame.get(record.target) ?? 0) + 1;
        this.flipsThisFrame.set(record.target, flips);
        this.maxFlipsPerFrame = Math.max(this.maxFlipsPerFrame, flips);
      }
    });
    this.observer.observe(shadowRoot, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-lazy-placeholder"],
    });

    const original = console.error;
    console.error = (...args: unknown[]) => {
      const text = args.map(describe).join(" ");
      if (isReactProblem(text)) {
        this.errors.push(text.slice(0, 500));
      }
      original(...args);
    };
    this.restoreConsole = () => {
      console.error = original;
    };
  }

  stop() {
    cancelAnimationFrame(this.frame);
    this.observer?.disconnect();
    this.restoreConsole?.();
  }
}

export interface MountedPluginApp {
  /** The scrolling pane (`.view-content` in Obsidian); hosts the shadow root. */
  host: HTMLDivElement;
  shadowRoot: ShadowRoot;
  monitor: RenderMonitor;
  unmount: () => void;
}

/**
 * Appends a `width` x `height` scrolling pane to `stage` and mounts the app
 * in an open shadow root on it, as the plugin's view does.
 */
export const mountPluginApp = (
  stage: HTMLElement,
  { tasks, width, height }: { tasks: Task[]; width: number; height: number },
): MountedPluginApp => {
  const host = document.createElement("div");
  host.dataset.testid = "plugin-host";
  Object.assign(host.style, {
    width: `${width}px`,
    height: `${height}px`,
    overflowY: "auto",
    padding: "16px 32px",
    boxSizing: "border-box",
    position: "relative",
  });
  stage.appendChild(host);
  const shadowRoot = host.attachShadow({ mode: "open" }),
    rootEl = document.createElement("div"),
    monitor = new RenderMonitor();
  rootEl.className = "tasks-timeline-app";
  shadowRoot.appendChild(rootEl);
  monitor.start(shadowRoot);
  const root: Root = createRoot(rootEl, {
    onCaughtError: monitor.onReactError,
    onUncaughtError: monitor.onReactError,
    onRecoverableError: monitor.onReactError,
  });
  root.render(
    <StrictMode>
      <Profiler id="plugin-host" onRender={monitor.onCommit}>
        <PluginApp tasks={tasks} />
      </Profiler>
    </StrictMode>,
  );
  return {
    host,
    shadowRoot,
    monitor,
    unmount: () => {
      monitor.stop();
      root.unmount();
      host.remove();
    },
  };
};
