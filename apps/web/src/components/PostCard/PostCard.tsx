import { PostResponse } from "@biosfera/types";
import classes from "./PostCard.module.scss";
import Image from "next/image";
import { dateShortener } from "@/utility/static/dateShortener";
import placeholder from "assets/images/user.svg";
import defaultPic from "assets/images/lion.svg";
import likeLeaf from "assets/images/like-leaf.svg";
import Link from "next/link";

export interface PostCardProps {
  post: PostResponse;
}

//will a post have one or more pictures?
//TODO: add functionality of like after backend implementation and user context
//Also a like count somewhere is needed

export const PostCard = ({ post }: PostCardProps) => (
  <div className={classes.container}>
    <div className={classes.upper}>
      <div className={classes.leaf}>
        <div className={classes.likeLeaf}>
          <Image src={likeLeaf} alt="list za like" layout="fill" />
        </div>
      </div>
      <div className={classes.image}>
        <Image src={post.images[0]} alt={post.title} layout="fill" />
      </div>
    </div>
    <div className={classes.content}>
      <span className={classes.date}>{dateShortener(post.updatedAt)}</span>
      <span className={classes.title}>{post.title}</span>
      <div className={classes.author}>
        <div className={classes.profile}>
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
          <Link
            className={classes.exponatName}
            href={`/exponat/${post.exponatId}`}
          >
            vidi više {post.exponatName}
          </Link>
        </div>
      </div>
    </div>
  </div>
);
