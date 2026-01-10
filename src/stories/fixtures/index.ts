/**
 * Centralized exports for all Storybook test fixtures
 * Import from this file to use mock data factories across stories
 *
 * @example
 * import { settingsBuilder, taskBuilder, edgeCaseTasks } from './fixtures';
 *
 * const myStory = {
 *   args: {
 *     settings: settingsBuilder.default(),
 *     task: taskBuilder.overdue()
 *   }
 * };
 */

export { settingsBuilder } from "./settings";
export { taskBuilder } from "./tasks";
export { edgeCaseTasks } from "./edge-cases";
