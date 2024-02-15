"use client";
import {
  ExponatResponseShort,
  OrganisationResponseShort,
  PostResponse,
  ShortUserResponse,
} from "@biosfera/types";
import { ExponatCard } from "components/ExponatCard";
import classes from "./CardCollection.module.scss";
import MembershipCard from "components/MembershipCard";
import { PostCard } from "components/PostCard";
import placeholder from "assets/images/lion.svg";
import SelectInput from "components/SelectInput";
import { use, useEffect, useRef, useState } from "react";
import dArrow from "assets/images/d-arrow.svg";
import Image from "next/image";
import { set } from "react-hook-form";
import clsx from "clsx";
import { Indexable } from "@biosfera/types/src/jsonObjects";
import BaseButton from "components/BaseButton";

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
  ) &
    Indexable[];
  type: "exponat" | "post" | "user" | "organisation";
  sortBy: SortOption[];
  pageSize?: number;
}

export const CardCollection: React.FC<CardCollectionProps> = ({
  items,
  type,
  sortBy,
  pageSize,
}) => {
  const [sortByValue, setSortByValue] = useState<string>("");
  const [isDescending, setIsDescending] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(pageSize || 20);
  const list = useRef<HTMLDivElement>(null);

  const handleScroll = async () => {
    if (amount < items.length) {
      setAmount((prev) => prev + Math.min(pageSize || 20, items.length - prev));
    }
  };

  useEffect(() => {
    setSortByValue(sortBy[0].value);
  }, []);

  useEffect(() => {
    setAmount(pageSize || 20);
  }, [sortByValue, pageSize]);

  const handleChangeDirection = () => {
    setIsDescending((prev) => !prev);
  };

  useEffect(() => {
    const handleScrolling = () => {
      const { scrollTop, clientHeight, scrollHeight } =
        document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        handleScroll();
      }
    };
    window.addEventListener("scroll", handleScrolling);
    return () => window.removeEventListener("scroll", handleScrolling);
  });

  return (
    <div className={classes.container}>
      <div className={classes.sortSelect}>
        <div className={classes.section}>
          <span className={classes.sectionLabel}>Sortiraj po:</span>
          <select
            title="sortBy"
            className={classes.select}
            onChange={(e) => setSortByValue(e.target.value)}
          >
            {sortBy.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className={classes.section} ref={list}>
          <span className={classes.sectionLabel}>
            {!isDescending ? "Rastuće" : "Opadajuće"}
          </span>
          <button
            title="direkcija sortiranja"
            className={clsx(
              classes.direction,
              !isDescending && classes.descending
            )}
            onClick={handleChangeDirection}
          >
            <Image alt="strelica" src={dArrow} />
          </button>
        </div>
      </div>
      <div className={classes.cardContainer}>
        {items
          .toSorted((a, b) => {
            const first = isDescending ? b : a;
            const second = isDescending ? a : b;
            return isNaN(a[sortByValue]) && isNaN(b[sortByValue])
              ? first[sortByValue].localeCompare(second[sortByValue])
              : first[sortByValue] - second[sortByValue];
          })
          .slice(0, Math.min(amount, items.length))
          .map((item, index) => {
            switch (type) {
              case "exponat":
                return (
                  <ExponatCard
                    key={index}
                    exponat={item as ExponatResponseShort}
                  />
                );
              case "post":
                return <PostCard key={index} post={item as PostResponse} />;
              case "user":
                item = item as ShortUserResponse;
                return (
                  <MembershipCard
                    description={item.email}
                    type="user"
                    image={placeholder}
                    object={item as ShortUserResponse}
                    role={item.role as string}
                    name={item.username}
                    id={item.id}
                  />
                );
              case "organisation":
                item = item as OrganisationResponseShort;
                return (
                  <MembershipCard
                    description={item.location}
                    type="organisation"
                    image={item.mainImage}
                    object={item as OrganisationResponseShort}
                    role={item.role as string}
                    name={item.name}
                    id={item.id}
                  />
                );
            }
          })}
      </div>
      {amount === items.length && (
        <BaseButton
          text="Nazad na vrh"
          onClick={() =>
            list.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
        />
      )}
    </div>
  );
};
