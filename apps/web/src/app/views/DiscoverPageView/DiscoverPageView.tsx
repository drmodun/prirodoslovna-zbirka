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

export interface DiscoverPageViewProps {
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
}: DiscoverPageViewProps) => {
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
    resetPages,
    setOrganisationPage,
    setExponatPage,
    setPostPage,
  } = useDiscover();

  const handleError = () => {
    resetPages && resetPages();
    if (exponatPage === 1 || organisationPage === 1 || postPage === 1) return;
    window.location.reload();
  };

  const { data: currentOrganisationsQuery, isFetching: organisationLoading } =
    useDiscoverOrganisations(organisationPage, size);
  const { data: currentExponatsQuery, isFetching: exponatsLoading } =
    useDiscoverExponats(exponatPage, size);
  const { data: currentPostsQuery, isFetching: postLoading } = useDiscoverPosts(
    postPage,
    size,
  );

  useEffect(() => {
    if (currentOrganisationsQuery?.length === 0) handleError();
    setCurrentOrganisations((prev) => [
      ...prev,
      ...(currentOrganisationsQuery?.filter(
        (x) => !prev.some((y) => y.id == x.id),
      ) || []),
    ]);
  }, [currentOrganisationsQuery]);

  useEffect(() => {
    if (currentExponatsQuery?.length === 0) handleError();
    setCurrentExponats((prev) => [
      ...prev,
      ...(currentExponatsQuery?.filter(
        (x) => !prev.some((y) => y.id == x.id),
      ) || []),
    ]);
  }, [currentExponatsQuery]);

  useEffect(() => {
    if (currentPostsQuery?.length === 0) handleError();
    setCurrentPosts((prev) => [
      ...prev,
      ...(currentPostsQuery?.filter((x) => !prev.some((y) => y.id == x.id)) ||
        []),
    ]);
  }, [currentPostsQuery]);

  const handleOrganisationSearch = async () => {
    if (organisationLoading || exponatsLoading || postLoading) return;
    setOrganisationPage && setOrganisationPage((prev) => prev + 1);
  };

  const handleExponatSearch = async () => {
    if (organisationLoading || exponatsLoading || postLoading) return;
    setExponatPage && setExponatPage((prev) => prev + 1);
  };

  const handlePostSearch = async () => {
    if (organisationLoading || exponatsLoading || postLoading) return;
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
            onError={handleError}
            isLoading={organisationLoading || exponatsLoading || postLoading}
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
