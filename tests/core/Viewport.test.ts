import { describe, expect, test } from 'vitest';
import { Viewport, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../../src/core/Viewport';

describe('Viewport', () => {
  test('hệ toạ độ ảo là 720 × 1280', () => {
    expect(VIRTUAL_WIDTH).toBe(720);
    expect(VIRTUAL_HEIGHT).toBe(1280);
  });

  test('trên màn hình cao hơn tỉ lệ ảo, scale bám theo chiều rộng', () => {
    const vp = new Viewport();
    vp.resize(390, 844, 1); // iPhone 14, dọc

    expect(vp.scale).toBeCloseTo(390 / 720, 6);
  });

  test('phần thừa chia đều hai bên — letterbox căn giữa', () => {
    const vp = new Viewport();
    vp.resize(390, 844, 1);

    const contentHeight = VIRTUAL_HEIGHT * vp.scale;
    expect(vp.offsetX).toBeCloseTo(0, 6);
    expect(vp.offsetY).toBeCloseTo((844 - contentHeight) / 2, 6);
  });

  test('xoay ngang thì scale bám theo chiều cao, thừa dồn sang hai cạnh trái phải', () => {
    const vp = new Viewport();
    vp.resize(844, 390, 1);

    expect(vp.scale).toBeCloseTo(390 / 1280, 6);
    const contentWidth = VIRTUAL_WIDTH * vp.scale;
    expect(vp.offsetX).toBeCloseTo((844 - contentWidth) / 2, 6);
    expect(vp.offsetY).toBeCloseTo(0, 6);
  });

  test('chạm vào giữa màn hình trả về đúng tâm hệ ảo', () => {
    const vp = new Viewport();
    vp.resize(390, 844, 1);

    const p = vp.toVirtual(195, 422);

    expect(p.x).toBeCloseTo(VIRTUAL_WIDTH / 2, 4);
    expect(p.y).toBeCloseTo(VIRTUAL_HEIGHT / 2, 4);
  });

  test('chạm vào vùng letterbox trả về toạ độ ngoài khung ảo', () => {
    const vp = new Viewport();
    vp.resize(390, 844, 1);

    const p = vp.toVirtual(195, 2); // sát mép trên, nằm trong dải đen

    expect(p.y).toBeLessThan(0);
  });

  test('kích thước đệm canvas nhân theo devicePixelRatio', () => {
    const vp = new Viewport();
    vp.resize(390, 844, 2);

    expect(vp.canvasWidth).toBe(780);
    expect(vp.canvasHeight).toBe(1688);
  });

  test('devicePixelRatio bị chặn ở 3 để không phá hiệu năng trên máy 4x', () => {
    const vp = new Viewport();
    vp.resize(390, 844, 4);

    expect(vp.dpr).toBe(3);
    expect(vp.canvasWidth).toBe(1170);
  });

  test('kích thước đệm canvas luôn là số nguyên', () => {
    const vp = new Viewport();
    vp.resize(393.5, 851.3, 2.75);

    expect(Number.isInteger(vp.canvasWidth)).toBe(true);
    expect(Number.isInteger(vp.canvasHeight)).toBe(true);
  });

  test('toVirtual là phép nghịch đảo của toScreen', () => {
    const vp = new Viewport();
    vp.resize(412, 915, 2.625);

    const screen = vp.toScreen(360, 640);
    const back = vp.toVirtual(screen.x, screen.y);

    expect(back.x).toBeCloseTo(360, 4);
    expect(back.y).toBeCloseTo(640, 4);
  });

  test('màn hình rộng 0 không làm scale thành 0 hay NaN', () => {
    const vp = new Viewport();
    vp.resize(0, 0, 1);

    expect(vp.scale).toBeGreaterThan(0);
    expect(Number.isFinite(vp.scale)).toBe(true);
  });
});
