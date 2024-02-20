import { useLeaveMembership } from "@/api/useLeaveOrganisation";
import classes from "./LeaveOrganisationButton.module.scss";
import useUser from "@/utility/context/UserContext";

export interface LeaveOrganisationButtonProps {
  organisationId: string;
}

export const LeaveOrganisationButton: React.FC<
  LeaveOrganisationButtonProps
> = ({ organisationId }) => {
  const { mutate } = useLeaveMembership();
  const { memberships, updateMemberships } = useUser();

  const handleLeave = () => {
    const confirm = window.confirm(
      "Are you sure you want to leave this organisation?"
    );
    confirm && mutate(organisationId);
    const membershipToRemove = memberships.find((x) => x.id === organisationId);
    updateMemberships(membershipToRemove!);
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
