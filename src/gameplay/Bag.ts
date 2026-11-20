import { BAG_SLOTS } from '../core/Layout';
import type { TrashItem } from './TrashItem';

export class Bag {
  private readonly contents: (TrashItem | null)[] = Array.from({ length: BAG_SLOTS }, () => null);
  private readonly drags = new Map<number, TrashItem>();

  get slots(): readonly (TrashItem | null)[] {
    return this.contents;
  }

  get count(): number {
    return this.contents.filter((item) => item !== null).length;
  }

  get isFull(): boolean {
    return this.count === BAG_SLOTS;
  }

  tryAdd(item: TrashItem): number | null {
    if (item.state !== 'ground' || this.contents.some((entry) => entry?.id === item.id)) return null;
    if (item.type.bin === 'hazard' && this.contents.filter(entry => entry?.type.bin === 'hazard').length >= 2) return null;
    const slot = this.contents.indexOf(null);
    if (slot === -1) return null;
    this.contents[slot] = item;
    item.state = 'flying';
    return slot;
  }

  settle(item: TrashItem): void {
    if (item.state === 'flying' && this.contents.includes(item)) item.state = 'bag';
  }

  beginDrag(slotIndex: number, pointerId: number): TrashItem | null {
    const item = this.contents[slotIndex];
    if (!item || item.state !== 'bag' || this.drags.has(pointerId)) return null;
    item.state = 'dragging';
    this.drags.set(pointerId, item);
    return item;
  }

  dragFor(pointerId: number): TrashItem | null {
    return this.drags.get(pointerId) ?? null;
  }

  cancelDrag(pointerId: number): void {
    const item = this.drags.get(pointerId);
    if (!item) return;
    item.state = 'bag';
    this.drags.delete(pointerId);
  }

  removeDragged(pointerId: number): TrashItem | null {
    const item = this.drags.get(pointerId);
    if (!item) return null;
    this.contents[this.contents.indexOf(item)] = null;
    this.drags.delete(pointerId);
    item.state = 'sorted';
    return item;
  }

  cancelAllDrags(): void {
    for (const pointerId of this.drags.keys()) this.cancelDrag(pointerId);
  }
}
