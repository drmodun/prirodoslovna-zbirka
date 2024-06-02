"use client";

import { NotificationResponse } from "@biosfera/types";
import { createContext, useContext, useEffect, useState } from "react";
import useUser from "./UserContext";
import { baseURL } from "@/api/shared";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useGetNotifications } from "@/api/useGetNotifications";
import toast from "react-hot-toast";
import { NotificationModal } from "components/NotificationModal/NotificationModal";

export const NotificationContext = createContext<{
  notifications: NotificationResponse[];
  isVisibleModal: boolean;
  showModal: () => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  hideModal: () => void;
}>({
  notifications: [],
  markAsRead: () => {},
  isVisibleModal: false,
  showModal: () => {},
  markAllAsRead: () => {},
  hideModal: () => {},
});

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    [],
  );
  const { user } = useUser();
  const [isVisibleModal, setIsVisibleModal] = useState<boolean>(false);

  const { data: initNotifications, refetch, isSuccess } = useGetNotifications();

  useEffect(() => {
    if (initNotifications) {
      setNotifications(initNotifications);
    }
  }, [initNotifications]);

  const hideModal = () => {
    setIsVisibleModal(false);
  };
  const markAsRead = (id: string) => {
    const notificationToMark = notifications.find((n) => n.id === id);
    if (!notificationToMark) return;
    notificationToMark.read = true;
    setNotifications([...notifications]);
  };

  const showModal = () => {
    setIsVisibleModal(true);
  };

  const markAllAsRead = () => {
    notifications.forEach((n) => (n.read = true));
    setNotifications([...notifications]);
  };

  useEffect(() => {
    if (!isSuccess) return;
    const source = new EventSource(
      `${baseURL}/notification-users/subscribe/${user?.id}`,
    );

    source.onopen = () => {
      console.log("Connection established");
    };

    source.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      setNotifications((prev) => [newNotification, ...prev]);
      toast.success("Nova obavijest stigla: " + newNotification.title, {
        icon: "🚀",
      });
    };

    return () => {
      source.close();
    };
  }, [user, isSuccess]);

  useEffect(() => {
    if (!user) return;
    refetch();
  }, [user, refetch]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        isVisibleModal,
        showModal,
        markAllAsRead,
        markAsRead,
        hideModal,
      }}
    >
      {children}
      <NotificationModal />
    </NotificationContext.Provider>
  );
};

const useNotification = () => useContext(NotificationContext);

export default useNotification;
