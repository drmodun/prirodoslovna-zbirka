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

export const CreationModal = () => {
  const { isVisibleModal, hideButton, hideModal } = useCreateButton();
  const { memberships } = useUser();
  const router = useRouter();

  const schema = z.object({
    type: z.enum(["organisation", "exponat", "post"]),
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
    }
  };

  return (
    <Modal
      title="Kreiraj novi entitet"
      deMount={handleClickCloseModal}
      text="Odaberite što želite napraviti"
      open={isVisibleModal || false}
      actionText="Zatvori"
    >
      <form onSubmit={form.handleSubmit(onFormSubmit)}>
        <SelectInput
          form={form}
          label="Tip entiteta"
          name="type"
          options={[
            { value: "organisation", label: "Organizacija" },
            { value: "exponat", label: "Eksponat" },
            { value: "post", label: "Objava" },
          ]}
        />
        {form.watch("type") !== "organisation" && (
          <SelectInput
            form={form}
            label="Organizacija"
            name="organisationId"
            options={memberships.map((membership) => ({
              value: membership.id,
              label: membership.name,
            }))}
          />
        )}
        {form.watch("type") === "post" && (
          <SelectInput
            form={form}
            label="Exponat"
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
                      label: "Nema dostupnih eksponata",
                    },
                  ]
            }
          />
        )}
        <BaseButton text="Kreiraj" />
      </form>
    </Modal>
  );
};
