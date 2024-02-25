"use client";
import { PostResponseExtended } from "@biosfera/types";
import classes from "./PostView.module.scss";
import Image from "next/image";
import placeholder from "assets/images/lion.svg";
import { dateShortener } from "@/utility/static/dateShortener";
import Link from "next/link";
import useUser from "@/utility/context/UserContext";
import { useToggleLike } from "@/api/useToggleLike";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import { getPfpUrl } from "@/utility/static/getPfpUrl";
import { useEffect } from "react";

export interface PostViewProps {
  post: PostResponseExtended;
}

export const PostView = ({ post }: PostViewProps) => {
  if (!post) return (window.location.href = "/404");
  return (
    <div className={classes.container}>
      <div className={classes.mainImage}>
        <ImageWithFallback layout="fill" src={post.image} alt={post.title} />
      </div>
      <div className={classes.info}>
        <div className={classes.authorImage}>
          <ImageWithFallback
            src={getPfpUrl(post.authorId)}
            alt={post.authorName}
            layout="fill"
          />
        </div>
        <span className={classes.authorName}>{post.authorFullName}</span>
        <span className={classes.updated}>{dateShortener(post.updatedAt)}</span>
      </div>
      <div className={classes.title}>
        <span>{post.title}</span>
      </div>
      <div className={classes.buttons}>
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
