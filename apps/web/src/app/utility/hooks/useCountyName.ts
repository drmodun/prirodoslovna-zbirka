import { County } from "@biosfera/types";
import { useTranslations } from "next-intl";

const isCounty = (value: string): value is keyof typeof County =>
  Object.keys(County).includes(value);

// The display name of a county key; anything else is returned as it is.
export const useCountyName = () => {
  const t = useTranslations("Counties");

  return (county: string = "") => (isCounty(county) ? t(county) : county);
};
