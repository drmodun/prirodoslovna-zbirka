import classes from "./page.module.scss";
import { serverGetUser } from "@/api/serverUser";
import UserCard from "components/UserCard";
import { ExtendedUserResponse } from "@biosfera/types";
import { UserPageBody } from "components/UserPageBody/UserPageBody";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import NotFound from "@/not-found";
import { getGbifWork } from "@/api/serverLiterature";
const UserPage = async ({ params }: { params: any }) => {
  const userInfo: ExtendedUserResponse = await serverGetUser(params.userId);
  const getAllLiterature = await Promise.all(
    userInfo.savedLiterature.map((literature) =>
      getGbifWork(literature.literatureId)
    )
  );

  return userInfo ? (
    <div className={classes.container}>
      <div className={classes.background} />
      <div className={classes.userBody}>
        {userInfo && (
          <div className={classes.userCard}>
            <UserCard user={userInfo} />
          </div>
        )}
        {userInfo && (
          <UserWrapper>
            <UserPageBody
              user={userInfo}
              savedLiterature={getAllLiterature.filter(
                (literature) => literature != null // Filter out null values
              )}
            />
          </UserWrapper>
        )}
      </div>
    </div>
  ) : (
    <NotFound />
  );
};

export default UserPage;
