"use client";

import { ExtendedUserResponse } from "@biosfera/types";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useQueryClient } from "react-query";
import { api } from "@/api/shared";
import { isLocale, Locale, LOCALE_COOKIE, localeToLanguage } from "i18n/config";

const ONE_YEAR = 60 * 60 * 24 * 365;

export const setLocaleCookie = (locale: Locale) => {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
};

// Switches the interface language. The cookie decides what the server renders;
// a logged in user's choice is also saved to their profile so it follows them
// to other devices.
export const useChangeLocale = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const current = useLocale();
  const [isPending, startTransition] = useTransition();

  const changeLocale = (locale: Locale) => {
    if (locale === current) return;

    const me = queryClient.getQueryData<ExtendedUserResponse>(["me"]);
    if (me) {
      const language = localeToLanguage(locale);
      // Updated before the refresh, so LocaleSync does not switch back to the
      // language the profile had.
      queryClient.setQueryData(["me"], { ...me, language });
      api
        .patch("/users/language", { language })
        // Notifications are rendered in the saved language.
        .then(() => queryClient.invalidateQueries("notifications"))
        .catch(console.error);
    }

    setLocaleCookie(locale);
    startTransition(() => router.refresh());
  };

  return {
    locale: isLocale(current) ? current : undefined,
    changeLocale,
    isPending,
  };
};
