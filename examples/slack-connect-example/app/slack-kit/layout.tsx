import "@knocklabs/react/dist/index.css";
import jwt from "jsonwebtoken";

import Providers from "./components/providers";
import { getAppDetails } from "./lib/knock";

const currentTime = Math.floor(Date.now() / 1000);
const expireInSeconds = 60 * 60;
const signingKey = process.env.KNOCK_SIGNING_KEY!;
const { userId, tenant, collection, objectId } = await getAppDetails();

const knockToken = jwt.sign(
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
          <h1>SlackKit Demo App</h1>
          <Providers
            knockToken={knockToken}
            knockUserId={userId}
            tenant={tenant}
          >
            {children}
          </Providers>
        </body>
      </html>
    </>
  );
}

export default MyApp;
