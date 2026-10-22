import { ApiTokenResponse } from "@biosfera/types";
import { useLocale } from "next-intl";

export const isActiveToken = (token: ApiTokenResponse, now = Date.now()) =>
  !token.revokedAt &&
  (!token.expiresAt || new Date(token.expiresAt).getTime() > now);

export const useFormatDate = () => {
  const locale = useLocale();
  return (date: Date | string) =>
    new Date(date).toLocaleDateString(locale === "hr" ? "hr-HR" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
};
