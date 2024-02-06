"use client";
import Image from "next/image";
import classes from "./LikeButton.module.scss";
import likeLeaf from "assets/images/like-leaf.svg";
import { useGetMe } from "@/api/useGetMe";
import useUser from "@/utility/context/UserContext";
import clsx from "clsx";

export interface LikeButtonProps {
  postId: string;
}

export const LikeButton = ({ postId }: LikeButtonProps) => {
  const { likedPosts } = useUser();

  return (
    <button
      className={clsx(
        classes.leaf,
        likedPosts.find((x) => x.id === postId) && classes.liked
      )}
      title="like"
    >
      <div className={classes.likeLeaf}>
        <Image src={likeLeaf} alt="list za like" layout="fill" />
      </div>
    </button>
  );
};
