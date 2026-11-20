import { describe, expect, test } from 'vitest';
import { computeLayout, type Layout, type Rect } from '../../src/core/Layout';
import { Random } from '../../src/core/Random';
import { Viewport } from '../../src/core/Viewport';
import type { EventId, LevelDef } from '../../src/data/levels';
import { TRASH_TYPES } from '../../src/data/trashTypes';
import { EventSystem, type LevelContext } from '../../src/gameplay/EventSystem';
import { TrashItem } from '../../src/gameplay/TrashItem';

function fixture(width = 1280, height = 720): LevelContext & {
  items: TrashItem[];
  bonuses: number[];
  pollution: number[];
  messages: string[];
  spawned: { count: number; kind: string }[];
  removed: { item: TrashItem; cause: string }[];
  collectorStarts: number;
} {
  const viewport = new Viewport();
  viewport.resize(width, height, 1);
  let nextId = 0;
  return {
    layout: computeLayout(viewport), items: [], rng: new Random(42),
    bonuses: [], pollution: [], messages: [], spawned: [], removed: [], collectorStarts: 0,
    spawnTrash(count, kind) {
      this.spawned.push({ count, kind });
      const created = Array.from({ length: count }, () => new TrashItem(nextId++,
        TRASH_TYPES.find(type => type.id === (kind === 'hazard' ? 'pin-aa' : 'chai-nhua-pet'))!,
        this.layout.spawnArea.x, this.layout.spawnArea.y + this.layout.spawnArea.height / 2));
      this.items.push(...created);
      return created;
    },
    removeTrash(item, cause) {
      this.removed.push({ item, cause });
      const index = this.items.indexOf(item);
      if (index >= 0) this.items.splice(index, 1);
    },
    addBonus(points) { this.bonuses.push(points); },
    addPollution(amount) { this.pollution.push(amount); },
    showMessage(message) { this.messages.push(message); },
    startCollector() { this.collectorStarts++; },
  };
}

function start(id: EventId, context = fixture()): { events: EventSystem; ctx: ReturnType<typeof fixture> } {
  const events = new EventSystem([{ eventId: id, atSec: 0 }], new Random(7));
  events.update(0, 0, context);
  return { events, ctx: context };
}

function tap(events: EventSystem, ctx: LevelContext, count: number): void {
  const rect = events.active?.target?.(ctx);
  expect(rect).not.toBeNull();
  for (let i = 0; i < count; i++) {
    events.onPointer({ phase: 'down', id: 1, x: rect!.x + rect!.width / 2, y: rect!.y + rect!.height / 2 }, ctx);
  }
}

function inside(rect: Rect, layout: Layout): void {
  expect(rect.x).toBeGreaterThanOrEqual(0);
  expect(rect.y).toBeGreaterThanOrEqual(layout.playfield.y);
  expect(rect.x + rect.width).toBeLessThanOrEqual(layout.width);
  expect(rect.y + rect.height).toBeLessThanOrEqual(layout.bag.y);
}

describe('EventSystem', () => {
  test('mọi mục tiêu đủ vùng chạm tối thiểu đã quy đổi từ CSS px', () => {
    for (const id of ['CUU_SINH_VAT', 'BAI_RAC_TU_PHAT', 'NEM_RAC', 'BAC_VE_CHAI'] as const) {
      const ctx = { ...fixture(), minTargetSize: 90 };
      const { events } = start(id, ctx);
      const target = events.active?.target?.(ctx)!;
      expect(target.width).toBeGreaterThanOrEqual(90);
      expect(target.height).toBeGreaterThanOrEqual(90);
    }
  });
  test('báo trước hai giây rồi mới chạy, cập nhật lớn vẫn kết thúc đúng', () => {
    const ctx = fixture();
    const events = new EventSystem([{ eventId: 'MUA_BAO', atSec: 10 }], new Random(1));
    events.update(7, 7, ctx);
    expect(ctx.messages).toHaveLength(0);
    expect(events.active).toBeNull();
    events.update(1, 8, ctx);
    expect(ctx.messages).toHaveLength(1);
    expect(events.active).toBeNull();
    events.update(2, 10, ctx);
    expect(events.active?.id).toBe('MUA_BAO');
    expect(events.pickMultiplier).toBe(1.5);
    events.update(15, 25, ctx);
    expect(events.active).toBeNull();
    expect(events.pickMultiplier).toBe(1);
  });

  test('sự kiện trùng giờ xếp hàng, cách ba giây sau khi sự kiện trước kết thúc', () => {
    const ctx = fixture();
    const events = new EventSystem([
      { eventId: 'GIO_CAO_DIEM', atSec: 3 },
      { eventId: 'PIN_ROI', atSec: 3 },
      { eventId: 'CUU_SINH_VAT', atSec: 4 },
    ], new Random(1));
    events.update(3, 3, ctx);
    expect(events.active?.id).toBe('GIO_CAO_DIEM');
    events.update(10, 13, ctx);
    expect(events.active).toBeNull();
    events.update(2, 15, ctx);
    expect(events.active).toBeNull();
    events.update(1, 16, ctx);
    expect(events.active?.id).toBe('PIN_ROI');
    events.update(15, 31, ctx);
    expect(events.active).toBeNull();
    events.update(3, 34, ctx);
    expect(events.active?.id).toBe('CUU_SINH_VAT');
  });

  test('nhiều lịch ngẫu nhiên luôn chỉ có một sự kiện, mỗi sự kiện có đủ thời lượng', () => {
    const rng = new Random(88);
    const ids: EventId[] = ['MUA_BAO', 'GIO_MUA', 'GIO_CAO_DIEM', 'PIN_ROI'];
    for (let seed = 0; seed < 20; seed++) {
      const schedule: LevelDef['events'] = Array.from({ length: 8 }, (_, index) => ({
        eventId: ids[index % ids.length]!, atSec: rng.int(3, 40),
      }));
      const events = new EventSystem(schedule, new Random(seed));
      const ctx = fixture();
      let previous: typeof events.active = null;
      let started = 0;
      let startAt = 0;
      for (let time = 0; time <= 200; time += 0.5) {
        events.update(0.5, time, ctx);
        const active = events.active;
        if (active === previous) continue;
        if (previous) expect(time - startAt).toBeGreaterThanOrEqual(previous.durationSec);
        if (active) { started++; startAt = time; }
        previous = active;
      }
      expect(started).toBe(8);
    }
  });

  test('giờ cao điểm nhân năm tốc độ, hết sự kiện trả về một', () => {
    const { events, ctx } = start('GIO_CAO_DIEM');
    expect(events.spawnMultiplier).toBe(5);
    expect(events.windActive).toBe(false);
    events.update(10, 10, ctx);
    expect(events.spawnMultiplier).toBe(1);
  });

  test('pin rơi sinh hai tới ba món nguy hại và mở hộp thu gom đúng một lần', () => {
    const { events, ctx } = start('PIN_ROI');
    expect(ctx.spawned).toHaveLength(1);
    expect(ctx.spawned[0]?.kind).toBe('hazard');
    expect(ctx.spawned[0]?.count).toBeGreaterThanOrEqual(2);
    expect(ctx.spawned[0]?.count).toBeLessThanOrEqual(3);
    expect(ctx.collectorStarts).toBe(1);
    events.update(1, 1, ctx);
    expect(ctx.collectorStarts).toBe(1);
  });

  test('cứu sinh vật cần năm lần chạm, thành công thưởng một trăm và không phạt', () => {
    const { events, ctx } = start('CUU_SINH_VAT');
    expect(events.active?.tapsRemaining).toBe(5);
    tap(events, ctx, 4);
    expect(events.active?.tapsRemaining).toBe(1);
    expect(ctx.bonuses).toEqual([]);
    tap(events, ctx, 1);
    expect(events.active?.tapsRemaining).toBe(0);
    expect(ctx.bonuses).toEqual([100]);
    expect(events.active?.target?.(ctx)).toBeNull();
    events.update(10, 10, ctx);
    expect(ctx.pollution).toEqual([]);
  });

  test('cứu sinh vật thất bại cộng mười lăm ô nhiễm đúng một lần', () => {
    const { events, ctx } = start('CUU_SINH_VAT');
    tap(events, ctx, 4);
    events.update(10, 10, ctx);
    events.update(1, 11, ctx);
    expect(ctx.pollution).toEqual([15]);
  });

  test('bãi rác cần tám lần chạm, bung mười hai tới hai mươi món một lần', () => {
    const { events, ctx } = start('BAI_RAC_TU_PHAT');
    expect(events.active?.tapsRemaining).toBe(8);
    tap(events, ctx, 7);
    expect(events.active?.tapsRemaining).toBe(1);
    expect(ctx.spawned).toEqual([]);
    tap(events, ctx, 1);
    expect(events.active?.tapsRemaining).toBe(0);
    expect(ctx.spawned).toHaveLength(1);
    expect(ctx.spawned[0]?.kind).toBe('normal');
    expect(ctx.spawned[0]?.count).toBeGreaterThanOrEqual(12);
    expect(ctx.spawned[0]?.count).toBeLessThanOrEqual(20);
    expect(events.active?.target?.(ctx)).toBeNull();
  });

  test('người ném rác ném mỗi hai giây, chạm thì nhặt lại rác và dừng ném', () => {
    const { events, ctx } = start('NEM_RAC');
    events.update(6, 6, ctx);
    expect(ctx.spawned).toHaveLength(3);
    expect(ctx.spawned.every(entry => entry.count === 1 && entry.kind === 'thrown')).toBe(true);
    ctx.items[0]!.state = 'bag';
    tap(events, ctx, 1);
    expect(ctx.removed).toHaveLength(2);
    expect(ctx.removed.every(entry => entry.cause === 'retrieved')).toBe(true);
    expect(ctx.bonuses).toEqual([30]);
    events.update(4, 10, ctx);
    expect(ctx.spawned).toHaveLength(3);
  });

  test('không chạm người ném rác thì mọi món ném còn trên sàn', () => {
    const { events, ctx } = start('NEM_RAC');
    events.update(10, 10, ctx);
    expect(ctx.spawned).toHaveLength(5);
    expect(ctx.items).toHaveLength(5);
    expect(ctx.removed).toEqual([]);
  });

  test('xe ve chai chỉ nhận tái chế, trả trạng thái rejected cho nhóm khác', () => {
    const { events, ctx } = start('BAC_VE_CHAI');
    const bounds = events.active?.target?.(ctx)!;
    const recycle = ctx.spawnTrash(1, 'normal')[0]!;
    const food = new TrashItem(9, TRASH_TYPES.find(type => type.id === 'vo-chuoi')!, 0, 0);
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;
    expect(events.deliver(recycle, x, y, ctx)).toBe('accepted');
    expect(events.deliver(food, x, y, ctx)).toBe('rejected');
    expect(events.deliver(food, -100, -100, ctx)).toBeNull();
    expect(ctx.bonuses).toEqual([]);
    expect(ctx.pollution).toEqual([]);
  });

  test('mưa bão di chuyển rác trên sàn, giữ rác trong vùng và bỏ qua rác trong túi', () => {
    const { events, ctx } = start('MUA_BAO');
    const [ground, bag] = ctx.spawnTrash(2, 'normal');
    ground!.x = ctx.layout.centerX;
    const before = { x: ground!.x, y: ground!.y };
    bag!.state = 'bag';
    const bagBefore = { x: bag!.x, y: bag!.y };
    events.update(4, 4, ctx);
    expect({ x: ground!.x, y: ground!.y }).not.toEqual(before);
    expect({ x: bag!.x, y: bag!.y }).toEqual(bagBefore);
    expect(ground!.x).toBeGreaterThanOrEqual(ctx.layout.spawnArea.x);
    expect(ground!.x).toBeLessThanOrEqual(ctx.layout.spawnArea.x + ctx.layout.spawnArea.width);
  });

  test('gió mùa chỉ cuốn rác sinh trong sự kiện, rác bay ra khỏi màn được loại trừ', () => {
    const ctx = fixture();
    const old = ctx.spawnTrash(1, 'normal')[0]!;
    const { events } = start('GIO_MUA', ctx);
    const incoming = ctx.spawnTrash(1, 'wind')[0]!;
    const oldPosition = { x: old.x, y: old.y };
    const beforeY = incoming.y;
    events.update(1, 1, ctx);
    expect(events.windActive).toBe(true);
    expect(incoming.x).toBeGreaterThan(ctx.layout.spawnArea.x);
    expect(incoming.y).not.toBe(beforeY);
    expect({ x: old.x, y: old.y }).toEqual(oldPosition);
    events.update(11, 12, ctx);
    expect(ctx.removed).toEqual([{ item: incoming, cause: 'wind' }]);
    expect(events.windActive).toBe(false);
  });

  test('tọa độ mục tiêu nằm trong khu cảnh ở cả bốn khung máy', () => {
    for (const [width, height] of [[1100, 720], [1800, 720], [720, 1100], [720, 1800]]) {
      for (const id of ['CUU_SINH_VAT', 'BAI_RAC_TU_PHAT', 'NEM_RAC', 'BAC_VE_CHAI'] as const) {
        const { events, ctx } = start(id, fixture(width!, height!));
        inside(events.active?.target?.(ctx)!, ctx.layout);
        events.update(5, 5, ctx);
        inside(events.active?.target?.(ctx)!, ctx.layout);
      }
    }
  });

  test('chạm ngoài mục tiêu hoặc pointerup không kích hoạt hành vi', () => {
    const { events, ctx } = start('BAI_RAC_TU_PHAT');
    expect(events.onPointer({ phase: 'down', id: 0, x: -1, y: -1 }, ctx)).toBe(false);
    const bounds = events.active?.target?.(ctx)!;
    expect(events.onPointer({ phase: 'up', id: 0, x: bounds.x, y: bounds.y }, ctx)).toBe(false);
    expect(ctx.spawned).toEqual([]);
  });
});
