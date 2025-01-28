const SEARCHABLE_OPTION_DELIMITER = "::::";

type Option = {
  label: string;
  value: string;
};

export const sortByDisplayName = <T extends { displayName: string }>(
  items: T[],
) =>
  items.sort((a, b) =>
    a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()),
  );

// Telegraph Combobox only supports searching by value, so we use this utility to make teams and channels searchable by their labels
export const toLabelSearchableOption = (option: Option): Option => ({
  value: `${option.label}${SEARCHABLE_OPTION_DELIMITER}${option.value}`,
  label: option.label,
});

export const fromLabelSearchableOption = (option: Option): Option => {
  const [_, value] = option.value.split(SEARCHABLE_OPTION_DELIMITER);
  return {
    value: value!,
    label: option.label,
  };
};
