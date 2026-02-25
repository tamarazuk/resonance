import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

/**
 * Base ESLint flat config — TypeScript + Prettier conflict resolution.
 * All workspace configs extend this.
 *
 * tseslint.configs.recommended already includes:
 *   - typescript-eslint/base (parser + plugin)
 *   - typescript-eslint/eslint-recommended (core JS rules)
 *   - typescript-eslint/recommended (TS-specific rules)
 */
export default tseslint.config(
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  },
);
