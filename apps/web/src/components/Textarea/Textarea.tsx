"use client";
import { FieldValues, UseFormReturn } from "react-hook-form";
import classes from "./Textarea.module.scss";
import Image from "next/image";
import { InputResult } from "@/shared/enums";
import clsx from "clsx";
import ErrorText from "components/Error";
interface TextareaProps {
  question: string;
  attribute: string;
  form: UseFormReturn<FieldValues>;
  image?: string;
  isDisabled?: boolean;
  minRows?: number;
  error?: string;
}

export const Textarea = ({
  question,
  attribute,
  form,
  isDisabled,
  image,
  minRows = 5,
  error,
}: TextareaProps) => {
  const { register } = form;
  return (
    <div className={classes.main}>
      <div className={clsx(classes.container, error && classes.errorInput)}>
        {image && (
          <div className={classes.image}>
            <Image layout="fill" src={image} alt={question} />
          </div>
        )}
        <textarea
          {...register(attribute)}
          className={classes.textarea}
          disabled={isDisabled}
          placeholder={question}
          rows={minRows}
        />
      </div>
      <ErrorText message={error} />
    </div>
  );
};
