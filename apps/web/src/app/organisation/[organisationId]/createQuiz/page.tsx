import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import classes from "./page.module.scss";
import { QuizForm } from "components/QuizForm/QuizForm";

const createQuiz = ({ params }: { params: any }) => (
  <div className={classes.container}>
    <div className={classes.content}>
      <div className={classes.title}>
        <span>Kreiraj novi kviz</span>
      </div>
      <div className={classes.form}>
        <QueryClientWrapper>
          <QuizForm organisationId={params.organisationId} />
        </QueryClientWrapper>
      </div>
    </div>
  </div>
);

export default createQuiz;
