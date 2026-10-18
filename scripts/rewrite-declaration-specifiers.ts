/**
 * Adds explicit extensions to the relative module specifiers of the published
 * type declarations (dist/**\/*.d.ts).
 *
 * The source imports siblings without an extension ("./components/index",
 * "../types"), which `"moduleResolution": "bundler"` accepts, and tsc copies
 * those specifiers into the .d.ts output verbatim. The package is
 * `"type": "module"`, so a consumer on `"moduleResolution": "node16"` or
 * `"nodenext"` reads every .d.ts as an ES module, where a relative import
 * must name its file (TS2834/TS2835) and an `export *` that fails to resolve
 * silently exports nothing. This rewrites each extensionless relative
 * specifier to the file tsc resolved it to at build time:
 * "./TaskItem" -> "./TaskItem.js" (TaskItem.d.ts), "./settings" ->
 * "./settings/index.js" (settings/index.d.ts). A file wins over a directory
 * of the same name, as it does for tsc. A specifier that resolves to nothing
 * inside dist/ fails the run before any file is written.
 *
 * Must run AFTER `tsc -p tsconfig.build.json` and before
 * scripts/check-declarations.ts, which fails the build on any relative
 * specifier still missing an extension.
 *
 * Usage: tsx scripts/rewrite-declaration-specifiers.ts [distDir]   (default: dist)
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export interface SpecifierRewrite {
  /** Declaration file, relative to the rewritten directory */
  file: string;
  from: string;
  to: string;
}

interface PlannedFile {
  file: string;
  content: string;
  edits: { start: number; end: number; to: string }[];
  /** Relative specifiers with no declaration file behind them */
  unresolved: string[];
}

const DECLARATION_FILE = /\.d\.ts$/;
const RELATIVE = /^\.\.?(\/|$)/;
const HAS_EXTENSION = /\.[mc]?js$/;
/** "." and "..", or a trailing "/": only a directory can match. */
const DIRECTORY_ONLY = /(^|\/)\.\.?$|\/$/;

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

/** String literals that name a module, in source order. Comments are skipped. */
const moduleSpecifierLiterals = (source: ts.SourceFile) => {
  const literals: ts.StringLiteral[] = [];
  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      literals.push(node.moduleSpecifier);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      literals.push(node.argument.literal);
    } else if (
      ts.isExternalModuleReference(node) &&
      ts.isStringLiteral(node.expression)
    ) {
      literals.push(node.expression);
    } else if (ts.isModuleDeclaration(node) && ts.isStringLiteral(node.name)) {
      literals.push(node.name);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return literals;
};

/** The specifier with an extension, or null when nothing in dist/ matches. */
const withExtension = (
  distDir: string,
  file: string,
  specifier: string,
): string | null => {
  const target = path.resolve(path.dirname(file), specifier);
  if (!isInside(distDir, target)) return null;
  if (!DIRECTORY_ONLY.test(specifier) && existsSync(`${target}.d.ts`)) {
    return `${specifier}.js`;
  }
  if (existsSync(path.join(target, "index.d.ts"))) {
    return `${specifier.replace(/\/$/, "")}/index.js`;
  }
  return null;
};

const planFile = (distDir: string, file: string): PlannedFile => {
  const content = readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest);
  const extensionless = moduleSpecifierLiterals(source)
    .filter(({ text }) => RELATIVE.test(text) && !HAS_EXTENSION.test(text))
    .map((literal) => ({
      literal,
      to: withExtension(distDir, file, literal.text),
    }));
  return {
    file,
    content,
    // Keep the quotes, replace what's between them
    edits: extensionless.flatMap(({ literal, to }) =>
      to === null
        ? []
        : [{ start: literal.getStart(source) + 1, end: literal.end - 1, to }],
    ),
    unresolved: extensionless
      .filter(({ to }) => to === null)
      .map(({ literal }) => literal.text),
  };
};

const applyEdits = ({ content, edits }: PlannedFile) =>
  edits.reduceRight(
    (text, { start, end, to }) => text.slice(0, start) + to + text.slice(end),
    content,
  );

export const rewriteDeclarationSpecifiers = (
  distDir: string,
): SpecifierRewrite[] => {
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

  const planned = files.map((file) => planFile(root, file));
  const unresolved = planned.flatMap(({ file, unresolved }) =>
    unresolved.map(
      (specifier) => `  ${path.relative(root, file)}: "${specifier}"`,
    ),
  );
  if (unresolved.length > 0) {
    throw new Error(
      [
        `rewrite-declaration-specifiers: ${unresolved.length} relative specifier(s) resolve to no declaration file inside ${distDir}:`,
        ...unresolved,
      ].join("\n"),
    );
  }

  return planned.flatMap((plan) => {
    if (plan.edits.length === 0) return [];
    writeFileSync(plan.file, applyEdits(plan));
    return plan.edits.map(({ start, end, to }) => ({
      file: path.relative(root, plan.file),
      from: plan.content.slice(start, end),
      to,
    }));
  });
};

const main = () => {
  const distDir = process.argv[2] ?? "dist";
  const rewrites = rewriteDeclarationSpecifiers(distDir);
  const fileCount = new Set(rewrites.map(({ file }) => file)).size;
  process.stdout.write(
    `rewrite-declaration-specifiers: added extensions to ${rewrites.length} relative specifier(s) in ${fileCount} file(s) under ${distDir}\n`,
  );
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main();
}
