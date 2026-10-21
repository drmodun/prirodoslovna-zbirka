"use client";

import { useUploadFile } from "@/api/useUploadFile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import classes from "./PostForm.module.scss";
import Input from "components/Input";
import Textarea from "components/Textarea";
import FileUpload from "components/FileUpload";
import { Directories, PostResponseExtended } from "@biosfera/types";
import { useCreatePost } from "@/api/useCreatePost";
import BaseButton from "components/BaseButton";
import { useUpdatePost } from "@/api/useUpdatePost";
import toast from "react-hot-toast";
import AuthorshipButton from "components/AuthorshipButton";
import { AuthorshipInfoFields } from "components/AuthorshipInfoModal/AuthorshipInfoModal";
import { useTranslations } from "next-intl";

export interface PostFormProps {
  exponatId: string;
  isEdit?: boolean;
  values?: PostResponseExtended;
}

export const PostForm = ({ exponatId, isEdit, values }: PostFormProps) => {
  const t = useTranslations("PostForm");
  const schema = z.object({
    title: z.string().min(5, t("titleMin")),
    text: z.string().min(10, t("textMin")).max(20000, t("textMax")),
    // Set by the AuthorshipButton; the resolver drops keys it does not know.
    authorshipInfoId: z.string().optional(),
  });

  const { mutateAsync: uploadFile } = useUploadFile();
  const { mutateAsync: createPost } = useCreatePost();
  const { mutateAsync: updatePost } = useUpdatePost();

  const [image, setImage] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<File[]>([]);

  const form = useForm({
    resolver: zodResolver(schema),
    ...(isEdit && {
      defaultValues: {
        ...values,
        text: values?.content,
      } as FieldValues,
    }),
  });

  const onSumbit = async (data: any) => {
    if ((image.length === 0 || thumbnail.length === 0) && !isEdit) {
      toast.error(t("imagesRequired"), { id: "create-post" });
      return;
    }
    const imageResponse =
      image[0] &&
      (await uploadFile({
        file: image[0],
        directory: Directories.POST,
      }));
    const thumbnailResponse =
      thumbnail[0] &&
      (await uploadFile({
        file: thumbnail[0],
        directory: Directories.POST,
      }));

    data.image = imageResponse || values?.image;
    data.thumbnailImage = thumbnailResponse || values?.thumbnail;

    const response = isEdit
      ? await updatePost({ updatePostDto: data, postId: values?.id! })
      : await createPost({ post: data, exponatId: exponatId });

    if (response) {
      setTimeout(() => {
        window.location.href = `/post/${response.id}`;
      });
    }
  };

  return (
    <div className={classes.container}>
      <span className={classes.title}>
        {isEdit ? t("editTitle") : t("createTitle")}
      </span>
      <form onSubmit={form.handleSubmit(onSumbit)} className={classes.form}>
        <Input
          form={form}
          attribute="title"
          question={t("title")}
          error={form.formState.errors.title?.message?.toString()}
        />
        <Textarea
          form={form}
          attribute="text"
          minRows={15}
          question={t("text")}
          error={form.formState.errors.text?.message?.toString()}
        />
        <div className={classes.fileUploads}>
          <FileUpload onChange={setThumbnail} name={t("thumbnail")} />
          <FileUpload onChange={setImage} name={t("image")} />
        </div>
        <AuthorshipButton
          form={form}
          type={AuthorshipInfoFields.POST}
          currentValues={values?.authorshipInfo}
        />
        <BaseButton text={t("submit")} />
      </form>
    </div>
  );
};

//TODO: fix search on users
