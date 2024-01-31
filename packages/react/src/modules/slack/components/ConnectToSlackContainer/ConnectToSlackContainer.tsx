import { SlackIcon } from "../SlackIcon";
import "./styles.css";

export const ConnectToSlackContainer = ({
  actionButton,
}: {
  actionButton: React.ReactElement;
}) => {
  return (
    <div className="rnf-slack-container-container">
      <div className="rnf-slack-container-header">
        <SlackIcon height="32px" width="32px" />
        <div>{actionButton}</div>
      </div>
      <div className="rnf-slack-container-title">Slack</div>
      <div className="rnf-slack-container-description">
        Connect to get notifications in your Slack workspace.
      </div>
    </div>
  );
};
