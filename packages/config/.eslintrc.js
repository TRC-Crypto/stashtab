/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['@stashtab/eslint-config'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
