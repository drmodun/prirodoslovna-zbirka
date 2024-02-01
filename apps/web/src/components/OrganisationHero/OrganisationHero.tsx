import { ExtendedOrganisationResponse } from "@biosfera/types";
import classes from "./OrganisationHero.module.scss";
import Image from "next/image";
export interface OrganisationHeroProps {
  organisation: ExtendedOrganisationResponse;
}
import drop from "assets/images/points-drop.svg";
import { makeCountyName } from "@/utility/static/countyNameMaker";

export const OrganisationHero = ({ organisation }: OrganisationHeroProps) => (
  <div className={classes.container}>
    <div className={classes.image}>
      <Image
        src={organisation.mainImage}
        alt={organisation.name}
        layout="fill"
      />
    </div>
    <div className={classes.points}>
      <div className={classes.drop}>
        <Image src={drop} alt="drop" width={30} height={30} />
      </div>
      <span className={classes.pointNumber}>{organisation.points}</span>
    </div>
    <span className={classes.name}>{organisation.name}</span>
    <span className={classes.location}>
      {makeCountyName(organisation.location)}
    </span>
  </div>
);
