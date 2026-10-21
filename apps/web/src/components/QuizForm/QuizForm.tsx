"use client";

import { useCreateQuiz } from "@/api/useCreateQuiz";
import { useUpdateQuiz } from "@/api/useUpdateQuiz";
import { useUploadFile } from "@/api/useUploadFile";
import {
  getDifficultyTypesList,
  getTimeLimitTypesList,
} from "@/utility/static/getEnumLists";
import { Directories, QuizResponseExtended } from "@biosfera/types";
import { zodResolver } from "@hookform/resolvers/zod";
import BaseButton from "components/BaseButton";
import CheckboxInput from "components/CheckboxInput";
import FileUpload from "components/FileUpload";
import Input from "components/Input";
import classes from "./QuizForm.module.scss";
import {
  optionalNumber,
  QuestionForm,
  createQuestionSchema,
  questionSchemaType,
} from "components/QuestionForm/QuestionForm";
import QuestionInputPreview from "components/QuestionInputPreview";
import SelectInput from "components/SelectInput";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";

export interface QuizFormProps {
  organisationId: string;
  defaultValues?: QuizResponseExtended;
}

export const QuizForm = ({ organisationId, defaultValues }: QuizFormProps) => {
  const t = useTranslations("QuizForm");
  const tQuestion = useTranslations("QuestionForm");
  const tTimeLimits = useTranslations("Enums.TimeLimitType");
  const tDifficulties = useTranslations("Enums.QuizDifficulty");
  const schema = z.object({
    title: z.string(),
    description: z.string(),
    coverImage: z.string().optional(),
    isRetakeable: z.boolean().default(false),
    isTest: z.boolean().default(false),
    timeLimitType: z
      .enum(getTimeLimitTypesList() as [string, ...string[]])
      .default("NONE"),
    timeLimitTotal: optionalNumber,
    difficulty: z
      .enum(getDifficultyTypesList() as [string, ...string[]])
      .default("UNSET"),
    isAnonymousAllowed: z.boolean().default(false),
    questions: z
      .array(createQuestionSchema(tQuestion))
      .min(1, t("questionsMin")),
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
    form.setValue("questions", [...(form.getValues("questions") ?? []), data]);
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
    data.coverImage = (await upload) ?? data.coverImage;

    if (defaultValues) {
      await updateQuiz({ organisationId, id: defaultValues.id, data });
    } else {
      await createQuiz({ organisationId, data });
    }

    if (errorOnCreate || errorOnUpdate) return;

    setTimeout(() => {
      window.location.href = `/organisation/${organisationId}`;
    }, 3000);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        form={form}
        attribute="title"
        question={t("title")}
        error={form.formState.errors.title?.message?.toString()}
      />
      <Input
        form={form}
        attribute="description"
        question={t("description")}
        error={form.formState.errors.description?.message?.toString()}
      />
      <FileUpload
        onChange={(files) => setTitleImage(files)}
        name={t("coverImage")}
        isFullWidth
      />
      <SelectInput
        form={form}
        name="timeLimitType"
        label={t("timeLimitType")}
        options={getTimeLimitTypesList().map((type) => ({
          label: tTimeLimits(type),
          value: type,
        }))}
        error={form.formState.errors.timeLimitType?.message?.toString()}
      />
      <Input
        form={form}
        attribute="timeLimitTotal"
        question={t("timeLimitTotal")}
        isNumber
        error={form.formState.errors.timeLimitTotal?.message?.toString()}
      />
      <SelectInput
        form={form}
        name="difficulty"
        label={t("difficulty")}
        options={getDifficultyTypesList().map((type) => ({
          label: tDifficulties(type),
          value: type,
        }))}
        error={form.formState.errors.difficulty?.message?.toString()}
      />
      <CheckboxInput
        initValue={form.getValues("isRetakeable")}
        question={t("isRetakeable")}
        onChange={(e) => form.setValue("isRetakeable", e.target.checked)}
        error={form.formState.errors.isRetakeable?.message?.toString()}
      />
      <CheckboxInput
        initValue={form.getValues("isAnonymousAllowed")}
        question={t("isAnonymousAllowed")}
        onChange={(e) => form.setValue("isAnonymousAllowed", e.target.checked)}
        error={form.formState.errors.isAnonymousAllowed?.message?.toString()}
      />
      <CheckboxInput
        initValue={form.getValues("isTest")}
        question={t("isTest")}
        onChange={(e) => form.setValue("isTest", e.target.checked)}
        error={form.formState.errors.isTest?.message?.toString()}
      />

      {form
        .watch("questions")
        ?.map((question: questionSchemaType, index: number) => (
          <QuestionInputPreview
            key={question.id ?? index}
            question={question}
            onEdit={handleEditQuestion}
            index={index}
            onDelete={handleDeleteQuestion}
          />
        ))}
      <span className={classes.newQuestion}>{t("newQuestion")}</span>
      <QuestionForm
        hasTimeLimit={form.watch("timeLimitType") === "PER_QUESTION"}
        onSubmit={handleAddQuestion}
      />
      <BaseButton text={t("submit")} isNotSubmit={false} />
    </form>
  );
};
