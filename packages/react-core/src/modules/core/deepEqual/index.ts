/**
 * Deep structural equality check. Recursively compares primitives, plain
 * objects, arrays, `Date`, and `RegExp` values. Does not special-case Map/Set.
 */
export const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;

  if (a && b && typeof a === "object" && typeof b === "object") {
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;

    if (objA.constructor !== objB.constructor) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      return (
        a.length === b.length && a.every((value, i) => deepEqual(value, b[i]))
      );
    }

    if (a.constructor === RegExp) {
      const reA = a as RegExp;
      const reB = b as RegExp;
      return reA.source === reB.source && reA.flags === reB.flags;
    }
    if (objA.valueOf !== Object.prototype.valueOf) {
      return objA.valueOf() === objB.valueOf();
    }
    if (objA.toString !== Object.prototype.toString) {
      return objA.toString() === objB.toString();
    }

    const keys = Object.keys(objA);
    if (keys.length !== Object.keys(objB).length) return false;

    return keys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(objB, key) &&
        deepEqual(objA[key], objB[key]),
    );
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b;
};
