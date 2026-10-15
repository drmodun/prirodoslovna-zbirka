"use client";

import {
  ExtendedOrganisationResponse,
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

const postSortOptions = [
  { label: "Abecedno", value: "title" },
  { label: "Najpopularnije", value: "likeScore" },
  { label: "Ime autora", value: "authorName" },
  { label: "Novo", value: "updatedAt" },
];

const memberSortOptions = [
  { label: "Abecedno", value: "username" },
  { label: "Uloga", value: "role" },
];

const workSortOptions = [
  { label: "Ime", value: "title" },
  { label: "Broj spremanja", value: "amountOfSaves" },
  { label: "Vrsta", value: "type" },
];

interface TabPanelProps {
  activeTab: string;
  organisation: ExtendedOrganisationResponse;
  works: WorkResponseShort[];
}

const TabPanel = ({ activeTab, organisation, works }: TabPanelProps) => {
  const { memberships, user } = useUser();

  switch (activeTab) {
    case "Početna":
      return <OrganisationHomepage organisation={organisation} />;
    case "Edit":
      return (
        <UserWrapper>
          <OrganisationForm isEdit initvalues={organisation} />
          <DeleteOrganisationButton organisationId={organisation.id} />
        </UserWrapper>
      );
    case "Eksponati":
      return (
        <OrganisationExponatsView
          isMember={memberships.some(
            (x) => x.id === organisation.id && x.role !== "REQUESTED",
          )}
          exponats={organisation.exponats}
          organisationId={organisation.id}
          isAdmin={memberships.some(
            (x) =>
              (x.id === organisation.id && x.role === "ADMIN") ||
              x.role === "OWNER" ||
              user?.role?.toLowerCase() === "super",
          )}
        />
      );
    case "Objave":
      return (
        <CardCollection
          items={organisation.posts}
          type="post"
          organisationId={organisation.id}
          sortBy={postSortOptions}
        />
      );
    case "Članovi":
      return (
        <UserWrapper>
          <CardCollection
            items={organisation.members}
            type="user-member"
            sortBy={memberSortOptions}
            organisationId={organisation.id}
            pageSize={10}
          />
        </UserWrapper>
      );
    case "Radovi":
      return (
        <UserWrapper>
          <Link
            className={classes.link}
            href={`/organisation/${organisation.id}/createWork`}
          >
            <BaseButton text="Napravi rad" isNotSubmit />
          </Link>
          <CardCollection
            items={works}
            organisationId={organisation.id}
            userId={user?.id}
            sortBy={workSortOptions}
            type="work"
          />
        </UserWrapper>
      );
    default:
      return null;
  }
};

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

  const canManage =
    user?.role?.toLocaleLowerCase() === "super" ||
    memberships.some(
      (x) =>
        x.id === organisation.id && (x.role === "ADMIN" || x.role === "OWNER"),
    );

  // Admins get the unapproved content too, and an Edit tab.
  const possiblyRefecth = async () => {
    if (!canManage) return;
    const adminOrg = await api.get<never, ExtendedOrganisationResponse>(
      `/organisations/${organisation.id}`,
    );
    if (adminOrg) setOrganisationData(adminOrg);
    setAvailableTabs((prev) => [...prev.filter((x) => x !== "Edit"), "Edit"]);
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
          <TabPanel
            activeTab={activeTab}
            organisation={organisationData}
            works={worksData}
          />
        </div>
      </div>
    </div>
  );
};
