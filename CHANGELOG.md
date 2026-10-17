# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **`VoiceRuntime.browserSpeechSupported` (#51).** A host that knows browser
  speech recognition can't work (for example an Electron app whose Web Speech
  API has no speech service) can set it to `false`. Then
  `BrowserVoiceProvider.isAvailable()` returns `false`, Settings → AI disables
  the **Browser** voice provider with an explanation, and the voice button
  tells the user to choose OpenAI or Gemini instead of starting and failing.
  Hosts that leave it unset behave as before.
- `SettingsPage`, `SettingsModal` and `SettingsPageAI` accept `voiceRuntime`.
  `TasksTimelineApp` passes its own `voiceRuntime` to the settings modal.
- `useVoiceInput` returns `unavailableMessage`, set when the host has ruled
  out the active provider. The built-in voice buttons show it as their
  tooltip.
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
- Obsidian Tasks dependency and lifecycle fields on `Task`, all optional:
  `onCompletion` (🏁, `"keep"` or `"delete"`), `taskId` (🆔, not the host's
  `id`) and `dependsOn` (⛔, a list of `taskId`s). `parseTasksFormatItem`
  reads them and `cancelledAt` (❌); `taskToMarkdown` and
  `formatTasksMetadata` write them. A value a line can't hold (an id with a
  space, an action with punctuation) throws instead of breaking the line.
- `tasks-format` exports `createdDateSymbol`, `cancelledDateSymbol`,
  `onCompletionSymbol`, `idSymbol` and `dependsOnSymbol`, and
  `TaskRegularExpressions` has `cancelledDateRegex`, `onCompletionRegex`,
  `idRegex` and `dependsOnRegex`.

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
  task and reporting that the recurrence ended. The search is bounded.
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
  it — close and reopen it"), comparing `extra.rawText` when both have it.
  Otherwise (JSON or localStorage hosts) it compares every stored field the
  save writes back: title, description, workflow status, priority, category,
  tags (by name and color), dates, the recurrence rule and switch, and the
  other `extra` fields, so a change the agent made while the editor was open
  is no longer silently reverted (#45). Editor saves pass that opened version
  to `onTaskUpdated` as `previous`.
- **Recurrence text the parser only partly understood was saved with a
  different meaning.** rrule's text parser skips words it doesn't know
  ("every day except Sunday" read as "every day", "every year on December 25"
  as every December). The task tools now store text in the library's own
  words, return it as `understoodAs`, and reject text with skipped words, an
  "until" without a month, day and year, "when done" anywhere but the end,
  a repetition count ("for 3 times", which never ends without a start
  date), and an end date before today or the task's date. Lines already in a vault
  are written back unchanged.
  - Each word is checked for its meaning in the parsed rule rather than
    against the library's wording, so text rrule reads in full is accepted:
    abbreviations ("Mon", "Thurs", "Sept"), "Mondays", ordinals ("the first
    Monday", "the last day"), "weekdays", seven listed days, an interval of 1,
    and "til"/"till". Words rrule drops are still refused ("every 2 days on
    weekdays", "every week in summer", which rrule reads as Sunday), as is an
    end date it stops before ("every week on Mondays until …") (#44).
    "The first/last day" only counts in a monthly rule or a yearly one in
    given months: rrule reads "every year on the last day" and "every week on
    the first day" as a day of every month, so they are refused.
  - Case and spacing no longer matter: "until december 31,2026" and
    "when  done" are read and stored as "until December 31, 2026" and
    "when done". End dates without the comma ("December 31 2026") and with
    "Sept" are read as rrule reads them. An end date that doesn't exist ("until February 30, 2027",
    "until 2027-02-30") is refused as not a date instead of rolling over to
    March (#44).
- **Next dates for weekly rules with month days, and slow rules.** A weekly
  rule with a day of the month, day of the year, week number or Easter
  repeats on any weekday, as rrule computes it, not only its start's
  weekday; ordinal weekdays in daily and weekly rules count as plain ones;
  `COUNT` no longer limits the quick existence check of rules that skip
  periods; and daily rules with `BYSETPOS` past the day's dates fail fast
  instead of taking seconds.
- **Uncommon RRULE combinations were computed on the wrong days (#46).**
  Checked against rrule itself, including generated sweeps of hourly,
  minutely and timed rules.
  - An `UNTIL` time before the day's first date (`DTSTART:20261016T100000`,
    `UNTIL=20261020T080000`) ends the series the day before for floating and
    plain-UTC values too, as it already did with `TZID`. `BYHOUR`,
    `BYMINUTE` and `BYSECOND` count as the day's first time. A UTC start
    (`DTSTART:20261016T080000Z`) is compared in UTC, as rrule steps it, and
    the last date's day is then read in local time, so a change of clocks
    between the start and `UNTIL` no longer drops the last date, and
    `BYHOUR` is a UTC hour whatever the machine's zone.
  - `BYHOUR`, `BYMINUTE` and `BYSECOND` were dropped before `BYSETPOS` picked
    a position and before `COUNT` counted, so the wrong days, or none, were
    picked. Daily and longer rules keep them, and their start and end times,
    when `BYSETPOS` or `COUNT` depends on them. With a UTC start they are
    computed in UTC, and each date's day is read in local time.
  - Hourly, minutely and secondly rules are computed day by day from their
    real start time instead of as daily rules: day filters with a step that
    isn't whole days (`FREQ=HOURLY;INTERVAL=36;BYDAY=MO`), `COUNT` with
    filters (which counts each hour, not each day), `BYHOUR` the step never
    reaches (`INTERVAL=2;BYHOUR=3`, for which rrule itself never returns) and
    `UNTIL` times. They are searched ten years ahead, with an error beyond.
  - Two combinations are rejected as unsupported, with an explicit error, by
    `create_task`, `update_task`, `batch_update_tasks` and `complete_task`:
    `BYHOUR`/`BYMINUTE`/`BYSECOND` on an hourly or shorter rule whose step
    neither divides a day nor is whole days, and `BYMINUTE`/`BYSECOND`
    within each hour or minute together with `COUNT`, `BYSETPOS` or an
    `UNTIL` time.
  - Times of day out of range (`BYHOUR=24`) make a rule unreadable instead of
    rolling over. Obsidian Tasks text isn't written for rules whose times of
    day change their days (one time a day with `COUNT` still counts days, so
    `FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;COUNT=10` is written as "every week on
    Monday for 10 times"), and the task editor lists times of day among the
    parts it can't show.
- **Rules with `BYSETPOS` froze the app, and hourly rules with a UTC start
  failed.**
  - A daily or weekly rule with `BYSETPOS` whose day filters never match
    (`FREQ=DAILY;BYHOUR=9,10;BYSETPOS=2;BYMONTH=2;BYMONTHDAY=30`) fails fast
    again with the "has no date after" error, or ends at its `UNTIL`. rrule
    scanned such rules to the year 9999, past any `UNTIL`, which blocked
    `complete_task` for seconds (about 30 seconds with 24 hours and
    positions).
  - Hourly, minutely and secondly rules with a UTC start
    (`DTSTART:20261016T220000Z`) are stepped in UTC, as rrule steps them, so
    `BYHOUR` and day filters are UTC hours and days, and each date's day is
    read in local time. `FREQ=HOURLY;INTERVAL=6;BYHOUR=22;BYDAY=SA` from that
    start threw "has no date after" outside UTC, and steps of whole days
    kept their local time across a change of clocks. Minutes and seconds
    within each step (`FREQ=HOURLY;BYMINUTE=45`) count on their own day,
    which differs from the hour's in zones whose offset isn't whole hours
    (18:45 UTC is the next day in India).
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
  - A rule v0.8.0 wrote with a start date was split over two lines
    (`🔁 DTSTART:…` and `RRULE:…` on the next line), which can't be joined
    back automatically. Saving or completing such a task now fails with the
    manual fix: delete the `RRULE:` line and replace `🔁 DTSTART:…` with the
    rule as text (`🔁 every week`). The README documents it (#47).
- **Block ids were duplicated when a task line was rewritten (#42).**
  `parseTasksFormatItem` read a trailing `^block-id` into the title
  (`Water plants  ^blk1`) and `taskToMarkdown` wrote it again at the end. The
  block id at the end of a line is no longer part of the title and is written
  once, at the end. A `^id` elsewhere in the line is text, as in Obsidian
  Tasks (`TaskRegularExpressions.blockLinkRegex` only matches at the end).
- **Obsidian Tasks fields and notes after 🔁 were read into the title and
  moved on rewrite (#43).** 🏁 on-completion, ❌ cancelled date, 🆔 id and ⛔
  depends-on are read as fields (see Added). ⏰ reminders, notes and
  `[[links]]` after the fields stay where they are and are part of neither the
  title nor the rule: `🔁 every week when done see [[Garden]]` has the rule
  `every week when done` (a rule ends at "when done", which Obsidian Tasks
  only reads at its end). Tags after the fields are still added
  to the title, as Obsidian Tasks does.
  - A priority emoji, 🏁, 🆔 or ⛔ inside the title stays title text: they
    count as fields only when fields, tags or the end of the line follow
    them, so `⛔ Don't touch prod 📅 …` keeps its title and gets no ⛔ id.
  - A ⏰ reminder is not part of the title. One inside the title text is left
    there on the line (`Call mom ⏰ 2026-10-16 09:00 about birthday` has the
    title `Call mom about birthday`) and kept when the title is edited.
  - On a line that starts with fields (`📅 2026-10-16 Water plants`), the
    text after them is the title, and a new title is written there.
- **Rewriting a task line reformatted it (#43).** `taskToMarkdown` rebuilt the
  line from the title, the tags and every field in a fixed order. It now
  edits the line in place, so a task read from a line and written back
  unchanged gives the line byte for byte: indentation, callout `>` prefixes,
  spacing, field order, symbol variants (`📆`, `🗓️`, `⌛`) and trailing text
  are kept. A changed field is rewritten where it is, a removed one is
  dropped with the space before it, and new fields go after the line's last
  field. The title part is rewritten only when its words or tags change;
  tags stay where they are while the task has them (also when the Obsidian
  plugin took a tag followed by punctuation, `#work,`, out of the title). A
  custom checkbox marker (`[>]`) is kept while it still means the task's
  status.
  - The written line always reads back as the task. When notes follow the
    last field, a new priority, 🔁 rule, 🏁, 🆔 or ⛔ goes before a field
    instead (`Call Bob ⏫ 📅 2026-10-16 about the plan`), since right before
    notes it would be read as title text or take the notes into the rule.
    A field that would no longer read back where it is (a rule followed by
    notes once the date between them is removed) moves the same way.
  - When no field is left that can stand between the title and the notes,
    the notes join the title, as Obsidian Tasks reads such a line:
    changing `🔁 every week when done see [[Garden]]` to `every 2 weeks`
    writes `Water plants see [[Garden]] 🔁 every 2 weeks`. No text is
    dropped.
  - A task the line can't hold throws instead of being written with another
    meaning, for example a title that would be read as a field (`Fix bug 🔺`
    before a date).
- `complete_task` no longer copies the 🆔 id and ⛔ dependencies to the next
  occurrence, as Obsidian Tasks does; 🏁 is kept.
- **The next occurrence of a recurring Obsidian task lost the notes after its
  fields.** `parseTasksFormatItem` keeps them in `extra.lineNotes`, and
  `taskToMarkdown` writes them after the fields of a line that has none,
  such as the new line for the next occurrence. ⏰ reminders, which are for
  one occurrence, are not carried over.
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
- **Misleading browser voice input error (#51).** When Web Speech recognition
  failed with the `network` error, the message said "Browser voice input
  requires internet connection." Embedded hosts report that error when they
  have no speech service at all, so it pointed users to the wrong cause. It
  now reads "Browser speech recognition isn't available here. Choose OpenAI
  or Gemini as the voice provider in Settings → AI."
- **Task editor accessibility (#50).** The editor is now a modal dialog (Radix
  Dialog, rendered in the app's portal container): it has `role="dialog"` and
  `aria-modal`, is named by its "Edit Task" title, closes on Escape, moves
  focus inside and keeps it there, and hides the rest of the page from
  assistive technology while open. Closing it returns focus to the control
  that opened it, or to the task row's status button when that was "Edit
  details" in the row's menu.
  - In a shadow root, as in the Obsidian plugin, Tab and Shift+Tab stay in
    the editor and in a date picker open over it, and a menu closing as the
    editor opens no longer takes focus behind it. The editor scrolls with the
    mouse wheel, trackpad and touch there too: its backdrop is not Radix's
    `Dialog.Overlay`, whose scroll lock cancelled scrolling inside the editor
    when the app is in a shadow root.
  - Used without `AppProvider` (the exported `TaskEditModal` on its own), the
    editor renders in place, inside the consumer's themed wrapper or shadow
    root, instead of in `document.body` without the theme or styles. Its
    date pickers' calendars open beside it there too, with the theme and
    styles and without being clipped by the editor, and the keyboard reaches
    them in a consumer's shadow root: Enter on a date field moves focus into
    its calendar and keeps it there.
  - Text meets WCAG AA (4.5:1) in all four themes. Secondary text (the "Task
    Dates" heading, recurrence labels and summary) uses `slate-500` instead of
    `slate-400` (about 2.5:1); the coffee theme's `--slate-500` and
    `--muted-foreground` are darker (`30 10% 40%`, were about 4.0:1 on its
    card and 4.4:1 on its background). Selected weekday, month and day
    buttons use `blue-600` (white on `blue-500` was about 3.7:1), the save
    error `rose-700` (was 4.48:1) and the "Saving replaces…" warning a new
    themed `amber-800` (Tailwind's `amber-600` was about 3.1:1).
  - The editor no longer uses Tailwind `dark:` classes. They follow the OS
    colour scheme, while the theme tokens already switch with the app's
    theme, so with a dark OS they inverted the editor's colours a second time
    (for example the "Recurrence" heading at about 1.2:1).
  - The yearly month buttons expose their state with `aria-pressed`.
- **Recurrence wording in the editor and the Recurring badge (#48).** The
  editor lists the rule parts its settings can't show after a colon ("These
  settings can't show: repetition count (COUNT)"), and warns "Saving replaces
  the stored rule and drops the parts these settings can't show: …". Ordinal
  weekdays ("every month on the 2nd Monday") are named once, not also as
  "weekdays". When it
  writes Obsidian Tasks text, its preview is the text saving writes ("every 2
  years on the 1st in June", which rrule words "every 2 years June on the
  1st"). The **Recurring** badge's tooltip and label give the start and end
  dates the editor and `complete_task` read, so a legacy UTC `UNTIL`, a dashed
  `UNTIL=2026-12-31` or a numeric text end date no longer shows another or a
  raw end date; they keep "when done", and show a rule as written when rrule's
  text would leave parts out (`BYSETPOS`, `BYEASTER`, `WKST`).
- **Test Connection ignored `aiProviderFactory`.** The Settings button always
  tested the built-in provider, even when the host's factory supplied the one
  the agent uses. It now tests the provider from `aiProviderFactory` when one
  is given.
- The published type declarations now type-check for consumers. Thirteen
  `.d.ts` files imported from the repo-only `@/types` path alias,
  `dist/index.d.ts` re-exported `./index.css`, and
  `dist/components/settings/SettingsPage.d.ts` imported `vite-env.d.ts` from
  outside `dist/`. Hosts no longer need an ambient `declare module "@/types"`
  or `declare module "*.css"` shim. The stylesheet is still published as
  `@tasks-timeline/components/index.css`.
- `pnpm build:lib` now fails if a declaration in `dist/` uses the `@/` alias,
  imports a stylesheet, or has a relative path that does not resolve inside
  `dist/` (`scripts/check-declarations.ts`). ESLint rejects `@/` imports in
  `src/`.
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
- `taskToMarkdown` edits lines in place (see Fixed): a rule it repairs
  (`🔁 RRULE:…`, `until 2026-12-31`) stays where it was instead of moving to
  the end, and fields a line gains are added after its last field, in
  `formatTasksMetadata` order (or where they read back, see Fixed). It
  throws for a task the line can't hold. A task with `cancelledAt` (set when
  a task is cancelled in the timeline or with `cancel_task`) gets a ❌ date,
  as Obsidian Tasks writes it.

### Added

- **`CapabilityContext.recurrenceFormat`** (`"auto" | "text"`, #47). A host
  that stores tasks as Obsidian Tasks lines sets `"text"`, as it sets
  `recurrenceFormat="text"` on the editor; `TasksTimelineApp` passes its
  `recurrenceFormat` prop to the built-in agent's context. `create_task`,
  `update_task` and `batch_update_tasks` then store RRULE syntax as Obsidian
  Tasks text and reject rules a line can't hold before saving anything or
  asking for confirmation, with a message for the model ("remove DTSTART; set
  the task's startAt instead"). Before, the rule was stored and the host's
  write failed afterwards, after `batch_update_tasks` had asked to confirm.

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
