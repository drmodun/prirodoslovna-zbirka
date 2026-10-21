import classes from "./UserDescription.module.scss";
import { useCountyName } from "@/utility/hooks/useCountyName";
import { dateShortener } from "@/utility/static/dateShortener";
import QrCodeGenerator from "components/QrCodeButton";
import ShareButton from "components/ShareButton";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("UserDescription");
  const countyName = useCountyName();
  return (
    <div className={classes.container}>
      <div className={classes.bio}>{bio}</div>
      <div className={classes.county}>
        {t("location", { county: countyName(county) })}
      </div>
      <div className={classes.lastUpdated}>
        {t("lastUpdated", { date: dateShortener(lastUpdated) })}
      </div>
      <div className={classes.social}>
        <QrCodeGenerator name={username} isIcon />
        <ShareButton text={t("share", { username })} title={username} />
      </div>
    </div>
  );
};

//hidration bugs occurs here for some reason
