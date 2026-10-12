"use client";
import Tabs from "components/Tabs";
import classes from "./DiscoverPageView.module.scss";

import {
  ExponatResponseShort,
  OrganisationResponseShort,
  PostResponse,
  WorkResponseShort,
} from "@biosfera/types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import CardCollectionAsync from "components/CardCollectionAsync";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import useDiscover from "@/utility/context/DiscoverContext";
import { useDiscoverOrganisations } from "@/api/useDiscoverOrganisations";
import { useDiscoverExponats } from "@/api/useDiscoverExponats";
import { useDiscoverPosts } from "@/api/useDiscoverPosts";
import { getWorks } from "@/api/serverWorks";
import { getGbifWorks } from "@/api/serverLiterature";

export interface DiscoverPageViewProps {
  organisations: OrganisationResponseShort[];
  exponats: ExponatResponseShort[];
  posts: PostResponse[];
  works: WorkResponseShort[];
  gbifWorks: WorkResponseShort[];
  initTab: tabType;
  query: any;
}

const tabs = ["Organizacije", "Eksponati", "Objave", "Radovi", "Radovi (GBIF)"];
export type tabType =
  "Organizacije" | "Eksponati" | "Objave" | "Radovi" | "Radovi (GBIF)";
export type tabDictionaryType = "organisation" | "exponat" | "post" | "work";

export const tabDictionary = {
  Organizacije: "organisation",
  Eksponati: "exponat",
  Objave: "post",
  Radovi: "work",
  "Radovi (GBIF)": "work",
};

type WithId = { id: string };

const appendUnique = <T extends WithId>(previous: T[], incoming?: T[]) => [
  ...previous,
  ...(incoming?.filter((x) => !previous.some((y) => y.id == x.id)) || []),
];

// Appends each newly fetched discover page to the list. An empty page means
// the feed ran out, which is reported through onEmpty.
const useAppendPage = <T extends WithId>(
  fetched: T[] | undefined,
  setList: Dispatch<SetStateAction<T[]>>,
  onEmpty: () => void,
) => {
  useEffect(() => {
    if (fetched?.length === 0) onEmpty();
    setList((prev) => appendUnique(prev, fetched));
  }, [fetched]);
};

export const DiscoverPageView = ({
  organisations,
  exponats,
  posts,
  gbifWorks,
  works,
  initTab,
  query = { page: 1, size: 20 },
}: DiscoverPageViewProps) => {
  const [activeTab, setActiveTab] = useState<tabType>(initTab);
  const [size] = useState<number>(query.page || 20);
  const [currentOrganisations, setCurrentOrganisations] = useState<
    OrganisationResponseShort[]
  >([]);
  const [currentExponats, setCurrentExponats] = useState<
    ExponatResponseShort[]
  >([]);
  const [currentPosts, setCurrentPosts] = useState<PostResponse[]>([]);
  const [currentWorks, setCurrentWorks] = useState<WorkResponseShort[]>([]);
  const [currentGbifWorks, setCurrentGbifWorks] = useState<WorkResponseShort[]>(
    [],
  );

  const {
    exponatPage,
    organisationPage,
    postPage,
    gbifWorkPage,
    workPage,
    resetPages,
    setOrganisationPage,
    setExponatPage,
    setWorkPage,
    setGbifWorkPage,
    setPostPage,
  } = useDiscover();

  useEffect(() => {
    setCurrentGbifWorks(gbifWorks);
    setCurrentWorks(works);
    setCurrentPosts(posts);
    setCurrentExponats(exponats);
    setCurrentOrganisations(organisations);
  }, [gbifWorks, works, posts, exponats, organisations]);

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
  const isLoading = organisationLoading || exponatsLoading || postLoading;

  useEffect(() => {
    const getMoreWorks = async () => {
      if (workPage === 1) return;
      const works = await getWorks(query, workPage);
      if (!works) handleError();
      currentWorks
        ? setCurrentWorks((prev) => [...prev, ...(works || [])])
        : setCurrentWorks(works || []);
    };

    getMoreWorks();
  }, [workPage]);

  useEffect(() => {
    const getMoreGbifWorks = async () => {
      if (gbifWorkPage === 1) return;
      query.page = gbifWorkPage;
      const works = await getGbifWorks(query);
      if (!works) handleError();
      setCurrentGbifWorks((prev) => [...prev, ...(works || [])]);
    };

    getMoreGbifWorks();
  }, [gbifWorkPage]);

  useAppendPage(
    currentOrganisationsQuery,
    setCurrentOrganisations,
    handleError,
  );
  useAppendPage(currentExponatsQuery, setCurrentExponats, handleError);
  useAppendPage(currentPostsQuery, setCurrentPosts, handleError);

  // The three discover feeds share one loading state, so none of them
  // advances while another is fetching. Works page independently.
  const nextPage =
    (setPage?: Dispatch<SetStateAction<number>>, waitForFeeds = false) =>
    async () => {
      if (waitForFeeds && isLoading) return;
      setPage && setPage((prev) => prev + 1);
    };

  const tabState = {
    Organizacije: {
      page: organisationPage,
      getMore: nextPage(setOrganisationPage, true),
      items: currentOrganisations || organisations,
    },
    Eksponati: {
      page: exponatPage,
      getMore: nextPage(setExponatPage, true),
      items: currentExponats || exponats,
    },
    Objave: {
      page: postPage,
      getMore: nextPage(setPostPage, true),
      items: currentPosts || posts,
    },
    Radovi: {
      page: workPage,
      getMore: nextPage(setWorkPage),
      items: currentWorks || works,
    },
    "Radovi (GBIF)": {
      page: gbifWorkPage,
      getMore: nextPage(setGbifWorkPage),
      items: currentGbifWorks || gbifWorks,
    },
  }[activeTab];

  return (
    <div className={classes.container}>
      <Tabs activeTab={activeTab} tabs={tabs} onSelect={setActiveTab} />
      <div className={classes.content}>
        <UserWrapper>
          <CardCollectionAsync
            type={tabDictionary[activeTab] as tabDictionaryType}
            page={tabState.page}
            isDiscover
            getMore={tabState.getMore}
            params={query}
            onError={handleError}
            isLoading={isLoading}
            items={tabState.items}
          />
        </UserWrapper>
      </div>
    </div>
  );
};
