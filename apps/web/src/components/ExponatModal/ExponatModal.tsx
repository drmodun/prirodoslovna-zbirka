import { ExponatExtendedResponse } from "@biosfera/types";
import classes from "./ExponatModal.module.scss";
import ExponatModalSections from "components/ExponatModalSections";
import CategorizationCard from "components/CategorizationCard";
import Link from "next/link";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import QrCodeGenerator from "components/QrCodeButton";
import ShareButton from "components/ShareButton";
import { Json } from "@biosfera/types/src/jsonObjects";
export interface ExponatModalProps {
  exponat: ExponatExtendedResponse;
}

export const ExponatModal = ({ exponat }: ExponatModalProps) => {
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
        <ShareButton
          title={exponat.title}
          text={`Pogledajte eksponat ${exponat.title} na biosfera.trema.hr`}
        />
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
      <span className={classes.serialNumber}>
        Serijski broj: {exponat.serialNumber}
      </span>
      <ExponatModalSections exponat={exponat} />
    </div>
  );
};
