"use client";

import { useCreateSocialPost } from "@/api/useCreateSocialPost";
import { useUpdateSocialPost } from "@/api/useUpdateSocialPost";
import { useUploadFile } from "@/api/useUploadFile";
import classes from "./SocialPostForm.module.scss";
import {
  Directories,
  getEnumValue,
  ShortSocialPostResponse,
  SocialPostType,
} from "@biosfera/types";
import { zodResolver } from "@hookform/resolvers/zod";
import AttributeInput from "components/AttributeInput";
import AuthorshipButton from "components/AuthorshipButton";
import AuthorshipInfoModal from "components/AuthorshipInfoModal";
import { AuthorshipInfoFields } from "components/AuthorshipInfoModal/AuthorshipInfoModal";
import BaseButton from "components/BaseButton";
import FileUpload from "components/FileUpload";
import Input from "components/Input";
import SelectInput from "components/SelectInput";
import Textarea from "components/Textarea";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import toast from "react-hot-toast";

export interface SocialPostFormProps {
  organisationId: string;
  currentValues?: ShortSocialPostResponse;
}

export const SocialPostForm = ({
  organisationId,
  currentValues,
}: SocialPostFormProps) => {
  const { mutateAsync: uploadImage } = useUploadFile();

  const { mutateAsync: createSocialPost } = useCreateSocialPost();
  const { mutateAsync: updateSocialPost } = useUpdateSocialPost();

  //TODO: see if enforcing adding authorship info is needed

  const schema = z.object({
    title: z
      .string()
      .min(5, "Naslov mora imati više od 5 slova")
      .max(100, "Naslov mora imati manje od 100 slova"),
    text: z
      .string()
      .min(10, "Tekst mora imati više od 10 slova")
      .max(5000, "Tekst mora imati manje od 5000 slova"),
    authorshipInfoId: z.optional(z.string().uuid()),
    type: z
      .enum(["", ...Object.keys(SocialPostType)])
      .default(getEnumValue(SocialPostType, currentValues?.type ?? "STORY")),
  });

  const [images, setImages] = useState<File[]>([]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...currentValues,
    } as FieldValues,
  });

  const onSubmit = async (data: any) => {
    if (images.length && !data.authorshipInfoId)
      return toast.error("Morate dodati autorske informacije za slike");

    const confirmation = window.confirm(
      `Jeste li ste sigurni da želite ${
        currentValues ? "promjeniti" : "napraviti"
      } objavu, odmah će biti vidljiva svim članovima i pratiteljima?`,
    );

    if (!confirmation) return;

    data.organisationId = organisationId;

    const imagePromises = !images?.length
      ? currentValues?.images || []
      : images.map((image) =>
          uploadImage({
            file: image,
            directory: Directories.SOCIAL_POST,
          }),
        );
    const imageResults = !images.length
      ? currentValues?.images || []
      : await Promise.all(imagePromises);

    data.images = imageResults;

    if (!currentValues)
      await createSocialPost({
        data,
        organisationId,
      });
    else await updateSocialPost({ ...data, id: currentValues?.id });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
      <Input
        form={form}
        attribute="title"
        question="Naslov"
        error={form.formState.errors.title?.message?.toString()}
      />
      <Textarea
        form={form}
        attribute="text"
        question="Tekst"
        error={form.formState.errors.text?.message?.toString()}
      />
      <SelectInput
        form={form}
        name="type"
        label="Tip objave"
        options={
          Object.keys(SocialPostType).map((key) => ({
            value: key,
            label: getEnumValue(SocialPostType, key),
          })) ?? []
        }
        error={form.formState.errors.type?.message?.toString()}
      />
      <FileUpload
        name="Slike (max 5)"
        isFullWidth
        maxFiles={5}
        onChange={setImages}
      />
      {form.formState.errors.images?.message && (
        <p className={classes.error}>
          {form.formState.errors.images?.message?.toString()}
        </p>
      )}
      <AuthorshipButton
        form={form}
        type={AuthorshipInfoFields.SOCIAL_POST}
        currentValues={currentValues?.authorhipInfo}
      />
      {form.formState.errors.authorshipInfoId?.message && (
        <p className={classes.error}>
          {form.formState.errors.authorshipInfoId?.message?.toString()}
        </p>
      )}
      <BaseButton
        text="Objavi"
        isNotSubmit={false}
        onClick={() => console.log("clicked")}
      />
    </form>
  );
};
