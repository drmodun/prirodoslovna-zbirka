import Image from "next/image";
import classes from "./UserCard.module.scss";
import Link from "next/link";
import clsx from "clsx";
import { ExtendedUserResponse } from "@biosfera/types";
import placeholder from "assets/images/lion.svg";
import userRandom from "assets/images/user.svg";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import UserFollowButton from "components/UserFollowButton";
import { getPfpUrl } from "@/utility/static/getPfpUrl";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
export interface UserCardProps {
  user: ExtendedUserResponse;
}

export const UserCard = ({ user }: UserCardProps) => (
  <div className={classes.container}>
    <div className={classes.picture}>
      <ImageWithFallback
        src={getPfpUrl(user.id)}
        fallbackSrc={placeholder}
        layout="fill"
        alt={user.username}
      />
    </div>
    <span className={classes.name}>{`${user.firstName} ${user.lastName}`}</span>
    <span className={classes.email}>{user.username}</span>
    <div className={classes.info}>
      <div className={clsx(classes.attribute, classes.posts)}>
        <span>Broj objava:</span>
        <span>{user.posts.length}</span>
      </div>
      <div className={clsx(classes.attribute, classes.likes)}>
        <span>Broj kapljica:</span>
        <span>{user.likeCount}</span>
      </div>
    </div>
    <div className={classes.follows}>
      <Link
        className={classes.link}
        href={{
          pathname: "/follows/" + user.id,
          query: { tab: "Followers" },
        }}
      >
        {user.followerCount} pratitelja
      </Link>
      <Link
        className={classes.link}
        href={{
          pathname: "/follows/" + user.id,
          query: { tab: "Following" }, //this will make a lot more sense later
        }}
      >
        prati {user.followingCount} korisnika
      </Link>
    </div>
    <UserWrapper>
      <UserFollowButton
        user={{
          ...user,
          postCount: user.posts.length,
        }}
      />
    </UserWrapper>
  </div>
);
