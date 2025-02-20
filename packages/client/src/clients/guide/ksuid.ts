// Copied over from https://github.com/ValeriaVG/xksuid to get around a build
// error when installing and importing "xksuid" as a package:
//
//  > The current file is a CommonJS module whose imports will produce 'require'
//  > calls; however, the referenced file is an ECMAScript module and cannot be
//  > imported with 'require'.
//
/* eslint-disable */
// @ts-nocheck

/**
 * JS transposition of reference Go implementation
 * https://github.com/segmentio/ksuid
 */

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
/**
 * Encodes buffer to base62
 * @param {DataView} view
 * @returns {string}
 */
export function base62(view) {
  if (view.byteLength !== 20) {
    throw new Error("incorrect buffer size");
  }
  let str = new Array(27).fill("0");
  let n = 27;
  let bp = new Array(5);
  bp[0] = view.getUint32(0, false);
  bp[1] = view.getUint32(4, false);
  bp[2] = view.getUint32(8, false);
  bp[3] = view.getUint32(12, false);
  bp[4] = view.getUint32(16, false);

  const srcBase = 4294967296n;
  const dstBase = 62n;

  while (bp.length != 0) {
    let quotient = [];
    let remainder = 0;

    for (const c of bp) {
      let value = BigInt(c) + BigInt(remainder) * srcBase;

      let digit = value / dstBase;

      remainder = Number(value % dstBase);

      if (quotient.length !== 0 || digit !== 0n) {
        quotient.push(Number(digit));
      }
    }

    // Writes at the end of the destination buffer because we computed the
    // lowest bits first.
    n--;
    str[n] = BASE62.charAt(remainder);
    bp = quotient;
  }
  return str.join("");
}

/**
 * Converts UNIX timestamp to (x)KSUID epoch timestamp
 * @param {number} timestamp ms
 * @param {boolean|undefined} desc order, `true` indicates xKSUID
 * @returns {number} seconds
 */
export function toEpoch(timestamp, desc) {
  if (!desc) {
    return Math.round(timestamp / 1000) - 14e8;
  }
  return 4294967295 - (Math.round(timestamp / 1000) - 14e8);
}

/**
 * Generates cryptographically strong random buffer
 * @returns {Uint8Array} 16 bytes of random binary values
 */
export function randomBytes() {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generates new (x)KSUID based on current timestamp
 * @param {boolean} desc
 * @param {number} timestamp ms
 * @returns {string} 27 chars KSUID or 28 chars for xKSUID
 */
export function generate(desc = false, timestamp = Date.now()) {
  const buf = new ArrayBuffer(20);
  const view = new DataView(buf);
  const ts = toEpoch(timestamp, desc);
  let offset = 0;
  view.setUint32(offset, ts, false);
  offset += 4;
  const rnd = randomBytes();
  for (const b of rnd) {
    view.setUint8(offset++, b);
  }
  if (desc) return "z" + base62(view);
  return base62(view);
}
