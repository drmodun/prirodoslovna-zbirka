import { ExtendedOrganisationResponse } from "@biosfera/types";
import classes from "./OrganisationAbout.module.scss";
import Image from "next/image";
import email from "assets/images/email.svg";
import Link from "next/link";
import { useTranslations } from "next-intl";

export interface OrganisationAboutProps {
  organisation: ExtendedOrganisationResponse;
}

export const OrganisationAbout = ({ organisation }: OrganisationAboutProps) => {
  const t = useTranslations("OrganisationAbout");

  return (
    <div className={classes.container}>
      <div className={classes.info}>
        <div className={classes.section}>
          <span className={classes.title}>{t("about")}</span>
          <span className={classes.text}>{organisation.description}</span>
        </div>
        <div className={classes.email}>
          <div className={classes.image}>
            <Image src={email} alt="email"></Image>
          </div>
          <span className={classes.emailText}>{organisation.email}</span>
        </div>

        <div className={classes.link}>
          <Link href={organisation.websiteUrl} className={classes.linkText}>
            {t("visitWebsite")}
          </Link>
        </div>
      </div>
    </div>
  );
};
