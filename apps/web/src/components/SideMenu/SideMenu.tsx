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
import { useCountyName } from "@/utility/hooks/useCountyName";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import { getPfpUrl } from "@/utility/static/getPfpUrl";
import SingleInput from "components/SingleInput";
import { useEffect, useState } from "react";
import useSideMenu from "@/utility/context/SideMenuContext";
import Link from "next/link";
import DiscoveryIcon from "assets/icons/discovery.svg";
import { useTranslations } from "next-intl";
import LanguageToggle from "components/LanguageToggle";

type UserData = {
  image: string;
  profileUrl: string;
  fullName: string;
  organisation: string;
  organisationUrl: string;
};

const SideMenu = () => {
  const t = useTranslations("SideMenu");
  const countyName = useCountyName();
  const [search, setSearch] = useState("");
  const { active, toggleActive } = useSideMenu();

  const { user, logout } = useUser();

  const handleLogout = () => {
    const confirm = window.confirm(t("logoutConfirm"));
    confirm && logout && logout();
  };

  return (
    <>
      <div
        className={clsx(c.backdrop, active && c.active)}
        onClick={toggleActive}
      ></div>
      <div className={clsx(c.sideMenu, active && c.active)}>
        <div className={c.profileInfo}>
          <div className={c.content}>
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
                {user ? `${user.firstName} ${user.lastName}` : t("notLoggedIn")}
              </p>
              <p className={c.county}>{countyName(user?.location)}</p>
            </div>
          </div>
          <div className={c.buttonsWrapper} onClick={toggleActive}>
            <Link href={user?.id ? `/user/${user.id}` : "/login"}>
              <IconButton
                className={c.link}
                icon={UserIcon}
                aria-label={t("profile")}
              />
            </Link>
            <Link href="/discover">
              <IconButton
                className={c.link}
                icon={DiscoveryIcon}
                aria-label={t("discover")}
              />
            </Link>
            <IconButton
              className={c.link}
              icon={LogoutIcon}
              aria-label={t("logout")}
              onClick={handleLogout}
            />
          </div>
        </div>
        <SingleInput
          value={search}
          onChange={setSearch}
          image={SearchIcon}
          question={t("search")}
          linkedImage={{
            pathname: "/search",
            query: { name: search },
          }}
          onImageClick={toggleActive}
        />
        <div className={c.language}>
          <span>{t("language")}</span>
          <LanguageToggle />
        </div>
      </div>
    </>
  );
};

export default SideMenu;
