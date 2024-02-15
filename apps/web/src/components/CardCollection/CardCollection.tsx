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
  const [isAscending, setIsAscending] = useState<boolean>(true);
  const [amount, setAmount] = useState<number>(pageSize || 20);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const list = useRef<HTMLDivElement>(null);

  const handleScroll = async () => {
    const { scrollTop, clientHeight, scrollHeight } = list.current!;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setIsLoading(true);
      setTimeout(() => {
        setAmount((prev) => prev + 20);
        setIsLoading(false);
      }, 200);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  useEffect(() => {
    setSortByValue(sortBy[0].value);
  }, []);

  useEffect(() => {
    setAmount(pageSize || 20);
  }, [sortByValue, pageSize]);

  const handleChangeDirection = () => {
    setIsAscending((prev) => !prev);
  };

  return (
    <div className={classes.container}>
      <div className={classes.sortSelect}>
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
        <button
          title="direkcija sortiranja"
          className={clsx(
            classes.direction,
            !isAscending && classes.descending
          )}
          onChange={handleChangeDirection}
        >
          <Image alt="strelica" src={dArrow} />
        </button>
      </div>
      <div className={classes.cardContainer} ref={list}>
        {items
          .toSorted((a, b) =>
            isAscending
              ? a[sortByValue] - b[sortByValue]
              : b[sortByValue] - a[sortByValue]
          )
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
      <div className={classes.loading}>
        {isLoading && <span>Učitavanje...</span>}
      </div>
    </div>
  );
};
