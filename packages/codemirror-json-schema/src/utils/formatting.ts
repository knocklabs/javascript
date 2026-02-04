// a little english-centric utility
// to join members of an array with commas and "or"
export const joinWithOr = <T>(
  arr: T[],
  getPath?: (item: T) => string,
): string => {
  const needsComma = arr.length > 2;
  const data = arr.map((item, i) => {
    const value = getPath ? getPath(item) : String(item);
    const result = `\`${value}\``;
    if (i === arr.length - 1) return "or " + result;
    return result;
  });
  if (needsComma) {
    return data.join(", ");
  }
  return data.join(" ");
};
