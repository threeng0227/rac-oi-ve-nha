import { describe, expect, test } from 'vitest';
import { computeLayout, type Layout } from '../../src/core/Layout';
import { Random } from '../../src/core/Random';
import { Viewport } from '../../src/core/Viewport';
import { LEVELS, type LevelDef } from '../../src/data/levels';
import { Spawner } from '../../src/gameplay/Spawner';

const level = LEVELS[0]!;

function makeLayout(width: number, height: number): Layout {
  const viewport = new Viewport();
  viewport.resize(width, height, 1);
  return computeLayout(viewport);
}

const layouts = [[1100, 720], [1800, 720], [720, 1100], [720, 1800]].map(([width, height]) => makeLayout(width!, height!));

describe('Spawner', () => {
  test('hệ số sự kiện nhân tốc độ trong đúng khoảng thời gian cập nhật', () => {
    const layout = layouts[0]!;
    const spawner = new Spawner({ ...level, spawnRatePerSec: 2 }, new Random(1));
    const items = spawner.update(2, 82, layout, 5);
    const expected = Math.floor(2 * layout.playfieldArea / 563200 * 1.6 * 5);
    expect(items).toHaveLength(expected);
  });
  test('10.000 mẫu có seed phân bố đúng trọng số của tám loại màn Hà Nội', () => {
    const spawner = new Spawner(level, new Random(4242));
    const counts = new Map<string, number>();
    for (let i = 0; i < 10_000; i++) {
      const entry = spawner.pickEntry();
      counts.set(entry.typeId, (counts.get(entry.typeId) ?? 0) + 1);
    }
    const totalWeight = level.trashPool.reduce((sum, entry) => sum + entry.weight, 0);
    for (const entry of level.trashPool) {
      expect(Math.abs((counts.get(entry.typeId) ?? 0) / 10_000 - entry.weight / totalWeight), entry.typeId).toBeLessThan(0.02);
    }
    expect(counts.size).toBe(8);
  });

  test('cùng seed tái hiện cùng loại, biến thể, vị trí và id', () => {
    const a = new Spawner(level, new Random(9));
    const b = new Spawner(level, new Random(9));
    expect(a.initial(layouts[0]!)).toEqual(b.initial(layouts[0]!));
    expect(a.update(10, 10, layouts[0]!)).toEqual(b.update(10, 10, layouts[0]!));
  });

  test('số rác đầu và tốc độ sinh tỉ lệ diện tích cả bốn khung máy', () => {
    for (const layout of layouts) {
      const spawner = new Spawner(level, new Random(1));
      expect(spawner.initial(layout)).toHaveLength(Math.round(level.initialTrashCount * layout.playfieldArea / 563200));
      expect(spawner.rateAt(0, layout)).toBeCloseTo(level.spawnRatePerSec * layout.playfieldArea / 563200, 10);
    }
  });

  test('mọi hình rác nằm trọn vùng sinh kể cả sau khi đổi hướng', () => {
    const spawner = new Spawner(level, new Random(55));
    for (const layout of layouts) {
      for (let i = 0; i < 200; i++) {
        const item = spawner.create('tui-nilon', layout);
        const area = layout.spawnArea;
        expect(item.x - item.size / 2).toBeGreaterThanOrEqual(area.x);
        expect(item.x + item.size / 2).toBeLessThanOrEqual(area.x + area.width);
        expect(item.y - item.size / 2).toBeGreaterThanOrEqual(area.y);
        expect(item.y + item.size / 2).toBeLessThanOrEqual(area.y + area.height);
      }
    }
  });

  test('giảm tuyến tính từ còn mười giây tới năm giây, rồi ngừng hẳn', () => {
    const layout = layouts[0]!;
    const spawner = new Spawner(level, new Random(1));
    const normalRate = spawner.rateAt(0, layout);
    expect(spawner.rateAt(80, layout)).toBeCloseTo(normalRate);
    expect(spawner.rateAt(82.5, layout)).toBeCloseTo(normalRate / 2);
    expect(spawner.rateAt(85, layout)).toBe(0);
    expect(spawner.rateAt(89, layout)).toBe(0);
    expect(spawner.rateAt(90, layout)).toBe(0);
    expect(spawner.update(5, 90, layout)).toEqual([]);
  });

  test('bước thời gian khác nhau vẫn sinh đúng số và không sinh rác trễ trong năm giây cuối', () => {
    const denseLevel: LevelDef = { ...level, spawnRatePerSec: 4 };
    const layout = layouts[0]!;
    function run(step: number): number {
      const spawner = new Spawner(denseLevel, new Random(11));
      let count = 0;
      for (let elapsed = step; elapsed <= 90 + 1e-8; elapsed += step) {
        const items = spawner.update(step, elapsed, layout);
        if (elapsed > 85 + 1e-8) expect(items).toHaveLength(0);
        count += items.length;
      }
      return count;
    }
    const expected = Math.floor(4 * layout.playfieldArea / 563200 * 82.5);
    expect(run(1)).toBe(expected);
    expect(run(1 / 60)).toBe(expected);
  });

  test('tạo thủ công và sinh tự động luôn dùng id khác nhau', () => {
    const spawner = new Spawner(level, new Random(0));
    const layout = layouts[0]!;
    const items = [spawner.create('vo-chuoi', layout), ...spawner.initial(layout), ...spawner.update(40, 40, layout)];
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    expect(spawner.create('coc-nhua', layout, 'coc-tra-da').sprite).toBe('coc-tra-da');
  });
});
