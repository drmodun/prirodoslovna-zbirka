"use client";
import {
  ExponatResponseShort,
  OrganisationResponseShort,
  PostResponse,
  ShortUserResponse,
  WorkResponseShort,
} from "@biosfera/types";
import classes from "./CardCollectionAsync.module.scss";
import { useEffect, useRef, useState } from "react";
import { Indexable } from "@biosfera/types/src/jsonObjects";
import { useIsInView } from "@/utility/hooks/useIsInView";
import { useOnScrollToBottom } from "@/utility/hooks/useOnScrollToBottom";
import { BackToTopButton } from "components/CardCollection/BackToTopButton";
import { CollectionCard } from "components/CardCollection/CollectionCard";
import { useCardPermissions } from "components/CardCollection/useCardPermissions";

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

const appendNew = (previous: Indexable[], incoming: Indexable[]) => [
  ...previous,
  ...incoming.filter(
    (item) => !previous.some((prevItem) => prevItem.id === item.id),
  ),
];

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
  const [itemsToShow, setItemsToShow] = useState<Indexable[]>(items);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [loading, setLoading] = useState<boolean>(isLoading);
  const list = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState<boolean>(false);
  const permissions = useCardPermissions();

  const handleDelete = (id: string) => {
    setItemsToShow((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const loadMore = async () => {
    if (loading || failed) return;
    try {
      setLoading(true);
      setCurrentPage((prev) => prev + 1);
      const more = isDiscover ? getMore() : await getMore(params, currentPage);
      if (more?.filter) setItemsToShow((prev) => appendNew(prev, more));
      setLoading(false);
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
    setLoading(isLoading);
    setFailed(false);
  }, [page, type, items]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  const listInView = useIsInView(list);
  useOnScrollToBottom(loadMore);

  if (!(itemsToShow?.length > 0))
    return (
      <div className={classes.noResults} ref={list}>
        <h1>Nema rezultata</h1>
      </div>
    );

  return (
    <div className={classes.container}>
      <div className={classes.section} ref={list}></div>
      <div className={classes.cardContainer}>
        {itemsToShow.map((item, index) => (
          <CollectionCard
            key={index}
            type={type}
            item={item}
            permissions={permissions}
            onRemove={handleDelete}
          />
        ))}
      </div>

      <BackToTopButton
        classes={classes}
        visible={currentPage > 1 && !listInView}
        target={list}
      />
      {!failed && loading && (
        <div className={classes.spinnerContainer}>
          <div className={classes.spinner}></div>
        </div>
      )}
    </div>
  );
};
