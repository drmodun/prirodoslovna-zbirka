import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import classes from "./page.module.scss";
import { SocialPostForm } from "components/SocialPostForm/SocialPostForm";
import { useTranslations } from "next-intl";

const CreateSocialPost = ({ params }: { params: any }) => {
  const t = useTranslations("Pages");

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
