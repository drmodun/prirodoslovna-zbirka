import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import classes from "./page.module.scss";
import { SocialPostForm } from "components/SocialPostForm/SocialPostForm";

const createSocialPost = ({ params }: { params: any }) => (
  <div className={classes.container}>
    <div className={classes.content}>
      <div className={classes.title}>
        <span>Kreiraj novu objavu</span>
      </div>
      <div className={classes.form}>
        <QueryClientWrapper>
          <SocialPostForm organisationId={params.organisationId} />
        </QueryClientWrapper>
      </div>
    </div>
  </div>
);

export default createSocialPost;
