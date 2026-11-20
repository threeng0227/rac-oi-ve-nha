import type { Rect } from '../../core/Layout';
import { EVENT_TEXT } from '../../i18n/vi';
import type { GameEvent, LevelContext } from '../EventSystem';
import type { TrashItem } from '../TrashItem';

export class BacVeChai implements GameEvent {
  readonly id = 'BAC_VE_CHAI';
  readonly label = EVENT_TEXT.BAC_VE_CHAI;
  readonly durationSec = 12;
  elapsedSec = 0;
  onStart(): void {}
  onUpdate(_ctx: LevelContext, dt: number): void { this.elapsedSec += dt; }
  onEnd(): void {}

  target(ctx: LevelContext): Rect {
    const area = ctx.layout.spawnArea;
    const minimum = ctx.minTargetSize ?? 44;
    const width = Math.max(minimum, Math.min(area.width * 0.28, ctx.layout.bins.height * 1.5));
    const height = Math.max(minimum, Math.min(area.height * 0.25, ctx.layout.bins.height));
    return {
      x: area.x + (area.width - width) * this.elapsedSec / this.durationSec,
      y: area.y + area.height * 0.7 - height / 2,
      width, height,
    };
  }

  deliver(item: TrashItem, ctx: LevelContext): 'accepted' | 'rejected' {
    if (item.type.bin === 'recycle') return 'accepted';
    ctx.showMessage(EVENT_TEXT.rejected);
    return 'rejected';
  }
}
