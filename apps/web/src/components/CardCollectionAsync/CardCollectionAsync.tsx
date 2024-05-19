"use client";
import {
  ExponatResponseShort,
  OrganisationResponseShort,
  PostResponse,
  ShortUserResponse,
  WorkResponseShort,
} from "@biosfera/types";
import { ExponatCard } from "components/ExponatCard";
import classes from "./CardCollectionAsync.module.scss";
import MembershipCard from "components/MembershipCard";
import { PostCard } from "components/PostCard";
import { useEffect, useRef, useState } from "react";
import dArrow from "assets/images/d-arrow.svg";
import Image from "next/image";
import clsx from "clsx";
import { Indexable } from "@biosfera/types/src/jsonObjects";
import { useIsInView } from "@/utility/hooks/useIsInView";
import useUser from "@/utility/context/UserContext";
import { getPfpUrl } from "@/utility/static/getPfpUrl";
import OrganisationCard from "components/OrganisationCard";
import WorkCard from "components/WorkCard";

export interface CardCollectionAsyncProps {
  items: (
    | ExponatResponseShort[]
    | PostResponse[]
    | ShortUserResponse[]
    | OrganisationResponseShort[]
    | WorkResponseShort[]
  ) &
    Indexable[];
  type: "exponat" | "post" | "user" | "organisation" | "work" | "literature";
  page: number;
  isLoading?: boolean;
  getMore: (query?: any, page?: number) => Promise<any> | (() => void);
  params: any;
  isDiscover?: boolean;
  onError?: () => void;
  replaceFirst?: boolean;
}

export const CardCollectionAsync: React.FC<CardCollectionAsyncProps> = ({
  items,
  getMore,
  isLoading = false,
  page = 1,
  type,
  isDiscover,
  params,
  onError,
}) => {
  const { memberships, user } = useUser();
  const [itemsToShow, setItemsToShow] = useState<Indexable[]>(items);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [loading, setLoading] = useState<boolean>(isLoading);
  const list = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState<boolean>(false);

  const handleDelete = (id: string) => {
    setItemsToShow((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const handleScroll = async () => {
    try {
      console.log("handleScroll", items);
      if (!loading && !failed) {
        setLoading(true);
        setCurrentPage((prev) => prev + 1);
        const items = isDiscover
          ? getMore()
          : await getMore(params, currentPage);
        items &&
          items.filter &&
          setItemsToShow((prev) => [
            ...prev,
            ...items?.filter(
              (item: Indexable) =>
                !prev.some((prevItem) => prevItem.id === item.id)
            ),
          ]);
        setLoading(false);
      }
    } catch (e) {
      setFailed(true);
    }
  };

  useEffect(() => {
    failed && onError && onError();
  }, [failed]);

  useEffect(() => {
    setItemsToShow(items);
    setCurrentPage(page || 2);
    setLoading(false);
    setFailed(false);
  }, [page, type, items]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  const listInView = useIsInView(list);

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

  const checkAdminMembership = (organisationId: string) => {
    return (
      user?.role?.toLowerCase() === "super" ||
      memberships.some(
        (membership) =>
          membership.id === organisationId &&
          (membership.role === "ADMIN" || membership.role === "OWNER")
      )
    );
  };
  const checkIsAuthor = (authorId: string) => {
    return authorId === user?.id;
  };

  const checkIsAdminForPost = (organisationId: string) => {
    return (
      user?.role?.toLowerCase() === "super" ||
      checkAdminMembership(organisationId)
    );
  };

  return list && itemsToShow?.length > 0 ? (
    <div className={classes.container}>
      <div className={classes.section} ref={list}></div>
      <div className={classes.cardContainer}>
        {itemsToShow?.map((item, index) => {
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
                  isFollowCard
                  isAdmin={user?.role?.toLowerCase() === "super"}
                  name={item.username}
                  id={item.id}
                />
              );
            case "organisation":
              return (
                <OrganisationCard
                  organisation={item as OrganisationResponseShort}
                />
              );
            case "work":
              return (
                <WorkCard
                  work={item as WorkResponseShort}
                  isAdmin={checkIsAdminForPost(
                    (item as WorkResponseShort).organisationId
                  )}
                />
              );
            case "literature":
              return <WorkCard work={item as WorkResponseShort} />;
          }
        })}
      </div>

      <div
        className={clsx(
          classes.floatingButton,
          currentPage > 1 && !listInView ? classes.show : classes.hide
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
      {!failed && loading && (
        <div className={classes.spinnerContainer}>
          <div className={classes.spinner}></div>
        </div>
      )}
    </div>
  ) : (
    <div className={classes.noResults} ref={list}>
      <h1>Nema rezultata</h1>
    </div>
  );
};
