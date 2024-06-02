"use client";
import { CreateWorkRequest, usePostWork } from "@/api/usePostWork";
import {
  Directories,
  getEnumValue,
  WorkResponseExtended,
  WorkType,
} from "@biosfera/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { title } from "process";
import { Field, FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import classes from "./WorksForm.module.scss";
import Input from "components/Input";
import Textarea from "components/Textarea";
import ListInput from "components/ListInput";
import SelectInput from "components/SelectInput";
import { stringCapitaliser } from "@/utility/static/stringCapitaliser";
import FileUpload from "components/FileUpload";
import BaseButton from "components/BaseButton";
import { use, useState } from "react";
import toast from "react-hot-toast";
import { useUploadFile } from "@/api/useUploadFile";
import { UpdateWorkRequest, useUpdateWork } from "@/api/useUpdateWork";
import { useUploadDocument } from "@/api/useUploadDocument";
import { getLiteratureTypesList } from "@/utility/static/getEnumLists";

export interface WorksFormProps {
  isEdit?: boolean;
  work?: WorkResponseExtended;
  organisationId: string;
}

export const WorksForm = ({ isEdit, work, organisationId }: WorksFormProps) => {
  const schema = z.object({
    title: z.string().min(5, "Naslov mora biti najmanje 5 slova dug"),
    description: z
      .string()
      .min(100, "Abstrakt treba biti dug najmanje 100 slova"),
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

  const form = useForm({
    defaultValues:
      isEdit && work
        ? ({
            title: work.title,
            description: work.description,
            tags: work.tags,
            type: work.type,
            poster: work.poster,
            document: work.document,
            presentation: work.presentation,
          } as FieldValues)
        : {},
    resolver: zodResolver(schema),
  });

  const { mutateAsync: createWork } = usePostWork();
  const { mutateAsync: updateWork } = useUpdateWork();

  const [workPoster, setWorkPoster] = useState<File[]>([] as File[]);
  const [workDocument, setWorkDocument] = useState<File[]>([] as File[]);
  const [workPresentation, setWorkPresentation] = useState<File[]>(
    [] as File[],
  );

  const { mutateAsync: uploadImage } = useUploadFile();
  const { mutateAsync: uploadDocument } = useUploadDocument();

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

  const handleRemovePoster = () => {
    form.setValue("poster", null);
  };

  const handleUploadPoster = async () => {
    try {
      if (workPoster.length > 0) {
        const poster = await uploadImage({
          file: workPoster[0],
          directory: Directories.WORK,
        });

        if (!poster && !isEdit)
          throw new Error("Greška prilikom uploada postera");
        return poster;
      }
    } catch (error) {
      toast.error("Greška prilikom uploada postera");
    }
  };

  const handleUploadDocument = async () => {
    try {
      if (workDocument.length > 0) {
        const document = await uploadDocument({
          file: workDocument[0],
          directory: Directories.WORK,
        });

        if (!document && !isEdit)
          throw new Error("Greška prilikom uploada dokumenta");
        return document;
      }
    } catch (error) {
      toast.error("Greška prilikom uploada dokumenta");
    }
  };

  const handleUploadPresentation = async () => {
    try {
      if (workPresentation.length > 0) {
        const presentation = await uploadDocument({
          file: workPresentation[0],
          directory: Directories.WORK,
        });

        if (!presentation && !isEdit)
          throw new Error("Greška prilikom uploada prezentacije");
        return presentation;
      }
    } catch (error) {
      toast.error("Greška prilikom uploada prezentacije");
    }
  };

  return (
    <form className={classes.form} onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        form={form}
        attribute="title"
        question="Naslov"
        error={form.formState.errors.title?.message?.toString()}
      />
      <Textarea
        form={form}
        attribute="description"
        question="Abstrakt"
        error={form.formState.errors.description?.message?.toString()}
      />
      <SelectInput
        name="type"
        form={form}
        label="Tip rada"
        options={[...getLiteratureTypesList()].map((type) => ({
          value: type,
          label: getEnumValue(WorkType, type),
        }))}
      />
      <ListInput
        attribute="tags"
        form={form}
        question="Tagovi"
        error={form.formState.errors.tags?.message?.toString()}
      />
      {work?.poster ? (
        <BaseButton text="Izmijeni poster" onClick={handleRemovePoster} />
      ) : (
        <FileUpload isFullWidth onChange={setWorkPoster} name="Poster" />
      )}

      {work?.document ? (
        <BaseButton text="Izmijeni dokument" onClick={handleUploadDocument} />
      ) : (
        <FileUpload isFullWidth onChange={setWorkDocument} name="Dokument" />
      )}

      {work?.presentation ? (
        <BaseButton
          text="Izmijeni prezentaciju"
          onClick={handleUploadPresentation}
        />
      ) : (
        <FileUpload
          isFullWidth
          onChange={setWorkPresentation}
          name="Prezentacija"
        />
      )}

      <BaseButton text="Pošalji" />
    </form>
  );
};
