import { DateTime } from "luxon";
import type { Tag } from "../../types";
import { taskBuilder } from "./tasks";

/**
 * Edge case and boundary condition task mocks for comprehensive testing
 */
export const edgeCaseTasks = {
  /**
   * Task with empty title (invalid state)
   */
  emptyTitle: taskBuilder.base({
    title: "",
  }),

  /**
   * Task with very long title (200+ characters)
   */
  veryLongTitle: taskBuilder.base({
    title: "A".repeat(200) + " This is an extremely long task title that should test how the UI handles overflow and text wrapping in various contexts",
  }),

  /**
   * Task with very long description (5000+ characters)
   */
  veryLongDescription: taskBuilder.base({
    description: "Lorem ipsum dolor sit amet. ".repeat(250),
  }),

  /**
   * Task with no description
   */
  noDescription: taskBuilder.base({
    description: "",
  }),

  /**
   * Task with no category
   */
  noCategory: taskBuilder.base({
    category: undefined as any,
  }),

  /**
   * Task with many tags (20+)
   */
  manyTags: taskBuilder.base({
    tags: Array.from({ length: 20 }, (_, i): Tag => ({
      id: `tag-${i}`,
      name: `tag${i}`,
    })),
  }),

  /**
   * Task with no tags
   */
  noTags: taskBuilder.base({
    tags: [],
  }),

  /**
   * Task with very long tag names
   */
  longTagNames: taskBuilder.base({
    tags: [
      { id: "tag-1", name: "VeryLongTagNameThatShouldTestOverflow" },
      { id: "tag-2", name: "AnotherExtremelyLongTagNameForTesting" },
    ],
  }),

  /**
   * Task with invalid/malformed date string
   */
  invalidDate: taskBuilder.base({
    dueAt: "invalid-date-string",
  }),

  /**
   * Task with date far in the future (10 years)
   */
  futureDueDate: taskBuilder.base({
    dueAt: DateTime.now().plus({ years: 10 }).toISO(),
  }),

  /**
   * Task with date far in the past
   */
  pastDueDate: taskBuilder.base({
    dueAt: DateTime.now().minus({ years: 5 }).toISO(),
  }),

  /**
   * Task with all date fields populated
   */
  allFieldsFilled: taskBuilder.base({
    title: "Complete task with all fields",
    description: "This task has every field filled out for comprehensive testing",
    createdAt: DateTime.now().minus({ days: 7 }).toISO(),
    startAt: DateTime.now().minus({ days: 3 }).toISO(),
    dueAt: DateTime.now().plus({ days: 3 }).toISO(),
    completedAt: undefined,
    tags: [
      { id: "1", name: "work" },
      { id: "2", name: "urgent" },
    ],
    category: "Work",
    priority: "high",
    isRecurring: true,
    recurringInterval: "FREQ=DAILY;INTERVAL=1",
  }),

  /**
   * Task with only required fields
   */
  minimal: taskBuilder.base({
    title: "Minimal task",
    description: "",
    tags: [],
    priority: "medium",
    category: "General",
    dueAt: undefined,
    startAt: undefined,
    completedAt: undefined,
    isRecurring: false,
    recurringInterval: undefined,
  }),

  /**
   * Task with Unicode/emoji in title
   */
  unicodeTitle: taskBuilder.base({
    title: "🎉 Unicode test: 日本語 中文 العربية 🚀",
  }),

  /**
   * Task with HTML-like content in title (XSS test)
   */
  htmlInTitle: taskBuilder.base({
    title: '<script>alert("XSS")</script> Test task',
  }),

  /**
   * Task with special characters
   */
  specialChars: taskBuilder.base({
    title: "Special chars: !@#$%^&*()_+-=[]{}|;:',.<>?/`~",
  }),

  /**
   * Task with newlines in title
   */
  newlinesInTitle: taskBuilder.base({
    title: "Multi\nline\ntitle\ntest",
  }),

  /**
   * Task with newlines in description
   */
  multilineDescription: taskBuilder.base({
    description:
      "Line 1\nLine 2\nLine 3\n\nParagraph 2\n\n- List item 1\n- List item 2",
  }),

  /**
   * Task with all null dates (truly undated)
   */
  allNullDates: taskBuilder.base({
    dueAt: undefined,
    startAt: undefined,
    completedAt: undefined,
    createdAt: undefined,
  }),

  /**
   * Task with invalid RRule recurrence string
   */
  invalidRecurrence: taskBuilder.base({
    isRecurring: true,
    recurringInterval: "INVALID_RRULE_STRING",
  }),

  /**
   * Task with very complex RRule
   */
  complexRecurrence: taskBuilder.base({
    isRecurring: true,
    recurringInterval:
      "FREQ=MONTHLY;INTERVAL=2;BYDAY=1MO,3FR;BYMONTH=1,4,7,10",
  }),

  /**
   * Task due in less than 1 hour (very urgent)
   */
  dueInMinutes: taskBuilder.base({
    dueAt: DateTime.now().plus({ minutes: 30 }).toISO(),
    priority: "high",
    status: "due",
  }),

  /**
   * Task completed milliseconds ago
   */
  justCompleted: taskBuilder.base({
    status: "done",
    completedAt: DateTime.now().minus({ milliseconds: 100 }).toISO(),
  }),

  /**
   * Task with duplicate tags
   */
  duplicateTags: taskBuilder.base({
    tags: [
      { id: "1", name: "duplicate" },
      { id: "2", name: "duplicate" },
      { id: "3", name: "duplicate" },
    ],
  }),

  /**
   * Task with very long category name
   */
  longCategoryName: taskBuilder.base({
    category: "VeryLongCategoryNameThatShouldTestUIOverflowHandling",
  }),

  /**
   * Task with whitespace-only title
   */
  whitespaceTitle: taskBuilder.base({
    title: "   \t\n   ",
  }),

  /**
   * Task with whitespace-only description
   */
  whitespaceDescription: taskBuilder.base({
    description: "   \t\n   ",
  }),
};
