import { PostResponse } from "@biosfera/types";
import classes from "./PostCard.module.scss";
import Image from "next/image";
import { dateShortener } from "@/utility/static/dateShortener";
import placeholder from "assets/images/placeholder.png";
import defaultPic from "assets/images/lion.svg";
import Link from "next/link";

export interface PostCardProps {
  post: PostResponse;
}

//will a post have one or more pictures?

export const PostCard = ({ post }: PostCardProps) => (
  <div className={classes.container}>
    <div className={classes.image}>
      <Image src={post.images[0]} alt={post.title} layout="fill" />
    </div>
    <div className={classes.content}>
      <span className={classes.date}>{dateShortener(post.updatedAt)}</span>
      <span className={classes.title}>{post.title}</span>
      <div className={classes.auhor}>
        <div className={classes.pfp}>
          <Image
            src={post.hasProfilePicture ? defaultPic : placeholder}
            alt={post.authorName}
            layout="fill"
          />
        </div>
        <div className={classes.authorInfo}>
          <Link href={`/user/${post.authorId}`} className={classes.authorName}>
            {post.authorName}
          </Link>
          <Link href={`/exponat/${post.exponatId}`}>{post.exponatName}</Link>
        </div>
      </div>
    </div>
  </div>
);
