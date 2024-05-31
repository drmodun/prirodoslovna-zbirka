import classes from "./NotificationModal.module.scss";
import { NotificationCard } from "components/NotificationCard/NotificationCard";
import Modal from "components/BaseModal";
import { NotificationResponse } from "@biosfera/types";
import useNotification from "@/utility/context/NotificationContext";

export const NotificationModal = () => {
  const { notifications, hideModal, isVisibleModal } = useNotification();

  return (
    <Modal
      text="Ovdje možete vidjeti sve notifikacije"
      open={isVisibleModal}
      deMount={hideModal}
      title="Obavijesti"
      actionLink="/notifications"
      actionText="Pogledaj sve"
    >
      <div className={classes.container}>
        <div className={classes.notifications}>
          {notifications.length ? (
            notifications
              .toSorted((x: NotificationResponse) =>
                new Date(x.createdAt).getTime()
              )
              .map((notification: NotificationResponse) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))
          ) : (
            <div className={classes.empty}>Nema obavijesti</div>
          )}
        </div>
      </div>
    </Modal>
  );
};
