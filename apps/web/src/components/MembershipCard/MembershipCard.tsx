import Image from "next/image";
import classes from "./MembershipCard.module.scss";
import clsx from "clsx";
import Link from "next/link";
import { Role } from "@biosfera/types";

export interface MemberShipCardProps {
  name: string;
  description: string; //TODO: potentially change this to description
  image: string;
  type: "organisation" | "user";
  following: boolean;
  id: string;
  role: string;
}

export const MembershipCard = ({
  name,
  description,
  image,
  role,
  id,
  type,
  following,
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
        <div className={clsx(classes.role, classes[role])}>
          {role === "admin" ? "Admin" : role === "owner" ? "Vlasnik" : "Član"}
        </div>
        <div
          className={clsx(classes.followButton, following && classes.following)}
        >
          {!following ? "Prati" : "Prestani pratiti"}
        </div>
      </div>
    </div>
  );
};
