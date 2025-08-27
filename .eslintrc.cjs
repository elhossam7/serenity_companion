module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: false,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src'],
      },
    },
  },
  rules: {
    'react/prop-types': 'off',
    // Allow empty catch blocks for intentional swallow with comments elsewhere
    'no-empty': ['error', { allowEmptyCatch: true }],
    // Too strict for optional chaining patterns used across services
    'no-unsafe-optional-chaining': 'off',
    // Accessibility rules as warnings to avoid blocking commits; fix incrementally
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn',
    // Relax import namespace check for computed icon lookups
    'import/namespace': 'warn',
    // Unescaped entities often appear in localized strings; warn only
    'react/no-unescaped-entities': 'warn',
    // Reduce noise; allow underscore to mark intentional unused
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['dist', 'build', 'node_modules', 'src/services/aiService_old.js'],
  overrides: [
    {
      files: ['**/__tests__/**/*.{js,jsx,ts,tsx}', 'tests/**/*.{js,jsx,ts,tsx}'],
      env: { jest: true },
      globals: { vi: 'readonly', describe: 'readonly', it: 'readonly', test: 'readonly', expect: 'readonly', beforeEach: 'readonly', afterEach: 'readonly' },
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['src/services/aiService.js'],
      rules: {
        'no-dupe-keys': 'off',
        'no-unused-vars': 'warn',
      },
    },
    {
      files: ['src/utils/sanitize.js'],
      rules: {
        'no-control-regex': 'off',
      },
    },
  ],
};