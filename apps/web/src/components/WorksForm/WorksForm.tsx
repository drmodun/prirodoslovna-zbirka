"use client";
import { CreateWorkRequest, usePostWork } from "@/api/usePostWork";
import { Directories, WorkResponseExtended } from "@biosfera/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import classes from "./WorksForm.module.scss";
import Input from "components/Input";
import Textarea from "components/Textarea";
import ListInput from "components/ListInput";
import SelectInput from "components/SelectInput";
import FileUpload from "components/FileUpload";
import BaseButton from "components/BaseButton";
import { useState } from "react";
import toast from "react-hot-toast";
import { useUploadFile } from "@/api/useUploadFile";
import { UpdateWorkRequest, useUpdateWork } from "@/api/useUpdateWork";
import { useUploadDocument } from "@/api/useUploadDocument";
import { getLiteratureTypesList } from "@/utility/static/getEnumLists";
import { useTranslations } from "next-intl";

export interface WorksFormProps {
  isEdit?: boolean;
  work?: WorkResponseExtended;
  organisationId: string;
}

// `t` reads the WorksForm messages.
const createSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().min(5, t("titleMin")),
    description: z.string().min(100, t("descriptionMin")),
    poster: z.optional(z.any()),
    document: z.optional(z.any()),
    presentation: z.optional(z.any()),
    tags: z.array(z.string()),
    type: z.enum([
      "",
      ...(getLiteratureTypesList().map(
        (type: string) => type as string,
      ) as string[]),
    ]),
  });

const getDefaultValues = (work: WorkResponseExtended) =>
  ({
    title: work.title,
    description: work.description,
    tags: work.tags,
    type: work.type,
    poster: work.poster,
    document: work.document,
    presentation: work.presentation,
  }) as FieldValues;

type Upload = (params: {
  file: File;
  directory: Directories;
}) => Promise<string | undefined>;

export const WorksForm = ({ isEdit, work, organisationId }: WorksFormProps) => {
  const t = useTranslations("WorksForm");
  const tTypes = useTranslations("Enums.WorkType");
  const workTypeOptions = getLiteratureTypesList().map((type) => ({
    value: type,
    label: tTypes(type),
  }));
  const form = useForm({
    defaultValues: isEdit && work ? getDefaultValues(work) : {},
    resolver: zodResolver(createSchema(t)),
  });
  const { errors } = form.formState;

  const { mutateAsync: createWork } = usePostWork();
  const { mutateAsync: updateWork } = useUpdateWork();

  const [workPoster, setWorkPoster] = useState<File[]>([]);
  const [workDocument, setWorkDocument] = useState<File[]>([]);
  const [workPresentation, setWorkPresentation] = useState<File[]>([]);

  const { mutateAsync: uploadImage } = useUploadFile();
  const { mutateAsync: uploadDocument } = useUploadDocument();

  // Resolves to the uploaded file's URL, or undefined when nothing was
  // selected or the upload failed (the failure is reported as a toast).
  const uploadFirst = async (files: File[], upload: Upload, error: string) => {
    try {
      if (files.length === 0) return;
      const url = await upload({ file: files[0], directory: Directories.WORK });
      if (!url && !isEdit) throw new Error(error);
      return url;
    } catch {
      toast.error(error);
    }
  };

  const handleUploadPoster = () =>
    uploadFirst(workPoster, uploadImage, t("posterUploadFailed"));
  const handleUploadDocument = () =>
    uploadFirst(workDocument, uploadDocument, t("documentUploadFailed"));
  const handleUploadPresentation = () =>
    uploadFirst(
      workPresentation,
      uploadDocument,
      t("presentationUploadFailed"),
    );

  const onSubmit = async (data: any) => {
    try {
      const [posterUrl, documentUrl, presentationUrl] = await Promise.all([
        handleUploadPoster(),
        handleUploadDocument(),
        handleUploadPresentation(),
      ]);

      data.poster = posterUrl ?? work?.poster;
      data.document = documentUrl ?? work?.document;
      data.presentation = presentationUrl ?? work?.presentation;

      const object: CreateWorkRequest | UpdateWorkRequest = {
        ...data,
        organisationId,
      };

      isEdit
        ? await updateWork({ id: work!.id, object })
        : await createWork({
            body: object as CreateWorkRequest,
            organisationId,
          });

      setTimeout(() => {
        window.location.href = `/organisation/${organisationId}`;
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  // Stored files are kept unless the author chooses to replace one.
  const [replacing, setReplacing] = useState({
    poster: false,
    document: false,
    presentation: false,
  });
  const replace = (file: keyof typeof replacing) => () =>
    setReplacing((current) => ({ ...current, [file]: true }));

  return (
    <form className={classes.form} onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        form={form}
        attribute="title"
        question={t("title")}
        error={errors.title?.message?.toString()}
      />
      <Textarea
        form={form}
        attribute="description"
        question={t("description")}
        error={errors.description?.message?.toString()}
      />
      <SelectInput
        name="type"
        form={form}
        label={t("type")}
        options={workTypeOptions}
      />
      <ListInput
        attribute="tags"
        form={form}
        question={t("tags")}
        initValue={work?.tags}
        error={errors.tags?.message?.toString()}
      />
      {work?.poster && !replacing.poster ? (
        <BaseButton
          text={t("replacePoster")}
          isNotSubmit
          onClick={replace("poster")}
        />
      ) : (
        <FileUpload isFullWidth onChange={setWorkPoster} name={t("poster")} />
      )}

      {work?.document && !replacing.document ? (
        <BaseButton
          text={t("replaceDocument")}
          isNotSubmit
          onClick={replace("document")}
        />
      ) : (
        <FileUpload
          isFullWidth
          onChange={setWorkDocument}
          name={t("document")}
        />
      )}

      {work?.presentation && !replacing.presentation ? (
        <BaseButton
          text={t("replacePresentation")}
          isNotSubmit
          onClick={replace("presentation")}
        />
      ) : (
        <FileUpload
          isFullWidth
          onChange={setWorkPresentation}
          name={t("presentation")}
        />
      )}

      <BaseButton text={t("submit")} />
    </form>
  );
};
