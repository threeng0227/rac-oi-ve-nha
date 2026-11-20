import type { Layout } from '../core/Layout';
import type { Viewport } from '../core/Viewport';
import type { LevelSession } from '../gameplay/LevelSession';
import type { TrashItem } from '../gameplay/TrashItem';
import { BIN_TEXT, vi } from '../i18n/vi';
import { BIN_COLORS, UI, mix, withAlpha } from './palette';
import { drawTrashSprite } from './sprites';

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export class LevelView {
  constructor(private readonly viewport: Viewport) {}

  render(g: CanvasRenderingContext2D, session: LevelSession): void {
    g.save();
    g.textBaseline = 'middle';
    this.backdrop(g, session);
    this.hud(g, session);
    for (const item of session.items) {
      if (item.state === 'ground') this.item(g, item, item.x, item.y);
    }
    this.bag(g, session);
    this.bins(g, session);
    for (const item of session.items) {
      if (item.state === 'flying' || item.state === 'dragging') this.item(g, item, item.x, item.y);
    }
    if (session.tutorial !== 'done') this.tutorial(g, session);
    if (session.feedback) {
      const color = session.feedback.kind === 'error' ? UI.danger : UI.highlight;
      this.message(g, session.feedback.text, session.layout,
        session.layout.bag.y - this.fontSize(14) * 2.1, color);
    }
    g.restore();
  }

  private fontSize(cssPixels: number): number {
    return Math.max(24, cssPixels / this.viewport.scale);
  }

  private backdrop(g: CanvasRenderingContext2D, session: LevelSession): void {
    const l = session.layout;
    const p = session.level.palette;
    const sky = g.createLinearGradient(0, l.playfield.y, 0, l.bag.y);
    sky.addColorStop(0, mix(p.sky, UI.textOnDark, 0.35));
    sky.addColorStop(1, mix(p.ground, UI.textOnDark, 0.15));
    g.fillStyle = sky;
    g.fillRect(0, l.playfield.y, l.width, l.playfield.height);
    const streetY = l.playfield.y + l.playfield.height * 0.43;
    g.fillStyle = mix(p.ground, UI.letterbox, 0.15);
    g.fillRect(0, streetY, l.width, l.bag.y - streetY);
    const houses = [0.2, 0.29, 0.24];
    for (const [index, heightRatio] of houses.entries()) {
      const x = l.width * (0.05 + index * 0.33);
      const width = l.width * 0.24;
      const height = l.playfield.height * heightRatio;
      const top = streetY - height;
      g.fillStyle = mix(p.accent, p.ground, 0.35 + index * 0.1);
      g.fillRect(x, top, width, height);
      g.fillStyle = mix(p.ground, UI.letterbox, 0.4);
      g.beginPath();
      g.moveTo(x - width * 0.06, top);
      g.lineTo(x + width / 2, top - height * 0.16);
      g.lineTo(x + width * 1.06, top);
      g.closePath();
      g.fill();
      g.fillStyle = withAlpha(UI.letterbox, 0.28);
      for (const column of [0.17, 0.61]) {
        g.fillRect(x + width * column, top + height * 0.19, width * 0.22, height * 0.24);
      }
      g.fillRect(x + width * 0.38, top + height * 0.58, width * 0.25, height * 0.42);
    }
    g.strokeStyle = withAlpha(UI.textOnDark, 0.08);
    g.lineWidth = 2;
    for (const fraction of [0.65, 0.85]) {
      const y = l.playfield.y + l.playfield.height * fraction;
      g.beginPath(); g.moveTo(0, y); g.lineTo(l.width, y); g.stroke();
    }
  }

  private hud(g: CanvasRenderingContext2D, session: LevelSession): void {
    const l = session.layout;
    const font = this.fontSize(14);
    g.fillStyle = UI.letterbox;
    g.fillRect(0, l.hud.y, l.width, l.hud.height);
    g.fillStyle = UI.textOnDark;
    g.textAlign = 'left';
    g.font = `700 ${Math.max(32, font)}px ${FONT}`;
    g.fillText(session.level.name, l.spawnArea.x, l.hud.y + l.hud.height * 0.35);
    g.textAlign = 'right';
    g.fillStyle = UI.warning;
    g.fillText(vi.seconds(session.remainingSec), l.width - l.spawnArea.x, l.hud.y + l.hud.height * 0.35);
    if (session.tutorial === 'done') {
      g.textAlign = 'left';
      g.font = `400 ${font}px ${FONT}`;
      g.fillStyle = withAlpha(UI.textOnDark, 0.76);
      g.fillText(vi.score(session.score.score), l.spawnArea.x, l.hud.y + l.hud.height * 0.68);
      g.textAlign = 'right';
      g.fillText(vi.combo(session.score.combo, session.score.multiplier), l.width - l.spawnArea.x, l.hud.y + l.hud.height * 0.68);
      g.fillStyle = UI.hairline;
      g.fillRect(l.spawnArea.x, l.hud.y + l.hud.height * 0.9, l.spawnArea.width, l.hud.height * 0.06);
      g.fillStyle = session.score.pollution >= 70 ? UI.danger : UI.warning;
      g.fillRect(l.spawnArea.x, l.hud.y + l.hud.height * 0.9, l.spawnArea.width * session.score.pollution / 100, l.hud.height * 0.06);
    }
  }

  private bag(g: CanvasRenderingContext2D, session: LevelSession): void {
    const l = session.layout;
    g.fillStyle = UI.backdropTop;
    g.fillRect(0, l.bag.y, l.width, l.bag.height);
    for (const [index, item] of session.bag.slots.entries()) {
      const b = session.slotBounds(index);
      const inset = l.bag.height * 0.07;
      g.fillStyle = mix(UI.backdropTop, UI.textOnDark, item ? 0.14 : 0.05);
      g.strokeStyle = item ? withAlpha(UI.textOnDark, 0.5) : UI.hairline;
      g.lineWidth = 2;
      g.beginPath();
      g.roundRect(b.x + inset, b.y + inset, b.width - inset * 2, b.height - inset * 2, 10);
      g.fill(); g.stroke();
      if (item?.state === 'bag') {
        const center = session.slotCenter(index);
        const size = Math.min(l.bagSlotSize * 0.7, l.bag.height * 0.76);
        drawTrashSprite(g, item.sprite, center.x, center.y, size);
      }
    }
  }

  private bins(g: CanvasRenderingContext2D, session: LevelSession): void {
    const l = session.layout;
    for (const bin of session.bins) {
      const b = bin.bounds(l);
      const guided = session.tutorial === 'sort' && bin.id === 'food';
      const feedback = session.feedback?.binId === bin.id ? session.feedback : null;
      const activeColor = feedback?.kind === 'error' ? UI.danger : UI.highlight;
      g.fillStyle = mix(BIN_COLORS[bin.id], UI.letterbox, guided ? 0.1 : 0.32);
      g.fillRect(b.x, b.y, b.width, b.height);
      g.strokeStyle = guided ? UI.warning : feedback ? activeColor : UI.hairline;
      g.lineWidth = guided || feedback ? 5 : 2;
      g.strokeRect(b.x + 3, b.y + 3, b.width - 6, b.height - 6);
      const motion = feedback && !session.reducedMotion ? Math.sin(session.animationSec * 20) * 3 : 0;
      g.textAlign = 'center';
      g.fillStyle = UI.textOnDark;
      g.font = `700 ${Math.max(42, this.fontSize(20))}px ${FONT}`;
      g.fillText(BIN_TEXT[bin.id].icon, b.x + b.width / 2 + motion, b.y + b.height * 0.33);
      g.font = `700 ${Math.max(28, this.fontSize(14))}px ${FONT}`;
      g.fillText(BIN_TEXT[bin.id].name, b.x + b.width / 2, b.y + b.height * 0.75);
    }
  }

  private item(g: CanvasRenderingContext2D, item: TrashItem, x: number, y: number): void {
    const size = Math.max(item.size, 40 / this.viewport.scale);
    g.fillStyle = withAlpha(UI.letterbox, 0.22);
    g.beginPath();
    g.ellipse(x, y + size * 0.38, size * 0.44, size * 0.11, 0, 0, Math.PI * 2);
    g.fill();
    drawTrashSprite(g, item.sprite, x, y, size);
  }

  private tutorial(g: CanvasRenderingContext2D, session: LevelSession): void {
    const l = session.layout;
    const picking = session.tutorial === 'pick';
    const centerY = l.playfield.y + Math.max(this.fontSize(14) * 2.3, l.playfield.height * 0.12);
    this.message(g, picking ? vi.tutorialPick : vi.tutorialSort, l, centerY, UI.warning);
    if (picking) {
      const item = session.items.find(item => item.state === 'ground');
      if (!item) return;
      const pulse = session.reducedMotion ? 1 : 1 + Math.sin(session.animationSec * 4) * 0.08;
      g.strokeStyle = withAlpha(UI.warning, 0.85);
      g.lineWidth = 3;
      g.beginPath();
      g.arc(item.x, item.y, 26 / this.viewport.scale * pulse, 0, Math.PI * 2);
      g.stroke();
      this.hand(g, item.x + 12 / this.viewport.scale, item.y + 28 / this.viewport.scale);
      return;
    }
    const from = session.slotCenter(0);
    const to = { x: l.binX(1) + l.binWidth / 2, y: l.bins.y + l.bins.height * 0.42 };
    g.strokeStyle = withAlpha(UI.warning, 0.7);
    g.lineWidth = 3;
    g.setLineDash([8, 8]);
    g.beginPath(); g.moveTo(from.x, from.y); g.lineTo(to.x, to.y); g.stroke();
    g.setLineDash([]);
    const progress = session.reducedMotion ? 0 : (session.animationSec % 1.8) / 1.8;
    this.hand(g, from.x + (to.x - from.x) * progress, from.y + (to.y - from.y) * progress);
  }

  private hand(g: CanvasRenderingContext2D, x: number, y: number): void {
    g.save();
    g.translate(x, y);
    const size = 36 / this.viewport.scale;
    g.scale(size, size);
    g.fillStyle = withAlpha(UI.textOnDark, 0.8);
    g.strokeStyle = withAlpha(UI.letterbox, 0.75);
    g.lineWidth = 0.04;
    g.beginPath();
    g.roundRect(-0.08, -0.55, 0.18, 0.65, 0.09);
    g.roundRect(-0.25, -0.05, 0.57, 0.49, 0.14);
    g.fill(); g.stroke();
    g.restore();
  }

  private message(g: CanvasRenderingContext2D, text: string, l: Layout, centerY: number, color: string): void {
    const font = this.fontSize(14);
    g.font = `600 ${font}px ${FONT}`;
    const width = Math.min(l.spawnArea.width, 1100);
    const lines = this.wrap(g, text, width - font * 1.4);
    const height = (lines.length + 0.9) * font * 1.2;
    g.fillStyle = withAlpha(UI.letterbox, 0.94);
    g.strokeStyle = withAlpha(color, 0.65);
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(l.centerX - width / 2, centerY - height / 2, width, height, 14);
    g.fill(); g.stroke();
    g.textAlign = 'center';
    g.fillStyle = UI.textOnDark;
    lines.forEach((line, index) => g.fillText(line, l.centerX, centerY + (index - (lines.length - 1) / 2) * font * 1.2));
  }

  private wrap(g: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (line && g.measureText(next).width > maxWidth) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }

}
