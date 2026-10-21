"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useUser from "./context/UserContext";
import { setLocaleCookie } from "./hooks/useChangeLocale";
import { languageToLocale } from "i18n/config";

// A logged in user's saved language wins over the cookie, so their choice
// applies on every device they log in from.
export const LocaleSync = () => {
  const { user } = useUser();
  const locale = useLocale();
  const router = useRouter();
  const preferred = languageToLocale(user?.language);

  useEffect(() => {
    if (!preferred || preferred === locale) return;
    setLocaleCookie(preferred);
    router.refresh();
  }, [preferred, locale, router]);

  return null;
};
