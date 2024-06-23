"use client";

import { useUploadFile } from "@/api/useUploadFile";
import { ButtonColor } from "@/shared/enums";
import { getQuestionTypesList } from "@/utility/static/getEnumLists";
import {
  Directories,
  getEnumValue,
  QuestionResponseExtended,
  QuestionTypeEnum,
} from "@biosfera/types";
import { zodResolver } from "@hookform/resolvers/zod";
import BaseButton from "components/BaseButton";
import FileUpload from "components/FileUpload";
import Input from "components/Input";
import ListInput from "components/ListInput";
import SelectInput from "components/SelectInput";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
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

export type questionSchemaType = z.infer<typeof questionSchema>;

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
  const form = useForm({
    defaultValues: defaultValues as FieldValues,
    resolver: zodResolver(questionSchema),
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
      data.image = response.url;
    }
    onSubmit(data);
  };

  return (
    <div onSubmit={form.handleSubmit(handleSubmit)}>
      <Input
        form={form}
        attribute="question"
        question="Pitanje"
        error={form.formState.errors.question?.message?.toString()}
      />
      <FileUpload
        name="Slika"
        isFullWidth
        onChange={(files) => {
          setTitleImage(files);
        }}
      />
      <SelectInput
        form={form}
        name="questionType"
        label="Tip pitanja"
        options={getQuestionTypesList().map((type) => ({
          label: getEnumValue(QuestionTypeEnum, type),
          value: type,
        }))}
        error={form.formState.errors.questionType?.message?.toString()}
      />
      {form.watch("questionType") === "MULTIPLE_CHOICE" && (
        <ListInput
          form={form}
          attribute="options"
          question="Odgovori"
          initValue={form.getValues("options")}
          error={form.formState.errors.options?.message?.toString()}
        />
      )}
      <ListInput
        form={form}
        attribute="correct"
        question="Tocni odgovori"
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
                { label: "Tocno", value: "true" },
                { label: "Netocno", value: "false" },
              ]
            : []
        }
        error={form.formState.errors.correct?.message?.toString()}
      />
      <Input
        form={form}
        attribute="points"
        question="Broj bodova"
        isNumber
        error={form.formState.errors.points?.message?.toString()}
      />
      {hasTimeLimit && (
        <Input
          form={form}
          attribute="timeLimit"
          question="Vrijeme za odgovor (sekunde)"
          error={form.formState.errors.timeLimit?.message?.toString()}
        />
      )}
      <BaseButton
        text="Dodaj pitanje"
        onClick={form.handleSubmit(handleSubmit)}
        initColor={ButtonColor.BLUE}
      />
    </div>
  );
};
