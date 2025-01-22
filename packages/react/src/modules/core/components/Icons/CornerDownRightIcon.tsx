import { FunctionComponent } from "react";

type CornerDownRightIconProps = {
  width?: number;
  height?: number;
};

const CornerDownRightIcon: FunctionComponent<CornerDownRightIconProps> = ({
  width = 14,
  height = 14,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.33752 5.42085C8.56533 5.19305 8.93467 5.19305 9.16248 5.42085L12.0791 8.33752C12.307 8.56533 12.307 8.93467 12.0791 9.16248L9.16248 12.0791C8.93467 12.307 8.56533 12.307 8.33752 12.0791C8.10971 11.8513 8.10971 11.482 8.33752 11.2542L10.8417 8.75L8.33752 6.24581C8.10971 6.01801 8.10971 5.64866 8.33752 5.42085Z"
        fill="#60646C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.33333 1.75C2.6555 1.75 2.91667 2.01117 2.91667 2.33333V6.41667C2.91667 6.8808 3.10104 7.32592 3.42923 7.6541C3.75742 7.98229 4.20254 8.16667 4.66667 8.16667H11.6667C11.9888 8.16667 12.25 8.42783 12.25 8.75C12.25 9.07217 11.9888 9.33333 11.6667 9.33333H4.66667C3.89312 9.33333 3.15125 9.02604 2.60427 8.47906C2.05729 7.93208 1.75 7.19021 1.75 6.41667V2.33333C1.75 2.01117 2.01117 1.75 2.33333 1.75Z"
        fill="#60646C"
      />
    </svg>
  );
};

export { CornerDownRightIcon };
