import { Knock } from "@knocklabs/node";
import { Grants } from "@knocklabs/node/dist/src/common/userTokens";
import "@knocklabs/react/dist/index.css";

import Providers from "./components/providers";
import "./global.css";
import { getAppDetails } from "./lib/app-details";

const { userId, tenant, collection, objectId } = getAppDetails();

const signingKey = process.env.KNOCK_SIGNING_KEY!;

async function MyApp({ children }: { children: React.ReactElement }) {
	//Generate a production build in CI/CD even if we're missing the env vars
	const userToken = signingKey
		? await Knock.signUserToken(userId, {
				grants: [
					Knock.buildUserTokenGrant({ type: "tenant", id: tenant }, [
						Grants.SlackChannelsRead,
					]),
					Knock.buildUserTokenGrant(
						{ type: "object", id: objectId, collection: collection },
						[Grants.ChannelDataRead, Grants.ChannelDataWrite],
					),
				],
			})
		: "secretOrPrivateKey";

	return (
		<>
			<html>
				<body className="px-12 py-6">
					<h1 className="text-2xl font-bold mb-6">SlackKit Demo App</h1>
					<Providers userToken={userToken} knockUserId={userId} tenant={tenant}>
						{children}
					</Providers>
				</body>
			</html>
		</>
	);
}

export default MyApp;
