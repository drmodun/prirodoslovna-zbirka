"use client";

import { useCreateQuiz } from "@/api/useCreateQuiz";
import { useUpdateQuiz } from "@/api/useUpdateQuiz";
import { useUploadFile } from "@/api/useUploadFile";
import {
  getDifficultyTypesList,
  getTimeLimitTypesList,
} from "@/utility/static/getEnumLists";
import {
  Directories,
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
import { useState } from "react";
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

  const { mutateAsync: createQuiz, isError: errorOnCreate } = useCreateQuiz();
  const { mutateAsync: updateQuiz, isError: errorOnUpdate } = useUpdateQuiz();
  const { mutateAsync: uploadFile } = useUploadFile();

  const [titleImage, setTitleImage] = useState<File[]>([]);

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

  const handleAddQuestion = (data: questionSchemaType) => {
    form.setValue("questions", [...form.getValues("questions"), data]);
  };

  const form = useForm({
    defaultValues: defaultValues as FieldValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    if (data.timeLimitTotal) {
      data.timeLimitTotal *= 1000 * 60;
    }

    const image = titleImage.length > 0 && titleImage[0];
    const upload = image
      ? uploadFile({
          file: image,
          directory: Directories.QUIZ,
        })
      : Promise.resolve(null);
    data.image = await upload;

    if (defaultValues) {
      await updateQuiz({ organisationId, id: defaultValues.id, data });
    } else {
      await createQuiz({ organisationId, data });
    }

    if (errorOnCreate || errorOnUpdate) return;

    setTimeout(() => {
      window.location.href = `organisation/${organisationId}`;
    }, 3000);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
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
      <FileUpload
        onChange={(files) => setTitleImage(files)}
        name="Naslovna slika"
        isFullWidth
      />
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
        question="Ukupno vrijeme (u minutama)"
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
        />; //Test if this creates a new question or not
      })}
      <span>Dodaj pitanje</span>
      <QuestionForm
        hasTimeLimit={form.watch("timeLimitType") === "PER_QUESTION"}
        onSubmit={handleAddQuestion}
      />
      <BaseButton text="Kreiraj kviz" isNotSubmit={false} />
    </form>
  );
};
