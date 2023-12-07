import React, { PropsWithChildren } from "react";

import "./styles.css";

export const ButtonGroup: React.FC<PropsWithChildren> = ({ children }) => (
  <div className="rnf-button-group">{children}</div>
);
