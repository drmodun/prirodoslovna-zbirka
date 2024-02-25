"use client";
import classes from "./SingleInput.module.scss";
import Image from "next/image";
import { InputResult } from "@/shared/enums";
import clsx from "clsx";
import Link from "next/link";
import { Indexable } from "@biosfera/types/src/jsonObjects";
interface InputProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  image?: string;
  isPassword?: boolean;
  isDisabled?: boolean;
  linkedImage?: string | Indexable;
  status?: InputResult;
  onImageClick?: () => void;
}

export const SingleInput = ({
  question,
  value,
  linkedImage,
  onChange,
  onImageClick,
  isDisabled,
  image,
  status = InputResult.DEFAULT,
  isPassword,
}: InputProps) => {
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={classes.container}>
      {image &&
        (linkedImage ? (
          <Link
            href={linkedImage}
            className={classes.image}
            onClick={onImageClick}
          >
            <Image layout="fill" src={image} alt={question} />
          </Link>
        ) : (
          <div className={classes.image}>
            <Image layout="fill" src={image} alt={question} />
          </div>
        ))}
      <input
        type={isPassword ? "password" : "text"}
        className={clsx(classes.input, classes[status])}
        disabled={isDisabled}
        placeholder={question}
        value={value}
        onChange={handleOnChange}
      />
    </div>
  );
};
