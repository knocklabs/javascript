/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect } from "react";
import { toast as sonnerToast } from "sonner";
import { TextContentBlock, type FeedItem } from "@knocklabs/client";
import { useKnockFeed } from "@knocklabs/react";
import { Stack } from "@telegraph/layout";
import { Button } from "@telegraph/button";

import { Toast, type ToastProps } from "./Toast";

/** Abstracting the toast function
 *  so that you can call it without having to use toast.custom everytime. */
function toast(toastProps: Omit<ToastProps, 'id'>) {
  return sonnerToast.custom(() => (
    <Toast {...toastProps} />
  ));
}

const NotificationToasts = () => {
  const { feedClient } = useKnockFeed();

  const onNotificationsReceived = useCallback(
    ({ items }: { items: FeedItem[] }) => {
      // Whenever we receive a new notification from our real-time stream, show a toast
      // (note here that we can receive > 1 items in a batch)
      items.forEach((notification) => {
        if (notification.data?.showToast === false) return;

        const useRenderedDescription = false; // Optionally, you can use the HTML from your template
        const notificationBlock = notification.blocks[0] as TextContentBlock;
        const description = useRenderedDescription ? notificationBlock.rendered : notification.data?.message;

        const showActions = notification.data?.templateType !== "standard";
        const isMultiAction = notification.data?.templateType === "multi-action";

        const toastId = toast({
          title: "New Notification Received",
          description: description,
          useRenderedDescription,
          onClose: () => {
            sonnerToast.dismiss(toastId);
            feedClient.markAsSeen(notification);
          },
          actions: showActions && (
            <Stack marginTop="4">
              <Button variant="solid" size="1">View More</Button>
              {isMultiAction && (
                <Button marginLeft="2" variant="outline" size="1">Cancel Action</Button>
              )}
            </Stack>
          )
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
