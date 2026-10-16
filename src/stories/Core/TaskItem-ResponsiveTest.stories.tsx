import type { Meta, StoryObj } from "@storybook/react-vite";
import { TaskItem } from "../../components/TaskItem";
import { AppProvider } from "../../components/AppContext";
import {
  TasksProvider,
  type TasksContextType,
} from "../../contexts/TasksContext";
import {
  SettingsProvider,
  type SettingsContextType,
} from "../../contexts/SettingsContext";
import { settingsBuilder, taskBuilder } from "../fixtures";
import { DateTime } from "luxon";

// TaskItem reads its handlers and settings from context, not props
const tasksContextValue: TasksContextType = {
    tasks: [],
    availableCategories: ["Work", "Personal"],
    availableTags: ["urgent", "important"],
    onUpdateTask: (task) => console.log("Update:", task),
    onDeleteTask: (id) => console.log("Delete:", id),
    onAddTask: (task) => console.log("Add:", task),
    onEditTask: (task) => console.log("Edit:", task),
    onAICommand: async (input) => console.log("AI command:", input),
  },
  settingsContextValue: SettingsContextType = {
    settings: settingsBuilder.default(),
    updateSettings: (settings) => console.log("Update settings:", settings),
    isFocusMode: false,
    toggleFocusMode: () => console.log("Toggle focus mode"),
    isAiMode: false,
    toggleAiMode: () => console.log("Toggle AI mode"),
    filters: {
      tags: { include: [], exclude: [] },
      categories: { include: [], exclude: [] },
      priorities: { include: [], exclude: [] },
      statuses: { include: [], exclude: [] },
      enableScript: false,
      script: "",
    },
    onFilterChange: (filters) => console.log("Filter change:", filters),
    sort: { field: "dueAt", direction: "asc", script: "" },
    onSortChange: (sort) => console.log("Sort change:", sort),
    onVoiceError: (msg) => console.error("Voice error:", msg),
  };

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
        <TasksProvider value={tasksContextValue}>
          <SettingsProvider value={settingsContextValue}>
            <div className="bg-slate-50 min-h-screen p-4">
              <div className="max-w-4xl mx-auto">
                <Story />
              </div>
            </div>
          </SettingsProvider>
        </TasksProvider>
      </AppProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

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
      />
      <TaskItem
        task={taskBuilder.base({
          id: "2",
          title: "Medium length title that is somewhat longer",
          priority: "medium",
        })}
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
  },
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};
