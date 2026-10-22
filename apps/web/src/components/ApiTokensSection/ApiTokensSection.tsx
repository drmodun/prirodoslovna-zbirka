"use client";
import { useGetApiTokens } from "@/api/useGetApiTokens";
import { useRevokeAllApiTokens } from "@/api/useRevokeAllApiTokens";
import { useRevokeApiToken } from "@/api/useRevokeApiToken";
import { ApiTokenResponse } from "@biosfera/types";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { isActiveToken, useFormatDate } from "./apiTokenDates";
import { ApiTokenUsage } from "./ApiTokenUsage";
import classes from "./ApiTokensSection.module.scss";
import { CreateApiTokenModal } from "./CreateApiTokenModal";

const RATE_LIMIT_PER_MINUTE = 120;

const ApiTokenRow = ({ token }: { token: ApiTokenResponse }) => {
  const t = useTranslations("ApiTokens");
  const formatDate = useFormatDate();
  const { mutate: revoke, isLoading } = useRevokeApiToken();
  const [showUsage, setShowUsage] = useState(false);
  const active = isActiveToken(token);

  const handleRevoke = () => {
    if (window.confirm(t("revokeConfirm", { name: token.name })))
      revoke(token.id);
  };

  const status = token.revokedAt
    ? t("revoked", { date: formatDate(token.revokedAt) })
    : !token.expiresAt
      ? t("neverExpires")
      : active
        ? t("expires", { date: formatDate(token.expiresAt) })
        : t("expired", { date: formatDate(token.expiresAt) });

  return (
    <li className={clsx(classes.token, !active && classes.inactive)}>
      <div className={classes.tokenHeader}>
        <span className={classes.tokenName}>{token.name}</span>
        <code className={classes.prefix}>bsf_{token.prefix}…</code>
        <span className={classes.badge}>
          {token.scopes.includes("WRITE") ? t("readWrite") : t("readOnly")}
        </span>
      </div>
      <div className={classes.meta}>
        <span>{t("created", { date: formatDate(token.createdAt) })}</span>
        <span>
          {token.lastUsedAt
            ? t("lastUsed", { date: formatDate(token.lastUsedAt) })
            : t("neverUsed")}
        </span>
        <span
          className={clsx(
            active && !token.expiresAt && classes.neverExpires,
            !active && classes.status,
          )}
        >
          {status}
        </span>
      </div>
      <div className={classes.rowActions}>
        <button
          type="button"
          className={classes.button}
          onClick={() => setShowUsage((shown) => !shown)}
          aria-expanded={showUsage}
        >
          {showUsage ? t("hideUsage") : t("showUsage")}
        </button>
        {active && (
          <button
            type="button"
            className={clsx(classes.button, classes.dangerButton)}
            onClick={handleRevoke}
            disabled={isLoading}
          >
            {t("revoke")}
          </button>
        )}
      </div>
      {showUsage && <ApiTokenUsage tokenId={token.id} />}
    </li>
  );
};

// The logged-in user's personal access tokens, on their own profile.
export const ApiTokensSection = () => {
  const t = useTranslations("ApiTokens");
  const { data: tokens, isLoading, isError } = useGetApiTokens();
  const { mutate: revokeAll, isLoading: isRevoking } = useRevokeAllApiTokens();
  const [creating, setCreating] = useState(false);
  const activeCount = tokens?.filter((token) => isActiveToken(token)).length;

  const handleRevokeAll = () => {
    if (window.confirm(t("revokeAllConfirm", { count: activeCount ?? 0 })))
      revokeAll();
  };

  return (
    <section className={classes.section} aria-labelledby="api-tokens-title">
      <span id="api-tokens-title" className={classes.title}>
        {t("title")}
      </span>
      <p className={classes.description}>
        {t("description", { limit: RATE_LIMIT_PER_MINUTE })}
      </p>
      <div className={classes.actions}>
        <button
          type="button"
          className={clsx(classes.button, classes.primary)}
          onClick={() => setCreating(true)}
        >
          {t("newToken")}
        </button>
        {!!activeCount && (
          <button
            type="button"
            className={clsx(classes.button, classes.dangerButton)}
            onClick={handleRevokeAll}
            disabled={isRevoking}
          >
            {t("revokeAll")}
          </button>
        )}
      </div>

      {isLoading ? (
        <p className={classes.muted}>{t("loading")}</p>
      ) : isError || !tokens ? (
        <p className={classes.muted}>{t("loadFailed")}</p>
      ) : tokens.length === 0 ? (
        <p className={classes.muted}>{t("empty")}</p>
      ) : (
        <ul className={classes.list}>
          {tokens.map((token) => (
            <ApiTokenRow key={token.id} token={token} />
          ))}
        </ul>
      )}

      <CreateApiTokenModal open={creating} onClose={() => setCreating(false)} />
    </section>
  );
};
