import { MutableRefObject, useEffect } from "react";

const useOutsideClick = ({
  ref,
  fn,
  isEnabled = true,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: MutableRefObject<any>;
  fn: () => void;
  isEnabled?: boolean;
}) => {
  const handleClick = (event: MouseEvent) => {
    if (!isEnabled || !ref?.current || ref?.current?.contains(event.target)) {
      return;
    }
    fn();
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  });
};

export default useOutsideClick;
