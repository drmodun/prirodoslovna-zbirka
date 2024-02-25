import Image from "next/image";
import classes from "./CreateOrganisationView.module.scss";
import logoWithBackground from "assets/images/logoWithBackground.svg";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import CreateOrganisationForm from "components/CreateOrganisationForm";
import { RegistrationImage } from "../RegistrationImage/RegistrationImage";
export const CreateOrganisationView = () => {
  return (
    <div className={classes.container}>
      <div className={classes.formSection}>
        <div className={classes.title}>
          Nova <br></br>organizacija
        </div>
        <div className={classes.description}>
          Dobrodošli u Prirodoslovnu zbirku! Ispunjavanjem ove forme stvorit
          ćete novu organizaciju na našoj platformi te ćete moći surađivati sa
          ostalim korisnicima.
        </div>
        <QueryClientWrapper>
          <CreateOrganisationForm />
        </QueryClientWrapper>
      </div>
      <RegistrationImage />
    </div>
  );
};
