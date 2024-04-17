import React from "react";

import "./styles.css";

export const ButtonGroup: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => <div className="rnf-button-group">{children}</div>;
