"use client";

import { ExtendedOrganisationResponse } from "@biosfera/types";
import classes from "./OrganisationBody.module.scss";
import { useState } from "react";
import Tabs from "components/Tabs";
import OrganisationHero from "components/OrganisationHero";

export interface OrganisationBodyProps {
  organisation: ExtendedOrganisationResponse;
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
  const [activeTab, setActiveTab] = useState("about");

  <div className={classes.container}>
    <OrganisationHero organisation={organisation} />
    <Tabs tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />
    <div className={classes.body}>
      {activeTab === "Početna" && <div>početna</div>}
      {activeTab === "Stablo" && <div>stablo</div>}
    
    </div>
  </div>;
};
