import { PropsWithChildren } from "react";
import "./styles.css";

export const NotificationFeedContainer: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return <div className="rnf-feed-provider">{children}</div>;
};
