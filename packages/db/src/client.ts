import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Connection for migrations and queries
const connectionString = process.env.DATABASE_URL

// For query purposes
const queryClient = postgres(connectionString)

// For migration purposes (if needed)
// const migrationClient = postgres(connectionString, { max: 1 })

export const db = drizzle(queryClient, { schema })

// Export the connection for cleanup if needed
export const connection = queryClient

// Type export for the db client
export type DbType = typeof db
