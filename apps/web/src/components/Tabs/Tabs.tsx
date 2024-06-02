"use client";
import clsx from "clsx";
import classes from "./Tabs.module.scss";

export enum Variant {
  NORMAL = "normal",
  SUB = "sub",
}
export interface TabsProps {
  tabs: string[];
  onSelect: Function;
  activeTab: String;
  color?: string;
  variant?: Variant;
}

export const Tabs = ({ tabs, activeTab, variant, onSelect }: TabsProps) => {
  return (
    <div className={classes.container}>
      {tabs.map((tab, index) => (
        <button
          key={tab + index}
          onClick={() => onSelect(tab)}
          className={clsx(
            classes.tab,
            classes[variant as string],
            activeTab === tab && classes.active,
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
