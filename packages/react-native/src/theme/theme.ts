type FontWeight =
  | "normal"
  | "bold"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900"
  | undefined;

const lightTheme = {
  // Font sizes
  fontSizes: {
    knock0: 11,
    knock1: 12,
    knock2: 14,
    knock3: 16,
    knock4: 18,
    knock5: 20,
    knock6: 24,
    knock7: 30,
    knock8: 36,
    knock9: 48,
  },
  // Spacing
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 32,
    8: 42,
  },
  // Font weights
  fontWeights: {
    normal: "normal" as FontWeight,
    medium: "500" as FontWeight,
    semibold: "600" as FontWeight,
    bold: "bold" as FontWeight,
  },
  // Font family
  fontFamily: {
    sanserif:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif',
  },

  // Colors
  colors: {
    gray3: "#f0f0f3",
    gray4: "#e8e8ec",
    gray5: "#e0e1e6",
    gray6: "#d9d9e0",
    gray9: "#8b8d98",
    gray11: "#60646c",
    gray12: "#1c2024",
    accent3: "#feebe7",
    accent9: "#e54d2e",
    accent11: "#d13415",
    surface1: "#ffffff",
    blue9: "#3e63dd",
    green9: "#29a383",
    white: "#ffffff",
  },

  imageRefs: {
    // poweredByKnock: require("../assets/PoweredByKnock.png"),
    // inbox: require("../assets/inbox.png"),
  },
};

const darkTheme = {
  ...lightTheme,
  colors: {
    gray3: "#212225",
    gray4: "#272a2d",
    gray5: "#2e3135",
    gray6: "#363a3f",
    gray9: "#696e77",
    gray11: "#b0b4ba",
    gray12: "#edeef0",
    accent3: "#391714",
    accent9: "#e54d2e",
    accent11: "#ff977d",
    surface1: "#18191b",
    blue9: "#3e63dd",
    green9: "#29a383",
    white: "#ffffff",
  },

  imageRefs: {
    // poweredByKnock: require("../assets/PoweredByKnock.png"),
    // inbox: require("../assets/inbox.png"),
  },
};

export { lightTheme, darkTheme };
