import { useAdminDeleteUser } from "@/api/useAdminDeleteUser";
import classes from "./DeleteUserButton.module.scss";
import { useDeleteUser } from "@/api/useDeleteUser";

export interface DeleteUserButtonProps {
  isSuper?: boolean;
  userId?: string;
}

export const DeleteUserButton = ({
  isSuper,
  userId,
}: DeleteUserButtonProps) => {
  const { mutateAsync: deleteUser } = useDeleteUser();
  const { mutateAsync: deleteUserAdmin } = useAdminDeleteUser();

  const handleDelete = async () => {
    const confirm = window.confirm(
      `Jeste li sigurni da želite obrisati korisnika?`
    );
    if (!confirm) return;

    isSuper ? await deleteUserAdmin(userId!) : await deleteUser();
  };

  return (
    <button
      onClick={handleDelete}
      className={classes.deleteButton}
      title="Obriši korisnika"
    >
      Obriši korisnika
    </button>
  );
};
