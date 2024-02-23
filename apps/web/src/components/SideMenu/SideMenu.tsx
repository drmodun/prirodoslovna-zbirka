"use client";
import clsx from "clsx";
import c from "./SideMenu.module.scss";

type SideMenuProps = {
  isOpen: boolean;
};

const SideMenu = ({ isOpen }: SideMenuProps) => {
  const classes = clsx(c.sideMenu, {
    [c.closed]: !isOpen,
  });
  return <div className={classes}>side menu</div>;
};

export default SideMenu;
