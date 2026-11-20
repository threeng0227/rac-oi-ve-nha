import type { PointerSample } from '../core/Game';
import { computeLayout, type Rect } from '../core/Layout';
import type { Viewport } from '../core/Viewport';
import { UI, mix, withAlpha } from '../render/palette';

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export interface CanvasButton {
  readonly id: string;
  readonly label: string;
  readonly bounds: Rect;
  readonly enabled?: boolean;
  readonly primary?: boolean;
}

/** Một thao tác phải bắt đầu và kết thúc trên cùng nút bằng cùng pointer. */
export class ButtonInput {
  private pressed: { id: string; pointer: number } | null = null;
  private active = true;

  handle(sample: PointerSample, buttons: readonly CanvasButton[]): string | null {
    if (!this.active) return null;
    const hit = buttons.find(button => button.enabled !== false && contains(button.bounds, sample.x, sample.y));
    if (sample.phase === 'cancel' && this.pressed?.pointer === sample.id) this.clear();
    if (sample.phase === 'down' && !this.pressed && hit) this.pressed = { id: hit.id, pointer: sample.id };
    if (sample.phase !== 'up' || this.pressed?.pointer !== sample.id) return null;
    const pressed = this.pressed.id;
    this.clear();
    return hit?.id === pressed ? pressed : null;
  }

  clear(): void { this.pressed = null; }
  exit(): void { this.clear(); this.active = false; }
}

export function contains(rect: Rect, x: number, y: number): boolean {
  return x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
}

export class CanvasUI {
  constructor(readonly viewport: Viewport) {}
  get layout() { return computeLayout(this.viewport); }
  fontSize(cssPixels = 14): number { return Math.max(24, cssPixels / this.viewport.scale); }
  get buttonHeight(): number { return Math.max(this.layout.bag.height, 44 / this.viewport.scale); }

  get content(): Rect {
    const l = this.layout;
    const gap = l.bag.height * 0.25;
    const bottom = this.footer(0, 1).y - gap;
    return { x: l.spawnArea.x, y: l.hud.y + l.hud.height + gap,
      width: l.spawnArea.width, height: bottom - l.hud.height - gap };
  }

  footer(index: number, count: number): Rect {
    const l = this.layout;
    const gap = l.spawnArea.width * 0.02;
    const width = (l.spawnArea.width - gap * (count - 1)) / count;
    const height = this.buttonHeight;
    return { x: l.spawnArea.x + index * (width + gap), y: l.height - height - l.bag.height * 0.25, width, height };
  }

  frame(g: CanvasRenderingContext2D, title: string): void {
    const l = this.layout;
    const gradient = g.createLinearGradient(0, 0, 0, l.height);
    gradient.addColorStop(0, UI.backdropTop);
    gradient.addColorStop(1, UI.backdropBottom);
    g.fillStyle = gradient;
    g.fillRect(0, 0, l.width, l.height);
    this.text(g, title, l.spawnArea.x, l.hud.y + l.hud.height / 2, 18, 'left', true);
  }

  text(g: CanvasRenderingContext2D, text: string, x: number, y: number, cssSize = 14,
    align: CanvasTextAlign = 'left', bold = false, color: string = UI.textOnDark): void {
    g.fillStyle = color;
    g.font = `${bold ? 700 : 400} ${this.fontSize(cssSize)}px ${FONT}`;
    g.textAlign = align;
    g.textBaseline = 'middle';
    g.fillText(text, x, y);
  }

  paragraph(g: CanvasRenderingContext2D, text: string, x: number, y: number, width: number,
    cssSize = 14, color: string = UI.textOnDark, align: CanvasTextAlign = 'left', bold = false): number {
    const font = this.fontSize(cssSize);
    g.font = `${bold ? 700 : 400} ${font}px ${FONT}`;
    const lines = this.wrap(g, text, width);
    lines.forEach((line, index) => this.text(g, line, x, y + index * font * 1.25, cssSize, align, bold, color));
    return lines.length * font * 1.25;
  }

  private wrap(g: CanvasRenderingContext2D, text: string, width: number): string[] {
    const lines: string[] = [];
    for (const paragraph of text.split('\n')) {
      let line = '';
      for (const word of paragraph.split(' ')) {
        const next = line ? `${line} ${word}` : word;
        if (line && g.measureText(next).width > width) { lines.push(line); line = word; }
        else line = next;
      }
      lines.push(line);
    }
    return lines;
  }

  button(g: CanvasRenderingContext2D, button: CanvasButton): void {
    const b = button.bounds;
    const enabled = button.enabled !== false;
    g.fillStyle = button.primary && enabled ? UI.highlight : mix(UI.backdropTop, UI.textOnDark, enabled ? 0.12 : 0.04);
    g.strokeStyle = enabled ? withAlpha(UI.textOnDark, 0.45) : UI.hairline;
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(b.x, b.y, b.width, b.height, b.height * 0.16);
    g.fill(); g.stroke();
    const font = this.fontSize();
    const color = button.primary && enabled ? UI.letterbox : withAlpha(UI.textOnDark, enabled ? 1 : 0.55);
    const padding = font * 0.6;
    g.font = `700 ${font}px ${FONT}`;
    const lines = this.wrap(g, button.label, b.width - padding * 2);
    const firstY = b.y + b.height / 2 - (lines.length - 1) * font * 0.625;
    lines.forEach((line, index) => this.text(g, line, b.x + b.width / 2, firstY + index * font * 1.25,
      14, 'center', true, color));
  }
}
