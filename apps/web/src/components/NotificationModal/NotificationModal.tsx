import { useNotification } from "@/utility/context/NotificationContext";
import classes from "./NotificationModal.module.scss";
import { NotificationCard } from "components/NotificationCard/NotificationCard";
import Modal from "components/BaseModal";

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
          {notifications
            .toSorted((x) => (x.createdAt as Date).getTime())
            .map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
        </div>
      </div>
    </Modal>
  );
};
