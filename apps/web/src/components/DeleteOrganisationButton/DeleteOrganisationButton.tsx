import classes from "./DeleteOrganisationButton.module.scss";
import { useDeleteOrganisation } from "@/api/useDeleteOrganisation";
import { useTranslations } from "next-intl";

export interface DeleteOrganisationButtonProps {
  organisationId?: string;
}

export const DeleteOrganisationButton = ({
  organisationId,
}: DeleteOrganisationButtonProps) => {
  const t = useTranslations("DeleteOrganisationButton");
  const { mutateAsync: deleteOrganisation } = useDeleteOrganisation();

  const handleDelete = async () => {
    const confirm = window.confirm(t("confirm"));
    if (!confirm) return;

    await deleteOrganisation(organisationId!);
  };

  return (
    <button
      onClick={handleDelete}
      className={classes.deleteButton}
      title={t("label")}
    >
      {t("label")}
    </button>
  );
};
