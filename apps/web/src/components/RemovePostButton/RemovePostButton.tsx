"use client";
import { useRemovePost } from "@/api/useRemovePost";
import classes from "./RemovePostButton.module.scss";
import remove from "assets/images/remove.svg";
import edit from "assets/images/edit.svg";
import Image from "next/image";
import { useEffect } from "react";
import { PostResponse } from "@biosfera/types";
import useUser from "@/utility/context/UserContext";
import Link from "next/link";
import { useTranslations } from "next-intl";

export interface RemovePostButtonProps {
  postId: string;
  onRemove?: (id: string) => void;
  isHidden?: boolean;
  isAdmin?: boolean;
}

export const RemovePostButton: React.FC<RemovePostButtonProps> = ({
  postId,
  isAdmin,
  onRemove,
  isHidden,
}) => {
  const t = useTranslations("RemovePostButton");
  const { mutate, isSuccess } = useRemovePost();
  const { posts, updatePosts, likedPosts, updateLikes } = useUser();

  const handleDelete = () => {
    const confirm = window.confirm(t("confirm"));
    if (!confirm) return;
    mutate(postId);

    if (posts.some((x: PostResponse) => x.id === postId)) {
      const postToRemove = posts.find((x: PostResponse) => x.id === postId);
      updatePosts(postToRemove!);
    }

    if (likedPosts.some((x: PostResponse) => x.id === postId)) {
      const likeToRemove = likedPosts.find(
        (x: PostResponse) => x.id === postId,
      );
      updateLikes(likeToRemove!);
    }
  };

  useEffect(() => {
    isSuccess && onRemove && onRemove(postId);
  }, [isSuccess]);

  return (
    <div className={classes.container}>
      <button
        onClick={handleDelete}
        title={t("label")}
        className={classes.removalButton}
      >
        <Image src={remove} alt={t("label")} />
      </button>
      {!isHidden && !isAdmin && (
        <Link href={`/post/${postId}/edit`} className={classes.edit}>
          <Image src={edit} alt={t("edit")} />
        </Link>
      )}
    </div>
  );
};
