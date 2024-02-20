import { ExponatResponseShort } from "@biosfera/types";
import classes from "./ExponatCard.module.scss";
import Image from "next/image";
import favouriteDrop from "assets/images/favourite-drop.svg";
import Link from "next/link";
import clsx from "clsx";
import { stringCapitaliser } from "@/utility/static/stringCapitaliser";
import { FavouriteButton } from "components/FavouriteButton/FavouriteButton";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import RemoveExponatButton from "components/RemoveExponatButton";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";

export interface ExponatCardProps {
  exponat: ExponatResponseShort;
  isAdmin?: boolean;
}

//TODO: funcionality of like to be added after backend implementation and user context

export const ExponatCard = ({ exponat, isAdmin }: ExponatCardProps) => (
  <div className={classes.container}>
    <div className={classes.image}>
      <Image src={exponat.mainImage} alt={exponat.name} layout="fill" />
    </div>
    {isAdmin ? (
      <QueryClientWrapper>
        <RemoveExponatButton exponatId={exponat.id} />
      </QueryClientWrapper>
    ) : null}
    <Link
      href={`/organisation/${exponat.organizationId}`}
      className={classes.organisation}
    >
      by {exponat.organizationName}
    </Link>
    <div className={classes.text}>
      <Link href={`/exponat/${exponat.id}`}>
        <span className={classes.name}>{exponat.name}</span>
      </Link>
      <span className={classes.alternateName}>{exponat.alternateName}</span>
    </div>
    <div className={classes.stats}>
      <span className={classes.favourites}>
        <div className={classes.favouriteDrop}>
          <Image src={favouriteDrop} alt="broj favorita" layout="fill" />
        </div>
        {exponat.favouriteCount}
      </span>
      <div
        className={clsx(
          classes.kind,
          classes[exponat.exponatKind.toLowerCase()]
        )}
      >
        {stringCapitaliser(exponat.exponatKind)}
      </div>
    </div>
    <div className={classes.buttons}>
      <Link href={`/exponat/${exponat.id}`} className={classes.button}>
        Pogledaj eksponat
      </Link>
      <UserWrapper>
        <FavouriteButton exponat={exponat} />
      </UserWrapper>
    </div>
  </div>
);
