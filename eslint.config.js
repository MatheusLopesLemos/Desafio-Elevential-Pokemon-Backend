import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig({
  files: ['**/*.{js,mjs,cjs}'],
  plugins: ['js', 'prettier'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'warn',
    'prettier/prettier': 'error',
  },
});
