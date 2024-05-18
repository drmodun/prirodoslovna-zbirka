import {
  GbifQuery,
  getWorkQuery,
  SortingEnum,
  Topics,
  WorkResponseExtended,
  WorkType,
} from "@biosfera/types";
import queryString from "query-string";
import { getBaseUrl } from "./getUrlServer";

export const _worksQuery = getWorkQuery();
export class WorksQuery extends _worksQuery {}

export const WorkToGbifQueryMapper = (work: WorksQuery): GbifQuery => {
  return {
    q: work.title,
    literatureType: work.type as WorkType,
    publisher: [work.organisationId ?? "GBIF"],
    limit: work.size ?? 20,
    offset: work.page ? (work.page - 1) * (work.size ?? 20) : 0,
    topics: work.tags?.map((tag) => Topics[tag as keyof typeof Topics]),
  };
};

export const getWorks = async (
  queryDto: WorksQuery,
  page: number = 1
): Promise<WorkResponseExtended[] | undefined> => {
  try {
    if (queryDto.attribute === "name") queryDto.attribute = SortingEnum.TITLE;
    if (
      queryDto.attribute !== SortingEnum.TITLE &&
      queryDto.attribute !== SortingEnum.CREATED_AT &&
      queryDto.attribute !== SortingEnum.ORGANISATION &&
      queryDto.attribute
    )
      delete queryDto.attribute;

    if (page) queryDto.page = page;
    if (!queryDto.page) queryDto.page = 1;
    queryDto.size = 20;

    const query = queryString.stringify(queryDto);
    const response = await fetch(`${getBaseUrl()}/works?${query}`);
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

//TODO: add discovery algorithm later
