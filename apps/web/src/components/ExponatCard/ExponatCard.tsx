import { ExponatResponseShort } from "@biosfera/types";
import classes from "./ExponatCard.module.scss";
import Image from "next/image";
import favouriteDrop from "assets/images/favourite-drop.svg";
import Link from "next/link";
import clsx from "clsx";
import { stringCapitaliser } from "@/utility/static/stringCapitaliser";

export interface ExponatCardProps {
  exponat: ExponatResponseShort;
}

export const ExponatCard = ({ exponat }: ExponatCardProps) => {
  <div className={classes.container}>
    <div className={classes.image}>
      <Image src={exponat.mainImage} alt={exponat.name} />
    </div>
    <div className={classes.text}>
      <Link href={`/exponat/${exponat.id}`}>
        <span className={classes.name}>{exponat.name}</span>
      </Link>
      <span className={classes.alternateName}>{exponat.alternateName}</span>
    </div>
    <div className={classes.stats}>
      <span className={classes.favourites}>
        <Image src={favouriteDrop} alt="broj favorita" />
        {exponat.favouriteCount}
        <div
          className={clsx(
            classes.kind,
            classes[exponat.exponatKind.toLowerCase()]
          )}
        >
          {stringCapitaliser(exponat.exponatKind)}
        </div>
      </span>
      <div className={classes.buttons}>
        <Link href={`/exponat/${exponat.id}`} className={classes.button}></Link>
        <button
          className={classes.drop}
          title="dodaj u favorite (funkcionalnost dodana nakon user konteksta)"
        >
          <Image
            className={clsx(classes.favouriteDrop)}
            src={favouriteDrop}
            alt="broj favorita"
          />
        </button>
      </div>
    </div>
  </div>;
};
