// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // tsc copies import specifiers into the published .d.ts files verbatim,
      // so the "@/" path alias would break every consumer's type-check
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*'],
              message: 'Use a relative import. tsc does not rewrite the "@/" path alias, so it leaks into the published .d.ts files.',
            },
          ],
        },
      ],
      // Prevent timezone bugs by banning dangerous date patterns
      'no-restricted-syntax': [
        'error',
        {
          // Ban: new Date().toISOString().split("T")[0]
          selector: 'CallExpression[callee.object.callee.object.callee.name="Date"][callee.object.callee.property.name="toISOString"][callee.property.name="split"]',
          message: '❌ TIMEZONE BUG: new Date().toISOString().split("T")[0] returns UTC date, not local date. Use getTodayISO() from utils/date-helpers instead.',
        },
        {
          // Ban: Date().toISOString().split (without new keyword)
          selector: 'CallExpression[callee.object.object.callee.name="Date"][callee.object.property.name="toISOString"][callee.property.name="split"]',
          message: '❌ TIMEZONE BUG: Date().toISOString().split("T")[0] returns UTC date, not local date. Use getTodayISO() from utils/date-helpers instead.',
        },
        {
          // Ban: import * as Lucide from "lucide-react"
          selector: 'ImportDeclaration[source.value="lucide-react"] > ImportNamespaceSpecifier',
          message: 'Import icons by name. A namespace import of lucide-react keeps every Lucide icon in the bundle. For <Icon name>, add the icon to src/components/icon-registry.ts.',
        },
      ],
    },
  },
]
