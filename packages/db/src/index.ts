export * from "./schema"
export { db, connection, type DbType } from "./client"

// Re-export commonly used drizzle-orm operators so consuming apps don't need a direct dependency.
export { eq, ne, and, or, not, gt, gte, lt, lte, desc, asc, sql, inArray } from "drizzle-orm"
