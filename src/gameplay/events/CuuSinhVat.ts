import type { Rect } from '../../core/Layout';
import { EVENT_TEXT, TRASH_TEXT } from '../../i18n/vi';
import type { GameEvent, LevelContext } from '../EventSystem';

export class CuuSinhVat implements GameEvent {
  readonly id = 'CUU_SINH_VAT';
  readonly label = EVENT_TEXT.CUU_SINH_VAT;
  readonly durationSec = 10;
  elapsedSec = 0;
  private taps = 0;
  get tapsRemaining(): number { return Math.max(0, 5 - this.taps); }

  onStart(): void {}
  onUpdate(_ctx: LevelContext, dt: number): void { this.elapsedSec += dt; }
  onEnd(ctx: LevelContext): void { if (this.taps < 5) ctx.addPollution(15); }

  target(ctx: LevelContext): Rect | null {
    if (this.taps >= 5) return null;
    const area = ctx.layout.spawnArea;
    const minimum = ctx.minTargetSize ?? 44;
    const width = Math.max(minimum, Math.min(area.width * 0.24, ctx.layout.bins.height * 1.3));
    const height = Math.max(minimum, Math.min(area.height * 0.24, ctx.layout.bins.height));
    return { x: ctx.layout.centerX - width / 2, y: area.y + area.height * 0.48 - height / 2, width, height };
  }

  onPointer(ctx: LevelContext): void {
    this.taps++;
    if (this.taps === 5) {
      ctx.addBonus(100);
      ctx.showMessage(TRASH_TEXT['tui-nilon'].harm);
    }
  }
}
