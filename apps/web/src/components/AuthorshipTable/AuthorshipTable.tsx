import { AuthorshipInfo } from "@biosfera/types";
import classes from "./AuthorshipTable.module.scss";
import { Indexable } from "@biosfera/types/src/jsonObjects";

export interface AuthorshipTableProps {
  authorshipInfo: AuthorshipInfo & Indexable;
}

export const authTableDict: Indexable = {
  locationOfOccurrence: "Lokacija pojavljivanja",
  dateOfOccurrence: "Datum pojavljivanja",
  authorId: "id autora",
  nonPlatformAuthor: "Autor",
  identifiedBy: "Identificirao",
  photographer: "Fotograf",
  literature: "Literatura",
  deviceName: "Naziv uređaja",
};

export const AuthorshipTable = ({ authorshipInfo }: AuthorshipTableProps) => (
  <div className={classes.table}>
    {authorshipInfo &&
      Object.keys(authorshipInfo).map(
        (key) =>
          key !== "id" &&
          authorshipInfo[key] &&
          key !== "authorId" && (
            <div key={key} className={classes.tableRow}>
              <span className={classes.tableKey}>{authTableDict[key]}</span>
              <span className={classes.tableValue}>{authorshipInfo[key]}</span>
            </div>
          )
      )}
  </div>
);
