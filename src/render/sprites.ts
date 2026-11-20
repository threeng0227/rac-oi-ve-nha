import type { SpriteId } from '../data/trashTypes';
import { BIN_COLORS, UI, mix } from './palette';

type DrawSprite = (g: CanvasRenderingContext2D) => void;

const PAPER = UI.textOnDark;
const INK = UI.letterbox;
const PLASTIC = mix(BIN_COLORS.recycle, PAPER, 0.55);
const METAL = mix(BIN_COLORS.other, PAPER, 0.65);

function bottle(g: CanvasRenderingContext2D): void {
  g.fillStyle = PLASTIC;
  g.beginPath();
  g.moveTo(-0.12, -0.38);
  g.lineTo(0.12, -0.38);
  g.lineTo(0.12, -0.23);
  g.quadraticCurveTo(0.29, -0.14, 0.29, 0.02);
  g.lineTo(0.29, 0.37);
  g.quadraticCurveTo(0.29, 0.45, 0.2, 0.45);
  g.lineTo(-0.2, 0.45);
  g.quadraticCurveTo(-0.29, 0.45, -0.29, 0.37);
  g.lineTo(-0.29, 0.02);
  g.quadraticCurveTo(-0.29, -0.14, -0.12, -0.23);
  g.closePath();
  g.fill();
  g.stroke();

  g.fillStyle = BIN_COLORS.recycle;
  g.fillRect(-0.15, -0.46, 0.3, 0.1);
  g.fillRect(-0.28, 0.06, 0.56, 0.19);
  g.strokeStyle = PAPER;
  g.beginPath();
  g.moveTo(-0.17, -0.04);
  g.lineTo(-0.17, -0.13);
  g.stroke();
}

function can(g: CanvasRenderingContext2D): void {
  g.fillStyle = UI.danger;
  g.beginPath();
  g.roundRect(-0.3, -0.36, 0.6, 0.78, 0.1);
  g.fill();
  g.stroke();

  g.fillStyle = METAL;
  g.beginPath();
  g.ellipse(0, -0.34, 0.3, 0.1, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();

  g.beginPath();
  g.ellipse(0.04, -0.35, 0.09, 0.035, -0.3, 0, Math.PI * 2);
  g.stroke();

  g.fillStyle = PAPER;
  g.beginPath();
  g.moveTo(-0.18, -0.04);
  g.lineTo(0.19, 0.08);
  g.lineTo(0.19, 0.22);
  g.lineTo(-0.18, 0.1);
  g.closePath();
  g.fill();
}

function newspaper(g: CanvasRenderingContext2D): void {
  g.fillStyle = PAPER;
  g.beginPath();
  g.moveTo(-0.43, -0.34);
  g.lineTo(0.29, -0.34);
  g.lineTo(0.43, -0.18);
  g.lineTo(0.43, 0.35);
  g.lineTo(-0.43, 0.35);
  g.closePath();
  g.fill();
  g.stroke();

  g.fillStyle = METAL;
  g.beginPath();
  g.moveTo(0.29, -0.34);
  g.lineTo(0.29, -0.17);
  g.lineTo(0.43, -0.17);
  g.closePath();
  g.fill();

  g.fillStyle = BIN_COLORS.other;
  g.fillRect(-0.31, -0.2, 0.45, 0.08);
  g.fillRect(-0.31, -0.02, 0.24, 0.22);
  g.beginPath();
  for (const y of [0, 0.1, 0.2]) {
    g.moveTo(0.03, y);
    g.lineTo(0.3, y);
  }
  g.stroke();
}

function banana(g: CanvasRenderingContext2D): void {
  g.fillStyle = UI.warning;
  g.beginPath();
  g.moveTo(-0.38, -0.31);
  g.bezierCurveTo(-0.35, 0.32, 0.14, 0.5, 0.45, 0.1);
  g.bezierCurveTo(0.16, 0.2, -0.04, -0.05, -0.09, -0.37);
  g.lineTo(-0.18, -0.4);
  g.quadraticCurveTo(-0.2, -0.11, -0.38, -0.31);
  g.closePath();
  g.fill();
  g.stroke();

  g.strokeStyle = mix(UI.warning, INK, 0.42);
  g.beginPath();
  g.moveTo(-0.19, -0.28);
  g.quadraticCurveTo(-0.1, 0.25, 0.3, 0.19);
  g.stroke();

  g.strokeStyle = INK;
  g.lineWidth = 0.08;
  g.beginPath();
  g.moveTo(-0.19, -0.41);
  g.lineTo(-0.13, -0.42);
  g.moveTo(0.4, 0.13);
  g.lineTo(0.46, 0.08);
  g.stroke();
}

function bag(g: CanvasRenderingContext2D): void {
  g.fillStyle = mix(PLASTIC, PAPER, 0.25);
  g.beginPath();
  g.moveTo(-0.35, -0.4);
  g.lineTo(-0.18, -0.4);
  g.lineTo(-0.14, -0.14);
  g.lineTo(0.14, -0.14);
  g.lineTo(0.18, -0.4);
  g.lineTo(0.35, -0.4);
  g.lineTo(0.43, 0.38);
  g.quadraticCurveTo(0, 0.49, -0.43, 0.38);
  g.closePath();
  g.fill();
  g.stroke();

  g.strokeStyle = BIN_COLORS.recycle;
  g.beginPath();
  g.moveTo(-0.19, -0.02);
  g.lineTo(-0.22, 0.28);
  g.moveTo(0.15, 0.05);
  g.lineTo(0.21, 0.32);
  g.stroke();

  g.fillStyle = mix(PLASTIC, INK, 0.2);
  g.beginPath();
  g.ellipse(0, 0.14, 0.12, 0.08, 0, 0, Math.PI * 2);
  g.fill();
}

function cigarette(g: CanvasRenderingContext2D): void {
  g.rotate(-0.28);
  g.fillStyle = PAPER;
  g.beginPath();
  g.roundRect(-0.43, -0.12, 0.86, 0.24, 0.04);
  g.fill();
  g.stroke();

  g.fillStyle = UI.warning;
  g.fillRect(-0.42, -0.11, 0.27, 0.22);
  g.fillStyle = BIN_COLORS.other;
  g.fillRect(0.3, -0.12, 0.12, 0.24);
  g.fillStyle = UI.danger;
  g.fillRect(0.3, -0.12, 0.045, 0.24);
}

function fruitPeel(g: CanvasRenderingContext2D): void {
  g.fillStyle = UI.danger;
  g.beginPath();
  g.moveTo(-0.45, -0.15);
  g.quadraticCurveTo(0, 0.58, 0.45, -0.15);
  g.quadraticCurveTo(0, -0.04, -0.45, -0.15);
  g.closePath();
  g.fill();
  g.stroke();

  g.strokeStyle = UI.warning;
  g.lineWidth = 0.1;
  g.beginPath();
  g.moveTo(-0.32, -0.05);
  g.quadraticCurveTo(0, 0.35, 0.32, -0.05);
  g.stroke();

  g.fillStyle = BIN_COLORS.food;
  g.beginPath();
  g.ellipse(0.12, -0.26, 0.18, 0.08, -0.5, 0, Math.PI * 2);
  g.fill();
}

function cup(g: CanvasRenderingContext2D): void {
  g.fillStyle = mix(UI.warning, PAPER, 0.45);
  g.beginPath();
  g.moveTo(-0.32, -0.25);
  g.lineTo(0.32, -0.25);
  g.lineTo(0.22, 0.43);
  g.lineTo(-0.22, 0.43);
  g.closePath();
  g.fill();
  g.stroke();

  g.fillStyle = PAPER;
  g.beginPath();
  g.ellipse(0, -0.25, 0.33, 0.07, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();

  g.strokeStyle = UI.danger;
  g.lineWidth = 0.065;
  g.beginPath();
  g.moveTo(0.07, 0.08);
  g.lineTo(0.17, -0.42);
  g.lineTo(0.32, -0.46);
  g.stroke();

  g.strokeStyle = PAPER;
  g.lineWidth = 0.07;
  g.beginPath();
  g.moveTo(-0.17, -0.07);
  g.lineTo(-0.12, 0.26);
  g.stroke();
}

function fallback(g: CanvasRenderingContext2D): void {
  g.fillStyle = METAL;
  g.beginPath();
  g.moveTo(-0.37, -0.23);
  g.lineTo(-0.05, -0.41);
  g.lineTo(0.33, -0.22);
  g.lineTo(0.42, 0.2);
  g.lineTo(0.05, 0.39);
  g.lineTo(-0.4, 0.23);
  g.closePath();
  g.fill();
  g.stroke();
}

const SPRITES: Partial<Record<SpriteId, DrawSprite>> = {
  'chai-nhua-pet': bottle,
  'lon-nhom': can,
  'giay-bao': newspaper,
  'vo-chuoi': banana,
  'tui-nilon': bag,
  'tan-thuoc-la': cigarette,
  'vo-trai-cay': fruitPeel,
  'coc-nhua': cup,
  'coc-tra-da': cup,
};

/** Sprite paths use a unit square centered at the supplied virtual position. */
export function drawTrashSprite(
  g: CanvasRenderingContext2D,
  sprite: SpriteId,
  x: number,
  y: number,
  size: number,
): void {
  g.save();
  g.translate(x, y);
  g.scale(size, size);
  g.strokeStyle = INK;
  g.lineWidth = 0.035;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  (SPRITES[sprite] ?? fallback)(g);
  g.restore();
}
