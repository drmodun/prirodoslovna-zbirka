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

export const memberWeight = {
  ADMIN: 2,
  OWNER: 3,
  MEMBER: 1,
  REQUESTED: 0,
} as Indexable;
export interface MemberShipCardProps {
  name: string;
  description: string; //TODO: potentially change this to description
  image: string | StaticImageData;
  type: "organisation" | "user";
  id: string;
  organisationId?: string;
  role: string;
  isUser?: boolean;
  isAdmin?: boolean;
  object: OrganisationResponseShort | ShortUserResponse;
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
  type,
  object: oq,
}: MemberShipCardProps) => {
  return (
    <div className={classes.container}>
      <div className={classes.entity}>
        <div className={classes.imageContainer}>
          <Image src={image} alt={name} layout="fill" />
        </div>
        <div className={classes.content}>
          <Link href={`/${type}/${id}`}>
            <span className={classes.name}>{name}</span>
          </Link>
          <span className={classes.description}>{description}</span>
        </div>
      </div>
      <div className={classes.last}>
        <div className={clsx(classes.role, classes[role.toLowerCase()])}>
          {role === "ADMIN"
            ? "Admin"
            : role === "OWNER"
            ? "Vlasnik"
            : role === "MEMBER"
            ? "Član"
            : "Zahtjev"}
        </div>
        <UserWrapper>
          {isUser ? (
            <LeaveOrganisationButton organisationId={oq.id} />
          ) : isAdmin ? (
            <div className={classes.buttons}>
              <RemoveMembershipButton
                userId={oq.id}
                organisationId={organisationId!}
              />
            </div>
          ) : null}
          <div className={classes.buttons}>
            <MembershipFollowButton object={oq} type={type} />
          </div>
        </UserWrapper>
      </div>
    </div>
  );
};
