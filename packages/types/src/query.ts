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
  USERNAME = "username",
  COUNTY = "county",
  POST_AMOUNT = "postAmount",
  POINTS = "points",
  FOLLOWERS = "followers",
  FOLLOWING = "following",
  FOLLOWERS_ORGANISATION = "followersOrganisation",
  FAVOURITES = "favourites",
  CREATED_AT = "createdAt",
  ALTERNATE_NAME = "alternateName",
  ORGANISATION = "organisation",
  TITLE = "title",
  EXPONAT_AMOUNT = "exponatAmount",
  GENUS = "genus",
  FAMILY = "family",
  KINGDOM = "kingdom",
  DOMAIN = "domain",
  PHYLUM = "phylum",
  CLASS = "class",
  ORDER = "order",
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
    case SortingEnum.TITLE:
      return { title: request.direction };
    case SortingEnum.POINTS:
      return { points: request.direction };
    case SortingEnum.POST_AMOUNT:
      return {
        Posts: {
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
    case SortingEnum.USERNAME:
      return { username: request.direction };
    default:
      return null;
  }
};
export interface QueryResponse<T> {
  data: T[];
  pagination: PagiantaionResponse;
}

export const sortExponatQueryBuilderWithComplexFilters = (
  request: SortingRequest
) => {
  const simple = sortQueryBuilder(request);
  if (simple) return simple;

  switch (request.attribute) {
    case SortingEnum.FAVOURITES:
      return {
        FavouriteExponats: {
          _count: request.direction,
        },
      };
  }
};

export const socialPostSortQueryBuilder = (request: SortingRequest) => {
  switch (request.attribute) {
    case SortingEnum.ORGANISATION:
      return {
        organisation: {
          name: request.direction,
        },
      };
    case SortingEnum.TITLE:
      return {
        title: request.direction,
      };
  }
};

export const worksSortQueryBuilder = (request: SortingRequest) => {
  switch (request.attribute) {
    case SortingEnum.TITLE:
      return {
        title: request.direction,
      };
  }
};

export const sortCategorizationQueryBuilderWithComplexFilters = (
  request: SortingRequest
) => {
  switch (request.attribute) {
    case SortingEnum.EXPONAT_AMOUNT:
      return {
        Exponat: {
          _count: request.direction,
        },
      };
    case SortingEnum.GENUS:
      return {
        genus: request.direction,
      };
    case SortingEnum.PHYLUM:
      return {
        phylum: request.direction,
      };
    case SortingEnum.FAMILY:
      return {
        family: request.direction,
      };
    case SortingEnum.CLASS:
      return {
        class: request.direction,
      };
    case SortingEnum.DOMAIN:
      return {
        domain: request.direction,
      };
    case SortingEnum.ORDER:
      return {
        order: request.direction,
      };
    case SortingEnum.KINGDOM:
      return {
        kingdom: request.direction,
      };
  }
};
