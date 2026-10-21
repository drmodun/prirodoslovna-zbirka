"use client";

import { useUploadFile } from "@/api/useUploadFile";
import { ButtonColor } from "@/shared/enums";
import { getQuestionTypesList } from "@/utility/static/getEnumLists";
import { Directories, QuestionResponseExtended } from "@biosfera/types";
import { zodResolver } from "@hookform/resolvers/zod";
import BaseButton from "components/BaseButton";
import FileUpload from "components/FileUpload";
import Input from "components/Input";
import ListInput from "components/ListInput";
import SelectInput from "components/SelectInput";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";

// Inputs hand over text; empty means "not given".
export const optionalNumber = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined
      ? undefined
      : Number(value),
  z.number().optional(),
);

// `t` reads the QuestionForm messages.
export const createQuestionSchema = (t: (key: string) => string) =>
  z.object({
    id: z.string().optional(),
    question: z.string().min(5, t("questionMin")),
    image: z.string().optional(),
    questionType: z.enum(getQuestionTypesList() as [string, ...string[]], {
      errorMap: () => ({ message: t("typeRequired") }),
    }),
    options: z.array(z.string()).default([]),
    correct: z.array(z.string()).default([]),
    timeLimit: optionalNumber,
    points: z.preprocess(
      (value) => (value === "" ? undefined : Number(value)),
      z.number({ invalid_type_error: t("pointsRequired") }),
    ),
  });

export type questionSchemaType = z.infer<
  ReturnType<typeof createQuestionSchema>
>;

export interface QuestionFormProps {
  defaultValues?: questionSchemaType | QuestionResponseExtended;
  hasTimeLimit?: boolean;
  onSubmit: (data: any) => void;
}

export const QuestionForm = ({
  hasTimeLimit,
  defaultValues,
  onSubmit,
}: QuestionFormProps) => {
  const t = useTranslations("QuestionForm");
  const tTypes = useTranslations("Enums.QuestionType");
  const form = useForm({
    defaultValues: defaultValues as FieldValues,
    resolver: zodResolver(createQuestionSchema(t)),
  });

  const { mutateAsync: uploadFile } = useUploadFile();

  const [titleImage, setTitleImage] = useState<File[]>([]);

  const handleSubmit = async (data: any) => {
    if (data.timeLimit) {
      data.timeLimit *= 1000;
    }

    const image = titleImage[0];
    if (image) {
      const response = await uploadFile({
        file: image,
        directory: Directories.QUESTION,
      });
      // The upload resolves with the file's URL.
      data.image = response;
    }
    onSubmit(data);
  };

  return (
    <div onSubmit={form.handleSubmit(handleSubmit)}>
      <Input
        form={form}
        attribute="question"
        question={t("question")}
        error={form.formState.errors.question?.message?.toString()}
      />
      <FileUpload
        name={t("image")}
        isFullWidth
        onChange={(files) => {
          setTitleImage(files);
        }}
      />
      <SelectInput
        form={form}
        name="questionType"
        label={t("type")}
        options={getQuestionTypesList().map((type) => ({
          label: tTypes(type),
          value: type,
        }))}
        error={form.formState.errors.questionType?.message?.toString()}
      />
      {form.watch("questionType") === "MULTIPLE_CHOICE" && (
        <ListInput
          form={form}
          attribute="options"
          question={t("options")}
          initValue={form.getValues("options")}
          error={form.formState.errors.options?.message?.toString()}
        />
      )}
      <ListInput
        form={form}
        attribute="correct"
        question={t("correct")}
        initValue={form.getValues("correct")}
        isSelect={
          form.watch("questionType") === "MULTIPLE_CHOICE" ||
          form.watch("questionType") === "TRUE_FALSE"
        }
        options={
          form.watch("questionType") === "MULTIPLE_CHOICE"
            ? form.watch("options")?.map((option: string) => {
                return { label: option, value: option };
              })
            : form.watch("questionType") === "TRUE_FALSE"
              ? [
                  { label: t("true"), value: "true" },
                  { label: t("false"), value: "false" },
                ]
              : []
        }
        error={form.formState.errors.correct?.message?.toString()}
      />
      <Input
        form={form}
        attribute="points"
        question={t("points")}
        isNumber
        error={form.formState.errors.points?.message?.toString()}
      />
      {hasTimeLimit && (
        <Input
          form={form}
          attribute="timeLimit"
          question={t("timeLimit")}
          error={form.formState.errors.timeLimit?.message?.toString()}
        />
      )}
      <BaseButton
        text={t("add")}
        onClick={form.handleSubmit(handleSubmit)}
        initColor={ButtonColor.BLUE}
      />
    </div>
  );
};
