import React from "react";
import { FunctionComponent, PropsWithChildren } from "react";

import { I18nContent, locales } from "../languages";

export const I18nContext = React.createContext<I18nContent>(locales.en);

export interface KnockI18nProviderProps {
  i18n?: I18nContent;
}

export const KnockI18nProvider: FunctionComponent<
  PropsWithChildren<KnockI18nProviderProps>
> = ({ i18n = locales.en, ...props }) => {
  return <I18nContext.Provider {...props} value={i18n} />;
};
