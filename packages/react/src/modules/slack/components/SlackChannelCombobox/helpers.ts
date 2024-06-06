// Taken from `react-aria` `useFilter` hook, which we didn't want to add in as a dependency
// due to us only using this one function.
// https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/i18n/src/useFilter.ts#L58-L76

const collator = new Intl.Collator();

export function strContains(string: string, substr: string) {
  if (substr.length === 0) {
    return true;
  }

  string = string.normalize("NFC");
  substr = substr.normalize("NFC");

  let scan = 0;
  const sliceLen = substr.length;
  for (; scan + sliceLen <= string.length; scan++) {
    const slice = string.slice(scan, scan + sliceLen);
    if (collator.compare(substr, slice) === 0) {
      return true;
    }
  }

  return false;
}
