import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { rewriteDeclarationSpecifiers } from "./rewrite-declaration-specifiers";

let root: string;
let dist: string;

const write = (relativePath: string, content: string) => {
  const file = path.join(root, relativePath);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
};

const read = (relativePath: string) =>
  readFileSync(path.join(root, relativePath), "utf8");

const lines = (...content: string[]) => [...content, ""].join("\n");

beforeEach(() => {
  root = mkdtempSync(path.join(os.tmpdir(), "rewrite-declaration-specifiers-"));
  dist = path.join(root, "dist");
  // Declarations as tsc emits them from extensionless source imports
  write("dist/types.d.ts", "export interface Task { id: string }\n");
  write("dist/types/index.d.ts", 'export type { Task } from "../types";\n');
  write(
    "dist/components/TaskItem.d.ts",
    'import type { Task } from "../types";\nexport declare const TaskItem: (task: Task) => import("react/jsx-runtime").JSX.Element;\n',
  );
  write(
    "dist/components/settings/index.d.ts",
    "export declare function SettingsModal(): null;\n",
  );
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("rewriteDeclarationSpecifiers", () => {
  it("adds .js to file specifiers and /index.js to directory specifiers", () => {
    write(
      "dist/components/index.d.ts",
      lines(
        'export { TaskItem } from "./TaskItem";',
        'export * from "./settings";',
        'export * from "./settings/index";',
        "//# sourceMappingURL=index.d.ts.map",
      ),
    );

    rewriteDeclarationSpecifiers(dist);

    expect(read("dist/components/index.d.ts")).toBe(
      lines(
        'export { TaskItem } from "./TaskItem.js";',
        'export * from "./settings/index.js";',
        'export * from "./settings/index.js";',
        "//# sourceMappingURL=index.d.ts.map",
      ),
    );
    expect(read("dist/components/TaskItem.d.ts")).toBe(
      'import type { Task } from "../types.js";\nexport declare const TaskItem: (task: Task) => import("react/jsx-runtime").JSX.Element;\n',
    );
  });

  it("prefers the file over the directory when both exist, as tsc does", () => {
    write("dist/index.d.ts", 'export type { Task } from "./types";\n');

    rewriteDeclarationSpecifiers(dist);

    expect(read("dist/index.d.ts")).toBe(
      'export type { Task } from "./types.js";\n',
    );
    expect(read("dist/types/index.d.ts")).toBe(
      'export type { Task } from "../types.js";\n',
    );
  });

  it("rewrites import() types, import = require() and module augmentations", () => {
    write(
      "dist/components/extra.d.ts",
      lines(
        "import Types = require('../types');",
        'export type Alias = import("../types").Task | import("./TaskItem").TaskItemProps;',
        'declare module "./settings" {',
        "  interface Extra {}",
        "}",
        "export type Again = Types.Task;",
      ),
    );

    rewriteDeclarationSpecifiers(dist);

    expect(read("dist/components/extra.d.ts")).toBe(
      lines(
        "import Types = require('../types.js');",
        'export type Alias = import("../types.js").Task | import("./TaskItem.js").TaskItemProps;',
        'declare module "./settings/index.js" {',
        "  interface Extra {}",
        "}",
        "export type Again = Types.Task;",
      ),
    );
  });

  it('resolves "." and ".." as directories', () => {
    write("dist/components/index.d.ts", "export {};\n");
    write(
      "dist/components/settings/Page.d.ts",
      lines(
        'export * from "..";',
        'export * from "../";',
        'export * from ".";',
      ),
    );

    rewriteDeclarationSpecifiers(dist);

    expect(read("dist/components/settings/Page.d.ts")).toBe(
      lines(
        'export * from "../index.js";',
        'export * from "../index.js";',
        'export * from "./index.js";',
      ),
    );
  });

  it("leaves package specifiers, specifiers with an extension and comments alone", () => {
    const content = lines(
      '/** @example import { x } from "./TaskItem"; */',
      'import type { ReactNode } from "react";',
      'import type { JSX } from "react/jsx-runtime";',
      'export type { Task } from "./types.js";',
      'export * from "./components/settings/index.js";',
      "export type Node = ReactNode | JSX.Element;",
    );
    write("dist/index.d.ts", content);

    rewriteDeclarationSpecifiers(dist);

    expect(read("dist/index.d.ts")).toBe(content);
  });

  it("returns every rewrite and is a no-op on its own output", () => {
    write(
      "dist/components/index.d.ts",
      'export * from "./TaskItem";\nexport * from "./settings";\n',
    );

    const rewrites = rewriteDeclarationSpecifiers(dist);

    expect(rewrites).toEqual([
      {
        file: path.join("components", "TaskItem.d.ts"),
        from: "../types",
        to: "../types.js",
      },
      {
        file: path.join("components", "index.d.ts"),
        from: "./TaskItem",
        to: "./TaskItem.js",
      },
      {
        file: path.join("components", "index.d.ts"),
        from: "./settings",
        to: "./settings/index.js",
      },
      {
        file: path.join("types", "index.d.ts"),
        from: "../types",
        to: "../types.js",
      },
    ]);

    const before = read("dist/components/index.d.ts");
    expect(rewriteDeclarationSpecifiers(dist)).toEqual([]);
    expect(read("dist/components/index.d.ts")).toBe(before);
  });

  it("throws on unresolvable specifiers and writes nothing", () => {
    write(
      "dist/index.d.ts",
      lines(
        'export * from "./components/TaskItem";',
        'export * from "./missing";',
        'export * from "../outside";',
      ),
    );
    write("outside.d.ts", "export {};\n");

    expect(() => rewriteDeclarationSpecifiers(dist)).toThrow(
      /2 relative specifier\(s\)[\s\S]*index\.d\.ts: "\.\/missing"[\s\S]*index\.d\.ts: "\.\.\/outside"/,
    );
    expect(read("dist/index.d.ts")).toContain('"./components/TaskItem";');
    expect(read("dist/components/TaskItem.d.ts")).toContain('"../types";');
  });

  it("throws when the directory does not exist", () => {
    expect(() => rewriteDeclarationSpecifiers(path.join(root, "nope"))).toThrow(
      /not a directory/,
    );
  });

  it("throws when the directory holds no declaration files", () => {
    const empty = path.join(root, "empty");
    mkdirSync(empty);

    expect(() => rewriteDeclarationSpecifiers(empty)).toThrow(
      /No \.d\.ts files/,
    );
  });
});
