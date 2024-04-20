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
import { use, useEffect, useState } from "react";
import QrCodeGenerator from "components/QrCodeButton";
import ShareButton from "components/ShareButton";
import { LoaderIcon } from "react-hot-toast";
import AudioButton from "components/AudioButton";

export interface PostViewProps {
  post: PostResponseExtended;
  audio?: Promise<string | undefined>;
}

export const PostView = ({ audio, post }: PostViewProps) => {
  const [audioDescription, setAudioDescription] = useState<string | null>(null);

  const handleAudioDescription = async () => {
    setAudioDescription((await audio!) as string);
  };

  useEffect(() => {
    if (audio) {
      handleAudioDescription();
    }
  }, []);

  if (!post) return (window.location.href = "/404");

  return (
    <div className={classes.container}>
      <div className={classes.mainImage}>
        <ImageWithFallback layout="fill" src={post.image} alt={post.title} />
      </div>
      <div className={classes.info}>
        <div className={classes.authorImage}>
          <Link href={`/user/${post.authorId}`}>
            <ImageWithFallback
              src={getPfpUrl(post.authorId)}
              alt={post.authorName}
              layout="fill"
            />
          </Link>
        </div>
        <Link href={`/user/${post.authorId}`}>
          <span className={classes.authorName}>{post.authorFullName}</span>
        </Link>
        <span className={classes.updated}>{dateShortener(post.updatedAt)}</span>
      </div>
      <div className={classes.title}>
        <span>{post.title}</span>
      </div>
      <div className={classes.buttons}>
        <Link href={`/exponat/${post.exponatId}`} className={classes.button}>
          Pogledaj eksponat
        </Link>
        <QrCodeGenerator name={post.title} isIcon />
        <ShareButton
          title={post.title}
          text={`Pogledajte post ${post.title} na biosfera.trema.hr`}
        />
        {audioDescription ? (
          <AudioButton src={audioDescription} />
        ) : (
          <div className={classes.spinnerContainer}>
            <div className={classes.spinner}></div>
          </div>
        )}
      </div>
      <div className={classes.text}>
        <span>{post.content}</span>
      </div>
    </div>
  );
};
