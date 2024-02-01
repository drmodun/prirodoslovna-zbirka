import Image from "next/image";
import classes from "./Header.module.scss";
import logo from "assets/images/logoWithBackground.svg";
export const Header = () => {
  return (
    <div className={classes.container}>
      <div className={classes.main}>
        <div className={classes.logo}>
          <Image src={logo} alt="logo" layout="fill" />
        </div>
        <span className={classes.title}>Biosfera</span>
      </div>
      <div className={classes.menu}>
        {
          //TODO: Make sidemenu and sidemenu button
        }
      </div>
    </div>
  );
};
