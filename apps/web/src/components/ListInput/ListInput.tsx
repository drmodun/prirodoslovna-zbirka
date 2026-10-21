"use client";
import { FieldValues, UseFormReturn } from "react-hook-form";
import classes from "./ListInput.module.scss";
import dash from "assets/images/dash.svg";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SingleInput from "components/SingleInput";
import leaf from "assets/images/like-leaf-green.svg";
import plus from "assets/images/plus.svg";
import ErrorText from "components/Error";
import { Option, SelectInput } from "components/SelectInput/SelectInput";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("ListInput");
  const { setValue } = form;
  const [elements, setElements] = useState<string[]>(initValue || []);
  const [newValue, setNewValue] = useState<string>("");

  const handleOnChange = () => {
    if (newValue === "") return;
    if (elements.includes(newValue)) return;
    setElements((prev) => [...prev, newValue]);
    setNewValue("");
  };

  // Switching between free text and a list of options starts over, but the
  // first render keeps initValue. Options are compared by value, since
  // callers often build a new array on every render.
  const optionsKey = options?.map((option) => option.value).join("\u0000");
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setElements([]);
    setNewValue(options?.[0]?.value || "");
    setValue(attribute, []);
  }, [isSelect, optionsKey]);

  const handleDelete = (index: number) => {
    setElements((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setValue(attribute, elements);
    setNewValue(options?.[0]?.value || "");
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
              title={t("remove")}
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
            title={t("add")}
            onClick={() => handleOnChange()}
          >
            <Image src={plus} alt="add" layout="fill" />
          </button>
          {isSelect ? (
            <select
              name="select"
              title={t("select")}
              value={newValue}
              className={classes.select}
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
              question={t("placeholder")}
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
