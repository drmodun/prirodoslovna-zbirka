import classes from "./page.module.scss";
import { serverGetUser } from "@/api/serverUser";
import UserCard from "components/UserCard";
import {
  ExtendedUserResponse,
  WorkResponseExtended,
  WorkResponseShort,
} from "@biosfera/types";
import { UserPageBody } from "components/UserPageBody/UserPageBody";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import { getGbifWork } from "@/api/serverLiterature";
import { notFound } from "next/navigation";

const UserPage = async (props: { params: Promise<any> }) => {
  const params = await props.params;
  const userInfo: ExtendedUserResponse = await serverGetUser(params.userId);
  // Answers 404 with the not-found page.
  if (!userInfo) return notFound();

  const getAllLiterature = await Promise.all(
    (userInfo.savedLiterature ?? []).map((literature) =>
      getGbifWork(literature.literatureId),
    ),
  );

  return (
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
              savedLiterature={
                getAllLiterature.filter(
                  (literature) => literature != null, // Filter out null values
                ) as WorkResponseShort[]
              }
            />
          </UserWrapper>
        )}
      </div>
    </div>
  );
};

export default UserPage;
