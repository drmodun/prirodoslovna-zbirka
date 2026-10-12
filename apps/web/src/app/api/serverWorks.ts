import {
  GbifQuery,
  getWorkQuery,
  SortingEnum,
  Topics,
  WorkResponseExtended,
  WorkType,
} from "@biosfera/types";
import { getBaseUrl } from "./getUrlServer";
import { buildListQuery } from "./listQuery";

export const _worksQuery = getWorkQuery();
export class WorksQuery extends _worksQuery {}

const SORTABLE: string[] = [
  SortingEnum.TITLE,
  SortingEnum.CREATED_AT,
  SortingEnum.ORGANISATION,
];

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
  page: number = 1,
): Promise<WorkResponseExtended[] | undefined> => {
  try {
    if (queryDto.attribute === "name") queryDto.attribute = SortingEnum.TITLE;
    const query = buildListQuery(queryDto, SORTABLE, page);
    const response = await fetch(`${getBaseUrl()}/works?${query}`, {
      cache: "no-store",
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

//TODO: add discovery algorithm later
