export interface MockDbOptions {
  users?: Record<string, unknown>[];
  experiences?: Record<string, unknown>[];
  applications?: Record<string, unknown>[];
}

export function createMockDb(options: MockDbOptions = {}) {
  const { users = [], experiences = [], applications = [] } = options;
  const tableMap: Record<string, Record<string, unknown>[]> = {
    users,
    experiences,
    applications,
  };

  return {
    select: () => ({
      from: (table?: string) => {
        const rows = table ? tableMap[table] : users;
        if (table !== undefined && rows === undefined) {
          throw new Error(`Unknown table: ${table}`);
        }

        return {
          where: async () => rows,
          orderBy: async () => rows,
        };
      },
    }),
    insert: () => ({
      values: async () => [{ id: "mock-id" }],
      returning: async () => [{ id: "mock-id" }],
    }),
    update: () => ({
      set: () => ({
        where: async () => [{ id: "mock-id" }],
        returning: async () => [{ id: "mock-id" }],
      }),
    }),
    delete: () => ({
      where: async () => [{ id: "mock-id" }],
    }),
    query: {
      users: {
        findFirst: async () => users[0] ?? null,
        findMany: async () => users,
      },
      experiences: {
        findFirst: async () => experiences[0] ?? null,
        findMany: async () => experiences,
      },
      applications: {
        findFirst: async () => applications[0] ?? null,
        findMany: async () => applications,
      },
    },
  };
}

export function createMockQueryResult<T>(data: T[]): Promise<T[]> {
  return Promise.resolve(data);
}

export type MockTransactionFn<T> = (
  trx: ReturnType<typeof createMockDb>,
) => Promise<T>;

export async function createMockTransaction<T>(
  callback: MockTransactionFn<T>,
  options: MockDbOptions = {},
): Promise<T> {
  const mockTx = createMockDb(options);
  return callback(mockTx);
}

export function createMockSchema(): {
  users: Record<string, unknown>;
  experiences: Record<string, unknown>;
  applications: Record<string, unknown>;
} {
  return {
    users: {},
    experiences: {},
    applications: {},
  };
}
