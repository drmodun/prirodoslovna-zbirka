import {
  getDifficultyTypesList,
  getTimeLimitTypesList,
} from "@/utility/static/getEnumLists";
import {
  getEnumValue,
  QuizResponseExtended,
  TimeLimitTypeEnum,
} from "@biosfera/types";
import { z } from "zod";

export interface QuizFormProps {
  organisationId: string;
  defaultValues?: QuizResponseExtended;
}

export const QuizForm = ({ organisationId, defaultValues }: QuizFormProps) => {
  const schema = z.object({
    title: z.string(),
    description: z.string(),
    coverImage: z.string().optional(),
    isRetakeable: z.boolean(),
    organisationId: z.string(),
    organisationName: z.string(),
    organisationMainImage: z.string(),
    isTest: z.boolean(),
    timeLimitType: z.enum(["", ...getTimeLimitTypesList()]),
    timeLimitTotal: z.number().optional(),
    difficulty: z.enum(["", ...getDifficultyTypesList()]),
    isAnonymousAllowed: z.boolean(),
    questions: z.array(
     
  });
};
