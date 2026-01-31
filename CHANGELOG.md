# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
