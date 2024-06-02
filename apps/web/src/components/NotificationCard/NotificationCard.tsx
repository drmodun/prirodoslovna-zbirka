"use client";

import { NotificationResponse } from "@biosfera/types";
import classes from "./NotificationCard.module.scss";
import Image from "next/image";
import clsx from "clsx";
import { useMarkAsRead } from "@/api/useMarkAsRead";
import { useRouter } from "next/navigation";
import useNotification from "@/utility/context/NotificationContext";
import { getPfpUrl } from "@/utility/static/getPfpUrl";
import ImageWithFallback from "components/ImageWithFallback/ImageWithFallback";
import placeholder from "assets/images/profile-image-placeholder.png";

export interface NotificationCardProps {
  notification: NotificationResponse;
}

export const NotificationCard = ({ notification }: NotificationCardProps) => {
  const { mutateAsync } = useMarkAsRead();
  const router = useRouter();
  const { markAsRead } = useNotification();

  const handleClick = async () => {
    await mutateAsync(notification.id);
    markAsRead(notification.id);
    notification.link && router.push(notification.link);
  };

  return (
    <div
      className={clsx(classes.container, notification.read && classes.read)}
      onClick={handleClick}
    >
      {notification.notificationImage && (
        <figure className={classes.image}>
          <ImageWithFallback
            src={
              notification.type === "NEW_FOLLOWER" ||
              notification.type === "MEMBERSHIP_REQUEST"
                ? getPfpUrl(notification.notificationImage)
                : notification.notificationImage
            }
            alt="img"
            fallbackSrc={placeholder}
            layout="fill"
          />
        </figure>
      )}
      <div className={classes.content}>
        <div className={classes.upper}>
          <span className={classes.title}>{notification.title}</span>
          <span className={classes.date}>
            {new Date(notification.createdAt).toLocaleDateString()}
          </span>
        </div>
        <span className={classes.text}>
          {notification.text ? notification.text : "Nema teksta"}
        </span>
      </div>
    </div>
  );
};
