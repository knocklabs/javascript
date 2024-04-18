import { FunctionComponent, PropsWithChildren } from "react";

import "./styles.css";

export const ButtonGroup: FunctionComponent<PropsWithChildren> = ({
  children,
}) => <div className="rnf-button-group">{children}</div>;
