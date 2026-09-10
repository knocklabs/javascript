export const sortByDisplayName = <T extends { displayName: string }>(
  items: readonly T[],
) =>
  [...items].sort((a, b) =>
    a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()),
  );
