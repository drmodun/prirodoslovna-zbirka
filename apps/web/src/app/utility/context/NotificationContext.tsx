import { NotificationResponse } from "@biosfera/types";
import { createContext, useContext, useEffect, useState } from "react";
import useUser from "./UserContext";
import { baseURL, token } from "@/api/shared";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useGetNotifications } from "@/api/useGetNotifications";
import toast from "react-hot-toast";

export const NotificationContext = createContext<{
  notifications: NotificationResponse[];
  isVisibleModal: boolean;
  showModal: () => void;
  hideModal: () => void;
}>({
  notifications: [],
  isVisibleModal: false,
  showModal: () => {},
  hideModal: () => {},
});

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    []
  );
  const { user } = useUser();
  const [isVisibleModal, setIsVisibleModal] = useState<boolean>(false);

  const { data: initNotifications, isSuccess } = useGetNotifications();

  useEffect(() => {
    if (initNotifications) {
      setNotifications(initNotifications);
    }
  }, [initNotifications]);

  const hideModal = () => {
    setIsVisibleModal(false);
  };

  const showModal = () => {
    setIsVisibleModal(true);
  };

  useEffect(() => {
    if (!isSuccess) return;
    const connectToSource = async () => {
      if (!user) return;

      await fetchEventSource(`${baseURL}/notification-users/subscribe`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onmessage: (event) => {
          const notification = JSON.parse(event.data);

          toast.success(`Nova obavijest: ${notification.title}`, {
            duration: 5000,
            icon: "🔔",
          });

          setNotifications((prev) => [notification, ...prev]);
        },
      });
    };
    if (!user) return;
    connectToSource();

    return () => {
      fetchEventSource(`${baseURL}/notification-users/unsubscribe`, {
        headers: {
          METHODS: "DELETE",
          Authorization: `Bearer ${token}`,
        },
        onclose: () => {
          console.log("closed");
        },
      });
    };
  }, [user, isSuccess]);

  return (
    <NotificationContext.Provider
      value={{ notifications, isVisibleModal, showModal, hideModal }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
