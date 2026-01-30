# GitHub Workflows Setup Guide

This project includes two GitHub Actions workflows for automated building, testing, and publishing.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggered on:** Push to `main`/`develop` and Pull Requests

**What it does:**

- ✅ Runs type checking (`pnpm type-check`)
- ✅ Runs linting (`pnpm lint`)
- ✅ Builds library in ESM and CommonJS formats
- ✅ Generates TypeScript declarations
- ✅ Builds Storybook documentation
- ✅ Verifies all build artifacts are present
- ✅ Uploads Storybook as artifact

**Test Matrix:**

- Node.js 18.x
- Node.js 20.x

### 2. Publish Workflow (`publish.yml`)

**Triggered on:**

- Git tags matching `v*` (e.g., `v0.1.0`, `v1.0.0`)
- Manual workflow dispatch

**What it does:**

- ✅ Runs all CI checks (lint, type-check, build)
- ✅ Creates GitHub Release with artifacts
- ✅ Uploads distribution files to release
- ✅ Publishes package to npm
- ✅ Deploys Storybook to GitHub Pages
- ✅ Generates release notes

## Setup Instructions

### 1. Configure npm Token

To publish to npm, you need to set up an npm authentication token:

1. Go to [npmjs.com](https://www.npmjs.com)
2. Sign in to your account
3. Go to Account Settings → Access Tokens
4. Create a new token with "Publish" permissions
5. Copy the token

Then in your GitHub repository:

1. Go to **Settings → Secrets and Variables → Actions**
2. Click **New repository secret**
3. Name: `NPM_TOKEN`
4. Value: (paste your npm token)
5. Click **Add secret**

### 2. Configure GitHub Pages (Optional)

To deploy Storybook to GitHub Pages:

1. Go to **Settings → Pages**
2. Select **Deploy from a branch** as source
3. Select **gh-pages** branch and **root** folder
4. Click **Save**

The workflow will automatically create and update the `gh-pages` branch on release.

### 3. Configure Repository Permissions

Ensure the following permissions are set for the workflow:

1. Go to **Settings → Actions → General**
2. Scroll to "Workflow permissions"
3. Select **Read and write permissions**
4. Check **Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

## How to Publish a Release

### Method 1: Git Tag (Recommended)

```bash
# Update version in package.json
npm version patch  # or minor/major

# Push the tag
git push origin main --tags
```

The workflow will automatically:

1. Build the library
2. Create a GitHub release
3. Publish to npm
4. Deploy Storybook to GitHub Pages

### Method 2: Manual Workflow Dispatch

1. Go to **Actions** tab
2. Select **Build and Publish** workflow
3. Click **Run workflow**
4. Set **Publish to npm** to `true` (default)
5. Click **Run workflow**

### Method 3: Create Release on GitHub

1. Go to **Releases**
2. Click **Create a new release**
3. Tag: `v0.1.0` (must start with `v`)
4. Title: `Release v0.1.0`
5. Description: (optional)
6. Click **Publish release**

The workflow will trigger automatically and publish to npm.

## Environment Variables & Secrets

### Required Secrets

| Secret         | Description                           | How to Create                                                         |
| -------------- | ------------------------------------- | --------------------------------------------------------------------- |
| `NPM_TOKEN`    | npm authentication token              | [npmjs.com Account Settings](https://www.npmjs.com/settings/~/tokens) |
| `GITHUB_TOKEN` | GitHub authentication (auto-provided) | Automatically available in workflow                                   |

### Optional Configuration

No additional configuration needed! The workflows use:

- `pnpm` for package management (auto-installed)
- Workspace resolution via `pnpm-workspace.yaml`
- Built-in GitHub authentication for releases

## Version Management

### Semantic Versioning

Follow semantic versioning for releases:

- **Patch** (0.0.X): Bug fixes, typos → `npm version patch`
- **Minor** (0.X.0): New features (backward compatible) → `npm version minor`
- **Major** (X.0.0): Breaking changes → `npm version major`

### Update Package Version

```bash
# Update package.json version
npm version patch

# This automatically:
# 1. Bumps version in package.json
# 2. Creates a git commit
# 3. Creates a git tag

# Then push to trigger the workflow
git push origin main --tags
```

## Monitoring Builds

1. Go to **Actions** tab
2. Click on the workflow run
3. View logs in real-time
4. Troubleshoot any issues

## Release Notes Template

When creating a release manually, use this template:

```markdown
## @tasks-timeline/component-library v0.1.0

### ✨ New Features

- List of new features

### 🐛 Bug Fixes

- List of bug fixes

### 📚 Documentation

- Updated Storybook stories
- Improved type definitions

### 📦 Installation

npm install @tasks-timeline/component-library@0.1.0

### 🔗 Links

- [npm Package](https://www.npmjs.com/package/@tasks-timeline/component-library)
- [Storybook](https://github.com/username/tasks-timeline/deployments/activity_log?environment=github-pages)
```

## Troubleshooting

### Build Failed

1. Check the GitHub Actions logs
2. Ensure all tests pass locally: `pnpm type-check && pnpm lint && pnpm build`
3. Verify Node.js version is 18+

### npm Publish Failed

1. Check that `NPM_TOKEN` secret is configured correctly
2. Verify token has "Publish" permissions
3. Ensure package name is unique on npm registry
4. Check package.json `"private": false`

### GitHub Pages Deployment Failed

1. Ensure GitHub Pages is enabled in Settings
2. Verify `gh-pages` branch exists
3. Check Actions workflow permissions are correct

## Best Practices

✅ **Do:**

- Use semantic versioning
- Write descriptive release notes
- Test locally before pushing
- Keep commit history clean
- Use `git push --tags` after version bump

❌ **Don't:**

- Force push to main
- Modify version outside of `npm version`
- Publish without running tests
- Commit `dist/` folder changes manually

## Security

- Never commit npm tokens
- Always use GitHub Secrets for sensitive data
- Review workflow permissions regularly
- Keep Node.js version updated (18+ required)

## Support

For workflow issues:

1. Check GitHub Actions documentation
2. Review workflow logs for detailed errors
3. Test steps locally before debugging in CI

For npm publishing issues:

1. Verify npm account access
2. Check npm token permissions
3. Ensure scoped package is public: `npm publish --access public`
