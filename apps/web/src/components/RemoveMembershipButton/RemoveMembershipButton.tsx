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
      "Are you sure you want to leave this organisation?"
    );
    confirm &&
      mutate({
        organisationId,
        userId,
      });
    onRemove && onRemove(organisationId);
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
