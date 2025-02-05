import Knock, {
  KnockGuideClient,
  KnockGuideTriggerParams,
} from "@knocklabs/client";
import * as React from "react";

import { useKnockClient, useStableOptions } from "../../core";
import { ColorMode } from "../../core/constants";

type KnockGuideProviderValue = {
  client: KnockGuideClient;
  colorMode: ColorMode;
};

export const KnockGuideContext = React.createContext<
  KnockGuideProviderValue | undefined
>(undefined);

type Props = KnockGuideTriggerParams & {
  colorMode?: ColorMode;
};

export const KnockGuideProvider: React.FC<React.PropsWithChildren<Props>> = ({
  colorMode = "light",
  data,
  tenant,
  children,
}) => {
  let knock: Knock;

  try {
    knock = useKnockClient();
  } catch (_) {
    throw new Error("KnockGuideProvider must be used within a KnockProvider");
  }

  const triggerParams = useStableOptions({ data, tenant });

  const knockGuideClient = React.useMemo(() => {
    return new KnockGuideClient(knock, triggerParams);
  }, [knock, triggerParams]);

  React.useEffect(() => {
    // Fetch all eligible guides based on the initialized trigger params.
    knockGuideClient.fetchGuides();

    // TODO(KNO-7788): Subscribe to a guide channel for real time updates.
  }, [knockGuideClient]);

  return (
    <KnockGuideContext.Provider
      value={{
        client: knockGuideClient,
        colorMode,
      }}
    >
      {children}
    </KnockGuideContext.Provider>
  );
};
