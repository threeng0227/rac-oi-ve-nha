import type { PointerSample, Scene } from '../core/Game';
import type { Rect } from '../core/Layout';
import type { Viewport } from '../core/Viewport';
import { NAV_TEXT, vi } from '../i18n/vi';
import { UI } from '../render/palette';
import { ButtonInput, CanvasUI, type CanvasButton } from '../ui/CanvasUI';

export interface MenuActions {
  play: () => void;
  handbook: () => void;
  toggleMute: () => void;
  isMuted: () => boolean;
}

export class MenuScene implements Scene {
  private readonly ui: CanvasUI;
  private readonly input = new ButtonInput();

  constructor(viewport: Viewport, private readonly actions: MenuActions) { this.ui = new CanvasUI(viewport); }
  update(_dt: number): void {}

  buttonBounds(action: string): Rect | null { return this.buttons().find(button => button.id === action)?.bounds ?? null; }

  render(g: CanvasRenderingContext2D): void {
    const l = this.ui.layout;
    this.ui.frame(g, '');
    const titleY = l.hud.height + l.playfield.height * 0.18;
    this.ui.text(g, vi.appTitle, l.centerX, titleY, 26, 'center', true, UI.highlight);
    this.ui.text(g, vi.appSubtitle, l.centerX, titleY + this.ui.fontSize(26) * 1.45, 16, 'center');
    for (const button of this.buttons()) this.ui.button(g, button);
  }

  onPointer(sample: PointerSample): void {
    const action = this.input.handle(sample, this.buttons());
    if (action === 'play') this.actions.play();
    if (action === 'handbook') this.actions.handbook();
    if (action === 'mute') this.actions.toggleMute();
  }

  cancelPointers(): void { this.input.clear(); }
  exit(): void { this.input.exit(); }

  private buttons(): CanvasButton[] {
    const l = this.ui.layout;
    const width = Math.min(l.spawnArea.width, l.binWidth * 1.3);
    const height = this.ui.buttonHeight;
    const gap = l.bag.height * 0.25;
    const firstY = Math.min(this.ui.content.y + this.ui.content.height * 0.42, l.height - (height + gap) * 3);
    return [
      { id: 'play', label: NAV_TEXT.play, primary: true },
      { id: 'handbook', label: NAV_TEXT.handbook },
      { id: 'mute', label: this.actions.isMuted() ? NAV_TEXT.soundOff : NAV_TEXT.soundOn },
    ].map((button, index) => ({ ...button,
      bounds: { x: l.centerX - width / 2, y: firstY + index * (height + gap), width, height } }));
  }
}
