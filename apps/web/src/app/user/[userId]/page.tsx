import classes from "./page.module.scss";
import { serverGetUser } from "@/api/serverGetUser";
import UserCard from "components/UserCard";
import { ExtendedUserResponse } from "@biosfera/types";
import { UserPageBody } from "components/UserPageBody/UserPageBody";
const UserPage = async ({ params }: { params: any }) => {
  const userInfo: ExtendedUserResponse = await serverGetUser(params.userId);
  return (
    <div className={classes.container}>
      <div className={classes.background} />
      <div className={classes.userBody}>
        {userInfo && (
          <div className={classes.userCard}>
            <UserCard user={userInfo} />
          </div>
        )}
        <UserPageBody />
      </div>
    </div>
  );
};

export default UserPage;
