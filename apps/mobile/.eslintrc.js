module.exports = {
  root: true,
  extends: ["expo", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "warn",
  },
  ignorePatterns: ["node_modules/", ".expo/", "dist/"],
};

