import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import classes from "./page.module.scss";
import { SocialPostForm } from "components/SocialPostForm/SocialPostForm";
import { getTranslations } from "next-intl/server";

const CreateSocialPost = async (props: { params: Promise<any> }) => {
  const params = await props.params;
  const t = await getTranslations("Pages");

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <div className={classes.title}>
          <span>{t("createSocialPost")}</span>
        </div>
        <div className={classes.form}>
          <QueryClientWrapper>
            <SocialPostForm organisationId={params.organisationId} />
          </QueryClientWrapper>
        </div>
      </div>
    </div>
  );
};

export default CreateSocialPost;
