import { useKnockFeed, useTranslations } from "@knocklabs/react-core";
import { FunctionComponent } from "react";

import "./styles.css";

export const EmptyFeed: FunctionComponent = () => {
  const { colorMode } = useKnockFeed();
  const { t } = useTranslations();

  return (
    <div className={`rnf-empty-feed rnf-empty-feed--${colorMode}`}>
      <div className="rnf-empty-feed__inner">
        <h2 className="rnf-empty-feed__header">{t("emptyFeedTitle")}</h2>
        <p className="rnf-empty-feed__body">{t("emptyFeedBody")}</p>
      </div>
    </div>
  );
};
