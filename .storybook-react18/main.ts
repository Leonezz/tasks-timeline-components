import type { StorybookConfig } from "@storybook/react-vite";
import base from "../.storybook/main";

/**
 * The stories that must also pass on React 18, which the Obsidian plugin
 * bundles. The `storybook-react18` Vitest project (vite.config.ts) runs them
 * with react and react-dom aliased to the react-18 / react-dom-18 packages.
 * A config directory of its own also gives that project its own Vite cache.
 */
const config: StorybookConfig = {
  ...base,
  stories: ["../src/stories/Core/PluginHostStress.stories.tsx"],
};

export default config;
