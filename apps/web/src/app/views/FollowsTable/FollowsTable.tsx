"use client";

import { use, useEffect, useState } from "react";
import classes from "./FollowsTable.module.scss";
import UserCard from "components/UserCard";
import clsx from "clsx";
import { ShortUserResponse } from "@biosfera/types";
import CardCollection from "components/CardCollection";
import Tabs from "components/Tabs";

interface FollowsTableProps {
  followers: ShortUserResponse[];
  following: ShortUserResponse[];
  firstTab?: string;
}

export const FollowsTable = ({
  followers,
  following,
  firstTab = "Followers",
}: FollowsTableProps) => {
  const [tab, setTab] = useState<string>(firstTab);
  const [listToRender, setListToRender] = useState(
    firstTab === "Following" ? following : followers,
  );
  useEffect(() => {
    setListToRender(tab.toLowerCase() === "followers" ? followers : following);
  }, [tab]);

  useEffect(() => {
    setTab(firstTab);
  }, [firstTab]);

  return (
    <div className={classes.container}>
      <Tabs
        activeTab={tab.toString()}
        onSelect={setTab}
        tabs={["Followers", "Following"]}
      />
      <div className={classes.table}>
        <CardCollection
          items={listToRender}
          type="user"
          sortBy={[
            { label: "Abecedno", value: "firstName" },
            { label: "Korisničko Ime", value: "username" },
            { label: "Županija", value: "location" },
            { label: "Broj Postova", value: "postCount" },
            { label: "Broj Favorita", value: "likeCount" },
          ]}
          pageSize={20}
        />
      </div>
    </div>
  );
};
