import type { PointerSample, Scene } from '../core/Game';
import { computeLayout, type Rect } from '../core/Layout';
import type { Viewport } from '../core/Viewport';
import type { LevelDef } from '../data/levels';
import type { LevelResult } from '../gameplay/ScoreSystem';
import { ResultView, type ResultAction } from '../render/ResultView';

export interface ResultActions {
  replay: () => void;
  map?: () => void;
  share?: () => void;
  download?: () => void;
  pledge?: () => void;
}

/** Kết quả và điều hướng sau màn chơi, dùng chung vòng lặp scene. */
export class ResultScene implements Scene {
  private readonly view: ResultView;
  private pressed: { pointerId: number; action: ResultAction } | null = null;
  private active = true;
  private status = '';

  constructor(
    private readonly viewport: Viewport,
    readonly level: LevelDef,
    readonly result: LevelResult,
    private readonly actions: ResultActions,
  ) {
    this.view = new ResultView(viewport, Object.keys(actions) as ResultAction[]);
  }

  buttonBounds(action: ResultAction): Rect | null {
    return this.view.buttonBounds(computeLayout(this.viewport), action);
  }

  update(_dt: number): void {}

  render(g: CanvasRenderingContext2D): void {
    this.view.render(g, this.level, this.result, this.status);
  }

  onPointer(sample: PointerSample): void {
    if (!this.active) return;
    if (sample.phase === 'cancel') {
      if (this.pressed?.pointerId === sample.id) this.pressed = null;
      return;
    }
    if (sample.phase === 'down') {
      if (this.pressed) return;
      const action = this.view.actionAt(computeLayout(this.viewport), sample.x, sample.y);
      if (action) this.pressed = { pointerId: sample.id, action };
      return;
    }
    if (sample.phase !== 'up' || this.pressed?.pointerId !== sample.id) return;
    const action = this.pressed.action;
    this.pressed = null;
    if (this.view.actionAt(computeLayout(this.viewport), sample.x, sample.y) === action) {
      this.actions[action]?.();
    }
  }

  cancelPointers(): void { this.pressed = null; }
  setStatus(status: string): void { if (this.active) this.status = status; }

  exit(): void {
    this.cancelPointers();
    this.active = false;
  }
}
