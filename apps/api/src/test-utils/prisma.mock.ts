/**
 * Lightweight deep mock of PrismaService for unit tests.
 * `prisma.<model>.<method>` lazily resolves to a stable jest.fn(), so tests
 * only stub the calls they care about. `$transaction` runs callbacks against
 * the mock itself and resolves arrays of promises.
 */
export type MockedPrisma = Record<string, any>;

export function createPrismaMock(): MockedPrisma {
  const fns = new Map<string, jest.Mock>();
  const models = new Map<string, any>();
  const fn = (key: string, impl?: (...args: any[]) => any) => {
    if (!fns.has(key)) fns.set(key, jest.fn(impl));
    return fns.get(key);
  };

  const model = (name: string) =>
    new Proxy(
      {},
      {
        get: (_t, method: string) =>
          method === 'then' ? undefined : fn(`${name}.${method}`),
      },
    );

  const root: MockedPrisma = new Proxy(
    {},
    {
      get(_t, prop: string) {
        if (prop === 'then') return undefined;
        if (prop === '$transaction')
          return fn('$transaction', async (arg: any) =>
            typeof arg === 'function' ? arg(root) : Promise.all(arg),
          );
        if (prop.startsWith('$')) return fn(prop);
        if (!models.has(prop)) models.set(prop, model(prop));
        return models.get(prop);
      },
    },
  );
  return root;
}
