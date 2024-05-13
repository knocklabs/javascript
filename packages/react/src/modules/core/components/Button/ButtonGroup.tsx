import { FunctionComponent, ReactNode } from "react";

import "./styles.css";

export const ButtonGroup: FunctionComponent<{
  children?: ReactNode | undefined;
}> = ({ children }) => <div className="rnf-button-group">{children}</div>;
