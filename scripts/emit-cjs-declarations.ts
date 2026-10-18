/**
 * Emits a CommonJS twin (X.d.cts) of every published declaration file
 * (dist/**\/X.d.ts), which the "require" conditions of package.json "exports"
 * point at.
 *
 * The package is `"type": "module"`, so TypeScript reads every .d.ts as an ES
 * module, while the "require" targets (dist/index.umd.cjs,
 * dist/<subpath>/index.cjs) are CommonJS. With one .d.ts for both, a `.cts`
 * consumer on `"module": "node16"` got TS1471 ("only resolves to an ES
 * module") for `import x = require("@tasks-timeline/components")`. nodenext on
 * TS >= 5.8 lets CommonJS require() an ES module; node16 doesn't.
 *
 * A twin has its .d.ts's content, except:
 * - relative specifiers name twins ("./TaskItem.js" -> "./TaskItem.cjs"), so
 *   the CommonJS tree never loads an ES module declaration;
 * - a type-only import of a package that only resolves to an ES module from
 *   CommonJS gets `with { "resolution-mode": "import" }`, which node16 requires
 *   (TS1541/TS1542). A value import of such a package has no CommonJS
 *   equivalent and fails the run;
 * - the sourceMappingURL comment is dropped. The .d.ts maps point at ../src,
 *   which isn't published, so twins get none.
 * Every problem is reported before any file is written.
 *
 * Must run AFTER scripts/rewrite-declaration-specifiers.ts, which gives each
 * relative specifier its .js extension, and before
 * scripts/check-declarations.ts, which fails the build on any CommonJS
 * declaration that still loads an ES module.
 *
 * Usage: tsx scripts/emit-cjs-declarations.ts [distDir]   (default: dist)
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

export interface CjsDeclaration {
  /** Twin written, relative to the dist directory */
  file: string;
  /** Packages imported with `"resolution-mode": "import"`, in source order */
  esmOnlyImports: string[];
}

interface ModuleReference {
  literal: ts.StringLiteral;
  /** The import, export, import() type or `declare module` naming it */
  host: ts.Node;
}

interface Edit {
  start: number;
  end: number;
  text: string;
}

interface PlannedTwin {
  declaration: string;
  twin: string;
  content: string;
  edits: Edit[];
  esmOnlyImports: string[];
  problems: string[];
}

const DECLARATION_FILE = /\.d\.ts$/;
const RELATIVE = /^\.\.?(\/|$)/;
const SOURCE_MAP_COMMENT = /\/\/# sourceMappingURL=[^\n]*\n?$/;
const RESOLUTION_MODE = '{ "resolution-mode": "import" }';
const NODE16: ts.CompilerOptions = {
  module: ts.ModuleKind.Node16,
  moduleResolution: ts.ModuleResolutionKind.Node16,
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

/** String literals that name a module, with the node that names it. Comments are skipped. */
const moduleReferences = (source: ts.SourceFile) => {
  const references: ModuleReference[] = [];
  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      references.push({ literal: node.moduleSpecifier, host: node });
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      references.push({ literal: node.argument.literal, host: node });
    } else if (
      ts.isExternalModuleReference(node) &&
      ts.isStringLiteral(node.expression)
    ) {
      references.push({ literal: node.expression, host: node });
    } else if (ts.isModuleDeclaration(node) && ts.isStringLiteral(node.name)) {
      references.push({ literal: node.name, host: node });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return references;
};

/** Whether `specifier` only resolves to an ES module from CommonJS; null if it resolves to nothing. */
const isEsmOnly = (specifier: string, twin: string): boolean | null => {
  const resolve = (mode: ts.ResolutionMode) =>
    ts.resolveModuleName(
      specifier,
      twin,
      NODE16,
      ts.sys,
      undefined,
      undefined,
      mode,
    ).resolvedModule;
  const fromRequire = resolve(ts.ModuleKind.CommonJS);
  if (fromRequire) {
    const format = ts.getImpliedNodeFormatForFile(
      fromRequire.resolvedFileName,
      undefined,
      ts.sys,
      NODE16,
    );
    return format === ts.ModuleKind.ESNext;
  }
  // No "require" condition, but an "import" one: the package is ESM only
  return resolve(ts.ModuleKind.ESNext) ? true : null;
};

/** `with { "resolution-mode": "import" }`, inserted after the specifier, or null when only a value import fits. */
const resolutionModeEdit = ({
  literal,
  host,
}: ModuleReference): Edit | null => {
  const at = { start: literal.end, end: literal.end };
  if (ts.isImportTypeNode(host)) {
    return { ...at, text: `, { with: ${RESOLUTION_MODE} }` };
  }
  const typeOnly =
    (ts.isImportDeclaration(host) && host.importClause?.isTypeOnly) ||
    (ts.isExportDeclaration(host) && host.isTypeOnly);
  return typeOnly ? { ...at, text: ` with ${RESOLUTION_MODE}` } : null;
};

const hasAttributes = (host: ts.Node) =>
  (ts.isImportDeclaration(host) ||
    ts.isExportDeclaration(host) ||
    ts.isImportTypeNode(host)) &&
  host.attributes !== undefined;

const planRelative = (
  distDir: string,
  file: string,
  source: ts.SourceFile,
  { literal }: ModuleReference,
): Edit | string => {
  const specifier = literal.text;
  if (!specifier.endsWith(".js")) {
    return `"${specifier}" does not end in .js, so there is no .d.ts behind it to mirror. Run scripts/rewrite-declaration-specifiers.ts first`;
  }
  const target = path
    .resolve(path.dirname(file), specifier)
    .replace(/\.js$/, ".d.ts");
  if (!isInside(distDir, target) || !existsSync(target)) {
    return `"${specifier}" has no .d.ts inside dist/ to mirror`;
  }
  // Keep the quotes, replace what's between them
  return {
    start: literal.getStart(source) + 1,
    end: literal.end - 1,
    text: specifier.replace(/\.js$/, ".cjs"),
  };
};

const planTwin = (distDir: string, file: string): PlannedTwin => {
  const content = readFileSync(file, "utf8");
  const twin = file.replace(DECLARATION_FILE, ".d.cts");
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest);
  const plan: PlannedTwin = {
    declaration: file,
    twin,
    content,
    edits: [],
    esmOnlyImports: [],
    problems: ts
      .preProcessFile(content, true, true)
      .referencedFiles.map(
        ({ fileName }) =>
          `/// <reference path="${fileName}" /> is not supported: the twin would reference the ES module declaration. Extend the script before adding one`,
      ),
  };

  for (const reference of moduleReferences(source)) {
    const specifier = reference.literal.text;
    if (RELATIVE.test(specifier)) {
      const edit = planRelative(distDir, file, source, reference);
      if (typeof edit === "string") plan.problems.push(edit);
      else plan.edits.push(edit);
      continue;
    }
    // Augmenting a package, not importing it
    if (ts.isModuleDeclaration(reference.host)) continue;

    const esmOnly = isEsmOnly(specifier, twin);
    if (esmOnly === null) {
      plan.problems.push(
        `"${specifier}" resolves to no type declarations from ${path.relative(distDir, twin)}. Is it a dependency?`,
      );
      continue;
    }
    // Already marked: check-declarations validates the mark
    if (!esmOnly || hasAttributes(reference.host)) continue;
    const edit = resolutionModeEdit(reference);
    if (!edit) {
      plan.problems.push(
        `"${specifier}" only resolves to an ES module, which a CommonJS declaration can only load type-only. Import it with \`import type\` / \`export type\` in the source`,
      );
      continue;
    }
    plan.edits.push(edit);
    plan.esmOnlyImports.push(specifier);
  }
  return plan;
};

const applyEdits = ({ content, edits }: PlannedTwin) =>
  edits
    .reduceRight(
      (text, { start, end, text: replacement }) =>
        text.slice(0, start) + replacement + text.slice(end),
      content,
    )
    .replace(SOURCE_MAP_COMMENT, "");

export const emitCjsDeclarations = (distDir: string): CjsDeclaration[] => {
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

  const planned = files.map((file) => planTwin(root, file));
  const problems = planned.flatMap(({ declaration, problems }) =>
    problems.map(
      (problem) => `  ${path.relative(root, declaration)}: ${problem}`,
    ),
  );
  if (problems.length > 0) {
    throw new Error(
      [
        `emit-cjs-declarations: ${problems.length} problem(s) in ${distDir} prevent writing CommonJS declarations:`,
        ...problems,
      ].join("\n"),
    );
  }

  return planned.map((plan) => {
    writeFileSync(plan.twin, applyEdits(plan));
    return {
      file: path.relative(root, plan.twin),
      esmOnlyImports: plan.esmOnlyImports,
    };
  });
};

const main = () => {
  const distDir = process.argv[2] ?? "dist";
  const twins = emitCjsDeclarations(distDir);
  const esmOnly = [
    ...new Set(twins.flatMap(({ esmOnlyImports }) => esmOnlyImports)),
  ].sort();
  const marked =
    esmOnly.length === 0
      ? ""
      : `; marked imports of ES-module-only ${esmOnly.join(", ")} with "resolution-mode": "import"`;
  process.stdout.write(
    `emit-cjs-declarations: wrote ${twins.length} .d.cts file(s) under ${distDir}${marked}\n`,
  );
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main();
}
