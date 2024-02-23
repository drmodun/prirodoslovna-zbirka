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
import { getPfpUrl } from "@/utility/static/getPfpUrl";

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
  type:
    | "exponat"
    | "post"
    | "user"
    | "organisation"
    | "user-member"
    | "organisation-member";
  sortBy: SortOption[];
  organisationId?: string;
  userId?: string;
  pageSize?: number;
}

export const CardCollection: React.FC<CardCollectionProps> = ({
  items,
  type,
  userId,
  sortBy,
  organisationId,
  pageSize,
}) => {
  const [sortByValue, setSortByValue] = useState<string>("");
  const [isDescending, setIsDescending] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(pageSize || 20);
  const { memberships, user } = useUser();
  const [itemsToShow, setItemsToShow] = useState<Indexable[]>(items);
  const list = useRef<HTMLDivElement>(null);

  const handleDelete = (id: string) => {
    setItemsToShow((prev) => prev.filter((item) => item.id !== id));
  };

  const handleScroll = async () => {
    if (amount < items.length) {
      setAmount((prev) => prev + Math.min(pageSize || 20, items.length - prev));
    }
  };

  useEffect(() => {
    setSortByValue(sortBy[0].value);
  }, []);

  useEffect(() => {
    setItemsToShow(items);
  }, [items]);

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

  return itemsToShow.length > 0 ? (
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
        {itemsToShow
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
                    onRemove={handleDelete}
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
                    onRemove={handleDelete}
                    isUser={checkIsAuthor((item as PostResponse).authorId)}
                  />
                );
              case "user-member":
                item = item as ShortUserResponse;
                return (
                  <MembershipCard
                    description={item.email}
                    type="user"
                    image={getPfpUrl(item.id)}
                    object={item as ShortUserResponse}
                    role={item.role as string}
                    isUser={checkIsAuthor(item.id)}
                    onRemove={handleDelete}
                    organisationId={organisationId}
                    isAdmin={
                      user?.role === "super" ||
                      checkAdminMembership(organisationId!)
                    }
                    name={item.username}
                    id={item.id}
                  />
                );
              case "user":
                item = item as ShortUserResponse;
                return (
                  <MembershipCard
                    description={item.email}
                    type="user"
                    image={item.hasProfileImage && getPfpUrl(item.id)}
                    object={item as ShortUserResponse}
                    role={item.location}
                    isUser={checkIsAuthor(item.id)}
                    onRemove={handleDelete}
                    organisationId={organisationId}
                    isAdmin={
                      user?.role === "super" ||
                      checkAdminMembership(organisationId!)
                    }
                    name={item.username}
                    id={item.id}
                  />
                );
              case "organisation-member":
                item = item as OrganisationResponseShort;
                return (
                  <MembershipCard
                    description={item.location}
                    type="organisation"
                    image={item.mainImage}
                    object={item as OrganisationResponseShort}
                    role={item.role as string}
                    name={item.name}
                    onRemove={handleDelete}
                    id={item.id}
                    organisationId={item.id}
                    isAdmin={checkAdminMembership(item.id)}
                    isUser={checkIsAuthor(userId!)}
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
