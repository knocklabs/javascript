import { useContext } from "react";
import { I18nContent, locales } from "../languages";
import { I18nContext } from "../context/KnockI18nProvider";

export function useTranslations() {
  const { translations, locale } = useContext<I18nContent>(I18nContext);

  return {
    locale,
    t: (key: keyof typeof translations) => {
      // We always use english as the default translation when a key doesn't exist
      return translations[key] || locales.en.translations[key];
    },
  };
}
