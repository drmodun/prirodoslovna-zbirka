"use client";
import { FieldValues, UseFormReturn } from "react-hook-form";
import classes from "./AttributeInput.module.scss";
import dash from "assets/images/dash.svg";
import Image from "next/image";
import { useEffect, useState } from "react";
import SingleInput from "components/SingleInput";
import leaf from "assets/images/like-leaf-green.svg";
import plus from "assets/images/plus.svg";
import { Json } from "@biosfera/types/src/jsonObjects";
import ErrorText from "components/Error";
import { init } from "next/dist/compiled/webpack/webpack";

export interface AttributeInputProps {
  question: string;
  attribute: string;
  form: UseFormReturn<FieldValues>;
  error?: string;
  initValue?: Json;
}

export const AttributeInput = ({
  question,
  attribute,
  form,
  initValue,
  error,
}: AttributeInputProps) => {
  const { setValue } = form;
  const [object, setObject] = useState<Json>(initValue || {});
  const [newAttribute, setNewAttribute] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("");

  const handleOnChange = () => {
    if (newAttribute === "" || newValue === "") return;

    setObject((prev) => {
      return {
        ...prev,
        [newAttribute]: newValue,
      };
    });
    setNewValue("");
    setNewAttribute("");
  };

  const handleDelete = (key: string) => {
    setObject((prev) => {
      const newObject = { ...prev };
      delete newObject[key];
      return newObject;
    });
  };

  useEffect(() => {
    setValue(attribute, object);
  }, [object]);

  return (
    <div className={classes.container}>
      <span className={classes.question}>{question}</span>
      <div className={classes.existing}>
        {Object.keys(object).map((key, index) => (
          <div className={classes.element} key={index}>
            <button
              className={classes.delete}
              type="button"
              title="remove"
              onClick={() => handleDelete(key)}
            >
              <Image src={dash} alt="delete" layout="fill" />
            </button>
            <span className={classes.text}>
              <span className={classes.key}>{key}:</span>
              <span className={classes.value}>{object[key].toString()}</span>
            </span>
          </div>
        ))}
        <div className={classes.add}>
          <div className={classes.input}>
            <SingleInput
              onChange={setNewAttribute}
              question="Atribut"
              value={newAttribute}
            />
            <SingleInput
              onChange={setNewValue}
              question="Vrijednost"
              value={newValue}
            />
          </div>
          <button
            className={classes.button}
            title="add"
            type="button"
            onClick={() => handleOnChange()}
          >
            <Image src={plus} alt="add" layout="fill" />
          </button>
        </div>
      </div>
      <ErrorText message={error} />
    </div>
  );
};
