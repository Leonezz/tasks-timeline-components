/**
 * Standalone build of the pure AI capabilities module (task tools, resources,
 * prompts).
 *
 * Produces dist/capabilities/index.js (ES module, luxon external) so consumers
 * without a DOM (e.g. a Zotero plugin sandbox) can import
 * `@tasks-timeline/components/capabilities` without loading the React bundle.
 *
 * Must run AFTER the main `vite build` (whose emptyOutDir wipes dist/) and
 * BEFORE `tsc -p tsconfig.build.json` (which emits the .d.ts files).
 */
import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(dirname, "src/capabilities/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: ["luxon"],
    },
    sourcemap: true,
    outDir: "dist/capabilities",
    emptyOutDir: true,
    copyPublicDir: false,
  },
});
