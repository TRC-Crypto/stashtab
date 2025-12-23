module.exports = {
  extends: ["@stashtab/eslint-config/next"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};

