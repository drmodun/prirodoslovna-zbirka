"use client";

import React, { useState } from "react";
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

export interface ShareButtonProps {
  title: string;
  text: string;
  imageUrl?: string;
}

const ShareButton = ({ text, imageUrl, title }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: window.location.href });
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
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link kopiran u međuspremnik");
  };

  return (
    <button title="share" className={classes.container} onClick={handleShare}>
      <Image alt="share" src={share} l />
      <Modal open={isOpen} deMount={handleClose} title="Podijeli" text={text}>
        <div className={classes.sharingRow}>
          <TwitterShareButton title={title} url={window.location.href}>
            <XIcon size={64} round />
          </TwitterShareButton>
          <FacebookShareButton url={window.location.href}>
            <FacebookIcon size={64} round />
          </FacebookShareButton>
          <WhatsappShareButton title={title} url={window.location.href}>
            <WhatsappIcon size={64} round />
          </WhatsappShareButton>
          <EmailShareButton
            subject={title}
            body={text}
            url={window.location.href}
          >
            <EmailIcon size={64} round />
          </EmailShareButton>
          {imageUrl && (
            <PinterestShareButton media={imageUrl} url={window.location.href}>
              <PinterestIcon size={64} round />
            </PinterestShareButton>
          )}
          <TelegramShareButton title={title} url={window.location.href}>
            <TelegramIcon size={64} round />
          </TelegramShareButton>
          <ViberShareButton title={title} url={window.location.href}>
            <ViberIcon size={64} round />
          </ViberShareButton>
          <RedditShareButton title={title} url={window.location.href}>
            <RedditIcon size={64} round />
          </RedditShareButton>
          <TumblrShareButton title={title} url={window.location.href}>
            <TumblrIcon size={64} round />
          </TumblrShareButton>
          <button onClick={copyToClipboard} className={classes.copyToClipboard}>
            <Image alt="kopiraj vezu" src={copy} />
          </button>
        </div>
      </Modal>
    </button>
  );
};

export default ShareButton;
