# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **`ask_user` confirm answers were swapped (#33).** In the built-in app,
  clicking **No** reported `dismissed: true` and closing the question with
  **X** reported `answer: "no"`. **No** now resolves `false` (`answer: "no"`)
  and **X** resolves `null` (`dismissed: true`). Closing a select or prompt
  question with **X** now resolves `null` instead of `false`.
- **Agent turns no longer hang when the app unmounts mid-question (#33).**
  Questions still waiting at unmount reject, and later `confirm`/`select`/
  `prompt` calls reject immediately. `ask_user` reports this as
  `{ question, answer: null, error }`; destructive tools return an error.
- `ask_user` declares the `description` argument it already passed to
  `confirm`, so models can send it.
- **`notify_user` no longer reports success when nothing was shown (#33).**
  See Changed.
- `batch_update_tasks` showed two notifications for one batch (a rich toast
  and a plain one). It now shows the rich toast, or `ctx.notify` when the host
  has no `showToast`.
- **Duplicate React key warning and over-eager tag removal (#8).** Tags that
  share an id (tags parsed from text such as `#TODO`) rendered with duplicate
  keys in the overflow tag popover, and removing one removed every tag with
  that id. Keys and removal now use the tag's position.
- **Invalid `transform-origin` CSS (#8).** Popover and dropdown menu content
  used Tailwind v3 syntax that Tailwind v4 compiled to
  `transform-origin: --radix-…`, which Chromium reports as a deprecated
  `:--radix-*` custom state. They now use `var(--radix-…)`.
- **Long task titles wrap instead of truncating (#12).** Inline
  `MarkdownText` no longer forces `white-space: pre-wrap`; it inherits
  white-space from its parent, so the title button's `truncate` applies again.
- **Anthropic requests fail in browser hosts (#15).** The Anthropic provider
  sends the `anthropic-dangerous-direct-browser-access: true` header again
  (dropped in the AI SDK migration), so requests from browsers and Electron
  hosts such as Obsidian pass Anthropic's CORS check. This also fixes the
  Settings **Test Connection** button for Anthropic.
- **Dates could not be cleared.** Since the native date inputs were replaced
  by the calendar picker (0.0.6), the calendar always reported a day, so the
  task badges' date popovers and the edit modal's Due, Start At and Completed
  fields could change a date but never remove it. Clicking the selected day
  again now deselects it (`onSelect(undefined)`, as in react-day-picker's
  single mode); saving then writes `""`. The edit modal's Created field still
  keeps its date when cleared, as before.
- **Calendar picker accessibility.** Day buttons were announced by their
  number alone and didn't expose which day was selected. They are now named
  by the full date (for example "Tuesday, March 10, 2026") and set
  `aria-pressed`, since clicking the selected day clears it. The month
  buttons are named "Previous month" and "Next month". The **Time** label in
  the task badges' date popovers and in `DatePicker` is now associated with
  its input.
- Task date badges are named like the category and priority badges, for
  example "Change due date for Write report. Current due date: Today", instead
  of by their visible label alone ("Due: Today").

### Changed

- `notify_user` without `ctx.showToast` falls back to
  `ctx.notify(variant, "title: description")` and returns
  `{ success: true, degraded: true, warning }`. With neither callback it
  returns `{ success: false, error }` instead of `{ success: true }`.
- The system prompt no longer says `notify_user` can show detail blocks; it
  never accepted them.
- Inline `MarkdownText` (`inline` prop) inherits white-space from its parent.
  Pass `paragraphClassName="whitespace-pre-wrap"` to keep line breaks.

## [0.8.0] - 2026-10-14

### Changed

- `CapabilityContext.addTask` and the `onTaskAdded` prop may return the
  stored task. Hosts that store tasks under their own ids (a database key, a
  file position) should return it: the `create_task` tool now reports the
  stored task's id, so the agent can update or complete the task it just
  created. Hosts that return nothing keep the previous behavior.

## [0.7.0] - 2026-10-13

### Added

- `@tasks-timeline/components/capabilities` now ships real JavaScript
  (`dist/capabilities/index.js`, ES module, luxon external). Previously the
  subpath only had type declarations. It contains `createCapabilities`,
  `getSystemPrompt` and the capability types, with no React or DOM
  dependency, so headless hosts (MCP servers, a Zotero plugin sandbox) can
  use the task tools without loading the UI bundle.

## [0.6.0] - 2026-10-13

### Added

- **`DEFAULT_SETTINGS` export** — the built-in default `AppSettings` now lives in `src/defaultSettings.ts` and is exported from the main entry. No behavior change.
- **Host-provided capabilities** — `createCapabilities(ctx, options?)` accepts `CreateCapabilitiesOptions` (`extraTools`, `extraResources`, `extraPrompts`). Extras are appended after the built-ins and are reachable through the `tools`/`resources`/`prompts` arrays, `getTool`/`getResource`/`getPrompt` and `executeTool`. A name that collides with a built-in or another extra throws at creation time. `CreateCapabilitiesOptions` and `ConfirmPolicy` are exported from `./capabilities` and the main entry.
- **`aiExtraTools` prop** on `TasksTimelineApp` (and `extraTools` option on `useAIAgent`) — extra host tools for the built-in agent. Passing both `aiCapabilities` and a non-empty `aiExtraTools` throws.
- **`aiMaxToolRounds` prop** on `TasksTimelineApp` (and `maxToolRounds` option on `useAIAgent`, default 16) — bounds tool-call rounds per agent turn. When reached, the agent stops calling the provider, keeps the session history well-formed, and reports `Stopped after N tool rounds without a final answer` as an `error` agent event and error notification.
- **`confirmPolicy?: "require" | "skip"`** on `CapabilityContext` (default `"require"`).

### Changed

- **BREAKING (behavior): destructive tools now require confirmation.** `delete_task`, `batch_update_tasks` and the settings-changing tools (`update_view_settings`, `set_task_filters`, `set_task_sort`, `reset_view_settings`) no longer proceed silently when the host provides no `confirm` callback. With the default `confirmPolicy: "require"` they do not perform the action and return an error result explaining that confirmation is required. Hosts without `confirm` (for example an MCP server) must set `confirmPolicy: "skip"` to keep the previous behavior. Behavior when `confirm` is provided is unchanged.
- `executeTool()` turns an exception thrown by a tool's `execute` into a tool result `{ name, result: { error: message } }` instead of propagating, so one failing tool no longer aborts the agent loop. Unknown-tool behavior is unchanged.
- In the built-in agent's capability context, `updateTask`/`deleteTask` throw `Task not found: <id>` for unknown ids instead of silently doing nothing (surfaced to the model as a tool error result).

### Fixed

- **Settings are no longer overwritten with defaults after a failed load.** If `settingsRepository.loadSettings()` rejects, the app keeps working with in-memory defaults, shows an error toast once, and does not persist settings for the rest of the session. A `null` load (first run) still counts as a successful load.
- Rejected `settingsRepository.saveSettings()` calls are caught and shown as an error toast (once per distinct error) instead of becoming unhandled promise rejections.

## [0.0.12] - 2026-01-31

### Fixed

- **Calendar date picker timezone bug** (#13)
  - Fixed DatePicker component to use `toISODate()` for date-only selections instead of `toISO()`
  - Prevents timezone conversion issues where selecting Feb 5 would save as Jan 5 in certain timezones
  - Added timezone-safe date helper utilities in `utils/date-helpers.ts`
  - Added `useDateHelpers` React hook for consistent date handling

### Added

- **Centralized timezone-safe date handling system**
  - New utilities: `getTodayISO()`, `getNowISO()`, `getTomorrowISO()`, etc.
  - Custom ESLint rules to prevent dangerous date patterns like `new Date().toISOString().split("T")[0]`
  - Comprehensive documentation in CLAUDE.md about timezone-safe patterns
  - Storybook stories for DatePicker with timezone consistency tests

### Changed

- Updated ESLint configuration to use standard flat config format
- Enhanced documentation with timezone safety guidelines

## [0.0.11] - 2026-01-29

### Fixed

- Resolve duplicate React key warning when rendering task tags (#8)
  - Changed tag key from `tag.id` to `${task.id}-tag-${index}` to handle external systems that provide non-unique tag IDs

### Changed

- Updated `@radix-ui/react-popover` to latest version

### Known Issues

- Radix UI CSS deprecation warnings (`:--radix-*` → `:state(radix-*)`) are a known upstream issue that will be resolved when Radix releases an update

## [0.0.10] - 2026-01-29

### Changed

- Updated all dependencies to latest versions
- Added `@vitest/browser` and `@vitest/browser-playwright` for browser testing

### Fixed

- Fixed TypeScript errors from `react-error-boundary` v6 update where `FallbackProps.error` changed from `Error` to `unknown`

## [0.0.9] - 2026-01-29

### Fixed

- Explicitly include README.md in package files

## [0.0.8] - 2026-01-29

### Fixed

- Fixed package name references in README.md (was incorrectly using `@tasks-timeline/component-library`)

## [0.0.7] - 2026-01-29

### Added

- Added repository, bugs, homepage, and keywords metadata to package.json

### Changed

- Updated deprecated GitHub Actions in CI workflow
- Excluded stories and test files from npm package build

## [0.0.6] - 2026-01-29

### Added

- Initial public release with core components:
  - TodoList, TaskItem, InputBar, DaySection, YearSection, BacklogSection
  - TaskEditModal, SettingsModal, HelpModal
  - Toast notifications, Icon component
- Custom hooks: useTaskFiltering, useTaskStats, useAIAgent, useVoiceInput
- Full TypeScript support
- Tailwind CSS v4 integration
- AI integration support (Gemini, OpenAI, Anthropic)
