import type {
  GetPreferencesOptions,
  PreferenceSet,
  SetPreferencesProperties,
} from "@knocklabs/client";
import { useCallback } from "react";
import useSWR, { type SWRResponse } from "swr";

import { useKnockClient } from "../../core";

type UsePreferencesReturn = {
  preferences: PreferenceSet | undefined;
  setPreferences: (setPreferencesProperties: SetPreferencesProperties) => void;
  getAllPreferences: ReturnType<
    typeof useKnockClient
  >["user"]["getAllPreferences"];
  isLoading: SWRResponse["isLoading"];
  isValidating: SWRResponse["isValidating"];
};

const usePreferences = (
  options: GetPreferencesOptions = {},
): UsePreferencesReturn => {
  const knock = useKnockClient();

  const { preferenceSet, tenant } = options;

  const CACHE_KEY = [
    "preferences",
    options.preferenceSet,
    options.tenant,
    knock.userId,
  ];

  const {
    data: preferences,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(knock.userId ? CACHE_KEY : null, () => {
    return knock.user.getPreferences({ preferenceSet, tenant });
  });

  const setPreferences = useCallback(
    (preferenceSetProperties: SetPreferencesProperties) => {
      mutate(
        knock.user.setPreferences(preferenceSetProperties, { preferenceSet }),
        {
          revalidate: false,
        },
      );
    },
    [mutate, knock.user, preferenceSet],
  );

  const getAllPreferences = useCallback(async () => {
    return await knock.user.getAllPreferences();
  }, [knock.user]);

  return {
    getAllPreferences,
    setPreferences,
    preferences,
    isLoading,
    isValidating,
  };
};

export { usePreferences };
