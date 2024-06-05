"use client";

import { useCreateSocialPost } from "@/api/useCreateSocialPost";
import { useUploadFile } from "@/api/useUploadFile";
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

export interface SocialPostFormProps {
  organisationId: string;
  currentValues: ShortSocialPostResponse;
}

export const SocialPostForm = ({
  organisationId,
  currentValues,
}: SocialPostFormProps) => {
  const { mutateAsync: uploadImage } = useUploadFile();

  const { mutateAsync: createSocialPost } = useCreateSocialPost();
  const schema = z.object({
    title: z
      .string()
      .min(5, "Naslov mora imati više od 5 slova")
      .max(100, "Naslov mora imati manje od 100 slova"),
    text: z
      .string()
      .min(10, "Tekst mora imati više od 10 slova")
      .max(5000, "Tekst mora imati manje od 5000 slova"),
    images: z.array(z.string()),
    authorshipInfoId: z.string().uuid(),
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
    const confirmation = confirm(
      "Da li ste sigurni da želite napraviti objavu, odmah će biti vidljiva svim članovima i pratiteljima?"
    );
    if (!confirmation) return;
    data.organisationId = organisationId;
    const imagePromises =
      !currentValues?.images ||
      images.map((image) =>
        uploadImage({
          file: image,
          directory: Directories.SOCIAL_POST,
        })
      );
    const imageResults =
      currentValues?.images || (await Promise.all(imagePromises));
    data.images = imageResults;

    if (currentValues)
      await createSocialPost({ ...data, id: currentValues.id });
    else await createSocialPost(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
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
      <Input
        form={form}
        attribute="images"
        question="Slike"
        error={form.formState.errors.images?.message?.toString()}
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
      <AuthorshipButton
        form={form}
        type={AuthorshipInfoFields.SOCIAL_POST}
        currentValues={currentValues.authorhipInfo}
      />
      <BaseButton text="Objavi" />
    </form>
  );
};
