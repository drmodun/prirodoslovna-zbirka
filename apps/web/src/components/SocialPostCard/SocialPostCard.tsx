import { ShortSocialPostResponse } from "@biosfera/types";
import classes from "./SocialPostCard.module.scss";
import Image from "next/image";
import Link from "next/link";
import ToggleApprovalButton from "components/ToggleApprovalButton";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";

export interface SocialPostCardProps {
  post: ShortSocialPostResponse;
}

export const SocialPostCard = ({ post }: SocialPostCardProps) => (
  <div className={classes.container}>
    <Image
      src={post?.image || "/assets/images/placeholder.svg"}
      alt="post"
      layout="fill"
      className={classes.image}
    />
    <div className={classes.content}>
      <span className={classes.date}>{post.createdAt.toLocaleString()}</span>
      <span className={classes.title}>{post.title}</span>
      <span className={classes.text}>{post.text}</span>
      <div className={classes.author}>
        <div className={classes.authorImage}>
          <ImageWithFallback
            src={post.organisationMainImage}
            alt="author"
            layout="fill"
          />
        </div>
        <Link
          href={`/organisation/${post.organisationId}`}
          className={classes.authorName}
        >
          {post.organisationName}
        </Link>
      </div>
    </div>
  </div>
);
