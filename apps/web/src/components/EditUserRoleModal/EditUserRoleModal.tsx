"use client";

import { useOwnerUpdateUserRole } from "@/api/useOwnerUpdateUserRole";
import { useUpdateUserRole } from "@/api/useUpdateUserRole";
import useUser from "@/utility/context/UserContext";
import { zodResolver } from "@hookform/resolvers/zod";
import BaseButton from "components/BaseButton";
import Modal from "components/BaseModal";
import classes from "./EditUserRoleModal.module.scss";
import SelectInput from "components/SelectInput";
import { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { useTransferOwnership } from "@/api/useTransferOwnership";
import { useTranslations } from "next-intl";

export interface EditUserRoleModalProps {
  userId: string;
  userRole: string;
  organisationId: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const EditUserRoleModal = ({
  userId,
  onClose,
  organisationId,
  userRole,
  isOpen = false,
}: EditUserRoleModalProps) => {
  const t = useTranslations("EditUserRoleModal");
  const tRoles = useTranslations("MemberRoles");
  const { mutateAsync: updateUserRole } = useUpdateUserRole();
  const { mutateAsync: ownerUpdateUserRole } = useOwnerUpdateUserRole();
  const { mutateAsync: transferOwnership } = useTransferOwnership();
  const { user, memberships } = useUser();
  const [open, setOpen] = useState(isOpen);
  const [isOwner, setIsOwner] = useState(
    memberships?.some((m) => m.id === organisationId && m.role === "OWNER"),
  );

  const schema = z.object({
    role: z.string(),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: userRole,
    } as FieldValues,
  });

  const onSubmit = async (data: any) => {
    const confirm = window.confirm(t("confirm"));
    if (!confirm) return;
    isOwner
      ? data.role === "OWNER"
        ? await transferOwnership({ organisationId, userId, role: data.role })
        : await ownerUpdateUserRole({ organisationId, userId, role: data.role })
      : await updateUserRole({ organisationId, userId, role: data.role });
    if (isOwner && data.role === "OWNER")
      memberships?.find((m) => m.id === organisationId)?.role === "OWNER";
    handleClose();
  };

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    setIsOwner(
      memberships?.some((m) => m.id === organisationId && m.role === "OWNER"),
    );
  }, [memberships, organisationId]);

  const handleClose = () => {
    setOpen(false);
    onClose && onClose();
  };

  return (
    <>
      {!(
        userId === user?.id ||
        ((userRole === "OWNER" || userRole === "ADMIN") && !isOwner)
      ) && (
        <div onClick={() => setOpen(true)} className={classes.button}>
          {t("changeRole")}
        </div>
      )}
      <Modal
        open={open}
        text={t("text")}
        title={t("title")}
        deMount={handleClose}
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SelectInput
            form={form}
            label={t("role")}
            name="role"
            options={(["ADMIN", "MEMBER", "OWNER", "REQUESTED"] as const)
              .map((value) => ({ value, label: tRoles(value) }))
              .filter((option) => {
                if (isOwner) {
                  return option;
                } else {
                  return option.value !== "OWNER" && option.value !== "ADMIN";
                }
              })}
          />
          <BaseButton text={t("changeRole")} />
        </form>
      </Modal>
    </>
  );
};
