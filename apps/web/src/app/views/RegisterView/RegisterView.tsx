import Image from "next/image";
import classes from "./RegisterView.module.scss";
import logoWithBackground from "assets/images/logoWithBackground.svg";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import ReegisterForm from "components/RegisterForm";
import { RegistrationImage } from "../RegistrationImage/RegistrationImage";
export const RegisterView = () => {
  return (
    <div className={classes.container}>
      <div className={classes.registerSection}>
        <div className={classes.logo}>
          <div className={classes.image}>
            <Image src={logoWithBackground} layout="fill" alt="logo" />
          </div>
          <span className={classes.logoTitle}>Biosfera</span>
        </div>
        <div className={classes.title}>Registracija</div>
        <div className={classes.description}>
          Dobrodošli u Prirodoslovnu zbirku! Ispunjavanjem ove forme stvorit
          ćete novi račun s kojim ćete moći pristupiti stranici i njenim
          resursima.
        </div>
        <QueryClientWrapper>
          <ReegisterForm />
        </QueryClientWrapper>
      </div>
      <RegistrationImage />
    </div>
  );
};
