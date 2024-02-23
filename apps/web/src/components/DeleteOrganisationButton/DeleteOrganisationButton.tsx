import classes from "./DeleteOrganisationButton.module.scss";
import { useDeleteOrganisation } from "@/api/useDeleteOrganisation";

export interface DeleteOrganisationButtonProps {
  organisationId?: string;
}

export const DeleteOrganisationButton = ({
  organisationId,
}: DeleteOrganisationButtonProps) => {
  const { mutateAsync: deleteOrganisation } = useDeleteOrganisation();

  const handleDelete = async () => {
    const confirm = window.confirm(
      `Jeste li sigurni da želite obrisati korisnika?`
    );
    if (!confirm) return;

    await deleteOrganisation(organisationId!);
  };

  return (
    <button
      onClick={handleDelete}
      className={classes.deleteButton}
      title="Obriši organizaciju"
    >
      Obriši organizaciju
    </button>
  );
};
