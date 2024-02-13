import { PostResponseExtended } from "@biosfera/types";
import classes from "./PostView.module.scss";
import Image from "next/image";
import placeholder from "assets/images/lion.svg";

export interface PostViewProps {
  post: PostResponseExtended;
}

export const PostView = ({ post }: PostViewProps) => (
  <div className={classes.container}>
    <div className={classes.mainImage}>
      <Image src={post.image} alt={post.title} layout="fill" />
    </div>
    <div className={classes.info}>
      <div className={classes.authorImage}>
        <Image src={placeholder} alt={post.authorName} layout="fill" />
      </div>
      <span className={classes.authorName}>{post.authorFullName}</span>
      <span className={classes.updated}>{post.updatedAt.toLocaleString()}</span>
    </div>
    <div className={classes.title}>
      <span>{post.title}</span>
    </div>
    <div className={classes.buttons}>
      <button className={classes.button}>Like</button>
      <button className={classes.button}>Share</button>
      <button className={classes.button}>Pogledaj eksponat</button>
    </div>
    <div className={classes.text}>
      <span>{post.content}</span>
    </div>
  </div>
);
