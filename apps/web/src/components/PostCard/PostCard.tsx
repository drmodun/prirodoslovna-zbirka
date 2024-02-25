import { PostResponse } from "@biosfera/types";
import classes from "./PostCard.module.scss";
import Image from "next/image";
import { dateShortener } from "@/utility/static/dateShortener";
import placeholder from "assets/images/user.svg";
import defaultPic from "assets/images/lion.svg";
import likeLeaf from "assets/images/like-leaf.svg";
import Link from "next/link";
import { UserWrapper } from "@/utility/wrappers/userWrapper";
import LikeButton from "components/LikeButton";
import { RemovePostButton } from "components/RemovePostButton/RemovePostButton";
import { Query } from "react-query";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import ToggleApprovalButton from "components/ToggleApprovalButton";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import { getPfpUrl } from "@/utility/static/getPfpUrl";

export interface PostCardProps {
  post: PostResponse;
  isAdmin?: boolean;
  isUser?: boolean;
  onRemove?: (id: string) => void;
}

//will a post have one or more pictures?
//TODO: add functionality of like after backend implementation and user context
//Also a like count somewhere is needed

export const PostCard = ({
  post,
  isUser,
  isAdmin,
  onRemove,
}: PostCardProps) => (
  <div className={classes.container}>
    <div className={classes.upper}>
      <UserWrapper>
        <LikeButton post={post} />
      </UserWrapper>
      <div className={classes.image}>
        <ImageWithFallback
          src={post.thumbnail}
          layout="fill"
          fallbackSrc={defaultPic}
          alt={post.title}
        />
      </div>
    </div>
    {(isUser || isAdmin) && (
      <QueryClientWrapper>
        {isAdmin && (
          <ToggleApprovalButton
            entity="posts"
            id={post.id}
            isApproved={post.isApproved}
          />
        )}
        <RemovePostButton postId={post.id} onRemove={onRemove} />
      </QueryClientWrapper>
    )}
    <div className={classes.content}>
      <span className={classes.date}>{dateShortener(post.updatedAt)}</span>
      <Link href={`/post/${post.id}`}>
        <span className={classes.title}>{post.title}</span>
      </Link>
      <div className={classes.likes}>
        <div className={classes.image}>
          <Image src={likeLeaf} alt="like" layout="fill" />
        </div>
        <span className={classes.likeCount}>{post.likeScore}</span>
      </div>
      <div className={classes.author}>
        <div className={classes.profile}>
          <ImageWithFallback
            src={getPfpUrl(post.authorId)}
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
            eksponat: {post.exponatName}
          </Link>
        </div>
      </div>
    </div>
  </div>
);
