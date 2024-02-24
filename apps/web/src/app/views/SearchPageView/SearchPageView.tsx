"use client";
import Tabs from "components/Tabs";
import classes from "./SearchPageView.module.scss";

import {
  ExponatResponseShort,
  OrganisationResponseShort,
  PostResponse,
  ShortUserResponse,
} from "@biosfera/types";
import { useEffect, useState } from "react";
import { getUsers } from "@/api/serverUsers";
import { getExponats } from "@/api/serverExponats";
import { getPosts } from "@/api/serverPosts";
import { getOrganisations } from "@/api/serverOrganisations";
import CardCollectionAsync from "components/CardCollectionAsync";
import { UserWrapper } from "@/utility/wrappers/userWrapper";

export interface SearchPageViewProps {
  users: ShortUserResponse[];
  organisations: OrganisationResponseShort[];
  exponats: ExponatResponseShort[];
  posts: PostResponse[];
  initTab: tabType;
  query: any;
}

const tabs = ["Korisnici", "Organizacije", "Eksponati", "Objave"];
type tabType = "Korisnici" | "Organizacije" | "Eksponati" | "Objave";
type tabDictionaryType = "user" | "organisation" | "exponat" | "post";

export const tabDictionary = {
  Korisnici: "user",
  Organizacije: "organisation",
  Eksponati: "exponat",
  Objave: "post",
};

export const tabDictionaryReverse = {
  user: "Korisnici",
  organisation: "Organizacije",
  exponat: "Eksponati",
  post: "Objave",
};

export const SearchPageView = ({
  users,
  organisations,
  exponats,
  posts,
  initTab,
  query,
}: SearchPageViewProps) => {
  const [activeTab, setActiveTab] = useState<tabType>(initTab);
  const [page, setPage] = useState<number>(query?.page || 1);

  useEffect(() => {
    setPage(query?.page || 1);
  }, [query]);

  return (
    <div className={classes.container}>
      <Tabs activeTab={initTab} tabs={tabs} onSelect={setActiveTab} />
      <div className={classes.content}>
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
                  : getPosts
              }
              params={query}
              items={
                activeTab === "Korisnici"
                  ? users
                  : activeTab === "Organizacije"
                  ? organisations
                  : activeTab === "Eksponati"
                  ? exponats
                  : posts
              }
            />
          </UserWrapper>
        )}
      </div>
    </div>
  );
};
