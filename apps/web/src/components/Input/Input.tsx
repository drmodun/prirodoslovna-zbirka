"use client";
import { FieldValues, UseFormReturn } from "react-hook-form";
import classes from "./Input.module.scss";
import Image from "next/image";
import clsx from "clsx";
import ErrorText from "components/Error";
interface InputProps {
  question: string;
  attribute: string;
  form: UseFormReturn<FieldValues>;
  image?: string;
  isPassword?: boolean;
  isDisabled?: boolean;
  error?: string;
}

export const Input = ({
  question,
  attribute,
  form,
  isDisabled,
  image,
  error,
  isPassword,
}: InputProps) => {
  const { register } = form;
  return (
    <div className={classes.main}>
      <div className={clsx(classes.container, error && classes.errorInput)}>
        {image && (
          <div className={classes.image}>
            <Image layout="fill" src={image} alt={question} />{" "}
          </div>
        )}
        <input
          {...register(attribute)}
          type={isPassword ? "password" : "text"}
          className={classes.input}
          disabled={isDisabled}
          placeholder={question}
        />
      </div>
      <ErrorText message={error} />
    </div>
  );
};
