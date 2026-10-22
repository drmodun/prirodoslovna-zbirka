"use client";
import { useGetApiTokenUsage } from "@/api/useGetApiTokenUsage";
import { useTranslations } from "next-intl";
import classes from "./ApiTokensSection.module.scss";

const DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// The last 30 UTC days, oldest first, with the days without requests at 0.
const lastDays = (now = Date.now()) =>
  Array.from({ length: DAYS }, (_, index) =>
    new Date(now - (DAYS - 1 - index) * DAY_MS).toISOString().slice(0, 10),
  );

export const ApiTokenUsage = ({ tokenId }: { tokenId: string }) => {
  const t = useTranslations("ApiTokens");
  const { data, isLoading, isError } = useGetApiTokenUsage(tokenId);

  if (isLoading) return <p className={classes.muted}>{t("loading")}</p>;
  if (isError || !data)
    return <p className={classes.muted}>{t("usageFailed")}</p>;

  const byDay = new Map(data.map((row) => [row.day, row.requests]));
  const days = lastDays().map((day) => ({
    day,
    requests: byDay.get(day) ?? 0,
  }));
  const total = days.reduce((sum, { requests }) => sum + requests, 0);
  const max = Math.max(1, ...days.map(({ requests }) => requests));

  if (!total) return <p className={classes.muted}>{t("usageEmpty")}</p>;

  return (
    <div className={classes.usage}>
      <span className={classes.muted}>{t("usageTotal", { total })}</span>
      <div className={classes.chart} aria-hidden>
        {days.map(({ day, requests }) => (
          <div
            key={day}
            className={classes.bar}
            style={{ height: `${(requests / max) * 100}%` }}
            title={t("usageDay", { day, requests })}
          />
        ))}
      </div>
    </div>
  );
};
