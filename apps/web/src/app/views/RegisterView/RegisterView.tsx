import Image from "next/image";
import classes from "./RegisterView.module.scss";
import logoWithBackground from "assets/images/logoWithBackground.svg";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import RegisterForm from "components/RegisterForm";
import { RegistrationImage } from "../RegistrationImage/RegistrationImage";
export const RegisterView = () => {
  return (
    <div className={classes.container}>
      <div className={classes.registerSection}>
        <div className={classes.title}>Registracija</div>
        <div className={classes.description}>
          Dobrodošli u Prirodoslovnu zbirku! Ispunjavanjem ove forme stvorit
          ćete novi račun s kojim ćete moći pristupiti stranici i njenim
          resursima.
        </div>
        <QueryClientWrapper>
          <RegisterForm />
        </QueryClientWrapper>
      </div>
      <RegistrationImage />
    </div>
  );
};
