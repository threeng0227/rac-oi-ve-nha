import { describe, expect, test } from 'vitest';
import { TRASH_TYPES } from '../../src/data/trashTypes';
import { TrashItem } from '../../src/gameplay/TrashItem';

const type = TRASH_TYPES.find((entry) => entry.id === 'tan-thuoc-la')!;

describe('TrashItem', () => {
  test('món mới ở trên sàn và giữ vị trí, id, loại rác', () => {
    const item = new TrashItem(7, type, 100, 200);
    expect(item.id).toBe(7);
    expect(item.type).toBe(type);
    expect([item.x, item.y, item.state]).toEqual([100, 200, 'ground']);
  });

  test('vùng chạm tối thiểu 44 đơn vị, có biên tròn rõ ràng', () => {
    const item = new TrashItem(1, type, 100, 200);
    expect(item.size).toBe(34);
    expect(item.hitTest(122, 200)).toBe(true);
    expect(item.hitTest(122.01, 200)).toBe(false);
    expect(item.hitTest(121, 221)).toBe(false);
    expect(item.hitTest(100, 178)).toBe(true);
  });

  test('vùng chạm tăng theo scale thật nhưng không nhỏ hơn hình vẽ', () => {
    const item = new TrashItem(1, type, 0, 0);
    expect(item.hitTest(44, 0, 88)).toBe(true);
    expect(item.hitTest(44.01, 0, 88)).toBe(false);
    expect(item.hitTest(16, 0, 10)).toBe(true);
  });

  test('đã nhặt thì chạm khu cảnh không nhặt lại được', () => {
    const item = new TrashItem(1, type, 100, 200);
    for (const state of ['flying', 'bag', 'dragging', 'sorted'] as const) {
      item.state = state;
      expect(item.hitTest(100, 200), state).toBe(false);
    }
  });

  test('biến thể đổi hình và tên nhưng giữ nguyên loại, biến thể lạ dùng hình gốc', () => {
    const cup = TRASH_TYPES.find((entry) => entry.id === 'coc-nhua')!;
    const icedTea = new TrashItem(1, cup, 0, 0, 'coc-tra-da');
    expect(icedTea.sprite).toBe('coc-tra-da');
    expect(icedTea.label).toBe(cup.variants?.find((variant) => variant.id === 'coc-tra-da')?.label);
    expect(icedTea.type.bin).toBe('other');
    const unknown = new TrashItem(2, cup, 0, 0, 'unknown');
    expect(unknown.sprite).toBe(cup.sprite);
    expect(unknown.label).toBe(cup.name);
  });
});
