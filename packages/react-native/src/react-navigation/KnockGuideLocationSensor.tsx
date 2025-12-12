import { useGuideContext } from "@knocklabs/react-core";
import {
  createStaticNavigation,
  getPathFromState,
  useNavigationContainerRef,
} from "@react-navigation/native";
import React from "react";

type Props<ParamList extends {}> = {
  navigationRef: ReturnType<typeof useNavigationContainerRef<ParamList>>;
  linking: NonNullable<
    React.ComponentProps<ReturnType<typeof createStaticNavigation>>["linking"]
  >;
  origin?: string;
};

const Static = <ParamList extends {}>({
  navigationRef,
  linking,
  origin: givenOrigin = "http://localhost:8081",
}: Props<ParamList>) => {
  const { origin } = new URL(givenOrigin);
  const { client } = useGuideContext();

  if (linking.enabled === false) {
    throw new Error(
      "KnockGuideLocationSensor requires `linking.enabled` to be `auto` or 'true'",
    );
  }

  React.useEffect(() => {
    client.removeLocationChangeEventListeners();
  }, [client]);

  React.useEffect(() => {
    const removeListener = navigationRef.addListener("state", () => {
      const state = navigationRef.getRootState();
      if (!state) return;

      const getPathFromStateHelper =
        linking?.getPathFromState ?? getPathFromState;

      // path here is the full path of the location, including pathname and
      // stringified params but does not include the origin.
      const path = getPathFromStateHelper(state);

      client.setLocation(origin + path);
    });

    return () => removeListener();
  }, [navigationRef, linking, origin, client]);

  return null;
};

export const KnockGuideLocationSensor = {
  Static,
};
