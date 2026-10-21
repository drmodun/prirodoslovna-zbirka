import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import classes from "./page.module.scss";
import { QuizForm } from "components/QuizForm/QuizForm";
import { useTranslations } from "next-intl";

const CreateQuiz = ({ params }: { params: any }) => {
  const t = useTranslations("Pages");

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
