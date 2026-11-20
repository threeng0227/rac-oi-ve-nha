import { describe, expect, test } from 'vitest';
import { Viewport, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../../src/core/Viewport';

describe('Viewport', () => {
  test('hệ toạ độ ảo là 1280 × 720 — khổ ngang, đúng 16:9', () => {
    expect(VIRTUAL_WIDTH).toBe(1280);
    expect(VIRTUAL_HEIGHT).toBe(720);
    expect(VIRTUAL_WIDTH / VIRTUAL_HEIGHT).toBeCloseTo(16 / 9, 6);
  });

  test('điện thoại xoay ngang: scale bám theo chiều cao, thừa dồn sang hai cạnh trái phải', () => {
    const vp = new Viewport();
    vp.resize(844, 390, 1); // iPhone 14 nằm ngang

    expect(vp.scale).toBeCloseTo(390 / 720, 6);
    const contentWidth = VIRTUAL_WIDTH * vp.scale;
    expect(vp.offsetX).toBeCloseTo((844 - contentWidth) / 2, 6);
    expect(vp.offsetY).toBeCloseTo(0, 6);
  });

  test('màn hình 16:9 vừa khít, không còn dải đen nào', () => {
    const vp = new Viewport();
    vp.resize(1920, 1080, 1);

    expect(vp.scale).toBeCloseTo(1.5, 6);
    expect(vp.offsetX).toBeCloseTo(0, 6);
    expect(vp.offsetY).toBeCloseTo(0, 6);
  });

  test('màn hình rộng hơn 16:9 (21:9) thì letterbox dồn sang hai cạnh', () => {
    const vp = new Viewport();
    vp.resize(2560, 1080, 1);

    expect(vp.scale).toBeCloseTo(1080 / 720, 6);
    expect(vp.offsetX).toBeGreaterThan(0);
    expect(vp.offsetY).toBeCloseTo(0, 6);
  });

  test('cầm dọc thì scale bám theo chiều rộng, thừa dồn lên trên dưới', () => {
    const vp = new Viewport();
    vp.resize(390, 844, 1);

    expect(vp.scale).toBeCloseTo(390 / 1280, 6);
    const contentHeight = VIRTUAL_HEIGHT * vp.scale;
    expect(vp.offsetX).toBeCloseTo(0, 6);
    expect(vp.offsetY).toBeCloseTo((844 - contentHeight) / 2, 6);
  });

  test('chạm vào giữa màn hình trả về đúng tâm hệ ảo', () => {
    const vp = new Viewport();
    vp.resize(844, 390, 1);

    const p = vp.toVirtual(422, 195);

    expect(p.x).toBeCloseTo(VIRTUAL_WIDTH / 2, 4);
    expect(p.y).toBeCloseTo(VIRTUAL_HEIGHT / 2, 4);
  });

  test('chạm vào vùng letterbox trả về toạ độ ngoài khung ảo', () => {
    const vp = new Viewport();
    vp.resize(844, 390, 1);

    const p = vp.toVirtual(2, 195); // sát mép trái, nằm trong dải đen

    expect(p.x).toBeLessThan(0);
  });

  test('kích thước đệm canvas nhân theo devicePixelRatio', () => {
    const vp = new Viewport();
    vp.resize(844, 390, 2);

    expect(vp.canvasWidth).toBe(1688);
    expect(vp.canvasHeight).toBe(780);
  });

  test('devicePixelRatio bị chặn ở 3 để không phá hiệu năng trên máy 4x', () => {
    const vp = new Viewport();
    vp.resize(844, 390, 4);

    expect(vp.dpr).toBe(3);
    expect(vp.canvasWidth).toBe(2532);
  });

  test('kích thước đệm canvas luôn là số nguyên', () => {
    const vp = new Viewport();
    vp.resize(851.3, 393.5, 2.75);

    expect(Number.isInteger(vp.canvasWidth)).toBe(true);
    expect(Number.isInteger(vp.canvasHeight)).toBe(true);
  });

  test('toVirtual là phép nghịch đảo của toScreen', () => {
    const vp = new Viewport();
    vp.resize(915, 412, 2.625);

    const screen = vp.toScreen(640, 360);
    const back = vp.toVirtual(screen.x, screen.y);

    expect(back.x).toBeCloseTo(640, 4);
    expect(back.y).toBeCloseTo(360, 4);
  });

  test('khung ảo luôn vừa trong vùng hiển thị, không bao giờ tràn ra ngoài', () => {
    const vp = new Viewport();

    for (const [w, h] of [[844, 390], [1920, 1080], [2560, 1080], [1366, 768], [390, 844]] as const) {
      vp.resize(w, h, 1);
      expect(VIRTUAL_WIDTH * vp.scale).toBeLessThanOrEqual(w + 1e-6);
      expect(VIRTUAL_HEIGHT * vp.scale).toBeLessThanOrEqual(h + 1e-6);
    }
  });

  test('màn hình rộng 0 không làm scale thành 0 hay NaN', () => {
    const vp = new Viewport();
    vp.resize(0, 0, 1);

    expect(vp.scale).toBeGreaterThan(0);
    expect(Number.isFinite(vp.scale)).toBe(true);
  });
});
