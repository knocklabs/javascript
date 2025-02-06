import { FunctionComponent } from "react";

type ChevronDownProps = {
  width?: number;
  height?: number;
  "aria-hidden"?: boolean;
};

const ChevronDown: FunctionComponent<ChevronDownProps> = ({
  width = 8,
  height = 6,
  "aria-hidden": ariaHidden = false,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 8 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={ariaHidden}
  >
    <path
      d="M1.74994 1.87512L3.99994 4.12512L6.24994 1.87512"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export { ChevronDown };
