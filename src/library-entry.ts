/**
 * Vite entry for the main bundle (see vite.config.ts `build.lib.entry`).
 *
 * The stylesheet is imported here, not in index.ts, so Vite still extracts it
 * to dist/index.css while the published declarations stay free of CSS
 * specifiers: tsc keeps side-effect imports in .d.ts output, and this file is
 * excluded from tsconfig.build.json.
 */
import "./index.css";

export * from "./index";
