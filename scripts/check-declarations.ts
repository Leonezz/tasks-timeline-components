/**
 * Post-build guard for the published type declarations (dist/**\/*.d.ts).
 *
 * tsc copies module specifiers into .d.ts output verbatim. A specifier that
 * only resolves inside this repo (the "@/" path alias, a stylesheet, a file
 * outside dist/) breaks the type-check of every consumer of the package. So
 * does a relative specifier without an extension ("./components/index"):
 * the package is `"type": "module"`, and `"moduleResolution": "node16"` or
 * `"nodenext"` consumers can't resolve it (TS2834/TS2835), which also turns
 * an `export *` of it into nothing. scripts/rewrite-declaration-specifiers.ts
 * adds the extensions after tsc; this guards that it did.
 * This scans the imports, exports, import() types and `/// <reference path>`
 * directives of each declaration file and exits non-zero on any such
 * specifier.
 *
 * It also type-checks the declarations as a `"module": "node16"` consumer
 * would and fails when a CommonJS declaration (.d.cts, which the "require"
 * conditions point at) loads an ES module: a sibling .d.ts (TS1479, TS1541),
 * or a package that only resolves to an ES module without
 * `"resolution-mode": "import"` (TS1541, TS1542), or through
 * `import x = require()` (TS1471). scripts/emit-cjs-declarations.ts writes the
 * .d.cts files so that none of them do; this guards that it did. Only these
 * module format errors are reported: other errors in a dependency's types are
 * not this package's to fix. Runs at the end of `pnpm build:lib`.
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
const DECLARATION_TO_JS_EXTENSION = /\.d\.([mc]?)ts$/;
/** "." and "..", or a trailing "/": only a directory can match. */
const DIRECTORY_ONLY = /(^|\/)\.\.?$|\/$/;
const RELATIVE = /^\.\.?\//;

/**
 * node16, not nodenext: nodenext on TS >= 5.8 lets CommonJS require() an ES
 * module, so it would accept what node16 consumers can't use.
 */
const NODE16_CONSUMER: ts.CompilerOptions = {
  module: ts.ModuleKind.Node16,
  moduleResolution: ts.ModuleResolutionKind.Node16,
  noEmit: true,
  types: [],
};

const RESOLUTION_MODE = '{ "resolution-mode": "import" }';

/**
 * The module format errors a CommonJS declaration gets for loading an ES
 * module, by code: what it can't do, and the fix for a package specifier.
 */
const FORMAT_ERRORS: Record<number, { cannot: string; packageFix: string }> = {
  1471: {
    cannot: "load with `import x = require()`",
    packageFix: `import it with \`import type\`, marked with ${RESOLUTION_MODE}`,
  },
  1479: {
    cannot: "import",
    packageFix: `import it with \`import type\`, marked with ${RESOLUTION_MODE}`,
  },
  1541: {
    cannot: 'import type-only without "resolution-mode"',
    packageFix: `add with ${RESOLUTION_MODE}`,
  },
  1542: {
    cannot: 'reference in an import() type without "resolution-mode"',
    packageFix: `add { with: ${RESOLUTION_MODE} } to the import() type`,
  },
};

const listDeclarationFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listDeclarationFiles(fullPath);
      return DECLARATION_FILE.test(entry.name) ? [fullPath] : [];
    })
    .sort();

const isInside = (dir: string, target: string) => {
  const relative = path.relative(dir, target);
  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
};

/**
 * Files a consumer's TypeScript would look for behind an import specifier, in
 * order. Extensionless specifiers get the bundler-resolution candidates, so
 * the problem report can name the file they were meant to point at.
 */
const declarationCandidates = (specifier: string, target: string): string[] => {
  const extension = path.extname(target);
  const declarationExtension = JS_EXTENSION_TO_DECLARATION[extension];
  if (declarationExtension) {
    return [target.slice(0, -extension.length) + declarationExtension];
  }
  const directoryIndex = path.join(target, "index.d.ts");
  return DIRECTORY_ONLY.test(specifier)
    ? [directoryIndex]
    : [`${target}.d.ts`, directoryIndex];
};

/** The relative specifier, with a .js extension, that a consumer resolves to `declaration`. */
const specifierFor = (file: string, declaration: string) => {
  const relative = path
    .relative(path.dirname(file), declaration)
    .split(path.sep)
    .join("/")
    .replace(DECLARATION_TO_JS_EXTENSION, ".$1js");
  return relative.startsWith("../") ? relative : `./${relative}`;
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
    kind === "reference" ? [target] : declarationCandidates(specifier, target);
  const resolved = candidates.find((candidate) => existsSync(candidate));
  if (!resolved) return "does not resolve to a declaration file in dist/";
  const hasExtension = Object.hasOwn(
    JS_EXTENSION_TO_DECLARATION,
    path.extname(target),
  );
  if (kind === "module" && !hasExtension) {
    return `has no extension, so "moduleResolution": "node16"/"nodenext" consumers can't resolve it (TS2834); use "${specifierFor(file, resolved)}"`;
  }
  return null;
};

const formatReason = (file: string, specifier: string, code: number) => {
  const { cannot, packageFix } = FORMAT_ERRORS[code];
  const problem = `ES module, which a CommonJS declaration can't ${cannot} ("module": "node16" consumers get TS${code})`;
  if (!RELATIVE.test(specifier)) {
    return `only resolves to an ${problem}; ${packageFix}`;
  }
  const twin = path
    .resolve(path.dirname(file), specifier)
    .replace(/\.js$/, ".d.cts");
  return specifier.endsWith(".js") && existsSync(twin)
    ? `resolves to an ${problem}; use "${specifier.replace(/\.js$/, ".cjs")}"`
    : `resolves to an ${problem}; give it a CommonJS twin (.d.cts) and import that`;
};

const findFormatProblems = (
  distDir: string,
  files: string[],
): Map<string, DeclarationProblem[]> => {
  const program = ts.createProgram(files, NODE16_CONSUMER);
  return new Map(
    files.map((file) => {
      const source = program.getSourceFile(file);
      if (!source) throw new Error(`TypeScript did not load ${file}`);
      const problems = program
        .getSemanticDiagnostics(source)
        .flatMap((diagnostic) => {
          if (!Object.hasOwn(FORMAT_ERRORS, diagnostic.code)) return [];
          // The error spans the module specifier's string literal
          const { start = 0, length = 0 } = diagnostic;
          const specifier = source.text
            .slice(start, start + length)
            .replace(/^["']|["']$/g, "");
          return [
            {
              file: path.relative(distDir, file),
              specifier,
              reason: formatReason(file, specifier, diagnostic.code),
            },
          ];
        });
      return [file, problems];
    }),
  );
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

  const formatProblems = findFormatProblems(root, files);
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
    const unresolved = specifiers.flatMap(({ specifier, kind }) => {
      const reason = findProblem(root, file, specifier, kind);
      return reason
        ? [{ file: path.relative(root, file), specifier, reason }]
        : [];
    });
    return [...unresolved, ...(formatProblems.get(file) ?? [])];
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
    `check-declarations: all specifiers in ${distDir}/**/*.d.{ts,cts} resolve for consumers, and no CommonJS declaration loads an ES module\n`,
  );
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main();
}
