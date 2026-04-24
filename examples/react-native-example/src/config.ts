// Hardcoded configuration mirrors the Android and iOS example apps. In a
// production app these values would come from your environment and backend.
//
// Replace each placeholder below with the matching value from your Knock
// dashboard (https://dashboard.knock.app) before running the app.

// TODO: Your Knock public API key. Dashboard → Developers → API keys.
export const KNOCK_API_KEY = "pk_test_REPLACE_ME";

// TODO: A test user's ID. In production this comes from your auth system.
export const KNOCK_USER_ID = "user_REPLACE_ME";

// TODO: The in-app feed channel ID. Dashboard → Integrations → In-app feed.
export const KNOCK_IN_APP_CHANNEL_ID = "REPLACE_ME";

// TODO: The push channel ID (APNs on iOS, FCM on Android). Integrations page.
export const KNOCK_PUSH_CHANNEL_ID = "REPLACE_ME";

// Override if you're self-hosting or running against a Knock sandbox.
export const KNOCK_HOSTNAME = "https://api.knock.app";

// TODO: Tenant identifiers used by the tenant switcher. Values should match
// tenant IDs in your Knock account. The example demonstrates scoping feeds
// and preferences to a tenant.
export const KNOCK_TENANT_A = "team-a";
export const KNOCK_TENANT_B = "team-b";
