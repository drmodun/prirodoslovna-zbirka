"use client";

import {
  ExtendedOrganisationResponse,
  OrganisationResponseShort,
} from "@biosfera/types";
import classes from "./OrganisationHomepage.module.scss";
import SocialPostCard from "components/SocialPostCard";
import clsx from "clsx";
import OrganisationCard from "components/OrganisationCard";
import OrganisationAbout from "../OrganisationAbout";
import useUser from "@/utility/context/UserContext";
import { useFollowOrganisation } from "@/api/useFollowOrganisation";
import { useLeaveMembership } from "@/api/useLeaveOrganisation";
import { useRequestMembership } from "@/api/useRequestMembership";

export interface OrganisationHomepageProps {
  organisation: ExtendedOrganisationResponse;
}

export const OrganisationHomepage = ({
  organisation,
}: OrganisationHomepageProps) => {
  const {
    memberships,
    user,
    followedOrganisations,
    updateFollowedOrganisation,
    updateMemberships,
  } = useUser();
  const { mutateAsync: followOrganisation } = useFollowOrganisation();
  const { mutateAsync: leaveOrganisation } = useLeaveMembership();
  const { mutateAsync: requestMembership } = useRequestMembership();

  const handleToggleFollow = async () => {
    await followOrganisation(organisation.id);
    const organisationToUpdate = {
      ...organisation,
      followerCount: organisation.followersAmount + 1,
      exponatCount: organisation.exponats.length,
      memberCount: organisation.membersAmount,
    };
    updateFollowedOrganisation(
      organisationToUpdate as OrganisationResponseShort
    );
  };

  const handleMembership = async () => {
    const isMember = memberships.some((x) => x.id === organisation.id);
    if (isMember) {
      const confirm = window.confirm(
        "Jeste li sigurni da želite napustiti organizaciju?"
      );
      if (!confirm) return;
      await leaveOrganisation(organisation.id);
      const memershipToRemove = memberships.find(
        (x) => x.id === organisation.id
      );
      updateMemberships(memershipToRemove!);
      return;
    }

    const confirm = window.confirm(
      "Jeste li sigurni da želite poslati zahtjev za članstvo?"
    );
    if (!confirm) return;
    await requestMembership(organisation.id);
    const organisationToUpdate = {
      ...organisation,
      followerCount: organisation.followersAmount + 1,
      exponatCount: organisation.exponats.length,
      memberCount: organisation.membersAmount,
    };

    memberships.push({
      ...organisationToUpdate,
      role: "MEMBER",
    });
  };

  return (
    <div className={classes.container}>
      <div className={classes.topRow}>
        <OrganisationAbout organisation={organisation} />
        <div className={classes.actions}>
          <span className={classes.title}>Akcije</span>
          <div className={classes.actionsRow}>
            <button
              className={clsx(
                classes.button,
                followedOrganisations.some((x) => x.id === organisation.id) &&
                  classes.unfollow
              )}
              onClick={handleToggleFollow}
            >
              {followedOrganisations.some((x) => x.id === organisation.id)
                ? "Prestani pratiti"
                : "Prati"}
            </button>
            <span className={classes.actionStat}>
              {organisation.followersAmount}
            </span>
          </div>
          <div className={classes.actionsRow}>
            <button
              className={clsx(
                classes.button,
                classes.blue,
                memberships.some((x) => x.id === organisation.id) &&
                  classes.leave
              )}
              onClick={handleMembership}
            >
              {memberships.some((x) => x.id === organisation.id)
                ? "Napusti organizaciju"
                : "Postani član"}
            </button>
            <span className={classes.actionStat}>
              {organisation.membersAmount}
            </span>
          </div>
          <div className={classes.stats}>
            <div className={classes.bigStat}>
              <span className={classes.title}>Objava</span>
              <span className={classes.stat}>
                {organisation.posts ? organisation.posts.length : 0}
              </span>
            </div>
            <div className={classes.bigStat}>
              <span className={classes.title}>Eksponata</span>
              <span className={classes.stat}>
                {organisation.exponats.length}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.title}>Objave organizacije</div>
      <div className={classes.otherPosts}>
        {organisation.socialPosts?.slice(1).map((post, index) => (
          <div className={classes.postCard} key={index}>
            <div className={classes.postCardTitle}>{post.title}</div>
            <div className={classes.postCardContent}>{post.image}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
