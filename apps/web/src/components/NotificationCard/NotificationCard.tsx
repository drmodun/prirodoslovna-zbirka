"use client";

import { NotificationResponse } from "@biosfera/types";
import classes from "./NotificationCard.module.scss";
import Image from "next/image";
import clsx from "clsx";
import { useMarkAsRead } from "@/api/useMarkAsRead";
import { useRouter } from "next/router";

export interface NotificationCardProps {
  notification: NotificationResponse;
}

export const NotificationCard = ({ notification }: NotificationCardProps) => {
  const { mutateAsync } = useMarkAsRead();
  const router = useRouter();

  const handleClick = async () => {
    await mutateAsync(notification.id);
    notification.link && router.push(notification.link);
  };

  return (
    <div
      className={clsx(classes.container, notification.read && classes.read)}
      onClick={handleClick}
    >
      {notification.notificationImage && (
        <figure className={classes.image}>
          <Image
            src={notification.notificationImage}
            alt="image"
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
