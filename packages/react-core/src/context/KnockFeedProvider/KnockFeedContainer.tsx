import { PropsWithChildren } from "react";
import "./styles.css";

export const KnockFeedContainer: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return <div className="rnf-feed-provider">{children}</div>;
};
