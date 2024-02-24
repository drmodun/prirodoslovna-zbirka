"use client";
import Image from "next/image";
import classes from "./Header.module.scss";
import logo from "assets/images/logoWithBackground.svg";
import useSideMenu from "@/utility/context/SideMenuContext";
import Hamburger from "components/Hamburger";
import { SideMenuWrapper } from "@/utility/wrappers/sideMenuWrapper";
export const Header = () => {
  const { active, toggleActive } = useSideMenu();

  return (
    <div className={classes.container}>
      <div className={classes.main}>
        <div className={classes.logo}>
          <Image src={logo} alt="logo" layout="fill" />
        </div>
        <span className={classes.title}>Biosfera</span>
      </div>
      <div className={classes.menu}>
        <Hamburger open={active} onToggle={toggleActive} />
      </div>
    </div>
  );
};
