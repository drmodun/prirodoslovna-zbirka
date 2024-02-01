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
        <div className={classes.link}>O projektu</div>
        <div className={classes.link}>Dokumentacija</div>
        <div className={classes.link}>Kontakt</div>
      </div>
    </div>
  </div>
);

//TODO: make all theese links work
