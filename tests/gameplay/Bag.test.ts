import { describe, expect, test } from 'vitest';
import { Random } from '../../src/core/Random';
import { TRASH_TYPES } from '../../src/data/trashTypes';
import { Bag } from '../../src/gameplay/Bag';
import { TrashItem } from '../../src/gameplay/TrashItem';

const makeItem = (id: number): TrashItem => new TrashItem(id, TRASH_TYPES[0]!, 0, 0);

function addSettled(bag: Bag, id: number): TrashItem {
  const item = makeItem(id);
  bag.tryAdd(item);
  bag.settle(item);
  return item;
}

describe('Bag', () => {
  test('chỉ có sáu ô, giữ ô ngay lúc bay và từ chối món thứ bảy', () => {
    const bag = new Bag();
    expect(bag.slots).toHaveLength(6);
    for (let i = 0; i < 6; i++) {
      const item = makeItem(i);
      expect(bag.tryAdd(item)).toBe(i);
      expect(item.state).toBe('flying');
    }
    const extra = makeItem(6);
    expect(bag.count).toBe(6);
    expect(bag.isFull).toBe(true);
    expect(bag.tryAdd(extra)).toBeNull();
    expect(extra.state).toBe('ground');
  });

  test('không nhận cùng món hoặc id hai lần, không kéo món còn bay', () => {
    const bag = new Bag();
    const item = makeItem(1);
    bag.tryAdd(item);
    expect(bag.tryAdd(item)).toBeNull();
    expect(bag.tryAdd(makeItem(1))).toBeNull();
    expect(bag.beginDrag(0, 9)).toBeNull();
    bag.settle(item);
    expect(bag.beginDrag(0, 9)).toBe(item);
  });

  test('hai ngón kéo hai món riêng, không chiếm cùng ô hay cùng ngón', () => {
    const bag = new Bag();
    const a = addSettled(bag, 1);
    const b = addSettled(bag, 2);
    expect(bag.beginDrag(0, 10)).toBe(a);
    expect(bag.beginDrag(0, 11)).toBeNull();
    expect(bag.beginDrag(1, 10)).toBeNull();
    expect(bag.beginDrag(1, 11)).toBe(b);
    expect(bag.dragFor(10)).toBe(a);
    expect(bag.dragFor(11)).toBe(b);
    expect(bag.count).toBe(2);
  });

  test('thả hụt hoặc cancel trả món về ô và cho kéo lại', () => {
    const bag = new Bag();
    const item = addSettled(bag, 1);
    bag.beginDrag(0, 20);
    bag.cancelDrag(20);
    expect(item.state).toBe('bag');
    expect(bag.slots[0]).toBe(item);
    expect(bag.dragFor(20)).toBeNull();
    expect(bag.beginDrag(0, 21)).toBe(item);
  });

  test('phân loại giải phóng ô đầu tiên cho món mới và callback bay cũ không hồi sinh món', () => {
    const bag = new Bag();
    const item = addSettled(bag, 1);
    addSettled(bag, 2);
    bag.beginDrag(0, 3);
    expect(bag.removeDragged(3)).toBe(item);
    expect(item.state).toBe('sorted');
    expect(bag.tryAdd(makeItem(3))).toBe(0);
    bag.settle(item);
    expect(item.state).toBe('sorted');
    expect(bag.count).toBe(2);
    expect(bag.removeDragged(3)).toBeNull();
  });

  test('rời scene hoặc resize bỏ mọi trạng thái kéo và vẫn còn phân loại được', () => {
    const bag = new Bag();
    const a = addSettled(bag, 1);
    const b = addSettled(bag, 2);
    bag.beginDrag(0, 0);
    bag.beginDrag(1, 1);
    bag.cancelAllDrags();
    expect([a.state, b.state]).toEqual(['bag', 'bag']);
    expect(bag.dragFor(0)).toBeNull();
    expect(bag.dragFor(1)).toBeNull();
    expect(bag.beginDrag(0, 0)).toBe(a);
  });

  test('chuỗi ngẫu nhiên không mất món hoặc kẹt túi, luôn dọn hết được', () => {
    const bag = new Bag();
    const random = new Random(2026);
    let nextId = 0;
    for (let i = 0; i < 5_000; i++) {
      const pointer = random.int(0, 2);
      switch (random.int(0, 4)) {
        case 0: bag.tryAdd(makeItem(nextId++)); break;
        case 1: {
          const item = bag.slots[random.int(0, 5)];
          if (item) bag.settle(item);
          break;
        }
        case 2: bag.beginDrag(random.int(0, 5), pointer); break;
        case 3: bag.cancelDrag(pointer); break;
        case 4: bag.removeDragged(pointer); break;
      }
      const present = bag.slots.filter((item) => item !== null);
      expect(bag.count).toBe(present.length);
      expect(bag.count).toBeLessThanOrEqual(6);
      expect(new Set(present.map((item) => item.id)).size).toBe(present.length);
    }
    bag.cancelAllDrags();
    for (let slot = 0; slot < 6; slot++) {
      const item = bag.slots[slot];
      if (!item) continue;
      bag.settle(item);
      expect(bag.beginDrag(slot, slot)).toBe(item);
      expect(bag.removeDragged(slot)).toBe(item);
    }
    expect(bag.count).toBe(0);
    expect(bag.tryAdd(makeItem(nextId))).toBe(0);
  });
});
