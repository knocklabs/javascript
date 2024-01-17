import { SlackIcon } from "../SlackIcon";
import "./styles.css";

export const ConnectToSlackContainer = ({
  actionButton,
}: {
  actionButton: React.ReactElement;
}) => {
  return (
    <div className="rnf-container">
      <div>
        <SlackIcon height="32px" width="32px" />
        <div className="rnf-title">Slack</div>
        <div className="rnf-description">
          Connect to get notifications in your Slack workspace.
        </div>
      </div>
      <div>{actionButton}</div>
    </div>
  );
};
