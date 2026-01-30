# Code Style & Conventions

## TypeScript Configuration
- **Target**: ES2022
- **Module**: ESNext
- **Strict Mode**: Enabled
- **JSX**: react-jsx
- **Path Alias**: `@/*` → `./src/*`
- **Module Resolution**: bundler
- **Verbatim Module Syntax**: Enabled
- **No Unused Locals/Parameters**: Enforced
- **Declaration Maps**: Enabled

## Code Style
- **Components**: Functional components with React hooks
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Imports**: ESM modules only
- **Styling**: Tailwind CSS utility classes
- **Type Hints**: Full TypeScript typing required
- **Exports**: Named exports preferred, default exports for components

## Component Patterns
1. **Shadow DOM Isolation**: Components wrapped in shadow roots via `react-shadow`
2. **Context API**: Used for app-wide state (tasks, settings)
3. **Repository Pattern**: Abstract interfaces for storage (TaskRepository, SettingsRepository)
4. **Hooks**: Custom hooks for filtering, stats, AI integration
5. **Composition**: Small, focused components with clear responsibilities

## File Organization
```
src/
├── components/          # React components
│   ├── ui/             # Base UI components (Radix-based)
│   ├── settings/       # Settings-related components
│   └── *.tsx           # Feature components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── contexts/           # React contexts
├── types/              # TypeScript type definitions
├── stories/            # Storybook stories (organized by category)
└── index.ts            # Library entry point
```

## Linting & Formatting
- **ESLint**: Flat config format
- **Plugins**: react-hooks, react-refresh, storybook
- **Extends**: @eslint/js, typescript-eslint, react-hooks recommended

## Date Handling
- **Library**: Luxon (NOT date-fns or moment)
- **Format**: ISO 8601 strings (YYYY-MM-DD or full ISO)
- **Relative Dates**: "Today", "Tomorrow", "Yesterday" based on settings
