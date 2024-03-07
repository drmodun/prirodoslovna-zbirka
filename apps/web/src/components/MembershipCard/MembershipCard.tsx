import Image, { StaticImageData } from "next/image";
import classes from "./MembershipCard.module.scss";
import clsx from "clsx";
import Link from "next/link";
import {
  MemberRole,
  OrganisationResponseShort,
  Role,
  ShortUserResponse,
} from "@biosfera/types";
import { Indexable } from "@biosfera/types/src/jsonObjects";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import MembershipFollowButton from "../MembershipFollowButton";
import LeaveOrganisationButton from "components/LeaveOrganisationButton";
import RemoveMembershipButton from "components/RemoveMembershipButton";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import EditUserRoleModal from "components/EditUserRoleModal";
import { makeCountyName } from "@/utility/static/countyNameMaker";

export const memberWeight = {
  ADMIN: 2,
  OWNER: 3,
  MEMBER: 1,
  REQUESTED: 0,
} as Indexable;
export interface MemberShipCardProps {
  name: string;
  description: string;
  image: string | StaticImageData;
  type: "organisation" | "user";
  isFollowCard?: boolean;
  id: string;
  organisationId?: string;
  role: string;
  isUser?: boolean;
  isAdmin?: boolean;
  object: OrganisationResponseShort | ShortUserResponse;
  onRemove?: (id: string) => void;
}

export const MembershipCard = ({
  name,
  isUser,
  description,
  image,
  organisationId,
  role,
  isAdmin,
  id,
  isFollowCard,
  onRemove,
  type,
  object: oq,
}: MemberShipCardProps) => {
  return (
    <div className={classes.container}>
      <div className={classes.entity}>
        <div className={classes.imageContainer}>
          <ImageWithFallback layout="fill" src={image} alt={name} />
        </div>
        <div className={classes.content}>
          <Link href={`/${type}/${id}`}>
            <span className={classes.name}>{name}</span>
          </Link>
          <span className={classes.description}>
            {makeCountyName(description)}
          </span>
        </div>
      </div>
      <div className={classes.last}>
        <div className={clsx(classes.role, classes[role?.toLowerCase()])}>
          {role === "ADMIN"
            ? "Admin"
            : role === "OWNER"
            ? "Vlasnik"
            : role === "MEMBER"
            ? "Član"
            : role === "REQUESTED"
            ? "Zahtjev"
            : makeCountyName(role)}
        </div>
        <UserWrapper>
          <div className={classes.buttons}>
            {isUser && !isFollowCard ? (
              <LeaveOrganisationButton
                organisationId={oq.id}
                onRemove={onRemove}
              />
            ) : isAdmin && !isFollowCard ? (
              <div className={classes.buttons}>
                <RemoveMembershipButton
                  userId={oq.id}
                  organisationId={organisationId!}
                  onRemove={onRemove}
                />
                <EditUserRoleModal
                  userId={oq.id}
                  organisationId={organisationId!}
                  userRole={role}
                />
              </div>
            ) : null}
            <MembershipFollowButton object={oq} type={type} />
          </div>
        </UserWrapper>
      </div>
    </div>
  );
};
