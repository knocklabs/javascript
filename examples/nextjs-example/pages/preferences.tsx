import { KnockProvider } from "@knocklabs/react";
import { useCallback } from "react";

import { NotificationPreferences } from "../components/NotificationPreferences";
import useIdentify from "../hooks/useIdentify";

const Preferences = () => {
  const { userId, userToken } = useIdentify();

  const tokenRefreshHandler = useCallback(async () => {
    // Refresh the user token 1s before it expires
    const res = await fetch(`/api/auth?id=${userId}`);
    const json = await res.json();

    return json.userToken;
  }, [userId]);

  if (!userId) return;

  return (
    <KnockProvider
      user={{ id: userId }}
      userToken={userToken}
      apiKey={process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY!}
      host={process.env.NEXT_PUBLIC_KNOCK_HOST}
      onUserTokenExpiring={tokenRefreshHandler}
      timeBeforeExpirationInMs={5000}
      logLevel="debug"
    >
      <NotificationPreferences />
    </KnockProvider>
  );
};

export default Preferences;
