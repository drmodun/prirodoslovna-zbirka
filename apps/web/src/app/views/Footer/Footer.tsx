import Image from "next/image";
import classes from "./Footer.module.scss";
import leaf from "assets/images/leaf.svg";
import negativeLogo from "assets/images/negativeLogo.svg";
import { useTranslations } from "next-intl";

export const Footer = () => {
  const t = useTranslations("Footer");

  return (
    <div className={classes.container}>
      <div className={classes.leaf}>
        <div className={classes.leafImage}>
          <Image src={leaf} alt="leaf" layout="fill" />
        </div>
      </div>
      <div className={classes.main}>
        <div className={classes.title}>
          <div className={classes.logo}>
            <Image src={negativeLogo} alt="logo" layout="fill" />
          </div>
          <span className={classes.logoTitle}>Biosfera</span>
        </div>
        <div className={classes.links}>
          <a
            href="https://biosfera-files.s3.eu-north-1.amazonaws.com/Biosfera+-+Nova+tehni%C4%8Dka+dokumentacija.pdf"
            className={classes.link}
          >
            {t("documentation")}
          </a>
        </div>
      </div>
    </div>
  );
};
