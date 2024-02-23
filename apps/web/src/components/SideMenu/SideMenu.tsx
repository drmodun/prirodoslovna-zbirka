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
import useUser from "@/utility/context/UserContext";
import { makeCountyName } from "@/utility/static/countyNameMaker";

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
  userData?: UserData;
};

const SideMenu = ({ isOpen, userData = defaultUser }: SideMenuProps) => {
  const classes = clsx(c.sideMenu, {
    [c.closed]: !isOpen,
  });

  const { user } = useUser();

  return (
    <div className={classes}>
      <div className={c.profileInfo}>
        <Image
          className={c.image}
          src={ProfileImagePlaceholder}
          alt="placeholder"
        />
        <div className={c.userInfoWrapper}>
          <p className={c.name}>
            {user?.firstName} {user?.lastName}
          </p>
          <p className={c.county}>{makeCountyName(user?.location || "")}</p>
        </div>
        <div className={c.buttonsWrapper}>
          <IconButton
            icon={UserIcon}
            onClick={() => (window.location.href = "/user/" + user?.id)}
          />
          <IconButton icon={LogoutIcon} onClick={() => alert("logout")} />
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
