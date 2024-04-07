"use client";

import useUser from "@/utility/context/UserContext";
import BaseButton from "components/BaseButton";
import classes from "./LandingPageButton.module.scss";
import Link from "next/link";

export const LandingPageButton = () => {
  const { user } = useUser();

  return !user ? (
    <Link href="/login">
      <BaseButton className={classes.button} text="Prijavi se" />
    </Link>
  ) : (
    <Link href="/discover">
      <BaseButton className={classes.button} text="Pregledaj sadržaj" />
    </Link>
  );
};
