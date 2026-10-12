import { buildExponatOrderBy, buildExponatWhere } from './exponats.query';

describe('buildExponatWhere', () => {
  it('is empty for an empty filter', () => {
    expect(buildExponatWhere({} as any)).toEqual({});
  });

  it('builds OR-style full text search for name and alternateName', () => {
    expect(
      buildExponatWhere({
        name: 'crveni  lisica',
        alternateName: 'a b',
      } as any),
    ).toEqual({
      name: { search: 'crveni |  | lisica', mode: 'insensitive' },
      alternateName: { search: 'a | b', mode: 'insensitive' },
    });
  });

  it('filters by organisation and approval', () => {
    expect(buildExponatWhere({ organisationId: 'o1' } as any, true)).toEqual({
      organisationId: 'o1',
      isApproved: true,
    });
  });

  it('does not add isApproved when approval is false', () => {
    expect(buildExponatWhere({} as any, false)).toEqual({});
  });

  it('filters by creation date', () => {
    const d = new Date('2024-01-01');
    expect(buildExponatWhere({ createdAt: d } as any)).toEqual({
      createdAt: { gte: d },
    });
  });

  it.each(['family', 'genus', 'order', 'kingdom', 'phylum', 'species'])(
    'filters by taxonomy rank %s using a phrase search',
    (rank) => {
      expect(buildExponatWhere({ [rank]: 'canis lupus' } as any)).toEqual({
        Categorization: {
          is: { [rank]: { search: 'canis <-> lupus', mode: 'insensitive' } },
        },
      });
    },
  );

  it('only the last rank in rank order applies when several are given', () => {
    const where: any = buildExponatWhere({
      family: 'f',
      species: 's',
    } as any);
    expect(where.Categorization.is).toEqual({
      species: { search: 's', mode: 'insensitive' },
    });
  });

  describe('favourite count', () => {
    it('min -> gte', () => {
      expect(buildExponatWhere({ minFavoriteCount: 3 } as any)).toEqual({
        _count: { FavouriteExponats: { gte: 3 } },
      });
    });
    it('max -> lte', () => {
      expect(buildExponatWhere({ maxFavoriteCount: 9 } as any)).toEqual({
        _count: { FavouriteExponats: { lte: 9 } },
      });
    });
    it('max wins over min when both are present', () => {
      expect(
        buildExponatWhere({ minFavoriteCount: 1, maxFavoriteCount: 9 } as any),
      ).toEqual({ _count: { FavouriteExponats: { lte: 9 } } });
    });
  });

  // BUG: the `class` branch writes a top-level `search` key (not a valid
  // Exponat column) and a class condition with no `search` term, so the
  // generated query would be rejected by Prisma / never filter by class.
  it.failing('filters by class with a phrase search like other ranks', () => {
    expect(buildExponatWhere({ class: 'mammalia' } as any)).toEqual({
      Categorization: {
        is: { class: { search: 'mammalia', mode: 'insensitive' } },
      },
    });
  });

  // `filter.createdAt` is read without optional chaining.
  it('throws a TypeError when the filter itself is undefined', () => {
    expect(() => buildExponatWhere(undefined)).toThrow(TypeError);
  });
});

describe('buildExponatOrderBy', () => {
  it('returns a copy of an explicit sort', () => {
    const sort = { name: 'asc' } as any;
    const result = buildExponatOrderBy({ name: 'x' } as any, sort);
    expect(result).toEqual({ name: 'asc' });
    expect(result).not.toBe(sort);
  });

  it('orders by relevance for name searches without explicit sort', () => {
    expect(buildExponatOrderBy({ name: 'red fox' } as any)).toEqual({
      _relevance: { fields: ['name'], search: 'red <-> fox', sort: 'desc' },
    });
  });

  it('is unordered without name or sort', () => {
    expect(buildExponatOrderBy({} as any)).toEqual({});
  });
});
