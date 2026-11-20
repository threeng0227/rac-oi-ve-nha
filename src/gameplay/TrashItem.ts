import type { SpriteId, TrashType } from '../data/trashTypes';

export type TrashState = 'ground' | 'flying' | 'bag' | 'dragging' | 'sorted';

const SIZES = { small: 34, medium: 48, large: 60 } as const;

export class TrashItem {
  state: TrashState = 'ground';

  constructor(
    readonly id: number,
    readonly type: TrashType,
    public x: number,
    public y: number,
    readonly variantId?: string,
  ) {}

  get sprite(): SpriteId {
    return this.type.variants?.find((variant) => variant.id === this.variantId)?.sprite ?? this.type.sprite;
  }

  get label(): string {
    return this.type.variants?.find((variant) => variant.id === this.variantId)?.label ?? this.type.name;
  }

  get size(): number {
    return SIZES[this.type.size];
  }

  hitTest(x: number, y: number, minDiameter = 44): boolean {
    if (this.state !== 'ground') return false;
    const radius = Math.max(this.size, minDiameter) / 2;
    return (x - this.x) ** 2 + (y - this.y) ** 2 <= radius ** 2;
  }
}
