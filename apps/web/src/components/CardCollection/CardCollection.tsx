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
import { useEffect, useRef, useState } from "react";
import dArrow from "assets/images/d-arrow.svg";
import Image from "next/image";
import clsx from "clsx";
import { Indexable } from "@biosfera/types/src/jsonObjects";
import BaseButton from "components/BaseButton";
import { useIsInView } from "@/utility/hooks/useIsInView";
import useUser from "@/utility/context/UserContext";

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
  const { memberships, user } = useUser();
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

  const listInView = useIsInView(list);

  useEffect(() => {
    const handleScrolling = () => {
      console.log(list.current?.getBoundingClientRect().y, listInView);
      const { scrollTop, clientHeight, scrollHeight } =
        document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        handleScroll();
      }
    };
    window.addEventListener("scroll", handleScrolling);
    return () => window.removeEventListener("scroll", handleScrolling);
  });

  const checkAdminMembership = (organisationId: string) => {
    return memberships.some(
      (membership) =>
        membership.id === organisationId &&
        (membership.role === "ADMIN" ||
          membership.role === "OWNER" ||
          user?.role === "super")
    );
  };

  const checkIsAuthor = (authorId: string) => {
    return authorId === user?.id;
  };

  const checkIsAdminForPost = (organisationId: string) => {
    return user?.role === "super" || checkAdminMembership(organisationId);
  };

  return items.length > 0 ? (
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
              ? first[sortByValue]?.localeCompare(second[sortByValue])
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
                    isAdmin={checkAdminMembership(
                      (item as ExponatResponseShort).organizationId
                    )}
                  />
                );
              case "post":
                return (
                  <PostCard
                    key={index}
                    post={item as PostResponse}
                    isAdmin={checkIsAdminForPost(
                      (item as PostResponse).organisationId
                    )}
                    isUser={checkIsAuthor((item as PostResponse).authorId)}
                  />
                );
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

      <div
        className={clsx(
          classes.floatingButton,
          amount > (pageSize || 20) && !listInView ? classes.show : classes.hide
        )}
      >
        <div
          className={classes.image}
          onClick={() =>
            list.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
        >
          <Image src={dArrow} alt="back to top arrow" />
        </div>
      </div>
    </div>
  ) : (
    <div className={classes.noResults} ref={list}>
      <h1>Nema rezultata</h1>
    </div>
  );
};
