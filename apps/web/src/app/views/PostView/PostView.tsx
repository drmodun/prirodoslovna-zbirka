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
import chatgpt from "assets/images/gpt.svg";

export interface PostViewProps {
  post: PostResponseExtended;
  audio?: Promise<string | undefined>;
  summary?: Promise<string>;
}

export const PostView = ({ audio, post, summary }: PostViewProps) => {
  const [audioDescription, setAudioDescription] = useState<string | null>(null);
  const [textSummary, setSummary] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const handleAudioDescription = async () => {
    setAudioDescription((await audio!) as string);
  };

  const handleSummary = async () => {
    setSummary((await summary) as string);
  };

  useEffect(() => {
    if (audio) {
      handleAudioDescription();
    }

    if (summary) {
      handleSummary();
    }
  }, []);

  const toggleSummary = () => {
    setShowSummary((prev) => !prev);
  };

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
        <button className={classes.button} onClick={toggleSummary}>
          Pogledaj sažetak
        </button>
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
      {showSummary && (
        <div className={classes.desc}>
          <div className={classes.header}>
            <div className={classes.icon}>
              <Image src={chatgpt} alt="chatgpt" layout="fill" />
            </div>
            <span className={classes.title}>AI generirani sažetak objave</span>
          </div>
          <pre className={classes.text}>
            {textSummary ? textSummary : "Učitavanje..."}
          </pre>
          <span className={classes.warning}>
            Molimo vas da provjerite točnost informacija, AI postaje sve bolji
            ali dalje relativno često zna griješiti
          </span>
        </div>
      )}
      <div className={classes.text}>
        <span>{post.content}</span>
      </div>
    </div>
  );
};
