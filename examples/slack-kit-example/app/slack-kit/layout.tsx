import "@knocklabs/react/dist/index.css";
import jwt from "jsonwebtoken";

import Providers from "./components/providers";
import { getAppDetails } from "./lib/app-details";

const { userId, tenant, collection, objectId } = getAppDetails();

const currentTime = Math.floor(Date.now() / 1000);
const expireInSeconds = 60 * 60;
const signingKey = process.env.KNOCK_SIGNING_KEY!;

const userToken = jwt.sign(
  {
    sub: userId,
    iat: currentTime,
    exp: currentTime + expireInSeconds,
    grants: {
      [`https://api.knock.app/v1/objects/$tenants/${tenant}`]: {
        "slack/channels_read": [{}],
      },
      [`https://api.knock.app/v1/objects/${collection}/${objectId}`]: {
        "channel_data/read": [{}],
        "channel_data/write": [{}],
      },
    },
  },
  signingKey,
  {
    algorithm: "RS256",
  },
);

function MyApp({ children }: { children: React.ReactElement }) {
  return (
    <>
      <html>
        <body>
          {process.env.KNOCK_API_KEY ? (
            <>
              <h1>SlackKit Demo App</h1>
              <Providers
                userToken={userToken}
                knockUserId={userId}
                tenant={tenant}
              >
                {children}
              </Providers>
            </>
          ) : (
            <h1>SlackKit Demo App</h1>
          )}
        </body>
      </html>
    </>
  );
}

export default MyApp;
