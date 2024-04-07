import Image from "next/image";
import classes from "./Footer.module.scss";
import leaf from "assets/images/leaf.svg";
import negativeLogo from "assets/images/negativeLogo.svg";
export const Footer = () => (
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
          href="https://dumphr-my.sharepoint.com/:w:/g/personal/lovre_tomic_dump_hr/ERCBMQLWj1hMpHv6HzS4458BgoE2rqk_4beVCwRbppiahg?e=G9EzIy"
          className={classes.link}
        >
          Dokumentacija
        </a>
      </div>
    </div>
  </div>
);
