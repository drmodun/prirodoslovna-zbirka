import { useUpdateAuthorshipInfo } from "@/api/useUpdateAuthorshipInfo";
import { useUploadAuthorshipInfo } from "@/api/useUploadAuthorshipInfo";
import { AuthorshipInfo } from "@biosfera/types";
import { zodResolver } from "@hookform/resolvers/zod";
import BaseButton from "components/BaseButton";
import Modal from "components/BaseModal";
import Input from "components/Input";
import ListInput from "components/ListInput";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import classes from "./AuthorshipInfoModal.module.scss";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export enum AuthorshipInfoFields {
  SOCIAL_POST,
  EXPONAT,
  POST,
}

export interface AuthorshipInfoModalProps {
  onSuccess: (id: string) => void;
  type: AuthorshipInfoFields;
  currentValues?: AuthorshipInfo;
  isOpen: boolean;
  onClose: () => void;
}

export const AuthorshipInfoModal = ({
  onSuccess,
  currentValues,
  isOpen,
  type,
  onClose,
}: AuthorshipInfoModalProps) => {
  const t = useTranslations("Authorship");
  const { mutateAsync: uploadAuthorshipInfo } = useUploadAuthorshipInfo();
  const { mutateAsync: updateAuthorshipInfo } = useUpdateAuthorshipInfo();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const close = () => {
    setOpen(false);
    onClose();
  };

  const schema = z
    .object({
      // The date picker gives "YYYY-MM-DD", or "" when left empty.
      dateOfOccurrence: z.preprocess(
        (value) => (value ? new Date(value as string) : undefined),
        z.date().optional(),
      ),
      locationOfOccurrence: z.optional(z.string()),
      nonPlatformAuthor: z.optional(z.string()),
      identifiedBy: z.optional(z.string()),
      photographer: z.optional(z.string()),
      literature: z.array(z.string()),
      deviceName: z.optional(z.string()),
    })
    .refine((data) => {
      switch (type) {
        case AuthorshipInfoFields.EXPONAT:
          return (
            data.photographer !== undefined &&
            data.literature.length > 0 &&
            data.deviceName !== undefined &&
            data.dateOfOccurrence !== undefined &&
            data.locationOfOccurrence !== undefined &&
            data.identifiedBy !== undefined
          );
        case AuthorshipInfoFields.POST:
          return (
            data.literature.length > 0 &&
            data.dateOfOccurrence !== undefined &&
            data.locationOfOccurrence !== undefined &&
            data.photographer !== undefined
          );
        default:
          return true;
      }
    });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: currentValues as FieldValues,
  });

  const onSubmit = async (data: any) => {
    console.log(data);
    const action = currentValues
      ? updateAuthorshipInfo({
          id: currentValues.id,
          object: data,
        })
      : uploadAuthorshipInfo(data);
    const result = await action;
    onSuccess(result.id);
    close();
  };

  return (
    <Modal
      open={isOpen}
      title={t("modalTitle")}
      text={t("modalText")}
      deMount={onClose}
    >
      <form className={classes.container}>
        <Input
          form={form}
          attribute="locationOfOccurrence"
          question={t("locationOfOccurrence")}
          error={form.formState.errors.locationOfOccurrence?.message?.toString()}
        />
        <input
          type="date"
          title={t("dateOfOccurrence")}
          {...form.register("dateOfOccurrence")}
        />
        <Input
          form={form}
          attribute="nonPlatformAuthor"
          question={t("nonPlatformAuthor")}
          error={form.formState.errors.nonPlatformAuthor?.message?.toString()}
        />
        <Input
          form={form}
          attribute="identifiedBy"
          question={t("identifiedBy")}
          error={form.formState.errors.identifiedBy?.message?.toString()}
        />
        <Input
          form={form}
          attribute="photographer"
          question={t("photographer")}
          error={form.formState.errors.photographer?.message?.toString()}
        />
        <ListInput
          form={form}
          attribute="literature"
          question={t("literature")}
          error={form.formState.errors.literature?.message?.toString()}
        />
        <Input
          form={form}
          attribute="deviceName"
          question={t("deviceName")}
          error={form.formState.errors.deviceName?.message?.toString()}
        />
        <BaseButton
          isNotSubmit
          text={t("submit")}
          onClick={() => onSubmit(form.getValues())}
        />
      </form>
    </Modal>
  );
};
