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
import QrCodeGenerator from "components/QrCodeButton";
import ShareButton from "components/ShareButton";
import Link from "next/link";
import BaseButton from "components/BaseButton";
import { isSuperRole } from "@/utility/static/roles";
import { useTranslations } from "next-intl";

export interface OrganisationHomepageProps {
  organisation: ExtendedOrganisationResponse;
}

export const OrganisationHomepage = ({
  organisation,
}: OrganisationHomepageProps) => {
  const t = useTranslations("OrganisationHomepage");
  const {
    memberships,
    followedOrganisations,
    user,
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
      organisationToUpdate as OrganisationResponseShort,
    );
  };

  const handleMembership = async () => {
    const isMember = memberships.some((x) => x.id === organisation.id);
    if (isMember) {
      const confirm = window.confirm(t("leaveConfirm"));
      if (!confirm) return;
      await leaveOrganisation(organisation.id);
      const memershipToRemove = memberships.find(
        (x) => x.id === organisation.id,
      );
      updateMemberships(memershipToRemove!);
      return;
    }

    const confirm = window.confirm(t("requestConfirm"));
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
    organisation && (
      <div className={classes.container}>
        <div className={classes.topRow}>
          <OrganisationAbout organisation={organisation} />
          <div className={classes.actions}>
            <span className={classes.title}>{t("actions")}</span>
            <div className={classes.actionsRow}>
              <button
                className={clsx(
                  classes.button,
                  followedOrganisations.some((x) => x.id === organisation.id) &&
                    classes.unfollow,
                )}
                onClick={handleToggleFollow}
              >
                {followedOrganisations.some((x) => x.id === organisation.id)
                  ? t("unfollow")
                  : t("follow")}
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
                    classes.leave,
                )}
                onClick={handleMembership}
              >
                {memberships.some((x) => x.id === organisation.id)
                  ? t("leave")
                  : t("join")}
              </button>
              <span className={classes.actionStat}>
                {organisation.membersAmount}
              </span>
            </div>
            <div className={classes.social}>
              <QrCodeGenerator name={organisation.name} isIcon />
              <ShareButton
                text={t("share", { name: organisation.name })}
                title={organisation.name}
              />
            </div>
            <div className={classes.stats}>
              <div className={classes.bigStat}>
                <span className={classes.title}>{t("postCount")}</span>
                <span className={classes.stat}>
                  {organisation.posts ? organisation.posts.length : 0}
                </span>
              </div>
              <div className={classes.bigStat}>
                <span className={classes.title}>{t("exponatCount")}</span>
                <span className={classes.stat}>
                  {organisation.exponats?.length}
                </span>
              </div>
            </div>
          </div>
        </div>
        {(isSuperRole(user?.role) ||
          memberships.some(
            (x) =>
              x.id === organisation.id &&
              (x.role === "ADMIN" || x.role === "OWNER"),
          )) && (
          <Link href={`/organisation/${organisation.id}/createSocialPost`}>
            <BaseButton text={t("addPost")} />
          </Link>
        )}
        {organisation?.socialPosts?.length && (
          <div className={classes.socialPostWrapper}>
            <span className={classes.title}>{t("posts")}</span>
            {organisation.socialPosts?.map((post) => (
              <SocialPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    )
  );
};
