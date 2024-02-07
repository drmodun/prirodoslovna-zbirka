import Image from "next/image";
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

export const memberWeight = {
  ADMIN: 2,
  OWNER: 3,
  MEMBER: 1,
  REQUESTED: 0,
} as Indexable;
export interface MemberShipCardProps {
  name: string;
  description: string; //TODO: potentially change this to description
  image: string;
  type: "organisation" | "user";
  id: string;
  role: string;
  object: OrganisationResponseShort | ShortUserResponse;
}

export const MembershipCard = ({
  name,
  description,
  image,
  role,
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
          <MembershipFollowButton object={oq} type={type} />
        </UserWrapper>
      </div>
    </div>
  );
};
