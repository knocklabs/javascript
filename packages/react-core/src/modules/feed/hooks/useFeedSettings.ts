import { Feed } from "@knocklabs/client";
import { useEffect, useState } from "react";

export type FeedSettings = {
  features: {
    branding_required: boolean;
  };
};

function useFeedSettings(feedClient: Feed): {
  settings: FeedSettings | null;
  loading: boolean;
} {
  const [settings, setSettings] = useState<FeedSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: consider moving this into the feed client and into the feed store state when
  // we're using this in other areas of the feed
  useEffect(() => {
    async function getSettings() {
      const knock = feedClient.knock;

      // Skip the branding fetch when there's no authenticated user — otherwise
      // we'd fire `GET /v1/users/undefined/feeds/.../settings`. When the user
      // authenticates the feed subtree remounts (its `feedProviderKey` includes
      // the userId), which re-runs this effect with a real user.
      if (!knock.isAuthenticated()) {
        return;
      }

      const apiClient = knock.client();
      const feedSettingsPath = `/v1/users/${knock.userId}/feeds/${feedClient.feedId}/settings`;
      setIsLoading(true);

      const response = await apiClient.makeRequest({
        method: "GET",
        url: feedSettingsPath,
      });

      // Only trust a genuine success whose body actually contains the settings
      // payload. On flaky connections a captive portal or proxy can return a
      // 200 with a body that isn't the feed settings object; treat that as
      // "unknown" (leave settings null) rather than fabricating a default that
      // would silently suppress branding when it is required.
      if (response.statusCode === "ok" && response.body?.features) {
        setSettings({
          features: {
            branding_required: Boolean(
              response.body.features.branding_required,
            ),
          },
        });
      }

      setIsLoading(false);
    }

    getSettings();
    // TODO: Check if we can remove this disable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { settings, loading: isLoading };
}

export default useFeedSettings;
