// Base neutrals — pulled directly from the Figma design context, not estimated.
export const colors = {
  bg: "#F5F5F5",
  white: "#FFFFFF",
  black: "#000000",
  ink: "#171717",
  gray: "#B8B8B8", // secondary/muted text + inactive nav — exact Figma value
  sectionGray: "#404040", // "All Cases (33)" label
  lightGray: "#F0F0F0", // active nav row background
  border: "#F5F5F5", // card strokes, panel dividers — same value as bg by design
};

export const SHADOW = "none"; // the Figma file uses flat fills + hairline borders, no card shadows

// Semantic system — exact values as given.
export const semantic = {
  error: { fg: "#FF4B49", bg: "#FFEDED" },
  warning: { fg: "#FEBE00", bg: "#FFF8E5" },
  success: { fg: "#01C15A", bg: "#E6F9EF" },
  info: { fg: "#219BFF", bg: "#E9F5FF" },
};

export const STATUS_ORDER = ["New", "Transferred", "Waiting for Customer", "Closed"];
