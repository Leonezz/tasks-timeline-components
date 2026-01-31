import type { Meta, StoryObj } from "@storybook/react-vite";
import { TaskItem } from "../../components/TaskItem";
import type { Task } from "../../types";
import { AppProvider } from "../../components/AppContext";
import { taskBuilder } from "../fixtures";
import { DateTime } from "luxon";

const meta: Meta<typeof TaskItem> = {
  title: "Core/TaskItem Responsive Tests",
  component: TaskItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    viewport: {
      viewports: {
        ultraNarrow: {
          name: "Ultra Narrow (320px) - Compact Mode",
          styles: { width: "320px", height: "568px" },
        },
        narrow: {
          name: "Narrow (380px) - Timeline Appears",
          styles: { width: "380px", height: "667px" },
        },
        mobile: {
          name: "Mobile (400px) - Full Mobile",
          styles: { width: "400px", height: "667px" },
        },
        tablet: {
          name: "Tablet (640px - sm breakpoint)",
          styles: { width: "640px", height: "1024px" },
        },
        desktop: {
          name: "Desktop (1024px)",
          styles: { width: "1024px", height: "768px" },
        },
      },
      defaultViewport: "ultraNarrow",
    },
  },
  decorators: [
    (Story) => (
      <AppProvider>
        <div className="bg-slate-50 min-h-screen p-4">
          <div className="max-w-4xl mx-auto">
            <Story />
          </div>
        </div>
      </AppProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock handlers
const mockHandlers = {
  onUpdate: (task: Task) => console.log("Update:", task),
  onDelete: (id: string) => console.log("Delete:", id),
  onEdit: (task: Task) => console.log("Edit:", task),
};

/**
 * Long Title Test - Mobile (320px)
 *
 * This demonstrates the fix for issue #12.
 * The title should truncate cleanly with ellipsis (...) instead of wrapping.
 *
 * Test at different viewport sizes using the viewport toolbar:
 * - Mobile (320px): Title should truncate, tight spacing
 * - Tablet (640px): Spacing increases at sm: breakpoint
 * - Desktop (1024px): Full spacing
 */
export const LongTitleMobile: Story = {
  args: {
    task: taskBuilder.base({
      id: "1",
      title:
        "This is an extremely long task title that demonstrates text truncation on narrow viewports instead of wrapping and breaking the layout",
      dueAt: DateTime.now().plus({ days: 1 }).toISODate()!,
      priority: "high",
      category: "Work",
      tags: [
        { id: "1", name: "urgent" },
        { id: "2", name: "important" },
      ],
      description:
        "This task has a very long title to test responsive truncation behavior at narrow viewport widths.",
    }),
    ...mockHandlers,
  },
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

/**
 * Multiple Badges Test - Mobile
 *
 * Tests how badges wrap and display at narrow widths.
 * Badges should wrap cleanly without overlapping.
 */
export const MultipleBadgesMobile: Story = {
  args: {
    task: taskBuilder.base({
      id: "2",
      title: "Task with many metadata badges",
      dueAt: DateTime.now().toISODate()!,
      startAt: DateTime.now().minus({ days: 1 }).toISODate()!,
      createdAt: DateTime.now().minus({ days: 7 }).toISO()!,
      priority: "high",
      category: "Very Long Category Name",
      tags: [
        { id: "1", name: "tag-one" },
        { id: "2", name: "tag-two" },
        { id: "3", name: "very-long-tag-name" },
      ],
    }),
    ...mockHandlers,
  },
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

/**
 * Long Title - Tablet (640px - sm: breakpoint)
 *
 * At the sm: breakpoint (640px), spacing should increase:
 * - Gaps: 1.5 → 2
 * - Padding: 0.5 → 1
 * - Timeline: 5 → 6 units wide
 */
export const LongTitleTablet: Story = {
  args: {
    task: taskBuilder.base({
      id: "3",
      title:
        "This is an extremely long task title that demonstrates responsive behavior at the sm: breakpoint (640px)",
      dueAt: DateTime.now().plus({ days: 2 }).toISODate()!,
      priority: "medium",
    }),
    ...mockHandlers,
  },
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};

/**
 * Long Title - Desktop (1024px)
 *
 * At desktop widths, all responsive enhancements are active.
 */
export const LongTitleDesktop: Story = {
  args: {
    task: taskBuilder.base({
      id: "4",
      title:
        "This is an extremely long task title that demonstrates desktop responsive behavior with full spacing",
      dueAt: DateTime.now().plus({ days: 3 }).toISODate()!,
      priority: "low",
      category: "Personal",
    }),
    ...mockHandlers,
  },
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};

/**
 * Comparison: Multiple Tasks at Different Widths
 *
 * Shows multiple tasks at once to see how the layout adapts.
 * Switch viewports to see responsive behavior across multiple items.
 */
export const MultipleTasksComparison: Story = {
  render: () => (
    <div className="space-y-2">
      <TaskItem
        task={taskBuilder.base({
          id: "1",
          title: "Short title",
          priority: "high",
        })}
        {...mockHandlers}
      />
      <TaskItem
        task={taskBuilder.base({
          id: "2",
          title: "Medium length title that is somewhat longer",
          priority: "medium",
        })}
        {...mockHandlers}
      />
      <TaskItem
        task={taskBuilder.base({
          id: "3",
          title:
            "Very long title that will definitely need to truncate on narrow viewports to prevent layout breaking",
          priority: "low",
          category: "Work",
          tags: [{ id: "1", name: "urgent" }],
        })}
        {...mockHandlers}
      />
      <TaskItem
        task={taskBuilder.base({
          id: "4",
          title:
            "Another extremely long task title with many badges to test wrapping behavior",
          dueAt: DateTime.now().toISODate()!,
          startAt: DateTime.now().minus({ days: 1 }).toISODate()!,
          priority: "high",
          category: "Personal",
          tags: [
            { id: "1", name: "tag1" },
            { id: "2", name: "tag2" },
          ],
        })}
        {...mockHandlers}
      />
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

/**
 * Badge Truncation Test
 *
 * Tests that long badge labels truncate properly.
 */
export const BadgeTruncationTest: Story = {
  args: {
    task: taskBuilder.base({
      id: "5",
      title: "Task with long badge labels",
      dueAt: "2026-12-31T23:59:59.999Z",
      category: "Very Long Category Name That Should Truncate",
      tags: [{ id: "1", name: "extremely-long-tag-name-that-should-truncate" }],
    }),
    ...mockHandlers,
  },
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};
