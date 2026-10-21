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
import SingleInput from "components/SingleInput";
import CardCollection from "components/CardCollection";
import useUser from "@/utility/context/UserContext";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import BaseButton from "components/BaseButton";
import Link from "next/link";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("OrganisationExponatsView");
  const tSort = useTranslations("Sort");
  const [domain, setDomain] = useState(Domains.EUCARIOT);
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className={classes.container}>
      {isMember && (
        <Link
          className={classes.button}
          onClick={() => !isAdmin && alert(t("memberNotice"))}
          href={`/organisation/${organisationId}/createExponat`}
        >
          <BaseButton text={t("addExponat")} />
        </Link>
      )}
      <div className={classes.searchBar}>
        <SingleInput
          question={t("search")}
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
              exponat.name.toLowerCase().includes(searchValue.toLowerCase()),
            )
            .map((exponat) => exponat)}
          type="exponat"
          sortBy={[
            { label: tSort("alphabetical"), value: "name" },
            { label: tSort("scientificName"), value: "alternateName" },
            { label: tSort("publishDate"), value: "updatedAt" },
            { label: tSort("favourites"), value: "favouriteCount" },
            { label: tSort("posts"), value: "postCount" },
          ]}
        />
      </UserWrapper>
    </div>
  );
};
