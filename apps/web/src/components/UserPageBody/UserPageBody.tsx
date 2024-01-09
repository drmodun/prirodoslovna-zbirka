"use client";
import Tabs from "components/Tabs";
import classes from "./UserPageBody.module.scss";

import { useState } from "react";
import { ExtendedUserResponse } from "@biosfera/types";
import UserDescription from "@/views/UserDescription";

const tabs = ["About", "Posts", "Likes", "Organisations"];

export interface UserPageBodyProps {
  user: ExtendedUserResponse;
}

export const UserPageBody = ({ user }: UserPageBodyProps) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);

  return (
    <div className={classes.container}>
      <Tabs
        activeTab={activeTab}
        onSelect={setActiveTab}
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
