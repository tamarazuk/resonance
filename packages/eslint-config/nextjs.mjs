import nextPlugin from "@next/eslint-plugin-next";
import base from "./base.mjs";

/**
 * Next.js ESLint flat config — extends base + Next.js rules.
 * Used by apps that run on Next.js (e.g., steadyhand).
 */
export default [
  ...base,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
];
