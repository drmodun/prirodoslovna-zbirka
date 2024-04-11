"use client";

import useUser from "@/utility/context/UserContext";
import BaseButton from "components/BaseButton";
import classes from "./LandingPageButton.module.scss";
import Link from "next/link";

export const LandingPageButton = () => {
  const { user } = useUser();

  return !user ? (
    <Link className={classes.buttons} href="/login">
      <BaseButton text="Prijavi se" />
    </Link>
  ) : (
    <Link href="/discover" className={classes.buttons}>
      <BaseButton text="Pregledaj sadržaj" />
    </Link>
  );
};
