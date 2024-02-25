import { ExponatExtendedResponse } from "@biosfera/types";
import classes from "./ExponatModal.module.scss";
import Image from "next/image";
import desc from "assets/images/desc.svg";
import list from "assets/images/list.svg";
import table from "assets/images/table.svg";
import likeLeafGreen from "assets/images/like-leaf-green.svg";
import { stringCapitaliser } from "@/utility/static/stringCapitaliser";
import ExponatModalSections from "components/ExponatModalSections";
import CategorizationCard from "components/CategorizationCard";
import Link from "next/link";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
export interface ExponatModalProps {
  exponat: ExponatExtendedResponse;
}

export const ExponatModal = ({ exponat }: ExponatModalProps) => {
  exponat.attributes = JSON.parse(exponat.attributes.toString());
  return (
    <div className={classes.container}>
      <div className={classes.mainImage}>
        <ImageWithFallback
          src={exponat.mainImage}
          alt={exponat.title}
          layout="fill"
        />
      </div>
      <div className={classes.title}>
        <span className={classes.latinName}>{exponat.alternateName}</span>
        <span className={classes.name}>{exponat.title}</span>
      </div>
      {!(exponat.exponatKind.toLowerCase() === "mineral") && (
        <CategorizationCard categorization={exponat.categorization} />
      )}
      <Link
        href={`/organisation/${exponat.organizationId}`}
        className={classes.orgName}
      >
        Organizacija eksponata: {stringCapitaliser(exponat.organizationName)}
      </Link>
      <ExponatModalSections exponat={exponat} />
    </div>
  );
};
