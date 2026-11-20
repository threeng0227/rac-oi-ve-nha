import { describe, expect, test } from 'vitest';
import {
  Viewport,
  VIRTUAL_HEIGHT,
  DESIGN_WIDTH,
  MIN_VIRTUAL_WIDTH,
  MAX_VIRTUAL_WIDTH,
} from '../../src/core/Viewport';

describe('Viewport — khung co giãn theo máy', () => {
  test('chiều cao hệ ảo luôn cố định 720', () => {
    const vp = new Viewport();

    for (const [w, h] of [[844, 390], [1920, 1080], [2560, 1080], [390, 844]] as const) {
      vp.resize(w, h, 1);
      expect(vp.height).toBe(VIRTUAL_HEIGHT);
    }
  });

  test('màn hình 16:9 cho đúng khung tham chiếu 1280', () => {
    const vp = new Viewport();
    vp.resize(1920, 1080, 1);

    expect(vp.width).toBe(DESIGN_WIDTH);
  });

  test('màn hình rộng hơn thì khung ảo rộng ra theo — đó là cách hết dải đen', () => {
    const vp = new Viewport();
    vp.resize(1280, 591, 1); // điện thoại 20:9 nằm ngang, đã ẩn thanh địa chỉ

    expect(vp.width).toBeGreaterThan(DESIGN_WIDTH);
    expect(vp.width).toBe(Math.round(VIRTUAL_HEIGHT * (1280 / 591)));
  });

  test('máy càng rộng thì không còn letterbox nhìn thấy được', () => {
    const vp = new Viewport();
    vp.resize(1280, 591, 1);

    // Không ép bằng đúng 0: chiều rộng khung ảo làm tròn về số nguyên nên còn
    // sai số dưới một pixel. Dưới 1px là mắt không thấy, đó mới là yêu cầu thật.
    expect(Math.abs(vp.offsetX)).toBeLessThan(1);
    expect(Math.abs(vp.offsetY)).toBeLessThan(1);
  });

  test('khung ảo không hẹp hơn 1280 — cửa sổ dẹt không được bóp vùng chơi', () => {
    const vp = new Viewport();
    vp.resize(800, 800, 1); // vuông, hẹp hơn 16:9

    expect(vp.width).toBe(MIN_VIRTUAL_WIDTH);
  });

  test('khung ảo không rộng quá 1800 — màn siêu rộng không được kéo dãn vô hạn', () => {
    const vp = new Viewport();
    vp.resize(5120, 1440, 1); // 32:9

    expect(vp.width).toBe(MAX_VIRTUAL_WIDTH);
  });

  test('hẹp hơn 16:9 thì letterbox dồn lên trên dưới', () => {
    const vp = new Viewport();
    vp.resize(800, 800, 1);

    expect(vp.offsetX).toBeCloseTo(0, 6);
    expect(vp.offsetY).toBeGreaterThan(0);
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
    expect(p.y).toBeCloseTo(VIRTUAL_HEIGHT / 2, 3);
  });

  test('chạm sát bốn góc rơi đúng bốn góc khung ảo', () => {
    const vp = new Viewport();
    vp.resize(1280, 591, 1);

    // Sai số dưới nửa đơn vị ảo là do làm tròn chiều rộng khung — mắt không thấy.
    expect(vp.toVirtual(0, 0).x).toBeCloseTo(0, 0);
    expect(vp.toVirtual(0, 0).y).toBeCloseTo(0, 0);
    expect(vp.toVirtual(1280, 591).x).toBeCloseTo(vp.width, 0);
    expect(vp.toVirtual(1280, 591).y).toBeCloseTo(VIRTUAL_HEIGHT, 0);
  });

  test('khung ảo luôn vừa trong vùng hiển thị, không bao giờ tràn ra ngoài', () => {
    const vp = new Viewport();

    for (const [w, h] of [[1280, 591], [844, 390], [1920, 1080], [5120, 1440], [800, 800], [390, 844]] as const) {
      vp.resize(w, h, 1);
      expect(vp.width * vp.scale, `${w}×${h}`).toBeLessThanOrEqual(w + 1e-6);
      expect(VIRTUAL_HEIGHT * vp.scale, `${w}×${h}`).toBeLessThanOrEqual(h + 1e-6);
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
