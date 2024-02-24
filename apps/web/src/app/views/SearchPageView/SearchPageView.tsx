"use client";
import Tabs from "components/Tabs";
import classes from "./SearchPageView.module.scss";

import {
  ExponatResponseShort,
  OrganisationResponseShort,
  PostResponse,
  ShortUserResponse,
} from "@biosfera/types";
import { useState } from "react";
import { getUsers, useGetUsers } from "@/api/serverUsers";
import { useGetExponats } from "@/api/serverExponats";
import { useGetPosts } from "@/api/serverPosts";
import { useGetOrganisations } from "@/api/serverOrganisations";
import CardCollectionAsync from "components/CardCollectionAsync";

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

  const handleGetMore = () => {
    if (userLoading || organisationLoading || exponatsLoading || postsLoading)
      return;
    setPage((prev) => prev + 1);
  };

  //TODO: remove theese conversions and use "as" casting and  potentially make it so only one entity is callrf instead of all of them
  const { data: foundUsers, isLoading: userLoading } = useGetUsers(
    {
      name: query?.name,
      location: query?.location,
      username: query?.username,
    },
    page
  );

  const { data: foundOrganisations, isLoading: organisationLoading } =
    useGetOrganisations(
      {
        name: query?.name,
        location: query?.location,
      },
      page
    );

  const { data: foundExponats, isLoading: exponatsLoading } = useGetExponats(
    {
      name: query?.name,
      alternateName: query?.alternateName,
      attribute: query?.attribute,
      createdAt: query?.createdAt,
      direction: query?.direction,
      maxFavoriteCount: query?.maxFavoriteCount,
      minFavoriteCount: query?.minFavoriteCount,
      organisationId: query?.organisationId,
    },
    page
  );
  const { data: foundPosts, isLoading: postsLoading } = useGetPosts(
    {
      attribute: query?.attribute,
      direction: query?.direction,
      exponatId: query?.exponatId,
      exponatName: query?.exponatName,
      title: query?.title,
      userName: query?.userName,
    },
    page
  );

  return (
    <div className={classes.container}>
      <Tabs activeTab={initTab} tabs={tabs} onSelect={setActiveTab} />
      <div className={classes.content}>
        <CardCollectionAsync
          isLoading={
            userLoading ||
            organisationLoading ||
            exponatsLoading ||
            postsLoading
          }
          type={tabDictionary[activeTab] as tabDictionaryType}
          page={page}
          getMore={handleGetMore}
          params={query}
          items={
            activeTab === "Korisnici"
              ? page > (query?.page || 1)
                ? foundUsers
                : users
              : activeTab === "Organizacije"
              ? page > (query?.page || 1)
                ? foundOrganisations
                : organisations
              : activeTab === "Eksponati"
              ? page > (query?.page || 1)
                ? foundExponats
                : exponats
              : page > (query?.page || 1)
              ? foundPosts
              : posts
          }
        />
      </div>
    </div>
  );
};
