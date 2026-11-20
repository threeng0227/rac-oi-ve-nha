import type { PointerSample, Scene } from '../core/Game';
import type { Rect } from '../core/Layout';
import type { SaveData } from '../core/Storage';
import type { Viewport } from '../core/Viewport';
import { TRASH_TYPES, getDecomposeLabel, type TrashType } from '../data/trashTypes';
import { BIN_TEXT, NAV_TEXT } from '../i18n/vi';
import { BIN_COLORS, UI, mix, withAlpha } from '../render/palette';
import { drawTrashSprite } from '../render/sprites';
import { ButtonInput, CanvasUI, type CanvasButton } from '../ui/CanvasUI';

export interface HandbookActions {
  back: () => void;
  openSource: (url: string) => void;
}

const PAGE_SIZE = 6;

export class HandbookScene implements Scene {
  private readonly ui: CanvasUI;
  private readonly input = new ButtonInput();
  private page = 0;
  private selected: TrashType | null = null;

  constructor(viewport: Viewport, private readonly save: SaveData, private readonly actions: HandbookActions) {
    this.ui = new CanvasUI(viewport);
  }

  get selectedTypeId(): string | null { return this.selected?.id ?? null; }
  get unlockedCount(): number { return TRASH_TYPES.filter(type => this.save.handbook.includes(type.id)).length; }
  update(_dt: number): void {}
  buttonBounds(action: string): Rect | null { return this.buttons().find(button => button.id === action)?.bounds ?? null; }

  render(g: CanvasRenderingContext2D): void {
    this.ui.frame(g, NAV_TEXT.handbook);
    if (this.selected) this.details(g, this.selected);
    else this.cards(g);
    for (const button of this.buttons().filter(button => !TRASH_TYPES.some(type => type.id === button.id))) this.ui.button(g, button);
  }

  onPointer(sample: PointerSample): void {
    const action = this.input.handle(sample, this.buttons());
    if (!action) return;
    if (action === 'back') this.actions.back();
    else if (action === 'close') this.selected = null;
    else if (action === 'next') this.page++;
    else if (action === 'previous') this.page--;
    else if (action === 'source' && this.selected && this.hasSource(this.selected)) this.actions.openSource(this.selected.source.url);
    else {
      const type = TRASH_TYPES.find(type => type.id === action);
      if (type && this.save.handbook.includes(type.id)) this.selected = type;
    }
  }

  cancelPointers(): void { this.input.clear(); }
  exit(): void { this.input.exit(); }

  private cardBounds(index: number): Rect {
    const content = this.ui.content;
    const font = this.ui.fontSize();
    const gap = this.ui.layout.bag.height * 0.25;
    const width = (content.width - gap * 2) / 3;
    const top = content.y + font * 1.5;
    const height = (content.height - font * 1.5 - gap) / 2;
    return { x: content.x + (index % 3) * (width + gap), y: top + Math.floor(index / 3) * (height + gap), width, height };
  }

  private buttons(): CanvasButton[] {
    if (this.selected) {
      const buttons: CanvasButton[] = [
        { id: 'close', label: NAV_TEXT.close, bounds: this.ui.footer(0, 3) },
        { id: 'back', label: NAV_TEXT.back, bounds: this.ui.footer(2, 3) },
      ];
      if (this.hasSource(this.selected)) buttons.push({ id: 'source', label: NAV_TEXT.source, bounds: this.ui.footer(1, 3) });
      return buttons;
    }
    const buttons: CanvasButton[] = TRASH_TYPES.slice(this.page * PAGE_SIZE, (this.page + 1) * PAGE_SIZE)
      .map((type, index) => ({ id: type.id, label: type.name, enabled: this.save.handbook.includes(type.id), bounds: this.cardBounds(index) }));
    buttons.push({ id: 'back', label: NAV_TEXT.back, bounds: this.ui.footer(0, 3) });
    if (this.page > 0) buttons.push({ id: 'previous', label: NAV_TEXT.previous, bounds: this.ui.footer(1, 3) });
    if ((this.page + 1) * PAGE_SIZE < TRASH_TYPES.length) buttons.push({ id: 'next', label: NAV_TEXT.next, bounds: this.ui.footer(2, 3) });
    return buttons;
  }

  private cards(g: CanvasRenderingContext2D): void {
    const content = this.ui.content;
    this.ui.text(g, NAV_TEXT.collected(this.unlockedCount), content.x, content.y, 14);
    this.ui.text(g, NAV_TEXT.page(this.page + 1, 4), content.x + content.width, content.y, 14, 'right');
    for (const [index, type] of TRASH_TYPES.slice(this.page * PAGE_SIZE, (this.page + 1) * PAGE_SIZE).entries()) {
      const b = this.cardBounds(index);
      const unlocked = this.save.handbook.includes(type.id);
      g.fillStyle = mix(UI.backdropTop, UI.textOnDark, unlocked ? 0.12 : 0.04);
      g.strokeStyle = unlocked ? withAlpha(BIN_COLORS[type.bin], 0.9) : UI.hairline;
      g.lineWidth = 2;
      g.beginPath(); g.roundRect(b.x, b.y, b.width, b.height, this.ui.layout.bag.height * 0.2); g.fill(); g.stroke();
      const size = Math.min(b.width, b.height) * 0.4;
      const x = b.x + b.width / 2;
      const y = b.y + b.height * 0.34;
      if (unlocked) {
        drawTrashSprite(g, type.sprite, x, y, size);
        this.ui.paragraph(g, type.name, x, b.y + b.height * 0.7, b.width - this.ui.fontSize() * 0.6, 14, UI.textOnDark, 'center', true);
      } else {
        g.fillStyle = UI.letterbox;
        g.beginPath(); g.ellipse(x, y, size * 0.4, size * 0.5, -0.1, 0, Math.PI * 2); g.fill();
        this.ui.text(g, NAV_TEXT.unknown, x, y, 20, 'center', true, withAlpha(UI.textOnDark, 0.5));
      }
    }
  }

  private details(g: CanvasRenderingContext2D, type: TrashType): void {
    const content = this.ui.content;
    const font = this.ui.fontSize();
    const spriteSize = Math.min(content.width * 0.16, content.height * 0.17);
    const titleX = content.x + spriteSize * 1.35;
    drawTrashSprite(g, type.sprite, content.x + spriteSize / 2, content.y + spriteSize / 2, spriteSize);
    let y = content.y + font * 0.5;
    const titleHeight = this.ui.paragraph(g, type.name, titleX, y, content.width - spriteSize * 1.35, 18, UI.textOnDark, 'left', true);
    this.ui.text(g, BIN_TEXT[type.bin].name, titleX, y + titleHeight + font * 0.25, 14, 'left', true, BIN_COLORS[type.bin]);
    y += Math.max(spriteSize, titleHeight + font * 1.5) + font;
    y += this.ui.paragraph(g, getDecomposeLabel(type), content.x, y, content.width, 14, UI.warning) + font * 0.5;
    this.ui.text(g, NAV_TEXT.harm, content.x, y, 14, 'left', true);
    y += font * 1.4;
    y += this.ui.paragraph(g, type.harm, content.x, y, content.width) + font * 0.5;
    this.ui.text(g, NAV_TEXT.tip, content.x, y, 14, 'left', true);
    y += font * 1.4;
    this.ui.paragraph(g, type.tip, content.x, y, content.width);
  }

  private hasSource(type: TrashType): boolean {
    if (!type.verified) return false;
    try { return ['https:', 'http:'].includes(new URL(type.source.url).protocol); }
    catch { return false; }
  }
}
