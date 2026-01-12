import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "no-restricted-globals": [
        "error",
        {
          name: "localStorage",
          message: "Use src/lib/storage.ts for storage access.",
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='window'][property.name='localStorage']",
          message: "Use src/lib/storage.ts for storage access.",
        },
        {
          selector: "MemberExpression[object.name='globalThis'][property.name='localStorage']",
          message: "Use src/lib/storage.ts for storage access.",
        },
      ],
    },
  },
  {
    files: ["src/lib/storage.ts"],
    rules: {
      "no-restricted-syntax": "off",
    },
  }
);
