import type { LevelDef } from '../data/levels';
import type { LevelResult } from '../gameplay/ScoreSystem';
import { BIN_TEXT, RESULT_TEXT, SHARE_TEXT, vi } from '../i18n/vi';
import { BIN_COLORS, UI, mix } from '../render/palette';
import { drawTrashSprite } from '../render/sprites';

export interface ShareCardEnvironment {
  createCanvas(): HTMLCanvasElement;
  canShare?: (data: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
  downloadLink(url: string, filename: string): void;
  deferCleanup(callback: () => void): void;
}

function browserEnvironment(): ShareCardEnvironment {
  return {
    createCanvas: () => document.createElement('canvas'),
    ...(navigator.canShare ? { canShare: navigator.canShare.bind(navigator) } : {}),
    ...(navigator.share ? { share: navigator.share.bind(navigator) } : {}),
    createObjectURL: blob => URL.createObjectURL(blob),
    revokeObjectURL: url => URL.revokeObjectURL(url),
    downloadLink: (url, filename) => {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.append(anchor);
      try { anchor.click(); }
      finally { anchor.remove(); }
    },
    deferCleanup: callback => { globalThis.setTimeout(callback, 1000); },
  };
}

const SIZE = 1080;
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export class ShareCard {
  constructor(
    private readonly level: LevelDef,
    private readonly result: LevelResult,
    private readonly pledges: readonly string[],
    private readonly env: ShareCardEnvironment = browserEnvironment(),
  ) {}

  canvas(): HTMLCanvasElement {
    const canvas = this.env.createCanvas();
    canvas.width = SIZE;
    canvas.height = SIZE;
    const g = canvas.getContext('2d');
    if (!g) throw new Error(SHARE_TEXT.failed);
    const background = g.createLinearGradient(0, 0, 0, SIZE);
    background.addColorStop(0, UI.backdropTop);
    background.addColorStop(1, UI.letterbox);
    g.fillStyle = background;
    g.fillRect(0, 0, SIZE, SIZE);
    g.fillStyle = mix(this.level.palette.accent, UI.backdropTop, 0.7);
    g.beginPath(); g.roundRect(48, 48, 984, 984, 40); g.fill();
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = UI.textOnDark;
    g.font = `700 64px ${FONT}`;
    g.fillText(vi.appTitle, SIZE / 2, 120);
    g.font = `500 36px ${FONT}`;
    const names = this.wrap(g, this.level.name, 860);
    names.forEach((line, index) => g.fillText(line, SIZE / 2, 198 + index * 44));
    g.fillStyle = UI.warning;
    g.font = `700 104px ${FONT}`;
    g.fillText(RESULT_TEXT.stars(this.result.stars), SIZE / 2, 322);
    g.fillStyle = UI.textOnDark;
    g.font = `700 80px ${FONT}`;
    g.fillText(RESULT_TEXT.score(this.result.score), SIZE / 2, 430);
    g.font = `500 36px ${FONT}`;
    g.fillText(RESULT_TEXT.cleanliness(this.result.cleanliness), SIZE / 2, 502);
    if (this.pledges.length) this.drawPledges(g);
    else this.drawBins(g);
    g.fillStyle = UI.highlight;
    g.textAlign = 'center';
    g.font = `500 30px ${FONT}`;
    g.fillText(SHARE_TEXT.brandLink, SIZE / 2, 982);
    return canvas;
  }

  async share(): Promise<'shared' | 'downloaded' | 'cancelled'> {
    const blob = await this.png();
    const file = new File([blob], this.filename, { type: 'image/png' });
    const data: ShareData = { files: [file], title: vi.appTitle, text: SHARE_TEXT.message(this.level.name), url: SHARE_TEXT.url };
    try {
      if (this.env.share && this.env.canShare?.({ files: [file] })) {
        await this.env.share(data);
        return 'shared';
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return 'cancelled';
    }
    this.save(blob);
    return 'downloaded';
  }

  async download(): Promise<void> { this.save(await this.png()); }

  private get filename(): string { return `rac-oi-ve-nha-${this.level.id}.png`; }

  private png(): Promise<Blob> {
    return new Promise((resolve, reject) => this.canvas().toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error(SHARE_TEXT.failed));
    }, 'image/png'));
  }

  private save(blob: Blob): void {
    const url = this.env.createObjectURL(blob);
    try { this.env.downloadLink(url, this.filename); }
    finally { this.env.deferCleanup(() => this.env.revokeObjectURL(url)); }
  }

  private drawPledges(g: CanvasRenderingContext2D): void {
    g.font = `700 34px ${FONT}`;
    g.fillStyle = UI.highlight;
    g.fillText(SHARE_TEXT.pledgeHeading, SIZE / 2, 574);
    g.font = `400 32px ${FONT}`;
    g.textAlign = 'left';
    g.fillStyle = UI.textOnDark;
    let y = 632;
    for (const pledge of this.pledges.slice(0, 3)) {
      const lines = this.wrap(g, pledge, 820);
      for (const line of lines) {
        g.fillText(line, 130, y);
        y += 38;
      }
      y += 16;
    }
  }

  private drawBins(g: CanvasRenderingContext2D): void {
    for (const [index, id] of (['recycle', 'food', 'other'] as const).entries()) {
      const x = 146 + index * 286;
      g.fillStyle = BIN_COLORS[id];
      g.beginPath(); g.roundRect(x, 704, 214, 174, 22); g.fill();
      g.fillStyle = UI.textOnDark;
      g.font = `700 36px ${FONT}`;
      g.fillText(BIN_TEXT[id].icon, x + 107, 752);
      g.font = `700 28px ${FONT}`;
      g.fillText(BIN_TEXT[id].name, x + 107, 832);
    }
    drawTrashSprite(g, 'chai-nhua-pet', 254, 638, 102);
    drawTrashSprite(g, 'vo-chuoi', 540, 634, 112);
    drawTrashSprite(g, 'coc-tra-da', 826, 638, 102);
  }

  private wrap(g: CanvasRenderingContext2D, text: string, width: number): string[] {
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (line && g.measureText(next).width > width) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }
}
