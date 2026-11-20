import type { Layout } from '../core/Layout';
import type { BackdropId } from '../data/levels';
import { UI, desaturate, getLevelPalette, mix, withAlpha } from './palette';

interface Colors {
  sky: string;
  ground: string;
  accent: string;
  water: string;
  ink: string;
  paper: string;
  green: string;
  yellow: string;
}

type Backdrop = (g: CanvasRenderingContext2D, colors: Colors) => void;

function mountain(g: CanvasRenderingContext2D, x: number, bottom: number, width: number, height: number, color: string): void {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(x, bottom);
  g.lineTo(x + width * 0.17, bottom - height * 0.38);
  g.lineTo(x + width * 0.3, bottom - height * 0.85);
  g.lineTo(x + width * 0.48, bottom - height);
  g.lineTo(x + width * 0.67, bottom - height * 0.72);
  g.lineTo(x + width, bottom);
  g.closePath();
  g.fill();
}

function houses(g: CanvasRenderingContext2D, p: Colors, baseline = 0.45): void {
  for (const [index, height] of [0.2, 0.29, 0.24].entries()) {
    const x = 0.05 + index * 0.33;
    const width = 0.24;
    const top = baseline - height;
    g.fillStyle = mix(p.accent, p.ground, 0.3 + index * 0.1);
    g.fillRect(x, top, width, height);
    g.fillStyle = p.ink;
    g.beginPath();
    g.moveTo(x - 0.015, top);
    g.lineTo(x + width / 2, top - 0.035);
    g.lineTo(x + width + 0.015, top);
    g.closePath(); g.fill();
    g.fillStyle = withAlpha(p.ink, 0.55);
    g.fillRect(x + 0.04, top + height * 0.2, 0.05, height * 0.23);
    g.fillRect(x + 0.15, top + height * 0.2, 0.05, height * 0.23);
    g.fillRect(x + 0.09, top + height * 0.6, 0.06, height * 0.4);
  }
}

function ripples(g: CanvasRenderingContext2D, p: Colors, start: number): void {
  g.strokeStyle = withAlpha(p.paper, 0.2);
  g.lineWidth = 0.002;
  g.beginPath();
  for (let row = 0; row < 4; row++) {
    const y = start + row * (1 - start) / 5;
    for (let column = 0; column < 4; column++) {
      const x = column * 0.27 + row % 2 * 0.04;
      g.moveTo(x, y); g.lineTo(x + 0.12, y);
    }
  }
  g.stroke();
}

function bridge(g: CanvasRenderingContext2D, p: Colors, y: number): void {
  g.strokeStyle = p.ink;
  g.lineWidth = 0.025;
  g.beginPath();
  g.moveTo(0.07, y + 0.13);
  g.quadraticCurveTo(0.5, y - 0.15, 0.93, y + 0.13);
  g.stroke();
  g.lineWidth = 0.008;
  g.beginPath();
  g.moveTo(0.12, y + 0.05); g.lineTo(0.12, y + 0.25);
  g.moveTo(0.88, y + 0.05); g.lineTo(0.88, y + 0.25);
  g.stroke();
}

function pine(g: CanvasRenderingContext2D, x: number, y: number, height: number, color: string): void {
  g.fillStyle = color;
  g.fillRect(x - 0.006, y - height * 0.1, 0.012, height * 0.1);
  g.beginPath();
  g.moveTo(x, y - height);
  g.lineTo(x + height * 0.23, y - height * 0.35);
  g.lineTo(x + height * 0.13, y - height * 0.35);
  g.lineTo(x + height * 0.32, y - height * 0.1);
  g.lineTo(x - height * 0.32, y - height * 0.1);
  g.lineTo(x - height * 0.13, y - height * 0.35);
  g.lineTo(x - height * 0.23, y - height * 0.35);
  g.closePath(); g.fill();
}

function boat(g: CanvasRenderingContext2D, p: Colors, x: number, y: number, width: number): void {
  g.fillStyle = p.ink;
  g.beginPath();
  g.moveTo(x - width / 2, y);
  g.quadraticCurveTo(x, y + width * 0.6, x + width / 2, y);
  g.closePath(); g.fill();
  g.fillStyle = p.accent;
  g.fillRect(x - width * 0.3, y - width * 0.3, width * 0.6, width * 0.3);
  g.strokeStyle = p.paper;
  g.lineWidth = 0.004;
  g.beginPath(); g.moveTo(x, y - width * 0.33); g.lineTo(x, y - width * 0.8); g.stroke();
}

const BACKDROPS: Record<BackdropId, Backdrop> = {
  'ha-noi': (g, p) => {
    g.fillStyle = p.ground; g.fillRect(0, 0.45, 1, 0.55);
    houses(g, p);
    g.strokeStyle = withAlpha(p.paper, 0.1);
    g.lineWidth = 0.002;
    g.beginPath(); g.moveTo(0, 0.68); g.lineTo(1, 0.68); g.moveTo(0, 0.87); g.lineTo(1, 0.87); g.stroke();
  },
  'ha-long': (g, p) => {
    g.fillStyle = p.water; g.fillRect(0, 0.4, 1, 0.6);
    mountain(g, 0.02, 0.49, 0.3, 0.35, p.ground);
    mountain(g, 0.37, 0.46, 0.22, 0.4, mix(p.ground, p.ink, 0.12));
    mountain(g, 0.65, 0.5, 0.31, 0.29, mix(p.ground, p.sky, 0.2));
    ripples(g, p, 0.57);
  },
  'hoi-an': (g, p) => {
    g.fillStyle = p.water; g.fillRect(0, 0.5, 1, 0.5);
    houses(g, p, 0.48);
    bridge(g, p, 0.5);
    g.strokeStyle = p.ink; g.lineWidth = 0.003;
    g.beginPath(); g.moveTo(0.03, 0.05); g.quadraticCurveTo(0.5, 0.18, 0.97, 0.05); g.stroke();
    for (const x of [0.16, 0.39, 0.63, 0.85]) {
      g.fillStyle = p.accent;
      g.beginPath(); g.ellipse(x, 0.14, 0.025, 0.055, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = p.yellow; g.beginPath(); g.moveTo(x, 0.19); g.lineTo(x, 0.22); g.stroke();
    }
    ripples(g, p, 0.72);
  },
  'da-lat': (g, p) => {
    mountain(g, -0.1, 0.52, 0.7, 0.35, mix(p.ground, p.sky, 0.4));
    mountain(g, 0.4, 0.52, 0.8, 0.42, p.ground);
    g.fillStyle = p.water; g.fillRect(0, 0.5, 1, 0.5);
    for (const [index, x] of [0.1, 0.28, 0.77, 0.91].entries()) pine(g, x, 0.57, 0.24 + index % 2 * 0.1, p.ink);
    ripples(g, p, 0.66);
  },
  concert: (g, p) => {
    g.fillStyle = p.ink; g.fillRect(0.18, 0.16, 0.64, 0.5);
    g.strokeStyle = p.accent; g.lineWidth = 0.012;
    g.strokeRect(0.16, 0.14, 0.68, 0.53);
    g.fillStyle = withAlpha(p.accent, 0.22);
    g.beginPath(); g.moveTo(0.23, 0.18); g.lineTo(0.48, 0.62); g.lineTo(0.05, 0.62); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(0.77, 0.18); g.lineTo(0.52, 0.62); g.lineTo(0.95, 0.62); g.closePath(); g.fill();
    g.fillStyle = p.ground; g.fillRect(0, 0.65, 1, 0.35);
    g.fillStyle = p.ink;
    g.beginPath();
    for (let i = 0; i < 13; i++) g.ellipse(i / 12, 0.76 + i % 2 * 0.04, 0.035, 0.065, 0, 0, Math.PI * 2);
    g.fill();
  },
  'nhieu-loc': (g, p) => {
    g.fillStyle = p.ground; g.fillRect(0, 0.38, 1, 0.62);
    g.fillStyle = p.water; g.fillRect(0.17, 0.38, 0.66, 0.62);
    bridge(g, p, 0.35);
    g.fillStyle = p.ink;
    for (const x of [0.04, 0.88]) {
      g.fillRect(x, 0.15, 0.08, 0.3);
      g.fillRect(x + 0.015, 0.1, 0.05, 0.05);
    }
    g.fillStyle = p.green;
    g.beginPath();
    for (const [x, y] of [[0.27, 0.72], [0.7, 0.9], [0.36, 0.94]]) g.ellipse(x!, y!, 0.045, 0.025, 0, 0, Math.PI * 2);
    g.fill();
    ripples(g, p, 0.58);
  },
  'cai-rang': (g, p) => {
    g.fillStyle = p.water; g.fillRect(0, 0.32, 1, 0.68);
    g.fillStyle = p.ground; g.fillRect(0, 0.27, 1, 0.08);
    boat(g, p, 0.24, 0.55, 0.3);
    boat(g, p, 0.72, 0.72, 0.34);
    g.fillStyle = p.yellow;
    g.beginPath();
    for (const [x, y] of [[0.19, 0.47], [0.25, 0.45], [0.3, 0.49], [0.69, 0.62], [0.76, 0.64]]) g.ellipse(x!, y!, 0.022, 0.03, 0, 0, Math.PI * 2);
    g.fill();
    ripples(g, p, 0.8);
  },
  'giao-thua': (g, p) => {
    g.fillStyle = p.ground; g.fillRect(0, 0.55, 1, 0.45);
    g.fillStyle = p.ink;
    for (const [x, height] of [[0.05, 0.26], [0.19, 0.4], [0.73, 0.34], [0.87, 0.28]]) g.fillRect(x!, 0.55 - height!, 0.09, height!);
    g.strokeStyle = p.yellow; g.lineWidth = 0.004;
    for (const [x, y] of [[0.36, 0.2], [0.65, 0.16]]) {
      g.beginPath();
      for (let spoke = 0; spoke < 8; spoke++) {
        const angle = spoke * Math.PI / 4;
        g.moveTo(x! + Math.cos(angle) * 0.035, y! + Math.sin(angle) * 0.06);
        g.lineTo(x! + Math.cos(angle) * 0.07, y! + Math.sin(angle) * 0.12);
      }
      g.stroke();
    }
    g.fillStyle = p.accent; g.fillRect(0.45, 0.48, 0.1, 0.02);
    g.fillStyle = p.ink; g.fillRect(0.49, 0.38, 0.02, 0.1);
  },
  'sa-pa': (g, p) => {
    mountain(g, -0.12, 0.65, 0.75, 0.52, mix(p.ground, p.sky, 0.35));
    mountain(g, 0.4, 0.65, 0.75, 0.6, p.ink);
    for (let row = 0; row < 5; row++) {
      const y = 0.48 + row * 0.105;
      g.fillStyle = mix(p.ground, p.yellow, row % 2 * 0.25);
      g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(0.24, y - 0.14, 0.72, y + 0.15, 1, y - 0.02);
      g.lineTo(1, 1); g.lineTo(0, 1); g.closePath(); g.fill();
      g.strokeStyle = withAlpha(p.paper, 0.3); g.lineWidth = 0.006;
      g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(0.24, y - 0.14, 0.72, y + 0.15, 1, y - 0.02); g.stroke();
    }
    g.fillStyle = withAlpha(p.paper, 0.15); g.fillRect(0, 0.22, 1, 0.09);
  },
  'con-dao': (g, p) => {
    g.fillStyle = p.water; g.fillRect(0, 0.32, 1, 0.68);
    mountain(g, 0.63, 0.4, 0.38, 0.26, p.green);
    g.fillStyle = p.ground;
    g.beginPath(); g.moveTo(0, 0.45); g.quadraticCurveTo(0.35, 0.55, 0.53, 1); g.lineTo(0, 1); g.closePath(); g.fill();
    g.strokeStyle = p.accent; g.lineWidth = 0.012;
    g.beginPath();
    for (const x of [0.68, 0.78, 0.9]) {
      g.moveTo(x, 0.97); g.lineTo(x, 0.77); g.moveTo(x, 0.87); g.lineTo(x - 0.04, 0.81); g.moveTo(x, 0.91); g.lineTo(x + 0.035, 0.84);
    }
    g.stroke();
    g.fillStyle = p.green;
    g.beginPath(); g.ellipse(0.19, 0.72, 0.035, 0.045, -0.4, 0, Math.PI * 2); g.ellipse(0.225, 0.69, 0.014, 0.018, 0, 0, Math.PI * 2); g.fill();
    ripples(g, p, 0.54);
  },
};

/** Bối cảnh chuyển từ độ bão hoà thấp sang đủ màu trong phần thưởng cuối màn. */
export function drawBackdrop(g: CanvasRenderingContext2D, layout: Layout, id: BackdropId, revealProgress: number): void {
  const progress = Math.min(1, Math.max(0, revealProgress));
  const source = getLevelPalette(id);
  const color = (value: string): string => desaturate(value, 0.7 * (1 - progress));
  const p: Colors = {
    sky: color(mix(source.sky, UI.textOnDark, 0.15 + progress * 0.25)),
    ground: color(source.ground), accent: color(source.accent),
    water: color(source.water ?? source.ground),
    ink: color(mix(source.ground, UI.letterbox, 0.65)), paper: color(UI.textOnDark),
    green: color(UI.highlight), yellow: color(UI.warning),
  };
  g.save();
  g.beginPath(); g.rect(0, layout.playfield.y, layout.width, layout.playfield.height); g.clip();
  g.translate(0, layout.playfield.y);
  g.scale(layout.width, layout.playfield.height);
  const sky = g.createLinearGradient(0, 0, 0, 1);
  sky.addColorStop(0, p.sky); sky.addColorStop(1, mix(p.sky, p.ground, 0.35));
  g.fillStyle = sky; g.fillRect(0, 0, 1, 1);
  BACKDROPS[id](g, p);
  if (progress > 0) {
    g.globalAlpha = progress;
    g.strokeStyle = p.paper; g.lineWidth = 0.003;
    g.beginPath();
    for (const [index, x] of [0.31, 0.53, 0.69].entries()) {
      const y = 0.08 + index % 2 * 0.045;
      const cx = x + progress * 0.05;
      g.moveTo(cx - 0.012, y); g.quadraticCurveTo(cx - 0.006, y - 0.018, cx, y);
      g.quadraticCurveTo(cx + 0.006, y - 0.018, cx + 0.012, y);
    }
    g.stroke();
    if (source.water) {
      g.fillStyle = p.paper;
      g.beginPath(); g.ellipse(0.61 + progress * 0.04, 0.71 - Math.sin(progress * Math.PI) * 0.08, 0.018, 0.012, -0.3, 0, Math.PI * 2); g.fill();
    }
  }
  g.restore();
}
