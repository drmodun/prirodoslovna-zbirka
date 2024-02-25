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
import CardCollection from "components/CardCollection";
import useUser from "@/utility/context/UserContext";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import BaseButton from "components/BaseButton";
import Link from "next/link";

export interface OrganisationExponatsViewProps {
  exponats: ExponatResponseShort[];
  organisationId: string;
  isAdmin: boolean;
  isMember: boolean;
}

export const OrganisationExponatsView = ({
  exponats,
  organisationId,
  isMember,
  isAdmin,
}: OrganisationExponatsViewProps) => {
  const [domain, setDomain] = useState(Domains.EUCARIOT);
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className={classes.container}>
      {isMember && (
        <Link
          className={classes.button}
          onClick={() =>
            !isAdmin &&
            alert(
              "Kao samo član, možete dodati eksponat ali neće odmah biti vidljiv na stranic već morate pričekati dopuštenje admina"
            )
          }
          href={`/organisation/${organisationId}/createExponat`}
        >
          <BaseButton text="Dodaj eksponat" />
        </Link>
      )}
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
      <UserWrapper>
        <CardCollection
          pageSize={10}
          items={exponats
            .filter((exponat) => exponat.exponatKind.toLowerCase() === domain)
            .filter((exponat) =>
              exponat.name.toLowerCase().includes(searchValue.toLowerCase())
            )
            .map((exponat) => exponat)}
          type="exponat"
          sortBy={[
            { label: "Abecedno", value: "name" },
            { label: "Abecedno (znanstveno ime)", value: "alternateName" },
            { label: "Datum Objave", value: "updatedAt" },
            { label: "Broj Favorita", value: "favouriteCount" },
            { label: "Broj objava", value: "postCount" },
          ]}
        />
      </UserWrapper>
    </div>
  );
};
