import { NotificationResponse } from "@biosfera/types";
import { createContext, useEffect, useState } from "react";
import useUser from "./UserContext";
import { baseURL, token } from "@/api/shared";
import { fetchEventSource } from "@microsoft/fetch-event-source";

export const NotificationContext = createContext<{
  notifications: NotificationResponse[];
}>({
  notifications: [],
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

  useEffect(() => {
    const connectToSource = async () => {
      if (!user) return;

      await fetchEventSource(`${baseURL}/notification-users/subscribe`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onmessage: (event) => {
          const notification = JSON.parse(event.data);
          setNotifications((prev) => [notification, ...prev]);
        },
      });
    };
    if (!user) return;
    connectToSource();

    return () => {
      fetchEventSource(`${baseURL}/notification-users/unsubscribe`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onclose: () => {
          console.log("closed");
        },
      });
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
