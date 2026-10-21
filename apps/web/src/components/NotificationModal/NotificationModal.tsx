import classes from "./NotificationModal.module.scss";
import { NotificationCard } from "components/NotificationCard/NotificationCard";
import Modal from "components/BaseModal";
import { NotificationResponse } from "@biosfera/types";
import useNotification from "@/utility/context/NotificationContext";
import { useMarkAllAsRead } from "@/api/useMarkAllAsRead";
import BaseButton from "components/BaseButton";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

export const NotificationModal = () => {
  const t = useTranslations("Notifications");
  const { notifications, hideModal, isVisibleModal, markAllAsRead } =
    useNotification();
  const { mutateAsync } = useMarkAllAsRead();

  const handleMarkAllAsRead = async () => {
    await mutateAsync();
    markAllAsRead();
  };

  const sortedNotifs = useMemo(() => {
    return [...notifications].sort(
      (x: NotificationResponse, y: NotificationResponse) =>
        new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime(),
    );
  }, [notifications]);

  return (
    <Modal
      text={t("text")}
      open={isVisibleModal}
      deMount={hideModal}
      title={t("title")}
      actionText={t("close")}
    >
      <div className={classes.container}>
        <div className={classes.notifications}>
          {sortedNotifs.length ? (
            sortedNotifs.map((n) => (
              <NotificationCard key={n.id} notification={n} />
            ))
          ) : (
            <div className={classes.empty}>{t("empty")}</div>
          )}
        </div>
      </div>
      <BaseButton
        text={t("markAllAsRead")}
        onClick={handleMarkAllAsRead}
      />
    </Modal>
  );
};
