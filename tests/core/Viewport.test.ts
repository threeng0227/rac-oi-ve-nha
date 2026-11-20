import { describe, expect, test } from 'vitest';
import {
  Viewport,
  SHORT_SIDE,
  DESIGN_WIDTH,
  MIN_LONG_SIDE,
  MAX_LONG_SIDE,
} from '../../src/core/Viewport';

describe('Viewport — khung co giãn theo máy', () => {
  test('cạnh ngắn của khung ảo luôn là 720, bất kể cầm ngang hay dọc', () => {
    const vp = new Viewport();

    for (const [w, h] of [[844, 390], [1920, 1080], [390, 844], [1080, 1920]] as const) {
      vp.resize(w, h, 1);
      expect(Math.min(vp.width, vp.height), `${w}×${h}`).toBe(SHORT_SIDE);
    }
  });

  test('cầm ngang thì chiều cao là cạnh ngắn', () => {
    const vp = new Viewport();
    vp.resize(1280, 591, 1);

    expect(vp.height).toBe(SHORT_SIDE);
    expect(vp.width).toBeGreaterThan(vp.height);
    expect(vp.isPortrait).toBe(false);
  });

  test('cầm dọc thì chiều rộng là cạnh ngắn — khung ảo xoay theo máy', () => {
    const vp = new Viewport();
    vp.resize(390, 844, 1);

    expect(vp.width).toBe(SHORT_SIDE);
    expect(vp.height).toBeGreaterThan(vp.width);
    expect(vp.isPortrait).toBe(true);
  });

  test('cầm dọc cũng full màn, không có dải đen nhìn thấy được', () => {
    const vp = new Viewport();
    vp.resize(1080, 2340, 1); // điện thoại 19.5:9 cầm dọc

    expect(Math.abs(vp.offsetX)).toBeLessThan(1);
    expect(Math.abs(vp.offsetY)).toBeLessThan(1);
  });

  test('cạnh dài cầm dọc cũng bị chặn trong cùng khoảng', () => {
    const vp = new Viewport();

    vp.resize(1080, 2340, 1);
    expect(vp.height).toBeLessThanOrEqual(MAX_LONG_SIDE);
    expect(vp.height).toBeGreaterThanOrEqual(MIN_LONG_SIDE);
  });

  test('xoay máy giữa chừng thì khung ảo đổi theo, không kẹt ở hướng cũ', () => {
    const vp = new Viewport();

    vp.resize(1280, 591, 1);
    const ngang = { w: vp.width, h: vp.height };
    vp.resize(591, 1280, 1);

    expect(vp.width).toBeLessThan(ngang.w);
    expect(vp.height).toBeGreaterThan(ngang.h);
  });

  test('màn hình 16:9 cho đúng khung tham chiếu 1280 × 720', () => {
    const vp = new Viewport();
    vp.resize(1920, 1080, 1);

    expect(vp.width).toBe(DESIGN_WIDTH);
    expect(vp.height).toBe(SHORT_SIDE);
  });

  test('màn hình rộng hơn thì khung ảo rộng ra theo — đó là cách hết dải đen', () => {
    const vp = new Viewport();
    vp.resize(1280, 591, 1); // điện thoại 20:9 nằm ngang, đã ẩn thanh địa chỉ

    expect(vp.width).toBeGreaterThan(DESIGN_WIDTH);
    expect(vp.width).toBe(Math.round(SHORT_SIDE * (1280 / 591)));
  });

  test('máy càng rộng thì không còn letterbox nhìn thấy được', () => {
    const vp = new Viewport();
    vp.resize(1280, 591, 1);

    // Không ép bằng đúng 0: chiều rộng khung ảo làm tròn về số nguyên nên còn
    // sai số dưới một pixel. Dưới 1px là mắt không thấy, đó mới là yêu cầu thật.
    expect(Math.abs(vp.offsetX)).toBeLessThan(1);
    expect(Math.abs(vp.offsetY)).toBeLessThan(1);
  });

  test('cạnh dài không ngắn hơn mức chặn — cửa sổ vuông không được bóp vùng chơi', () => {
    const vp = new Viewport();
    vp.resize(800, 800, 1);

    expect(Math.max(vp.width, vp.height)).toBe(MIN_LONG_SIDE);
  });

  test('cạnh dài không vượt mức chặn — màn siêu rộng không được kéo dãn vô hạn', () => {
    const vp = new Viewport();
    vp.resize(5120, 1440, 1); // 32:9

    expect(vp.width).toBe(MAX_LONG_SIDE);
  });

  test('cửa sổ vuông thì có letterbox — tỉ lệ đó nằm ngoài khoảng hỗ trợ', () => {
    const vp = new Viewport();
    vp.resize(800, 800, 1);

    expect(vp.offsetX + vp.offsetY).toBeGreaterThan(0);
  });

  test('rộng quá mức chặn thì letterbox quay lại hai bên', () => {
    const vp = new Viewport();
    vp.resize(5120, 1440, 1);

    expect(vp.offsetX).toBeGreaterThan(0);
    expect(vp.offsetY).toBeCloseTo(0, 6);
  });

  test('centerX luôn là tâm khung ảo hiện tại, không phải tâm khung tham chiếu', () => {
    const vp = new Viewport();
    vp.resize(1280, 591, 1);

    expect(vp.centerX).toBeCloseTo(vp.width / 2, 6);
    expect(vp.centerX).not.toBeCloseTo(DESIGN_WIDTH / 2, 0);
  });

  test('chạm vào giữa màn hình trả về đúng tâm khung ảo', () => {
    const vp = new Viewport();
    vp.resize(1280, 591, 1);

    const p = vp.toVirtual(640, 295.5);

    expect(p.x).toBeCloseTo(vp.centerX, 3);
    expect(p.y).toBeCloseTo(vp.height / 2, 3);
  });

  test('chạm sát bốn góc rơi đúng bốn góc khung ảo', () => {
    const vp = new Viewport();
    vp.resize(1280, 591, 1);

    // Sai số dưới nửa đơn vị ảo là do làm tròn chiều rộng khung — mắt không thấy.
    expect(vp.toVirtual(0, 0).x).toBeCloseTo(0, 0);
    expect(vp.toVirtual(0, 0).y).toBeCloseTo(0, 0);
    expect(vp.toVirtual(1280, 591).x).toBeCloseTo(vp.width, 0);
    expect(vp.toVirtual(1280, 591).y).toBeCloseTo(vp.height, 0);
  });

  test('khung ảo luôn vừa trong vùng hiển thị, không bao giờ tràn ra ngoài', () => {
    const vp = new Viewport();

    for (const [w, h] of [[1280, 591], [844, 390], [1920, 1080], [5120, 1440], [800, 800], [390, 844]] as const) {
      vp.resize(w, h, 1);
      expect(vp.width * vp.scale, `${w}×${h}`).toBeLessThanOrEqual(w + 1e-6);
      expect(vp.height * vp.scale, `${w}×${h}`).toBeLessThanOrEqual(h + 1e-6);
    }
  });

  test('toVirtual là phép nghịch đảo của toScreen', () => {
    const vp = new Viewport();
    vp.resize(915, 412, 2.625);

    const screen = vp.toScreen(vp.centerX, 360);
    const back = vp.toVirtual(screen.x, screen.y);

    expect(back.x).toBeCloseTo(vp.centerX, 4);
    expect(back.y).toBeCloseTo(360, 4);
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

  test('màn hình rộng 0 không làm scale thành 0 hay NaN', () => {
    const vp = new Viewport();
    vp.resize(0, 0, 1);

    expect(vp.scale).toBeGreaterThan(0);
    expect(Number.isFinite(vp.scale)).toBe(true);
    expect(Number.isFinite(vp.width)).toBe(true);
  });
});
