import { serverGetExponat } from "@/api/serverExponat";
import { ExponatExtendedResponse } from "@biosfera/types";
import classes from "./page.module.scss";
import ExponatModal from "components/ExponatModal";
import { PostCard } from "components/PostCard";
import CardCollection from "components/CardCollection";
import { UserWrapper } from "@/utility/wrappers/userWrapper";

const ExponatPage = async ({ params }: { params: any }) => {
  const exponatInfo: ExponatExtendedResponse = await serverGetExponat(
    params.exponatId
  );

  return (
    <div className={classes.container}>
      <div className={classes.modal}>
        <ExponatModal exponat={exponatInfo} />
      </div>
      <div className={classes.posts}>
        <span className={classes.title}>Objave</span>
        {
          <UserWrapper>
            <CardCollection
              items={exponatInfo.posts}
              type="post"
              sortBy={[
                { label: "Abecedno", value: "title" },
                { label: "Likeovi", value: "likeScore" },
                { label: "Datum Objave", value: "updatedAt" },
              ]}
              pageSize={10}
            />
          </UserWrapper>
        }
      </div>
    </div>
  );
};

export default ExponatPage;
