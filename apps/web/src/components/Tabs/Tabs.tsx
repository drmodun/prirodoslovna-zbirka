"use client";
import clsx from "clsx";
import classes from "./Tabs.module.scss";

export interface TabsProps {
  tabs: string[];
  onSelect: Function;
  activeTab: String;
  color?: string; 
}

export const Tabs = ({ tabs, activeTab, onSelect }: TabsProps) => {

  return (
    <div className={classes.container}>
      {tabs.map((tab, index) => (
        <button
          key={tab + index}
          onClick={() => onSelect(tab)}
          className={clsx(classes.tab, activeTab === tab && classes.active)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
