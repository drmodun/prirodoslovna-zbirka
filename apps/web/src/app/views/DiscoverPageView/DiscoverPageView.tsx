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
  const [page, setPage] = useState<number>(query.page || 1);
  const [size, setSize] = useState<number>(query.page || 20);

  const { data: currentOrganisations } = useDiscoverOrganisations(page, size);
  const { data: currentExponats } = useDiscoverExponats(page, size);
  const { data: currentPosts } = useDiscoverPosts(page, size);

  const {
    exponatPage,
    organisationPage,
    postPage,
    setOrganisationPage,
    setExponatPage,
    setPostPage,
  } = useDiscover();

  useEffect(() => {
    if (activeTab === "Organizacije") {
      setPage(organisationPage);
    } else if (activeTab === "Eksponati") {
      setPage(exponatPage);
    } else {
      setPage(postPage);
    }
  }, [query, activeTab, organisationPage, exponatPage, postPage]);

  const handleOrganisationSearch = async (params: {
    page: number;
    size: number;
  }) => {
    setPage((prev) => prev + 1);
    setOrganisationPage && setOrganisationPage((prev) => prev + 1);
  };

  const handleExponatSearch = async (params: {
    page: number;
    size: number;
  }) => {
    setPage((prev) => prev + 1);
    setExponatPage && setExponatPage((prev) => prev + 1);
  };

  const handlePostSearch = async (params: { page: number; size: number }) => {
    setPage((prev) => prev + 1);
    setPostPage && setPostPage((prev) => prev + 1);
  };

  return (
    <div className={classes.container}>
      <Tabs activeTab={activeTab} tabs={tabs} onSelect={setActiveTab} />
      <div className={classes.content}>
        <UserWrapper>
          <CardCollectionAsync
            type={tabDictionary[activeTab] as tabDictionaryType}
            page={query.page}
            isDiscover
            getMore={
              activeTab === "Organizacije"
                ? handleOrganisationSearch
                : activeTab === "Eksponati"
                ? handleExponatSearch
                : handlePostSearch
            }
            params={query}
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
