import Image from "next/image";
import classes from "./RegisterView.module.scss";
import logoWithBackground from "assets/images/logoWithBackground.svg";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import RegisterForm from "components/RegisterForm";
import { RegistrationImage } from "../RegistrationImage/RegistrationImage";
import { useTranslations } from "next-intl";
export const RegisterView = () => {
  const t = useTranslations("Pages");
  return (
    <div className={classes.container}>
      <div className={classes.registerSection}>
        <div className={classes.title}>{t("register")}</div>
        <div className={classes.description}>{t("registerText")}</div>
        <QueryClientWrapper>
          <RegisterForm />
        </QueryClientWrapper>
      </div>
      <RegistrationImage />
    </div>
  );
};
