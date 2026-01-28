# Tasks Timeline Component Library

A comprehensive, production-ready React component library for building task management and timeline visualization applications.

[![npm version](https://img.shields.io/npm/v/@tasks-timeline/components)](https://www.npmjs.com/package/@tasks-timeline/components)
[![license](https://img.shields.io/npm/l/@tasks-timeline/components)](./LICENSE)

## Features

✨ **11 Professional UI Components**

- Task list with multiple grouping strategies (day, year, backlog)
- Task item with status, priority, and action controls
- AI-powered input bar for natural language task creation
- Comprehensive task editor with full configuration
- Settings and help modals
- Toast notifications
- Icon component wrapper

🎣 **Custom React Hooks**

- Task filtering and search
- Task statistics and progress tracking
- AI agent integration (Gemini, OpenAI, Anthropic)
- Voice input handling

📦 **Complete TypeScript Support**

- Fully typed components and hooks
- Comprehensive type definitions
- Excellent IDE autocomplete

🎨 **Modern Styling**

- Tailwind CSS v4 integration
- Radix UI components
- Responsive design
- Dark mode support

## Installation

```bash
npm install @tasks-timeline/components
# or
pnpm add @tasks-timeline/components
```

## Quick Start

### Basic Usage

```typescript
import React, { useState } from "react";
import {
  TodoList,
  InputBar,
  type Task,
} from "@tasks-timeline/components";
import "@tasks-timeline/components/styles";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleAddTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  return (
    <div className="p-4">
      <InputBar onTaskAdd={handleAddTask} />
      <TodoList tasks={tasks} />
    </div>
  );
}

export default App;
```

### External Data Synchronization

The library supports efficient external synchronization with databases, REST APIs, or cloud services through operation-based callbacks:

```typescript
import { TasksTimelineApp } from "@tasks-timeline/components";

function App() {
  return (
    <TasksTimelineApp
      // Called when a task is created (only serializes the new task)
      onTaskAdded={async (task) => {
        await fetch("/api/tasks", {
          method: "POST",
          body: JSON.stringify(task),
        });
      }}
      // Called when a task is updated (only serializes the changed task)
      onTaskUpdated={async (task, previous) => {
        await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          body: JSON.stringify(task),
        });
      }}
      // Called when a task is deleted (only sends the task ID)
      onTaskDeleted={async (taskId, previous) => {
        await fetch(`/api/tasks/${taskId}`, {
          method: "DELETE",
        });
      }}
    />
  );
}
```

**Performance Benefits:**
- ✅ 99% less data transfer (1KB vs 100KB for single task updates)
- ✅ 50-80% fewer database writes (change detection skips no-ops)
- ✅ Granular updates (UPDATE one row, not replace entire table)
- ✅ Perfect for REST APIs, GraphQL, Firebase, or any external storage

**Firebase Example:**

```typescript
import { doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

<TasksTimelineApp
  onTaskAdded={async (task) => {
    await setDoc(doc(db, "tasks", task.id), task);
  }}
  onTaskUpdated={async (task) => {
    await updateDoc(doc(db, "tasks", task.id), task);
  }}
  onTaskDeleted={async (taskId) => {
    await deleteDoc(doc(db, "tasks", taskId));
  }}
/>
```

**LocalStorage with Granular Updates:**

```typescript
<TasksTimelineApp
  onTaskUpdated={async (task) => {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const updated = tasks.map((t) => (t.id === task.id ? task : t));
    localStorage.setItem("tasks", JSON.stringify(updated));
  }}
/>
```

> **Note:** Callbacks are optional. The component uses the repository pattern as a fallback for backwards compatibility.

### Using Components

```typescript
import {
  TaskItem,
  TaskEditModal,
  SettingsModal,
} from "@tasks-timeline/components";
```

### Using Hooks

```typescript
import {
  useTaskFiltering,
  useTaskStats,
  useAIAgent,
} from "@tasks-timeline/components/hooks";

function MyComponent({ tasks }) {
  const { filteredTasks, filters } = useTaskFiltering(tasks, {
    statuses: ["todo", "scheduled"],
    priorities: ["high"],
  });

  const stats = useTaskStats(tasks);

  return (
    <div>
      <p>
        Total: {stats.total}, Completed: {stats.completed}
      </p>
    </div>
  );
}
```

## Components

| Component        | Description                                 |
| ---------------- | ------------------------------------------- |
| `TodoList`       | Main container component with task grouping |
| `TaskItem`       | Individual task display with actions        |
| `InputBar`       | Create/edit tasks with AI support           |
| `DaySection`     | Tasks grouped by day                        |
| `YearSection`    | Tasks grouped by year                       |
| `BacklogSection` | Unscheduled tasks view                      |
| `TaskEditModal`  | Full-featured task editor                   |
| `SettingsModal`  | Application settings                        |
| `HelpModal`      | Help and documentation                      |
| `Toast`          | Notification system                         |
| `Icon`           | Icon wrapper for Lucide icons               |

## Hooks

### useTaskFiltering

Filter tasks by status, priority, category, tags, and custom scripts.

```typescript
const { filteredTasks, filters, setFilters } = useTaskFiltering(
  tasks,
  initialFilters
);
```

### useTaskStats

Calculate task statistics including completion percentage, counts by status, etc.

```typescript
const stats = useTaskStats(tasks);
// { total, completed, byStatus, byPriority, ... }
```

### useAIAgent

Integrate AI for task processing and insights.

```typescript
const { processTask, generateSuggestions, isLoading } = useAIAgent(
  settings.aiConfig
);
```

### useVoiceInput

Handle browser voice input or Whisper API integration.

```typescript
const { transcript, isListening, startListening, stopListening } =
  useVoiceInput();
```

## Types

```typescript
type Priority = "low" | "medium" | "high";
type TaskStatus =
  | "done"
  | "scheduled"
  | "todo"
  | "due"
  | "overdue"
  | "cancelled"
  | "unplanned";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  category?: string;
  tags: Tag[];
  isRecurring?: boolean;
  // ... and more
}

interface AppSettings {
  theme: "light" | "dark" | "midnight" | "coffee";
  dateFormat: string;
  showCompleted: boolean;
  // ... and more
}
```

## Styling

### Import Styles

```typescript
import "@tasks-timeline/components/styles";
```

### Tailwind CSS

The library uses Tailwind CSS v4. Ensure your project has Tailwind configured:

```typescript
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default {
  plugins: [tailwindcss()],
};
```

### Customization

Components use Tailwind classes and can be customized through props and CSS overrides:

```typescript
<TaskItem task={task} className="custom-class" />
```

## Configuration

### TasksTimelineApp Props

```typescript
interface TasksTimelineAppProps {
  className?: string;
  taskRepository?: TaskRepository;
  settingsRepository?: SettingsRepository;
  apiKey?: string;
  systemInDarkMode?: boolean;
  onItemClick?: (item: Task) => void;

  // External synchronization callbacks (v0.0.4+)
  onTaskAdded?: (task: Task) => void | Promise<void>;
  onTaskUpdated?: (task: Task, previous: Task) => void | Promise<void>;
  onTaskDeleted?: (taskId: string, previous: Task) => void | Promise<void>;
}
```

**Synchronization Strategy:**
- If callbacks (`onTaskAdded`, etc.) are provided, they take priority
- Otherwise, falls back to `taskRepository` methods
- Callbacks receive both new and previous state for conflict resolution
- All callbacks support async/await for database operations

### Theme

```typescript
const settings: AppSettings = {
  theme: "dark",
  dateFormat: "MMM d, yyyy",
  // ...
};
```

### AI Integration

```typescript
const settings: AppSettings = {
  aiConfig: {
    enabled: true,
    activeProvider: "gemini",
    providers: {
      gemini: {
        apiKey: "your-api-key",
        model: "gemini-3-flash-preview",
        baseUrl: "",
      },
      // ... other providers
    },
  },
};
```

## Development

### Setup

```bash
git clone <repository>
cd tasks-timeline
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

### Run Storybook

```bash
pnpm storybook
```

### Build Library

```bash
pnpm build:lib
```

### Build Demo App

```bash
pnpm build
```

## Project Structure

```
src/
├── components/        # UI Components
├── hooks/            # Custom React Hooks
├── types.ts          # Type Definitions
├── utils.ts          # Utilities
├── storage.ts        # Browser Storage
├── App.tsx           # Demo Application
└── index.ts          # Library Entry Point
```

## Development

### Local Development

```bash
# Install dependencies
pnpm install

# Start Storybook (interactive documentation)
pnpm storybook

# Run type checking
pnpm type-check

# Run linter
pnpm lint

# Build library
pnpm build
```

### Example Application

The `examples/app/` directory contains a fully functional demo application:

```bash
# Run example app
pnpm dev:example

# Build example app
pnpm build:example
```

## Publishing

### Automated Publishing (GitHub Actions)

This project uses GitHub Actions to automate the build, testing, and publishing process.

**Requirements:**

1. Set up `NPM_TOKEN` secret in GitHub repository settings
2. Ensure main branch is protected with required status checks

**To publish a new version:**

```bash
# 1. Update version in package.json
npm version patch  # or minor/major

# 2. Push to trigger GitHub Actions workflow
git push origin main --tags
```

The workflow will automatically:

- ✅ Run all tests (lint, type-check, build)
- ✅ Create a GitHub release
- ✅ Publish to npm
- ✅ Deploy Storybook to GitHub Pages

**Alternative:** Use `npm publish` directly (requires npm authentication):

```bash
npm publish --access public
```

See [.github/WORKFLOW_SETUP.md](.github/WORKFLOW_SETUP.md) for detailed setup and troubleshooting.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:

- Setting up your development environment
- Code style and standards
- Adding new components or hooks
- Writing Storybook stories
- Submitting pull requests
- Commit message conventions

**Quick start for contributors:**

```bash
git clone <repository>
cd tasks-timeline
pnpm install
pnpm storybook  # View components
pnpm type-check  # Verify types
pnpm lint        # Check code style
```

## Documentation

- See [LIBRARY_SETUP.md](./LIBRARY_SETUP.md) for detailed setup and architecture
- Visit Storybook (run `pnpm storybook`) for interactive component documentation
- Check individual component files for JSDoc comments
- Read [.github/WORKFLOW_SETUP.md](.github/WORKFLOW_SETUP.md) for CI/CD configuration
-   Write down every design you made in the ./.prd/ folder and keep them updated.


## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari 14+

## Peer Dependencies

- React 18.2.0+
- React DOM 18.2.0+

## License

MIT © zhuwenq
