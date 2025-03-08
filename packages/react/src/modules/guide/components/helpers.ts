const isValidHttpUrl = (input: string) => {
  let url;

  try {
    url = new URL(input);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};

export const maybeNavigateToUrlWithDelay = (
  url: string,
  delay: number = 200,
) => {
  if (!window?.location) return;
  if (!isValidHttpUrl(url)) return;

  setTimeout(() => window.location.assign(url), delay);
};
