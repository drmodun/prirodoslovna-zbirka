import { InputResult } from "@/shared/enums";
import { FieldValues, UseFormReturn } from "react-hook-form";
import classes from "./SelectInput.module.scss";
import ErrorText from "components/Error";

export interface Option {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  name: string;
  options: Option[];
  form: UseFormReturn<FieldValues>;
  isDisabled?: boolean;
  error?: string;
}

export const SelectInput = ({
  label,
  name,
  options,
  form,
  isDisabled,
  error,
}: SelectProps) => {
  const { register } = form;
  return (
    <div className={classes.main}>
      <div className={classes.container}>
        <select
          {...register(name)}
          className={classes.select}
          disabled={isDisabled}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <ErrorText message={error} />
    </div>
  );
};
