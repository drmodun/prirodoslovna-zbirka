"use client";

import { ExponatKind, ExtendedOrganisationResponse } from "@biosfera/types";
import classes from "./OrganisationBody.module.scss";
import { useState } from "react";
import Tabs from "components/Tabs";
import OrganisationHero from "components/OrganisationHero";
import OrganisationExponatsView from "../OrganisationExponatsView";
import OrganisationHomepage from "../OrganisationHomepage";
import OrganisationAbout from "../OrganisationAbout";
import CardCollection from "components/CardCollection";
export interface OrganisationBodyProps {
  organisation: ExtendedOrganisationResponse;
}

export enum Domains {
  EUCARIOT = "eucariot",
  PROCARIOT = "procariot",
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
          {activeTab === "Početna" && (
            <OrganisationHomepage organisation={organisation} />
          )}
          {activeTab === "Stablo" && <div>stablo</div>}
          {activeTab === "Eksponati" && (
            <OrganisationExponatsView exponats={organisation.exponats} />
          )}
          {activeTab === "Objave" && <div>objave</div>}
          {activeTab === "Članovi" && (
            <CardCollection
              items={organisation.members}
              type="user"
              sortBy={[
                { label: "Abecedno", value: "username" },
                { label: "Uloga", value: "role" },
              ]}
              pageSize={10}
            />
          )}
          {activeTab === "O organizaciji" && (
            <OrganisationAbout organisation={organisation} />
          )}
        </div>
      </div>
      ;
    </div>
  );
};
