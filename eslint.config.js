import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  // ignore build artifacts
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },

  // base TypeScript rules for all TS files
  ...tseslint.configs.recommended,

  // backend
  {
    files: ["backend/src/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },

  // frontend
  {
    files: ["frontend/src/**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // not needed with React 17+
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // e2e
  {
    files: ["e2e/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },

  // disable rules that conflict with prettier (always last)
  prettier
);
