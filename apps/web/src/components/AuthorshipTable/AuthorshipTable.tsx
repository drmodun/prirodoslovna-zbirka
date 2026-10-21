import { AuthorshipInfo } from "@biosfera/types";
import classes from "./AuthorshipTable.module.scss";
import { Indexable } from "@biosfera/types/src/jsonObjects";
import { useTranslations } from "next-intl";

export interface AuthorshipTableProps {
  authorshipInfo: AuthorshipInfo & Indexable;
}

// The fields shown, labelled from the AuthorshipTable messages.
const LABELLED_FIELDS = [
  "locationOfOccurrence",
  "dateOfOccurrence",
  "nonPlatformAuthor",
  "identifiedBy",
  "photographer",
  "literature",
  "deviceName",
  "authorName",
] as const;

const isLabelled = (key: string) =>
  (LABELLED_FIELDS as readonly string[]).includes(key);

export const AuthorshipTable = ({ authorshipInfo }: AuthorshipTableProps) => {
  const t = useTranslations("AuthorshipTable");

  return (
    <div className={classes.table}>
      {authorshipInfo &&
        Object.keys(authorshipInfo).map(
          (key) =>
            isLabelled(key) &&
            !authorshipInfo[key].includes("undefined") &&
            authorshipInfo[key] != undefined &&
            authorshipInfo[key] != "" &&
            !(
              key === "authorName" && authorshipInfo.nonPlatformAuthor != null
            ) && (
              <div key={key} className={classes.tableRow}>
                <span className={classes.tableKey}>{t(key)}</span>
                <span className={classes.tableValue}>
                  {authorshipInfo[key]}
                </span>
              </div>
            ),
        )}
    </div>
  );
};
