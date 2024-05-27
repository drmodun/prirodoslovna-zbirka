import classes from "./RemoveMembershipButton.module.scss";
import { useRemoveMembership } from "@/api/useRemoveMembership";

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
  const { mutate } = useRemoveMembership();

  const handleLeave = () => {
    const confirm = window.confirm(
      "jeste li sigurni da želite ukinuti ovo članstvo?",
    );
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
      title="Remove Membership"
      className={classes.kickButton}
    >
      Ukloni članstvo
    </button>
  );
};
