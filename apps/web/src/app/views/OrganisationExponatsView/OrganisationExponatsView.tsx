"use client";
import { DomainButton } from "components/DomainButton";
import classes from "./OrganisationExponatsView.module.scss";
import { ExponatResponseShort } from "@biosfera/types";
import { Domains } from "../OrganisationBody/OrganisationBody";
import domainEucariot from "assets/images/domain-eucariot.svg";
import domainMineral from "assets/images/domain-mineral.svg";
import domainProcariot from "assets/images/domain-procariot.svg";
import { useState } from "react";
import Input from "components/Input";
import { ExponatCard } from "components/ExponatCard";

export interface OrganisationExponatsViewProps {
  exponats: ExponatResponseShort[];
}

export const OrganisationExponatsView = ({
  exponats,
}: {
  exponats: ExponatResponseShort[];
}) => {
  const [domain, setDomain] = useState(Domains.EUCARIOT);
  const [search, setSearch] = useState("");

  return (
    <div className={classes.container}>
      <div className={classes.domainRows}>
        <DomainButton
          domain={Domains.EUCARIOT}
          image={domainEucariot}
          onClick={setDomain}
          selected={domain === Domains.EUCARIOT}
        />
        <DomainButton
          domain={Domains.PROCARIOT}
          image={domainProcariot}
          onClick={setDomain}
          selected={domain === Domains.PROCARIOT}
        />
        <DomainButton
          domain={Domains.MINERAL}
          image={domainMineral}
          onClick={setDomain}
          selected={domain === Domains.MINERAL}
        />
      </div>
      <div className={classes.searchBar}>
        <input
          title="Pretraga"
          className={classes.searchInput}
          type="text"
          placeholder="Pretraži eksponate"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className={classes.cardRow}>
        {exponats
          .filter((exponat) => exponat.exponatKind === domain)
          .filter((exponat) =>
            exponat.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((exponat) => (
            <ExponatCard exponat={exponat} key={exponat.id} />
          ))}
      </div>
    </div>
  );
};
