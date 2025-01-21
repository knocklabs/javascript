import { FunctionComponent } from "react";

type ChevronRightProps = {
  width?: number;
  height?: number;
};

const ChevronRight: FunctionComponent<ChevronRightProps> = ({
  width = 12,
  height = 12,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.14645 2.64645C4.34171 2.45118 4.65829 2.45118 4.85355 2.64645L7.85355 5.64645C8.04882 5.84171 8.04882 6.15829 7.85355 6.35355L4.85355 9.35355C4.65829 9.54882 4.34171 9.54882 4.14645 9.35355C3.95118 9.15829 3.95118 8.84171 4.14645 8.64645L6.79289 6L4.14645 3.35355C3.95118 3.15829 3.95118 2.84171 4.14645 2.64645Z"
      fill="#60646C"
    />
  </svg>
);

export { ChevronRight };
