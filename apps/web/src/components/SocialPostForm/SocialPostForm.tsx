"use client";

import { useCreateSocialPost } from "@/api/useCreateSocialPost";
import { useUpdateSocialPost } from "@/api/useUpdateSocialPost";
import { useUploadFile } from "@/api/useUploadFile";
import classes from "./SocialPostForm.module.scss";
import {
  Directories,
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
import { useTranslations } from "next-intl";

export interface SocialPostFormProps {
  organisationId: string;
  currentValues?: ShortSocialPostResponse;
}

export const SocialPostForm = ({
  organisationId,
  currentValues,
}: SocialPostFormProps) => {
  const t = useTranslations("SocialPostForm");
  const tTypes = useTranslations("Enums.SocialPostType");
  const { mutateAsync: uploadImage } = useUploadFile();

  const { mutateAsync: createSocialPost } = useCreateSocialPost();
  const { mutateAsync: updateSocialPost } = useUpdateSocialPost();

  //TODO: see if enforcing adding authorship info is needed

  const schema = z.object({
    title: z.string().min(5, t("titleMin")).max(100, t("titleMax")),
    text: z.string().min(10, t("textMin")).max(5000, t("textMax")),
    authorshipInfoId: z.optional(z.string().uuid()),
    type: z
      .enum(["", ...Object.keys(SocialPostType)])
      .default(currentValues?.type ?? "STORY"),
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
      return toast.error(t("authorshipRequired"));

    const confirmation = window.confirm(
      currentValues ? t("confirmUpdate") : t("confirmCreate"),
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
    else {
      const { organisationId: _organisation, ...socialPost } = data;
      await updateSocialPost({
        socialPost,
        organisationId,
        id: currentValues.id,
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
      <Input
        form={form}
        attribute="title"
        question={t("title")}
        error={form.formState.errors.title?.message?.toString()}
      />
      <Textarea
        form={form}
        attribute="text"
        question={t("text")}
        error={form.formState.errors.text?.message?.toString()}
      />
      <SelectInput
        form={form}
        name="type"
        label={t("type")}
        options={
          Object.keys(SocialPostType).map((key) => ({
            value: key,
            label: tTypes(key),
          })) ?? []
        }
        error={form.formState.errors.type?.message?.toString()}
      />
      <FileUpload
        name={t("images")}
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
        text={t("submit")}
        isNotSubmit={false}
        onClick={() => console.log("clicked")}
      />
    </form>
  );
};
