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
  "user" | "organisation" | "exponat" | "post" | "work" | "literature";

export const tabDictionary = {
  Korisnici: "user",
  Organizacije: "organisation",
  Eksponati: "exponat",
  Objave: "post",
  Radovi: "work",
  Literatura: "literature",
};

type ItemsKey = keyof Omit<SearchPageViewProps, "initTab" | "query">;

// Everything that differs between tabs: the filter form shown above the
// results, the loader for further pages and the prop holding the first page.
const tabConfig: Record<
  tabType,
  {
    Filter: React.ComponentType<{ searchParams?: any }>;
    getMore: (query?: any, page?: number) => Promise<any>;
    items: ItemsKey;
  }
> = {
  Korisnici: { Filter: UserFilter, getMore: getUsers, items: "users" },
  Organizacije: {
    Filter: OrganisationFilter,
    getMore: getOrganisations,
    items: "organisations",
  },
  Eksponati: { Filter: ExponatFilter, getMore: getExponats, items: "exponats" },
  Objave: { Filter: PostFilter, getMore: getPosts, items: "posts" },
  Radovi: { Filter: WorkFilter, getMore: getWorks, items: "works" },
  Literatura: {
    Filter: LiteratureFilter,
    getMore: getGbifWorks,
    items: "literature",
  },
};

export const SearchPageView = ({
  initTab,
  query,
  ...initialItems
}: SearchPageViewProps) => {
  const [activeTab, setActiveTab] = useState<tabType>(initTab);
  const [page, setPage] = useState<number>(query?.page || 2);

  useEffect(() => {
    setPage(2);
  }, [query, activeTab]);

  const { Filter, getMore, items } = tabConfig[activeTab];

  return (
    <div className={classes.container}>
      <Tabs activeTab={activeTab} tabs={tabs} onSelect={setActiveTab} />
      <div className={classes.content}>
        <Filter searchParams={query} />
        {query && (
          <UserWrapper>
            <CardCollectionAsync
              type={tabDictionary[activeTab] as tabDictionaryType}
              page={page}
              getMore={getMore}
              params={query}
              items={initialItems[items]}
            />
          </UserWrapper>
        )}
      </div>
    </div>
  );
};
