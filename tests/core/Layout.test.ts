import { describe, expect, test } from 'vitest';
import { computeLayout, BAG_SLOTS } from '../../src/core/Layout';
import { Viewport } from '../../src/core/Viewport';

function viewportOf(w: number, h: number): Viewport {
  const vp = new Viewport();
  vp.resize(w, h, 2);
  return vp;
}

/** Các kích thước thật đáng quan tâm. */
const SCREENS = [
  { name: 'điện thoại ngang', w: 1280, h: 591 },
  { name: 'điện thoại dọc', w: 1080, h: 2340 },
  { name: 'iPhone ngang', w: 844, h: 390 },
  { name: 'iPhone dọc', w: 390, h: 844 },
  { name: 'desktop 16:9', w: 1920, h: 1080 },
  { name: 'máy tính bảng dọc', w: 820, h: 1180 },
] as const;

describe('computeLayout', () => {
  test('bốn dải xếp liền nhau, không chồng lấn, không hở', () => {
    for (const screen of SCREENS) {
      const l = computeLayout(viewportOf(screen.w, screen.h));

      expect(l.hud.y, screen.name).toBe(0);
      expect(l.playfield.y, screen.name).toBe(l.hud.y + l.hud.height);
      expect(l.bag.y, screen.name).toBe(l.playfield.y + l.playfield.height);
      expect(l.bins.y, screen.name).toBe(l.bag.y + l.bag.height);
      expect(l.bins.y + l.bins.height, screen.name).toBeCloseTo(l.height, 6);
    }
  });

  test('ba thùng trải đúng hết chiều ngang, không thừa không thiếu', () => {
    for (const screen of SCREENS) {
      const l = computeLayout(viewportOf(screen.w, screen.h));

      expect(l.binX(0), screen.name).toBe(0);
      expect(l.binX(2) + l.binWidth, screen.name).toBeCloseTo(l.width, 6);
      expect(l.binWidth * 3, screen.name).toBeCloseTo(l.width, 6);
    }
  });

  test('thùng xếp đúng thứ tự trái sang phải', () => {
    const l = computeLayout(viewportOf(1280, 591));

    expect(l.binX(0)).toBeLessThan(l.binX(1));
    expect(l.binX(1)).toBeLessThan(l.binX(2));
  });

  test('sáu ô túi nằm gọn trong khung, căn giữa', () => {
    for (const screen of SCREENS) {
      const l = computeLayout(viewportOf(screen.w, screen.h));

      const first = l.bagSlotX(0);
      const last = l.bagSlotX(BAG_SLOTS - 1) + l.bagSlotSize;

      expect(first, `${screen.name} — ô đầu`).toBeGreaterThanOrEqual(0);
      expect(last, `${screen.name} — ô cuối`).toBeLessThanOrEqual(l.width);
      // Căn giữa: lề trái và lề phải bằng nhau.
      expect(first, `${screen.name} — căn giữa`).toBeCloseTo(l.width - last, 4);
    }
  });

  test('khu cảnh luôn còn chỗ chơi, không bị các dải khác ăn hết', () => {
    for (const screen of SCREENS) {
      const l = computeLayout(viewportOf(screen.w, screen.h));

      expect(l.playfield.height, screen.name).toBeGreaterThan(300);
    }
  });

  test('cầm dọc thì khu cảnh cao hơn hẳn cầm ngang', () => {
    const ngang = computeLayout(viewportOf(1280, 591));
    const doc = computeLayout(viewportOf(591, 1280));

    expect(doc.playfield.height).toBeGreaterThan(ngang.playfield.height);
  });

  test('cầm dọc thì thùng rác cao hơn — ngón cái với tới cạnh dưới dễ hơn', () => {
    const ngang = computeLayout(viewportOf(1280, 591));
    const doc = computeLayout(viewportOf(591, 1280));

    expect(doc.bins.height).toBeGreaterThan(ngang.bins.height);
  });

  test('vùng sinh rác nằm gọn trong khu cảnh', () => {
    for (const screen of SCREENS) {
      const l = computeLayout(viewportOf(screen.w, screen.h));

      expect(l.spawnArea.x, screen.name).toBeGreaterThanOrEqual(0);
      expect(l.spawnArea.y, screen.name).toBeGreaterThanOrEqual(l.playfield.y);
      expect(l.spawnArea.x + l.spawnArea.width, screen.name).toBeLessThanOrEqual(l.width);
      expect(l.spawnArea.y + l.spawnArea.height, screen.name).toBeLessThanOrEqual(
        l.playfield.y + l.playfield.height,
      );
    }
  });

  test('diện tích khu cảnh được báo ra để cân bằng mật độ rác theo diện tích', () => {
    const ngang = computeLayout(viewportOf(1280, 591));
    const doc = computeLayout(viewportOf(591, 1280));

    expect(ngang.playfieldArea).toBeCloseTo(ngang.spawnArea.width * ngang.spawnArea.height, 4);
    // Hai hướng có diện tích khác nhau — đó chính là lý do phải chia theo diện tích.
    expect(doc.playfieldArea).not.toBeCloseTo(ngang.playfieldArea, 0);
  });

  test('vùng chạm của thùng cao ít nhất 130 đơn vị ảo ở mọi máy', () => {
    for (const screen of SCREENS) {
      const l = computeLayout(viewportOf(screen.w, screen.h));
      expect(l.bins.height, screen.name).toBeGreaterThanOrEqual(130);
    }
  });

  test('layout bám đúng khung ảo của viewport truyền vào', () => {
    const vp = viewportOf(1280, 591);
    const l = computeLayout(vp);

    expect(l.width).toBe(vp.width);
    expect(l.height).toBe(vp.height);
    expect(l.centerX).toBe(vp.centerX);
    expect(l.isPortrait).toBe(vp.isPortrait);
  });
});
