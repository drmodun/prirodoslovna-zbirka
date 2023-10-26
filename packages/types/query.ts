export interface PaginationRequest {
  page: number;
  size: number;
}

export interface PagiantaionResponse {
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export enum SortingEnum {
  NAME = "name",
  COUNTY = "county",
  POST_AMOUNT = "postAmount",
  POINTS = "points",
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

export const sortQueryBuilder = (request: SortingRequest) => {
  switch (request.attribute) {
    case SortingEnum.NAME:
      return { name: request.direction };
    case SortingEnum.COUNTY:
      return { county: request.direction };
    case SortingEnum.POINTS:
      return { points: request.direction };
    case SortingEnum.POST_AMOUNT:
      return {
        posts: {
          _count: request.direction,
        },
      };
  }
};
