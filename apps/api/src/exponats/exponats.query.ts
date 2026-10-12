import { ExponatQuery } from './dto/exponats.dto';
import { Prisma } from '@prisma/client';

// Matches any of the words.
const anyWord = (value: string) => value.split(' ').join(' | ');
// Matches the words as a phrase.
const phrase = (value: string) => value.split(' ').join(' <-> ');

const TAXONOMY_RANKS = [
  'family',
  'genus',
  'order',
  'kingdom',
  'phylum',
  'species',
] as const;

const textFilters = (filter?: ExponatQuery): Prisma.ExponatWhereInput => ({
  ...(filter?.name && {
    name: { search: anyWord(filter.name), mode: 'insensitive' },
  }),
  ...(filter?.alternateName && {
    alternateName: {
      search: anyWord(filter.alternateName),
      mode: 'insensitive',
    },
  }),
});

// Every rank writes the same Categorization key, so when several are given
// only the last one in TAXONOMY_RANKS order applies.
const taxonomyFilter = (filter?: ExponatQuery) => {
  let where: Record<string, unknown> = {};

  if (filter?.class)
    where = {
      search: phrase(filter.class),
      Categorization: { is: { class: { mode: 'insensitive' } } },
    };

  for (const rank of TAXONOMY_RANKS) {
    if (!filter?.[rank]) continue;
    where = {
      ...where,
      Categorization: {
        is: { [rank]: { search: phrase(filter[rank]), mode: 'insensitive' } },
      },
    };
  }

  return where;
};

// A maximum replaces a minimum when both are given.
const favouriteCountFilter = (filter: ExponatQuery) => {
  if (filter.maxFavoriteCount)
    return { _count: { FavouriteExponats: { lte: filter.maxFavoriteCount } } };
  if (filter.minFavoriteCount)
    return { _count: { FavouriteExponats: { gte: filter.minFavoriteCount } } };
  return {};
};

export const buildExponatWhere = (
  filter?: ExponatQuery,
  approval?: boolean,
): Prisma.ExponatWhereInput => ({
  ...textFilters(filter),
  ...(filter?.organisationId && { organisationId: filter.organisationId }),
  ...taxonomyFilter(filter),
  ...favouriteCountFilter(filter),
  ...(filter.createdAt && { createdAt: { gte: filter.createdAt } }),
  ...(approval && { isApproved: approval }),
});

// An explicit sort wins; otherwise a name search is ordered by relevance.
export const buildExponatOrderBy = (
  filter: ExponatQuery,
  sort?: Prisma.ExponatOrderByWithRelationInput,
): Prisma.ExponatOrderByWithRelationInput => {
  if (sort) return { ...sort };
  if (!filter.name) return {};
  return {
    _relevance: {
      fields: ['name'],
      search: phrase(filter.name),
      sort: 'desc',
    },
  };
};
