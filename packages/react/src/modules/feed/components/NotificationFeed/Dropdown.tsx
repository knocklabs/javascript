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
      <select
        aria-label="Select notification filter"
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      <ChevronDown aria-hidden />
    </div>
  );
};
