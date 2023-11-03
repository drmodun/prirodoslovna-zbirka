"use client";
import { FieldValues, UseFormReturn } from "react-hook-form";
import classes from "./Input.module.scss";
import Image from "next/image";
import { InputResult } from "@/shared/enums";
import clsx from "clsx";
interface InputProps {
  question: string;
  attribute: string;
  form: UseFormReturn<FieldValues>;
  image?: string;
  isPassword?: boolean;
  isDisabled?: boolean;
  status?: InputResult;
}

export const Input = ({
  question,
  attribute,
  form,
  isDisabled,
  image,
  status = InputResult.DEFAULT,
  isPassword,
}: InputProps) => {
  const { register } = form;
  return (
    <div className={classes.container}>
      {image && (
        <div className={classes.image}>
          <Image layout="fill" src={image} alt={question} />{" "}
        </div>
      )}
      <input
        {...register(attribute)}
        type={isPassword ? "password" : "text"}
        className={clsx(classes.input, classes[status])}
        disabled={isDisabled}
        placeholder={question}
      />
    </div>
  );
};
