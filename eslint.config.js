import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Allow underscore-prefixed unused vars (mock placeholders, intentionally-ignored params)
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // React 19 compiler warning — fires on the legitimate pattern of
      // `setLoading(true); fetchData(...)` inside useEffect. We use this pattern
      // intentionally for "load data on mount" and "reload after action" flows;
      // setState calls inside the effect body are batched and don't cause real cascading renders.
      'react-hooks/set-state-in-effect': 'off',
      // React Compiler is informational — it tells us when it skipped memoization.
      // Not an actual error, just a hint we could refactor for better perf.
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
  // Vercel serverless handlers run in Node (not browser)
  {
    files: ['api/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
