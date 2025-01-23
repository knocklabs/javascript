export const sortByDisplayName = <T extends { displayName?: string }>(
  items: T[],
) =>
  items.sort((a, b) =>
    (a.displayName ?? "")
      .toLowerCase()
      .localeCompare((b.displayName ?? "").toLowerCase()),
  );
