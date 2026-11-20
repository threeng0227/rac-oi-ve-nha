import type { Layout, Rect } from '../core/Layout';

const VISIBLE_SEC = 15;
const RETURN_DELAY_SEC = 10;

/** Hộp thu gom tạm thời, luôn quay lại khi trong túi còn rác nguy hại. */
export class HazardCollector {
  private phase: 'idle' | 'visible' | 'cooldown' = 'idle';
  private remainingSec = 0;
  private requested = false;

  get visible(): boolean { return this.phase === 'visible'; }
  get entranceProgress(): number {
    return this.visible ? Math.min(1, (VISIBLE_SEC - this.remainingSec) / 0.3) : 0;
  }

  request(): void {
    if (this.visible) return;
    this.requested = true;
    if (this.phase === 'idle') this.show();
  }

  update(dt: number, hasPending: boolean): void {
    if (!Number.isFinite(dt) || dt < 0) return;
    if (this.phase === 'idle' && (hasPending || this.requested)) this.show();
    let elapsed = dt;
    while (elapsed > 0 && this.phase !== 'idle') {
      const consumed = Math.min(elapsed, this.remainingSec);
      elapsed -= consumed;
      this.remainingSec -= consumed;
      if (this.remainingSec > 1e-9) break;
      if (this.visible) {
        this.phase = 'cooldown';
        this.remainingSec = RETURN_DELAY_SEC;
      } else {
        this.phase = 'idle';
        if (hasPending || this.requested) this.show();
      }
    }
  }

  bounds(layout: Layout): Rect {
    const area = layout.spawnArea;
    const width = Math.min(area.width * 0.35, layout.binWidth * 0.72);
    const height = Math.min(area.height * 0.4, layout.bins.height);
    return { x: area.x + area.width - width, y: area.y, width, height };
  }

  contains(x: number, y: number, layout: Layout): boolean {
    if (!this.visible) return false;
    const b = this.bounds(layout);
    return x >= b.x && x < b.x + b.width && y >= b.y && y < b.y + b.height;
  }

  private show(): void {
    this.phase = 'visible';
    this.remainingSec = VISIBLE_SEC;
    this.requested = false;
  }
}
