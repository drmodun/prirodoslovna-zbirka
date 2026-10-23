import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import classes from "./page.module.scss";
import { QuizForm } from "components/QuizForm/QuizForm";
import { getTranslations } from "next-intl/server";

const CreateQuiz = async (props: { params: Promise<any> }) => {
  const params = await props.params;
  const t = await getTranslations("Pages");

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <div className={classes.title}>
          <span>{t("createQuiz")}</span>
        </div>
        <div className={classes.form}>
          <QueryClientWrapper>
            <QuizForm organisationId={params.organisationId} />
          </QueryClientWrapper>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
