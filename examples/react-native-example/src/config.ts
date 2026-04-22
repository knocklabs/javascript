export type AppConfig = {
  publicApiKey: string;
  userId: string;
  tenantId: string | null;
  feedChannelId: string;
};

export const config: AppConfig = {
  // TODO: Your Knock public API key. Find it at https://dashboard.knock.app under Developers.
  publicApiKey: "pk_test_REPLACE_ME",

  // TODO: The ID of the signed-in user. Replace with your test user's ID.
  userId: "user_REPLACE_ME",

  // TODO: Optional tenant ID to scope feeds and preferences. Leave null for no tenant scoping.
  tenantId: null,

  // TODO: The in-app feed channel ID from the Integrations page in the Knock dashboard.
  feedChannelId: "REPLACE_ME",
};
