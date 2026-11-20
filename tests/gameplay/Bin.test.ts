import { describe, expect, test } from 'vitest';
import { computeLayout } from '../../src/core/Layout';
import { Viewport } from '../../src/core/Viewport';
import { TRASH_TYPES } from '../../src/data/trashTypes';
import { Bin, NORMAL_BIN_IDS } from '../../src/gameplay/Bin';
import { TrashItem } from '../../src/gameplay/TrashItem';

describe('Bin', () => {
  test('ba vùng thả theo layout không chồng lấn và hoạt động khi xoay máy', () => {
    for (const [width, height] of [[1100, 720], [1800, 720], [720, 1100], [720, 1800]]) {
      const viewport = new Viewport();
      viewport.resize(width!, height!, 1);
      const layout = computeLayout(viewport);
      const bins = NORMAL_BIN_IDS.map((id, index) => new Bin(id, index));
      for (const [index, bin] of bins.entries()) {
        const bounds = bin.bounds(layout);
        expect(bounds).toEqual({ x: layout.binX(index), y: layout.bins.y, width: layout.binWidth, height: layout.bins.height });
        expect(bin.contains(bounds.x, bounds.y, layout)).toBe(true);
        expect(bin.contains(bounds.x + bounds.width, bounds.y, layout)).toBe(false);
        expect(bin.contains(bounds.x, bounds.y + bounds.height, layout)).toBe(false);
        expect(bin.contains(bounds.x, bounds.y - 1, layout)).toBe(false);
        expect(bins.filter((entry) => entry.contains(bounds.x + bounds.width / 2, bounds.y + 1, layout))).toHaveLength(1);
      }
    }
  });

  test('mọi loại rác chỉ khớp nhóm của mình, nguy hại không khớp thùng thường nào', () => {
    const bins = NORMAL_BIN_IDS.map((id, index) => new Bin(id, index));
    for (const [index, type] of TRASH_TYPES.entries()) {
      const item = new TrashItem(index, type, 0, 0);
      const matches = bins.filter((bin) => bin.accepts(item));
      expect(matches.map((bin) => bin.id)).toEqual(type.bin === 'hazard' ? [] : [type.bin]);
    }
  });
});
