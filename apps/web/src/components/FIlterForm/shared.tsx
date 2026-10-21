import Link from "next/link";
import { FieldValues, UseFormReturn } from "react-hook-form";
import BaseButton from "components/BaseButton";
import SelectInput from "components/SelectInput";
import classes from "./FilterForm.module.scss";
import { useTranslations } from "next-intl";

interface Option {
  label: string;
  value: string;
}

// Default "sort by" choice: results come back in the API's own order. Only
// a form value; the label comes from the Filters messages.
export const RELEVANCE = "Relevantnost";

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

export const SortSelects = ({ form, options }: SortSelectsProps) => {
  const t = useTranslations("Filters");

  return (
    <>
      <SelectInput
        name="attribute"
        label={t("sortBy")}
        form={form}
        options={[{ label: t("relevance"), value: RELEVANCE }, ...options]}
        error={form.formState.errors.attribute?.message?.toString()}
      />
      <SelectInput
        name="direction"
        label={t("direction")}
        form={form}
        options={[
          { label: t("ascending"), value: "asc" },
          { label: t("descending"), value: "desc" },
        ]}
        error={form.formState.errors.direction?.message?.toString()}
      />
    </>
  );
};

export const SearchLink = ({ query }: { query: Record<string, string> }) => {
  const t = useTranslations("Filters");

  return (
    <Link className={classes.button} href={{ pathname: "/search", query }}>
      <BaseButton text={t("search")} />
    </Link>
  );
};
