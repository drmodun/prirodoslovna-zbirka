"use client";
import Tabs from "components/Tabs";
import classes from "./SearchPageView.module.scss";

import {
  ExponatResponseShort,
  OrganisationResponseShort,
  PostResponse,
  ShortUserResponse,
  WorkResponseShort,
} from "@biosfera/types";
import { useEffect, useState } from "react";
import { getUsers } from "@/api/serverUsers";
import { getExponats } from "@/api/serverExponats";
import { getPosts } from "@/api/serverPosts";
import { getOrganisations } from "@/api/serverOrganisations";
import CardCollectionAsync from "components/CardCollectionAsync";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import { ExponatFilter } from "components/FIlterForm/ExponatFIlterForm";
import { PostFilter } from "components/FIlterForm/PostFilterForm";
import { OrganisationFilter } from "components/FIlterForm/OrganisationFilter";
import { UserFilter } from "components/FIlterForm/UserFilterForm";
import { getWorks } from "@/api/serverWorks";
import { getGbifWorks } from "@/api/serverLiterature";
import { WorkFilter } from "components/FIlterForm/WorkFilterForm";
import { LiteratureFilter } from "components/FIlterForm/LiteratureFilterForm";

export interface SearchPageViewProps {
  users: ShortUserResponse[];
  organisations: OrganisationResponseShort[];
  exponats: ExponatResponseShort[];
  posts: PostResponse[];
  works: WorkResponseShort[];
  literature: WorkResponseShort[];
  initTab: tabType;
  query: any;
}

const tabs = [
  "Korisnici",
  "Organizacije",
  "Eksponati",
  "Objave",
  "Radovi",
  "Literatura",
];
export type tabType =
  | "Korisnici"
  | "Organizacije"
  | "Eksponati"
  | "Objave"
  | "Radovi"
  | "Literatura";
export type tabDictionaryType =
  | "user"
  | "organisation"
  | "exponat"
  | "post"
  | "work"
  | "literature";

export const tabDictionary = {
  Korisnici: "user",
  Organizacije: "organisation",
  Eksponati: "exponat",
  Objave: "post",
  Radovi: "work",
  Literatura: "literature",
};

export const SearchPageView = ({
  users,
  organisations,
  exponats,
  literature,
  posts,
  initTab,
  works,
  query,
}: SearchPageViewProps) => {
  const [activeTab, setActiveTab] = useState<tabType>(initTab);
  const [page, setPage] = useState<number>(query?.page || 2);

  useEffect(() => {
    setPage(2);
  }, [query, activeTab]);

  return (
    <div className={classes.container}>
      <Tabs activeTab={activeTab} tabs={tabs} onSelect={setActiveTab} />
      <div className={classes.content}>
        {activeTab === "Eksponati" && <ExponatFilter searchParams={query} />}
        {activeTab === "Objave" && <PostFilter searchParams={query} />}
        {activeTab === "Organizacije" && (
          <OrganisationFilter searchParams={query} />
        )}
        {activeTab === "Korisnici" && <UserFilter searchParams={query} />}
        {activeTab === "Radovi" && <WorkFilter searchParams={query} />}
        {activeTab === "Literatura" && (
          <LiteratureFilter searchParams={query} />
        )}
        {query && (
          <UserWrapper>
            <CardCollectionAsync
              type={tabDictionary[activeTab] as tabDictionaryType}
              page={page}
              getMore={
                activeTab === "Korisnici"
                  ? getUsers
                  : activeTab === "Organizacije"
                    ? getOrganisations
                    : activeTab === "Eksponati"
                      ? getExponats
                      : activeTab === "Objave"
                        ? getPosts
                        : activeTab === "Radovi"
                          ? getWorks
                          : getGbifWorks
              }
              params={query}
              items={
                activeTab === "Korisnici"
                  ? users
                  : activeTab === "Organizacije"
                    ? organisations
                    : activeTab === "Eksponati"
                      ? exponats
                      : activeTab === "Objave"
                        ? posts
                        : activeTab === "Radovi"
                          ? works
                          : activeTab === "Literatura"
                            ? literature
                            : []
              }
            />
          </UserWrapper>
        )}
      </div>
    </div>
  );
};
