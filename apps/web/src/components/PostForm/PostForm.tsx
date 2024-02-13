"use client";

import { useUploadFile } from "@/api/useUploadFile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import classes from "./PostForm.module.scss";
import Input from "components/Input";
import Textarea from "components/Textarea";
import FileUpload from "components/FileUpload";
import { Directories } from "@biosfera/types";
import { useCreatePost } from "@/api/useCreatePost";

export interface PostFormProps {
  exponatId: string;
}

export const PostForm = ({ exponatId }: PostFormProps) => {
  const schema = z.object({
    title: z.string(),
    text: z.string(),
  });

  const { mutateAsync: uploadFile } = useUploadFile();
  const { mutateAsync: createPost } = useCreatePost();

  const [image, setImage] = useState<File[]>([]);
  const [thumbnail, setThumbnail] = useState<File[]>([]);

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const onSumbit = async (data: any) => {
    console.log(data);
    const imageResponse = await uploadFile({
      file: image[0],
      directory: Directories.POST,
    });
    const thumbnailResponse = await uploadFile({
      file: thumbnail[0],
      directory: Directories.POST,
    });

    data.image = imageResponse;
    data.thumbnail = thumbnailResponse;

    await createPost({ post: data, exponatId: exponatId });

    console.log(imageResponse);
    console.log(thumbnailResponse);
  };

  return (
    <div className={classes.container}>
      <span className={classes.title}>Napravite novu objavu</span>
      <form action={onSumbit} className={classes.form}>
        <Input
          form={form}
          attribute="title"
          question="Naslov"
          error={form.formState.errors.title?.message?.toString()}
        />
        <Textarea
          form={form}
          attribute="text"
          question="Unesite tekst objave, markdown je podržan"
          error={form.formState.errors.text?.message?.toString()}
        />
        <FileUpload onChange={setThumbnail} name="Naslovna slika" />
        <FileUpload onChange={setImage} name="Glavna slika" />
      </form>
    </div>
  );
};
