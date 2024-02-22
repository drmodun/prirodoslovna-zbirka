import Image from "next/image";
import classes from "./UserCard.module.scss";
import Link from "next/link";
import clsx from "clsx";
import { ExtendedUserResponse } from "@biosfera/types";
import placeholder from "assets/images/lion.svg";
import userRandom from "assets/images/user.svg";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import UserFollowButton from "components/UserFollowButton";
export interface UserCardProps {
  user: ExtendedUserResponse;
}

export const UserCard = ({ user }: UserCardProps) => (
  <div className={classes.container}>
    <div className={classes.picture}>
      <Image
        src={user.hasProfileImage ? user : placeholder}
        alt={user.username}
      />
    </div>
    <span className={classes.name}>{`${user.firstName} ${user.lastName}`}</span>
    <span className={classes.email}>{user.username}</span>
    <div className={classes.info}>
      <div className={clsx(classes.attribute, classes.posts)}>
        <span>Posts:</span>
        <span>{user.posts.length}</span>
      </div>
      <div className={clsx(classes.attribute, classes.likes)}>
        <span>Likes:</span>
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
        {user.followerCount} followers
      </Link>
      <Link
        className={classes.link}
        href={{
          pathname: "/follows/" + user.id,
          query: { tab: "Following" }, //this will make a lot more sense later
        }}
      >
        {user.followingCount} following
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
