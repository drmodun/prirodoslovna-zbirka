import { AuthorshipInfo } from "@biosfera/types";
import {
  AuthorshipInfoFields,
  AuthorshipInfoModal,
} from "components/AuthorshipInfoModal/AuthorshipInfoModal";
import BaseButton from "components/BaseButton";
import { useState } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

export interface AuthorshipButtonProps {
  form: UseFormReturn<FieldValues>;
  type: AuthorshipInfoFields;
  currentValues?: AuthorshipInfo;
}

export const AuthorshipButton = ({
  currentValues,
  form,
  type,
}: AuthorshipButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <BaseButton
        onClick={() => setIsOpen(true)}
        text="Dodavanje autorskih informacija"
        isNotSubmit
      />
      <AuthorshipInfoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        type={type}
        currentValues={currentValues}
        onSuccess={(info) => form.setValue("authorshipInfoId", info)}
      />
    </>
  );
};
