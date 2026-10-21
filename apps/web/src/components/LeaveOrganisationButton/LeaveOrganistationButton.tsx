import { useLeaveMembership } from "@/api/useLeaveOrganisation";
import classes from "./LeaveOrganisationButton.module.scss";
import useUser from "@/utility/context/UserContext";
import { useTranslations } from "next-intl";

export interface LeaveOrganisationButtonProps {
  organisationId: string;
  onRemove?: (id: string) => void;
}

export const LeaveOrganisationButton: React.FC<
  LeaveOrganisationButtonProps
> = ({ organisationId, onRemove }) => {
  const t = useTranslations("LeaveOrganisationButton");
  const { mutate } = useLeaveMembership();
  const { memberships, updateMemberships } = useUser();

  const handleLeave = () => {
    const confirm = window.confirm(t("confirm"));
    if (!confirm) return;
    mutate(organisationId);
    const membershipToRemove = memberships.find((x) => x.id === organisationId);
    updateMemberships(membershipToRemove!);
    onRemove && onRemove(organisationId);
  };

  return (
    <button
      onClick={handleLeave}
      title={t("label")}
      className={classes.leaveButton}
    >
      {t("label")}
    </button>
  );
};
