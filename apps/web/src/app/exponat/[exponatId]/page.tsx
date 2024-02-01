import { serverGetExponat } from "@/api/serverExponat";
import { ExponatExtendedResponse } from "@biosfera/types";
import classes from "./page.module.scss";
import ExponatModal from "components/ExponatModal";
import { PostCard } from "components/PostCard";

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
        <div className={classes.postsRow}>
          {exponatInfo.posts.map((post, index) => (
            <PostCard post={post} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExponatPage;
