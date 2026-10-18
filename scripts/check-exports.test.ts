import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkExports } from "./check-exports";

let root: string;

const write = (relativePath: string, content = "") => {
  const file = path.join(root, relativePath);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
};

const writePackage = (fields: Record<string, unknown>) =>
  write(
    "package.json",
    JSON.stringify({ name: "pkg", version: "1.0.0", ...fields }),
  );

const targetsOf = (problems: ReturnType<typeof checkExports>) =>
  problems.map(({ entry, target }) => `${entry} -> ${target}`);

beforeEach(() => {
  root = mkdtempSync(path.join(os.tmpdir(), "check-exports-"));
  write("dist/index.js");
  write("dist/index.umd.cjs");
  write("dist/index.d.ts");
  write("dist/index.css");
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("checkExports", () => {
  it("accepts subpaths whose every condition points at an existing file", () => {
    write("dist/hooks/index.d.ts");
    write("dist/hooks/index.js");
    write("dist/hooks/index.cjs");
    writePackage({
      main: "./dist/index.umd.cjs",
      module: "./dist/index.js",
      types: "./dist/index.d.ts",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          import: "./dist/index.js",
          require: "./dist/index.umd.cjs",
        },
        "./hooks": {
          types: "./dist/hooks/index.d.ts",
          import: "./dist/hooks/index.js",
          require: "./dist/hooks/index.cjs",
        },
        "./index.css": "./dist/index.css",
      },
    });

    expect(checkExports(root)).toEqual([]);
  });

  it("flags runtime targets that were never built, even when the .d.ts exists", () => {
    write("dist/components/index.d.ts");
    writePackage({
      exports: {
        ".": "./dist/index.js",
        "./components": {
          types: "./dist/components/index.d.ts",
          import: "./dist/components/index.js",
          require: "./dist/components/index.umd.cjs",
        },
      },
    });

    const problems = checkExports(root);

    expect(targetsOf(problems)).toEqual([
      'exports["./components"].import -> ./dist/components/index.js',
      'exports["./components"].require -> ./dist/components/index.umd.cjs',
    ]);
    expect(problems[0].reason).toMatch(/does not exist/);
  });

  it("walks nested conditions and fallback arrays", () => {
    writePackage({
      exports: {
        ".": {
          node: { import: "./dist/node.js", default: "./dist/index.js" },
          default: ["./dist/missing.js", "./dist/index.js"],
        },
      },
    });

    expect(targetsOf(checkExports(root))).toEqual([
      'exports["."].node.import -> ./dist/node.js',
      'exports["."].default[0] -> ./dist/missing.js',
    ]);
  });

  it("treats a string or bare conditions object as the root subpath", () => {
    writePackage({ exports: "./dist/gone.js" });
    expect(targetsOf(checkExports(root))).toEqual([
      'exports["."] -> ./dist/gone.js',
    ]);

    writePackage({
      exports: { import: "./dist/index.js", require: "./x.cjs" },
    });
    expect(targetsOf(checkExports(root))).toEqual([
      'exports["."].require -> ./x.cjs',
    ]);
  });

  it("allows null to block a subpath", () => {
    writePackage({
      exports: { ".": "./dist/index.js", "./internal/*": null },
    });

    expect(checkExports(root)).toEqual([]);
  });

  it("checks the legacy main, module and types fields", () => {
    writePackage({
      main: "./dist/index.cjs",
      module: "./dist/index.js",
      types: "dist/index.d.ts",
      exports: { ".": "./dist/index.js" },
    });

    expect(targetsOf(checkExports(root))).toEqual(["main -> ./dist/index.cjs"]);
  });

  it("flags targets that do not start with ./, leave the package or are directories", () => {
    mkdirSync(path.join(root, "dist", "hooks"), { recursive: true });
    writePackage({
      exports: {
        ".": "dist/index.js",
        "./up": "./../outside.js",
        "./dir": "./dist/hooks",
      },
    });

    const problems = checkExports(root);

    expect(targetsOf(problems)).toEqual([
      'exports["."] -> dist/index.js',
      'exports["./up"] -> ./../outside.js',
      'exports["./dir"] -> ./dist/hooks',
    ]);
    expect(problems.map(({ reason }) => reason)).toEqual([
      expect.stringMatching(/must start with "\.\/"/),
      expect.stringMatching(/outside the package/),
      expect.stringMatching(/not a file/),
    ]);
  });

  it("throws on subpath patterns instead of skipping them", () => {
    writePackage({ exports: { "./icons/*": "./dist/icons/*.js" } });

    expect(() => checkExports(root)).toThrow(/pattern/);
  });

  it("throws when subpath keys and condition keys are mixed", () => {
    writePackage({ exports: { ".": "./dist/index.js", import: "./x.js" } });

    expect(() => checkExports(root)).toThrow(/mixes subpath keys/);
  });

  it("throws when package.json has no exports field", () => {
    writePackage({ main: "./dist/index.js" });

    expect(() => checkExports(root)).toThrow(/no "exports" field/);
  });

  it("throws when there is no package.json", () => {
    expect(() => checkExports(path.join(root, "nope"))).toThrow(
      /package\.json/,
    );
  });
});
