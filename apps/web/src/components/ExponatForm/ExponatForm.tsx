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
    name: z.string().min(2).max(100),
    description: z.string().min(2).max(100),
    funFacts: z.array(z.string().min(2).max(100)),
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
      <Input form={form} attribute="name" question="Name" />
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
      {form.formState.errors.root && (
        <span className={classes.error}>
          {form.formState.errors.root?.message}
        </span>
      )}
    </form>
  );
};
