import { useTranslations } from "@knocklabs/react-core";

import "../../theme.css";
import { SlackIcon } from "../SlackIcon";

import "./styles.css";

export const SlackAuthContainer = ({
  actionButton,
}: {
  actionButton: React.ReactElement;
}) => {
  const { t } = useTranslations();

  return (
    <div className="rsk-auth">
      <div className="rsk-auth__header">
        <SlackIcon height="32px" width="32px" />
        <div>{actionButton}</div>
      </div>
      <div className="rsk-auth__title">Slack</div>
      <div className="rsk-auth__description">
        {t("slackConnectContainerDescription")}
      </div>
    </div>
  );
};
