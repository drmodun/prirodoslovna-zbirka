import classes from "./UserDescription.module.scss";
import { makeCountyName } from "@/utility/static/countyNameMaker";
import { dateShortener } from "@/utility/static/dateShortener";

export interface UserDescriptionProps {
  bio: string;
  county: string;
  lastUpdated: string | Date;
}

export const UserDescription = ({
  bio,
  county,
  lastUpdated, //Add something later here, such as sometging like shared organisations or something
}: UserDescriptionProps) => {
  return (
    <div className={classes.container}>
      <div className={classes.bio}>{bio}</div>
      <div className={classes.county}>Lokacija: {makeCountyName(county)}</div>
      <div className={classes.lastUpdated}>
        Zadnji put ažurirano: {dateShortener(lastUpdated)}
      </div>
    </div>
  );
};

//hidration bugs occurs here for some reason
