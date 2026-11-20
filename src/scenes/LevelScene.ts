import type { Game, PointerSample, Scene } from '../core/Game';
import type { Viewport } from '../core/Viewport';
import { LevelSession, type SessionOptions } from '../gameplay/LevelSession';
import { LevelView } from '../render/LevelView';

/** Điều phối vòng đời, tương tác và phần vẽ của màn Hà Nội. */
export class LevelScene implements Scene {
  readonly session: LevelSession;
  private readonly view: LevelView;
  private game: Game | undefined;
  private replayPointer: number | null = null;

  constructor(private readonly viewport: Viewport, private readonly options: SessionOptions = {}) {
    this.session = new LevelSession(viewport, options);
    this.view = new LevelView(viewport);
  }

  enter(game?: Game): void { this.game = game; }
  update(dt: number): void { this.session.update(dt); }
  render(g: CanvasRenderingContext2D): void { this.view.render(g, this.session); }

  onPointer(sample: PointerSample): void {
    if (!this.session.finished) {
      this.session.onPointer(sample);
      return;
    }
    const rect = this.view.replayBounds(this.session.layout);
    const inside = sample.x >= rect.x && sample.x < rect.x + rect.width &&
      sample.y >= rect.y && sample.y < rect.y + rect.height;
    if (sample.phase === 'down' && inside) this.replayPointer = sample.id;
    if (sample.phase === 'cancel') this.replayPointer = null;
    if (sample.phase !== 'up' || sample.id !== this.replayPointer) return;
    this.replayPointer = null;
    if (inside) this.game?.scenes.change(new LevelScene(this.viewport, {
      ...this.options, skipTutorial: true, seed: Date.now(),
    }), this.game);
  }

  cancelPointers(): void {
    this.session.cancelPointers();
    this.replayPointer = null;
  }

  exit(): void {
    this.cancelPointers();
    this.session.exit();
    this.game = undefined;
  }
}
