"use client";

import {
  ExponatKind,
  ExtendedOrganisationResponse,
  MemberRole,
  WorkResponseShort,
} from "@biosfera/types";
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
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import OrganisationForm from "components/CreateOrganisationForm";
import DeleteOrganisationButton from "components/DeleteOrganisationButton";
import BaseButton from "components/BaseButton";
import Link from "next/link";
export interface OrganisationBodyProps {
  organisation: ExtendedOrganisationResponse;
  works: WorkResponseShort[];
}

export enum Domains {
  EUCARIOT = "eucariot",
  PROCARIOT = "procariot",
  MINERAL = "mineral",
}

const tabs = [
  "Početna", //Ovdi ce bit social postevi
  "Eksponati",
  "Objave",
  "Članovi",
  "Radovi",
];

export const OrganisationBody = ({
  organisation,
  works,
}: OrganisationBodyProps) => {
  if (!organisation) window.location.href = "/404";
  const { memberships, user } = useUser();
  const [organisationData, setOrganisationData] =
    useState<ExtendedOrganisationResponse>(organisation);
  const [activeTab, setActiveTab] = useState("Početna");
  const [availableTabs, setAvailableTabs] = useState<string[]>(tabs);
  const [worksData, setWorksData] = useState(works);

  useEffect(() => {
    setWorksData(works);
  }, [works]);

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
            <OrganisationExponatsView
              isMember={memberships.some(
                (x) => x.id === organisation.id && x.role !== "REQUESTED"
              )}
              exponats={organisationData.exponats}
              organisationId={organisation.id}
              isAdmin={memberships.some(
                (x) =>
                  (x.id === organisation.id && x.role === "ADMIN") ||
                  x.role === "OWNER" ||
                  user?.role?.toLowerCase() === "super"
              )}
            />
          )}
          {activeTab === "Objave" && (
            <CardCollection
              items={organisationData.posts}
              type="post"
              sortBy={[
                { label: "Abecedno", value: "title" },
                { label: "Najpopularnije", value: "likeScore" },
                { label: "Ime autora", value: "authorName" },
                { label: "Novo", value: "updatedAt" },
              ]}
            />
          )}
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
          {activeTab === "Radovi" && (
            <UserWrapper>
              <Link
                className={classes.link}
                href={`/organisation/${organisationData.id}/createWork`}
              >
                <BaseButton text="Napravi rad" isNotSubmit />
              </Link>
              <CardCollection
                items={works}
                organisationId={organisationData.id}
                userId={user?.id}
                sortBy={[
                  {
                    label: "Ime",
                    value: "title",
                  },
                  {
                    label: "Broj spremanja",
                    value: "amountOfSaves",
                  },
                  {
                    label: "Vrsta",
                    value: "type",
                  },
                ]}
                type="work"
              />
            </UserWrapper>
          )}
        </div>
      </div>
    </div>
  );
};
