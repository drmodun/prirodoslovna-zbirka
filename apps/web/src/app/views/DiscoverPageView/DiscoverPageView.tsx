"use client";
import Tabs from "components/Tabs";
import classes from "./DiscoverPageView.module.scss";

import {
  ExponatResponseShort,
  OrganisationResponseShort,
  PostResponse,
} from "@biosfera/types";
import { useEffect, useState } from "react";
import CardCollectionAsync from "components/CardCollectionAsync";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import useDiscover from "@/utility/context/DiscoverContext";
import { useDiscoverOrganisations } from "@/api/useDiscoverOrganisations";
import { useDiscoverExponats } from "@/api/useDiscoverExponats";
import { useDiscoverPosts } from "@/api/useDiscoverPosts";
import { set } from "react-hook-form";

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
  const [size, setSize] = useState<number>(query.page || 20);
  const [currentOrganisations, setCurrentOrganisations] = useState<
    OrganisationResponseShort[]
  >([]);
  const [currentExponats, setCurrentExponats] = useState<
    ExponatResponseShort[]
  >([]);
  const [currentPosts, setCurrentPosts] = useState<PostResponse[]>([]);

  const {
    exponatPage,
    organisationPage,
    postPage,
    setOrganisationPage,
    setExponatPage,
    setPostPage,
  } = useDiscover();

  const { data: currentOrganisationsQuery, isFetching: organisationLoading } =
    useDiscoverOrganisations(organisationPage, size);
  const { data: currentExponatsQuery, isFetching: exponatsLoding } =
    useDiscoverExponats(exponatPage, size);
  const { data: currentPostsQuery, isFetching: postLoading } = useDiscoverPosts(
    postPage,
    size
  );

  useEffect(() => {
    setCurrentOrganisations((prev) => [
      ...prev,
      ...(currentOrganisationsQuery?.filter(
        (x) => !prev.some((y) => y.id == x.id)
      ) || []),
    ]);
  }, [currentOrganisationsQuery]);

  useEffect(() => {
    setCurrentExponats((prev) => [
      ...prev,
      ...(currentExponatsQuery?.filter(
        (x) => !prev.some((y) => y.id == x.id)
      ) || []),
    ]);
  }, [currentExponatsQuery]);

  useEffect(() => {
    setCurrentPosts((prev) => [
      ...prev,
      ...(currentPostsQuery?.filter((x) => !prev.some((y) => y.id == x.id)) ||
        []),
    ]);
  }, [currentPostsQuery]);

  const handleOrganisationSearch = async (params: {
    page: number;
    size: number;
  }) => {
    if (organisationLoading || exponatsLoding || postLoading) return;
    setOrganisationPage && setOrganisationPage((prev) => prev + 1);
  };

  const handleExponatSearch = async (params: {
    page: number;
    size: number;
  }) => {
    if (organisationLoading || exponatsLoding || postLoading) return;
    setExponatPage && setExponatPage((prev) => prev + 1);
  };

  const handlePostSearch = async (params: { page: number; size: number }) => {
    if (organisationLoading || exponatsLoding || postLoading) return;
    setPostPage && setPostPage((prev) => prev + 1);
  };

  return (
    <div className={classes.container}>
      <Tabs activeTab={activeTab} tabs={tabs} onSelect={setActiveTab} />
      <div className={classes.content}>
        <UserWrapper>
          <CardCollectionAsync
            type={tabDictionary[activeTab] as tabDictionaryType}
            page={
              activeTab === "Organizacije"
                ? organisationPage
                : activeTab === "Eksponati"
                ? exponatPage
                : postPage
            }
            isDiscover
            getMore={
              activeTab === "Organizacije"
                ? handleOrganisationSearch
                : activeTab === "Eksponati"
                ? handleExponatSearch
                : handlePostSearch
            }
            params={query}
            isLoading={organisationLoading || exponatsLoding || postLoading}
            items={
              activeTab === "Organizacije"
                ? currentOrganisations || organisations
                : activeTab === "Eksponati"
                ? currentExponats || exponats
                : currentPosts || posts
            }
          />
        </UserWrapper>
      </div>
    </div>
  );
};
