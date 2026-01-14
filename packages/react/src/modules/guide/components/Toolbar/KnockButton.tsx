import { Button } from "@telegraph/button";

import { MAX_Z_INDEX } from "./helpers";
import "./styles.css";

type Props = {
  onClick: () => void;
};

export const KnockButton = ({ onClick }: Props) => {
  return (
    <Button
      onClick={onClick}
      position="fixed"
      top="4"
      right="4"
      bg="surface-2"
      shadow="3"
      rounded="3"
      w="10"
      h="10"
      variant="soft"
      data-tgph-appearance="dark"
      aria-label="Expand guide toolbar"
      style={{ zIndex: MAX_Z_INDEX }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <path
          d="M11.6001 32.4V7.59998H16.6365V21.8219H16.7774L22.3067 14.8525H27.9418L21.8138 22.0696L28.4001 32.4H22.7996L18.8555 25.572L16.6365 28.0839V32.4H11.6001Z"
          fill="#EDEEEF"
        />
        <path
          d="M28.4 10.4C28.4 11.9464 27.1467 13.2 25.6 13.2C24.0534 13.2 22.8 11.9464 22.8 10.4C22.8 8.85358 24.0534 7.59998 25.6 7.59998C27.1467 7.59998 28.4 8.85358 28.4 10.4Z"
          fill="#FF573A"
        />
      </svg>
    </Button>
  );
};
