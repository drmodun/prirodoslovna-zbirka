import classes from "./GreenDrop.module.scss";
import drop from "assets/images/drop.svg";
import user from "assets/images/user.svg";
import Image from "next/image";

const GreenDrop = () => (
  <div className={classes.container}>
    <Image alt="korisnik" className={classes.drop} src={drop}></Image>
    <Image alt="korisnik" className={classes.user} src={user}></Image>
  </div>
);

export default GreenDrop;
