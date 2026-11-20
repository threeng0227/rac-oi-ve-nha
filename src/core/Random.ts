/**
 * Bộ sinh số giả ngẫu nhiên có seed (mulberry32).
 *
 * Dùng seed thay vì Math.random để bài test mô phỏng cân bằng chạy lại
 * được y hệt: khi một màn bị kêu là quá khó, phải tái hiện đúng lượt chơi đó.
 */
export class Random {
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  /** Số thực trong nửa khoảng [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Số nguyên trong đoạn [min, max], bao gồm cả hai đầu. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Số thực trong nửa khoảng [min, max). */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  pick<T>(items: readonly T[]): T | undefined {
    if (items.length === 0) return undefined;
    return items[this.int(0, items.length - 1)];
  }

  /** Bốc theo trọng số. Phần tử trọng số ≤ 0 không bao giờ được chọn. */
  weighted<T>(pool: readonly { value: T; weight: number }[]): T | undefined {
    let total = 0;
    for (const entry of pool) {
      if (entry.weight > 0) total += entry.weight;
    }
    if (total <= 0) return undefined;

    let roll = this.next() * total;
    for (const entry of pool) {
      if (entry.weight <= 0) continue;
      roll -= entry.weight;
      if (roll < 0) return entry.value;
    }

    // Chỉ tới được đây do sai số dấu phẩy động ở sát mép.
    return pool[pool.length - 1]?.value;
  }
}
