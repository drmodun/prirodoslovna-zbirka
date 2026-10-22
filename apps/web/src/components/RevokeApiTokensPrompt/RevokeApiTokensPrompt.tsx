"use client";
import { useRevokeAllApiTokens } from "@/api/useRevokeAllApiTokens";
import Modal from "components/BaseModal";
import { useTranslations } from "next-intl";
import classes from "./RevokeApiTokensPrompt.module.scss";

export interface RevokeApiTokensPromptProps {
  count: number;
  // Called once the user revoked the tokens or chose to keep them.
  onDone: () => void;
}

// Shown right after a password reset: the reset keeps the user's API tokens,
// so they are asked whether to revoke them.
export const RevokeApiTokensPrompt = ({
  count,
  onDone,
}: RevokeApiTokensPromptProps) => {
  const t = useTranslations("ApiTokens");
  const { mutateAsync, isLoading } = useRevokeAllApiTokens();

  const revokeAll = async () => {
    await mutateAsync().catch(() => null);
    onDone();
  };

  return (
    <Modal
      open
      title={t("resetPromptTitle")}
      text={t("resetPromptText", { count })}
      actionText={t("keepTokens")}
      deMount={onDone}
    >
      <button
        type="button"
        className={classes.revokeButton}
        onClick={revokeAll}
        disabled={isLoading}
      >
        {t("revokeAllNow")}
      </button>
    </Modal>
  );
};
