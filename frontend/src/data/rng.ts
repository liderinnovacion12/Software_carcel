// Deterministic PRNG (mulberry32) so the synthetic demo dataset is stable
// across reloads within a session and reproducible during development.
// Not cryptographically secure - not needed for synthetic demo data.
export function mulberry32(seed: number) {
  let a = seed;
  return function random(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  private random: () => number;

  constructor(seed: number) {
    this.random = mulberry32(seed);
  }

  next(): number {
    return this.random();
  }

  int(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  choice<T>(items: readonly T[]): T {
    return items[this.int(0, items.length - 1)];
  }

  weightedChoice<T>(items: readonly T[], weights: readonly number[]): T {
    const total = weights.reduce((sum, w) => sum + w, 0);
    let roll = this.random() * total;
    for (let i = 0; i < items.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  bool(probability = 0.5): boolean {
    return this.random() < probability;
  }

  sample<T>(items: readonly T[], count: number): T[] {
    const pool = [...items];
    const result: T[] = [];
    const n = Math.min(count, pool.length);
    for (let i = 0; i < n; i++) {
      const idx = this.int(0, pool.length - 1);
      result.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return result;
  }

  daysAgo(min: number, max: number): Date {
    const days = this.int(min, max);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }
}
