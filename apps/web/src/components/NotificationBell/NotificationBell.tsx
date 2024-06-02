"use client";

import useNotification from "@/utility/context/NotificationContext";
import classes from "./NotificationBell.module.scss";
import notifBell from "assets/images/notif-bell.svg";
import Image from "next/image";
import { useMemo } from "react";
import useUser from "@/utility/context/UserContext";

export const NotificationBell = () => {
  const { notifications, showModal } = useNotification();
  const { user } = useUser();

  const unread = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    user && (
      <button
        className={classes.container}
        title="notifications"
        onClick={showModal}
      >
        <div className={classes.notificationAmount}>
          <span className={classes.number}>{unread > 9 ? "9+" : unread}</span>
        </div>
        <figure className={classes.bell}>
          <Image src={notifBell} layout="fill" alt="notification bell" />
        </figure>
      </button>
    )
  );
};
