"use client";
import Tabs from "components/Tabs";
import classes from "./DiscoverPageView.module.scss";

import {
  ExponatResponseShort,
  OrganisationResponseShort,
  PostResponse,
  ShortUserResponse,
} from "@biosfera/types";
import { useEffect, useState } from "react";
import { getUsers } from "@/api/serverUsers";
import { discoverExponats, getExponats } from "@/api/serverExponats";
import { discoverPosts, getPosts } from "@/api/serverPosts";
import {
  discoverOrganisations,
  getOrganisations,
} from "@/api/serverOrganisations";
import CardCollectionAsync from "components/CardCollectionAsync";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import { Indexable } from "@biosfera/types/src/jsonObjects";
import { ExponatFilter } from "components/FIlterForm/ExponatFIlterForm";
import { PostFilter } from "components/FIlterForm/PostFilterForm";
import { OrganisationFilter } from "components/FIlterForm/OrganisationFilter";
import { UserFilter } from "components/FIlterForm/UserFilterForm";

export interface SearchPageViewProps {
  organisations: OrganisationResponseShort[];
  exponats: ExponatResponseShort[];
  posts: PostResponse[];
  initTab: tabType;
  query: any;
}

const tabs = ["Organizacije", "Eksponati", "Objave"];
export type tabType = "Organizacije" | "Eksponati" | "Objave";
export type tabDictionaryType = "organisation" | "exponat" | "post";

export const tabDictionary = {
  Organizacije: "organisation",
  Eksponati: "exponat",
  Objave: "post",
};

export const DiscoverPageView = ({
  organisations,
  exponats,
  posts,
  initTab,
  query = { page: 1, size: 20 },
}: SearchPageViewProps) => {
  const [activeTab, setActiveTab] = useState<tabType>(initTab);
  const [page, setPage] = useState<number>(query?.page || 2);

  useEffect(() => {
    setPage(2);
    console.log("page reset");
  }, [query, activeTab]);

  return (
    <div className={classes.container}>
      <Tabs activeTab={activeTab} tabs={tabs} onSelect={setActiveTab} />
      <div className={classes.content}>
        <UserWrapper>
          <CardCollectionAsync
            type={tabDictionary[activeTab] as tabDictionaryType}
            page={page}
            isDiscover
            replaceFirst
            getMore={
              activeTab === "Organizacije"
                ? discoverOrganisations
                : activeTab === "Eksponati"
                ? discoverExponats
                : discoverPosts
            }
            params={query}
            items={
              activeTab === "Organizacije"
                ? organisations
                : activeTab === "Eksponati"
                ? exponats
                : posts
            }
          />
        </UserWrapper>
      </div>
    </div>
  );
};
