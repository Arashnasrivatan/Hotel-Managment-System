import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node, // اضافه کردن گلوبال‌های Node.js
        ...globals.browser,
      },
    },
  },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-template-curly-in-string": "error",
      "arrow-body-style": ["error", "always"],
      "capitalized-comments": ["warn", "always"],
      "no-var": "error",
    },
  },
];
