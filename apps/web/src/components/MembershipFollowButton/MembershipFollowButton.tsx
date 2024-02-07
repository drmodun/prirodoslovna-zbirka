"use client";
import classes from "./MembershipFollowButton.module.scss";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { OrganisationResponseShort, ShortUserResponse } from "@biosfera/types";
import { useToggleFollowOrganisation } from "@/api/useToggleFollowOrganisation";
import useUser from "@/utility/context/UserContext";
import { useToggleFollow } from "@/api/useToggleFollowUser";

export interface FollowButtonProps {
  object: ShortUserResponse | OrganisationResponseShort;
  type: "user" | "organisation";
}

export const MembershipFollowButton = ({ object, type }: FollowButtonProps) => {
  const {
    followedOrganisations,
    updateFollowedOrganisation,
    loading,
    following,
    updateFollowing,
  } = useUser();
  const { mutateAsync: followOrg } = useToggleFollowOrganisation();
  const { mutateAsync: followUser } = useToggleFollow();

  const [isFollow, setIsFollow] = useState(
    type === "user"
      ? following.find((x) => x.id === object.id) != null
      : followedOrganisations.find((x) => x.id === object.id) != null
  );

  useEffect(() => {
    setIsFollow(
      type === "user"
        ? following?.find((x) => x.id === object.id) != null
        : followedOrganisations?.find((x) => x.id === object.id) != null
    );
  }, [followedOrganisations, loading, following]);

  const toggleFollow = async () => {
    if (type === "user") {
      await followUser(object.id);
      updateFollowing(object as ShortUserResponse);
    } else {
      await followOrg(object.id);
      updateFollowedOrganisation(object as OrganisationResponseShort);
    }
    setIsFollow((prev) => !prev);
  };

  return (
    <button
      className={clsx(classes.button, isFollow && classes.following)}
      title="follow"
      onClick={toggleFollow}
    >
      {!isFollow ? "Prati" : "Prestani pratiti"}
    </button>
  );
};
