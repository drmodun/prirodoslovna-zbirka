"use client";
import { FieldValues, UseFormReturn } from "react-hook-form";
import classes from "./ListInput.module.scss";
import dash from "assets/images/dash.svg";
import Image from "next/image";
import { useEffect, useState } from "react";
import SingleInput from "components/SingleInput";
import leaf from "assets/images/like-leaf-green.svg";
import plus from "assets/images/plus.svg";

export interface ListInputProps {
  question: string;
  attribute: string;
  form: UseFormReturn<FieldValues>;
}

export const ListInput = ({ question, attribute, form }: ListInputProps) => {
  const { setValue } = form;
  const [elements, setElements] = useState<string[]>([]);
  const [newValue, setNewValue] = useState<string>("");

  const handleOnChange = () => {
    setElements((prev) => [...prev, newValue]);
    console.log(elements);
    setNewValue("");
  };

  const handleDelete = (index: number) => {
    setElements((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setValue(attribute, elements);
  }, [elements]);

  return (
    <div className={classes.container}>
      <span className={classes.question}>{question}</span>
      <div className={classes.existing}>
        {elements.map((element, index) => (
          <div className={classes.element} key={index}>
            <button
              className={classes.delete}
              type="button"
              title="remove"
              onClick={() => handleDelete(index)}
            >
              <Image src={dash} alt="delete" layout="fill" />
            </button>
            <span className={classes.text}>{element}</span>
          </div>
        ))}
        <div className={classes.add}>
          <button
            className={classes.button}
            type="button"
            title="add"
            onClick={() => handleOnChange()}
          >
            <Image src={plus} alt="add" layout="fill" />
          </button>
          <SingleInput
            onChange={setNewValue}
            question="Upišite činjenicu"
            value={newValue}
            image={leaf}
          />
        </div>
      </div>
    </div>
  );
};
