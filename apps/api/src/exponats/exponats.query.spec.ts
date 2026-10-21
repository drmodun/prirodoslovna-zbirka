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

  it.each([
    'family',
    'genus',
    'order',
    'kingdom',
    'phylum',
    'species',
    'class',
  ])('filters by taxonomy rank %s using a phrase search', (rank) => {
    expect(buildExponatWhere({ [rank]: 'canis lupus' } as any)).toEqual({
      Categorization: {
        is: { [rank]: { search: 'canis <-> lupus', mode: 'insensitive' } },
      },
    });
  });

  it('combines several ranks', () => {
    const where: any = buildExponatWhere({
      family: 'f',
      species: 's',
    } as any);
    expect(where.Categorization.is).toEqual({
      family: { search: 'f', mode: 'insensitive' },
      species: { search: 's', mode: 'insensitive' },
    });
  });

  describe('favourite count', () => {
    const counts = [
      { ExponatId: 'none', _count: { _all: 0 } },
      { ExponatId: 'one', _count: { _all: 1 } },
      { ExponatId: 'five', _count: { _all: 5 } },
    ];

    it('is ignored without counts or bounds', () => {
      expect(buildExponatWhere({ minFavoriteCount: 3 } as any)).toEqual({});
      expect(buildExponatWhere({} as any, undefined, counts)).toEqual({});
    });

    it('a minimum keeps the exponats with at least that many', () => {
      expect(
        buildExponatWhere({ minFavoriteCount: '2' } as any, undefined, counts),
      ).toEqual({ id: { in: ['five'] } });
    });

    it('a maximum leaves out the exponats with more', () => {
      expect(
        buildExponatWhere({ maxFavoriteCount: 1 } as any, undefined, counts),
      ).toEqual({ id: { notIn: ['five'] } });
    });

    it('applies both bounds together', () => {
      expect(
        buildExponatWhere(
          { minFavoriteCount: 1, maxFavoriteCount: 4 } as any,
          undefined,
          counts,
        ),
      ).toEqual({ id: { in: ['one'] } });
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
