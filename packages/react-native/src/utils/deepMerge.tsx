type AnyObject = { [key: string]: any };

const deepMerge = (target: AnyObject, source: AnyObject): AnyObject => {
  const isObject = (obj: any): obj is AnyObject =>
    obj && typeof obj === "object";

  for (const key in source) {
    if (isObject(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      deepMerge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }

  return target;
};

export default deepMerge;
