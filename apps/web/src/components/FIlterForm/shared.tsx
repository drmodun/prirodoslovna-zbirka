import Link from "next/link";
import { FieldValues, UseFormReturn } from "react-hook-form";
import BaseButton from "components/BaseButton";
import SelectInput from "components/SelectInput";
import classes from "./FilterForm.module.scss";

interface Option {
  label: string;
  value: string;
}

// Default "sort by" choice: results come back in the API's own order.
export const RELEVANCE = "Relevantnost";

export const sortPairMessage =
  "Smjer i atribut samo mogu biti oboje odabrani ili oboje prazni";

// zod refinement for the attribute/direction pair.
export const refineSortPair = (data: {
  attribute?: string;
  direction?: string;
}) => {
  if (data.direction && !data.attribute) {
    return false;
  }
  if (data.attribute && !data.direction) {
    return false;
  }
  return true;
};

// Query for the /search link: the filled-in fields, plus the sort pair unless
// sorting by relevance. `rename` maps a form field to its URL parameter.
export const buildSearchQuery = (
  kind: string,
  values: FieldValues,
  fields: readonly string[],
  rename: Record<string, string> = {},
) => {
  const query: Record<string, string> = { kind };

  for (const field of fields) {
    if (values[field]) query[rename[field] ?? field] = values[field];
  }

  if (values.attribute !== RELEVANCE) {
    if (values.attribute) query.attribute = values.attribute;
    if (values.direction) query.direction = values.direction;
  }

  return query;
};

interface SortSelectsProps {
  form: UseFormReturn<FieldValues>;
  options: Option[];
}

export const SortSelects = ({ form, options }: SortSelectsProps) => (
  <>
    <SelectInput
      name="attribute"
      label="Sortiraj po"
      form={form}
      options={[{ label: RELEVANCE, value: RELEVANCE }, ...options]}
      error={form.formState.errors.attribute?.message?.toString()}
    />
    <SelectInput
      name="direction"
      label="Smjer"
      form={form}
      options={[
        { label: "Uzlazno", value: "asc" },
        { label: "Silazno", value: "desc" },
      ]}
      error={form.formState.errors.direction?.message?.toString()}
    />
  </>
);

export const SearchLink = ({ query }: { query: Record<string, string> }) => (
  <Link className={classes.button} href={{ pathname: "/search", query }}>
    <BaseButton text="Pretraži" />
  </Link>
);
