"use client";
import Tabs from "components/Tabs";
import classes from "./UserPageBody.module.scss";

import { useState } from "react";
import { ExtendedUserResponse } from "@biosfera/types";
import UserDescription from "@/views/UserDescription";
import { ExponatCard } from "components/ExponatCard";
import { PostCard } from "components/PostCard";
import MembershipCard from "components/MembershipCard";
import { memberWeight } from "components/MembershipCard/MembershipCard";
import CardCollection from "components/CardCollection";

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
          {
            <CardCollection
              items={user.favouriteExponats}
              sortBy={[
                { label: "Abecedno", value: "title" },
                { label: "Znanstveno ime", value: "alternateName" },
                { label: "Datum Objave", value: "updatedAt" },
                { label: "Broj Favorita", value: "Favourite Count" },
              ]}
              type="exponat"
            />
          }
        </div>
      )}

      {activeTab === "Posts" && (
        <div className={classes.tabContent}>
          {
            <CardCollection
              items={user.posts}
              isUser={true}
              sortBy={[
                { label: "Abecedno", value: "title" },
                { label: "Datum Objave", value: "updatedAt" },
                { label: "Likeovi", value: "likeScore" },
              ]}
              type="post"
            />
          }
        </div>
      )}

      {activeTab === "Likes" && (
        <div className={classes.tabContent}>
          {
            <CardCollection
              items={user.likedPosts}
              sortBy={[
                { label: "Abecedno", value: "title" },
                { label: "Broj Lajkova", value: "likeScore" },
                { label: "Autor", value: "authorName" },
              ]}
              type="post"
            />
          }
        </div>
      )}

      {activeTab === "Organisations" && (
        <div className={classes.tabContent}>
          {user.memberships && (
            <CardCollection
              items={user.memberships}
              sortBy={[
                { label: "Abecedno", value: "name" },
                { label: "Likeovi", value: "points" },
                { label: "Broj Followera", value: "followerCount" },
                { label: "Broj Članova", value: "memberCount" },
              ]}
              type="organisation"
            />
          )}
        </div>
      )}
    </div>
  );
};
