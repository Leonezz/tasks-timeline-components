import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkDeclarations } from "./check-declarations";

let root: string;
let dist: string;

const write = (relativePath: string, content: string) => {
  const file = path.join(root, relativePath);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
};

const specifiersOf = (problems: ReturnType<typeof checkDeclarations>) =>
  problems.map(({ file, specifier }) => `${file} -> ${specifier}`);

beforeEach(() => {
  root = mkdtempSync(path.join(os.tmpdir(), "check-declarations-"));
  dist = path.join(root, "dist");
  write("dist/types.d.ts", "export interface Task { id: string }\n");
  write("dist/components/index.d.ts", 'export * from "./TaskItem.js";\n');
  write(
    "dist/components/TaskItem.d.ts",
    'import type { Task } from "../types.js";\nexport declare const TaskItem: (task: Task) => import("react/jsx-runtime").JSX.Element;\n',
  );
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("checkDeclarations", () => {
  it("accepts relative, package and import() specifiers that resolve inside dist", () => {
    write(
      "dist/index.d.ts",
      [
        'export * from "./components/index.js";',
        'export type { Task } from "./types.js";',
        'import type { ReactNode } from "react";',
        'import type { JSX } from "react/jsx-runtime";',
        'export type Alias = import("./types.js").Task;',
        "export type Node = ReactNode;",
        "export type Element = JSX.Element;",
        "",
      ].join("\n"),
    );

    expect(checkDeclarations(dist)).toEqual([]);
  });

  it("flags relative specifiers without an extension, which node16/nodenext consumers can't resolve", () => {
    write(
      "dist/types/index.d.ts",
      'export type { Task } from "../types.js";\n',
    );
    write(
      "dist/index.d.ts",
      [
        'export * from "./components/index";',
        'export * from "./components";',
        'export type { Task } from "./types";',
        'export type Alias = import("./types").Task;',
        'import Types = require("./types");',
        "export type Again = Types.Task;",
        "",
      ].join("\n"),
    );
    write(
      "dist/components/settings/index.d.ts",
      'import type { Task } from "../../types";\nexport type T = Task;\nexport * from "..";\n',
    );
    write(
      "dist/components/augment.d.ts",
      'declare module "./TaskItem" {\n  interface Extra { x: 1 }\n}\nexport {};\n',
    );

    const problems = checkDeclarations(dist);
    const suggestions = problems.map(({ file, specifier, reason }) => [
      file,
      specifier,
      reason.match(/use "([^"]+)"/)?.[1],
    ]);

    expect(suggestions).toEqual([
      [path.join("components", "augment.d.ts"), "./TaskItem", "./TaskItem.js"],
      [
        path.join("components", "settings", "index.d.ts"),
        "../../types",
        "../../types.js",
      ],
      [path.join("components", "settings", "index.d.ts"), "..", "../index.js"],
      ["index.d.ts", "./components/index", "./components/index.js"],
      ["index.d.ts", "./components", "./components/index.js"],
      // types.d.ts wins over types/index.d.ts, as it does for tsc
      ["index.d.ts", "./types", "./types.js"],
      ["index.d.ts", "./types", "./types.js"],
      ["index.d.ts", "./types", "./types.js"],
    ]);
    expect(problems[0].reason).toMatch(/node16|nodenext/);
  });

  it('flags the "@/" path alias', () => {
    write(
      "dist/components/settings/ThemeSection.d.ts",
      'import type { Task } from "@/types";\nexport type T = Task;\n',
    );

    expect(specifiersOf(checkDeclarations(dist))).toEqual([
      path.join("components", "settings", "ThemeSection.d.ts") + " -> @/types",
    ]);
  });

  it("flags stylesheet re-exports and side-effect imports", () => {
    write(
      "dist/index.d.ts",
      'export * from "./index.css";\nimport "./theme.css?inline";\nexport {};\n',
    );
    write("dist/index.css", "");

    expect(specifiersOf(checkDeclarations(dist))).toEqual([
      "index.d.ts -> ./index.css",
      "index.d.ts -> ./theme.css?inline",
    ]);
  });

  it("flags relative paths that leave dist, even when the target exists", () => {
    write("vite-env.d.ts", "declare const __APP_VERSION__: string;\n");
    write(
      "dist/components/settings/SettingsPage.d.ts",
      'import "../../../vite-env.d.ts";\nexport {};\n',
    );

    const problems = checkDeclarations(dist);

    expect(specifiersOf(problems)).toEqual([
      path.join("components", "settings", "SettingsPage.d.ts") +
        " -> ../../../vite-env.d.ts",
    ]);
    expect(problems[0].reason).toMatch(/outside dist/);
  });

  it("flags relative paths with no declaration file behind them", () => {
    write(
      "dist/index.d.ts",
      'export * from "./missing.js";\nexport * from "./gone";\n',
    );

    const problems = checkDeclarations(dist);

    expect(specifiersOf(problems)).toEqual([
      "index.d.ts -> ./missing.js",
      "index.d.ts -> ./gone",
    ]);
    expect(problems.map(({ reason }) => reason)).toEqual([
      expect.stringMatching(/does not resolve/),
      expect.stringMatching(/does not resolve/),
    ]);
  });

  it("checks /// <reference path> directives", () => {
    write("outside.d.ts", "declare const OUTSIDE: string;\n");
    write(
      "dist/index.d.ts",
      '/// <reference path="./types.d.ts" />\n/// <reference path="../outside.d.ts" />\nexport {};\n',
    );

    expect(specifiersOf(checkDeclarations(dist))).toEqual([
      "index.d.ts -> ../outside.d.ts",
    ]);
  });

  it("ignores specifiers inside comments", () => {
    write(
      "dist/index.d.ts",
      '/** @example import { x } from "@/types"; import "./index.css"; */\nexport declare const x: 1;\n',
    );

    expect(checkDeclarations(dist)).toEqual([]);
  });

  it("throws when the directory does not exist", () => {
    expect(() => checkDeclarations(path.join(root, "nope"))).toThrow(
      /not a directory/,
    );
  });

  it("throws when the directory holds no declaration files", () => {
    const empty = path.join(root, "empty");
    mkdirSync(empty);

    expect(() => checkDeclarations(empty)).toThrow(/No \.d\.ts files/);
  });
});
