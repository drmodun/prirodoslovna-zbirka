import { WorkResponseExtended } from "@biosfera/types";
import { z } from "zod";

export interface WorksFormProps {
  isEdit?: boolean;
  work: WorkResponseExtended[];
  organisationId: string;
}

export const WorksForm = ({ isEdit, work, organisationId }: WorksFormProps) => {
  const schema = z.object({
    title: z.string().min(5, "Naslov mora biti najmanje 5 slova dug"),
    description: z
      .string()
      .min(100, "Abstrakt treba biti dug najmanje 100 slova"),
    poster: z.string(),
  });
};
