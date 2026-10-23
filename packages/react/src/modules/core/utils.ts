export const openPopupWindow = (url: string) => {
  const width = 600;
  const height = 800;
  // Calculate the position to center the window
  const screenLeft = window.screenLeft ?? window.screenX;
  const screenTop = window.screenTop ?? window.screenY;

  const innerWidth =
    window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
  const innerHeight =
    window.innerHeight ??
    document.documentElement.clientHeight ??
    screen.height;

  const left = innerWidth / 2 - width / 2 + screenLeft;
  const top = innerHeight / 2 - height / 2 + screenTop;

  // Window features
  const features = `width=${width},height=${height},top=${top},left=${left}`;

  return window.open(url, "_blank", features);
};

export const checkForWindow = () => {
  if (typeof window !== "undefined") {
    return window;
  }
};
