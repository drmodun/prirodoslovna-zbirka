import { questionSchema } from "components/QuestionForm/QuestionForm";
import { z } from "zod";

export interface QuestionInputPreviewProps {
  question: z.infer<typeof questionSchema>;
}

import classes from "./QuestionInputPreview.module.scss";
import Image from "next/image";

const optionLabels = ["A", "B", "C", "D", "E", "F"];

export const QuestionInputPreview = ({
  question,
}: QuestionInputPreviewProps) => {
  return (
    <div className={classes.container}>
      <div className={classes.question}>{question.question}</div>
      {question.image && (
        <div className={classes.image}>
          <Image layout="fill" src={question.image} alt={question.question} />{" "}
        </div>
      )}
      {question.questionType === "MULTIPLE_CHOICE" && (
        <div className={classes.options}>
          {question.options.map((option, index) => (
            <div key={index} className={classes.option}>
              <span className={classes.optionTag}>{optionLabels[index]}</span>
              <span className={classes.optionText}>{option}</span>
            </div>
          ))}
        </div>
      )}
      <div className={classes.correct}>{question.correct.toString()}</div>
    </div>
  );
};
