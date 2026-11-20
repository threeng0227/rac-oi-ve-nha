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

function glassBottle(g: CanvasRenderingContext2D): void {
  g.fillStyle = BIN_COLORS.food;
  g.beginPath();
  g.moveTo(-0.09, -0.45); g.lineTo(0.09, -0.45); g.lineTo(0.09, -0.18);
  g.quadraticCurveTo(0.26, -0.12, 0.26, 0.04); g.lineTo(0.26, 0.4);
  g.lineTo(-0.26, 0.4); g.lineTo(-0.26, 0.04); g.quadraticCurveTo(-0.26, -0.12, -0.09, -0.18);
  g.closePath(); g.fill(); g.stroke();
  g.fillStyle = PAPER; g.fillRect(-0.23, 0.02, 0.46, 0.22);
  g.fillStyle = METAL; g.fillRect(-0.11, -0.47, 0.22, 0.06);
  g.strokeStyle = PLASTIC; g.beginPath(); g.moveTo(-0.16, -0.01); g.lineTo(-0.16, 0.32); g.stroke();
}

function carton(g: CanvasRenderingContext2D): void {
  g.fillStyle = mix(UI.warning, INK, 0.25);
  g.beginPath(); g.moveTo(-0.4, -0.2); g.lineTo(0.02, -0.37); g.lineTo(0.4, -0.19);
  g.lineTo(0.37, 0.31); g.lineTo(-0.03, 0.45); g.lineTo(-0.4, 0.22); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = mix(UI.warning, PAPER, 0.2);
  g.beginPath(); g.moveTo(-0.4, -0.2); g.lineTo(-0.2, -0.43); g.lineTo(0.02, -0.37);
  g.lineTo(0.21, -0.44); g.lineTo(0.4, -0.19); g.lineTo(-0.03, 0.02); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-0.03, 0.02); g.lineTo(-0.03, 0.45); g.stroke();
}

function leftovers(g: CanvasRenderingContext2D): void {
  g.fillStyle = PAPER; g.beginPath(); g.ellipse(0, 0.13, 0.46, 0.27, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = UI.warning; g.beginPath(); g.ellipse(-0.12, 0.02, 0.19, 0.17, -0.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = BIN_COLORS.food; g.beginPath(); g.ellipse(0.18, 0.01, 0.13, 0.19, 0.7, 0, Math.PI * 2); g.fill();
  g.fillStyle = UI.danger; g.beginPath(); g.ellipse(-0.01, 0.19, 0.14, 0.07, 0, 0, Math.PI * 2); g.fill();
}

function leaf(g: CanvasRenderingContext2D): void {
  g.fillStyle = BIN_COLORS.food;
  g.beginPath(); g.moveTo(-0.4, 0.38); g.bezierCurveTo(-0.48, -0.2, -0.16, -0.48, 0.42, -0.42);
  g.bezierCurveTo(0.48, 0.18, 0.12, 0.47, -0.4, 0.38); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = UI.highlight;
  g.beginPath(); g.moveTo(-0.4, 0.4); g.lineTo(0.36, -0.35);
  g.moveTo(-0.15, 0.15); g.lineTo(-0.28, -0.12); g.moveTo(0.1, -0.1); g.lineTo(0.3, 0.12); g.stroke();
}

function bagasse(g: CanvasRenderingContext2D): void {
  g.rotate(-0.28);
  g.fillStyle = mix(UI.warning, PAPER, 0.45);
  for (const [x, y] of [[-0.18, -0.32], [0.01, -0.4], [0.19, -0.25]]) {
    g.beginPath(); g.roundRect(x! - 0.07, y!, 0.14, 0.7, 0.04); g.fill(); g.stroke();
  }
  g.strokeStyle = mix(UI.warning, INK, 0.4);
  g.beginPath(); g.moveTo(-0.24, 0.02); g.lineTo(0.25, -0.12); g.moveTo(-0.24, 0.16); g.lineTo(0.25, 0.03); g.stroke();
}

function seeds(g: CanvasRenderingContext2D): void {
  g.fillStyle = PAPER;
  g.beginPath(); g.ellipse(-0.15, -0.03, 0.16, 0.37, -0.35, 0, Math.PI * 2);
  g.ellipse(0.19, 0.1, 0.13, 0.29, 0.35, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = INK;
  g.beginPath(); g.ellipse(-0.15, -0.03, 0.1, 0.3, -0.35, 0, Math.PI * 2);
  g.ellipse(0.19, 0.1, 0.075, 0.23, 0.35, 0, Math.PI * 2); g.fill();
}

function foamBox(g: CanvasRenderingContext2D): void {
  g.fillStyle = PAPER;
  g.beginPath(); g.roundRect(-0.44, -0.35, 0.88, 0.27, 0.08); g.fill(); g.stroke();
  g.fillStyle = mix(PAPER, METAL, 0.25);
  g.beginPath(); g.roundRect(-0.44, -0.04, 0.88, 0.4, 0.08); g.fill(); g.stroke();
  g.strokeStyle = METAL; g.beginPath(); g.moveTo(-0.32, 0.07); g.lineTo(0.32, 0.07); g.stroke();
}

function diaper(g: CanvasRenderingContext2D): void {
  g.fillStyle = PAPER;
  g.beginPath(); g.moveTo(-0.42, -0.28); g.quadraticCurveTo(0, -0.4, 0.42, -0.28);
  g.lineTo(0.26, 0.28); g.quadraticCurveTo(0, 0.48, -0.26, 0.28); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = PLASTIC; g.fillRect(-0.42, -0.22, 0.2, 0.14); g.fillRect(0.22, -0.22, 0.2, 0.14);
  g.strokeStyle = PLASTIC; g.beginPath(); g.moveTo(-0.13, -0.12); g.quadraticCurveTo(0, 0.1, 0.13, -0.12); g.stroke();
}

function net(g: CanvasRenderingContext2D): void {
  g.fillStyle = mix(BIN_COLORS.food, PLASTIC, 0.4);
  g.beginPath(); g.moveTo(-0.44, -0.3); g.lineTo(0.3, -0.42); g.lineTo(0.44, 0.28); g.lineTo(-0.25, 0.43); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 0.025;
  g.beginPath();
  for (let i = 0; i < 4; i++) {
    const x = -0.3 + i * 0.18;
    g.moveTo(x, -0.3); g.lineTo(x + 0.1, 0.3);
    const y = -0.23 + i * 0.17;
    g.moveTo(-0.3, y); g.lineTo(0.3, y - 0.08);
  }
  g.stroke();
}

function straw(g: CanvasRenderingContext2D): void {
  g.strokeStyle = UI.danger; g.lineWidth = 0.13;
  g.beginPath(); g.moveTo(-0.2, 0.43); g.lineTo(0.02, -0.24); g.lineTo(0.36, -0.4); g.stroke();
  g.strokeStyle = PAPER; g.lineWidth = 0.025;
  g.beginPath(); g.moveTo(-0.23, 0.4); g.lineTo(-0.01, -0.25); g.lineTo(0.32, -0.4); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 0.025;
  g.beginPath(); g.moveTo(-0.05, -0.14); g.lineTo(0.07, -0.1); g.moveTo(-0.03, -0.21); g.lineTo(0.09, -0.17); g.stroke();
}

function mask(g: CanvasRenderingContext2D): void {
  g.strokeStyle = PAPER; g.lineWidth = 0.045;
  g.beginPath(); g.ellipse(-0.36, 0, 0.12, 0.23, 0, 0, Math.PI * 2); g.ellipse(0.36, 0, 0.12, 0.23, 0, 0, Math.PI * 2); g.stroke();
  g.fillStyle = PLASTIC; g.strokeStyle = INK;
  g.beginPath(); g.roundRect(-0.33, -0.28, 0.66, 0.56, 0.06); g.fill(); g.stroke();
  g.strokeStyle = PAPER; g.lineWidth = 0.03;
  g.beginPath();
  for (const y of [-0.12, 0, 0.12]) { g.moveTo(-0.23, y); g.lineTo(0.23, y); }
  g.stroke();
}

function skewer(g: CanvasRenderingContext2D): void {
  g.rotate(0.38);
  g.fillStyle = UI.warning;
  g.beginPath(); g.moveTo(-0.07, -0.25); g.lineTo(0, -0.49); g.lineTo(0.07, -0.25);
  g.lineTo(0.07, 0.45); g.lineTo(-0.07, 0.45); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = mix(UI.warning, INK, 0.3);
  g.beginPath(); g.moveTo(-0.03, -0.17); g.lineTo(-0.03, 0.36); g.stroke();
}

function poncho(g: CanvasRenderingContext2D): void {
  g.fillStyle = mix(PLASTIC, PAPER, 0.3);
  g.beginPath(); g.moveTo(-0.16, -0.25); g.lineTo(-0.4, -0.05); g.lineTo(-0.34, 0.16);
  g.lineTo(-0.23, 0.08); g.lineTo(-0.27, 0.42); g.lineTo(0.27, 0.42);
  g.lineTo(0.23, 0.08); g.lineTo(0.34, 0.16); g.lineTo(0.4, -0.05); g.lineTo(0.16, -0.25); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.ellipse(0, -0.29, 0.18, 0.19, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.strokeStyle = BIN_COLORS.recycle; g.beginPath(); g.moveTo(0, -0.02); g.lineTo(0, 0.32); g.stroke();
}

function battery(g: CanvasRenderingContext2D): void {
  g.fillStyle = METAL; g.fillRect(-0.09, -0.46, 0.18, 0.09);
  g.fillStyle = INK;
  g.beginPath(); g.roundRect(-0.24, -0.38, 0.48, 0.79, 0.06); g.fill(); g.stroke();
  g.fillStyle = UI.warning; g.fillRect(-0.23, -0.3, 0.46, 0.27);
  g.strokeStyle = INK; g.lineWidth = 0.04;
  g.beginPath(); g.moveTo(-0.08, -0.17); g.lineTo(0.08, -0.17); g.moveTo(0, -0.25); g.lineTo(0, -0.09); g.stroke();
  g.strokeStyle = PAPER; g.beginPath(); g.moveTo(-0.08, 0.19); g.lineTo(0.08, 0.19); g.stroke();
}

function lightstick(g: CanvasRenderingContext2D): void {
  g.fillStyle = UI.danger;
  g.beginPath(); g.ellipse(0, -0.23, 0.29, 0.25, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = UI.highlight;
  g.beginPath(); g.ellipse(0, -0.23, 0.17, 0.14, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = INK;
  g.beginPath(); g.roundRect(-0.09, -0.01, 0.18, 0.43, 0.04); g.fill(); g.stroke();
  g.fillStyle = UI.warning; g.fillRect(-0.05, 0.1, 0.1, 0.07);
}

function bulb(g: CanvasRenderingContext2D): void {
  g.fillStyle = PAPER;
  g.beginPath(); g.ellipse(0, -0.18, 0.31, 0.28, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.strokeStyle = PLASTIC; g.lineWidth = 0.055;
  g.beginPath(); g.moveTo(-0.15, -0.29); g.lineTo(0.15, -0.29); g.lineTo(-0.15, -0.18); g.lineTo(0.15, -0.18); g.lineTo(-0.1, -0.07); g.stroke();
  g.fillStyle = METAL; g.strokeStyle = INK;
  g.beginPath(); g.roundRect(-0.16, 0.07, 0.32, 0.31, 0.04); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-0.15, 0.17); g.lineTo(0.15, 0.17); g.moveTo(-0.15, 0.27); g.lineTo(0.15, 0.27); g.stroke();
}

function milkTea(g: CanvasRenderingContext2D): void {
  cup(g);
  g.fillStyle = INK;
  g.beginPath();
  for (const [x, y] of [[-0.12, 0.25], [0.02, 0.31], [0.12, 0.21]]) g.ellipse(x!, y!, 0.04, 0.04, 0, 0, Math.PI * 2);
  g.fill();
}

function beerCup(g: CanvasRenderingContext2D): void {
  g.strokeStyle = PAPER; g.lineWidth = 0.08;
  g.beginPath(); g.ellipse(0.31, 0.08, 0.13, 0.2, 0, 0, Math.PI * 2); g.stroke();
  g.fillStyle = UI.warning; g.strokeStyle = INK;
  g.beginPath(); g.roundRect(-0.28, -0.26, 0.54, 0.65, 0.04); g.fill(); g.stroke();
  g.fillStyle = PAPER;
  g.beginPath(); g.ellipse(-0.14, -0.25, 0.16, 0.12, 0, 0, Math.PI * 2); g.ellipse(0.09, -0.25, 0.17, 0.13, 0, 0, Math.PI * 2); g.fill();
}

function paperLantern(g: CanvasRenderingContext2D): void {
  g.fillStyle = UI.danger;
  g.beginPath(); g.moveTo(-0.43, 0.02); g.lineTo(0, 0.4); g.lineTo(0.43, 0.02); g.lineTo(0, 0.14); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = UI.warning;
  g.beginPath(); g.moveTo(0, -0.45); g.quadraticCurveTo(0.26, -0.14, 0, -0.06); g.quadraticCurveTo(-0.18, -0.16, 0, -0.45); g.fill();
  g.fillStyle = PAPER; g.fillRect(-0.09, -0.04, 0.18, 0.17);
}

function banner(g: CanvasRenderingContext2D): void {
  g.fillStyle = UI.danger;
  g.beginPath(); g.moveTo(-0.46, -0.32); g.lineTo(0.46, -0.22); g.lineTo(0.35, 0.01);
  g.lineTo(0.44, 0.29); g.lineTo(-0.45, 0.2); g.lineTo(-0.33, -0.03); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = PAPER; g.lineWidth = 0.05;
  g.beginPath(); g.moveTo(-0.24, -0.15); g.lineTo(0.2, -0.1); g.moveTo(-0.22, -0.01); g.lineTo(0.24, 0.04); g.stroke();
}

function cornHusk(g: CanvasRenderingContext2D): void {
  g.fillStyle = UI.warning;
  g.beginPath(); g.ellipse(0, -0.07, 0.18, 0.37, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = BIN_COLORS.food;
  g.beginPath(); g.moveTo(-0.31, -0.03); g.quadraticCurveTo(-0.09, 0.1, 0.02, 0.45); g.quadraticCurveTo(-0.32, 0.34, -0.31, -0.03); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(0.31, -0.19); g.quadraticCurveTo(0.26, 0.29, 0.02, 0.45); g.quadraticCurveTo(-0.02, 0.08, 0.31, -0.19); g.fill(); g.stroke();
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

const SPRITES: Record<SpriteId, DrawSprite> = {
  'chai-nhua-pet': bottle,
  'lon-nhom': can,
  'chai-thuy-tinh': glassBottle,
  'giay-bao': newspaper,
  'bia-carton': carton,
  'vo-chuoi': banana,
  'vo-trai-cay': fruitPeel,
  'thuc-an-thua': leftovers,
  'la-chuoi': leaf,
  'ba-mia': bagasse,
  'vo-hat-dua': seeds,
  'tui-nilon': bag,
  'hop-xop': foamBox,
  'coc-nhua': cup,
  'tan-thuoc-la': cigarette,
  'ta-bim': diaper,
  'luoi-danh-ca': net,
  'ong-hut-nhua': straw,
  'khau-trang-y-te': mask,
  'que-xien-tre': skewer,
  'ao-mua-giay': poncho,
  'pin-aa': battery,
  lightstick,
  'bong-den': bulb,
  'coc-tra-da': cup,
  'coc-tra-sua': milkTea,
  'coc-bia': beerCup,
  'hoa-dang': paperLantern,
  'bang-ron': banner,
  'vo-bap': cornHusk,
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
