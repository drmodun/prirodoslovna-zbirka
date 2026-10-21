"use client";

import useUser from "@/utility/context/UserContext";
import BaseButton from "components/BaseButton";
import classes from "./LandingPageButton.module.scss";
import Link from "next/link";
import { useTranslations } from "next-intl";

export const LandingPageButton = () => {
  const t = useTranslations("Landing");
  const { user } = useUser();

  return !user ? (
    <Link className={classes.buttons} href="/login">
      <BaseButton text={t("login")} />
    </Link>
  ) : (
    <Link href="/discover" className={classes.buttons}>
      <BaseButton text={t("browseContent")} />
    </Link>
  );
};
