import { useAdminDeleteUser } from "@/api/useAdminDeleteUser";
import classes from "./DeleteUserButton.module.scss";
import { useDeleteUser } from "@/api/useDeleteUser";
import { useTranslations } from "next-intl";

export interface DeleteUserButtonProps {
  isSuper?: boolean;
  userId?: string;
}

export const DeleteUserButton = ({
  isSuper,
  userId,
}: DeleteUserButtonProps) => {
  const t = useTranslations("DeleteUserButton");
  const { mutateAsync: deleteUser } = useDeleteUser();
  const { mutateAsync: deleteUserAdmin } = useAdminDeleteUser();

  const handleDelete = async () => {
    const confirm = window.confirm(t("confirm"));
    if (!confirm) return;

    isSuper ? await deleteUserAdmin(userId!) : await deleteUser();
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
