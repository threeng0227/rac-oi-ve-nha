import { describe, expect, test } from 'vitest';
import { computeLayout } from '../../src/core/Layout';
import { Viewport } from '../../src/core/Viewport';
import { TRASH_TYPES } from '../../src/data/trashTypes';
import { Bag } from '../../src/gameplay/Bag';
import { HazardCollector } from '../../src/gameplay/HazardCollector';
import { TrashItem } from '../../src/gameplay/TrashItem';

describe('HazardCollector', () => {
  test('tiến độ trượt vào hoàn thành trong thời gian phản xạ đầu tiên', () => {
    const collector = new HazardCollector();
    collector.request();
    expect(collector.entranceProgress).toBe(0);
    collector.update(0.15, true);
    expect(collector.entranceProgress).toBeCloseTo(0.5);
    collector.update(0.15, true);
    expect(collector.entranceProgress).toBe(1);
  });
  test('yêu cầu đầu hiện hộp trong mười lăm giây và không gia hạn khi có rác mới', () => {
    const collector = new HazardCollector();
    expect(collector.visible).toBe(false);
    collector.request();
    expect(collector.visible).toBe(true);
    collector.update(10, true);
    collector.request();
    collector.update(5, true);
    expect(collector.visible).toBe(false);
  });

  test('còn rác trong túi thì hộp quay lại sau đúng mười giây, không phạt lúc rời đi', () => {
    const collector = new HazardCollector();
    collector.request();
    collector.update(15, true);
    collector.update(9.99, true);
    expect(collector.visible).toBe(false);
    collector.update(0.01, true);
    expect(collector.visible).toBe(true);
    collector.update(15, true);
    expect(collector.visible).toBe(false);
  });

  test('hết rác chờ thì không tự quay lại, yêu cầu trong thời gian nghỉ vẫn đợi đủ', () => {
    const collector = new HazardCollector();
    collector.request();
    collector.update(15, false);
    collector.update(4, false);
    collector.request();
    collector.request();
    expect(collector.visible).toBe(false);
    collector.update(6, false);
    expect(collector.visible).toBe(true);
    collector.update(25, false);
    expect(collector.visible).toBe(false);
    collector.update(100, false);
    expect(collector.visible).toBe(false);
    collector.request();
    expect(collector.visible).toBe(true);
  });

  test('bước thời gian dài đi qua nhiều lần đóng mở đúng như bước nhỏ', () => {
    const longStep = new HazardCollector();
    const shortStep = new HazardCollector();
    longStep.request();
    shortStep.request();
    longStep.update(123, true);
    for (let i = 0; i < 123; i++) shortStep.update(1, true);
    expect(longStep.visible).toBe(shortStep.visible);
    longStep.update(2, true);
    shortStep.update(2, true);
    expect(longStep.visible).toBe(true);
    expect(shortStep.visible).toBe(true);
  });

  test('vùng hộp nằm trong khu cảnh ở bốn khung, chỉ nhận khi đang hiện', () => {
    for (const [width, height] of [[1100, 720], [1800, 720], [720, 1100], [720, 1800]]) {
      const viewport = new Viewport();
      viewport.resize(width!, height!, 1);
      const layout = computeLayout(viewport);
      const collector = new HazardCollector();
      const b = collector.bounds(layout);
      expect(b.x).toBeGreaterThanOrEqual(layout.spawnArea.x);
      expect(b.x + b.width).toBeLessThanOrEqual(layout.spawnArea.x + layout.spawnArea.width);
      expect(b.y).toBeGreaterThanOrEqual(layout.playfield.y);
      expect(b.y + b.height).toBeLessThanOrEqual(layout.bag.y);
      expect(collector.contains(b.x + b.width / 2, b.y + b.height / 2, layout)).toBe(false);
      collector.request();
      expect(collector.contains(b.x, b.y, layout)).toBe(true);
      expect(collector.contains(b.x + b.width, b.y, layout)).toBe(false);
    }
  });

  test('một trăm chu kỳ thu gom luôn giải phóng được hai ô nguy hại', () => {
    const bag = new Bag();
    const collector = new HazardCollector();
    const hazard = TRASH_TYPES.find(type => type.bin === 'hazard')!;
    for (let cycle = 0; cycle < 100; cycle++) {
      collector.request();
      for (let index = 0; index < 2; index++) {
        const item = new TrashItem(cycle * 2 + index, hazard, 0, 0);
        expect(bag.tryAdd(item)).toBe(index);
        bag.settle(item);
      }
      collector.update(25, true);
      expect(collector.visible).toBe(true);
      for (let index = 0; index < 2; index++) {
        expect(bag.beginDrag(index, index)).not.toBeNull();
        expect(bag.removeDragged(index)).not.toBeNull();
      }
      expect(bag.count).toBe(0);
      collector.update(25, false);
    }
  });
});
