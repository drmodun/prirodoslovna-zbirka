import { CategorizationResponse } from "@biosfera/types";
import rArrow from "assets/images/r-arrow.svg";
import classes from "./CategorizationCard.module.scss";
import { Indexable, Json } from "@biosfera/types/src/jsonObjects";
import Link from "next/link";
import Image from "next/image";

export interface CategorizationCardProps {
  categorization: CategorizationResponse;
}

export const CategorizationCard = ({
  categorization,
}: CategorizationCardProps) => {
  return (
    <div className={classes.container}>
      {Object.keys(categorization)
        .filter((key) => key !== "id" && key != "species")
        .map((key) => {
          return (
            <div key={key} className={classes.categorization}>
              <Link
                href={{
                  pathname: `/categorization/${key}/${
                    (categorization as Indexable)[key]
                  }`,
                  query: {
                    [key]: (categorization as Indexable)[key],
                  },
                }}
              >
                <div className={classes.categorizationValue}>
                  {(categorization as Indexable)[key]}
                </div>
                {key !== "genus" && (
                  <div className={classes.image}>
                    <Image src={rArrow} alt="arrow" />
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      ž
    </div>
  );
};
