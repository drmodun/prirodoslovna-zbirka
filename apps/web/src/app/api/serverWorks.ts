import {
  GbifQuery,
  getWorkQuery,
  LiteratureResponseGBIF,
  SortingEnum,
  WorkResponseExtended,
  WorkResponseShort,
} from "@biosfera/types";
import queryString from "query-string";
import { getBaseUrl } from "./getUrlServer";

export const _worksQuery = getWorkQuery();
export class WorksQuery extends _worksQuery {}

export const WorkToGbifMapper = (work: WorksQuery): GbifQuery => {
  return {
    q: work.title,
    literatureType: work.type,
    publisher: work.organisationId,
    limit: work.size ?? 20,
    offset: work.page ? (work.page - 1) * (work.size ?? 20) : 0,
    topics: work.tags,
  };
};

export const LiteratureToWorkMapper = (
  literature: LiteratureResponseGBIF
): WorkResponseShort =>
  ({
    title: literature.title,
    description: literature.abstract,
    poster: literature.id,
    authorId: "GBIF",
    auhtorName: `${literature.authors[0].firstName} ${literature.authors[0].lastName}`,
    id: literature.id,
    organisationId: "GBIF",
    organisationName: literature.publisher,
    updatedAt: literature.published, //TODO: decide what to use here discovered or published
    amountOfSaves: 0,
    tags: literature.keywords,
    isGbif: true,
    website: literature.websites[0],
  }) as WorkResponseShort;

export const getWorks = async (
  queryDto: WorksQuery,
  page: number = 1
): Promise<WorkResponseExtended[] | undefined> => {
  try {
    if (queryDto.attribute === "name") queryDto.attribute = SortingEnum.TITLE;
    if (
      queryDto.attribute !== SortingEnum.TITLE &&
      queryDto.attribute !== SortingEnum.CREATED_AT &&
      queryDto.attribute !== SortingEnum.ORGANISATION
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

export const getGbifWorks = async (
  query: WorksQuery
): Promise<WorkResponseShort[] | undefined> => {
  try {
    const gbifQuery = WorkToGbifMapper(query);
    const search = queryString.stringify(gbifQuery);
    const response = await fetch(
      `https://api.gbif.org/v1/literature/search?${search || ""}`
    );
    const data = await response.json();
    return data.map((d: LiteratureResponseGBIF) => LiteratureToWorkMapper(d));
  } catch (error) {
    console.log(error);
  }
};

//TODO: add discovery algorithm later
