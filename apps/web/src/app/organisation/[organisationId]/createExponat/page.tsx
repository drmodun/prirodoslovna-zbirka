import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import classes from "./page.module.scss";
import { ExponatForm } from "components/ExponatForm/ExponatForm";
import { RegistrationImage } from "@/views/RegistrationImage/RegistrationImage";
import { ExponatFormImage } from "@/views/ExponatFormImage/ExponatFormImage";
import { getTranslations } from "next-intl/server";

const ExponatCreate = async (props: { params: Promise<any> }) => {
  const params = await props.params;
  const t = await getTranslations("Pages");

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <div className={classes.title}>
          <span>{t("createExponat")}</span>
        </div>
        <div className={classes.form}>
          <QueryClientWrapper>
            <ExponatForm organisationId={params.organisationId} />
          </QueryClientWrapper>
        </div>
      </div>
      <ExponatFormImage />
    </div>
  );
};

export default ExponatCreate;
