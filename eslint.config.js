import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "**/coverage/**", "**/*.d.ts"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Components that intentionally implement ARIA container/dialog patterns
    // (e.g. backdrop dismissal, roving tabindex, delegated key handling, or
    // first-field focus for one-time-code entry). The static jsx-a11y heuristics
    // produce false positives for these established patterns.
    files: [
      "packages/ui/src/components/overlays/Modal.tsx",
      "packages/ui/src/components/overlays/Sheet.tsx",
      "packages/ui/src/components/navigation/Tabs.tsx",
      "packages/ui/src/components/actions/ToggleGroup.tsx",
      "packages/ui/src/components/forms/InputOTP.tsx",
      "packages/ui/src/components/forms/Calendar.tsx",
      "packages/ui/src/components/forms/TimePicker.tsx",
      "packages/ui/src/components/forms/DateTimePicker.tsx",
      "packages/ui/src/components/overlays/CommandPalette.tsx",
      "packages/ui/src/components/overlays/ContextMenu.tsx",
      "packages/ui/src/components/overlays/MenuBar.tsx",
      "packages/ui/src/components/overlays/NavigationMenu.tsx",
      "packages/ui/src/components/forms/SelectListbox.tsx",
      "packages/ui/src/components/forms/MultiSelect.tsx",
      "apps/component-lab/src/components/CommandPalette.tsx",
      "apps/component-lab/src/components/CodePanel.tsx",
      "apps/component-lab/src/registry/overlays.tsx",
    ],
    rules: {
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "jsx-a11y/interactive-supports-focus": "off",
      "jsx-a11y/heading-has-content": "off",
      "jsx-a11y/no-autofocus": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      // Scrollable code regions stay keyboard-focusable on purpose.
      "jsx-a11y/no-noninteractive-tabindex": "off",
    },
  },
);
