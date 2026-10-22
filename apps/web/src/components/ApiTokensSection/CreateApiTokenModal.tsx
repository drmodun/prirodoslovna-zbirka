"use client";
import { useCreateApiToken } from "@/api/useCreateApiToken";
import { ApiTokenScope, CreatedApiTokenResponse } from "@biosfera/types";
import Modal from "components/BaseModal";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import classes from "./ApiTokensSection.module.scss";

const MAX_NAME_LENGTH = 60;
const MAX_EXPIRY_DAYS = 365;
const PRESETS = ["7", "30", "90", "365"] as const;
const DEFAULT_EXPIRY = "90";

type Expiry = (typeof PRESETS)[number] | "custom" | "never";

interface CreateApiTokenModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateApiTokenModal = ({
  open,
  onClose,
}: CreateApiTokenModalProps) => {
  const t = useTranslations("ApiTokens");
  const { mutateAsync, isLoading } = useCreateApiToken();
  const [name, setName] = useState("");
  const [scope, setScope] = useState<ApiTokenScope>("READ");
  const [expiry, setExpiry] = useState<Expiry>(DEFAULT_EXPIRY);
  const [customDays, setCustomDays] = useState("");
  const [errors, setErrors] = useState<{ name?: string; days?: string }>({});
  const [created, setCreated] = useState<CreatedApiTokenResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const close = () => {
    setName("");
    setScope("READ");
    setExpiry(DEFAULT_EXPIRY);
    setCustomDays("");
    setErrors({});
    setCreated(null);
    setCopied(false);
    onClose();
  };

  const expiresInDays = (): number | null | undefined => {
    if (expiry === "never") return null;
    if (expiry !== "custom") return Number(expiry);
    const days = Number(customDays);
    return Number.isInteger(days) && days >= 1 && days <= MAX_EXPIRY_DAYS
      ? days
      : undefined;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    const days = expiresInDays();
    const found = {
      name: trimmed ? undefined : t("nameRequired"),
      days: days === undefined ? t("customDaysInvalid") : undefined,
    };
    setErrors(found);
    if (found.name || found.days) return;

    const result = await mutateAsync({
      name: trimmed,
      scopes: scope === "WRITE" ? ["READ", "WRITE"] : ["READ"],
      expiresInDays: days,
    }).catch(() => null);
    if (result) setCreated(result);
  };

  const copy = async () => {
    if (!created) return;
    // Without clipboard access the token stays on screen to copy by hand.
    const done = await navigator.clipboard
      ?.writeText(created.token)
      .then(() => true)
      .catch(() => false);
    setCopied(!!done);
  };

  if (created)
    return (
      <Modal
        open={open}
        title={t("createdTitle")}
        text={t("createdText", { name: created.name })}
        actionText={t("done")}
        deMount={close}
      >
        <div className={clsx(classes.callout, classes.warning)} role="alert">
          {t("createdWarning")}
        </div>
        <div className={classes.tokenValue}>
          <code data-testid="new-api-token">{created.token}</code>
          <button type="button" className={classes.button} onClick={copy}>
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
      </Modal>
    );

  return (
    <Modal
      open={open}
      title={t("createTitle")}
      text={t("createText")}
      actionText={t("cancel")}
      deMount={close}
    >
      <form className={classes.form} onSubmit={submit} noValidate>
        <label className={classes.field}>
          <span>{t("name")}</span>
          <input
            className={classes.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("namePlaceholder")}
            maxLength={MAX_NAME_LENGTH}
          />
          {errors.name && <span className={classes.error}>{errors.name}</span>}
        </label>

        <fieldset className={classes.field}>
          <legend>{t("access")}</legend>
          {(["READ", "WRITE"] as const).map((value) => (
            <label key={value} className={classes.option}>
              <input
                type="radio"
                name="scope"
                checked={scope === value}
                onChange={() => setScope(value)}
              />
              {value === "READ" ? t("accessRead") : t("accessWrite")}
            </label>
          ))}
        </fieldset>

        <label className={classes.field}>
          <span>{t("expiry")}</span>
          <select
            className={classes.input}
            value={expiry}
            onChange={(event) => setExpiry(event.target.value as Expiry)}
          >
            {PRESETS.map((days) => (
              <option key={days} value={days}>
                {days === DEFAULT_EXPIRY
                  ? t("expiryDefault", { count: Number(days) })
                  : t("expiryDays", { count: Number(days) })}
              </option>
            ))}
            <option value="custom">{t("expiryCustom")}</option>
            <option value="never">{t("expiryNever")}</option>
          </select>
        </label>

        {expiry === "custom" && (
          <label className={classes.field}>
            <span>{t("customDays", { max: MAX_EXPIRY_DAYS })}</span>
            <input
              className={classes.input}
              type="number"
              min={1}
              max={MAX_EXPIRY_DAYS}
              value={customDays}
              onChange={(event) => setCustomDays(event.target.value)}
            />
            {errors.days && (
              <span className={classes.error}>{errors.days}</span>
            )}
          </label>
        )}

        {expiry === "never" && (
          <div className={clsx(classes.callout, classes.danger)} role="alert">
            <strong>{t("neverWarningTitle")}</strong>
            <span>{t("neverWarning")}</span>
          </div>
        )}

        <button
          type="submit"
          className={clsx(classes.button, classes.primary)}
          disabled={isLoading}
        >
          {isLoading ? t("creating") : t("create")}
        </button>
      </form>
    </Modal>
  );
};
