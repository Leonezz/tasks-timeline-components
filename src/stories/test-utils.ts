import { expect } from "vitest";
import type { Task, TaskStatus } from "../types";

/**
 * Test utilities for Storybook interaction testing
 * These helpers make it easier to write play functions for stories
 */

/**
 * Wait for animations to complete
 * Useful for testing components with CSS transitions or Framer Motion animations
 *
 * @param duration - Duration in milliseconds (default: 500ms)
 */
export const waitForAnimation = (duration: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, duration));

/**
 * Test keyboard navigation by counting focusable elements
 * Verifies that the correct number of interactive elements exist
 *
 * @param canvasElement - The canvas element from Storybook play function
 * @param expectedCount - Expected number of focusable elements
 */
export const testKeyboardNavigation = async (
  canvasElement: HTMLElement,
  expectedCount: number
) => {
  const focusableElements = canvasElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  expect(focusableElements).toHaveLength(expectedCount);
};

/**
 * Find a task in an array by ID
 *
 * @param tasks - Array of tasks
 * @param id - Task ID to find
 */
export const findTaskById = (tasks: Task[], id: string): Task | undefined =>
  tasks.find((t) => t.id === id);

/**
 * Assert that an element has a specific task status attribute
 *
 * @param element - HTML element to check
 * @param status - Expected task status
 */
export const expectTaskStatus = (element: HTMLElement, status: TaskStatus) => {
  const actualStatus = element.getAttribute("data-status");
  expect(actualStatus).toBe(status);
};

/**
 * Wait for an element to appear in the DOM
 * Useful for testing components with conditional rendering
 *
 * @param callback - Function that returns the element
 * @param timeout - Maximum wait time in milliseconds
 */
export const waitForElement = async (
  callback: () => HTMLElement | null,
  timeout: number = 3000
): Promise<HTMLElement> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = callback();
    if (element) return element;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error("Element not found within timeout");
};

/**
 * Check if an element is visible (not hidden by CSS)
 *
 * @param element - Element to check
 */
export const isVisible = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0"
  );
};

/**
 * Test ARIA accessibility attributes
 *
 * @param element - Element to test
 * @param attributes - Expected ARIA attributes
 */
export const expectAriaAttributes = (
  element: HTMLElement,
  attributes: Record<string, string>
) => {
  Object.entries(attributes).forEach(([key, value]) => {
    const actualValue = element.getAttribute(key);
    expect(actualValue).toBe(value);
  });
};

/**
 * Simulate a delay (e.g., for debounced inputs)
 *
 * @param ms - Milliseconds to delay
 */
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all tasks with a specific status from an array
 *
 * @param tasks - Array of tasks
 * @param status - Status to filter by
 */
export const getTasksByStatus = (
  tasks: Task[],
  status: TaskStatus
): Task[] => tasks.filter((t) => t.status === status);

/**
 * Count tasks by status
 *
 * @param tasks - Array of tasks
 */
export const countByStatus = (tasks: Task[]): Record<TaskStatus, number> => {
  const counts: Partial<Record<TaskStatus, number>> = {};
  tasks.forEach((task) => {
    counts[task.status] = (counts[task.status] || 0) + 1;
  });
  return counts as Record<TaskStatus, number>;
};

/**
 * Assert that console.log was called with specific arguments
 * Useful for testing event handlers in stories
 *
 * @param mockFn - Mock function (from vi.fn())
 * @param expectedArgs - Expected arguments
 */
export const expectConsoleCalled = (
  mockFn: any,
  expectedArgs: any[]
) => {
  expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
};
