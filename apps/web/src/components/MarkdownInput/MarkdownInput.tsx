import { FieldValues, UseFormReturn } from "react-hook-form";
import classes from "./MarkdownInput.module.scss";
import clsx from "clsx";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";

export interface MarkdownInputProps {
  question: string;
  attribute: string;
  form: UseFormReturn<FieldValues>;
  image?: string;
  isDisabled?: boolean;
  minRows?: number;
  error?: string;
}

export const MarkdownInput = ({
  question,
  attribute,
  form,
  isDisabled,
  image,
  minRows = 5,
  error,
}: MarkdownInputProps) => {
  const { register } = form;
  const [values, setValues] = useState<string[]>([]);
  const [pointer, setPointer] = useState(0);

  const attachEnterListener = (
    textarea: HTMLTextAreaElement,
    index: number
  ) => {
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        setPointer(index + 1);
        setValues((prev) => [...prev, ""]);
        e.preventDefault();
      }
    });
  };

  const removeEnterListener = (
    textarea: HTMLTextAreaElement,
    index: number
  ) => {
    textarea.removeEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        setPointer(index + 1);
        setValues((prev) => [...prev, ""]);
        e.preventDefault();
      }
    });
  };

  const addArrowListener = (textarea: HTMLTextAreaElement, index: number) => {
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" && index !== 0) {
        setPointer(index - 1);
        e.preventDefault();
      } else if (e.key === "ArrowDown" && index !== values.length - 1) {
        setPointer(index + 1);
        e.preventDefault();
      }
    });
  };

  const removeArrowListener = (
    textarea: HTMLTextAreaElement,
    index: number
  ) => {
    textarea.removeEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" && index !== 0) {
        setPointer(index - 1);
        e.preventDefault();
      } else if (e.key === "ArrowDown" && index !== values.length - 1) {
        setPointer(index + 1);
        e.preventDefault();
      }
    });
  };

  const backspaceListener = (textarea: HTMLTextAreaElement, index: number) => {
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && values[index] === "") {
        setPointer(index - 1);
        setValues((prev) => prev.filter((_, i) => i !== index));
        e.preventDefault();
      }
    });
  };

  const removeBackspaceListener = (
    textarea: HTMLTextAreaElement,
    index: number
  ) => {
    textarea.removeEventListener("keydown", (e) => {
      if (e.key === "Backspace" && values[index] === "") {
        setPointer(index - 1);
        setValues((prev) => prev.filter((_, i) => i !== index));
        e.preventDefault();
      }
    });
  };

  useEffect(() => {
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach((textarea, index) =>
      attachEnterListener(textarea, index)
    );
    return () => {
      textareas.forEach((textarea, index) => {
        removeEnterListener(textarea, index);
      });
    };
  }, [values.length]);

  useEffect(() => {
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach((textarea, index) => addArrowListener(textarea, index));
    return () => {
      textareas.forEach((textarea, index) => {
        removeArrowListener(textarea, index);
      });
    };
  }, [values.length]);

  useEffect(() => {
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach((textarea, index) => backspaceListener(textarea, index));
    return () => {
      textareas.forEach((textarea, index) => {
        removeBackspaceListener(textarea, index);
      });
    };
  }, [values.length]);

  useEffect(() => {
    const textareas = document.querySelectorAll("textarea");
    textareas[pointer].focus();
  }, [pointer]);

  useEffect(() => {
    form.setValue(attribute, values.join("<br/>"));
  }, [values, attribute, form]);

  useEffect(() => {
    setValues((prev) => [
      ...prev.splice(0, prev.length - 1),
      form.watch(attribute),
    ]);
  }, [form.watch(attribute), attribute]);
  ``;
  return (
    <div className={classes.main}>
      <div className={clsx(classes.container, error && classes.errorInput)}>
        {image && (
          <div className={classes.image}>
            <Image layout="fill" src={image} alt={question} />
          </div>
        )}
        {values.map((value, index) => (
          <textarea
            key={index}
            className={classes.textarea}
            disabled={isDisabled}
            placeholder={question}
            rows={minRows}
            value={value}
            onChange={(e) => {
              setPointer(index);
              setValues((prev) => [
                ...prev.filter((_, i) => i !== index),
                e.target.value,
              ]);
            }}
          />
        ))}
        <div className={classes.preview}>
          {values.map((value) => (
            <ReactMarkdown key={value}>{value}</ReactMarkdown>
          ))}
        </div>
      </div>
    </div>
  );
};
