require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: ['@microsoft/eslint-config-spfx/lib/profiles/default'],
  parserOptions: { tsconfigRootDir: __dirname },
  plugins: ['import'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['import'],
      extends: [
        'plugin:import/typescript'
      ],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['error', {
          'varsIgnorePattern': '^_',
          'argsIgnorePattern': '^_'
        }],
        'import/no-duplicates': 'error',
        '@typescript-eslint/ban-types': 'off'
      }
    }
  ]
};