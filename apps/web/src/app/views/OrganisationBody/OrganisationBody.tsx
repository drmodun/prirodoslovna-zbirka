"use client";

import { ExponatKind, ExtendedOrganisationResponse } from "@biosfera/types";
import classes from "./OrganisationBody.module.scss";
import { useState } from "react";
import Tabs from "components/Tabs";
import OrganisationHero from "components/OrganisationHero";
import { DomainButton } from "components/DomainButton";
import placeholder from "assets/images/lion.svg";
export interface OrganisationBodyProps {
  organisation: ExtendedOrganisationResponse;
}

export enum Domains {
  EUCARIOT = "eucariot",
  PROKARIOT = "procariot",
  MINERAL = "mineral",
}

const tabs = [
  "Početna", //Ovdi ce bit social postevi
  "Stablo",
  "Eksponati",
  "Objave",
  "Članovi",
  "O organizaciji",
];

export const OrganisationBody = ({
  organisation,
}: {
  organisation: ExtendedOrganisationResponse;
}) => {
  const [activeTab, setActiveTab] = useState("Početna");
  return (
    <div className={classes.container}>
      <OrganisationHero organisation={organisation} />
      <div className={classes.body}>
        <Tabs tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />
        <div className={classes.selectedBody}>
          {activeTab === "Početna" && <div>početna</div>}
          {activeTab === "Stablo" && <div>stablo</div>}
          {activeTab === "Eksponati" && (
            <div>
              <DomainButton
                domain="Biljke"
                image={placeholder}
                color={Domains.MINERAL}
              />
            </div>
          )}
          {activeTab === "Objave" && <div>objave</div>}
          {activeTab === "Članovi" && <div>članovi</div>}
          {activeTab === "O organizaciji" && <div>o organizaciji</div>}
        </div>
      </div>
      ;
    </div>
  );
};
