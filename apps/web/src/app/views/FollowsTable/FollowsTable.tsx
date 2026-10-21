"use client";

import { use, useEffect, useState } from "react";
import classes from "./FollowsTable.module.scss";
import UserCard from "components/UserCard";
import clsx from "clsx";
import { ShortUserResponse } from "@biosfera/types";
import CardCollection from "components/CardCollection";
import Tabs from "components/Tabs";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Sort");
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
            { label: t("alphabetical"), value: "firstName" },
            { label: t("username"), value: "username" },
            { label: t("county"), value: "location" },
            { label: t("posts"), value: "postCount" },
            { label: t("favourites"), value: "likeCount" },
          ]}
          pageSize={20}
        />
      </div>
    </div>
  );
};
