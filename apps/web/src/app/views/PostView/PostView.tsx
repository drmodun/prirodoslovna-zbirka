"use client";
import { PostResponseExtended } from "@biosfera/types";
import classes from "./PostView.module.scss";
import Image from "next/image";
import placeholder from "assets/images/lion.svg";
import { dateShortener } from "@/utility/static/dateShortener";
import Link from "next/link";
import useUser from "@/utility/context/UserContext";
import { useToggleLike } from "@/api/useToggleLike";

export interface PostViewProps {
  post: PostResponseExtended;
}

export const PostView = ({ post }: PostViewProps) => {
  const { likedPosts } = useUser();
  const { mutate } = useToggleLike();

  return (
    <div className={classes.container}>
      <div className={classes.mainImage}>
        <Image src={post.image} alt={post.title} layout="fill" />
      </div>
      <div className={classes.info}>
        <div className={classes.authorImage}>
          <Image src={placeholder} alt={post.authorName} layout="fill" />
        </div>
        <span className={classes.authorName}>{post.authorFullName}</span>
        <span className={classes.updated}>{dateShortener(post.updatedAt)}</span>
      </div>
      <div className={classes.title}>
        <span>{post.title}</span>
      </div>
      <div className={classes.buttons}>
        <button className={classes.button} onClick={() => mutate(post.id)}>
          {likedPosts.find((x) => x.id === post.id) != null ? "Unlike" : "Like"}
        </button>
        <button className={classes.button}>Share</button>
        <Link href={`/exponat/${post.exponatId}`} className={classes.button}>
          Pogledaj eksponat
        </Link>
      </div>
      <div className={classes.text}>
        <span>{post.content}</span>
      </div>
    </div>
  );
};