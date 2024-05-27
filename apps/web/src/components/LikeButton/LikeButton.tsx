"use client";
import Image from "next/image";
import classes from "./LikeButton.module.scss";
import likeLeaf from "assets/images/like-leaf.svg";
import { useGetMe } from "@/api/useGetMe";
import useUser from "@/utility/context/UserContext";
import clsx from "clsx";
import { useToggleLike } from "@/api/useToggleLike";
import { useEffect, useState } from "react";
import { PostResponse, PostResponseExtended } from "@biosfera/types";

export interface LikeButtonProps {
  post: PostResponse | PostResponseExtended;
}

export const LikeButton = ({ post }: LikeButtonProps) => {
  const { likedPosts, updateLikes, loading } = useUser();
  const { mutateAsync } = useToggleLike();

  const [isLiked, setIsLiked] = useState(
    likedPosts.find((x) => x.id === post.id) != null,
  );

  useEffect(() => {
    setIsLiked(likedPosts.find((x) => x.id === post.id) != null);
  }, [likedPosts, loading]);

  const toggleLike = async () => {
    await mutateAsync(post.id);
    updateLikes(post);
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
