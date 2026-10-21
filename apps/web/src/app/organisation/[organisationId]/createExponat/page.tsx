import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import classes from "./page.module.scss";
import { ExponatForm } from "components/ExponatForm/ExponatForm";
import { RegistrationImage } from "@/views/RegistrationImage/RegistrationImage";
import { ExponatFormImage } from "@/views/ExponatFormImage/ExponatFormImage";
import { useTranslations } from "next-intl";

const ExponatCreate = ({ params }: { params: any }) => {
  const t = useTranslations("Pages");

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
