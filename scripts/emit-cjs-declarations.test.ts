import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { emitCjsDeclarations } from "./emit-cjs-declarations";

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

const writePackage = (
  name: string,
  fields: Record<string, unknown>,
  declaration = "export interface Thing { id: string }\n",
) => {
  write(
    `node_modules/${name}/package.json`,
    JSON.stringify({ name, version: "1.0.0", ...fields }),
  );
  write(`node_modules/${name}/index.d.ts`, declaration);
};

beforeEach(() => {
  root = mkdtempSync(path.join(os.tmpdir(), "emit-cjs-declarations-"));
  dist = path.join(root, "dist");
  // The package is "type": "module", so dist/**/*.d.ts are ES modules
  write(
    "package.json",
    JSON.stringify({ name: "pkg", version: "1.0.0", type: "module" }),
  );
  writePackage("cjs-package", { types: "index.d.ts" });
  writePackage("esm-only", { type: "module", types: "index.d.ts" });
  writePackage("import-only", {
    exports: { ".": { import: { types: "./index.d.ts" } } },
  });
  write("dist/types.d.ts", "export interface Task { id: string }\n");
  write("dist/types/index.d.ts", 'export type { Task } from "../types.js";\n');
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("emitCjsDeclarations", () => {
  it("writes a .d.cts twin of every .d.ts whose relative specifiers name the twins", () => {
    write(
      "dist/components/index.d.ts",
      lines(
        'import type { Task } from "../types.js";',
        'import Types = require("../types/index.js");',
        'import type { Thing } from "cjs-package";',
        'export * from "./TaskItem.js";',
        'export type Alias = import("../types.js").Task | Types.Task | Thing;',
        'declare module "./TaskItem.js" {',
        "  interface Extra { task: Task }",
        "}",
        "//# sourceMappingURL=index.d.ts.map",
      ).trimEnd(),
    );
    write(
      "dist/components/TaskItem.d.ts",
      "export declare const TaskItem: () => null;\n",
    );

    const twins = emitCjsDeclarations(dist);

    expect(twins.map(({ file }) => file)).toEqual([
      path.join("components", "TaskItem.d.cts"),
      path.join("components", "index.d.cts"),
      "types.d.cts",
      path.join("types", "index.d.cts"),
    ]);
    expect(read("dist/components/index.d.cts")).toBe(
      lines(
        'import type { Task } from "../types.cjs";',
        'import Types = require("../types/index.cjs");',
        'import type { Thing } from "cjs-package";',
        'export * from "./TaskItem.cjs";',
        'export type Alias = import("../types.cjs").Task | Types.Task | Thing;',
        'declare module "./TaskItem.cjs" {',
        "  interface Extra { task: Task }",
        "}",
      ),
    );
    expect(read("dist/types/index.d.cts")).toBe(
      'export type { Task } from "../types.cjs";\n',
    );
    expect(read("dist/types.d.cts")).toBe(read("dist/types.d.ts"));
    // The .d.ts files are left alone
    expect(read("dist/types/index.d.ts")).toBe(
      'export type { Task } from "../types.js";\n',
    );
  });

  it('marks type-only imports of packages that only resolve to an ES module with "resolution-mode": "import"', () => {
    write(
      "dist/index.d.ts",
      lines(
        'import type { Thing } from "esm-only";',
        'export type { Thing as Other } from "import-only";',
        'export type Lazy = import("esm-only").Thing;',
        'import type { Thing as Kept } from "esm-only" with { "resolution-mode": "import" };',
        "export type Both = Thing | Kept;",
      ),
    );

    const twins = emitCjsDeclarations(dist);

    expect(read("dist/index.d.cts")).toBe(
      lines(
        'import type { Thing } from "esm-only" with { "resolution-mode": "import" };',
        'export type { Thing as Other } from "import-only" with { "resolution-mode": "import" };',
        'export type Lazy = import("esm-only", { with: { "resolution-mode": "import" } }).Thing;',
        'import type { Thing as Kept } from "esm-only" with { "resolution-mode": "import" };',
        "export type Both = Thing | Kept;",
      ),
    );
    expect(twins.find(({ file }) => file === "index.d.cts")).toEqual({
      file: "index.d.cts",
      esmOnlyImports: ["esm-only", "import-only", "esm-only"],
    });
  });

  it("throws on value imports of packages that only resolve to an ES module, and writes nothing", () => {
    write(
      "dist/index.d.ts",
      lines(
        'import { type Thing } from "esm-only";',
        'import * as Esm from "esm-only";',
        'import Required = require("import-only");',
        'export { Thing as Again } from "esm-only";',
        "export type T = Thing | Esm.Thing | Required.Thing;",
      ),
    );

    expect(() => emitCjsDeclarations(dist)).toThrow(
      /4 problem\(s\)[\s\S]*index\.d\.ts: "esm-only" only resolves to an ES module[\s\S]*import type/,
    );
    expect(existsSync(path.join(dist, "index.d.cts"))).toBe(false);
    expect(existsSync(path.join(dist, "types.d.cts"))).toBe(false);
  });

  it("throws on relative specifiers it can't mirror, and writes nothing", () => {
    write(
      "dist/index.d.ts",
      lines(
        'export * from "./types";',
        'export * from "./types.mjs";',
        'export * from "./missing.js";',
        'export * from "../outside.js";',
      ),
    );
    write("outside.d.ts", "export {};\n");

    expect(() => emitCjsDeclarations(dist)).toThrow(
      /4 problem\(s\)[\s\S]*"\.\/types" does not end in \.js[\s\S]*rewrite-declaration-specifiers[\s\S]*"\.\/types\.mjs" does not end in \.js[\s\S]*"\.\/missing\.js" has no \.d\.ts[\s\S]*"\.\.\/outside\.js" has no \.d\.ts/,
    );
    expect(existsSync(path.join(dist, "types.d.cts"))).toBe(false);
  });

  it("throws on package specifiers that resolve to no declarations", () => {
    write(
      "dist/index.d.ts",
      'import type { X } from "not-installed";\nexport type Y = X;\n',
    );

    expect(() => emitCjsDeclarations(dist)).toThrow(
      /"not-installed" resolves to no type declarations/,
    );
  });

  it("throws on /// <reference path> directives instead of leaving them pointing at ES modules", () => {
    write(
      "dist/index.d.ts",
      '/// <reference path="./types.d.ts" />\nexport {};\n',
    );

    expect(() => emitCjsDeclarations(dist)).toThrow(
      /reference path="\.\/types\.d\.ts"/,
    );
  });

  it("throws when the directory does not exist", () => {
    expect(() => emitCjsDeclarations(path.join(root, "nope"))).toThrow(
      /not a directory/,
    );
  });

  it("throws when the directory holds no declaration files", () => {
    const empty = path.join(root, "empty");
    mkdirSync(empty);

    expect(() => emitCjsDeclarations(empty)).toThrow(/No \.d\.ts files/);
  });
});
