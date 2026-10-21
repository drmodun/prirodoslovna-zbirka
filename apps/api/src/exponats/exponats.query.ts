import { ExponatQuery } from './dto/exponats.dto';
import { Prisma } from '@prisma/client';

// Matches any of the words.
const anyWord = (value: string) => value.split(' ').join(' | ');
// Matches the words as a phrase.
const phrase = (value: string) => value.split(' ').join(' <-> ');

const TAXONOMY_RANKS = [
  'kingdom',
  'phylum',
  'class',
  'order',
  'family',
  'genus',
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

// Every given rank must match, each as a phrase.
const taxonomyFilter = (filter?: ExponatQuery): Prisma.ExponatWhereInput => {
  const ranks = TAXONOMY_RANKS.filter((rank) => filter?.[rank]);
  if (!ranks.length) return {};

  return {
    Categorization: {
      is: Object.fromEntries(
        ranks.map((rank) => [
          rank,
          { search: phrase(filter[rank]), mode: 'insensitive' },
        ]),
      ),
    },
  };
};

export interface FavouriteCount {
  ExponatId: string;
  _count: { _all: number };
}

// Prisma cannot filter on a relation count, so the caller looks up how often
// each exponat was favourited (exponatFavouriteCounts) and this turns the
// bounds into an id filter. Exponats nobody favourited have a count of 0.
export const favouriteCountFilter = (
  filter: ExponatQuery,
  counts?: FavouriteCount[],
): Prisma.ExponatWhereInput => {
  const min = Number(filter?.minFavoriteCount) || 0;
  const max =
    filter?.maxFavoriteCount !== undefined && filter.maxFavoriteCount !== null
      ? Number(filter.maxFavoriteCount)
      : undefined;
  if (!counts || (!min && max === undefined)) return {};

  const outside = (count: number) =>
    count < min || (max !== undefined && count > max);

  // With a positive minimum only favourited exponats can match.
  if (min > 0)
    return {
      id: {
        in: counts
          .filter(({ _count }) => !outside(_count._all))
          .map(({ ExponatId }) => ExponatId),
      },
    };

  return {
    id: {
      notIn: counts
        .filter(({ _count }) => outside(_count._all))
        .map(({ ExponatId }) => ExponatId),
    },
  };
};

export const needsFavouriteCounts = (filter?: ExponatQuery) =>
  !!filter &&
  ((filter.minFavoriteCount !== undefined &&
    filter.minFavoriteCount !== null) ||
    (filter.maxFavoriteCount !== undefined &&
      filter.maxFavoriteCount !== null));

export const buildExponatWhere = (
  filter?: ExponatQuery,
  approval?: boolean,
  favouriteCounts?: FavouriteCount[],
): Prisma.ExponatWhereInput => ({
  ...textFilters(filter),
  ...(filter?.organisationId && { organisationId: filter.organisationId }),
  ...taxonomyFilter(filter),
  ...favouriteCountFilter(filter, favouriteCounts),
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
