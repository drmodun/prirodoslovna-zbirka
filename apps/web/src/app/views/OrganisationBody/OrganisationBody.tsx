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
import OrganisationQuizzes from "../OrganisationQuizzes";
import CardCollection from "components/CardCollection";
import useUser from "@/utility/context/UserContext";
import { api } from "@/api/shared";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import OrganisationForm from "components/CreateOrganisationForm";
import DeleteOrganisationButton from "components/DeleteOrganisationButton";
import BaseButton from "components/BaseButton";
import Link from "next/link";
import { isModeratorRole, isSuperRole } from "@/utility/static/roles";
import { useTranslations } from "next-intl";
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
  "Kvizovi",
];

// Labels are Sort message keys.
const postSortOptions = [
  { label: "alphabetical", value: "title" },
  { label: "popular", value: "likeScore" },
  { label: "author", value: "authorName" },
  { label: "newest", value: "updatedAt" },
];

const memberSortOptions = [
  { label: "alphabetical", value: "username" },
  { label: "role", value: "role" },
];

const workSortOptions = [
  { label: "name", value: "title" },
  { label: "saves", value: "amountOfSaves" },
  { label: "type", value: "type" },
];

interface TabPanelProps {
  activeTab: string;
  organisation: ExtendedOrganisationResponse;
  works: WorkResponseShort[];
}

const TabPanel = ({ activeTab, organisation, works }: TabPanelProps) => {
  const { memberships, user } = useUser();
  const t = useTranslations("OrganisationBody");
  const tSort = useTranslations("Sort");
  const translated = (options: { label: string; value: string }[]) =>
    options.map((option) => ({ ...option, label: tSort(option.label) }));

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
          isAdmin={
            isSuperRole(user?.role) ||
            memberships.some(
              (x) =>
                x.id === organisation.id &&
                (x.role === "ADMIN" || x.role === "OWNER"),
            )
          }
        />
      );
    case "Objave":
      return (
        <CardCollection
          items={organisation.posts}
          type="post"
          organisationId={organisation.id}
          sortBy={translated(postSortOptions)}
        />
      );
    case "Članovi":
      return (
        <UserWrapper>
          <CardCollection
            items={organisation.members}
            type="user-member"
            sortBy={translated(memberSortOptions)}
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
            <BaseButton text={t("createWork")} isNotSubmit />
          </Link>
          <CardCollection
            items={works}
            organisationId={organisation.id}
            userId={user?.id}
            sortBy={translated(workSortOptions)}
            type="work"
          />
        </UserWrapper>
      );
    case "Kvizovi": {
      const isAdmin =
        isSuperRole(user?.role) ||
        memberships.some(
          (x) =>
            x.id === organisation.id &&
            (x.role === "ADMIN" || x.role === "OWNER"),
        );
      return (
        <OrganisationQuizzes
          organisationId={organisation.id}
          isAdmin={isAdmin}
          canModerate={isAdmin || isModeratorRole(user?.role)}
          isLoggedIn={!!user}
        />
      );
    }
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

  const isOrganisationAdmin =
    isSuperRole(user?.role) ||
    memberships.some(
      (x) =>
        x.id === organisation.id && (x.role === "ADMIN" || x.role === "OWNER"),
    );
  const canModerate = isOrganisationAdmin || isModeratorRole(user?.role);

  // Moderators get the unapproved content too; organisation admins also get
  // an Edit tab.
  const possiblyRefecth = async () => {
    if (!canModerate) return;
    const adminOrg = await api.get<never, ExtendedOrganisationResponse>(
      `/organisations/${organisation.id}`,
    );
    if (adminOrg) setOrganisationData(adminOrg);
    if (isOrganisationAdmin)
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
