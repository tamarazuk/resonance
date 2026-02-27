export * from "./schema";
export { db, connection, type DbType } from "./client";

// Re-export commonly used drizzle-orm operators so consuming apps don't need a direct dependency.
export {
  eq,
  ne,
  and,
  or,
  not,
  gt,
  gte,
  lt,
  lte,
  desc,
  asc,
  sql,
  inArray,
  isNull,
} from "drizzle-orm";

// Re-export pgvector distance functions for semantic search queries.
export {
  cosineDistance,
  l2Distance,
  innerProduct,
} from "drizzle-orm/sql/functions/vector";
