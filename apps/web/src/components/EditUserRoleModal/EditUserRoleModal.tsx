"use client";

import { useOwnerUpdateUserRole } from "@/api/useOwnerUpdateUserRole";
import { useTransferOwnership } from "@/api/useTransferOwnerShip";
import { useUpdateUserRole } from "@/api/useUpdateUserRole";
import useUser from "@/utility/context/UserContext";
import { zodResolver } from "@hookform/resolvers/zod";
import BaseButton from "components/BaseButton";
import Modal from "components/BaseModal";
import SelectInput from "components/SelectInput";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

export interface EditUserRoleModalProps {
  userId: string;
  userRole: string;
  organisationId: string;
  isOwner: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const EditUserRoleModal = ({
  userId,
  onClose,
  organisationId,
  userRole,
  isOpen,
  isOwner,
}: EditUserRoleModalProps) => {
  const { mutateAsync: updateUserRole } = useUpdateUserRole();
  const { mutateAsync: ownerUpdateUserRole } = useOwnerUpdateUserRole();
  const { mutateAsync: transferOwnership } = useTransferOwnership();
  const { memberships } = useUser();

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
    const confirm = window.confirm(
      `Jeste li sigurni da želite promijeniti ulogu korisnika?`
    );
    if (!confirm) return;
    isOwner
      ? data.role === "OWNER"
        ? await transferOwnership({ organisationId, userId, role: data.role })
        : await ownerUpdateUserRole({ organisationId, userId, role: data.role })
      : await updateUserRole({ organisationId, userId, role: data.role });
    if (isOwner && data.role === "OWNER")
      memberships?.find((m) => m.id === organisationId)?.role === "OWNER";
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      text="Ovje možete promijeniti ulogu korisnika u organizaciji"
      title="Mijenjanje uloge korisnika"
      deMount={onClose}
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SelectInput
          form={form}
          label="Uloga"
          name="role"
          options={[
            { value: "ADMIN", label: "Admin" },
            { value: "MEMBER", label: "Član" },
            { value: "OWNER", label: "Vlasnik" },
            { value: "REQUESTED", label: "Zahtjev (nije član)" },
          ].filter((option) => {
            if (isOwner) {
              return option;
            } else {
              return option.value !== "OWNER" && option.value !== "ADMIN";
            }
          })}
        />
        <BaseButton text="Promijeni ulogu" />
      </form>
    </Modal>
  );
};
