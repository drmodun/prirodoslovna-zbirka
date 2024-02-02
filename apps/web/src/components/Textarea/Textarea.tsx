"use client";
import { FieldValues, UseFormReturn } from "react-hook-form";
import classes from "./Textarea.module.scss";
import Image from "next/image";
import { InputResult } from "@/shared/enums";
import clsx from "clsx";
interface TextareaProps {
  question: string;
  attribute: string;
  form: UseFormReturn<FieldValues>;
  image?: string;
  isDisabled?: boolean;
  status?: InputResult;
  minRows?: number;
}

export const Textarea = ({
  question,
  attribute,
  form,
  isDisabled,
  image,
  status = InputResult.DEFAULT,
  minRows = 5,
}: TextareaProps) => {
  const { register } = form;
  return (
    <div className={classes.container}>
      {image && (
        <div className={classes.image}>
          <Image layout="fill" src={image} alt={question} />{" "}
        </div>
      )}
      <textarea
        {...register(attribute)}
        className={clsx(classes.textarea, classes[status])}
        disabled={isDisabled}
        placeholder={question}
        rows={minRows}
      />
    </div>
  );
};
