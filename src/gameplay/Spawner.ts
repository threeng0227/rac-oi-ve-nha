import type { Layout } from '../core/Layout';
import { Random } from '../core/Random';
import type { LevelDef, TrashPoolEntry } from '../data/levels';
import { TRASH_TYPES, type TrashId } from '../data/trashTypes';
import { TrashItem } from './TrashItem';

const REFERENCE_AREA = 563200;

export class Spawner {
  private nextId = 0;
  private credit = 0;
  private readonly pool: readonly { value: TrashPoolEntry; weight: number }[];

  constructor(private readonly level: LevelDef, private readonly rng: Random) {
    this.pool = level.trashPool.map((entry) => ({ value: entry, weight: entry.weight }));
  }

  pickEntry(): TrashPoolEntry {
    const entry = this.rng.weighted(this.pool);
    if (!entry) throw new Error('A level needs a trash pool with positive weights');
    return entry;
  }

  create(typeId: TrashId, layout: Layout, variantId?: string): TrashItem {
    const type = TRASH_TYPES.find((entry) => entry.id === typeId)!;
    const item = new TrashItem(this.nextId++, type, 0, 0, variantId);
    const { x, y, width, height } = layout.spawnArea;
    const radius = item.size / 2;
    item.x = this.rng.range(x + radius, x + width - radius);
    item.y = this.rng.range(y + radius, y + height - radius);
    return item;
  }

  initial(layout: Layout): TrashItem[] {
    const count = Math.round(this.level.initialTrashCount * layout.playfieldArea / REFERENCE_AREA);
    return Array.from({ length: count }, () => this.spawn(layout));
  }

  rateAt(elapsedSec: number, layout: Layout): number {
    const remaining = this.level.durationSec - elapsedSec;
    const taper = Math.max(0, Math.min(1, (remaining - 5) / 5));
    return this.level.spawnRatePerSec * layout.playfieldArea / REFERENCE_AREA * taper;
  }

  /** elapsedSec is the end of this update interval. */
  update(dt: number, elapsedSec: number, layout: Layout): TrashItem[] {
    if (dt <= 0) return [];
    const start = Math.max(0, elapsedSec - dt);
    const end = Math.max(0, elapsedSec);
    const scaledRate = this.level.spawnRatePerSec * layout.playfieldArea / REFERENCE_AREA;
    this.credit += scaledRate * (this.activeTimeUntil(end) - this.activeTimeUntil(start));
    const count = Math.floor(this.credit + 1e-9);
    this.credit -= count;
    return Array.from({ length: count }, () => this.spawn(layout));
  }

  private spawn(layout: Layout): TrashItem {
    const entry = this.pickEntry();
    return this.create(entry.typeId, layout, entry.variantId);
  }

  /** Integral of the end-of-level taper, measured in seconds at full rate. */
  private activeTimeUntil(elapsedSec: number): number {
    const fullRateEnd = this.level.durationSec - 10;
    if (elapsedSec <= fullRateEnd) return elapsedSec;
    const tail = Math.min(elapsedSec - fullRateEnd, 5);
    return fullRateEnd + tail - tail * tail / 10;
  }
}
