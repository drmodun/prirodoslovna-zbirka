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
export interface ExponatModalProps {
  exponat: ExponatExtendedResponse;
}

export const ExponatModal = ({ exponat }: ExponatModalProps) => {
  exponat.attributes = JSON.parse(exponat.attributes.toString());
  return (
    <div className={classes.container}>
      <div className={classes.mainImage}>
        <Image src={exponat.mainImage} alt={exponat.title} layout="fill" />
      </div>
      <div className={classes.title}>
        <span className={classes.latinName}>{exponat.alternateName}</span>
        <span className={classes.name}>{exponat.title}</span>
      </div>
      <CategorizationCard categorization={exponat.categorization} />
      <div className={classes.categorization}></div>
      <div className={classes.actions}>
        <div className={classes.button}>
          <span className={classes.text}>Dodaj u favorite</span>
        </div>
        <div className={classes.button}>
          <span className={classes.text}>Generiraj QR kod</span>
        </div>
      </div>
      <ExponatModalSections exponat={exponat} />
    </div>
  );
};
