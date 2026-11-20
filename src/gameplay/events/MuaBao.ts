import type { Random } from '../../core/Random';
import { EVENT_TEXT } from '../../i18n/vi';
import type { GameEvent, LevelContext } from '../EventSystem';

export class MuaBao implements GameEvent {
  readonly id = 'MUA_BAO';
  readonly label = EVENT_TEXT.MUA_BAO;
  readonly durationSec = 15;
  elapsedSec = 0;
  private angle = 0;

  constructor(private readonly rng: Random) {}
  onStart(): void { this.angle = this.rng.range(0, Math.PI * 2); }
  onEnd(): void {}

  onUpdate(ctx: LevelContext, dt: number): void {
    let remaining = dt;
    while (remaining > 1e-9) {
      const segment = Math.min(remaining, 3 - this.elapsedSec % 3);
      const area = ctx.layout.spawnArea;
      for (const item of ctx.items) {
        if (item.state !== 'ground') continue;
        const radius = item.size / 2;
        item.x = Math.max(area.x + radius, Math.min(area.x + area.width - radius,
          item.x + Math.cos(this.angle) * area.width * 0.055 * segment));
        item.y = Math.max(area.y + radius, Math.min(area.y + area.height - radius,
          item.y + Math.sin(this.angle) * area.height * 0.055 * segment));
      }
      this.elapsedSec += segment;
      remaining -= segment;
      if (Math.abs(this.elapsedSec / 3 - Math.round(this.elapsedSec / 3)) < 1e-8) {
        this.angle = this.rng.range(0, Math.PI * 2);
      }
    }
  }
}
