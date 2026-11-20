import { computeLayout, type Layout, type Rect } from '../core/Layout';
import type { Viewport } from '../core/Viewport';
import { FACTS } from '../data/facts';
import type { LevelDef } from '../data/levels';
import type { LevelResult } from '../gameplay/ScoreSystem';
import { HAZARD_TEXT, RESULT_TEXT, vi } from '../i18n/vi';
import { UI, mix, withAlpha } from './palette';

export type ResultAction = 'replay' | 'map' | 'share' | 'pledge';

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const ACTION_LABELS: Record<ResultAction, string> = {
  replay: vi.replay,
  map: RESULT_TEXT.map,
  share: RESULT_TEXT.share,
  pledge: RESULT_TEXT.pledge,
};

export class ResultView {
  constructor(private readonly viewport: Viewport, private readonly actions: readonly ResultAction[]) {}

  buttonBounds(layout: Layout, action: ResultAction): Rect | null {
    const index = this.actions.indexOf(action);
    if (index < 0) return null;
    const card = this.cardBounds(layout);
    const font = this.fontSize;
    const padding = font * 1.2;
    const gap = font * 0.5;
    const columns = Math.min(this.actions.length, 2);
    const rows = Math.ceil(this.actions.length / columns);
    const height = Math.max(font * 2.6, 44 / this.viewport.scale);
    const width = (card.width - padding * 2 - gap * (columns - 1)) / columns;
    return {
      x: card.x + padding + (index % columns) * (width + gap),
      y: card.y + card.height - padding - rows * height - (rows - 1) * gap + Math.floor(index / columns) * (height + gap),
      width,
      height,
    };
  }

  actionAt(layout: Layout, x: number, y: number): ResultAction | undefined {
    return this.actions.find(action => {
      const b = this.buttonBounds(layout, action)!;
      return x >= b.x && x < b.x + b.width && y >= b.y && y < b.y + b.height;
    });
  }

  render(g: CanvasRenderingContext2D, level: LevelDef, result: LevelResult): void {
    const l = computeLayout(this.viewport);
    const card = this.cardBounds(l);
    const font = this.fontSize;
    const color = result.failed ? UI.warning : UI.highlight;
    g.save();
    const sky = g.createLinearGradient(0, l.hud.y, 0, l.height);
    sky.addColorStop(0, mix(level.palette.sky, UI.letterbox, 0.75));
    sky.addColorStop(1, UI.letterbox);
    g.fillStyle = sky;
    g.fillRect(0, l.hud.y, l.width, l.height);
    g.fillStyle = UI.backdropTop;
    g.strokeStyle = withAlpha(color, 0.4);
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(card.x, card.y, card.width, card.height, font * 0.65);
    g.fill();
    g.stroke();
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = UI.textOnDark;
    g.font = `700 ${font * 1.35}px ${FONT}`;
    g.fillText(result.failed ? RESULT_TEXT.failedTitle : RESULT_TEXT.completeTitle,
      l.centerX, card.y + font * 1.5);
    g.font = `400 ${font}px ${FONT}`;
    g.fillStyle = withAlpha(UI.textOnDark, 0.78);
    g.fillText(level.name, l.centerX, card.y + font * 2.9);
    g.fillStyle = UI.warning;
    g.font = `700 ${font * 2.2}px ${FONT}`;
    g.fillText(RESULT_TEXT.stars(result.stars), l.centerX, card.y + font * 5.1);
    g.fillStyle = UI.textOnDark;
    g.font = `700 ${font * 1.8}px ${FONT}`;
    g.fillText(RESULT_TEXT.score(result.score), l.centerX, card.y + font * 7.5);
    g.font = `500 ${font}px ${FONT}`;
    g.fillStyle = withAlpha(UI.textOnDark, 0.83);
    g.fillText(RESULT_TEXT.cleanliness(result.cleanliness), l.centerX, card.y + font * 9.2);
    g.fillText(RESULT_TEXT.correct(result.correctCount), l.centerX, card.y + font * 10.6);

    const fact = FACTS.find(fact => fact.id === level.factOnComplete)?.text ?? '';
    const message = result.failed ? RESULT_TEXT.failedHint : result.hazardRemainingCount ? HAZARD_TEXT.pendingAtEnd : fact;
    this.paragraph(g, message, card, card.y + font * 13.1, font, UI.textOnDark);
    if (!result.failed && result.stars === 0) {
      g.fillStyle = color;
      g.fillText(RESULT_TEXT.retryHint, l.centerX, card.y + card.height - font * 5.5);
    }
    for (const action of this.actions) this.button(g, l, action);
    g.restore();
  }

  private get fontSize(): number { return Math.max(24, 14 / this.viewport.scale); }

  private cardBounds(layout: Layout): Rect {
    const width = Math.min(1000, layout.spawnArea.width);
    const height = Math.min(layout.height * 0.9, this.fontSize * 25);
    return { x: layout.centerX - width / 2, y: (layout.height - height) / 2, width, height };
  }

  private paragraph(g: CanvasRenderingContext2D, text: string, card: Rect, top: number, font: number, color: string): void {
    const maxWidth = card.width - font * 2.4;
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (line && g.measureText(next).width > maxWidth) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    g.fillStyle = color;
    lines.forEach((text, index) => g.fillText(text, card.x + card.width / 2, top + index * font * 1.4));
  }

  private button(g: CanvasRenderingContext2D, layout: Layout, action: ResultAction): void {
    const rect = this.buttonBounds(layout, action)!;
    const primary = action === 'replay';
    g.fillStyle = primary ? UI.highlight : UI.backdropBottom;
    g.beginPath();
    g.roundRect(rect.x, rect.y, rect.width, rect.height, this.fontSize * 0.4);
    g.fill();
    g.fillStyle = primary ? UI.letterbox : UI.textOnDark;
    g.font = `700 ${this.fontSize}px ${FONT}`;
    g.fillText(ACTION_LABELS[action], rect.x + rect.width / 2, rect.y + rect.height / 2);
  }
}
