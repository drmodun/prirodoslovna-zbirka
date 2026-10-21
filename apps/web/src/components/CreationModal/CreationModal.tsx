"use client";

import { useGetExponatsForOrganisation } from "@/api/useGetExponatsForOrganisation";
import useCreateButton from "@/utility/context/CreateButtonContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import Modal from "components/BaseModal";
import { useRouter } from "next/navigation";
import SelectInput from "components/SelectInput";
import useUser from "@/utility/context/UserContext";
import BaseButton from "components/BaseButton";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export const CreationModal = () => {
  const t = useTranslations("CreationModal");
  const { isVisibleModal, hideButton, hideModal } = useCreateButton();
  const { memberships } = useUser();
  const router = useRouter();

  const schema = z.object({
    type: z.enum(["organisation", "exponat", "post", "work"]),
    organisationId: z.string(),
    exponatId: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "organisation",
      organisationId: "",
      exponatId: "",
    } as FieldValues,
  });

  useEffect(() => {
    form.setValue("organisationId", memberships[0]?.id);
  }, [memberships, form, form.watch("type")]);

  const { data: availableExponats } = useGetExponatsForOrganisation(
    form.watch("organisationId")?.toLowerCase(),
  );

  useEffect(() => {
    form.setValue("exponatId", availableExponats?.[0]?.id);
  }, [availableExponats, form]);

  const handleClickCloseModal = () => {
    hideButton && hideButton();
    hideModal && hideModal();
  };

  const onFormSubmit = async (data: any) => {
    if (data.type === "post" && data.exponatId === "no-exponats") return;

    hideModal && hideModal();

    switch (data.type) {
      case "organisation":
        router.push(`/createOrganisation`);
        break;
      case "exponat":
        data.organisationId &&
          router.push(`/organisation/${data.organisationId}/createExponat`);
        break;
      case "post":
        data.exponatId && router.push(`/exponat/${data.exponatId}/createPost`);
        break;
      case "work":
        data.organisationId &&
          router.push(`/organisation/${data.organisationId}/createWork`);
        break;
    }
  };

  return (
    <Modal
      title={t("title")}
      deMount={handleClickCloseModal}
      text={t("text")}
      open={isVisibleModal || false}
      actionText={t("close")}
    >
      <form onSubmit={form.handleSubmit(onFormSubmit)}>
        <SelectInput
          form={form}
          label={t("type")}
          name="type"
          options={[
            { value: "organisation", label: t("types.organisation") },
            { value: "exponat", label: t("types.exponat") },
            { value: "post", label: t("types.post") },
            { value: "work", label: t("types.work") },
          ]}
        />
        {form.watch("type") !== "organisation" && (
          <SelectInput
            form={form}
            label={t("organisation")}
            name="organisationId"
            options={memberships
              .filter((membership) => membership.role !== "REQUESTED")
              .map((membership) => ({
                value: membership.id,
                label: membership.name,
              }))}
          />
        )}
        {form.watch("type") === "post" && (
          <SelectInput
            form={form}
            label={t("exponat")}
            name="exponatId"
            isDisabled={!availableExponats?.length}
            options={
              availableExponats?.length
                ? availableExponats?.map((exponat) => ({
                    value: exponat.id,
                    label: exponat.name,
                  }))
                : [
                    {
                      value: "no-exponats",
                      label: t("noExponats"),
                    },
                  ]
            }
          />
        )}
        <BaseButton text={t("create")} />
      </form>
    </Modal>
  );
};
