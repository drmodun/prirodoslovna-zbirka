import clsx from "clsx";
import classes from "./Tabs.module.scss";

export interface TabsProps {
  tabs: string[];
  onSelect: Function;
  activeTab: String;
  color?: string; //later add support for differently colored tabs TODO
}

export const Tabs = ({ tabs, activeTab, onSelect }: TabsProps) => {
  return (
    <div className={classes.container}>
      {tabs.map((tab, index) => (
        <div
          key={tab + index}
          onClick={(tab) => onSelect(tab)}
          className={clsx(classes.tab, activeTab === tab && classes.active)}
        >
          {tab}
        </div>
      ))}
    </div>
  );
};
