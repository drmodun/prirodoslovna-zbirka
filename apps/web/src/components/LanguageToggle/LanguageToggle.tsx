"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import { locales } from "i18n/config";
import { useChangeLocale } from "@/utility/hooks/useChangeLocale";
import classes from "./LanguageToggle.module.scss";

export interface LanguageToggleProps {
  className?: string;
}

export const LanguageToggle = ({ className }: LanguageToggleProps) => {
  const t = useTranslations("LanguageToggle");
  const { locale, changeLocale, isPending } = useChangeLocale();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={clsx(classes.container, className)}
    >
      {locales.map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          title={t(option)}
          aria-pressed={locale === option}
          disabled={isPending}
          onClick={() => changeLocale(option)}
          className={clsx(classes.option, locale === option && classes.active)}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
