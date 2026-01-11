import type { Task, TaskStatus } from "../types";
import { expect, within } from "storybook/test";

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
  expectedCount: number,
) => {
  const focusableElements = canvasElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
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
  timeout: number = 3000,
): Promise<HTMLElement> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = callback();
    if (element) {
      return element;
    }
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
  attributes: Record<string, string>,
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
export const getTasksByStatus = (tasks: Task[], status: TaskStatus): Task[] =>
  tasks.filter((t) => t.status === status);

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
  mockFn: unknown,
  expectedArgs: unknown[],
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(mockFn as any).toHaveBeenCalledWith(...expectedArgs);
};

/**
 * Helper to get the shadow root from a canvas element
 * This is needed because components using AppProvider render into Shadow DOM
 */
export function getShadowRoot(canvasElement: HTMLElement): ShadowRoot | null {
  // Look for the shadow host element (usually has id="tasks-timeline-app")
  const shadowHost = canvasElement.querySelector("#tasks-timeline-app");
  return shadowHost?.shadowRoot || null;
}

/**
 * Helper to query inside shadow DOM and portal containers
 * Use this instead of within(canvasElement) for components that use AppProvider
 *
 * This helper handles both:
 * 1. Content inside the shadow root
 * 2. Portal content (like popovers) that may render outside shadow root into document.body
 */
export function withinShadow(
  canvasElement: HTMLElement,
): ReturnType<typeof within> {
  const shadowRoot = getShadowRoot(canvasElement);
  if (!shadowRoot) {
    // Fallback: if no shadow root, return canvas element for regular DOM queries
    console.warn("Shadow root not found, using regular DOM");
    return within(canvasElement);
  }

  // Debug logging
  console.log("[withinShadow] Found shadow root, checking content...");
  console.log(
    "[withinShadow] Shadow root children:",
    shadowRoot.children.length,
  );
  const firstElements = Array.from(shadowRoot.querySelectorAll("*")).slice(
    0,
    5,
  );
  console.log(
    "[withinShadow] First few elements:",
    firstElements.map((el) => {
      const className =
        typeof el.className === "string" ? el.className.split(" ")[0] : "";
      return `${el.tagName}${el.id ? `#${el.id}` : ""}${className ? `.${className}` : ""}`;
    }),
  );

  // Get the portal container (Radix portals render to document.body)
  const portalContainer = canvasElement.ownerDocument?.body,
    // Helper to search in both shadow root and portal container
    searchBothRoots = (selector: string): HTMLElement[] => {
      const shadowElements = Array.from(
          shadowRoot.querySelectorAll(selector),
        ) as HTMLElement[],
        portalElements = portalContainer
          ? (Array.from(
              portalContainer.querySelectorAll(selector),
            ) as HTMLElement[])
          : [];
      return [...shadowElements, ...portalElements];
    },
    // Create a wrapper with query functions
    queries = within(document.body); // Start with document queries as template

  // Override query functions to search within shadowRoot and portals
  return {
    ...queries,
    getByPlaceholderText: (text: string | RegExp) => {
      const elements = searchBothRoots("input, textarea"),
        element = elements.find((el: HTMLElement) => {
          const placeholder = el.getAttribute("placeholder") || "";
          if (text instanceof RegExp) {
            return text.test(placeholder);
          }
          return placeholder.toLowerCase().includes(text.toLowerCase());
        });
      if (!element) {
        throw new Error(
          `Unable to find an element with the placeholder text of: ${text}`,
        );
      }
      return element as HTMLElement;
    },
    getByRole: (role: string, options?: { name?: string | RegExp }) => {
      let elements = searchBothRoots(`[role="${role}"]`);
      if (elements.length === 0 && role === "button") {
        elements = searchBothRoots("button");
      }
      if (options?.name) {
        const namePattern = options.name;
        elements = elements.filter((el) => {
          const text =
            el.textContent ||
            el.getAttribute("aria-label") ||
            el.getAttribute("title") ||
            "";
          if (namePattern instanceof RegExp) {
            return namePattern.test(text);
          }
          return text.toLowerCase().includes(namePattern.toLowerCase());
        });
      }
      if (elements.length === 0) {
        throw new Error(`Unable to find an element with the role: ${role}`);
      }
      return elements[0];
    },
    getByText: (text: string | RegExp) => {
      const allElements = searchBothRoots("*"),
        element = allElements.find((el) => {
          const content = el.textContent || "";
          if (text instanceof RegExp) {
            return text.test(content);
          }
          return content.includes(text);
        });
      if (!element) {
        throw new Error(`Unable to find an element with the text: ${text}`);
      }
      return element;
    },
    getByDisplayValue: (value: string | RegExp) => {
      const inputs = searchBothRoots(
          "input, textarea, select",
        ) as HTMLInputElement[],
        element = inputs.find((el) => {
          const currentValue = el.value || "";
          if (value instanceof RegExp) {
            return value.test(currentValue);
          }
          return currentValue === value || currentValue.includes(value);
        });
      if (!element) {
        throw new Error(
          `Unable to find an element with the display value: ${value}`,
        );
      }
      return element as HTMLElement;
    },
    queryAllByRole: (role: string) => {
      const selector = `[role="${role}"]${role === "button" ? ", button" : ""}`;
      return searchBothRoots(selector).filter(Boolean);
    },
    getAllByRole: (role: string) => {
      let elements = searchBothRoots(`[role="${role}"]`);
      if (elements.length === 0 && role === "button") {
        elements = searchBothRoots("button");
      }
      if (elements.length === 0 && role === "checkbox") {
        elements = searchBothRoots('input[type="checkbox"]');
      }
      if (elements.length === 0 && role === "textbox") {
        elements = searchBothRoots('input[type="text"], textarea');
      }
      if (elements.length === 0 && role === "radio") {
        elements = searchBothRoots('input[type="radio"]');
      }
      return elements;
    },
  } as ReturnType<typeof within>;
}
