import { InputResult } from "@/shared/enums";
import { FieldValues, UseFormReturn } from "react-hook-form";
import classes from "./SelectInput.module.scss";

export interface Option {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  name: string;
  options: Option[];
  form: UseFormReturn<FieldValues>;
  isDisabled?: boolean;
  status?: InputResult;
}

export const SelectInput = ({
  label,
  name,
  options,
  form,
  isDisabled,
  status = InputResult.DEFAULT,
}: SelectProps) => {
  const { register } = form;
  return (
    <div className={classes.container}>
      <select
        {...register(name)}
        className={classes.select}
        disabled={isDisabled}
        placeholder={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {status !== InputResult.DEFAULT && (
        <div className={classes[status]}>
          <span>
            {status === InputResult.ERROR
              ? "Opcija nije odabrana"
              : "Opcija odabrana"}
          </span>
        </div>
      )}
    </div>
  );
};
