import { Icon, Lucide } from "@telegraph/icon";
import { Text } from "@telegraph/typography";
import { FunctionComponent } from "react";

interface Props {
  message?: string;
}

const SlackErrorMessage: FunctionComponent<Props> = ({ message }) => {
  return (
    <div className="rsk-combobox__error">
      <span>
        <Icon icon={Lucide.Info} color="black" size="1" aria-hidden />
      </span>
      <Text as="div" color="black" size="1">
        {message}
      </Text>
    </div>
  );
};

export default SlackErrorMessage;
