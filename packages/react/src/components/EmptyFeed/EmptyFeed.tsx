import React from "react";
import { useTranslations, useKnockFeed } from "@knocklabs/react-core";
import "./styles.css";

export const EmptyFeed: React.FC = () => {
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
