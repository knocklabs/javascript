/* eslint-disable @typescript-eslint/no-explicit-any */
import { useKnockFeed } from "@knocklabs/react";
import { useCallback, useEffect } from "react";
import { toast as sonnerToast } from "sonner";

import Toast from "./Toast";

interface ToastProps {
  title: string;
  description: string;
  onClose: () => void;
}

/** I recommend abstracting the toast function
 *  so that you can call it without having to use toast.custom everytime. */
function toast(toast: Omit<ToastProps, 'id'>) {
  return sonnerToast.custom((id) => (
    <Toast
      title={toast.title}
      description={toast.description}
      onClose={toast.onClose}
    />
  ));
}

const NotificationToasts = () => {
  const { feedClient } = useKnockFeed();

  const onNotificationsReceived = useCallback(
    ({ items }: any) => {
      // Whenever we receive a new notification from our real-time stream, show a toast
      // (note here that we can receive > 1 items in a batch)
      items.forEach((notification: any) => {
        if (notification.data.showToast === false) return;

        toast({
          title: "New notification received",
          description: notification.blocks[0].rendered,
          onClose: () => {
            feedClient.markAsSeen(notification);
          },
        });
      });
    },
    [feedClient, toast],
  );

  useEffect(() => {
    // Receive all real-time notifications on our feed
    feedClient.on("items.received.realtime", onNotificationsReceived);

    // Cleanup
    return () =>
      feedClient.off("items.received.realtime", onNotificationsReceived);
  }, [feedClient, onNotificationsReceived]);

  return null;
};

export default NotificationToasts;
