import Image from "next/image";
import classes from "./RegistrationImage.module.scss";
import lion from "assets/images/lion.svg";
import bacteria from "assets/images/bacteria.svg";
import crystal from "assets/images/crystal.svg";
export const RegistrationImage = () => (
  <div className={classes.container}>
    <div className={classes.lion}>
      <Image src={lion} alt="lion" layout="fill" />
    </div>
    <div className={classes.bacteria}>
      <Image
        src={bacteria}
        alt="bacteria"
        layout="fill"
      />
    </div>
    <div className={classes.crystal}>
      <Image
        src={crystal}
        alt="crystal"
        layout="fill"
      />
    </div>
  </div>
);
