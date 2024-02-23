"use client";

import { ExponatKind, ExtendedOrganisationResponse } from "@biosfera/types";
import classes from "./OrganisationBody.module.scss";
import { useEffect, useState } from "react";
import Tabs from "components/Tabs";
import OrganisationHero from "components/OrganisationHero";
import OrganisationExponatsView from "../OrganisationExponatsView";
import OrganisationHomepage from "../OrganisationHomepage";
import OrganisationAbout from "../OrganisationAbout";
import CardCollection from "components/CardCollection";
import useUser from "@/utility/context/UserContext";
import { api } from "@/api/shared";
import { set } from "react-hook-form";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import OrganisationForm from "components/CreateOrganisationForm";
import DeleteOrganisationButton from "components/DeleteOrganisationButton";
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
  const { memberships, user } = useUser();
  const [organisationData, setOrganisationData] =
    useState<ExtendedOrganisationResponse>(organisation);
  const [activeTab, setActiveTab] = useState("Početna");
  const [availableTabs, setAvailableTabs] = useState<string[]>(tabs);

  const possiblyRefecth = async () => {
    if (
      user?.role?.toLocaleLowerCase() === "super" ||
      memberships.some(
        (x) =>
          x.id === organisation.id && (x.role === "ADMIN" || x.role === "OWNER")
      )
    ) {
      const adminOrg = await api.get<never, ExtendedOrganisationResponse>(
        `/organisations/${organisation.id}`
      );
      if (adminOrg) setOrganisationData(adminOrg);
      setAvailableTabs((prev) => [...prev.filter((x) => x !== "Edit"), "Edit"]);
    }
  };
  useEffect(() => {
    possiblyRefecth();
  }, [organisation, memberships, user]);

  return (
    <div className={classes.container}>
      <OrganisationHero organisation={organisationData} />
      <div className={classes.body}>
        <Tabs
          tabs={availableTabs}
          activeTab={activeTab}
          onSelect={setActiveTab}
        />
        <div className={classes.selectedBody}>
          {activeTab === "Početna" && (
            <OrganisationHomepage organisation={organisationData} />
          )}
          {activeTab === "Edit" && (
            <UserWrapper>
              <OrganisationForm isEdit initvalues={organisationData} />
              <DeleteOrganisationButton organisationId={organisationData.id} />
            </UserWrapper>
          )}
          {activeTab === "Eksponati" && (
            <OrganisationExponatsView exponats={organisationData.exponats} />
          )}
          {activeTab === "Objave" && <div>objave</div>}
          {activeTab === "Članovi" && organisationData.id && (
            <UserWrapper>
              <CardCollection
                items={organisationData.members}
                type="user-member"
                sortBy={[
                  { label: "Abecedno", value: "username" },
                  { label: "Uloga", value: "role" },
                ]}
                organisationId={organisationData.id}
                pageSize={10}
              />
            </UserWrapper>
          )}
          {activeTab === "O organizaciji" && (
            <OrganisationAbout organisation={organisationData} />
          )}
        </div>
      </div>
      ;
    </div>
  );
};
