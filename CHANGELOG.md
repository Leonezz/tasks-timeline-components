# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **`aiFetch` prop** on `TasksTimelineApp` (and `fetch` option on
  `useAIAgent`): a `fetch` implementation for every request the built-in AI
  providers make. Electron hosts such as Obsidian can route provider calls
  through their own HTTP client (for example `requestUrl`) and reach
  providers that do not allow browser CORS. The Settings **Test Connection**
  button uses it too. It is a runtime option, never stored in
  `ProviderConfig` or settings. Passing both `aiFetch` and
  `aiProviderFactory` throws (Test Connection reports it as a failed test),
  because a custom factory makes its own requests and the fetch would be
  ignored. An `aiFetch` that is not a function, or that resolves to something
  other than a fetch `Response` (such as an unconverted Obsidian `requestUrl`
  result), fails with an explicit error; there is no fallback to the global
  `fetch`. Errors the host fetch throws reach the agent and Test Connection
  unchanged.
- `SettingsPage`, `SettingsModal` and `SettingsPageAI` accept `aiFetch` and
  `aiProviderFactory` for **Test Connection**. Hosts that render
  `SettingsPage` themselves (such as a plugin settings tab) should pass the
  same values they give `TasksTimelineApp`.

### Fixed

- **Obsidian recurring tasks were not treated as recurring.** The Obsidian
  Tasks parser set `recurringInterval` (`🔁 every week`) but not
  `isRecurring`, so `complete_task` created no next occurrence, the
  **Recurring** badge was hidden, stats did not count them, and the
  `recurring` filters of `query_tasks` and `batch_update_tasks` missed them.
  The parser now sets `isRecurring: !!recurringInterval`, and all of these use
  `isTaskRecurring()` (`isRecurring ?? !!recurringInterval`) so tasks from
  hosts that never set the flag work too.
- **`complete_task` copied the completed task's dates to the next
  occurrence.** It now moves them: the due date (else scheduled, else start
  date) advances to the rule's next date, "when done" rules advance from the
  completion date, and the other dates keep their offset. It reads RRULE and
  Obsidian Tasks text rules and keeps the rule text verbatim. A rule it cannot
  read returns an error and completes nothing; a rule that has ended completes
  the task without a next occurrence.
  - A task that is already done is left alone and reported with
    `alreadyCompleted: true`, so completing a finished Obsidian line again, or
    retrying after a failed write, no longer adds another occurrence.
  - Plain monthly and yearly text rules follow Obsidian Tasks at month ends:
    `every month` from Jan 31 gives Feb 28 (not Mar 31), `every year` from
    Feb 29 gives Feb 28. RRULE-syntax rules keep RFC 5545 behaviour.
  - Start and end dates are calendar dates in every time zone, and the next
    date is always at least a day later. Before, a rule with a start date
    could return the same day (repeat completions piled up copies) or skip a
    week depending on the time zone, `BYHOUR`/timed `DTSTART` rules returned
    the same day, and an end date could allow one extra occurrence.
- **Malformed recurrence rules were accepted.** Rules without `FREQ`
  (`INTERVAL=2` was read as yearly), with `INTERVAL` below 1 (a negative
  interval never finished) or with a fractional interval are now unreadable.
  `create_task`, `update_task` and `batch_update_tasks` reject unreadable
  rules before saving. `UNTIL=2026-12-31` and `DTSTART:2026-01-05` are
  accepted as well as the RFC form `UNTIL=20261231`. `create_task` with an
  empty `recurrence` creates a non-recurring task.
- **Edited Obsidian rules were written as RRULE syntax.** `🔁 RRULE:FREQ=…`
  read back as the rule "RRULE" with the rest in the title, and a start date
  split the task line. The task editor now saves Obsidian rules as text
  (`every 2 weeks on Monday until December 31, 2026`, keeping `when done`)
  and shows an error instead of saving a start date, which those rules can't
  hold. `formatTasksMetadata` writes RRULE-syntax rules (for example from
  `create_task`) as text, including `UNTIL` as "until <date>", and throws for
  rules with a start date rather than writing a broken line.
  - Text conversion compares days, months and month days as sets, so rules
    with days out of order (`BYDAY=FR,MO`, or adding Wednesday to "every week
    on Monday, Friday") are saved, and `FREQ=DAILY;BYDAY=…` is written as a
    weekly rule ("every weekday").
  - The editor writes text for every task the Obsidian Tasks parser read
    (`extra.isTasksTask` set), not only lines that already had Tasks dates,
    and for all tasks when the new `recurrenceFormat="text"` prop is set on
    `TasksTimelineApp` (or `TaskEditModal`). Hosts that store tasks as
    Obsidian Tasks lines should set it.
- **A failed save closed the task editor and lost the edits.** The editor now
  waits for the host's `onTaskUpdated`; if it rejects, the editor stays open
  with the error and the user's changes. `TaskEditModal`'s `onSave` may
  return a promise.
- **Recurrence dates from other writers were read a day off.** Rules saved by
  earlier versions of the editor (local midnight start, local end of day) are
  read in local time again, rules with `TZID` keep their own days instead of
  being moved by the machine's zone, `DTSTART;VALUE=DATE:` start dates are
  read, and impossible dates (`UNTIL=20270229`, month 13) make the rule
  unreadable instead of rolling over.
- **Rules that can never match ended the series.** A rule without `UNTIL` or
  `COUNT` that has no later date (`FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=30`) now
  makes `complete_task` fail and change nothing, instead of completing the
  task and reporting that the recurrence ended. The search is bounded, and
  hourly, minutely and secondly rules are computed as daily, since tasks are
  day-based.
- **Recurrence text with punctuation corrupted Obsidian Tasks lines.** A line
  only holds letters, digits, spaces, commas and "!" after 🔁, so
  `every month until 2026-12-31` was read back as "every month until 2026"
  with "-12-31" in the title. Numeric end dates are now written out
  (`until December 31, 2026`, always in English); other text a line can't
  hold (`Monday-Friday`, `Monday & Friday`, a trailing ".") is rejected by
  `create_task`, `update_task` and `batch_update_tasks` and by
  `formatTasksMetadata`, and is unreadable rather than misread.
- **Far-off next dates and slow rules.** The next date is no longer searched
  only 10 years ahead, so rules such as February 29th every 3 years or
  Christmas on a Sunday complete again, and an `UNTIL` beyond that window no
  longer ends the series early. Daily and weekly rules limited by month or
  day of month are checked a year at a time, so one that never matches fails
  in milliseconds instead of seconds. Hourly rules step by their interval
  ("every 48 hours" moves two days).
- **Editing a rule dropped parts the editor can't show.** The editor shows
  which parts it can't show (ordinal weekdays such as the 2nd Monday, COUNT,
  months on a weekly rule, BYSETPOS, a week start, hourly frequencies) and
  keeps such a rule as written unless its settings change, which it says
  replaces the rule. A daily rule on weekdays is shown as a weekly rule.
- Text conversion handles duplicate days and all seven days ("every day";
  listed out when the rule skips weeks), and refuses rules whose `WKST` or
  `BYEASTER` text can't hold.
- A save that finishes after its editor closed no longer closes an editor
  opened since, and its failure shows as a notification.
- Start and end dates: floating times without `Z` are read as written, a
  date-only `UNTIL` with `TZID` is read as written, a `TZID` rule whose UTC
  `UNTIL` falls before the start's time that day ends a day earlier, an
  unknown `TZID` makes the rule unreadable instead of failing to open the
  editor, `DTSTART=` is read, and hour 24 is rejected.
- **A save from an editor opened before a reload could overwrite another
  task.** Hosts that use line positions as ids (the Obsidian plugin) can give
  a task's id to a different task after reloading. The task editor now keeps
  the task as it opened it and refuses to save when the task now at that id is
  a different one or changed elsewhere ("This task changed since you opened
  it — close and reopen it"), comparing `extra.rawText` when both have it and
  the title and dates otherwise. Editor saves pass that opened version to
  `onTaskUpdated` as `previous`.
- **Recurrence text the parser only partly understood was saved with a
  different meaning.** rrule's text parser skips words it doesn't know
  ("every day except Sunday" read as "every day", "every year on December 25"
  as every December). The task tools now store text in the library's own
  words, return it as `understoodAs`, and reject text with skipped words, an
  "until" without a month, day and year, "when done" anywhere but the end,
  a repetition count ("for 3 times", which never ends without a start
  date), and an end date before today or the task's date. Lines already in a vault
  are written back unchanged.
- **Next dates for weekly rules with month days, and slow rules.** A weekly
  rule with a day of the month, day of the year, week number or Easter
  repeats on any weekday, as rrule computes it, not only its start's
  weekday; ordinal weekdays in daily and weekly rules count as plain ones;
  `COUNT` no longer limits the quick existence check of rules that skip
  periods; hourly rules with day filters keep whole-day intervals; and daily
  rules with `BYSETPOS` other than 1 or -1 fail fast instead of taking
  seconds.
- **"Last day of the month" in the task editor.** The day buttons now include
  "Last day", so "every month on the last" can be shown and edited; other
  days counted from the month's end are flagged as parts the editor can't
  show, and dropped when its settings change.
- Yearly rules that skip years and name months ("every 2 years on the 1st in
  June") can be written as Obsidian Tasks text.
- **Lines written by v0.8.0 were split by the parser.** The recurrence after
  🔁 is read as rule text (the characters Obsidian Tasks reads), plus the two
  shapes v0.8.0 wrote: RRULE syntax (`🔁 RRULE:FREQ=WEEKLY;BYDAY=MO`) and a
  numeric end date (`🔁 every month until 2026-12-31`). Those no longer leave
  part of the rule in the title, and writing such a line repairs it to text
  (`🔁 every week on Monday`). The rule stops at the next field (🏁, ❌, 🆔,
  ⛔, ⏰, dates, priorities, `[[links]]`, `#tags`), and `🔁` followed by
  U+FE0F is read.
- `complete_task` reports when it marked the task done but could not add the
  next occurrence, with the occurrence's details so it can be created with
  `create_task` (all its fields, including the description).
  `create_task`, `update_task` and `batch_update_tasks` reject a `recurrence`
  that isn't a string; `null` clears it like `""`.
- **Saving a task in the edit modal dropped its recurrence.** Tasks parsed
  from Obsidian Tasks lines (`🔁 every week`) have a rule but no `isRecurring`
  flag, and the modal only read RRULE syntax, so it showed them as
  non-recurring and saved `recurringInterval: undefined`. The modal now treats
  a missing flag as `!!recurringInterval`, reads both RRULE and rrule text
  rules, and keeps the stored rule verbatim unless the recurrence controls are
  changed. A rule the controls cannot show is displayed as text and kept.
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
- **Test Connection ignored `aiProviderFactory`.** The Settings button always
  tested the built-in provider, even when the host's factory supplied the one
  the agent uses. It now tests the provider from `aiProviderFactory` when one
  is given.
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
- The system prompt documents end dates as `UNTIL=YYYYMMDD` and tells the
  model not to use `COUNT`, which never ends a series that restarts on each
  completion.
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
