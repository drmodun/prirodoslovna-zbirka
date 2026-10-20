"use client";
import {
  ExponatResponseShort,
  OrganisationResponseShort,
  PostResponse,
  ShortUserResponse,
  WorkResponseShort,
} from "@biosfera/types";
import classes from "./CardCollection.module.scss";
import { useEffect, useRef, useState } from "react";
import dArrow from "assets/images/d-arrow.svg";
import Image from "next/image";
import clsx from "clsx";
import { Indexable } from "@biosfera/types/src/jsonObjects";
import { useIsInView } from "@/utility/hooks/useIsInView";
import { useOnScrollToBottom } from "@/utility/hooks/useOnScrollToBottom";
import { BackToTopButton } from "./BackToTopButton";
import { CollectionCard } from "./CollectionCard";
import { useCardPermissions } from "./useCardPermissions";

const DEFAULT_PAGE_SIZE = 20;

export interface SortOption {
  label: string;
  value: string;
}

export interface CardCollectionProps {
  items: (
    | ExponatResponseShort[]
    | PostResponse[]
    | ShortUserResponse[]
    | OrganisationResponseShort[]
    | WorkResponseShort[]
  ) &
    Indexable[];
  type:
    | "exponat"
    | "post"
    | "user"
    | "organisation"
    | "user-member"
    | "organisation-member"
    | "work";
  sortBy: SortOption[];
  organisationId?: string;
  userId?: string;
  pageSize?: number;
}

// Numeric fields sort by value, everything else alphabetically.
const compareBy =
  (attribute: string, isDescending: boolean) =>
  (a: Indexable, b: Indexable) => {
    const first = isDescending ? b : a;
    const second = isDescending ? a : b;
    return isNaN(b[attribute])
      ? first[attribute]
          ?.toString()
          ?.localeCompare(second[attribute]?.toString())
      : first[attribute] - second[attribute];
  };

interface SortControlsProps {
  sortBy: SortOption[];
  isDescending: boolean;
  onSortBy: (value: string) => void;
  onToggleDirection: () => void;
  anchor: React.RefObject<HTMLDivElement>;
}

const SortControls = ({
  sortBy,
  isDescending,
  onSortBy,
  onToggleDirection,
  anchor,
}: SortControlsProps) => (
  <div className={classes.sortSelect}>
    <div className={classes.section}>
      <span className={classes.sectionLabel}>Sortiraj po:</span>
      <select
        title="sortBy"
        className={classes.select}
        onChange={(e) => onSortBy(e.target.value)}
      >
        {sortBy.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
    <div className={classes.section} ref={anchor}>
      <span className={classes.sectionLabel}>
        {!isDescending ? "Rastuće" : "Opadajuće"}
      </span>
      <button
        title="direkcija sortiranja"
        className={clsx(classes.direction, !isDescending && classes.descending)}
        onClick={onToggleDirection}
      >
        <Image alt="strelica" src={dArrow} />
      </button>
    </div>
  </div>
);

export const CardCollection: React.FC<CardCollectionProps> = ({
  items,
  type,
  userId,
  sortBy,
  organisationId,
  pageSize,
}) => {
  const size = pageSize || DEFAULT_PAGE_SIZE;
  const [sortByValue, setSortByValue] = useState<string>("");
  const [isDescending, setIsDescending] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(size);
  const [itemsToShow, setItemsToShow] = useState<Indexable[]>(items);
  const list = useRef<HTMLDivElement>(null);
  const permissions = useCardPermissions();

  const handleDelete = (id: string) => {
    if (!id) return;
    setItemsToShow((prev) => prev.filter((item) => item.id !== id));
  };

  const showMore = () => {
    if (amount <= items.length) {
      setAmount(
        (prev) => prev + Math.max(Math.min(size, items.length - prev), 0),
      );
    }
  };

  useEffect(() => {
    setSortByValue(sortBy[0].value);
  }, []);

  useEffect(() => {
    setItemsToShow(items);
  }, [items]);

  useEffect(() => {
    setAmount(pageSize || DEFAULT_PAGE_SIZE);
  }, [sortByValue, pageSize]);

  const listInView = useIsInView(list);
  useOnScrollToBottom(showMore);

  if (itemsToShow.length === 0)
    return (
      <div className={classes.noResults} ref={list}>
        <h1>Nema rezultata</h1>
      </div>
    );

  return (
    <div className={classes.container}>
      <SortControls
        sortBy={sortBy}
        isDescending={isDescending}
        onSortBy={setSortByValue}
        onToggleDirection={() => setIsDescending((prev) => !prev)}
        anchor={list}
      />
      <div className={classes.cardContainer}>
        {[...itemsToShow]
          .sort(compareBy(sortByValue, isDescending))
          .slice(0, Math.min(amount, items.length))
          .map((item, index) => (
            <CollectionCard
              key={index}
              type={type}
              item={item}
              permissions={permissions}
              onRemove={handleDelete}
              onRemoveWork={handleDelete}
              organisationId={organisationId}
              userId={userId}
            />
          ))}
      </div>

      <BackToTopButton
        classes={classes}
        visible={amount > size && !listInView}
        target={list}
      />
    </div>
  );
};
