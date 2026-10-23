import { LiteratureResponseGBIF, WorkResponseShort } from "@biosfera/types";

// Kept out of serverLiterature: a "use server" module may only export async
// functions.
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
    // Topics stay keys; the cards show them in the reader's language.
    tags: literature.topics.concat(
      literature.keywords.filter((keyword) => keyword.length < 20), //Remove large not needed keywords
    ),
    isGbif: true,
    type: literature.literatureType,
    website: literature.websites[0],
  }) as WorkResponseShort;
