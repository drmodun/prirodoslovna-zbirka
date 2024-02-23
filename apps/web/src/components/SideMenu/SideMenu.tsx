"use client";
import clsx from "clsx";
import c from "./SideMenu.module.scss";
import ProfileImagePlaceholder from "../../assets/images/profile-image-placeholder.png";
import Image from "next/image";
import SettingsIcon from "../../assets/icons/settings.svg";
import IconButton from "./IconButton";

type SideMenuProps = {
  isOpen: boolean;
};

const SideMenu = ({ isOpen }: SideMenuProps) => {
  const classes = clsx(c.sideMenu, {
    [c.closed]: !isOpen,
  });
  return (
    <div className={classes}>
      <div className={c.profileInfo}>
        <Image
          className={c.image}
          src={ProfileImagePlaceholder}
          alt="placeholder"
        />
        <div className={c.userInfoWrapper}>
          <p>Ivana Ivanović</p>
          <a href="">III. gimnazija, Split</a>
        </div>
        <div className={c.buttons}>
          <IconButton icon={SettingsIcon} />
          <IconButton icon={SettingsIcon} />
          <IconButton icon={SettingsIcon} />
        </div>
      </div>
      <input type="text" />
    </div>
  );
};

export default SideMenu;
