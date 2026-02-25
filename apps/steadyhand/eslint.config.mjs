import nextjs from "@resonance/eslint-config/nextjs";

export default [
  ...nextjs,
  {
    ignores: [".next/**", "out/**", "build/**"],
  },
];
