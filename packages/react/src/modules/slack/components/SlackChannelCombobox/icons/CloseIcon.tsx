import { FunctionComponent } from "react";

export interface CloseIconProps {
  width?: string;
  height?: string;
}

const CloseIcon: FunctionComponent<CloseIconProps> = ({
  width = "16px",
  height = "16px",
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.53037 7.46917L7.99988 7.99967L8.53054 8.53L11.501 11.4986L11.5014 11.4995L11.501 11.5004L11.5001 11.5008L11.4992 11.5004L8.53041 8.53167L8.00008 8.00134L7.46975 8.53167L4.501 11.5004L4.50008 11.5008L4.49916 11.5004L4.49878 11.4995L4.49916 11.4986L7.46791 8.52983L7.99824 7.9995L7.46791 7.46917L4.49916 4.50042L4.49878 4.4995L4.49916 4.49858L4.50008 4.4982L4.501 4.49858L7.46975 7.46733L8.00008 7.99766L8.53041 7.46733L11.4987 4.49905L11.4991 4.49886L11.4996 4.49905L11.4998 4.4995L11.4996 4.49995L11.4991 4.50042L8.53037 7.46917Z"
      fill="#697386"
      stroke="#697386"
      strokeWidth="1.5"
    />
  </svg>
);

export default CloseIcon;
