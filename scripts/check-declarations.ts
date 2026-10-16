/**
 * Post-build guard for the published type declarations (dist/**\/*.d.ts).
 *
 * tsc copies module specifiers into .d.ts output verbatim. A specifier that
 * only resolves inside this repo (the "@/" path alias, a stylesheet, a file
 * outside dist/) breaks the type-check of every consumer of the package.
 * This scans the imports, exports, import() types and `/// <reference path>`
 * directives of each declaration file and exits non-zero on any such
 * specifier. Runs at the end of `pnpm build:lib`.
 *
 * Usage: tsx scripts/check-declarations.ts [distDir]   (default: dist)
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export interface DeclarationProblem {
  /** Declaration file, relative to the checked directory */
  file: string;
  specifier: string;
  reason: string;
}

type SpecifierKind = "module" | "reference";

const DECLARATION_FILE = /\.d\.[mc]?ts$/;
const STYLESHEET = /\.(css|scss|sass|less|styl)(\?.*)?$/;
const JS_EXTENSION_TO_DECLARATION: Record<string, string> = {
  ".js": ".d.ts",
  ".mjs": ".d.mts",
  ".cjs": ".d.cts",
};

const listDeclarationFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listDeclarationFiles(fullPath);
    return DECLARATION_FILE.test(entry.name) ? [fullPath] : [];
  });

const isInside = (dir: string, target: string) => {
  const relative = path.relative(dir, target);
  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
};

/** Files a consumer's TypeScript would look for behind an import specifier. */
const declarationCandidates = (target: string): string[] => {
  const extension = path.extname(target);
  const declarationExtension = JS_EXTENSION_TO_DECLARATION[extension];
  if (declarationExtension) {
    return [target.slice(0, -extension.length) + declarationExtension];
  }
  return [`${target}.d.ts`, path.join(target, "index.d.ts")];
};

const findProblem = (
  distDir: string,
  file: string,
  specifier: string,
  kind: SpecifierKind,
): string | null => {
  if (specifier.startsWith("@/")) {
    return 'uses the "@/" path alias, which tsc does not rewrite';
  }
  if (STYLESHEET.test(specifier)) {
    return "imports a stylesheet, which has no declaration for consumers";
  }
  const isPath =
    kind === "reference" ||
    specifier.startsWith(".") ||
    path.isAbsolute(specifier);
  if (!isPath) return null; // bare package specifier

  const target = path.resolve(path.dirname(file), specifier);
  if (!isInside(distDir, target)) {
    return "points outside dist/, which is not published";
  }
  const candidates =
    kind === "reference" ? [target] : declarationCandidates(target);
  return candidates.some((candidate) => existsSync(candidate))
    ? null
    : "does not resolve to a declaration file in dist/";
};

export const checkDeclarations = (distDir: string): DeclarationProblem[] => {
  const root = path.resolve(distDir);
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    throw new Error(`${root} is not a directory. Run the build first.`);
  }
  const files = listDeclarationFiles(root);
  if (files.length === 0) {
    throw new Error(
      `No .d.ts files under ${root}. Did \`tsc -p tsconfig.build.json\` run?`,
    );
  }

  return files.flatMap((file) => {
    const info = ts.preProcessFile(readFileSync(file, "utf8"), true, true);
    const specifiers = [
      ...info.importedFiles.map((ref) => ({
        specifier: ref.fileName,
        kind: "module" as const,
      })),
      ...info.referencedFiles.map((ref) => ({
        specifier: ref.fileName,
        kind: "reference" as const,
      })),
    ];
    return specifiers.flatMap(({ specifier, kind }) => {
      const reason = findProblem(root, file, specifier, kind);
      return reason
        ? [{ file: path.relative(root, file), specifier, reason }]
        : [];
    });
  });
};

const main = () => {
  const distDir = process.argv[2] ?? "dist";
  const problems = checkDeclarations(distDir);
  if (problems.length > 0) {
    const lines = problems.map(
      ({ file, specifier, reason }) => `  ${file}: "${specifier}" ${reason}`,
    );
    process.stderr.write(
      [
        `check-declarations: ${problems.length} specifier(s) in ${distDir} would break consumers' type-check:`,
        ...lines,
        "",
      ].join("\n"),
    );
    process.exit(1);
  }
  process.stdout.write(
    `check-declarations: all specifiers in ${distDir}/**/*.d.ts resolve for consumers\n`,
  );
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main();
}
