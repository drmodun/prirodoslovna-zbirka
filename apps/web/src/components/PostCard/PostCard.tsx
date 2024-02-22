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
import ToggelApprovalButton from "components/ToggleApprovalButton";

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
        <Image src={post.thumbnail} alt={post.title} layout="fill" />
      </div>
    </div>
    {(isUser || isAdmin) && (
      <QueryClientWrapper>
        {isAdmin && (
          <ToggelApprovalButton entity="post" id={post.id} isApproved={post} />
           
          }
        <RemovePostButton postId={post.id} onRemove={onRemove} />
      </QueryClientWrapper>
    )}
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
            eksponat: {post.exponatName}
          </Link>
        </div>
      </div>
    </div>
  </div>
);
