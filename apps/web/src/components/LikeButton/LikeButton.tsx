"use client";
import Image from "next/image";
import classes from "./LikeButton.module.scss";
import likeLeaf from "assets/images/like-leaf.svg";
import { useGetMe } from "@/api/useGetMe";
import useUser from "@/utility/context/UserContext";
import clsx from "clsx";
import { useToggleLike } from "@/api/useToggleLike";
import { useState } from "react";

export interface LikeButtonProps {
  postId: string;
}

export const LikeButton = ({ postId }: LikeButtonProps) => {
  const { likedPosts } = useUser();
  const { mutateAsync } = useToggleLike();

  const [isLiked, setIsLiked] = useState(
    likedPosts.find((x) => x.id === postId) != null
  );

  const toggleLike = async () => {
    await mutateAsync(postId);
    setIsLiked((prev) => !prev);
  };

  return (
    <button
      className={clsx(classes.leaf, isLiked && classes.liked)}
      title="like"
      onClick={toggleLike}
    >
      <div className={classes.likeLeaf}>
        <Image src={likeLeaf} alt="list za like" layout="fill" />
      </div>
    </button>
  );
};
