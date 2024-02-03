"use client";
import { ExponatKind, ExponatResponseShort } from "@biosfera/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import { useForm } from "react-hook-form";
import { any, z } from "zod";
import classes from "./ExponatForm.module.scss";
import Textarea from "components/Textarea";
import ListInput from "components/ListInput";
import AttributeInput from "components/AttributeInput";
import SelectInput from "components/SelectInput";
import BaseButton from "components/BaseButton";
export interface ExponatModalSectionsProps {
  organisationId: string;
}

export const ExponatForm = ({ organisationId }: ExponatModalSectionsProps) => {
  const schema = z.object({
    name: z
      .string()
      .min(2, " Ime mora imati više od 2 slova")
      .max(100, "Ime mora imati manje od 100 slova"),
    description: z
      .string()
      .min(2, "Opis mora imati više od 2 slova")
      .max(100, "Opis mora imati manje od 100 slova"),

    funFacts: z.array(
      z
        .string()
        .min(2, "Fun fact mora imati više od 2 slova")
        .max(100, "Fun fact mora imati manje od 100 slova")
    ),
    exponatKind: z.enum([
      ExponatKind.EUCARIOT.toString(),
      ExponatKind.PROCARIOT.toString(),
      ExponatKind.MINERAL.toString(),
    ]),
    attributes: z.any(),
    mainImage: z.any(),
  });

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
      <p className={classes.error}>
        {form.formState.errors.name?.message?.toString() || ""}
      </p>
      <Input form={form} attribute="name" question="Name" />
      <p className={classes.error}>
        {form.formState.errors.description?.message?.toString() || ""}
      </p>
      <Textarea form={form} attribute="description" question="Description" />

      <ListInput form={form} attribute="funFacts" question="Fun Facts" />
      <AttributeInput
        form={form}
        attribute="attributes"
        question="Attributes"
      />
      <SelectInput
        form={form}
        name="exponatKind"
        label="Vrsta exponata"
        options={[
          { value: ExponatKind.EUCARIOT.toString(), label: "Eukariot" },
          { value: ExponatKind.PROCARIOT.toString(), label: "Procariot" },
          { value: ExponatKind.MINERAL.toString(), label: "Mineral" },
        ]}
      />
      <BaseButton text="Pošalji" />
    </form>
  );
};
