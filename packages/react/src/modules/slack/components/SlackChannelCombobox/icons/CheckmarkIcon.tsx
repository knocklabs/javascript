import { FunctionComponent } from "react";

export interface CheckmarkIconProps {
  isConnected: boolean;
  size?: string;
}

const CheckmarkIcon: FunctionComponent<CheckmarkIconProps> = ({
  isConnected,
  size = "1rem",
}) => (
  <svg
    height={size}
    width={size}
    role="img"
    viewBox="0 0 14 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.3751 3.9996L5.25006 10.9996L2.62506 8.3746"
      stroke={isConnected ? "#5469D4" : "#A5ACB8"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CheckmarkIcon;
