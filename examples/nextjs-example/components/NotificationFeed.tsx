import { useRef, useState } from "react";
import {
  NotificationFeedPopover,
  NotificationIconButton,
} from "@knocklabs/react";

const NotificationFeed = () => {
  const [isVisible, setIsVisible] = useState(false);
  const notifButtonRef = useRef(null);

  return (
    <>
      <NotificationIconButton
        ref={notifButtonRef}
        onClick={() => setIsVisible(!isVisible)}
      />
      <NotificationFeedPopover
        buttonRef={notifButtonRef}
        isVisible={isVisible}
        onClose={() => {
          console.log("closed");
          // setIsVisible(false);
        }}
      />
    </>
  );
};

export default NotificationFeed;
