export function getRecordEntries<K extends PropertyKey, V>(
  record: Record<K, V>,
): [K, V][] {
  return Object.entries(record) as unknown as [K, V][];
}

export type PropertyReplacer = (
  key: string | symbol,
  value: unknown,
) => [string | symbol, unknown] | [string | symbol, unknown][];

export function replacePropertiesDeeply<T>(
  object: T,
  getReplacement: PropertyReplacer,
): T {
  return replacePropertiesDeeplyInternal(
    object as unknown,
    getReplacement,
  ) as T;
}

function replacePropertiesDeeplyInternal(
  object: unknown,
  getReplacement: PropertyReplacer,
): unknown {
  if (typeof object === "string") {
    return object;
  }
  if (typeof object !== "object" || object === null) {
    return object;
  }
  if (Array.isArray(object)) {
    return object.map((element) =>
      replacePropertiesDeeplyInternal(element, getReplacement),
    );
  }
  if (object instanceof Map) {
    const newMap = new Map();
    for (const [key, value] of object) {
      const newValue = replacePropertiesDeeplyInternal(value, getReplacement);
      newMap.set(key, newValue);
    }
    return newMap;
  }
  if (object instanceof Set) {
    const newSet = new Set();
    for (const value of object) {
      const newValue = replacePropertiesDeeplyInternal(value, getReplacement);
      newSet.add(newValue);
    }
    return newSet;
  }

  const newObject: Record<string | symbol, unknown> = {};
  const recordEntries = getRecordEntries(object as Record<string, unknown>);

  function handleReplacementEntry(
    oldKey: string | symbol,
    oldValue: unknown,
    newKey: string | symbol,
    newValue: unknown,
  ) {
    if (newKey === oldKey && newValue === oldValue) {
      newObject[newKey] = replacePropertiesDeeplyInternal(
        oldValue,
        getReplacement,
      );
    } else {
      newObject[newKey] = newValue;
    }
  }

  for (const [key, value] of recordEntries) {
    const replacement = getReplacement(key, value);

    // PropertyReplacer can return a single entry tuple or an array of tuples
    if (Array.isArray(replacement[0])) {
      for (const [newKey, newValue] of replacement as Array<
        [string | symbol, unknown]
      >) {
        handleReplacementEntry(key, value, newKey, newValue);
      }
    } else {
      const [newKey, newValue] = replacement as [string | symbol, unknown];
      handleReplacementEntry(key, value, newKey, newValue);
    }
  }

  return newObject;
}

export function removeUndefinedValuesOnRecord<K extends PropertyKey, V>(
  record: Record<K, V | undefined>,
): Record<K, V> {
  const newRecord = {} as Record<K, V>;
  for (const [key, value] of getRecordEntries(record)) {
    if (value === undefined) {
      continue;
    }
    newRecord[key] = value;
  }
  return newRecord;
}
