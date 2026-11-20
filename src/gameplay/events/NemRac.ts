import type { Rect } from '../../core/Layout';
import { EVENT_TEXT } from '../../i18n/vi';
import type { GameEvent, LevelContext } from '../EventSystem';
import type { TrashItem } from '../TrashItem';

export class NemRac implements GameEvent {
  readonly id = 'NEM_RAC';
  readonly label = EVENT_TEXT.NEM_RAC;
  readonly durationSec = 10;
  elapsedSec = 0;
  private stopped = false;
  private nextThrow = 2;
  private readonly thrown: TrashItem[] = [];

  onStart(): void {}
  onUpdate(ctx: LevelContext, dt: number): void {
    this.elapsedSec += dt;
    while (!this.stopped && this.elapsedSec + 1e-9 >= this.nextThrow && this.nextThrow <= this.durationSec) {
      this.thrown.push(...ctx.spawnTrash(1, 'thrown'));
      this.nextThrow += 2;
    }
  }
  onEnd(): void {}

  target(ctx: LevelContext): Rect | null {
    if (this.stopped) return null;
    const area = ctx.layout.spawnArea;
    const minimum = ctx.minTargetSize ?? 44;
    const width = Math.max(minimum, Math.min(area.width * 0.24, ctx.layout.bins.height * 1.4));
    const height = Math.max(minimum, Math.min(area.height * 0.2, ctx.layout.bins.height * 0.8));
    return {
      x: area.x + (area.width - width) * this.elapsedSec / this.durationSec,
      y: area.y + area.height * 0.2,
      width, height,
    };
  }

  onPointer(ctx: LevelContext): void {
    this.stopped = true;
    for (const item of this.thrown) {
      if (item.state === 'ground' && ctx.items.includes(item)) ctx.removeTrash(item, 'retrieved');
    }
    ctx.addBonus(30);
    ctx.showMessage(EVENT_TEXT.retrieved);
  }
}
