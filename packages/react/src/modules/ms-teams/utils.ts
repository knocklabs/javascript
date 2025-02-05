export const sortByName = <T extends { name: string }>(items: T[]) =>
  items.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );

export const sortByDisplayName = <T extends { displayName: string }>(
  items: T[],
) =>
  items.sort((a, b) =>
    a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()),
  );
