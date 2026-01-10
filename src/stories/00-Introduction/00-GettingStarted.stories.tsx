import type { Meta } from "@storybook/react-vite";

const meta: Meta = {
  title: "00-Introduction/Getting Started",
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Overview = {
  render: () => (
    <div className="prose max-w-2xl">
      <h1>Tasks Timeline Component Library</h1>

      <h2>Welcome! 👋</h2>
      <p>
        This is a comprehensive React component library for building task
        management and timeline visualization applications.
      </p>

      <h2>📦 Available Components</h2>
      <ul>
        <li>
          <strong>TaskItem</strong> - Individual task display with status,
          priority, and actions
        </li>
        <li>
          <strong>TodoList</strong> - Main container for displaying tasks with
          grouping
        </li>
        <li>
          <strong>InputBar</strong> - Create/edit tasks with AI support
        </li>
        <li>
          <strong>DaySection</strong> - Tasks grouped by day
        </li>
        <li>
          <strong>YearSection</strong> - Tasks grouped by year
        </li>
        <li>
          <strong>BacklogSection</strong> - Unscheduled tasks view
        </li>
        <li>
          <strong>TaskEditModal</strong> - Comprehensive task editor
        </li>
        <li>
          <strong>SettingsModal</strong> - App configuration interface
        </li>
        <li>
          <strong>HelpModal</strong> - User guidance and documentation
        </li>
        <li>
          <strong>Toast</strong> - Notification system
        </li>
        <li>
          <strong>Icon</strong> - Lucide icon wrapper
        </li>
      </ul>

      <h2>🎣 Available Hooks</h2>
      <ul>
        <li>
          <strong>useTaskFiltering</strong> - Filter tasks by status, priority,
          category, tags
        </li>
        <li>
          <strong>useTaskStats</strong> - Calculate task statistics
        </li>
        <li>
          <strong>useAIAgent</strong> - AI integration (Gemini, OpenAI,
          Anthropic)
        </li>
        <li>
          <strong>useVoiceInput</strong> - Browser voice input handling
        </li>
      </ul>

      <h2>🚀 Quick Start</h2>
      <pre>
        <code>{`import { TaskItem, Icon } from '@tasks-timeline/component-library';

export function MyApp() {
  return (
    <TaskItem 
      task={task} 
      settings={settings}
      onStatusChange={handleStatusChange}
    />
  );
}`}</code>
      </pre>

      <h2>🎨 Features</h2>
      <ul>
        <li>✅ Fully typed with TypeScript</li>
        <li>✅ Dark mode support</li>
        <li>✅ AI-powered task suggestions</li>
        <li>✅ Voice input integration</li>
        <li>✅ Recurrence rule support</li>
        <li>✅ Custom filtering and sorting</li>
        <li>✅ Responsive design</li>
        <li>✅ Production-ready</li>
      </ul>

      <h2>📚 Explore</h2>
      <p>
        Check out the components and hooks in the sidebar to see live examples
        and documentation.
      </p>
    </div>
  ),
};
