import {
  getDifficultyTypesList,
  getTimeLimitTypesList,
} from "@/utility/static/getEnumLists";
import {
  getEnumValue,
  QuizResponseExtended,
  TimeLimitTypeEnum,
} from "@biosfera/types";
import { zodResolver } from "@hookform/resolvers/zod";
import BaseButton from "components/BaseButton";
import FileUpload from "components/FileUpload";
import Input from "components/Input";
import ListInput from "components/ListInput";
import { questionSchema } from "components/QuestionForm/QuestionForm";
import SelectInput from "components/SelectInput";
import { FieldValues, useForm } from "react-hook-form";
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
    questions: z.array(questionSchema),
  });

  const form = useForm({
    defaultValues: defaultValues as FieldValues,
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={form.handleSubmit((data) => console.log(data))}>
      <Input
        form={form}
        attribute="title"
        question="Naziv kviza"
        error={form.formState.errors.title?.message?.toString()}
      />
      <Input
        form={form}
        attribute="description"
        question="Opis kviza"
        error={form.formState.errors.description?.message?.toString()}
      />
      <FileUpload name="Naslovna slika" isFullWidth />
      <SelectInput
        form={form}
        name="timeLimitType"
        label="Tip ograničenja vremena"
        options={getTimeLimitTypesList().map((type) => ({
          label: getEnumValue(TimeLimitTypeEnum, type),
          value: type,
        }))}
        error={form.formState.errors.timeLimitType?.message?.toString()}
      />
      <Input
        form={form}
        attribute="timeLimitTotal"
        question="Ukupno vreme"
        error={form.formState.errors.timeLimitTotal?.message?.toString()}
      />
      <SelectInput
        form={form}
        name="difficulty"
        label="Težina kviza"
        options={getDifficultyTypesList().map((type) => ({
          label: type,
          value: type,
        }))}
        error={form.formState.errors.difficulty?.message?.toString()}
      />
      //TODO: implement view of question input
      <BaseButton text="Kreiraj kviz" isNotSubmit={false} />
    </form>
  );
};
