"use client";
import styles from "./FilterForm.module.scss";
import { z } from "zod";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import Dropdown from "components/Dropdown";
import { useGetTaxonomyEntities } from "@/api/useGetTaxonomyEntities";
import { SpeciesResponse } from "@biosfera/types";
import {
  RELEVANCE,
  SearchLink,
  SortSelects,
  buildSearchQuery,
  refineSortPair,
} from "./shared";
import { useTranslations } from "next-intl";

interface Props {
  searchParams?: any;
}

// Broadest to narrowest. Picking a rank clears every rank after it.
const TAXONOMY_RANKS = [
  { rank: "kingdom" },
  { rank: "phylum" },
  { rank: "class" },
  { rank: "order" },
  { rank: "genus" },
  { rank: "family" },
  { rank: "species" },
] as const;

type Rank = (typeof TAXONOMY_RANKS)[number]["rank"];

// `sortPair` is the message for a direction without an attribute or the
// reverse.
const createSchema = (sortPair: string) =>
  z
    .object({
      name: z.optional(z.string()),
      alternateName: z.optional(z.string()),
      kingdom: z.optional(z.string()),
      phylum: z.optional(z.string()),
      class: z.optional(z.string()),
      order: z.optional(z.string()),
      genus: z.optional(z.string()),
      family: z.optional(z.string()),
      species: z.optional(z.string()),
      attribute: z.optional(
        z.enum(["name", "createdAt", "postAmount", "favourites"]),
      ),
      direction: z.optional(z.enum(["asc", "desc"])),
    })
    .refine(refineSortPair, sortPair);

const SORT_ATTRIBUTES = [
  ["name", "title"],
  ["createdAt", "createdAt"],
  ["postAmount", "postAmount"],
  ["favourites", "favourites"],
] as const;

const QUERY_FIELDS = [
  "name",
  "alternateName",
  ...TAXONOMY_RANKS.map(({ rank }) => rank),
];

const getDefaultValues = (searchParams?: any) =>
  ({
    name: searchParams?.name || searchParams?.title || "",
    alternateName: searchParams?.search || "",
    attribute: searchParams?.attribute || RELEVANCE,
    direction: searchParams?.direction || "desc",
    ...Object.fromEntries(
      TAXONOMY_RANKS.map(({ rank }) => [rank, searchParams?.[rank] || ""]),
    ),
  }) as FieldValues;

const nubKeyOf = (entities: SpeciesResponse[] | undefined, name: string) =>
  entities?.find((entity) => entity.scientificName === name)?.nubKey;

const toOptions = (entities?: SpeciesResponse[]) =>
  entities?.map((entity) => ({
    label: entity.scientificName,
    value: entity.scientificName,
  })) || [];

// GBIF suggestions for every rank, narrowed by the selected parent where the
// GBIF classification is reliable enough to do so.
const useTaxonomyEntities = (
  values: FieldValues,
): Record<Rank, SpeciesResponse[] | undefined> => {
  const { data: kingdom } = useGetTaxonomyEntities(values.kingdom, "KINGDOM");
  const { data: phylum } = useGetTaxonomyEntities(
    values.phylum,
    "PHYLUM",
    nubKeyOf(kingdom, values.kingdom),
  );
  const { data: class_ } = useGetTaxonomyEntities(values.class, "CLASS");
  const { data: order } = useGetTaxonomyEntities(values.order, "ORDER");
  const { data: genus } = useGetTaxonomyEntities(values.genus, "GENUS");
  //GBIF sources do not seem to have all full classifications, so families are not narrowed by phylum: less efficient but more reliable
  //TODO: check if this can be fixed
  const { data: family } = useGetTaxonomyEntities(values.family, "FAMILY");
  const { data: species } = useGetTaxonomyEntities(
    values.species,
    "SPECIES",
    nubKeyOf(family, values.family),
  );

  return { kingdom, phylum, class: class_, order, genus, family, species };
};

export const ExponatFilter = ({ searchParams }: Props) => {
  const t = useTranslations("Filters");
  const sortOptions = SORT_ATTRIBUTES.map(([value, label]) => ({
    value,
    label: t(label),
  }));
  const form = useForm({
    resolver: zodResolver(createSchema(t("sortPair"))),
    defaultValues: getDefaultValues(searchParams),
  });
  const values = form.watch();
  const entities = useTaxonomyEntities(values);

  const selectRank = (index: number, value: string) => {
    form.setValue(TAXONOMY_RANKS[index].rank, value);
    TAXONOMY_RANKS.slice(index + 1).forEach(({ rank }) =>
      form.setValue(rank, ""),
    );
  };

  //add better ways to filtrate
  // Searching happens through the link below; submitting does nothing.
  const handleFilter = () => {};

  return (
    <div className={styles.container}>
      <form
        onSubmit={form.handleSubmit(handleFilter)}
        className={styles.filter}
      >
        <h2>{t("exponat.title")}</h2>
        <Input form={form} attribute="name" question={t("name")} />
        <Input
          form={form}
          attribute="alternateName"
          question={t("exponat.alternateName")}
          error={form.formState.errors.alternateName?.message?.toString()}
        />
        <SortSelects form={form} options={sortOptions} />
        {TAXONOMY_RANKS.map(({ rank }, index) => (
          <Dropdown
            key={rank}
            attribute={rank}
            form={form}
            options={toOptions(entities[rank])}
            initSelected={rank === "kingdom" ? values.kingdom : undefined}
            initPlaceholder={t(`exponat.ranks.${rank}`)}
            onSelect={(value) => selectRank(index, value)}
          />
        ))}
      </form>
      <SearchLink
        query={buildSearchQuery("exponat", values, QUERY_FIELDS, {
          alternateName: "search",
        })}
      />
    </div>
  );
};
