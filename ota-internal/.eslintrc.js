module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  plugins: ['@typescript-eslint', 'import'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true
      }
    }
  },
  rules: {
    // Feature boundary rules
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // Finance feature can only import from shared, data, and itself
          {
            target: './src/features/finance/**/*',
            from: './src/features/(?!finance|shared|data)',
            message: 'Finance feature cannot import from other features. Use shared utilities instead.'
          },
          // Dashboard feature can only import from shared, data, and itself
          {
            target: './src/features/dashboard/**/*',
            from: './src/features/(?!dashboard|shared|data)',
            message: 'Dashboard feature cannot import from other features. Use shared utilities instead.'
          },
          // Shows feature can only import from shared, data, and itself
          {
            target: './src/features/shows/**/*',
            from: './src/features/(?!shows|shared|data)',
            message: 'Shows feature cannot import from other features. Use shared utilities instead.'
          },
          // Travel feature can only import from shared, data, and itself
          {
            target: './src/features/travel/**/*',
            from: './src/features/(?!travel|shared|data)',
            message: 'Travel feature cannot import from other features. Use shared utilities instead.'
          },
          // Shared utilities can only import from other shared utilities or data
          {
            target: './src/shared/**/*',
            from: './src/(?!shared|data)',
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
    // Enforce barrel exports for clean imports
    'import/no-internal-modules': [
      'warn',
      {
        forbid: [
          '**/core/**',
          '**/components/**',
          '**/types/**'
        ],
        except: [
          // Allow imports from feature index files (barrel exports)
          '**/features/*/index',
          '**/shared/*/index'
        ]
      }
    ]
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.config.js',
    '*.config.ts',
    'vite.config.ts'
  ]
};
