import type { Layout, Rect } from '../core/Layout';
import type { TrashItem } from './TrashItem';

export const NORMAL_BIN_IDS = ['recycle', 'food', 'other'] as const;
export type NormalBinId = typeof NORMAL_BIN_IDS[number];

export class Bin {
  constructor(readonly id: NormalBinId, readonly index: number) {}

  bounds(layout: Layout): Rect {
    return { x: layout.binX(this.index), y: layout.bins.y, width: layout.binWidth, height: layout.bins.height };
  }

  contains(x: number, y: number, layout: Layout): boolean {
    const bounds = this.bounds(layout);
    return x >= bounds.x && x < bounds.x + bounds.width && y >= bounds.y && y < bounds.y + bounds.height;
  }

  accepts(item: TrashItem): boolean {
    return item.type.bin === this.id;
  }
}
