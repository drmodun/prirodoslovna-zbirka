import { ExponatExtendedResponse } from "@biosfera/types";
import classes from "./ExponatModal.module.scss";
import Image from "next/image";
import desc from "assets/images/desc.svg";
import list from "assets/images/list.svg";
import table from "assets/images/table.svg";
import likeLeafGreen from "assets/images/like-leaf-green.svg";
import { stringCapitaliser } from "@/utility/static/stringCapitaliser";
export interface ExponatModalProps {
  exponat: ExponatExtendedResponse;
}

export const ExponatModal = ({ exponat }: ExponatModalProps) => (
  <div className={classes.container}>
    <div className={classes.mainImage}>
      <Image src={exponat.mainImage} alt={exponat.title} layout="fill"/>
    </div>
    <div className={classes.title}>
      <span className={classes.latinName}>{exponat.alternateName}</span>
      <span className={classes.name}>{exponat.title}</span>
    </div>
    <div className={classes.categorization}></div>
    <div className={classes.actions}>
      <div className={classes.button}>
        <span className={classes.text}>Dodaj u favorite</span>
      </div>
      <div className={classes.button}>
        <span className={classes.text}>Generiraj QR kod</span>
      </div>
    </div>
    <div className={classes.section}>
      <div className={classes.title}>
        <div className={classes.image}>
          <Image src={desc} alt={exponat.title} layout="fill"/>
        </div>
        <span className={classes.titleText}>Kratki opis</span>
      </div>
      <div className={classes.description}>{exponat.description}</div>
    </div>
    <div className={classes.section}>
      <div className={classes.title}>
        <div className={classes.image}>
          <Image src={list} alt={exponat.title} layout="fill"/>
        </div>
        <span className={classes.titleText}>Fun Facts</span>
        <div className={classes.funFacts}>
          {exponat.funFacts.map((fact, index) => (
            <div className={classes.funFact} key={index}>
              <div className={classes.image}>
                <Image src={likeLeafGreen} alt={fact} layout="fill"/>
              </div>
              <span className={classes.text}>{fact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className={classes.section}>
      <div className={classes.title}>
        <div className={classes.image}>
          <Image src={table} alt={exponat.title} />
        </div>
        <span className={classes.titleText}>Tablica</span>
      </div>
      <div className={classes.table}>
        {Object.keys(exponat.attributes).map((key, index) => (
          <div className={classes.tableRow} key={index}>
            <span className={classes.tableKey}>{stringCapitaliser(key)}</span>
            <span className={classes.tableValue}>
              {exponat.attributes[key].toString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
