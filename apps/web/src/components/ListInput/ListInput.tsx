"use client";
import { FieldValues, UseFormReturn } from "react-hook-form";
import classes from "./ListInput.module.scss";
import dash from "assets/images/dash.svg";
import Image from "next/image";
import { useEffect, useState } from "react";
import SingleInput from "components/SingleInput";
import leaf from "assets/images/like-leaf-green.svg";
import plus from "assets/images/plus.svg";
import ErrorText from "components/Error";
import { Option, SelectInput } from "components/SelectInput/SelectInput";

export interface ListInputProps {
  question: string;
  attribute: string;
  form: UseFormReturn<FieldValues>;
  error?: string;
  initValue?: string[];
  isSelect?: boolean;
  options?: Option[];
  isWithCheckbox?: boolean;
}

export const ListInput = ({
  question,
  attribute,
  form,
  isWithCheckbox,
  error,
  isSelect,
  options,
  initValue,
}: ListInputProps) => {
  const { setValue } = form;
  const [elements, setElements] = useState<string[]>(initValue || []);
  const [newValue, setNewValue] = useState<string>("");

  const handleOnChange = () => {
    if (newValue === "") return;
    setElements((prev) => [...prev, newValue]);
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
          {isSelect ? (
            <select
              name="select"
              title="Odabir vrijednosti"
              className={classes.select}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            >
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select> //TODO: add styles if needed
          ) : (
            <SingleInput
              onChange={setNewValue}
              question="Upišite vrijednost"
              value={newValue}
              image={leaf}
            />
          )}
        </div>
      </div>
      <ErrorText message={error} />
    </div>
  );
};
