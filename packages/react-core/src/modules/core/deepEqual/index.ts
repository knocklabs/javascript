/**
 * Deep structural equality check. Recursively compares primitives, plain
 * objects, arrays, `Date`, and `RegExp` values. Does not special-case Map/Set.
 */
export default function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a && b && typeof a === "object" && typeof b === "object") {
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;

    if (objA.constructor !== objB.constructor) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      const length = a.length;
      if (length !== b.length) return false;
      for (let i = length; i-- !== 0; ) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
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
    const length = keys.length;
    if (length !== Object.keys(objB).length) return false;

    for (let i = length; i-- !== 0; ) {
      if (!Object.prototype.hasOwnProperty.call(objB, keys[i]!)) return false;
    }

    for (let i = length; i-- !== 0; ) {
      const key = keys[i]!;
      if (!deepEqual(objA[key], objB[key])) return false;
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b;
}
