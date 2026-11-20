import { EVENT_TEXT } from '../../i18n/vi';
import type { GameEvent, LevelContext } from '../EventSystem';

export class PinRoi implements GameEvent {
  readonly id = 'PIN_ROI';
  readonly label = EVENT_TEXT.PIN_ROI;
  readonly durationSec = 15;
  elapsedSec = 0;
  onStart(ctx: LevelContext): void {
    ctx.spawnTrash(ctx.rng.int(2, 3), 'hazard');
    ctx.startCollector();
  }
  onUpdate(_ctx: LevelContext, dt: number): void { this.elapsedSec += dt; }
  onEnd(): void {}
}
