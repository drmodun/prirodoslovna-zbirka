import classes from "./UserDescription.module.scss";
import { makeCountyName } from "@/utility/static/countyNameMaker";
import { dateShortener } from "@/utility/static/dateShortener";
import QrCodeGenerator from "components/QrCodeButton";
import ShareButton from "components/ShareButton";

export interface UserDescriptionProps {
  bio: string;
  county: string;
  lastUpdated: string | Date;
  username: string;
}

export const UserDescription = ({
  bio,
  username,
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
      <div className={classes.social}>
        <QrCodeGenerator name={username} isIcon />
        <ShareButton
          text={`Podijelite profil korisnika ${username}`}
          title={username}
        />
      </div>
    </div>
  );
};

//hidration bugs occurs here for some reason
