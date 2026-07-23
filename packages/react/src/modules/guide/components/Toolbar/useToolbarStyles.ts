import React from "react";

import toolbarStyles from "./styles.css?inline";

const STYLE_ELEMENT_ID = "knock-guide-toolbar-styles";

// The toolbar's styles are bundled into dist/index.css, but consumers who only
// render custom guide components have no reason to import that stylesheet.
// Inject the toolbar's compiled styles at runtime when it becomes visible, so
// the toolbar works without an explicit CSS import. When dist/index.css is
// imported anyway, the injected rules are identical duplicates and harmless.
export const useToolbarStyles = (enabled: boolean) => {
  React.useEffect(() => {
    if (!enabled || document.getElementById(STYLE_ELEMENT_ID)) return;

    const styleElement = document.createElement("style");
    styleElement.id = STYLE_ELEMENT_ID;
    styleElement.textContent = toolbarStyles;
    document.head.appendChild(styleElement);
  }, [enabled]);
};
