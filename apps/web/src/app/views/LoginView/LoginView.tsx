import { SignInForm } from "components/SignInForm/SignInForm";
import GreenDrop from "../GreenDrop/GreenDrop";
import classes from "./LoginView.module.scss";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import { useTranslations } from "next-intl";

const LoginView = () => {
  const t = useTranslations("Pages");

  return (
    <div className={classes.container}>
      <div className={classes.drop}>
        <GreenDrop />
      </div>
      <span className={classes.title}>{t("login")}</span>
      <div className={classes.form}>
        <QueryClientWrapper>
          <SignInForm />
        </QueryClientWrapper>
      </div>
    </div>
  );
};

export default LoginView;
