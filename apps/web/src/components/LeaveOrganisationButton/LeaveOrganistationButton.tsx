import { useLeaveMembership } from "@/api/useLeaveOrganisation";
import classes from "./LeaveOrganisationButton.module.scss";
import useUser from "@/utility/context/UserContext";

export interface LeaveOrganisationButtonProps {
  organisationId: string;
  onRemove?: (id: string) => void;
}

export const LeaveOrganisationButton: React.FC<
  LeaveOrganisationButtonProps
> = ({ organisationId, onRemove }) => {
  const { mutate } = useLeaveMembership();
  const { memberships, updateMemberships } = useUser();

  const handleLeave = () => {
    const confirm = window.confirm(
      "Jeste li sigurni da želite napustiti organizaciju?",
    );
    if (!confirm) return;
    mutate(organisationId);
    const membershipToRemove = memberships.find((x) => x.id === organisationId);
    updateMemberships(membershipToRemove!);
    onRemove && onRemove(organisationId);
  };

  return (
    <button
      onClick={handleLeave}
      title="Leave Organisation"
      className={classes.leaveButton}
    >
      Napusti organizaciju
    </button>
  );
};
