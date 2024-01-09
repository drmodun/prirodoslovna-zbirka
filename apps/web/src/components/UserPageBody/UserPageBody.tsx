"use client";
import Tabs from "components/Tabs";
import classes from "./UserPageBody.module.scss";

import { useEffect, useState } from "react";
import { ExtendedUserResponse } from "@biosfera/types";
import UserDescription from "@/views/UserDescription";

const tabs = ["About", "Posts", "Likes", "Organisations"];

export interface UserPageBodyProps {
  user: ExtendedUserResponse;
}

export const UserPageBody = ({ user }: UserPageBodyProps) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);

  useEffect(() => {
    console.log("active tab is now", activeTab);
  }, [activeTab]);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className={classes.container}>
      <Tabs
        activeTab={activeTab}
        onSelect={handleSelectTab}
        tabs={tabs}
        key={"tabRow"}
      />
      {activeTab === tabs[0] && (
        <div className={classes.tabContent}>
          {
            <UserDescription
              bio="after database update"
              county={user.location}
              lastUpdated="test"
            />
          }
        </div>
      )}
    </div>
  );
};
