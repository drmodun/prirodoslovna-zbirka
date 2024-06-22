"use client";

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
import CheckboxInput from "components/CheckboxInput";
import FileUpload from "components/FileUpload";
import Input from "components/Input";
import {
  QuestionForm,
  questionSchema,
  questionSchemaType,
} from "components/QuestionForm/QuestionForm";
import QuestionInputPreview from "components/QuestionInputPreview";
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
    isTest: z.boolean(),
    timeLimitType: z.enum(["", ...getTimeLimitTypesList()]),
    timeLimitTotal: z.number().optional(),
    difficulty: z.enum(["", ...getDifficultyTypesList()]),
    isAnonymousAllowed: z.boolean(),
    questions: z.array(questionSchema),
  });

  const handleDeleteQuestion = (index: number) => {
    const questions = form.getValues("questions");
    questions.splice(index, 1);
    form.setValue("questions", questions);
  };

  const handleEditQuestion = (data: questionSchemaType, index: number) => {
    const questions = form.getValues("questions");
    questions[index] = data;
    form.setValue("questions", questions); //Test this a lot
  };

  const hadnleAddQuestion = (data: questionSchemaType) => {
    form.setValue("questions", [...form.getValues("questions"), data]);
  };

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
        question="Ukupno vrijeme"
        isNumber
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
      <CheckboxInput
        initValue={form.getValues("isRetakeable")}
        question="Dozvoljeno ponavljanje"
        onChange={(e) => form.setValue("isRetakeable", e.target.checked)}
        error={form.formState.errors.isRetakeable?.message?.toString()}
      />
      <CheckboxInput
        initValue={form.getValues("isAnonymousAllowed")}
        question="Dozvoljeno anonimno rješavanje"
        onChange={(e) => form.setValue("isAnonymousAllowed", e.target.checked)}
        error={form.formState.errors.isAnonymousAllowed?.message?.toString()}
      />
      <CheckboxInput
        initValue={form.getValues("isTest")}
        question="Kviz je testnog oblika (dozvoljeno vraćanje na pitanja i sva pitanja su odmah vidljiva"
        onChange={(e) => form.setValue("isTest", e.target.checked)}
        error={form.formState.errors.isTest?.message?.toString()}
      />

      {form.watch("questions").map((question: questionSchemaType) => {
        <QuestionInputPreview
          question={question}
          onEdit={handleEditQuestion}
          index={form.watch("questions").indexOf(question)}
          onDelete={handleDeleteQuestion}
        />;
      })}
      <span>Dodaj pitanje</span>
      <QuestionForm
        hasTimeLimit={form.watch("timeLimitType") === "PER_QUESTION"}
        onSubmit={hadnleAddQuestion}
      />
      <BaseButton text="Kreiraj kviz" isNotSubmit={false} />
    </form>
  );
};
