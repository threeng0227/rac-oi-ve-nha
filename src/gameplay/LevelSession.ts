import type { PointerSample } from '../core/Game';
import { computeLayout, type Layout, type Rect } from '../core/Layout';
import { Random } from '../core/Random';
import { TweenRunner, easeOutCubic } from '../core/Tween';
import type { Viewport } from '../core/Viewport';
import { LEVELS } from '../data/levels';
import { getDecomposeLabel } from '../data/trashTypes';
import { BIN_TEXT, vi } from '../i18n/vi';
import { Bag } from './Bag';
import { Bin, NORMAL_BIN_IDS } from './Bin';
import { Spawner } from './Spawner';
import type { TrashItem } from './TrashItem';

export interface SessionOptions {
  skipTutorial?: boolean;
  seed?: number;
  reducedMotion?: boolean;
  onComplete?: () => void;
}

export interface Feedback {
  readonly text: string;
  readonly kind: 'info' | 'success' | 'error';
  readonly binId?: string;
}

/** Trạng thái màn chơi độc lập với canvas và trình duyệt. */
export class LevelSession {
  readonly level = LEVELS[0]!;
  readonly bag = new Bag();
  readonly bins = NORMAL_BIN_IDS.map((id, index) => new Bin(id, index));
  readonly items: TrashItem[] = [];
  readonly reducedMotion: boolean;
  tutorial: 'pick' | 'sort' | 'done';
  elapsedSec = 0;
  animationSec = 0;
  sortedCount = 0;
  feedback: Feedback | null = null;
  private feedbackSec = 0;
  private readonly spawner: Spawner;
  private readonly tweens = new TweenRunner();
  private readonly flights = new Map<TrashItem, number>();
  private active = true;
  private readonly onComplete: (() => void) | undefined;
  private currentLayout: Layout;

  constructor(private readonly viewport: Viewport, options: SessionOptions = {}) {
    this.currentLayout = computeLayout(viewport);
    this.onComplete = options.onComplete;
    this.reducedMotion = options.reducedMotion ?? false;
    this.spawner = new Spawner(this.level, new Random(options.seed ?? Date.now()));
    this.tutorial = options.skipTutorial ? 'done' : 'pick';
    if (this.tutorial === 'done') this.items.push(...this.spawner.initial(this.layout));
    else {
      const banana = this.spawner.create('vo-chuoi', this.layout);
      banana.x = this.layout.centerX;
      banana.y = this.layout.playfield.y + this.layout.playfield.height * 0.58;
      this.items.push(banana);
    }
  }

  get layout(): Layout { return this.currentLayout; }
  get finished(): boolean { return this.elapsedSec >= this.level.durationSec; }
  get remainingSec(): number { return Math.max(0, Math.ceil(this.level.durationSec - this.elapsedSec)); }

  slotBounds(index: number): Rect {
    const l = this.layout;
    const width = Math.max(l.bagSlotSize, 44 / this.viewport.scale);
    const height = Math.max(l.bag.height, 44 / this.viewport.scale);
    return {
      x: l.bagSlotX(index) + (l.bagSlotSize - width) / 2,
      y: l.bins.y - height,
      width,
      height,
    };
  }

  slotCenter(index: number): { x: number; y: number } {
    const l = this.layout;
    return { x: l.bagSlotX(index) + l.bagSlotSize / 2, y: l.bag.y + l.bag.height / 2 };
  }

  update(dt: number): void {
    if (!this.active) return;
    this.syncLayout();
    this.animationSec += dt;
    this.tweens.update(dt);
    this.feedbackSec = Math.max(0, this.feedbackSec - dt);
    if (this.feedbackSec === 0) this.feedback = null;
    if (this.tutorial !== 'done' || this.finished) return;
    const elapsed = Math.min(this.level.durationSec, this.elapsedSec + dt);
    this.items.push(...this.spawner.update(elapsed - this.elapsedSec, elapsed, this.layout));
    this.elapsedSec = elapsed;
    if (this.finished) {
      this.cancelPointers();
      this.onComplete?.();
    }
  }

  onPointer(sample: PointerSample): void {
    if (!this.active || this.finished) return;
    this.syncLayout();
    const { x, y, id, phase } = sample;
    if (phase === 'cancel') {
      this.bag.cancelDrag(id);
      return;
    }
    if (phase === 'move') {
      const dragged = this.bag.dragFor(id);
      if (dragged) { dragged.x = x; dragged.y = y; }
      return;
    }
    if (phase === 'up') {
      this.drop(id, x, y);
      return;
    }
    if (this.bag.dragFor(id)) return;
    const slot = this.bag.slots.findIndex((item, index) => item !== null && this.contains(this.slotBounds(index), x, y));
    if (slot >= 0) {
      const item = this.bag.beginDrag(slot, id);
      if (item) { item.x = x; item.y = y; }
      return;
    }
    const item = [...this.items].reverse().find(t => t.hitTest(x, y, 44 / this.viewport.scale));
    if (item) this.pick(item);
  }

  cancelPointers(): void {
    this.bag.cancelAllDrags();
    this.tweens.clear();
    for (const item of this.flights.keys()) this.bag.settle(item);
    this.flights.clear();
  }

  exit(): void {
    this.cancelPointers();
    this.active = false;
  }

  private pick(item: TrashItem): void {
    const slot = this.bag.tryAdd(item);
    if (slot === null) {
      this.notify({ text: vi.bagFull, kind: 'info' });
      return;
    }
    if (this.tutorial === 'pick') this.tutorial = 'sort';
    const from = { x: item.x, y: item.y };
    this.flights.set(item, slot);
    this.tweens.add({
      from: 0, to: 1, durationSec: this.reducedMotion ? 0 : 0.3, ease: easeOutCubic,
      onUpdate: progress => {
        const target = this.slotCenter(slot);
        item.x = from.x + (target.x - from.x) * progress;
        item.y = from.y + (target.y - from.y) * progress - Math.sin(progress * Math.PI) * this.layout.bag.height;
      },
      onComplete: () => { this.bag.settle(item); this.flights.delete(item); },
    });
  }

  private drop(pointerId: number, x: number, y: number): void {
    const item = this.bag.dragFor(pointerId);
    if (!item) return;
    const bin = this.bins.find(b => b.contains(x, y, this.layout));
    if (!bin || !bin.accepts(item)) {
      this.bag.cancelDrag(pointerId);
      if (bin) this.notify({ text: vi.wrongBin(item.label, BIN_TEXT[item.type.bin].name), kind: 'error', binId: bin.id });
      return;
    }
    this.bag.removeDragged(pointerId);
    this.items.splice(this.items.indexOf(item), 1);
    this.notify({ text: vi.sorted(item.label, getDecomposeLabel(item.type)), kind: 'success', binId: bin.id });
    if (this.tutorial === 'sort') {
      this.tutorial = 'done';
      this.items.push(...this.spawner.initial(this.layout));
    } else this.sortedCount++;
  }

  private syncLayout(): void {
    const next = computeLayout(this.viewport);
    const old = this.currentLayout;
    if (next.width === old.width && next.height === old.height) return;
    this.cancelPointers();
    for (const item of this.items.filter(t => t.state === 'ground')) {
      item.x = next.spawnArea.x + (item.x - old.spawnArea.x) / old.spawnArea.width * next.spawnArea.width;
      item.y = next.spawnArea.y + (item.y - old.spawnArea.y) / old.spawnArea.height * next.spawnArea.height;
    }
    this.currentLayout = next;
  }

  private notify(feedback: Feedback): void {
    this.feedback = feedback;
    this.feedbackSec = 2;
  }

  private contains(rect: Rect, x: number, y: number): boolean {
    return x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
  }
}
