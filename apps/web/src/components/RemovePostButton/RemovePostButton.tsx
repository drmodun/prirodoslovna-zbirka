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

export interface RemovePostButtonProps {
  postId: string;
}

export const RemovePostButton: React.FC<RemovePostButtonProps> = ({
  postId,
}) => {
  const { mutate, isSuccess } = useRemovePost();
  const { posts, updatePosts, likedPosts, updateLikes } = useUser();

  const handleDelete = () => {
    const confirm = window.confirm(
      "Jeste li sigurni da želite maknuti objavu?"
    );
    confirm && mutate(postId);

    if (posts.some((x: PostResponse) => x.id === postId)) {
      const postToRemove = posts.find((x: PostResponse) => x.id === postId);
      updatePosts(postToRemove!);
    }

    if (likedPosts.some((x: PostResponse) => x.id === postId)) {
      const likeToRemove = likedPosts.find(
        (x: PostResponse) => x.id === postId
      );
      updateLikes(likeToRemove!);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      window.location.reload(); //TODO: possibly change the solution later
    }
  }, [isSuccess]);

  return (
    <div className={classes.container}>
      <button
        onClick={handleDelete}
        title="Delete Post"
        className={classes.removalButton}
      >
        <Image title="Makni objavu" src={remove} alt="Makni objavu" />
      </button>
      <Link href={`/post/${postId}/edit`} className={classes.edit}>
        <Image src={edit} alt="edit" />
      </Link>
    </div>
  );
};
