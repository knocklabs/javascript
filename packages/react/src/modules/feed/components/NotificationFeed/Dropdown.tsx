import React, { PropsWithChildren } from "react";
import { ChevronDown } from "../../../core/components/Icons";
import { useKnockFeed } from "@knocklabs/react-core";

import "./styles.css";

export type DropdownProps = {
  value: string;
  onChange: (e: any) => void;
};

export const Dropdown: React.FC<PropsWithChildren<DropdownProps>> = ({
  children,
  value,
  onChange,
}) => {
  const { colorMode } = useKnockFeed();

  return (
    <div className={`rnf-dropdown rnf-dropdown--${colorMode}`}>
      <select value={value} onChange={onChange}>
        {children}
      </select>
      <ChevronDown />
    </div>
  );
};
