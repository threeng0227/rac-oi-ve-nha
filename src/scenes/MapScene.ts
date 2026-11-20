import type { PointerSample, Scene } from '../core/Game';
import type { Rect } from '../core/Layout';
import type { SaveData } from '../core/Storage';
import type { Viewport } from '../core/Viewport';
import { LEVELS, type BackdropId, type LevelDef } from '../data/levels';
import { isLevelUnlocked } from '../gameplay/ProgressStore';
import { NAV_TEXT } from '../i18n/vi';
import { UI, mix, withAlpha } from '../render/palette';
import { ButtonInput, CanvasUI, type CanvasButton } from '../ui/CanvasUI';

interface GeoPoint { readonly lon: number; readonly lat: number }

/** Đường biên và bờ biển giản lược. Các tọa độ là kinh/vĩ độ, không phải pixel. */
export const VIETNAM_COAST: readonly (readonly [number, number])[] = [
  [102.15, 22.4], [102.7, 22.6], [103.35, 22.7], [103.95, 22.6], [104.45, 22.95],
  [105.3, 23.3], [105.8, 23.1], [106.5, 22.85], [106.75, 22.3], [106.7, 21.9],
  [107.4, 21.6], [108.05, 21.55], [108, 21.1], [107.1, 20.8], [106.5, 20.2],
  [106.1, 19.7], [105.8, 19], [106.5, 18], [107.2, 17], [108, 16.2],
  [108.6, 15.5], [109, 14.8], [109.25, 13.8], [109.2, 12.5], [109.1, 11.7],
  [108.4, 10.9], [107.5, 10.45], [106.8, 10.2], [106.7, 9.6], [105.8, 8.75],
  [105, 8.6], [104.8, 9.1], [105, 9.8], [104.45, 10.4], [105, 10.9],
  [105.5, 11.3], [106.2, 11.4], [106.45, 12.1], [107.1, 12.8], [107.5, 13.4],
  [107.3, 14.2], [107.5, 14.8], [107, 15.3], [106.6, 16.2], [105.7, 17],
  [105.2, 17.6], [104.9, 18.3], [104, 19.2], [103.9, 19.6], [104.3, 20.1],
  [104.75, 20.3], [104.4, 20.8], [103.7, 20.5], [103.1, 20.8], [102.8, 21.6],
];

export const LEVEL_COORDINATES: Record<BackdropId, GeoPoint> = {
  'ha-noi': { lon: 105.834, lat: 21.028 },
  'ha-long': { lon: 107.052, lat: 20.95 },
  'hoi-an': { lon: 108.33, lat: 15.88 },
  'da-lat': { lon: 108.44, lat: 11.94 },
  concert: { lon: 106.7, lat: 10.77 },
  'nhieu-loc': { lon: 106.68, lat: 10.79 },
  'cai-rang': { lon: 105.757, lat: 10.01 },
  'giao-thua': { lon: 106.704, lat: 10.775 },
  'sa-pa': { lon: 103.84, lat: 22.34 },
  'con-dao': { lon: 106.61, lat: 8.68 },
};

export const ARCHIPELAGOS = [
  { id: 'hoang-sa', label: NAV_TEXT.hoangSa, lon: 112.2, lat: 16.5 },
  { id: 'truong-sa', label: NAV_TEXT.truongSa, lon: 114.1, lat: 10.8 },
] as const;

export interface MapActions {
  play: (level: LevelDef) => void;
  back: () => void;
  handbook: () => void;
}

const PAGE_SIZE = 4;

export class MapScene implements Scene {
  private readonly ui: CanvasUI;
  private readonly input = new ButtonInput();
  private page = 0;

  constructor(viewport: Viewport, private readonly save: SaveData, private readonly actions: MapActions) {
    this.ui = new CanvasUI(viewport);
  }

  update(_dt: number): void {}
  buttonBounds(action: string): Rect | null { return this.buttons().find(button => button.id === action)?.bounds ?? null; }

  render(g: CanvasRenderingContext2D): void {
    this.ui.frame(g, NAV_TEXT.map);
    this.drawMap(g);
    for (const button of this.buttons()) this.ui.button(g, button);
  }

  onPointer(sample: PointerSample): void {
    const action = this.input.handle(sample, this.buttons());
    if (!action) return;
    if (action === 'back') this.actions.back();
    else if (action === 'handbook') this.actions.handbook();
    else if (action === 'next') this.page++;
    else if (action === 'previous') this.page--;
    else {
      const level = LEVELS.find(level => level.id === action);
      if (level && isLevelUnlocked(this.save, level)) this.actions.play(level);
    }
  }

  cancelPointers(): void { this.input.clear(); }
  exit(): void { this.input.exit(); }

  private panels(): { map: Rect; list: Rect } {
    const content = this.ui.content;
    const gap = this.ui.layout.bag.height * 0.3;
    if (this.ui.layout.isPortrait) {
      const listHeight = this.ui.buttonHeight * PAGE_SIZE + gap * (PAGE_SIZE - 1);
      return {
        map: { ...content, height: content.height - listHeight - gap },
        list: { ...content, y: content.y + content.height - listHeight, height: listHeight },
      };
    }
    const mapWidth = (content.width - gap) * 0.49;
    return {
      map: { ...content, width: mapWidth },
      list: { ...content, x: content.x + mapWidth + gap, width: content.width - mapWidth - gap },
    };
  }

  private buttons(): CanvasButton[] {
    const list = this.panels().list;
    const gap = this.ui.layout.bag.height * 0.3;
    const height = (list.height - gap * (PAGE_SIZE - 1)) / PAGE_SIZE;
    const buttons: CanvasButton[] = LEVELS.slice(this.page * PAGE_SIZE, (this.page + 1) * PAGE_SIZE).map((level, index) => {
      const enabled = isLevelUnlocked(this.save, level);
      const progress = this.save.levels[level.id];
      const savedStars = progress?.stars ?? 0;
      const stars = Number.isInteger(savedStars) ? Math.max(0, Math.min(3, savedStars)) : 0;
      const prefix = enabled ? (stars ? `${'★'.repeat(stars)} ` : '') : `${NAV_TEXT.locked} `;
      return { id: level.id, label: prefix + level.name, enabled,
        bounds: { x: list.x, y: list.y + index * (height + gap), width: list.width, height } };
    });
    buttons.push({ id: 'back', label: NAV_TEXT.back, bounds: this.ui.footer(0, 4) });
    buttons.push({ id: 'handbook', label: NAV_TEXT.handbook, bounds: this.ui.footer(1, 4) });
    if (this.page > 0) buttons.push({ id: 'previous', label: NAV_TEXT.previous, bounds: this.ui.footer(2, 4) });
    if ((this.page + 1) * PAGE_SIZE < LEVELS.length) buttons.push({ id: 'next', label: NAV_TEXT.next, bounds: this.ui.footer(3, 4) });
    return buttons;
  }

  private project(point: GeoPoint): { x: number; y: number } {
    const bounds = this.panels().map;
    const scale = Math.min(bounds.width / 16.2, bounds.height / 17.5);
    return {
      x: bounds.x + (bounds.width - 16.2 * scale) / 2 + (point.lon - 101.4) * scale,
      y: bounds.y + (bounds.height - 17.5 * scale) / 2 + (24 - point.lat) * scale,
    };
  }

  private drawMap(g: CanvasRenderingContext2D): void {
    const bounds = this.panels().map;
    g.fillStyle = withAlpha(UI.letterbox, 0.3);
    g.beginPath(); g.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, this.ui.layout.bag.height * 0.2); g.fill();
    g.fillStyle = mix(UI.highlight, UI.backdropBottom, 0.6);
    g.strokeStyle = withAlpha(UI.textOnDark, 0.5);
    g.lineWidth = 2;
    g.beginPath();
    VIETNAM_COAST.forEach(([lon, lat], index) => {
      const point = this.project({ lon, lat });
      if (index === 0) g.moveTo(point.x, point.y);
      else g.lineTo(point.x, point.y);
    });
    g.closePath(); g.fill(); g.stroke();
    const radius = Math.max(4, this.ui.fontSize() * 0.15);
    for (const level of LEVELS) {
      const point = this.project(LEVEL_COORDINATES[level.id]);
      g.fillStyle = isLevelUnlocked(this.save, level) ? UI.warning : UI.hairline;
      g.strokeStyle = UI.letterbox;
      g.beginPath(); g.arc(point.x, point.y, radius, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    for (const archipelago of ARCHIPELAGOS) {
      const center = this.project(archipelago);
      for (const [dx, dy] of [[-0.25, 0.1], [0.1, -0.2], [0.3, 0.15], [-0.1, 0.35], [0.4, 0.45]]) {
        const point = this.project({ lon: archipelago.lon + dx!, lat: archipelago.lat + dy! });
        g.fillStyle = UI.highlight;
        g.beginPath(); g.arc(point.x, point.y, radius * 0.5, 0, Math.PI * 2); g.fill();
      }
      this.ui.text(g, archipelago.label, center.x, center.y + this.ui.fontSize() * 1.1, 14, 'center', false);
    }
  }
}
