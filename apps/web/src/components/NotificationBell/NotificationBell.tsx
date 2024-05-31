"use client";

import { useNotification } from "@/utility/context/NotificationContext";
import classes from "./NotificationBell.module.scss";
import { useState } from "react";
import notifBell from "assets/images/notif-bell.svg";
import Image from "next/image";

export const NotificationBell = () => {
  const { notifications, showModal } = useNotification();

  return (
    <button
      className={classes.container}
      title="notifications"
      onClick={showModal}
    >
      <div className={classes.notificationAmount}>
        <span className={classes.number}>
          {notifications.length > 9 ? "9+" : notifications.length}
        </span>
      </div>
      <figure className={classes.bell}>
        <Image src={notifBell} layout="fill" alt="notification bell" />
      </figure>
    </button>
  );
};
