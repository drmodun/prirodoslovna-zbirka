import classes from "./NotificationModal.module.scss";
import { NotificationCard } from "components/NotificationCard/NotificationCard";
import Modal from "components/BaseModal";
import { NotificationResponse } from "@biosfera/types";
import useNotification from "@/utility/context/NotificationContext";
import { useMarkAllAsRead } from "@/api/useMarkAllAsRead";
import BaseButton from "components/BaseButton";
import { useMemo } from "react";

export const NotificationModal = () => {
  const { notifications, hideModal, isVisibleModal, markAllAsRead } =
    useNotification();
  const { mutateAsync } = useMarkAllAsRead();

  const handleMarkAllAsRead = async () => {
    await mutateAsync();
    markAllAsRead();
  };

  const sortedNotifs = useMemo(() => {
    return notifications.toSorted(
      (x: NotificationResponse, y: NotificationResponse) =>
        new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime()
    );
  }, [notifications]);

  return (
    <Modal
      text="Ovdje možete vidjeti sve notifikacije"
      open={isVisibleModal}
      deMount={hideModal}
      title="Obavijesti"
      actionText="Zatvori"
    >
      <div className={classes.container}>
        <div className={classes.notifications}>
          {sortedNotifs.length ? (
            sortedNotifs.map((n) => (
              <NotificationCard key={n.id} notification={n} />
            ))
          ) : (
            <div className={classes.empty}>Nema obavijesti</div>
          )}
        </div>
      </div>
      <BaseButton
        text="Označi sve kao pročitano"
        onClick={handleMarkAllAsRead}
      />
    </Modal>
  );
};
