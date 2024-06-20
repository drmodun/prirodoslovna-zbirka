import { getQuestionTypesList } from "@/utility/static/getEnumLists";
import { QuestionResponseExtended } from "@biosfera/types";
import { z } from "zod";

export const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  image: z.string().optional(),
  questionType: z.enum(["", ...getQuestionTypesList()]),
  options: z.array(z.string()),
  correct: z.array(z.string()),
  timeLimit: z.number().optional(),
  points: z.number(),
});

export interface QuestionFormProps {
  defaultValues?: QuestionResponseExtended;
  onSubmit: (data: any) => void;
}

export const QuestionForm = ({
  defaultValues,
  onSubmit,
}: QuestionFormProps) => {};
