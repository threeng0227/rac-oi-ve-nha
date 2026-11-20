import type { TrashItem } from './TrashItem';

export interface LevelResult {
  readonly score: number;
  readonly stars: 0 | 1 | 2 | 3;
  readonly cleanliness: number;
  readonly failed: boolean;
  readonly correctCount: number;
  readonly totalSpawned: number;
  readonly mistakes: number;
  readonly hazardMistakes: number;
  readonly remainingCount: number;
}

interface ScoredItem {
  readonly hazard: boolean;
  readonly late: boolean;
  picked: boolean;
  sorted: boolean;
  escaped: boolean;
}

/** Điểm và kết quả chỉ phụ thuộc thao tác, không phụ thuộc trạng thái vẽ. */
export class ScoreSystem {
  private points = 0;
  private chain = 0;
  private contamination = 0;
  private lost = false;
  private correct = 0;
  private wrong = 0;
  private hazardWrong = 0;
  private readonly items = new Map<number, ScoredItem>();
  private result: LevelResult | undefined;

  constructor(private readonly durationSec: number) {}

  get score(): number { return this.points; }
  get combo(): number { return this.chain; }
  get multiplier(): number {
    if (this.chain >= 20) return 4;
    if (this.chain >= 12) return 3;
    return this.chain >= 5 ? 2 : 1;
  }
  get pollution(): number { return this.contamination; }
  get failed(): boolean { return this.lost; }
  get correctCount(): number { return this.correct; }
  get mistakes(): number { return this.wrong; }
  get hazardMistakes(): number { return this.hazardWrong; }
  get totalSpawned(): number { return this.items.size; }

  registerSpawn(item: TrashItem, elapsedSec: number): void {
    if (this.result || this.lost || this.items.has(item.id)) return;
    this.items.set(item.id, {
      hazard: item.type.bin === 'hazard',
      late: elapsedSec >= this.durationSec - 5,
      picked: false,
      sorted: false,
      escaped: false,
    });
  }

  pick(item: TrashItem, multiplier = 1): void {
    const record = this.items.get(item.id);
    if (this.result || this.lost || !record || record.picked || record.sorted || record.escaped) return;
    record.picked = true;
    this.changePoints(5 * multiplier);
  }

  sort(item: TrashItem, correct: boolean, bonusMultiplier = 1): void {
    const record = this.items.get(item.id);
    if (this.result || this.lost || !record || record.sorted || record.escaped) return;
    if (!correct) {
      this.changePoints(record.hazard ? -40 : -15);
      this.chain = 0;
      this.wrong++;
      if (record.hazard) this.hazardWrong++;
      this.addPollution(record.hazard ? 20 : 8);
      return;
    }
    record.sorted = true;
    if (record.hazard) {
      this.changePoints(50);
      return;
    }
    // Hệ số dựa trên chuỗi đã có trước món hiện tại, theo bảng 0–4 / 5–11 / …
    this.changePoints(10 * this.multiplier * bonusMultiplier);
    this.chain++;
    this.correct++;
  }

  removeByWind(item: TrashItem): void {
    const record = this.items.get(item.id);
    if (this.result || this.lost || !record || record.sorted) return;
    record.escaped = true;
  }

  addBonus(points: number): void {
    if (this.result || this.lost) return;
    this.changePoints(points);
  }

  addPollution(amount: number): void {
    if (this.result || this.lost) return;
    this.contamination = Math.max(0, Math.min(100, this.contamination + amount));
    if (this.contamination >= 100) this.lost = true;
  }

  update(dt: number, groundCount: number): void {
    if (dt <= 0) return;
    if (groundCount >= 8) this.addPollution(dt);
    else if (groundCount <= 3) this.addPollution(-2 * dt);
  }

  finish(bagItems: readonly TrashItem[]): LevelResult {
    if (this.result) return this.result;
    const bagIds = new Set(bagItems.map(item => item.id));
    let eligible = 0;
    let bagCount = 0;
    let remainingCount = 0;
    let penalty = 0;
    for (const [id, item] of this.items) {
      // Tập hợp loại trừ tránh trừ lặp một món vừa nguy hại, vừa sinh muộn hoặc bị gió cuốn.
      if (!item.late && !item.escaped && !item.hazard) eligible++;
      if (item.sorted || item.escaped) continue;
      remainingCount++;
      if (bagIds.has(id)) bagCount++;
      if (item.hazard) penalty += 20;
      else if (!bagIds.has(id)) penalty += 2;
    }
    this.changePoints(-penalty);
    const denominator = eligible + bagCount;
    const cleanliness = denominator === 0 ? 1 : Math.min(1, this.correct / denominator);
    let stars: LevelResult['stars'] = 0;
    if (!this.lost) {
      if (cleanliness >= 0.95 && this.wrong <= 3 && this.hazardWrong === 0) stars = 3;
      else if (cleanliness >= 0.8) stars = 2;
      else if (cleanliness >= 0.6) stars = 1;
    }
    this.result = Object.freeze({
      score: this.points,
      stars,
      cleanliness,
      failed: this.lost,
      correctCount: this.correct,
      totalSpawned: this.items.size,
      mistakes: this.wrong,
      hazardMistakes: this.hazardWrong,
      remainingCount,
    });
    return this.result;
  }

  private changePoints(amount: number): void {
    this.points = Math.max(0, this.points + amount);
  }
}
