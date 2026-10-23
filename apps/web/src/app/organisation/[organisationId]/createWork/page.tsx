import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import classes from "./page.module.scss";
import WorksForm from "components/WorksForm";
import { ExponatFormImage } from "@/views/ExponatFormImage/ExponatFormImage";
import { getTranslations } from "next-intl/server";

const WorkCreate = async (props: { params: Promise<any> }) => {
  const params = await props.params;
  const t = await getTranslations("Pages");

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <div className={classes.title}>
          <span>{t("createWork")}</span>
        </div>
        <div className={classes.form}>
          <QueryClientWrapper>
            <WorksForm organisationId={params.organisationId} />
          </QueryClientWrapper>
        </div>
      </div>
    </div>
  );
};

export default WorkCreate;
