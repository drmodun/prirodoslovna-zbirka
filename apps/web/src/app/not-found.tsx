import classes from "./not-found.module.scss";
import GreenDrop from "./views/GreenDrop/GreenDrop";
import { useTranslations } from "next-intl";

// Not async: the client-rendered admin pages show it too.
const NotFound = () => {
  const t = useTranslations("NotFound");

  return (
    <div className={classes.notFound}>
      <GreenDrop />
      <h1>{t("title")}</h1>
    </div>
  );
};

export default NotFound;
