"use client";
import Image from "next/image";
import classes from "./FavouriteButton.module.scss";
import favouriteDrop from "assets/images/favourite-drop.svg";
import { useGetMe } from "@/api/useGetMe";
import useUser from "@/utility/context/UserContext";
import clsx from "clsx";
import { useToggleFavourite } from "@/api/useToggleFavourite";
import { useEffect, useState } from "react";
import { ExponatResponseShort } from "@biosfera/types";
import { useTranslations } from "next-intl";

export interface FavouriteButtonProps {
  exponat: ExponatResponseShort;
}

export const FavouriteButton = ({ exponat }: FavouriteButtonProps) => {
  const t = useTranslations("FavouriteButton");
  const { favouriteExponats, updateFavourites, loading } = useUser();
  const { mutateAsync } = useToggleFavourite();

  const [isFavourite, setIsFavourite] = useState(
    favouriteExponats.find((x) => x.id === exponat.id) != null,
  );

  useEffect(() => {
    setIsFavourite(favouriteExponats.find((x) => x.id === exponat.id) != null);
  }, [favouriteExponats, loading, exponat.id]);

  const toggleFavourite = async () => {
    await mutateAsync(exponat.id);
    updateFavourites(exponat);
    setIsFavourite((prev) => !prev);
  };

  return (
    !loading && (
      <button
        className={clsx(classes.drop, isFavourite && classes.favourite)}
        title={t("label")}
        onClick={toggleFavourite}
      >
        <div className={classes.favouriteDrop}>
          <Image src={favouriteDrop} alt={t("label")} layout="fill" />
        </div>
      </button>
    )
  );
};
