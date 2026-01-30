# Suggested Commands

## Installation & Setup
```bash
pnpm install              # Install all dependencies
```

## Development
```bash
pnpm storybook            # Run Storybook dev server (port 6006)
pnpm dev:lib              # Watch mode for type declarations
pnpm dev:example          # Run example app (examples/app/)
```

## Building
```bash
pnpm build                # Build library with type declarations (recommended)
pnpm build:lib            # Build library (vite + tsc)
pnpm build-storybook      # Build Storybook for deployment
pnpm build:example        # Build example app
```

## Quality Assurance
```bash
pnpm type-check           # TypeScript type checking
pnpm lint                 # Run ESLint
pnpm test                 # Run Storybook tests with Vitest
```

## Git & Version Control
```bash
git status                # Check working tree status
git diff                  # View changes
git log --oneline         # View commit history
git add .                 # Stage all changes
git commit -m "message"   # Create commit
```

## Useful Utilities (macOS/Darwin)
```bash
fd . -t f                 # List all files recursively (fast)
rg "pattern"              # Search content in files (fast)
rg --files                # List files (respects .gitignore)
ls -la                    # List files in current directory
```

## Common Workflows

### After Making Changes
1. `pnpm type-check` - Verify TypeScript
2. `pnpm lint` - Check code style
3. `pnpm test` - Run tests
4. `pnpm build` - Build library

### Before Committing
1. `pnpm type-check && pnpm lint && pnpm test`
2. `git status` - Review changes
3. `git diff` - Review diffs
4. `git add .` - Stage changes
5. `git commit -m "descriptive message"`

### Developing Components
1. `pnpm storybook` - Start Storybook
2. Create/edit component in `src/components/`
3. Create story in `src/stories/`
4. View in Storybook at http://localhost:6006
