import * as React from "react";

export const Kbd = ({ children }: { children: React.ReactNode }) => {
  return (
    <kbd
      style={{
        display: "inline-block",
        padding: "1px 4px",
        borderRadius: "var(--tgph-rounded-2)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        backgroundColor: "rgba(255, 255, 255, 0.15)",
      }}
    >
      {children}
    </kbd>
  );
};
