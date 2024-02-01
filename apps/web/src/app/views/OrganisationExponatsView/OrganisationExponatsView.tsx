"use client";
import { DomainButton } from "components/DomainButton";
import classes from "./OrganisationExponatsView.module.scss";
import { ExponatResponseShort } from "@biosfera/types";
import { Domains } from "../OrganisationBody/OrganisationBody";
import domainEucariot from "assets/images/domain-eucariot.svg";
import domainMineral from "assets/images/domain-mineral.svg";
import domainProcariot from "assets/images/domain-procariot.svg";
import { useState } from "react";
import search from "assets/images/search.svg";
import { ExponatCard } from "components/ExponatCard";
import SingleInput from "components/SingleInput";

export interface OrganisationExponatsViewProps {
  exponats: ExponatResponseShort[];
}

export const OrganisationExponatsView = ({
  exponats,
}: {
  exponats: ExponatResponseShort[];
}) => {
  const [domain, setDomain] = useState(Domains.EUCARIOT);
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className={classes.container}>
      <div className={classes.searchBar}>
        <SingleInput
          question="Pretraži eksponate"
          value={searchValue}
          onChange={setSearchValue}
          image={search}
        />
      </div>
      <div className={classes.domainRow}>
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
      <div className={classes.cardRow}>
        {exponats
          .filter((exponat) => exponat.exponatKind.toLowerCase() === domain)
          .filter((exponat) =>
            exponat.name.toLowerCase().includes(searchValue.toLowerCase())
          )
          .map((exponat) => (
            <ExponatCard exponat={exponat} key={exponat.id} />
          ))}
        <span className={classes.error}>Nema eksponata za odabranu domenu</span>
      </div>
    </div>
  );
};
