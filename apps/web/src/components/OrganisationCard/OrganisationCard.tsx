import {
  ExtendedOrganisationResponse,
  OrganisationResponseShort,
} from "@biosfera/types";
import classes from "./OrganisationCard.module.scss";
import Image from "next/image";
import desc from "assets/images/desc.svg";
import favouriteDrop from "assets/images/favourite-drop.svg";
import userDark from "assets/images/user-dark.svg";
import Link from "next/link";
import { makeCountyName } from "@/utility/static/countyNameMaker";

export interface OrganisationCardProps {
  organisation: OrganisationResponseShort | ExtendedOrganisationResponse;
}

export const OrganisationCard = ({ organisation }: OrganisationCardProps) => {
  return (
    <div className={classes.container}>
      <div className={classes.image}>
        <Image
          layout="fill"
          src={organisation.mainImage}
          alt={organisation.name}
        />
      </div>
      <div className={classes.content}>
        <div className={classes.text}>
          <span className={classes.name}>{organisation.name}</span>
          <span className={classes.location}>
            {makeCountyName(organisation.location)}
          </span>
          <span className={classes.description}>
            {organisation.description}
          </span>
        </div>
        <div className={classes.stats}>
          <div className={classes.stat}>
            <Image src={desc} alt={organisation.name} />
            <span>{organisation.exponatCount || 0}</span>
          </div>
          <div className={classes.stat}>
            <Image src={favouriteDrop} alt={organisation.name} />
            <span>{organisation.followerCount || 0}</span>
          </div>
          <div className={classes.stat}>
            <Image src={userDark} alt={organisation.name} />
            <span>{organisation.followerCount || 0}</span>
          </div>
        </div>
        <Link
          href={`/organisation/${organisation.id}`}
          className={classes.button}
        >
          Posjeti organizaciju
        </Link>
      </div>
    </div>
  );
};
