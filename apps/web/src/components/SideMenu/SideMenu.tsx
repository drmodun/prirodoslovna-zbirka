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
import useSideMenu from "@/utility/context/SideMenuContext";

type UserData = {
  image: string;
  profileUrl: string;
  fullName: string;
  organisation: string;
  organisationUrl: string;
};

const SideMenu = () => {
  const [search, setSearch] = useState("");
  const { active, toggleActive } = useSideMenu();

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
    <>
      <div className={clsx(c.sideMenu, active && c.active)}>
        <div className={c.profileInfo}>
          <div className={c.image}>
            <ImageWithFallback
              src={user?.id ? getPfpUrl(user?.id) : ProfileImagePlaceholder}
              fallbackSrc={ProfileImagePlaceholder}
              alt="placeholder"
              layout="fill"
            />
          </div>
          <div className={c.userInfoWrapper}>
            <p className={c.name}>
              {user?.firstName || "Niste"} {user?.lastName || "prijavljeni"}
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
    </>
  );
};

export default SideMenu;
