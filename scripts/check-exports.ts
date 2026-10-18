/**
 * Post-build guard for the entry points declared in package.json.
 *
 * Every file that "exports" maps a subpath to must exist, or importing that
 * subpath fails for consumers with ERR_MODULE_NOT_FOUND or "Failed to resolve
 * entry". A type-check doesn't notice: the .d.ts can exist while the .js it
 * describes was never built, which is how ./components, ./hooks and ./types
 * shipped in 0.8.0 and 0.9.0. This walks every condition of every subpath,
 * plus the legacy main/module/types fields, and exits non-zero on any target
 * that is missing. Runs at the end of `pnpm build:lib`.
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

const LEGACY_FIELDS = ["main", "module", "types"] as const;

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

  const exportTargets = subpathEntries(pkg.exports).flatMap(
    ([subpath, value]) =>
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

  return [...exportTargets, ...legacyTargets].flatMap((target) => {
    const reason = findProblem(root, target);
    return reason
      ? [{ entry: target.entry, target: target.target, reason }]
      : [];
  });
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
        `check-exports: ${problems.length} entry point target(s) in ${path.join(packageDir, "package.json")} would fail to resolve for consumers:`,
        ...lines,
        "",
      ].join("\n"),
    );
    process.exit(1);
  }
  process.stdout.write(
    `check-exports: every entry point in ${path.join(packageDir, "package.json")} resolves to a file\n`,
  );
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main();
}
