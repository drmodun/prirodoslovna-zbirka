import Image from "next/image";
import classes from "./CreateOrganisationView.module.scss";
import logoWithBackground from "assets/images/logoWithBackground.svg";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import CreateOrganisationForm from "components/CreateOrganisationForm";
import { RegistrationImage } from "../RegistrationImage/RegistrationImage";
import { useTranslations } from "next-intl";
export const CreateOrganisationView = () => {
  const t = useTranslations("Pages");
  return (
    <div className={classes.container}>
      <div className={classes.formSection}>
        <div className={classes.title}>
          {t.rich("newOrganisation", { br: () => <br /> })}
        </div>
        <div className={classes.description}>{t("newOrganisationText")}</div>
        <QueryClientWrapper>
          <CreateOrganisationForm />
        </QueryClientWrapper>
      </div>
      <RegistrationImage />
    </div>
  );
};
