"use client";
import classes from "./FilterForm.module.scss";
import { z } from "zod";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import SelectInput from "components/SelectInput";
import { County } from "@biosfera/types";
import { makeCountyName } from "@/utility/static/countyNameMaker";
import {
  RELEVANCE,
  SearchLink,
  SortSelects,
  buildSearchQuery,
  refineSortPair,
  sortPairMessage,
} from "./shared";

interface Props {
  searchParams?: any;
}

const schema = z
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
  .refine(refineSortPair, sortPairMessage);

const countyOptions = Object.values(County)
  .filter((county) => county.length > 2)
  .map((county) => ({
    label: makeCountyName(county),
    value: county,
  }));

const sortOptions = [
  { label: "Ime", value: "username" },
  { label: "Lokacija", value: "location" },
  { label: "Bodovi", value: "points" },
];

const getDefaultValues = (searchParams?: any) =>
  ({
    username:
      searchParams?.username || searchParams?.name || searchParams?.title || "",
    location: searchParams?.location,
    attribute: searchParams?.attribute || RELEVANCE,
    direction: searchParams?.direction || "desc",
  }) as FieldValues;

export const UserFilter = ({ searchParams }: Props) => {
  const form = useForm({
    resolver: zodResolver(schema),
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
        <h2>Filter korisnika</h2>
        <Input form={form} attribute="username" question="Korisničko ime" />
        <SelectInput
          label="Županija"
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
