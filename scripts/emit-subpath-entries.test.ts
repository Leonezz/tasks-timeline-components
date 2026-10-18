import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { emitSubpathEntries } from "./emit-subpath-entries";

let root: string;
let dist: string;

const write = (relativePath: string, content: string) => {
  const file = path.join(root, relativePath);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
};

const read = (relativePath: string) =>
  readFileSync(path.join(root, relativePath), "utf8");

const emit = (subpaths: string[]) =>
  emitSubpathEntries({ distDir: dist, packageName: "pkg", subpaths });

const importDist = (relativePath: string) =>
  import(pathToFileURL(path.join(dist, relativePath)).href);

const requireDist = (relativePath: string) =>
  createRequire(import.meta.url)(path.join(dist, relativePath));

beforeEach(() => {
  root = mkdtempSync(path.join(os.tmpdir(), "emit-subpath-entries-"));
  dist = path.join(root, "dist");
  write("package.json", JSON.stringify({ name: "pkg", type: "module" }));

  // Declarations, as tsc emits them
  write("dist/types.d.ts", "export interface Task { id: string }\n");
  write("dist/types/index.d.ts", 'export type { Task } from "../types";\n');
  write(
    "dist/components/TaskItem.d.ts",
    "export interface TaskItemProps { id: string }\nexport declare const TaskItem: (props: TaskItemProps) => null;\n",
  );
  write(
    "dist/components/settings/index.d.ts",
    "export declare function SettingsModal(): null;\nexport interface SettingsProps { open: boolean }\nexport declare class SettingsStore {}\n",
  );
  write(
    "dist/components/index.d.ts",
    [
      'export { TaskItem } from "./TaskItem";',
      'export type { TaskItemProps } from "./TaskItem";',
      'export * from "./settings/index";',
      "",
    ].join("\n"),
  );
  write(
    "dist/hooks/index.d.ts",
    [
      "export declare const useStats: () => number;",
      'export { type SettingsStore as Store } from "../components/settings/index";',
      "",
    ].join("\n"),
  );

  // The main bundle, as Vite emits it
  write(
    "dist/index.js",
    [
      "const TaskItem = { component: 'TaskItem' };",
      "function SettingsModal() { return null; }",
      "class SettingsStore {}",
      "export const useStats = () => 1;",
      "export { TaskItem, SettingsModal, SettingsStore };",
      "",
    ].join("\n"),
  );
  write(
    "dist/index.umd.cjs",
    [
      '"use strict";',
      "exports.TaskItem = { component: 'TaskItem' };",
      "exports.SettingsModal = function SettingsModal() { return null; };",
      "exports.SettingsStore = class SettingsStore {};",
      "exports.useStats = () => 1;",
      "",
    ].join("\n"),
  );
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("emitSubpathEntries", () => {
  it("re-exports only the runtime exports of each subpath's declarations", () => {
    expect(emit(["components", "hooks", "types"])).toEqual([
      {
        subpath: "components",
        names: ["SettingsModal", "SettingsStore", "TaskItem"],
      },
      { subpath: "hooks", names: ["useStats"] },
      { subpath: "types", names: [] },
    ]);
  });

  it("serves ESM from the main bundle's module instance", async () => {
    emit(["components", "hooks"]);

    const main = await importDist("index.js");
    const components = await importDist("components/index.js");
    const hooks = await importDist("hooks/index.js");

    expect(Object.keys(components).sort()).toEqual([
      "SettingsModal",
      "SettingsStore",
      "TaskItem",
    ]);
    expect(components.TaskItem).toBe(main.TaskItem);
    expect(Object.keys(hooks)).toEqual(["useStats"]);
    expect(hooks.useStats).toBe(main.useStats);
  });

  it("serves CommonJS from the main UMD bundle", () => {
    emit(["components", "hooks"]);

    const main = requireDist("index.umd.cjs");
    const components = requireDist("components/index.cjs");

    expect(components.TaskItem).toBe(main.TaskItem);
    expect(components.SettingsModal).toBe(main.SettingsModal);
    expect(components).not.toHaveProperty("useStats");
    expect(requireDist("hooks/index.cjs").useStats).toBe(main.useStats);
  });

  it("emits empty modules that never load the main bundle for a types-only subpath", async () => {
    emit(["types"]);

    expect(read("dist/types/index.js")).not.toContain("index");
    expect(read("dist/types/index.cjs")).not.toContain("index");
    expect(Object.keys(await importDist("types/index.js"))).toEqual([]);
    expect(Object.keys(requireDist("types/index.cjs"))).toEqual([]);
  });

  it("throws when a subpath exports a value the main bundle does not", () => {
    write(
      "dist/hooks/index.d.ts",
      "export declare const useStats: () => number;\nexport declare const useMissing: () => void;\n",
    );

    expect(() => emit(["hooks"])).toThrow(
      /\.\/hooks.*"useMissing".*dist[\\/]index\.js/,
    );
  });

  it("makes the CommonJS entry throw on load when the UMD bundle lacks a name", () => {
    emit(["components"]);
    write(
      "dist/index.umd.cjs",
      '"use strict";\nexports.TaskItem = {};\nexports.SettingsStore = class {};\n',
    );

    expect(() => requireDist("components/index.cjs")).toThrow(
      /pkg\/components.*"SettingsModal"/,
    );
  });

  it("throws when a subpath has no declaration file", () => {
    expect(() => emit(["missing"])).toThrow(/missing[\\/]index\.d\.ts/);
  });

  it("throws when the main bundle cannot be listed statically", () => {
    write("dist/index.js", 'export * from "./chunk.js";\n');

    expect(() => emit(["hooks"])).toThrow(/export \*/);
  });
});
