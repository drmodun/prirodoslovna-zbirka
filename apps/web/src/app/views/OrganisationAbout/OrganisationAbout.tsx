import { ExtendedOrganisationResponse } from "@biosfera/types";
import classes from "./OrganisationAbout.module.scss";
import { makeCountyName } from "@/utility/static/countyNameMaker";
import Image from "next/image";
import email from "assets/images/email.svg";
import Link from "next/link";

export interface OrganisationAboutProps {
  organisation: ExtendedOrganisationResponse;
}

export const OrganisationAbout = ({ organisation }: OrganisationAboutProps) => (
  <div className={classes.container}>
    <div className={classes.info}>
      <div className={classes.section}>
        <span className={classes.title}>Tko smo mi?</span>
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
          Posjeti stranicu
        </Link>
      </div>
    </div>
    <div className={classes.images}>
      {organisation.otherImages.map((image, index) => (
        <div className={classes.image} key={index}>
          {<Image src={image} alt="image" layout="fill" />}
        </div>
      ))}
    </div>
  </div>
);
