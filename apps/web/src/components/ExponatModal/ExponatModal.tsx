import { ExponatExtendedResponse } from "@biosfera/types";
import classes from "./ExponatModal.module.scss";
import ExponatModalSections from "components/ExponatModalSections";
import CategorizationCard from "components/CategorizationCard";
import Link from "next/link";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import QrCodeGenerator from "components/QrCodeButton";
export interface ExponatModalProps {
  exponat: ExponatExtendedResponse;
}

export const ExponatModal = ({ exponat }: ExponatModalProps) => {
  exponat.attributes = JSON.parse(exponat.attributes?.toString());
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
      <div className={classes.actions}>
        <QrCodeGenerator name={exponat.title} />
      </div>
      {!(exponat.exponatKind.toLowerCase() === "mineral") &&
        exponat.categorization && (
          <CategorizationCard categorization={exponat.categorization} />
        )}
      <Link
        href={`/organisation/${exponat.organizationId}`}
        className={classes.orgName}
      >
        Organizacija eksponata: {exponat.organizationName}
      </Link>
      <ExponatModalSections exponat={exponat} />
    </div>
  );
};
