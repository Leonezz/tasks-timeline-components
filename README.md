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
import "@tasks-timeline/components/index.css";

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

### Entry Points

| Import                                    | Contents                                         | Formats                  |
| ----------------------------------------- | ------------------------------------------------ | ------------------------ |
| `@tasks-timeline/components`              | Everything: components, hooks, types, utilities  | ESM, CommonJS (UMD)      |
| `@tasks-timeline/components/components`   | Components only                                  | ESM, CommonJS            |
| `@tasks-timeline/components/hooks`        | Hooks only                                       | ESM, CommonJS            |
| `@tasks-timeline/components/types`        | Types only (the runtime modules are empty)       | ESM, CommonJS            |
| `@tasks-timeline/components/capabilities` | AI capabilities layer, no React or DOM           | ESM                      |
| `@tasks-timeline/components/tasks-format` | Obsidian Tasks parse/serialize, no React or DOM  | ESM                      |
| `@tasks-timeline/components/index.css`    | Stylesheet                                       | CSS                      |

`/components` and `/hooks` re-export from the main bundle rather than shipping
their own copy, so mixing them with the main entry is safe: a component or hook
is the same object whichever path you import it from, and React contexts are
shared.

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
| `Icon`           | Renders a bundled Lucide icon by name       |

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

Handle voice input with the configured provider (browser Web Speech API,
OpenAI Whisper or Gemini).

```typescript
const { isListening, start, stop, unavailableMessage } = useVoiceInput(
  settings.voiceConfig,
  (transcript) => appendText(transcript),
  (message) => showError(message),
  voiceRuntime, // optional, see "Voice Input" below
);
```

`unavailableMessage` is set when the host has ruled out the active provider.
`start()` then reports it through the error callback instead of starting.

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
import "@tasks-timeline/components/index.css";
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

  // How the task editor writes edited recurrence rules (default "auto")
  recurrenceFormat?: "auto" | "text";

  // AI agent (see "AI Capabilities" below)
  aiSystemPrompt?: string;
  aiProviderFactory?: AIProviderFactory;
  aiFetch?: typeof fetch; // Unreleased: fetch for the built-in providers
  aiCapabilityContext?: CapabilityContext;
  aiCapabilities?: Capabilities;
  aiExtraTools?: ToolSpec[]; // v0.6.0+: host tools appended to the built-ins
  aiMaxToolRounds?: number; // v0.6.0+: default 16
  onAgentEvent?: (event: AgentEvent) => void;

  // Voice input (see "Voice Input" below)
  voiceRuntime?: VoiceRuntime;
}
```

- `aiExtraTools` are appended after the built-in tools. A name that collides with a
  built-in tool (or another extra tool) throws. Passing both `aiCapabilities` and a
  non-empty `aiExtraTools` throws — add extra tools via
  `createCapabilities(ctx, { extraTools })` when you build your own capabilities.
- `aiFetch` replaces the global `fetch` for every request the built-in AI providers
  make, in the agent and in the Settings **Test Connection** button. See
  "Routing provider requests through the host" below. Passing both `aiFetch` and
  `aiProviderFactory` throws: a custom factory makes its own requests.
- **Test Connection** uses `aiProviderFactory` when one is given, so it tests the
  same provider the agent will use.
- `aiMaxToolRounds` bounds the number of tool-call rounds per agent turn. When the
  limit is reached the agent stops calling the provider and reports
  `Stopped after N tool rounds without a final answer` as an agent error.
- `recurrenceFormat="text"` makes the task editor write recurrence as Obsidian
  Tasks text (`every 2 weeks on Monday until December 31, 2026`). Set it when you
  store tasks as Obsidian Tasks lines, which can't hold RRULE syntax or a start
  date. `"auto"` writes text for text rules and tasks from the Obsidian Tasks
  parser, and RRULE syntax otherwise. When the editor writes text, its preview
  is the text that saving writes. The built-in agent's
  task tools follow it too (see `recurrenceFormat` under AI Capabilities).
- **Repairing lines written by v0.8.0.** v0.8.0 wrote a rule with a start
  date on two lines, which splits the task line in the note:

  ```markdown
  - [ ] Report 📅 2026-10-16 🔁 DTSTART:20261016T000000Z
  RRULE:FREQ=WEEKLY
  ```

  Only `DTSTART:…` stays in the task, which can't be read as a rule, so saving
  or completing the task fails with an error that explains the fix. Repair it
  by hand: delete the `RRULE:` line below the task and replace
  `🔁 DTSTART:…` with the rule as Obsidian Tasks text, such as
  `🔁 every week`. Put the start date in `🛫` if the task needs one. Lines
  v0.8.0 wrote without a start date (`🔁 RRULE:FREQ=WEEKLY;BYDAY=MO`) are
  repaired automatically on the next save.
- When saving from the task editor, a rejected `onTaskUpdated` keeps the editor
  open with the error and the user's changes. The editor refuses to save when
  the task now at that id is not the one it opened (ids that are line positions
  can move to another task after a reload) or changed since, and passes the
  opened version as `previous`. It compares `extra.rawText` when both versions
  have one, and otherwise every stored field the save writes back (title,
  description, workflow status, priority, category, tag names and colors,
  dates, recurrence and the other `extra` fields).
- `DEFAULT_SETTINGS` (the built-in default `AppSettings`) is exported from the main
  entry.
- If `settingsRepository.loadSettings()` rejects, the app runs with in-memory
  defaults, shows an error toast, and does not save settings for the rest of the
  session (so stored settings are never overwritten with defaults). Rejected saves
  are caught and shown as an error toast.

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

Requests go straight from the browser to the provider (unless the host passes
`aiFetch`, see below). The Anthropic provider sends the
`anthropic-dangerous-direct-browser-access: true` header that Anthropic
requires for browser (and Electron, e.g. Obsidian) requests, so your API key is
visible to anyone who can inspect the page.

#### Routing provider requests through the host

Some providers reject browser requests (CORS). Hosts with their own HTTP client
can pass it as `aiFetch`. The built-in providers then send every request
through it, including **Test Connection**. `aiFetch` is a runtime prop and is
never saved with the settings.

```typescript
import { requestUrl } from "obsidian";

// Sketch: adapt Obsidian's requestUrl (not subject to CORS) to fetch. It does
// not stream, which is fine: the built-in providers make plain requests.
const obsidianFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const response = await requestUrl({
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: hasBody ? await request.text() : undefined,
    throw: false,
  });
  return new Response(response.arrayBuffer, {
    status: response.status,
    headers: response.headers,
  });
};

<TasksTimelineApp {...props} aiFetch={obsidianFetch} />;

// If you render SettingsPage yourself (e.g. in a plugin settings tab), pass the
// same value so Test Connection goes through it too.
<SettingsPage {...settingsProps} aiFetch={obsidianFetch} />;
```

`aiFetch` must resolve to a fetch `Response`; any other result (such as a raw
`requestUrl` result) fails with an explicit error, and so does a value that is
not a function. Nothing falls back to the global `fetch`. Errors your fetch
throws are shown as agent errors and as failed connection tests.

`aiFetch` cannot be combined with `aiProviderFactory`: `TasksTimelineApp`
throws when it renders, and **Test Connection** reports a failed test. A custom
factory makes its own requests, so use your fetch inside the factory instead.

### Voice Input

The default voice provider is the browser's Web Speech API. Some embedded
browsers, such as Electron apps, expose `SpeechRecognition` with no speech
service behind it, so recognition always fails. A host that knows this can
declare it through `voiceRuntime`:

```tsx
<TasksTimelineApp
  voiceRuntime={{ browserSpeechSupported: false }}
  // ...
/>
```

With `browserSpeechSupported: false`:

- `BrowserVoiceProvider.isAvailable()` returns `false`.
- Settings → AI disables the **Browser** voice provider and explains why.
- The voice button shows, and reports on click, "Browser speech recognition
  isn't available here. Choose OpenAI or Gemini as the voice provider in
  Settings → AI." It doesn't start recognition.

Leave the flag unset to keep detecting support from the window. If you render
`SettingsPage` or `SettingsModal` yourself, pass them the same `voiceRuntime`.
See [docs/VOICE_INPUT.md](docs/VOICE_INPUT.md) for details.

### AI Capabilities

The framework-agnostic capabilities layer can be wired to the built-in agent or to
any transport (for example an MCP server):

```typescript
import { createCapabilities } from "@tasks-timeline/components/capabilities";
import type {
  CapabilityContext,
  CreateCapabilitiesOptions,
} from "@tasks-timeline/components/capabilities";

const ctx: CapabilityContext = {
  getTasks, getTask, addTask, updateTask, deleteTask,
  // Optional UI callbacks: notify, showToast, confirm, select, prompt
  confirm: (title, description) => askUser(title, description),
  // What destructive tools do when `confirm` is absent (default "require")
  confirmPolicy: "require",
  // "text" when you store tasks as Obsidian Tasks lines (default "auto")
  recurrenceFormat: "auto",
};

const options: CreateCapabilitiesOptions = {
  extraTools: [myHostTool], // appended after built-ins; names must be unique
  extraResources: [],
  extraPrompts: [],
};

const capabilities = createCapabilities(ctx, options);
await capabilities.executeTool("delete_task", { id: "task-1" });
```

- `createCapabilities(ctx, options?)` throws at creation time if an extra tool,
  resource or prompt reuses a built-in name or another extra's name.
- `executeTool()` never throws for a tool failure: an exception from a tool's
  `execute` becomes `{ name, result: { error: message } }`. Unknown tools return
  `{ name, result: { error: "Unknown tool: <name>" } }`.
- **Confirmation policy (v0.6.0+).** Destructive tools (`delete_task`,
  `batch_update_tasks`, and the settings-changing tools `update_view_settings`,
  `set_task_filters`, `set_task_sort`, `reset_view_settings`) ask `ctx.confirm`
  first. If the host provides no `confirm`:
  - `confirmPolicy: "require"` (default) — the action is **not** performed and the
    tool returns `{ success: false, error }` explaining that confirmation is required.
  - `confirmPolicy: "skip"` — the action proceeds without asking (pre-0.6.0
    behavior). Headless hosts such as MCP servers should set this explicitly.
- **Asking the user.** `confirm` resolves `true` for yes, `false` for no and
  `null` when the user closes the question; `select` and `prompt` resolve the
  answer or `null`. `ask_user` reports `null` as `dismissed: true`. When the
  host can no longer ask (the built-in app after unmount), the callback should
  reject: `ask_user` then returns `{ question, answer: null, error }` and
  destructive tools return an error instead of waiting forever.
- **Recurrence arguments.** `create_task`, `update_task` and
  `batch_update_tasks` accept RRULE syntax or Obsidian Tasks text. Text is
  stored in the library's own words and returned as `understoodAs`; text with
  words the parser would skip, an incomplete or impossible "until" date
  (February 30) or an end date that has passed is rejected. Abbreviations
  ("Mon", "Sept"), ordinals ("the first Monday", "the last day" of a monthly
  rule or a yearly one in given months), "weekdays", and any letter case or
  spacing are accepted. Hourly, minutely and secondly
  rules are computed by day; the few combinations that can't be (time-of-day
  parts on a step that doesn't divide a day, or within each hour together
  with `COUNT`, `BYSETPOS` or an `UNTIL` time) are rejected as unsupported,
  and `complete_task` returns the same error for such a stored rule.
- **Hosts that store Obsidian Tasks text** set `recurrenceFormat: "text"` on
  the context (`TasksTimelineApp` sets it on the built-in agent's context from
  its `recurrenceFormat` prop). The three tools then store RRULE syntax as
  Obsidian Tasks text (`FREQ=WEEKLY;BYDAY=MO` → `every week on Monday`,
  returned as `understoodAs`) and reject rules a Tasks line can't hold before
  saving anything or asking for confirmation, with a message the model can act
  on (for `DTSTART`: "remove DTSTART; set the task's startAt instead").
- **`notify_user` without `showToast`.** The tool falls back to
  `ctx.notify(variant, "title: description")` and returns
  `{ success: true, degraded: true, warning }`. With neither callback it
  returns `{ success: false, error }`. Notifications stay until dismissed
  unless the model passes a `timeout`.

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

### Run Tests

```bash
# Unit tests (Node)
pnpm test

# Storybook play tests (headless Chromium via Playwright)
pnpm test-storybook
```

The Storybook tests need the Chromium headless shell that matches the
installed Playwright version. Install it once, and again after upgrading
Playwright:

```bash
pnpm exec playwright install chromium-headless-shell
```

### Build Library

```bash
pnpm build:lib
```

This writes `dist/`: the main bundle (`index.js`, `index.umd.cjs`,
`index.css`), the standalone `capabilities/` and `tasks-format/` modules, the
`.d.ts` declarations with a CommonJS `.d.cts` twin of each for `require`, and
the `index.js`/`index.cjs` entries of `components/`, `hooks/` and `types/`
(see [Entry Points](#entry-points)). The build fails if a declaration has a
specifier consumers can't resolve or a CommonJS declaration loads an ES module
(`pnpm check:declarations`), or if any `package.json` entry point points at a
missing file or at types of the wrong module format (`pnpm check:exports`).

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
