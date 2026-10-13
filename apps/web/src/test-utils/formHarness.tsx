import React from "react";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";

/** Renders `children(form)` inside a real react-hook-form instance and exposes it. */
export const FormHarness = ({
  children,
  onForm,
  defaultValues,
}: {
  children: (form: UseFormReturn<FieldValues>) => React.ReactNode;
  onForm?: (form: UseFormReturn<FieldValues>) => void;
  defaultValues?: FieldValues;
}) => {
  const form = useForm({ defaultValues });
  onForm?.(form);
  return <>{children(form)}</>;
};
