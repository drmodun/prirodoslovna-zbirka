"use client";
import Image from "next/image";
import classes from "./Header.module.scss";
import logo from "assets/images/FullLogo.svg";
import useSideMenu from "@/utility/context/SideMenuContext";
import Hamburger from "components/Hamburger";
import Link from "next/link";
import { NotificationBell } from "components/NotificationBell/NotificationBell";
export const Header = () => {
  const { active, toggleActive } = useSideMenu();

  return (
    <div className={classes.container}>
      <div className={classes.main}>
        <div className={classes.logo}>
          <Link href="/">
            <Image src={logo} alt="logo" layout="fill" />
          </Link>
        </div>
      </div>
      <div className={classes.menu}>
        <NotificationBell></NotificationBell>
        <Hamburger open={active} onToggle={toggleActive} />
      </div>
    </div>
  );
};
