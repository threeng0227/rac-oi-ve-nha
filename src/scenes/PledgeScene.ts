import type { PointerSample, Scene } from '../core/Game';
import type { Rect } from '../core/Layout';
import type { Viewport } from '../core/Viewport';
import { PLEDGES } from '../data/pledges';
import { NAV_TEXT, PLEDGE_UI_TEXT } from '../i18n/vi';
import { ButtonInput, CanvasUI, type CanvasButton } from '../ui/CanvasUI';

export interface PledgeActions {
  confirm: (ids: readonly string[]) => void;
  back: () => void;
}

const PAGE_SIZE = 4;

export class PledgeScene implements Scene {
  private readonly ui: CanvasUI;
  private readonly input = new ButtonInput();
  private readonly selection = new Set<string>();
  private page = 0;

  constructor(viewport: Viewport, selected: readonly string[], private readonly actions: PledgeActions) {
    this.ui = new CanvasUI(viewport);
    for (const id of selected) {
      if (this.selection.size < 3 && PLEDGES.some(pledge => pledge.id === id)) this.selection.add(id);
    }
  }

  get selectedIds(): readonly string[] { return [...this.selection]; }
  update(_dt: number): void {}

  buttonBounds(action: string): Rect | null {
    return this.buttons().find(button => button.id === action)?.bounds ?? null;
  }

  render(g: CanvasRenderingContext2D): void {
    this.ui.frame(g, PLEDGE_UI_TEXT.title);
    const content = this.ui.content;
    this.ui.text(g, PLEDGE_UI_TEXT.choose(this.selection.size), content.x, content.y);
    this.ui.text(g, NAV_TEXT.page(this.page + 1, 2), content.x + content.width, content.y, 14, 'right');
    for (const button of this.buttons()) this.ui.button(g, button);
  }

  onPointer(sample: PointerSample): void {
    const action = this.input.handle(sample, this.buttons());
    if (!action) return;
    if (action === 'back') this.actions.back();
    else if (action === 'next') this.page++;
    else if (action === 'previous') this.page--;
    else if (action === 'confirm') this.actions.confirm(this.selectedIds);
    else if (this.selection.has(action)) this.selection.delete(action);
    else if (this.selection.size < 3) this.selection.add(action);
  }

  cancelPointers(): void { this.input.clear(); }
  exit(): void { this.input.exit(); }

  private buttons(): CanvasButton[] {
    const content = this.ui.content;
    const gap = this.ui.layout.bag.height * 0.3;
    const top = content.y + this.ui.fontSize() * 2;
    const height = (content.height - this.ui.fontSize() * 2 - gap * (PAGE_SIZE - 1)) / PAGE_SIZE;
    const buttons: CanvasButton[] = PLEDGES.slice(this.page * PAGE_SIZE, (this.page + 1) * PAGE_SIZE)
      .map((pledge, index) => {
        const selected = this.selection.has(pledge.id);
        return {
          id: pledge.id,
          label: selected ? PLEDGE_UI_TEXT.selected(pledge.text) : pledge.text,
          primary: selected,
          enabled: selected || this.selection.size < 3,
          bounds: { x: content.x, y: top + index * (height + gap), width: content.width, height },
        };
      });
    buttons.push({ id: 'back', label: NAV_TEXT.back, bounds: this.ui.footer(0, 4) });
    if (this.page > 0) buttons.push({ id: 'previous', label: NAV_TEXT.previous, bounds: this.ui.footer(1, 4) });
    if ((this.page + 1) * PAGE_SIZE < PLEDGES.length) buttons.push({ id: 'next', label: NAV_TEXT.next, bounds: this.ui.footer(2, 4) });
    buttons.push({ id: 'confirm', label: PLEDGE_UI_TEXT.confirm, primary: true,
      enabled: this.selection.size > 0, bounds: this.ui.footer(3, 4) });
    return buttons;
  }
}
