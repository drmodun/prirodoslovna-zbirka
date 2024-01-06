import classes from "page.module.scss";
import { serverGetUser } from "@/api/serverGetUser";
import UserCard from "components/UserCard";
import { ExtendedUserResponse } from "@biosfera/types";

export const UserPage = async ({ params }: any) => {
  const userInfo: ExtendedUserResponse = await serverGetUser(params.id);

  <div className={classes.container}>
    <UserCard 
    avatar={userInfo.}
  </div>;
};
