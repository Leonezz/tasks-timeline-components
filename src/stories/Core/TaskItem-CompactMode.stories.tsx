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
    availableCategories: ["Work", "Personal", "Demo"],
    availableTags: ["urgent", "important", "responsive"],
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
  title: "Core/TaskItem Compact Mode",
  component: TaskItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    viewport: {
      viewports: {
        ultraNarrow320: {
          name: "320px (Compact)",
          styles: { width: "320px", height: "568px" },
        },
        narrow350: {
          name: "350px (Compact)",
          styles: { width: "350px", height: "667px" },
        },
        narrow380: {
          name: "380px (Timeline Shows)",
          styles: { width: "380px", height: "667px" },
        },
        mobile400: {
          name: "400px (Full Mobile)",
          styles: { width: "400px", height: "667px" },
        },
      },
      defaultViewport: "narrow350",
    },
  },
  decorators: [
    (Story) => (
      <AppProvider>
        <TasksProvider value={tasksContextValue}>
          <SettingsProvider value={settingsContextValue}>
            <div className="bg-slate-50 min-h-screen p-2">
              <Story />
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
 * Compact Mode Demonstration (< 400px)
 *
 * At narrow widths (< 400px), the layout optimizations include:
 * - Timeline column REMAINS VISIBLE (important for task editing)
 * - Badges are smaller (h-4.5 instead of h-5)
 * - Tighter gaps (gap-1 instead of gap-1.5)
 * - Created date badge is hidden
 * - Reduced padding (px-1.5 instead of px-2)
 * - InputBar header uses compact spacing
 *
 * This makes the UI usable even at 350px width while keeping timeline access!
 */
export const CompactMode350px: Story = {
  args: {
    task: taskBuilder.base({
      id: "1",
      title: "Task in compact mode with timeline preserved",
      dueAt: DateTime.now().plus({ days: 1 }).toISODate()!,
      startAt: DateTime.now().toISODate()!,
      priority: "high",
      category: "Work",
      tags: [{ id: "1", name: "urgent" }],
      description: "Notice: Timeline remains visible for editing access!",
    }),
  },
  parameters: {
    viewport: { defaultViewport: "narrow350" },
  },
};

/**
 * Full Mobile at 400px
 *
 * At 400px and above, badges become full size (h-5).
 * Timeline remains visible at all widths.
 */
export const FullBadgesAt400px: Story = {
  args: {
    task: taskBuilder.base({
      id: "2",
      title: "Task with full badges at 400px width",
      dueAt: DateTime.now().plus({ days: 1 }).toISODate()!,
      createdAt: DateTime.now().minus({ days: 3 }).toISO()!,
      priority: "low",
      category: "Personal",
    }),
  },
  parameters: {
    viewport: { defaultViewport: "mobile400" },
  },
};

/**
 * Multiple Tasks - Compact Comparison
 *
 * Shows how multiple tasks look in compact mode.
 * Switch between viewports to see progressive enhancement:
 * - 350px: Compact with timeline visible
 * - 400px: Full badges
 * - 640px+: Desktop spacing
 */
export const MultipleTasksCompact: Story = {
  render: () => (
    <div className="space-y-2">
      <TaskItem
        task={taskBuilder.base({
          id: "1",
          title: "Short task",
          priority: "high",
        })}
      />
      <TaskItem
        task={taskBuilder.base({
          id: "2",
          title: "Medium length task with some badges",
          dueAt: DateTime.now().toISODate()!,
          priority: "medium",
          category: "Work",
        })}
      />
      <TaskItem
        task={taskBuilder.base({
          id: "3",
          title: "Very long task title that demonstrates text truncation",
          dueAt: DateTime.now().plus({ days: 1 }).toISODate()!,
          startAt: DateTime.now().toISODate()!,
          priority: "high",
          category: "Personal",
          tags: [
            { id: "1", name: "urgent" },
            { id: "2", name: "important" },
          ],
        })}
      />
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "narrow350" },
  },
};

/**
 * Responsive Breakpoints Visualization
 *
 * This story helps you understand the responsive breakpoints:
 *
 * 1. < 400px: Compact mode (timeline visible, smallest badges)
 * 2. 400px - 639px: Full mobile (all badges, larger size)
 * 3. 640px+: Desktop mode (largest spacing)
 *
 * Timeline remains visible at ALL widths for editing access.
 * Use the viewport toolbar to switch between sizes and see the transitions!
 */
export const BreakpointVisualization: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs">
        <h3 className="font-bold mb-2">Current Breakpoint Info</h3>
        <ul className="space-y-1">
          <li>
            <strong>{"< 400px:"}</strong> Compact - Small badges, timeline
            visible
          </li>
          <li>
            <strong>400px-639px:</strong> Full mobile - All badges visible
          </li>
          <li>
            <strong>640px+:</strong> Desktop - Maximum spacing
          </li>
        </ul>
      </div>

      <TaskItem
        task={taskBuilder.base({
          id: "demo",
          title: "Resize viewport to see responsive changes!",
          dueAt: DateTime.now().plus({ days: 1 }).toISODate()!,
          startAt: DateTime.now().toISODate()!,
          createdAt: DateTime.now().minus({ days: 2 }).toISO()!,
          priority: "high",
          category: "Demo",
          tags: [{ id: "1", name: "responsive" }],
        })}
      />
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "narrow350" },
  },
};
