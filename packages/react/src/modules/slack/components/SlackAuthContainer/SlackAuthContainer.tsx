import { SlackIcon } from "../SlackIcon";
import "./styles.css";
import "../../theme.css"

export const SlackAuthContainer = ({
  actionButton,
}: {
  actionButton: React.ReactElement;
}) => {
  return (
    <div className="rsk-auth">
      <div className="rsk-auth__header">
        <SlackIcon height="32px" width="32px" />
        <div>{actionButton}</div>
      </div>
      <div className="rsk-auth__title">Slack</div>
      <div className="rsk-auth__description">
        Connect to get notifications in your Slack workspace.
      </div>
    </div>
  );
};
