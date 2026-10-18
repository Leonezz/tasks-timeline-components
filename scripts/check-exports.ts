/**
 * Post-build guard for the entry points declared in package.json.
 *
 * Every file that "exports" maps a subpath to must exist, or importing that
 * subpath fails for consumers with ERR_MODULE_NOT_FOUND or "Failed to resolve
 * entry". A type-check doesn't notice: the .d.ts can exist while the .js it
 * describes was never built, which is how ./components, ./hooks and ./types
 * shipped in 0.8.0 and 0.9.0. This walks every condition of every subpath,
 * plus the legacy main/module/types fields, and exits non-zero on any target
 * that is missing.
 *
 * It also resolves each subpath for import and for require(), with the
 * conditions Node ("node", "import"/"require", "default") and TypeScript
 * ("types" first) use, and fails when the declaration TypeScript picks has a
 * different module format from the file Node loads. The package is
 * `"type": "module"`, so a .d.ts is an ES module: shared by a CommonJS
 * "require" target, it makes `import x = require(...)` fail for
 * `"module": "node16"` consumers with TS1471 (nodenext on TS >= 5.8 allows
 * it). A mode a subpath doesn't export (require() of ./capabilities) is
 * skipped. Runs at the end of `pnpm build:lib`.
 *
 * Usage: tsx scripts/check-exports.ts [packageDir]   (default: .)
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export interface ExportsProblem {
  /** Where the target is declared, e.g. `exports["./hooks"].import` or `main` */
  entry: string;
  target: string;
  reason: string;
}

interface Target {
  entry: string;
  target: string;
  /** main/module/types, which Node doesn't require to start with "./" */
  legacy: boolean;
}

type Mode = "import" | "require";
type ModuleFormat = "esm" | "cjs";

interface Selected {
  entry: string;
  target: string;
}

const LEGACY_FIELDS = ["main", "module", "types"] as const;
const MODES: readonly Mode[] = ["import", "require"];
/** Conditions besides "default", which always matches */
const RUNTIME_CONDITIONS: Record<Mode, ReadonlySet<string>> = {
  import: new Set(["node", "import"]),
  require: new Set(["node", "require"]),
};
const TYPES_CONDITIONS: Record<Mode, ReadonlySet<string>> = {
  import: new Set(["types", "node", "import"]),
  require: new Set(["types", "node", "require"]),
};
/** The declaration file TypeScript looks for next to a JavaScript target */
const JS_TO_DECLARATION: [RegExp, string][] = [
  [/\.js$/, ".d.ts"],
  [/\.mjs$/, ".d.mts"],
  [/\.cjs$/, ".d.cts"],
];
const DECLARATION = /\.d\.[mc]?ts$/;

const isSubpathKey = (key: string) => key.startsWith(".");

const isInside = (dir: string, target: string) => {
  const relative = path.relative(dir, target);
  return (
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
};

/** Splits "exports" into [subpath, value] pairs, the way Node reads it. */
const subpathEntries = (exportsField: unknown): [string, unknown][] => {
  if (typeof exportsField === "string" || Array.isArray(exportsField)) {
    return [[".", exportsField]];
  }
  if (exportsField === null || typeof exportsField !== "object") {
    throw new Error(
      `"exports" must be a string, array or object, got ${exportsField === null ? "null" : typeof exportsField}`,
    );
  }
  const keys = Object.keys(exportsField);
  const subpathKeys = keys.filter(isSubpathKey);
  if (subpathKeys.length === 0) return [[".", exportsField]];
  if (subpathKeys.length !== keys.length) {
    const conditionKeys = keys.filter((key) => !isSubpathKey(key));
    throw new Error(
      `"exports" mixes subpath keys (${subpathKeys.join(", ")}) with condition keys (${conditionKeys.join(", ")}), which Node rejects`,
    );
  }
  return Object.entries(exportsField);
};

const collectTargets = (
  value: unknown,
  entry: string,
  subpath: string,
): Target[] => {
  if (value === null) return []; // blocks the subpath; nothing to resolve
  if (typeof value === "string") {
    if (subpath.includes("*")) {
      throw new Error(
        `${entry}: subpath pattern "${subpath}" is not supported by check-exports. Extend the script before adding patterns.`,
      );
    }
    return [{ entry, target: value, legacy: false }];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectTargets(item, `${entry}[${index}]`, subpath),
    );
  }
  if (typeof value === "object") {
    return Object.entries(value).flatMap(([condition, nested]) =>
      collectTargets(nested, `${entry}.${condition}`, subpath),
    );
  }
  throw new Error(
    `${entry}: expected a string, object, array or null, got ${typeof value}`,
  );
};

const findProblem = (
  packageDir: string,
  { target, legacy }: Target,
): string | null => {
  if (!legacy && !target.startsWith("./")) {
    return 'must start with "./", or Node rejects it';
  }
  const resolved = path.resolve(packageDir, target);
  if (!isInside(packageDir, resolved)) {
    return "points outside the package, which is not published";
  }
  if (!existsSync(resolved)) {
    return "does not exist. Does the build emit it?";
  }
  return statSync(resolved).isFile() ? null : "is not a file";
};

/**
 * The target Node or TypeScript picks for `conditions`: object keys in order,
 * "default" always matching. undefined when nothing matches, so the caller
 * moves on to the next key, as Node does; null when the subpath is blocked.
 * A fallback array resolves to its first entry, as in Node.
 */
const selectTarget = (
  value: unknown,
  conditions: ReadonlySet<string>,
  entry: string,
): Selected | null | undefined => {
  if (value === null) return null;
  if (typeof value === "string") return { entry, target: value };
  if (Array.isArray(value)) {
    return value.length === 0
      ? null
      : selectTarget(value[0], conditions, `${entry}[0]`);
  }
  if (typeof value !== "object") return undefined;
  for (const [condition, nested] of Object.entries(value)) {
    if (condition.startsWith("types@")) {
      throw new Error(
        `${entry}: versioned types condition "${condition}" is not supported by check-exports. Extend the script before adding one.`,
      );
    }
    if (condition !== "default" && !conditions.has(condition)) continue;
    const selected = selectTarget(nested, conditions, `${entry}.${condition}`);
    if (selected !== undefined) return selected;
  }
  return undefined;
};

/** A built file inside the package, or null when the target is invalid or missing (reported by findProblem). */
const existingFile = (packageDir: string, target: string): string | null => {
  if (!target.startsWith("./")) return null;
  const resolved = path.resolve(packageDir, target);
  return isInside(packageDir, resolved) &&
    existsSync(resolved) &&
    statSync(resolved).isFile()
    ? resolved
    : null;
};

/** "type" of the package.json nearest to `file`, as Node reads it for .js files. */
const packageTypeOf = (packageDir: string, file: string): unknown => {
  for (let dir = path.dirname(file); ; dir = path.dirname(dir)) {
    const packageJson = path.join(dir, "package.json");
    if (existsSync(packageJson)) {
      return (
        JSON.parse(readFileSync(packageJson, "utf8")) as { type?: unknown }
      ).type;
    }
    if (dir === packageDir || dir === path.dirname(dir)) return undefined;
  }
};

const formatOf = (packageDir: string, file: string): ModuleFormat | null => {
  if (/\.(d\.mts|mjs)$/.test(file)) return "esm";
  if (/\.(d\.cts|cjs)$/.test(file)) return "cjs";
  if (!/\.(d\.ts|js)$/.test(file)) return null;
  return packageTypeOf(packageDir, file) === "module" ? "esm" : "cjs";
};

const declarationOf = (target: string): string | null => {
  if (DECLARATION.test(target)) return target;
  const match = JS_TO_DECLARATION.find(([extension]) => extension.test(target));
  return match ? target.replace(match[0], match[1]) : null;
};

const FORMAT_NAMES: Record<ModuleFormat, string> = {
  esm: "an ES module",
  cjs: "a CommonJS",
};
const DECLARATION_FOR: Record<ModuleFormat, string> = {
  esm: 'a .d.mts file, or a .d.ts file in a "type": "module" package',
  cjs: "a .d.cts file",
};

/** The declaration TypeScript picks for each mode must have the format of the file Node loads. */
const findFormatProblems = (
  packageDir: string,
  subpath: string,
  value: unknown,
): ExportsProblem[] => {
  const label = `exports[${JSON.stringify(subpath)}]`;
  return MODES.flatMap((mode) => {
    const runtime = selectTarget(value, RUNTIME_CONDITIONS[mode], label);
    const types = selectTarget(value, TYPES_CONDITIONS[mode], label);
    // The subpath doesn't export this mode
    if (!runtime || !types) return [];
    const runtimeFile = existingFile(packageDir, runtime.target);
    const declaration = declarationOf(types.target);
    const declarationFile =
      declaration && existingFile(packageDir, declaration);
    // Missing targets are reported by findProblem; no .d.ts at all is not a format problem
    if (!runtimeFile || !declarationFile) return [];

    const runtimeFormat = formatOf(packageDir, runtimeFile);
    const typesFormat = formatOf(packageDir, declarationFile);
    if (!runtimeFormat || !typesFormat || runtimeFormat === typesFormat) {
      return [];
    }
    const call = mode === "require" ? "require()" : "import";
    const runtimeKind =
      runtimeFormat === "esm" ? "ES module" : "CommonJS module";
    const consequence =
      mode === "require" && typesFormat === "esm"
        ? ' ("module": "node16" consumers get TS1471)'
        : "";
    return [
      {
        entry: types.entry,
        target: types.target,
        reason: `is ${FORMAT_NAMES[typesFormat]} declaration, but it types ${call}, which loads the ${runtimeKind} "${runtime.target}"${consequence}. Give "${mode}" its own "types": ${DECLARATION_FOR[runtimeFormat]}`,
      },
    ];
  });
};

const readPackageJson = (packageDir: string): Record<string, unknown> => {
  const file = path.join(packageDir, "package.json");
  if (!existsSync(file)) {
    throw new Error(`${file} does not exist`);
  }
  return JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
};

export const checkExports = (packageDir: string): ExportsProblem[] => {
  const root = path.resolve(packageDir);
  const pkg = readPackageJson(root);
  if (pkg.exports === undefined) {
    throw new Error(
      `${path.join(root, "package.json")} has no "exports" field`,
    );
  }

  const subpaths = subpathEntries(pkg.exports);
  const exportTargets = subpaths.flatMap(([subpath, value]) =>
    collectTargets(value, `exports[${JSON.stringify(subpath)}]`, subpath),
  );
  const legacyTargets = LEGACY_FIELDS.flatMap((field) => {
    const value = pkg[field];
    if (value === undefined) return [];
    if (typeof value !== "string") {
      throw new Error(`"${field}" must be a string, got ${typeof value}`);
    }
    return [{ entry: field, target: value, legacy: true }];
  });

  const missing = [...exportTargets, ...legacyTargets].flatMap((target) => {
    const reason = findProblem(root, target);
    return reason
      ? [{ entry: target.entry, target: target.target, reason }]
      : [];
  });
  const mismatched = subpaths.flatMap(([subpath, value]) =>
    findFormatProblems(root, subpath, value),
  );
  return [...missing, ...mismatched];
};

const main = () => {
  const packageDir = process.argv[2] ?? ".";
  const problems = checkExports(packageDir);
  if (problems.length > 0) {
    const lines = problems.map(
      ({ entry, target, reason }) => `  ${entry}: "${target}" ${reason}`,
    );
    process.stderr.write(
      [
        `check-exports: ${problems.length} entry point target(s) in ${path.join(packageDir, "package.json")} would fail to resolve or type-check for consumers:`,
        ...lines,
        "",
      ].join("\n"),
    );
    process.exit(1);
  }
  process.stdout.write(
    `check-exports: every entry point in ${path.join(packageDir, "package.json")} resolves to a file, with types of the same module format\n`,
  );
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main();
}
