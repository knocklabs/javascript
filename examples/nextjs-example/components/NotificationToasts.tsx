import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { type FeedItem } from "@knocklabs/client";
import { useKnockFeed } from "@knocklabs/react";

const NotificationToasts = () => {
  const { feedClient } = useKnockFeed();

  const onNotificationsReceived = useCallback(
    ({ items }: { items: FeedItem[] }) => {
      // Whenever we receive a new notification from our real-time stream, show a toast
      // (note here that we can receive > 1 items in a batch)
      items.forEach((notification) => {
        if (notification.data?.showToast === false) return;

        // You can access the Knock notification data
        const description = notification.data?.message;

        // Handle the notification however you want
        toast.success("New Notification Received", {
          description: description,
          closeButton: true,
          dismissible: true,
          onDismiss: () => {
            feedClient.markAsSeen(notification);
          }
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
