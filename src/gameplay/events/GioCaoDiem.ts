import { EVENT_TEXT } from '../../i18n/vi';
import type { GameEvent, LevelContext } from '../EventSystem';

export class GioCaoDiem implements GameEvent {
  readonly id = 'GIO_CAO_DIEM';
  readonly label = EVENT_TEXT.GIO_CAO_DIEM;
  readonly durationSec = 10;
  elapsedSec = 0;
  onStart(): void {}
  onUpdate(_ctx: LevelContext, dt: number): void { this.elapsedSec += dt; }
  onEnd(): void {}
}
