import {
  getEnumValue,
  ShortSocialPostResponse,
  SocialPostType,
} from "@biosfera/types";
import classes from "./SocialPostCard.module.scss";
import Image from "next/image";
import Link from "next/link";
import ToggleApprovalButton from "components/ToggleApprovalButton";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import { Carousel } from "react-responsive-carousel";
import AuthorshipTable from "components/AuthorshipTable";
import { dateShortener } from "@/utility/static/dateShortener";

export interface SocialPostCardProps {
  post: ShortSocialPostResponse;
}

const settings = {
  showArrows: false,
  interval: 3500,
  dynamicHeight: false,
  stopOnHover: false,
  infiniteLoop: true,
  showStatus: false,
  transitionTime: 500,
  showThumbs: false,
  showIndicators: true,
  swipeable: true,
  emulateTouch: true,
  autoPlay: true,
};

export const SocialPostCard = ({ post }: SocialPostCardProps) => (
  <div className={classes.container}>
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
      <span className={classes.date}>{dateShortener(post.updatedAt)}</span>
    </div>
    <div className={classes.content}>
      <span className={classes.type}>
        {getEnumValue(post.type, SocialPostType) || "Objava"}
      </span>
      <span className={classes.title}>{post.title}</span>
      <span className={classes.text}>{post.text}</span>
    </div>
    <Carousel {...settings} className={classes.carousel}>
      {post.images.map((image, index) => (
        <div key={index}>
          <img src={image} alt="post image" />
        </div>
      ))}
    </Carousel>
    {post.authorhipInfo && (
      <AuthorshipTable authorshipInfo={post.authorhipInfo} />
    )}
  </div>
);
