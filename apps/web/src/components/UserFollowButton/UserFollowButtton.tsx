"use client";
import classes from "./UserFollowButton.module.scss";
import useUser from "@/utility/context/UserContext";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { ShortUserResponse } from "@biosfera/types";
import { useToggleFollow } from "@/api/useToggleFollowUser";
import { useTranslations } from "next-intl";

export interface FollowButtonProps {
  user: ShortUserResponse;
}

export const FollowButton = ({ user }: FollowButtonProps) => {
  const t = useTranslations("FollowButton");
  const { following, updateFollowing, loading } = useUser();
  const { mutateAsync } = useToggleFollow();

  const [isFollow, setIsFollow] = useState(
    following.find((x) => x.id === user.id) != null,
  );

  useEffect(() => {
    setIsFollow(following?.find((x) => x.id === user.id) != null);
  }, [following, loading, user.id]);

  const toggleFollow = async () => {
    await mutateAsync(user.id);
    updateFollowing(user);
    setIsFollow((prev) => !prev);
  };

  return (
    following && (
      <button
        className={clsx(classes.button, isFollow && classes.following)}
        title={t("followUser")}
        onClick={toggleFollow}
      >
        {!isFollow ? t("followUser") : t("unfollow")}
      </button>
    )
  );
};
