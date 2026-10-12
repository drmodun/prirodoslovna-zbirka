import { UseFormReturn } from "react-hook-form";

export interface CheckboxInputProps {
  question: string;
  initValue: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

import classes from "./CheckboxInput.module.scss";

export const CheckboxInput = ({
  question,
  initValue,
  onChange,
}: CheckboxInputProps) => {
  return (
    <div className={classes.container}>
      <label htmlFor={question} className={classes.checkboxText}>
        {question}
      </label>
      <input
        type="checkbox"
        id={question}
        value={initValue}
        onChange={onChange}
        className={classes.input}
      />
    </div>
  );
};
