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
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import { getPfpUrl } from "@/utility/static/getPfpUrl";
import SingleInput from "components/SingleInput";
import { useState } from "react";
import { useRouter } from "next/router";
import path from "path";

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

  const [search, setSearch] = useState("");

  const { user, logout } = useUser();

  const handeleUserRedirect = () => {
    user?.id
      ? (window.location.href = "/user/" + user?.id)
      : (window.location.href = "/login");
  };

  const handleLogout = () => {
    const confirm = window.confirm("Jeste li sigurni da se želite odjaviti?");
    confirm && logout && logout();
  };

  return (
    <div className={classes}>
      <div className={c.profileInfo}>
        <ImageWithFallback
          className={c.image}
          src={user?.id ? getPfpUrl(user?.id) : ProfileImagePlaceholder}
          fallbackSrc={ProfileImagePlaceholder}
          alt="placeholder"
        />
        <div className={c.userInfoWrapper}>
          <p className={c.name}>
            {user?.firstName} {user?.lastName}
          </p>
          <p className={c.county}>{makeCountyName(user?.location || "")}</p>
        </div>
        <div className={c.buttonsWrapper}>
          <IconButton icon={UserIcon} onClick={handeleUserRedirect} />
          <IconButton icon={LogoutIcon} onClick={handleLogout} />
        </div>
      </div>
      <SingleInput
        value={search}
        onChange={setSearch}
        image={SearchIcon}
        question="Pretraži..."
        linkedImage={{
          pathname: "/search",
          query: { name: search },
        }}
      />
    </div>
  );
};

export default SideMenu;
