"use client";
import clsx from "clsx";
import c from "./SideMenu.module.scss";
import ProfileImagePlaceholder from "../../assets/images/profile-image-placeholder.png";
import Image from "next/image";
import SettingsIcon from "../../assets/icons/settings.svg";
import UserIcon from "../../assets/icons/user.svg";
import LogoutIcon from "../../assets/icons/logout.svg";
import SearchIcon from "../../assets/icons/search.svg";
import IconButton from "./IconButton";

type UserData = {
  image: string;
  profileUrl: string;
  fullName: string;
  organisation: string;
  organisationUrl: string;
};

const defaultUser: UserData = {
  image: "",
  profileUrl: "",
  fullName: "Ime Prezime",
  organisation: "Ime Organizacije",
  organisationUrl: "",
};

type SideMenuProps = {
  isOpen: boolean;
  user: UserData;
};

const SideMenu = ({ isOpen, user = defaultUser }: SideMenuProps) => {
  const classes = clsx(c.sideMenu, {
    [c.closed]: !isOpen,
  });

  return (
    <div className={classes}>
      <div className={c.profileInfo}>
        <Image
          className={c.image}
          src={user.image || ProfileImagePlaceholder}
          alt="placeholder"
        />
        <div className={c.userInfoWrapper}>
          <p className={c.name}>{user.fullName}</p>
          <a className={c.organisation} href={user.organisationUrl}>
            {user.organisation}
          </a>
        </div>
        <div className={c.buttonsWrapper}>
          <IconButton
            icon={UserIcon}
            onClick={() => console.log(user.profileUrl)}
          />
          <IconButton icon={LogoutIcon} onClick={() => console.log("logout")} />
        </div>
      </div>
      <div className={c.searchBar}>
        <Image src={SearchIcon} alt="search icon" />
        <input type="text" placeholder="Pretraži Biosferu" />
      </div>
    </div>
  );
};

export default SideMenu;
