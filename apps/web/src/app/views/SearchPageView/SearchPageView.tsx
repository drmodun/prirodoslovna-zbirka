import Tabs from "components/Tabs";
import classes from "./SearchPageView.module.scss";

import {
  ExponatResponseShort,
  OrganisationResponseShort,
  PostResponse,
  ShortUserResponse,
} from "@biosfera/types";
import { useState } from "react";

export interface SearchPageViewProps {
  users: ShortUserResponse[];
  organisations: OrganisationResponseShort[];
  exponats: ExponatResponseShort[];
  posts: PostResponse[];
  initTab: "users" | "organisations" | "exponats" | "posts";
  query: any;
}

const tabs = ["users", "organisations", "exponats", "posts"];

export const SearchPageView = ({
  users,
  organisations,
  exponats,
  posts,
  initTab,
  query,
}: SearchPageViewProps) => {
  const [activeTab, setActiveTab] = useState(initTab);
  return (
    <div className={classes.container}>
      <Tabs activeTab={initTab} tabs={tabs} onSelect={setActiveTab} />
      <div className={classes.content}>
        
      </div>
    </div>
  );
};
