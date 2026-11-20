import type { Rect } from '../../core/Layout';
import { EVENT_TEXT } from '../../i18n/vi';
import type { GameEvent, LevelContext } from '../EventSystem';

export class BaiRacTuPhat implements GameEvent {
  readonly id = 'BAI_RAC_TU_PHAT';
  readonly label = EVENT_TEXT.BAI_RAC_TU_PHAT;
  readonly durationSec = 20;
  elapsedSec = 0;
  private taps = 0;
  get tapsRemaining(): number { return Math.max(0, 8 - this.taps); }

  onStart(): void {}
  onUpdate(_ctx: LevelContext, dt: number): void { this.elapsedSec += dt; }
  onEnd(): void {}

  target(ctx: LevelContext): Rect | null {
    if (this.taps >= 8) return null;
    const area = ctx.layout.spawnArea;
    const minimum = ctx.minTargetSize ?? 44;
    const width = Math.max(minimum, Math.min(area.width * 0.28, ctx.layout.bins.height * 1.5));
    const height = Math.max(minimum, Math.min(area.height * 0.28, ctx.layout.bins.height * 1.2));
    return { x: ctx.layout.centerX - width / 2, y: area.y + area.height * 0.58 - height / 2, width, height };
  }

  onPointer(ctx: LevelContext): void {
    this.taps++;
    if (this.taps === 8) ctx.spawnTrash(ctx.rng.int(12, 20), 'normal');
  }
}
