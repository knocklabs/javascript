import { FunctionComponent, ReactNode } from "react";

import "./styles.css";

export const NotificationFeedContainer: FunctionComponent<{
  children?: ReactNode | undefined;
}> = ({ children }) => <div className="rnf-feed-provider">{children}</div>;
