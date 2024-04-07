"use client";

import { useGetExponatsForOrganisation } from "@/api/useGetExponatsForOrganisation";
import useCreateButton from "@/utility/context/CreateButtonContext";
import { zodResolver } from "@hookform/resolvers/zod";
import classes from "./CreationModal.module.scss";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import Modal from "components/BaseModal";
import { useRouter } from "next/navigation";
import SelectInput from "components/SelectInput";
import useUser from "@/utility/context/UserContext";

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

  const { data: availableExponats } = useGetExponatsForOrganisation(
    form.watch("organisationId")?.toLowerCase()
  );

  const handleClickCloseModal = () => {
    hideButton && hideButton();
    hideModal && hideModal();
  };

  const onFormSubmit = async (data: any) => {
    switch (data.type) {
      case "organisation":
        data.organisationId && router.push(`/createOrganisation`);
        break;
      case "exponat":
        data.organisationId &&
          router.push(`/organisation/${data.organisationId}/create`);
        break;
      case "post":
        if (data.exponatId === "no-exponats") return;

        data.exponatId && router.push(`/exponat/${data.exponatId}/create`);
        break;
    }
  };

  return (
    <Modal
      title="Kreiraj novi entitet"
      deMount={handleClickCloseModal}
      text="Odaberite što želite napraviti"
      open={isVisibleModal || false}
    >
      <form onSubmit={form.handleSubmit(onFormSubmit)}>
        <SelectInput
          form={form}
          label="Tip entiteta"
          name="type"
          options={[
            { value: "organisation", label: "Organizacija" },
            { value: "exponat", label: "Exponat" },
            { value: "post", label: "Post" },
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
        {form.watch("type") === "exponat" && (
          <SelectInput
            form={form}
            label="Exponat"
            name="exponatId"
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
        <button type="submit" className={classes.submitButton}>
          Kreiraj
        </button>
      </form>
    </Modal>
  );
};
