"use client";
import Tabs from "components/Tabs";
import classes from "./UserPageBody.module.scss";

import { useState } from "react";

const tabs = ["About", "Posts", "Likes", "Organisations"];

export const UserPageBody = () => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);

  return (
    <div className={classes.container}>
      <Tabs
        activeTab={activeTab}
        onSelect={setActiveTab}
        tabs={tabs}
        key={"tabRow"}
      />
    </div>
  );
};
