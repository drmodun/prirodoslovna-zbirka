"use client";

import React, { useEffect, useState } from "react";
import classes from "./ShareButton.module.scss";
import Image from "next/image";
import share from "assets/icons/share.svg";
import Modal from "components/BaseModal";
import copy from "assets/icons/copy.svg";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  PinterestIcon,
  PinterestShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TumblrIcon,
  TumblrShareButton,
  TwitterShareButton,
  ViberIcon,
  ViberShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  XIcon,
} from "react-share";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export interface ShareButtonProps {
  title: string;
  text: string;
  imageUrl?: string;
}

const ShareButton = ({ text, imageUrl, title }: ShareButtonProps) => {
  const t = useTranslations("ShareButton");
  const [isOpen, setIsOpen] = useState(false);
  // window is not available while the server renders this component.
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success(t("copied"));
  };

  return (
    <button
      title={t("share")}
      className={classes.container}
      onClick={handleShare}
    >
      <Image alt="share" src={share} />
      <Modal open={isOpen} deMount={handleClose} title={t("share")} text={text}>
        <div className={classes.sharingRow}>
          <TwitterShareButton title={title} url={url}>
            <XIcon size={64} round />
          </TwitterShareButton>
          <FacebookShareButton url={url}>
            <FacebookIcon size={64} round />
          </FacebookShareButton>
          <WhatsappShareButton title={title} url={url}>
            <WhatsappIcon size={64} round />
          </WhatsappShareButton>
          <EmailShareButton subject={title} body={text} url={url}>
            <EmailIcon size={64} round />
          </EmailShareButton>
          {imageUrl && (
            <PinterestShareButton media={imageUrl} url={url}>
              <PinterestIcon size={64} round />
            </PinterestShareButton>
          )}
          <TelegramShareButton title={title} url={url}>
            <TelegramIcon size={64} round />
          </TelegramShareButton>
          <ViberShareButton title={title} url={url}>
            <ViberIcon size={64} round />
          </ViberShareButton>
          <RedditShareButton title={title} url={url}>
            <RedditIcon size={64} round />
          </RedditShareButton>
          <TumblrShareButton title={title} url={url}>
            <TumblrIcon size={64} round />
          </TumblrShareButton>
          <button onClick={copyToClipboard} className={classes.copyToClipboard}>
            <Image alt={t("copy")} src={copy} />
          </button>
        </div>
      </Modal>
    </button>
  );
};

export default ShareButton;
