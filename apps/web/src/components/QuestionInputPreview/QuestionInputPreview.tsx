"use client";

import {
  QuestionForm,
  questionSchema,
  questionSchemaType,
} from "components/QuestionForm/QuestionForm";

export interface QuestionInputPreviewProps {
  question: questionSchemaType;
  onEdit: (data: questionSchemaType, index: number) => void;
  onDelete: (id: number) => void;
  index: number;
}

import classes from "./QuestionInputPreview.module.scss";
import Image from "next/image";
import BaseButton from "components/BaseButton";
import { useState } from "react";
import { ButtonColor } from "@/shared/enums";

const optionLabels = ["A", "B", "C", "D", "E", "F"];

export const QuestionInputPreview = ({
  question,
  onDelete,
  index,
  onEdit,
}: QuestionInputPreviewProps) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  return isEditMode ? (
    <>
      <QuestionForm
        defaultValues={question}
        onSubmit={(data) => {
          setIsEditMode(false);
          onEdit(data, index);
        }}
      />
      <BaseButton
        text="Odustani"
        onClick={() => setIsEditMode(false)}
        className={classes.deleteButton}
        isNotSubmit
      />
    </>
  ) : (
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
      <div className={classes.points}>Vrijedi: {question.points}</div>
      <BaseButton
        isNotSubmit
        text="Uredi"
        initColor={ButtonColor.BLUE}
        onClick={() => setIsEditMode(true)}
      />
      <BaseButton
        isNotSubmit
        text="Obriši"
        className={classes.deleteButton}
        onClick={() => onDelete(index)}
      />
    </div>
  );
};
