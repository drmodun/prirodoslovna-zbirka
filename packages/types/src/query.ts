export interface PaginationRequest {
  page: number;
  size: number;
}

export interface LongPaginationResponse {
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PagiantaionResponse {
  page: number;
  pageSize: number;
}

export enum SortingEnum {
  NAME = "name",
  COUNTY = "county",
  POST_AMOUNT = "postAmount",
  POINTS = "points",
  FOLLOWERS = "followers",
  FOLLOWING = "following",
  FOLLOWERS_ORGANISATION = "followersOrganisation",
  FAVOURITES = "favourites",
  CREATED_AT = "createdAt",
  ALTERNATE_NAME = "alternateName",
  //...
}

export enum SortType {
  ASCENDING = "asc",
  DESCENDING = "desc",
}

export interface SortingRequest {
  attribute: SortingEnum;
  direction: SortType;
}

export interface SortArg {
  [key: string]: string;
}

export const sortQueryBuilder = (request: SortingRequest) => {
  switch (request.attribute) {
    case SortingEnum.NAME:
      return { name: request.direction };
    case SortingEnum.COUNTY:
      return { location: request.direction };
    case SortingEnum.POINTS:
      return { points: request.direction };
    case SortingEnum.POST_AMOUNT:
      return {
        posts: {
          _count: request.direction,
        },
      };
    case SortingEnum.FOLLOWERS:
      return {
        followers: {
          _count: request.direction,
        },
      };
    case SortingEnum.FOLLOWING:
      return {
        following: {
          _count: request.direction,
        },
      };
    case SortingEnum.FOLLOWERS_ORGANISATION:
      return {
        OrganisationUser: {
          _count: request.direction,
        },
      };

    case SortingEnum.CREATED_AT:
      return { createdAt: request.direction };
    case SortingEnum.ALTERNATE_NAME:
      return { alternateName: request.direction };
  }
};

export interface QueryResponse<T> {
  data: T[];
  pagination: PagiantaionResponse;
}

export const sortQueryBuilderWithComplexFilters = (request: SortingRequest) => {
  const simple = sortQueryBuilder(request);
  if (simple) return simple;

  switch (request.attribute) {
    case SortingEnum.FAVOURITES:
      return {
        FavouriteExponat: {
          _count: request.direction,
        },
      };
  }
};
