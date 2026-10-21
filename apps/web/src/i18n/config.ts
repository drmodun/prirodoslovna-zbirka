import { Language } from "@biosfera/types";

export const locales = ["en", "hr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// The locale lives in a cookie rather than the URL, so the server renders the
// right language without a /en or /hr prefix on every route.
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const isLocale = (value: unknown): value is Locale =>
  locales.includes(value as Locale);

// The locale the browser is showing, for code outside React (the axios
// instance). Server-side and before a choice it is the default.
export const readLocaleCookie = (): Locale => {
  if (typeof document === "undefined") return defaultLocale;
  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];
  return isLocale(value) ? value : defaultLocale;
};

export const localeToLanguage = (locale: Locale) =>
  locale.toUpperCase() as Language;

export const languageToLocale = (language?: Language | string) => {
  const locale = language?.toLowerCase();
  return isLocale(locale) ? locale : undefined;
};

// Region tags for speech recognition and synthesis.
export const SPEECH_LANGUAGES: Record<Locale, string> = {
  en: "en-US",
  hr: "hr-HR",
};
