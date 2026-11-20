import type { Rect } from '../core/Layout';
import type { Viewport } from '../core/Viewport';
import type { LevelSession } from '../gameplay/LevelSession';
import { EVENT_TEXT, HAZARD_TEXT } from '../i18n/vi';
import { BIN_COLORS, UI, mix, withAlpha } from './palette';

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export function drawHazardOutline(
  g: CanvasRenderingContext2D, x: number, y: number, size: number, session: LevelSession,
): void {
  const pulse = session.reducedMotion ? 0.85 : 0.65 + Math.sin(session.animationSec * 6) * 0.25;
  g.strokeStyle = withAlpha(UI.warning, pulse);
  g.lineWidth = Math.max(3, size * 0.045);
  g.beginPath();
  g.roundRect(x - size * 0.57, y - size * 0.57, size * 1.14, size * 1.14, size * 0.16);
  g.stroke();
}

/** Hiệu ứng dùng thời gian của session và vị trí xác định, không sinh số ngẫu nhiên khi vẽ. */
export function drawEvents(g: CanvasRenderingContext2D, session: LevelSession, viewport: Viewport): void {
  const l = session.layout;
  const time = session.reducedMotion ? 0 : session.animationSec;
  const font = Math.max(24, 14 / viewport.scale);
  g.save();
  g.beginPath();
  g.rect(0, l.playfield.y, l.width, l.playfield.height);
  g.clip();
  if (session.eventId === 'MUA_BAO') {
    g.fillStyle = withAlpha(UI.letterbox, 0.12);
    g.fillRect(0, l.playfield.y, l.width, l.playfield.height);
    g.strokeStyle = withAlpha(UI.textOnDark, 0.4);
    g.lineWidth = 2;
    g.beginPath();
    for (let index = 0; index < (session.reducedMotion ? 10 : 34); index++) {
      const x = ((index * 0.618 + time * 0.08) % 1) * l.width;
      const y = l.playfield.y + ((index * 0.381 + time * 0.8) % 1) * l.playfield.height;
      g.moveTo(x, y);
      g.lineTo(x - l.width * 0.012, y + l.playfield.height * 0.055);
    }
    g.stroke();
  }
  if (session.eventId === 'GIO_MUA') {
    g.strokeStyle = withAlpha(UI.textOnDark, 0.35);
    g.lineWidth = 3;
    g.beginPath();
    for (let index = 0; index < 8; index++) {
      const x = ((index * 0.37 + time * 0.16) % 1) * l.width;
      const y = l.playfield.y + l.playfield.height * ((index + 1) / 9);
      g.moveTo(x, y);
      g.quadraticCurveTo(x + l.width * 0.05, y - font, x + l.width * 0.12, y);
    }
    g.stroke();
  }
  if (session.eventId === 'GIO_CAO_DIEM') {
    for (let index = 0; index < (session.reducedMotion ? 4 : 14); index++) {
      const x = ((index * 0.618 + time * 0.04) % 1) * l.width;
      const y = l.playfield.y + ((index * 0.381 + time * 0.23) % 1) * l.playfield.height;
      g.fillStyle = index % 2 ? UI.warning : session.level.palette.accent;
      g.fillRect(x, y, font * 0.22, font * 0.45);
    }
  }
  const target = session.eventTarget;
  if (target) {
    drawActor(g, session.eventId, target);
    const event = session.events.active;
    if (event) {
      const labels = event.tapsRemaining === undefined ? [event.label] :
        [event.label, EVENT_TEXT.tapsRemaining(event.tapsRemaining)];
      drawLabel(g, labels, target, l.spawnArea, font);
    }
  }
  if (session.collector.visible) {
    const bounds = session.collector.bounds(l);
    const progress = session.reducedMotion ? 1 : session.collector.entranceProgress;
    const slide = (l.width - bounds.x) * Math.pow(1 - progress, 3);
    drawCollector(g, { ...bounds, x: bounds.x + slide }, font);
  }
  g.restore();
}

function drawActor(g: CanvasRenderingContext2D, eventId: LevelSession['eventId'], b: Rect): void {
  g.save();
  g.translate(b.x, b.y);
  g.scale(b.width, b.height);
  g.lineWidth = 0.025;
  g.strokeStyle = UI.letterbox;
  if (eventId === 'CUU_SINH_VAT') {
    g.fillStyle = BIN_COLORS.food;
    g.beginPath();
    g.ellipse(0.5, 0.5, 0.31, 0.29, 0, 0, Math.PI * 2);
    g.fill(); g.stroke();
    g.fillStyle = UI.highlight;
    g.beginPath();
    g.ellipse(0.87, 0.42, 0.11, 0.12, 0, 0, Math.PI * 2);
    g.ellipse(0.32, 0.18, 0.17, 0.08, -0.5, 0, Math.PI * 2);
    g.ellipse(0.62, 0.83, 0.17, 0.08, 0.5, 0, Math.PI * 2);
    g.fill(); g.stroke();
    g.fillStyle = UI.letterbox;
    g.beginPath(); g.arc(0.91, 0.39, 0.025, 0, Math.PI * 2); g.fill();
    g.strokeStyle = withAlpha(UI.warning, 0.8);
    g.beginPath(); g.moveTo(0.81, 0.48); g.lineTo(0.99, 0.6); g.stroke();
  } else if (eventId === 'BAI_RAC_TU_PHAT') {
    g.fillStyle = mix(BIN_COLORS.other, UI.textOnDark, 0.22);
    g.beginPath();
    g.ellipse(0.28, 0.6, 0.24, 0.25, -0.25, 0, Math.PI * 2);
    g.ellipse(0.7, 0.64, 0.26, 0.23, 0.25, 0, Math.PI * 2);
    g.ellipse(0.51, 0.34, 0.24, 0.3, 0, 0, Math.PI * 2);
    g.fill(); g.stroke();
    g.fillStyle = UI.warning;
    g.fillRect(0.34, 0.22, 0.15, 0.25);
    g.fillStyle = BIN_COLORS.recycle;
    g.fillRect(0.58, 0.51, 0.16, 0.21);
  } else {
    g.fillStyle = UI.letterbox;
    g.beginPath();
    g.ellipse(0.23, 0.78, 0.12, 0.15, 0, 0, Math.PI * 2);
    g.ellipse(0.78, 0.78, 0.12, 0.15, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = eventId === 'BAC_VE_CHAI' ? BIN_COLORS.recycle : UI.danger;
    g.beginPath();
    g.roundRect(0.08, 0.47, 0.84, 0.24, 0.06);
    g.fill(); g.stroke();
    if (eventId === 'BAC_VE_CHAI') {
      g.fillStyle = mix(BIN_COLORS.recycle, UI.textOnDark, 0.25);
      g.fillRect(0.1, 0.12, 0.5, 0.37);
      g.fillStyle = UI.textOnDark;
      g.fillRect(0.68, 0.28, 0.16, 0.19);
    } else {
      g.fillStyle = UI.warning;
      g.beginPath(); g.ellipse(0.45, 0.16, 0.095, 0.12, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = UI.textOnDark;
      g.lineWidth = 0.07;
      g.beginPath();
      g.moveTo(0.44, 0.32); g.lineTo(0.39, 0.5); g.lineTo(0.58, 0.64);
      g.moveTo(0.44, 0.34); g.lineTo(0.68, 0.45); g.lineTo(0.72, 0.32);
      g.stroke();
    }
  }
  g.restore();
}

function drawCollector(g: CanvasRenderingContext2D, b: Rect, font: number): void {
  g.fillStyle = UI.warning;
  g.strokeStyle = UI.letterbox;
  g.lineWidth = 3;
  g.beginPath(); g.roundRect(b.x, b.y, b.width, b.height, font * 0.35); g.fill(); g.stroke();
  const cx = b.x + b.width / 2;
  const lockWidth = b.width * 0.24;
  const lockY = b.y + b.height * 0.3;
  g.lineWidth = Math.max(3, lockWidth * 0.12);
  g.beginPath();
  g.arc(cx, lockY, lockWidth * 0.34, Math.PI, 0);
  g.stroke();
  g.fillStyle = UI.letterbox;
  g.beginPath(); g.roundRect(cx - lockWidth / 2, lockY, lockWidth, lockWidth * 0.6, lockWidth * 0.12); g.fill();
  g.font = `700 ${font}px ${FONT}`;
  g.textAlign = 'center';
  const lines = wrap(g, HAZARD_TEXT.collector, b.width * 0.92);
  lines.forEach((line, index) => g.fillText(line, cx,
    b.y + b.height * 0.77 + (index - (lines.length - 1) / 2) * font * 1.15));
}

function drawLabel(g: CanvasRenderingContext2D, labels: string[], target: Rect, area: Rect, font: number): void {
  g.font = `600 ${font}px ${FONT}`;
  const lines = labels.flatMap(label => wrap(g, label, area.width - font * 2));
  const width = Math.max(...lines.map(line => g.measureText(line).width)) + font;
  const height = font * (lines.length * 1.2 + 0.3);
  const centerX = Math.min(area.x + area.width - width / 2,
    Math.max(area.x + width / 2, target.x + target.width / 2));
  const centerY = Math.min(area.y + area.height - height / 2, target.y + target.height + height / 2);
  g.fillStyle = withAlpha(UI.letterbox, 0.9);
  g.beginPath(); g.roundRect(centerX - width / 2, centerY - height / 2, width, height, font * 0.25); g.fill();
  g.fillStyle = UI.textOnDark;
  g.textAlign = 'center';
  lines.forEach((line, index) => g.fillText(line, centerX, centerY + (index - (lines.length - 1) / 2) * font * 1.2));
}

function wrap(g: CanvasRenderingContext2D, text: string, width: number): string[] {
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
