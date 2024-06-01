"use client";

import { ExponatExtendedResponse } from "@biosfera/types";
import classes from "./ExponatModalSections.module.scss";
import desc from "assets/images/desc.svg";
import Image from "next/image";
import list from "assets/images/list.svg";
import table from "assets/images/table.svg";
import likeLeafGreen from "assets/images/like-leaf-green.svg";
import { stringCapitaliser } from "@/utility/static/stringCapitaliser";
import { useRef, useState } from "react";
import clsx from "clsx";
import AuthorshipTable from "components/AuthorshipTable";

export interface ExponatModalSectionsProps {
  exponat: ExponatExtendedResponse;
}

export const ExponatModalSections = ({
  exponat,
}: ExponatModalSectionsProps) => {
  const [extended, setExtended] = useState<boolean>(false);
  const box = useRef<HTMLDivElement>(null);

  return (
    <div className={clsx(classes.container, extended && classes.extended)}>
      <div
        ref={box}
        className={clsx(classes.content, extended && classes.extended)}
      >
        <div className={classes.section}>
          <AuthorshipTable authorshipInfo={exponat.authorshipInfo} />
        </div>
        <div className={classes.section}>
          <div className={classes.title}>
            <div className={classes.image}>
              <Image src={desc} alt={exponat.title} layout="fill" />
            </div>
            <span className={classes.titleText}>Kratki opis</span>
          </div>
          <div className={classes.description}>{exponat.description}</div>
        </div>
        <div className={classes.section}>
          <div className={classes.title}>
            <div className={classes.image}>
              <Image src={list} alt={exponat.title} layout="fill" />
            </div>
            <span className={classes.titleText}>Fun Facts</span>
          </div>
          <div className={classes.funFacts}>
            {exponat.funFacts.map((fact, index) => (
              <div className={classes.funFact} key={index}>
                <div className={classes.image}>
                  <Image src={likeLeafGreen} alt={fact} layout="fill" />
                </div>
                <span className={classes.text}>{fact}</span>
              </div>
            ))}
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
                <span className={classes.tableKey}>
                  {stringCapitaliser(key)}
                </span>
                <span className={classes.tableValue}>
                  {exponat.attributes[key].toString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
