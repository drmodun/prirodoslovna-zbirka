import classes from "./RemoveMembershipButton.module.scss";
import { useRemoveMembership } from "@/api/useRemoveMembership";
import { useTranslations } from "next-intl";

export interface LeaveOrganisationButtonProps {
  organisationId: string;
  userId: string;
  onRemove?: (id: string) => void;
}

export const RemoveMembershipButton: React.FC<LeaveOrganisationButtonProps> = ({
  organisationId,
  onRemove,
  userId,
}) => {
  const t = useTranslations("RemoveMembershipButton");
  const { mutate } = useRemoveMembership();

  const handleLeave = () => {
    const confirm = window.confirm(t("confirm"));
    if (!confirm) return;
    mutate({
      organisationId,
      userId,
    });
    onRemove && onRemove(userId);
  };
  return (
    <button
      onClick={handleLeave}
      title={t("label")}
      className={classes.kickButton}
    >
      {t("label")}
    </button>
  );
};
