import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: tsParser, globals: { AbortController: 'readonly', AbortSignal: 'readonly', React: 'readonly', Response: 'readonly', URL: 'readonly', fetch: 'readonly', localStorage: 'readonly', window: 'readonly' } },
    plugins: { '@typescript-eslint': tseslint, '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**'],
  },
];
