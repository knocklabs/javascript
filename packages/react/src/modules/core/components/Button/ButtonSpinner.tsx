import { FunctionComponent } from "react";

import { Spinner } from "../Spinner";

import "./styles.css";

type ButtonSpinnerProps = {
  hasLabel: boolean;
};

export const ButtonSpinner: FunctionComponent<ButtonSpinnerProps> = ({
  hasLabel,
}) => (
  <div
    className={`rnf-button-spinner rnf-button-spinner--${
      hasLabel ? "with-label" : "without-label"
    }`}
  >
    <Spinner />
  </div>
);
