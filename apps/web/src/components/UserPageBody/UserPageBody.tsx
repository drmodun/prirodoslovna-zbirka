"use client";
import Tabs from "components/Tabs";
import classes from "./UserPageBody.module.scss";

import { useState } from "react";
import { ExtendedUserResponse } from "@biosfera/types";
import UserDescription from "@/views/UserDescription";
import { ExponatCard } from "components/ExponatCard";

const tabs = ["About", "Posts", "Likes", "Favourites", "Organisations"];

export interface UserPageBodyProps {
  user: ExtendedUserResponse;
}

export const UserPageBody = ({ user }: UserPageBodyProps) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);

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
      {activeTab === "About" && (
        <div className={classes.tabContent}>
          {
            <UserDescription
              bio={user.bio || "Nema opisa korisnika"}
              county={user.location}
              lastUpdated={user.updatedAt}
            />
          }
        </div>
      )}

      {activeTab === "Favourites" && (
        <div className={classes.tabContent}>
          {user.favouriteExponats.length > 0 ? (
            user.favouriteExponats.map((exponat) => (
              <ExponatCard exponat={exponat} key={exponat.id} />
            ))
          ) : (
            <span className={classes.error}>
              Korisnik nema omiljenih eksponata
            </span>
          )}
        </div>
      )}
    </div>
  );
};
