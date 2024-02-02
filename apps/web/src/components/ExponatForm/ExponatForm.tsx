import { ExponatKind, ExponatResponseShort } from "@biosfera/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import { useForm } from "react-hook-form";
import { any, z } from "zod";
import classes from "./ExponatForm.module.scss";
import Textarea from "components/Textarea";
export interface ExponatModalSectionsProps {
  organisationId: string;
  organisationExponats: ExponatResponseShort[];
}

export const ExponatForm = ({
  organisationId,
  organisationExponats,
}: ExponatModalSectionsProps) => {
  const schema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().min(2).max(100),
    funFacts: z.array(z.string().min(2).max(100)),
    exponatId: z.enum([
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
      <Input form={form} attribute="name" question="Name" />;
      <Textarea form={form} attribute="description" question="Description" />;

    </form>
  );
};
