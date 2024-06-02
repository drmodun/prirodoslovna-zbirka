"use server";

import {
  LiteratureResponseGBIF,
  WorkResponseShort,
  getEnumValue,
  Topics,
  FullLiteratureResponseGBIF,
  GbifQuery,
} from "@biosfera/types";
import queryString from "query-string";
import { WorksQuery, WorkToGbifQueryMapper } from "./serverWorks";

export const LiteratureToWorkMapper = (
  literature: LiteratureResponseGBIF,
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
      .map((topic) => getEnumValue(Topics, topic)) //Format tags
      .concat(
        literature.keywords.filter((keyword) => keyword.length < 20), //Remove large not needed keywords
      ),
    isGbif: true,
    type: literature.literatureType,
    website: literature.websites[0],
  }) as WorkResponseShort;

export const getGbifWorks = async (
  query: WorksQuery | GbifQuery,
  page?: number,
): Promise<WorkResponseShort[] | undefined> => {
  try {
    const gbifQuery: GbifQuery =
      (query as GbifQuery) || WorkToGbifQueryMapper(query as WorksQuery);
    if (page) gbifQuery.offset = (page - 1) * (gbifQuery.limit ?? 20);
    const search = queryString.stringify(gbifQuery);
    const response = await fetch(
      `https://api.gbif.org/v1/literature/search?limit=20&${search || ""}`,
      {
        next: {
          revalidate: 1 * 60 * 60 * 24 * 7, //weekly revalidation
        },
      },
    );
    const data: FullLiteratureResponseGBIF = await response.json();
    return data.results.map((d: LiteratureResponseGBIF) =>
      LiteratureToWorkMapper(d),
    );
  } catch (error) {
    console.log(error);
  }
};

export const getGbifWork = async (
  id: string,
): Promise<WorkResponseShort | undefined> => {
  try {
    const response = await fetch(`https://api.gbif.org/v1/literature/${id}`, {
      next: {
        revalidate: 1 * 60 * 60 * 24 * 7, //weekly revalidation
      },
    });

    const data: LiteratureResponseGBIF = await response.json();

    return LiteratureToWorkMapper(data);
  } catch (error) {
    console.log(error);
  }
};
