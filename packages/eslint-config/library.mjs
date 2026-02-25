import base from "./base.mjs";

/**
 * Library ESLint flat config — extends base, no React/Next.js rules.
 * Used by packages/types, packages/db, and similar non-React packages.
 */
export default [...base];
