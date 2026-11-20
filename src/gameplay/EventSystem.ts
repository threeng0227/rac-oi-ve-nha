import type { PointerSample } from '../core/Game';
import type { Layout, Rect } from '../core/Layout';
import type { Random } from '../core/Random';
import type { EventId, LevelDef } from '../data/levels';
import { EVENT_TEXT } from '../i18n/vi';
import type { TrashItem } from './TrashItem';
import { MuaBao } from './events/MuaBao';
import { GioMua } from './events/GioMua';
import { CuuSinhVat } from './events/CuuSinhVat';
import { BacVeChai } from './events/BacVeChai';
import { NemRac } from './events/NemRac';
import { GioCaoDiem } from './events/GioCaoDiem';
import { PinRoi } from './events/PinRoi';
import { BaiRacTuPhat } from './events/BaiRacTuPhat';

export interface LevelContext {
  readonly layout: Layout;
  readonly items: readonly TrashItem[];
  readonly rng: Random;
  readonly minTargetSize?: number;
  spawnTrash(count: number, kind: 'normal' | 'hazard' | 'wind' | 'thrown'): TrashItem[];
  removeTrash(item: TrashItem, cause: 'wind' | 'retrieved'): void;
  addBonus(points: number): void;
  addPollution(amount: number): void;
  showMessage(text: string): void;
  startCollector(): void;
}

export interface GameEvent {
  readonly id: EventId;
  readonly label: string;
  readonly durationSec: number;
  readonly elapsedSec: number;
  readonly tapsRemaining?: number;
  onStart(ctx: LevelContext): void;
  onUpdate(ctx: LevelContext, dt: number): void;
  onEnd(ctx: LevelContext): void;
  target?(ctx: LevelContext): Rect | null;
  onPointer?(ctx: LevelContext): void;
  deliver?(item: TrashItem, ctx: LevelContext): 'accepted' | 'rejected';
}

const FACTORIES: Record<EventId, (rng: Random) => GameEvent> = {
  MUA_BAO: rng => new MuaBao(rng),
  GIO_MUA: () => new GioMua(),
  CUU_SINH_VAT: () => new CuuSinhVat(),
  BAC_VE_CHAI: () => new BacVeChai(),
  NEM_RAC: () => new NemRac(),
  GIO_CAO_DIEM: () => new GioCaoDiem(),
  PIN_ROI: () => new PinRoi(),
  BAI_RAC_TU_PHAT: () => new BaiRacTuPhat(),
};

interface ScheduledEvent {
  readonly event: GameEvent;
  readonly startSec: number;
  warned: boolean;
}

/** Lịch được dời trước để mỗi sự kiện có trọn thời lượng và khoảng nghỉ ba giây. */
export class EventSystem {
  private readonly schedule: ScheduledEvent[];
  private nextIndex = 0;
  private timeSec = 0;
  private current: { event: GameEvent; endSec: number } | null = null;

  constructor(schedule: LevelDef['events'], rng: Random) {
    let previousEnd = -3;
    this.schedule = [...schedule].sort((a, b) => a.atSec - b.atSec).map(entry => {
      const startSec = Math.max(0, entry.atSec, previousEnd + 3);
      const event = FACTORIES[entry.eventId](rng);
      previousEnd = startSec + event.durationSec;
      return { event, startSec, warned: false };
    });
  }

  get active(): GameEvent | null { return this.current?.event ?? null; }
  get spawnMultiplier(): number { return this.active?.id === 'GIO_CAO_DIEM' ? 5 : 1; }
  get pickMultiplier(): number { return this.active?.id === 'MUA_BAO' ? 1.5 : 1; }
  get windActive(): boolean { return this.active?.id === 'GIO_MUA'; }

  update(dt: number, elapsedSec: number, ctx: LevelContext): void {
    if (dt < 0) return;
    const end = Math.max(this.timeSec, elapsedSec);
    let cursor = this.timeSec;
    while (true) {
      if (this.current) {
        const stop = Math.min(end, this.current.endSec);
        if (stop > cursor) this.current.event.onUpdate(ctx, stop - cursor);
        cursor = stop;
        if (cursor < this.current.endSec) break;
        this.current.event.onEnd(ctx);
        this.current = null;
      } else {
        const next = this.schedule[this.nextIndex];
        if (!next) break;
        if (!next.warned && end >= next.startSec - 2) {
          ctx.showMessage(EVENT_TEXT[next.event.id]);
          next.warned = true;
        }
        if (end < next.startSec) break;
        cursor = Math.max(cursor, next.startSec);
        const event = next.event;
        this.current = { event, endSec: next.startSec + event.durationSec };
        this.nextIndex++;
        event.onStart(ctx);
      }
    }
    this.timeSec = end;
  }

  onPointer(sample: PointerSample, ctx: LevelContext): boolean {
    const event = this.active;
    const bounds = event?.target?.(ctx);
    if (sample.phase !== 'down' || !event?.onPointer || !bounds || !this.contains(bounds, sample.x, sample.y)) return false;
    event.onPointer(ctx);
    return true;
  }

  deliver(item: TrashItem, x: number, y: number, ctx: LevelContext): 'accepted' | 'rejected' | null {
    const event = this.active;
    const bounds = event?.target?.(ctx);
    if (!event?.deliver || !bounds || !this.contains(bounds, x, y)) return null;
    return event.deliver(item, ctx);
  }

  private contains(rect: Rect, x: number, y: number): boolean {
    return x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
  }
}
