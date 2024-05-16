/* eslint-disable @typescript-eslint/no-explicit-any */
import { useToast } from "@chakra-ui/react";
import { useKnockFeed } from "@knocklabs/react";
import { useCallback, useEffect } from "react";

import Toast from "./Toast";

const NotificationToasts = () => {
  const { feedClient } = useKnockFeed();
  const toast = useToast();

  const onNotificationsReceived = useCallback(
    ({ items }: any) => {
      // Whenever we receive a new notification from our real-time stream, show a toast
      // (note here that we can receive > 1 items in a batch)
      items.forEach((notification: any) => {
        if (notification.data.showToast === false) return;

        toast({
          render: (props) => (
            // @ts-expect-error - difference in status type
            <Toast
              {...props}
              title={"New notification received"}
              description={notification.blocks[0].rendered}
              onClose={() => {
                feedClient.markAsSeen(notification);
                props.onClose();
              }}
            />
          ),
          position: "bottom-right",
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
