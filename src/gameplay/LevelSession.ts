import type { PointerSample } from '../core/Game';
import { computeLayout, type Layout, type Rect } from '../core/Layout';
import { Random } from '../core/Random';
import { TweenRunner, easeOutCubic } from '../core/Tween';
import type { Viewport } from '../core/Viewport';
import { LEVELS, type LevelDef, type EventId } from '../data/levels';
import { TRASH_TYPES, getDecomposeLabel, type TrashId } from '../data/trashTypes';
import { BIN_TEXT, EVENT_TEXT, HAZARD_TEXT, vi } from '../i18n/vi';
import type { SfxId } from '../core/Audio';
import { Bag } from './Bag';
import { Bin, NORMAL_BIN_IDS } from './Bin';
import { Spawner } from './Spawner';
import type { TrashItem } from './TrashItem';
import { ScoreSystem, type LevelResult } from './ScoreSystem';
import { EventSystem } from './EventSystem';
import { HazardCollector } from './HazardCollector';

export interface SessionOptions {
  skipTutorial?: boolean;
  seed?: number;
  reducedMotion?: boolean;
  onComplete?: (result: LevelResult) => void;
  level?: LevelDef;
  onDiscover?: (typeId: TrashId) => void;
  onSound?: (sound: SfxId) => void;
  onEventChange?: (eventId: EventId | null) => void;
}

export interface Feedback {
  readonly text: string;
  readonly kind: 'info' | 'success' | 'error';
  readonly binId?: string;
  readonly knowledge?: boolean;
}

/** Trạng thái màn chơi độc lập với canvas và trình duyệt. */
export class LevelSession {
  readonly level: LevelDef;
  readonly score: ScoreSystem;
  readonly events: EventSystem;
  readonly collector = new HazardCollector();
  readonly rng: Random;
  readonly bag = new Bag();
  readonly bins = NORMAL_BIN_IDS.map((id, index) => new Bin(id, index));
  readonly items: TrashItem[] = [];
  readonly reducedMotion: boolean;
  tutorial: 'pick' | 'sort' | 'done';
  elapsedSec = 0;
  animationSec = 0;
  result: LevelResult | null = null;
  veChaiSold = 0;
  readonly correctTypeIds = new Set<TrashId>();
  private completionAge = 0;
  feedback: Feedback | null = null;
  private feedbackSec = 0;
  private readonly spawner: Spawner;
  private readonly tweens = new TweenRunner();
  private readonly flights = new Map<TrashItem, number>();
  private active = true;
  private readonly onComplete: ((result: LevelResult) => void) | undefined;
  private readonly onDiscover: ((typeId: TrashId) => void) | undefined;
  private readonly onSound: ((sound: SfxId) => void) | undefined;
  private readonly onEventChange: ((eventId: EventId | null) => void) | undefined;
  private currentLayout: Layout;

  constructor(private readonly viewport: Viewport, options: SessionOptions = {}) {
    this.currentLayout = computeLayout(viewport);
    this.level = options.level ?? LEVELS[0]!;
    this.score = new ScoreSystem(this.level.durationSec);
    this.rng = new Random(options.seed ?? Date.now());
    this.events = new EventSystem(this.level.events, this.rng);
    this.onComplete = options.onComplete;
    this.onDiscover = options.onDiscover;
    this.onSound = options.onSound;
    this.onEventChange = options.onEventChange;
    this.reducedMotion = options.reducedMotion ?? false;
    this.spawner = new Spawner(this.level, this.rng);
    this.tutorial = options.skipTutorial || this.level.id !== 'ha-noi' ? 'done' : 'pick';
    if (this.tutorial === 'done') this.addItems(this.spawner.initial(this.layout));
    else {
      const banana = this.spawner.create('vo-chuoi', this.layout);
      banana.x = this.layout.centerX;
      banana.y = this.layout.playfield.y + this.layout.playfield.height * 0.58;
      this.items.push(banana);
    }
  }

  get layout(): Layout { return this.currentLayout; }
  get finished(): boolean { return this.result !== null; }
  get sortedCount(): number { return this.score.correctCount; }
  get minTargetSize(): number { return 44 / this.viewport.scale; }
  get eventTarget(): Rect | null { return this.events.active?.target?.(this) ?? null; }
  get eventId() { return this.events.active?.id ?? null; }
  get revealProgress(): number {
    if (!this.result || this.result.failed || this.result.stars === 0) return 0;
    return this.reducedMotion ? 1 : Math.min(1, this.completionAge / 2);
  }
  get resultReady(): boolean {
    return this.result !== null && (this.result.failed || this.result.stars === 0 || this.revealProgress === 1);
  }
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
    if (this.finished) { this.completionAge += dt; return; }
    if (this.tutorial !== 'done') return;
    const elapsed = Math.min(this.level.durationSec, this.elapsedSec + dt);
    const step = elapsed - this.elapsedSec;
    this.score.update(step, this.items.filter(item => item.state === 'ground').length);
    this.elapsedSec = elapsed;
    this.collector.update(step, this.bag.slots.some(item => item?.type.bin === 'hazard'));
    const previousEvent = this.eventId;
    this.events.update(step, elapsed, this);
    if (this.eventId !== previousEvent) this.onEventChange?.(this.eventId);
    this.addItems(this.spawner.update(step, elapsed, this.layout, this.events.spawnMultiplier));
    if (this.score.failed || elapsed >= this.level.durationSec) this.complete();
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
    if (this.tutorial === 'done' && this.events.onPointer(sample, this)) return;
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
      this.notify({ text: item.type.bin === 'hazard' && !this.bag.isFull ? HAZARD_TEXT.waitCollector : vi.bagFull, kind: 'info' });
      return;
    }
    if (this.tutorial === 'pick') this.tutorial = 'sort';
    else if (this.tutorial === 'done') this.score.pick(item, this.events.pickMultiplier);
    this.onSound?.('pickup');
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
    if (item.type.bin === 'hazard' && this.collector.contains(x, y, this.layout)) {
      this.bag.removeDragged(pointerId);
      this.items.splice(this.items.indexOf(item), 1);
      this.score.sort(item, true);
      this.onSound?.('hazard');
      this.discover(item.type.id);
      this.notify({ text: `${item.type.harm} ${item.type.tip}`, kind: 'success', knowledge: true });
      return;
    }
    const delivery = this.events.deliver(item, x, y, this);
    if (delivery === 'accepted') {
      this.bag.removeDragged(pointerId);
      this.items.splice(this.items.indexOf(item), 1);
      this.score.sort(item, true, 2);
      this.onSound?.('correct');
      this.discover(item.type.id);
      this.veChaiSold++;
      this.notify({ text: vi.sorted(item.label, getDecomposeLabel(item.type)), kind: 'success' });
      return;
    }
    if (delivery === 'rejected') { this.bag.cancelDrag(pointerId); return; }
    const bin = this.bins.find(b => b.contains(x, y, this.layout));
    if (!bin || !bin.accepts(item)) {
      this.bag.cancelDrag(pointerId);
      if (bin) {
        this.onSound?.('wrong');
        this.notify({ text: item.type.bin === 'hazard' ? HAZARD_TEXT.wrongSort : vi.wrongBin(item.label, BIN_TEXT[item.type.bin].name), kind: 'error', binId: bin.id });
        if (this.tutorial === 'done') this.score.sort(item, false);
        if (this.score.failed) this.complete();
      }
      return;
    }
    this.bag.removeDragged(pointerId);
    this.onSound?.('correct');
    this.items.splice(this.items.indexOf(item), 1);
    this.notify({ text: vi.sorted(item.label, getDecomposeLabel(item.type)), kind: 'success', binId: bin.id });
    this.discover(item.type.id);
    if (this.tutorial === 'sort') {
      this.tutorial = 'done';
      this.addItems(this.spawner.initial(this.layout));
    } else this.score.sort(item, true);
  }

  private discover(typeId: TrashId): void {
    if (this.correctTypeIds.has(typeId)) return;
    this.correctTypeIds.add(typeId);
    this.onDiscover?.(typeId);
  }

  private addItems(items: TrashItem[]): void {
    this.items.push(...items);
    for (const item of items) {
      if (this.events.windActive) item.x = this.layout.spawnArea.x + item.size / 2;
      this.score.registerSpawn(item, this.elapsedSec);
      if (item.type.bin === 'hazard') this.collector.request();
    }
  }

  spawnTrash(count: number, kind: 'normal' | 'hazard' | 'wind' | 'thrown'): TrashItem[] {
    const hazardTypes = this.level.trashPool.map(entry => TRASH_TYPES.find(type => type.id === entry.typeId)!)
      .filter(type => type.bin === 'hazard');
    const normalPool = this.level.trashPool.filter(entry => TRASH_TYPES.find(type => type.id === entry.typeId)?.bin !== 'hazard');
    const items = Array.from({ length: count }, () => {
      const entry = this.rng.weighted(normalPool.map(value => ({ value, weight: value.weight })));
      const hazard = this.rng.pick(hazardTypes.length ? hazardTypes : TRASH_TYPES.filter(type => type.bin === 'hazard'))!;
      const typeId = kind === 'hazard' ? hazard.id : entry?.typeId ?? 'tui-nilon';
      return this.spawner.create(typeId, this.layout, kind === 'hazard' ? undefined : entry?.variantId);
    });
    this.addItems(items);
    return items;
  }

  removeTrash(item: TrashItem, _cause: 'wind' | 'retrieved'): void {
    if (item.state !== 'ground') return;
    const index = this.items.indexOf(item);
    if (index < 0) return;
    this.items.splice(index, 1);
    this.score.removeByWind(item);
  }

  addBonus(points: number): void { this.score.addBonus(points); }
  addPollution(amount: number): void { this.score.addPollution(amount); }
  showMessage(text: string): void {
    if (this.level.events.some(event => EVENT_TEXT[event.eventId] === text)) this.onSound?.('event');
    this.notify({ text, kind: 'info', knowledge: this.eventId === 'CUU_SINH_VAT' && this.events.active?.tapsRemaining === 0 });
  }
  startCollector(): void { this.collector.request(); }

  private complete(): void {
    if (this.finished) return;
    this.cancelPointers();
    this.result = this.score.finish(this.bag.slots.filter((item): item is TrashItem => item !== null));
    this.onSound?.(this.result.stars >= 1 ? 'win' : 'lose');
    this.onComplete?.(this.result);
  }

  private syncLayout(): void {
    const old = this.currentLayout;
    if (this.viewport.width === old.width && this.viewport.height === old.height) return;
    const next = computeLayout(this.viewport);
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
