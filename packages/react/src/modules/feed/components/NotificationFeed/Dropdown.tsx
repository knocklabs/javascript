import { useKnockFeed } from "@knocklabs/react-core";
import React, { PropsWithChildren } from "react";

import { ChevronDown } from "../../../core/components/Icons";

import "./styles.css";

export type DropdownProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const Dropdown: React.FC<PropsWithChildren<DropdownProps>> = ({
  children,
  value,
  onChange,
}) => {
  const { colorMode } = useKnockFeed();

  return (
    <div className={`rnf-dropdown rnf-dropdown--${colorMode}`}>
      <select aria-label="Select Notification Filter" value={value} onChange={onChange}>
        {children}
      </select>
      <ChevronDown />
    </div>
  );
};
