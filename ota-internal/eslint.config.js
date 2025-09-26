import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        performance: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'import': importPlugin
    },
    rules: {
      // TypeScript recommended rules
      ...tseslint.configs.recommended.rules,

      // Feature boundary rules
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // Finance feature can only import from shared, data, and itself
            {
              target: 'src/features/finance/**/*',
              from: 'src/features/(?!finance|shared|data)',
              message: 'Finance feature cannot import from other features. Use shared utilities instead.'
            },
            // Dashboard feature can only import from shared, data, and itself
            {
              target: 'src/features/dashboard/**/*',
              from: 'src/features/(?!dashboard|shared|data)',
              message: 'Dashboard feature cannot import from other features. Use shared utilities instead.'
            },
            // Shows feature can only import from shared, data, and itself
            {
              target: 'src/features/shows/**/*',
              from: 'src/features/(?!shows|shared|data)',
              message: 'Shows feature cannot import from other features. Use shared utilities instead.'
            },
            // Travel feature can only import from shared, data, and itself
            {
              target: 'src/features/travel/**/*',
              from: 'src/features/(?!travel|shared|data)',
              message: 'Travel feature cannot import from other features. Use shared utilities instead.'
            },
            // Shared utilities can only import from other shared utilities or data
            {
              target: 'src/shared/**/*',
              from: 'src/(?!shared|data)',
              message: 'Shared utilities cannot import from features or modules. Keep them independent.'
            }
          ]
        }
      ],

      // Prevent imports from legacy modules directory
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/modules/**'],
              message: 'Direct imports from modules/ are deprecated. Use features/ or shared/ instead.'
            }
          ]
        }
      ],

      // Allow console statements in development
      'no-console': 'off',

      // Allow unused variables that start with underscore
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Allow explicit any in some cases
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.config.js',
      '*.config.ts',
      'vite.config.ts',
      'scripts/'
    ]
  }
];
