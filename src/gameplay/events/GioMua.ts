import { EVENT_TEXT } from '../../i18n/vi';
import type { GameEvent, LevelContext } from '../EventSystem';

export class GioMua implements GameEvent {
  readonly id = 'GIO_MUA';
  readonly label = EVENT_TEXT.GIO_MUA;
  readonly durationSec = 12;
  elapsedSec = 0;
  private readonly existing = new Set<number>();
  private readonly incoming = new Map<number, { baseY: number; phase: number }>();

  onStart(ctx: LevelContext): void {
    for (const item of ctx.items) this.existing.add(item.id);
  }
  onEnd(): void {}

  onUpdate(ctx: LevelContext, dt: number): void {
    this.elapsedSec += dt;
    const area = ctx.layout.spawnArea;
    for (const item of [...ctx.items]) {
      if (item.state !== 'ground' || this.existing.has(item.id)) continue;
      let flight = this.incoming.get(item.id);
      if (!flight) {
        flight = { baseY: item.y, phase: ctx.rng.range(0, Math.PI * 2) };
        this.incoming.set(item.id, flight);
      }
      item.x += area.width * 0.28 * dt;
      const radius = item.size / 2;
      const amplitude = Math.min(area.height * 0.06, ctx.layout.bins.height * 0.18);
      item.y = Math.max(area.y + radius, Math.min(area.y + area.height - radius,
        flight.baseY + Math.sin(this.elapsedSec * 2.5 + flight.phase) * amplitude));
      if (item.x - radius > ctx.layout.width) {
        ctx.removeTrash(item, 'wind');
        this.incoming.delete(item.id);
      }
    }
  }
}
