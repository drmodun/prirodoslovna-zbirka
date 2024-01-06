import classes from "./page.module.scss";
import { serverGetUser } from "@/api/serverGetUser";
import UserCard from "components/UserCard";
import { ExtendedUserResponse } from "@biosfera/types";
import user from "assets/images/user.svg";
import placeholder from "assets/images/lion.svg";
import { UserPageBody } from "components/UserPageBody/UserPageBody";
const UserPage = async ({ params }: { params: any }) => {
  const userInfo: ExtendedUserResponse = await serverGetUser(params.userId);
  return (
    <div className={classes.container}>
      <div className={classes.background} />
      <div className={classes.userBody}>
        {userInfo && (
          <div className={classes.userCard}>
            <UserCard
              avatar={userInfo.hasProfileImage ? placeholder : user}
              firstName={userInfo.firstName}
              lastName={userInfo.lastName}
              followers={userInfo.followerCount}
              following={userInfo.followingCount}
              id={userInfo.id}
              likeScore={userInfo.likeCount}
              postCount={userInfo.posts ? userInfo.posts.length : 0}
              key={userInfo.id}
            />
          </div>
        )}
        <UserPageBody />
      </div>
    </div>
  );
};

export default UserPage;
