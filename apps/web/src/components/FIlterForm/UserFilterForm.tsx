"use client";
import classes from "./FilterForm.module.scss";
import { z } from "zod";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import SelectInput from "components/SelectInput";
import { County } from "@biosfera/types";
import { useCountyName } from "@/utility/hooks/useCountyName";
import { useTranslations } from "next-intl";
import {
  RELEVANCE,
  SearchLink,
  SortSelects,
  buildSearchQuery,
  refineSortPair,
} from "./shared";

interface Props {
  searchParams?: any;
}

// `sortPair` is the message for a direction without an attribute or the
// reverse.
const createSchema = (sortPair: string) =>
  z
    .object({
      location: z.optional(
        z.enum([
          "SPLITSKO_DALMATINSKA",
          "DUBROVACKO_NERETVANSKA",
          "SIBENSKO_KNINSKA",
          "ZADARSKA",
          "ZAGREBACKA",
          "KARLOVACKA",
          "VARAZDINSKA",
          "KOPRIVNICKO_KRIZEVACKA",
          "KRAPINSKO_ZAGORSKA",
          "MEDIMURSKA",
          "OSIJECKO_BARANJSKA",
          "POZESKO_SLAVONSKA",
          "PRIMORSKO_GORANSKA",
          "SISACKO_MOSLAVACKA",
          "VUKOVARSKO_SRIJEMSKA",
          "GRAD_ZAGREB",
          "BJELOVARSKO_BILOGORSKA",
          "BRODSKO_POSAVSKA",
          "ISTARSKA",
          "LICKO_SENJSKA",
          "VIROVITICKO_PODRAVSKA",
          "OTHER",
        ]),
      ),
      username: z.optional(z.string()),
      attribute: z.optional(
        z.enum(["name", "createdAt", "postAmount", "favourites"]),
      ),
      direction: z.optional(z.enum(["asc", "desc"])),
    })
    .refine(refineSortPair, sortPair);

const getDefaultValues = (searchParams?: any) =>
  ({
    username:
      searchParams?.username || searchParams?.name || searchParams?.title || "",
    location: searchParams?.location,
    attribute: searchParams?.attribute || RELEVANCE,
    direction: searchParams?.direction || "desc",
  }) as FieldValues;

export const UserFilter = ({ searchParams }: Props) => {
  const t = useTranslations("Filters");
  const countyName = useCountyName();
  const countyOptions = Object.values(County)
    .filter((county) => county.length > 2)
    .map((county) => ({
      label: countyName(county),
      value: county,
    }));
  const sortOptions = [
    { label: t("user.name"), value: "username" },
    { label: t("location"), value: "location" },
    { label: t("points"), value: "points" },
  ];
  const form = useForm({
    resolver: zodResolver(createSchema(t("sortPair"))),
    defaultValues: getDefaultValues(searchParams),
  });

  // Searching happens through the link below; submitting does nothing.
  const handleFilter = () => {};

  return (
    <div className={classes.container}>
      <form
        onSubmit={form.handleSubmit(handleFilter)}
        className={classes.filter}
      >
        <h2>{t("user.title")}</h2>
        <Input form={form} attribute="username" question={t("user.username")} />
        <SelectInput
          label={t("county")}
          name="location"
          options={countyOptions}
          form={form}
          error={form.formState.errors.location?.message?.toString()}
        />
        <SortSelects form={form} options={sortOptions} />
      </form>
      <SearchLink
        query={buildSearchQuery("user", form.watch(), ["location", "username"])}
      />
    </div>
  );
};
