import {
  FullLiteratureResponseGBIF,
  GbifQuery,
  getWorkQuery,
  LiteratureResponseGBIF,
  SortingEnum,
  Topics,
  WorkResponseExtended,
  WorkResponseShort,
} from "@biosfera/types";
import queryString from "query-string";
import { getBaseUrl } from "./getUrlServer";
import { stringCapitaliser } from "@/utility/static/stringCapitaliser";

export const _worksQuery = getWorkQuery();
export class WorksQuery extends _worksQuery {}

export const WorkToGbifQueryMapper = (work: WorksQuery): GbifQuery => {
  return {
    q: work.title,
    literatureType: work.type,
    publisher: [work.organisationId ?? "GBIF"],
    limit: work.size ?? 20,
    offset: work.page ? (work.page - 1) * (work.size ?? 20) : 0,
    topics: work.tags?.map((tag) => Topics[tag as keyof typeof Topics]),
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
    auhtorName: literature.authors
      .map((author) => `${author.firstName} ${author.lastName}`)
      .join(", "),
    id: literature.id,
    organisationId: "GBIF",
    organisationName: literature.publisher,
    updatedAt: literature.published, //TODO: decide what to use here discovered or published
    amountOfSaves: 0,
    tags: literature.topics
      .map((topic) => stringCapitaliser(topic.toLowerCase())) //Format tags
      .concat(
        literature.keywords.filter((keyword) => keyword.length < 20) //Remove large not needed keywords
      ),
    isGbif: true,
    type: literature.literatureType,
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

export const getGbifWorks = async (
  query: WorksQuery | GbifQuery,
  page?: number
): Promise<WorkResponseShort[] | undefined> => {
  try {
    const gbifQuery: GbifQuery =
      (query as GbifQuery) || WorkToGbifQueryMapper(query as WorksQuery);
    if (page) gbifQuery.offset = (page - 1) * (gbifQuery.limit ?? 20);
    const search = queryString.stringify(gbifQuery);
    const response = await fetch(
      `https://api.gbif.org/v1/literature/search?${search || ""}`
    );
    const data: FullLiteratureResponseGBIF = await response.json();
    return data.results.map((d: LiteratureResponseGBIF) =>
      LiteratureToWorkMapper(d)
    );
  } catch (error) {
    console.log(error);
  }
};

//TODO: add discovery algorithm later
