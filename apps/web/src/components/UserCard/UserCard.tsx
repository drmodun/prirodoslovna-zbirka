import Image from "next/image";
import classes from "./UserCard.module.scss";
import Link from "next/link";

export interface UserCardProps {
  firstName: string;
  lastName: string;
  followers: number;
  following: number;
  avatar: string;
  id: string;
  likeScore: number;
  postCount: number;
}

export const UserCard = ({
  firstName,
  lastName,
  followers,
  following,
  id,
  likeScore,
  postCount,
  avatar,
}: UserCardProps) => (
  <div className={classes.container}>
    <div className={classes.picture}>
      <Image src={avatar} alt={firstName} />
    </div>
    <span className={classes.name}>{`${firstName} ${lastName}`}</span>
    <div className={classes.info}>
      <span className={classes.attribute}>Posts: {postCount}</span>
      <span className={classes.attribute}>Likes: {likeScore}</span>
    </div>
    <div className={classes.follows}>
      <Link
        className={classes.link}
        href={{
          pathname: "/follows/" + id,
          query: { tab: 0 },
        }}
      >
        {followers} followers
      </Link>
      <Link
        className={classes.link}
        href={{
          pathname: "/follows/" + id,
          query: { tab: 1 }, //this will make a lot more sense later
        }}
      >
        {following} following
      </Link>
    </div>
  </div>
);
