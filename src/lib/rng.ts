/** Small deterministic helpers: no Math.random anywhere in the market model. */
export function hash32(...parts: (string | number)[]): number {
  let h = 2166136261 >>> 0;
  for (const p of parts) {
    const s = String(p);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    h ^= 0x9e37;
    h = Math.imul(h, 16777619) >>> 0;
  }
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}
/** Uniform [0,1) from any key parts. */
export function unit(...parts: (string | number)[]): number {
  return hash32(...parts) / 4294967296;
}
/** Roughly normal(0,1) from key parts (sum of 3 uniforms). */
export function gauss(...parts: (string | number)[]): number {
  return (unit(...parts, "a") + unit(...parts, "b") + unit(...parts, "c") - 1.5) * 2;
}
