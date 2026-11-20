import type { SaveData, SaveStore } from '../core/Storage';
import { LEVELS, type LevelDef } from '../data/levels';
import { PLEDGES } from '../data/pledges';
import type { TrashId } from '../data/trashTypes';
import type { LevelResult } from './ScoreSystem';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function starsOf(value: unknown): 0 | 1 | 2 | 3 {
  return value === 1 || value === 2 || value === 3 ? value : 0;
}

function nonNegative(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

export function isLevelUnlocked(save: SaveData, level: LevelDef): boolean {
  if (level.order === 1) return true;
  const previous = LEVELS.find(candidate => candidate.order === level.order - 1);
  const progress: unknown = previous ? save.levels[previous.id] : undefined;
  return isRecord(progress) && starsOf(progress['stars']) >= 1;
}

/** Giữ tiến trình trong phiên kể cả khi trình duyệt chặn localStorage. */
export class ProgressStore {
  private readonly current: SaveData;
  private readonly completed = new WeakSet<LevelResult>();

  constructor(private readonly store: SaveStore) {
    this.current = store.load();
  }

  get data(): SaveData { return this.current; }

  discover(typeId: TrashId): void {
    if (this.current.handbook.includes(typeId)) return;
    this.current.handbook = [...this.current.handbook, typeId];
    this.store.save(this.current);
  }

  complete(level: LevelDef, result: LevelResult, correctTypes: readonly TrashId[], veChaiSold: number): void {
    if (this.completed.has(result)) return;
    this.completed.add(result);
    const saved: unknown = this.current.levels[level.id];
    const previous = isRecord(saved) ? saved : {};
    this.current.levels[level.id] = {
      ...previous,
      stars: Math.max(starsOf(previous['stars']), result.stars) as 0 | 1 | 2 | 3,
      bestScore: Math.max(nonNegative(previous['bestScore']), result.score),
      cleared: previous['cleared'] === true || (!result.failed && result.stars >= 1),
    };
    this.current.handbook = [...new Set([
      ...this.current.handbook.filter(id => typeof id === 'string'),
      ...correctTypes,
    ])];
    this.current.stats.totalTrash = nonNegative(this.current.stats.totalTrash) + result.totalSpawned;
    this.current.stats.totalCorrect = nonNegative(this.current.stats.totalCorrect) + result.correctCount;
    this.current.stats.veChaiSold = nonNegative(this.current.stats.veChaiSold) + nonNegative(veChaiSold);
    this.store.save(this.current);
  }

  setMuted(muted: boolean): void {
    this.current.settings.muted = muted;
    this.store.save(this.current);
  }

  setPledges(ids: readonly string[]): void {
    const known = new Set(PLEDGES.map(pledge => pledge.id));
    this.current.pledges = [...new Set(ids.filter(id => known.has(id)))].slice(0, 3);
    this.store.save(this.current);
  }
}
