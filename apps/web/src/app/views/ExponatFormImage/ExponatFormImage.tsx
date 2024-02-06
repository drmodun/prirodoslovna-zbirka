import Image from "next/image";
import classes from "./ExponatFormImage.module.scss";
import pencil from "assets/images/pencil.svg";
import picture from "assets/images/picture.svg";
import likeLeafGreen from "assets/images/like-leaf-green.svg";
export const ExponatFormImage = () => (
  <div className={classes.container}>
    <div className={classes.picture}>
      <Image src={picture} alt="lion" layout="fill" />
    </div>
    <div className={classes.pencil}>
      <Image src={pencil} alt="bacteria" layout="fill" />
    </div>
    <div className={classes.leaf}>
      <Image src={likeLeafGreen} alt="crystal" layout="fill" />
    </div>
  </div>
);
