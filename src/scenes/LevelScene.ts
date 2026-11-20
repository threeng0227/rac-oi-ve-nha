import type { Game, PointerSample, Scene } from '../core/Game';
import type { Viewport } from '../core/Viewport';
import { LevelSession, type SessionOptions } from '../gameplay/LevelSession';
import { LevelView } from '../render/LevelView';
import { ResultScene } from './ResultScene';

/** Điều phối vòng đời, tương tác và phần vẽ của màn Hà Nội. */
export class LevelScene implements Scene {
  readonly session: LevelSession;
  private readonly view: LevelView;
  private game: Game | undefined;

  constructor(private readonly viewport: Viewport, private readonly options: SessionOptions = {}) {
    this.session = new LevelSession(viewport, options);
    this.view = new LevelView(viewport);
  }

  enter(game?: Game): void { this.game = game; }
  update(dt: number): void {
    this.session.update(dt);
    if (this.session.result && this.game) {
      const game = this.game;
      game.scenes.change(new ResultScene(this.viewport, this.session.level, this.session.result, {
        replay: () => game.scenes.change(new LevelScene(this.viewport, {
          ...this.options, skipTutorial: true, seed: Date.now(),
        }), game),
      }), game);
    }
  }
  render(g: CanvasRenderingContext2D): void { this.view.render(g, this.session); }

  onPointer(sample: PointerSample): void {
    this.session.onPointer(sample);
  }

  cancelPointers(): void {
    this.session.cancelPointers();
  }

  exit(): void {
    this.cancelPointers();
    this.session.exit();
    this.game = undefined;
  }
}
